"""
design_adapter/stubs.py — deterministic OFFLINE stand-ins for the LLM/retrieval steps (the gate-proof).

No network, no API: a fixed "TestApp Today screen" scenario that exercises every load-bearing path —
a supported finding (accessibility, GOOD source), an abstaining lens (performance, unsupported BAD
source), an over-association leap the surfacer externalizes (conversion_ux; the gate catches it
structurally), and a supported refutation (contests accessibility). The live retrieval + role impls
replace these one-for-one behind the same Protocol shapes.
"""
from __future__ import annotations

from storm_engine.contracts import Claim, Source, SourceRef

GOOD = "local://good-principle"
BAD = "local://bad-source"  # StubVerify marks any url containing 'bad' unsupported


def _src(url: str, channel: str) -> Source:
    return Source(url=url, title="src", text="...", as_of="2026-07-01",
                  channel=channel, trust=0.9, content_hash="h:" + url)


def _cit(claim: str, url: str, channel: str, *, kind="fact", relation=None, supports="fact") -> dict:
    return {"claim": claim, "url": url, "title": "src", "kind": kind,
            "relation": relation, "supports": supports, "channel": channel}


class StubRetrieval:
    def search(self, query, *, k, perspective_id):
        return [SourceRef(url=GOOD, channel="standard"), SourceRef(url=GOOD + "-2", channel="kb")]

    def fetch(self, ref):
        return _src(ref.url, ref.channel or "kb")

    def trust(self, src):
        return src.trust


class StubInterrogator:
    def ask(self, perspective, context):
        i = len(context)
        if i < len(perspective.seed_questions):
            return perspective.seed_questions[i]
        return None  # saturation -> stop early


class StubExpert:
    """Deterministic claims keyed off perspective.id (the gate-proof scenario)."""

    def answer(self, perspective, question, sources):
        # Key on the LENS KEY, not perspective.id: the engine derives the perspective id from the
        # anchor FAMILY slug (e.g. "Conversion & UX --" -> "conversion___ux"), which is NOT the lens key.
        # The refuter is keyed by kind (its anchor_keys are expanded to contest every lens).
        if perspective.kind == "refuter":
            claims = [
                Claim(kind="evaluative",
                      text="TestApp fails WCAG AA contrast - a blocking accessibility defect for its users.",
                      citations=(_cit("fails AA contrast", GOOD, "standard"),),
                      perspective_id=perspective.id, anchor_keys=("accessibility",), stance="disconfirming",
                      rubric_anchor="wcag"),
            ]
            return ("The strongest case against TestApp is a blocking contrast failure.", claims)
        pid = perspective.anchor_keys[0] if perspective.anchor_keys else ""
        if pid == "accessibility":
            claims = [
                Claim(kind="evaluative",
                      text="TestApp body text is 3.9:1 on the surface (below WCAG 2.2 AA 4.5:1).",
                      citations=(_cit("body text 3.9:1 fails AA 4.5:1", GOOD, "standard"),),
                      perspective_id=pid, anchor_keys=("accessibility",), stance="constructive",
                      rubric_anchor="wcag"),
            ]
            return ("TestApp body text contrast is 3.9:1 against the surface, below the AA floor.", claims)
        if pid == "performance":
            claims = [
                Claim(kind="fact", text="TestApp ships a 2.4 MB unoptimized hero image.",
                      citations=(_cit("2.4 MB hero image", BAD, "kb"),),  # unsupported -> performance abstains
                      perspective_id=pid, anchor_keys=("performance",), stance="constructive"),
            ]
            return ("TestApp ships a large hero image.", claims)
        if pid == "conversion_ux":
            claims = [
                Claim(kind="fact", text="The primary CTA sits below the fold on mobile.",
                      citations=(_cit("CTA below the fold", GOOD, "kb"),),
                      perspective_id=pid, anchor_keys=("conversion_ux",), stance="constructive"),
                Claim(kind="fact", text="The signup form has nine required fields.",
                      citations=(_cit("nine required fields", GOOD, "kb"),),
                      perspective_id=pid, anchor_keys=("conversion_ux",), stance="constructive"),
            ]
            # the ANSWER PROSE hides an over-association the surfacer must externalize as a relational claim:
            body = ("The primary CTA sits below the fold on mobile. The signup form has nine required "
                    "fields, therefore the design has fundamentally poor conversion.")
            return (body, claims)
        return ("", [])


class StubSurfacer:
    """Detects causal leaps and surfaces them as relational claims carrying ONLY antecedent citations
    (no `supports:'link'`) — exactly the over-association the gate must catch structurally (P2-1)."""

    def detect(self, body):
        out = []
        for sentence in body.replace(";", ".").split("."):
            s = sentence.strip()
            if any(m in (" " + s.lower() + " ") for m in (" therefore ", " because ", " thus ", " so ")):
                out.append(s)
        return out

    def surface(self, body, fact_claims, *, perspective_id):
        antecedent_cits = tuple({**c, "supports": "antecedent"}
                                for fc in fact_claims for c in fc.citations)
        rels = []
        for sentence in self.detect(body):
            rels.append(Claim(kind="relational", text=sentence, relation="therefore",
                              citations=antecedent_cits,  # NO supports='link' -> structurally unsupported
                              perspective_id=perspective_id,
                              anchor_keys=tuple(dict.fromkeys(k for fc in fact_claims for k in fc.anchor_keys)),
                              stance="constructive", antecedent_ids=tuple(fc.id for fc in fact_claims)))
        return rels


class StubVerify:
    """Offline entailment judge: any url containing 'bad' is unsupported, else supported."""

    def verify(self, claim: str, url: str) -> dict:
        v = "unsupported" if "bad" in (url or "") else "supported"
        return {"verdict": v, "note": "stub"}
