"""
design_adapter/roles.py — the three injected LLM roles for the design STORM adapter.

Drop-in replacements for the engine's Interrogator / Expert / InferenceSurfacer Protocols, so the
conversation loop + writer + gate are unchanged. Design-framed:
  - DesignInterrogator: the perspective's persona asks seed questions, then ONE grounded follow-up;
    None on saturation.
  - DesignExpert: turns the trusted SOURCES (design principles / references / standards) into a cited
    answer + typed fact/evaluative RECOMMENDATIONS for the subject-under-review, constrained to the
    perspective's lens keys. The subject description rides along as free background (not citable).
  - DesignInferenceSurfacer: forces load-bearing "X => Y" leaps out of prose into relational claims that
    carry ONLY antecedent citations unless a source DIRECTLY supports the link (supports:"link") — so
    over-association is structurally unsupported by default, the judge a backstop.

Grounding contract (the entailment axis): a design claim must be grounded in a cited principle / reference
/ standard (or a directly-observable attribute of the subject). "Looks off" with no cited basis does not
ship — silence != absence.
"""
from __future__ import annotations

from storm_engine.contracts import Claim

_GROUNDING = ("GROUNDING RULE: every design claim must rest on a CITED principle/reference/standard from "
              "the SOURCES, or a directly-observable attribute of the subject stated in the brief. Do not "
              "assert a recommendation, threshold, or judgment without a cited basis. Critique the "
              "DESIGN and its DECISIONS, never a named person. If the sources don't support a point, omit it.")

_EXPERT_SCHEMA = {
    "type": "object", "additionalProperties": False,
    "properties": {
        "answer": {"type": "string"},
        "claims": {"type": "array", "items": {
            "type": "object", "additionalProperties": False,
            "properties": {
                "kind": {"type": "string", "enum": ["fact", "evaluative"]},
                "text": {"type": "string"},
                "evidence_urls": {"type": "array", "items": {"type": "string"}},
                "anchor_keys": {"type": "array", "items": {"type": "string"}},
                "rubric_anchor": {"type": "string"},
            },
            "required": ["kind", "text", "evidence_urls", "anchor_keys", "rubric_anchor"],
        }},
    },
    "required": ["answer", "claims"],
}

_SURFACE_SCHEMA = {
    "type": "object", "additionalProperties": False,
    "properties": {
        "inferences": {"type": "array", "items": {
            "type": "object", "additionalProperties": False,
            "properties": {
                "text": {"type": "string"},
                "relation": {"type": "string"},
                "link_supported": {"type": "boolean"},
                "link_url": {"type": "string"},
            },
            "required": ["text", "relation", "link_supported", "link_url"],
        }},
    },
    "required": ["inferences"],
}


class DesignInterrogator:
    """Persona-conditioned asker: seed questions, then one grounded follow-up; None on saturation."""

    def __init__(self, llm, *, max_followups: int = 1):
        self.llm = llm
        self.max_followups = max_followups

    def ask(self, perspective, context):
        i = len(context)
        seeds = perspective.seed_questions or ()
        if i < len(seeds):
            return seeds[i]
        if i - len(seeds) >= self.max_followups:
            return None  # budget: at most `max_followups` LLM follow-ups per perspective
        last = context[-1] if context else None
        if last is None:
            return None
        system = (f"You are a {perspective.persona}. Ask ONE incisive follow-up question the prior answer "
                  f"left open that a design principle, reference, or standard could answer. If the topic is "
                  f"saturated, reply with exactly STOP. {_GROUNDING}")
        user = f"Prior question: {last.question}\nPrior answer: {last.answer}\n\nYour single follow-up:"
        q = self.llm.text(system, user, max_tokens=120).strip()
        if not q or q.upper().startswith("STOP"):
            return None
        return q


class DesignExpert:
    """Grounded answerer: cites ONLY the trusted sources; emits typed fact/evaluative recommendations.

    `subject` = the design under review ({"name","description"} — the job-to-be-done, register, and what
    the current UI contains). `context` = free background signal (e.g. a rendered-baseline description),
    informing the answer but NOT citable.
    """

    def __init__(self, llm, subject: dict, *, context: str = ""):
        self.llm = llm
        self.subject = subject or {}
        self.context = context

    def answer(self, perspective, question, sources):
        name = self.subject.get("name") or "the design"
        allowed = list(perspective.anchor_keys or ())
        chan = {s.url: s.channel for s in sources}
        if not sources:
            return ("", [])  # silence != absence: no trusted source -> no claim
        srcblock = "\n\n".join(
            f"[SOURCE {i+1}] url={s.url} channel={s.channel}\n{s.text[:2500]}"
            for i, s in enumerate(sources))
        desc = self.subject.get("description", "")
        subject_block = f"SUBJECT UNDER REVIEW: {name}\n{desc}".strip()
        bg = f"\n\nBACKGROUND (context only, NOT citable):\n{self.context}" if self.context else ""
        system = (
            f"You are a {perspective.persona} reviewing {name}. Answer the question using ONLY the SOURCES "
            f"provided (design principles / references / standards). Produce atomic RECOMMENDATIONS or "
            f"findings for the subject, each cited to the SOURCE url(s) you actually used. kind='fact' for "
            f"a single verifiable attribute or a cited principle/threshold; kind='evaluative' for a "
            f"judgment ('fails AA', 'weak hierarchy', 'high friction') — an evaluative claim must cite "
            f"evidence for the FULL judgment. Do NOT assert relationships or 'therefore' inferences as "
            f"claims (a separate pass handles those). anchor_keys MUST be chosen from {allowed or ['(none)']}. "
            f"{_GROUNDING}")
        user = (f"{subject_block}\n\nPerspective rubric: {perspective.rubric or '(none)'}\n"
                f"Question: {question}{bg}\n\nSOURCES:\n{srcblock}\n\n"
                f"Return the answer and the typed, cited claims.")
        out = self.llm.structured(system, user, _EXPERT_SCHEMA, max_tokens=1600)
        answer = (out.get("answer") or "").strip()
        claims = []
        for rc in out.get("claims") or []:
            kind = rc.get("kind") if rc.get("kind") in ("fact", "evaluative") else "fact"
            text = (rc.get("text") or "").strip()
            urls = [u for u in (rc.get("evidence_urls") or []) if u in chan]
            if not text or not urls:
                continue  # an uncited claim never ships
            keys = tuple(k for k in (rc.get("anchor_keys") or []) if k in allowed) or tuple(allowed)
            cits = tuple({"claim": text, "url": u, "title": chan[u], "kind": kind,
                          "relation": None, "supports": "fact", "channel": chan[u]} for u in urls)
            claims.append(Claim(kind=kind, text=text, citations=cits, perspective_id=perspective.id,
                                anchor_keys=keys, stance=perspective.stance,
                                rubric_anchor=(rc.get("rubric_anchor") or None) if kind == "evaluative" else None))
        return (answer, claims)


class DesignInferenceSurfacer:
    """Forces load-bearing leaps out of prose into relational claims (the over-association catch)."""

    def __init__(self, llm):
        self.llm = llm

    def _externalize(self, body, fact_claims, perspective_id):
        ante = tuple({**c, "supports": "antecedent"} for fc in fact_claims for c in fc.citations)
        valid_urls = {c.get("url") for c in ante}
        out = self.llm.structured(
            ("Identify every load-bearing inference in the passage — any place it claims one fact IMPLIES, "
             "ENABLES, or CAUSES another (a 'therefore', 'because', 'so', 'leading to', or a causal design "
             "judgment like 'small font THEREFORE fails accessibility'). For each, return the FULL inferred "
             "sentence. Set link_supported=true and link_url to a provided fact-source url ONLY if that "
             "source DIRECTLY supports the inferred relationship (not merely the component facts); otherwise "
             "link_supported=false."),
            f"Passage:\n{body}\n\nFact-source urls available: {sorted(valid_urls)}",
            _SURFACE_SCHEMA, max_tokens=700)
        # Inherit the source perspective's stance from its fact-claims (all share it), so a REFUTER's
        # causal bear-case leap stays 'disconfirming' and CONTESTS the lens (not mis-routed constructive).
        # NOTE: the InferenceSurfacer Protocol only passes perspective_id, not stance — raised to the
        # upstream engine owner (STORM-INTEGRATION-BACKLOG §5b); we derive it from fact_claims here.
        stance = fact_claims[0].stance if fact_claims else "constructive"
        rels = []
        for inf in out.get("inferences") or []:
            text = (inf.get("text") or "").strip()
            if not text:
                continue
            cits = list(ante)
            if inf.get("link_supported") and inf.get("link_url") in valid_urls:
                link_channel = next((c.get("channel") for c in ante if c.get("url") == inf["link_url"]), None)
                cits = cits + [{"claim": text, "url": inf["link_url"], "title": "link",
                                "kind": "relational", "relation": inf.get("relation"),
                                "supports": "link", "channel": link_channel}]
            keys = tuple(dict.fromkeys(k for fc in fact_claims for k in fc.anchor_keys)) or ()
            rels.append(Claim(kind="relational", text=text, relation=inf.get("relation") or "implies",
                              citations=tuple(cits), perspective_id=perspective_id, anchor_keys=keys,
                              stance=stance, antecedent_ids=tuple(fc.id for fc in fact_claims)))
        return rels

    def surface(self, body, fact_claims, *, perspective_id):
        if not body or not fact_claims:
            return []
        return self._externalize(body, fact_claims, perspective_id)

    def detect(self, body):
        """Independent re-detection for the anti-evasion guard (engine.writer)."""
        if not body:
            return []
        out = self.llm.structured(
            ("List every sentence in the passage that asserts one fact implies/enables/causes another "
             "(a relationship or causal design judgment, not a bare fact)."),
            f"Passage:\n{body}", _SURFACE_SCHEMA, max_tokens=500)
        return [(i.get("text") or "").strip() for i in (out.get("inferences") or []) if i.get("text")]
