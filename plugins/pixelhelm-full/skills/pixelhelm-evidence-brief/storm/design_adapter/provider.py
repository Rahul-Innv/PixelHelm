"""
design_adapter/provider.py — StormDesignProvider: ties Part 1 + Part 2 into a verified DESIGN BRIEF.

`research()` returns the rich Dossier; `brief()` down-projects it to the shipped design brief — sections
per design dimension, each a set of cited, gated recommendations with confidence + honest abstains, plus
the refuter's contestations. K runs feed the gate's self-consistency tier. strict_drop is FALSE by
default (flag-only: the judge's precision gate was never cleared on the paid API, so nothing is silently
deleted — the spec's explicit instruction).

NOTE (coordination): this orchestrator's control flow mirrors the upstream reference `provider.py`,
which imports ONLY from the engine (no upstream-project code) — i.e. it is effectively engine-generic. Flag to
the upstream engine project as a candidate to PROMOTE into the engine, so the two adapters share one
orchestrator instead of each carrying a near-identical copy. Until then this is design-owned adapter code.

STORM outputs a verified brief, NOT UI. The design skill consumes `brief()` to generate pixels as a
separate step.
"""
from __future__ import annotations

from storm_engine.contracts import Dossier
from storm_engine.conversation import run_conversation
from storm_engine.gate import assemble_sections, score_claims
from storm_engine.perspective import design_perspectives
from storm_engine.writer import assert_no_unsurfaced_inference


class StormDesignProvider:
    def __init__(self, framework, retrieval, interrogator, expert, surfacer, gate, *,
                 k_runs: int = 2, max_turns: int = 3, strict_drop: bool = False):
        self.framework = framework
        self.retrieval = retrieval
        self.interrogator = interrogator
        self.expert = expert
        self.surfacer = surfacer
        self.gate = gate
        self.k_runs = k_runs
        self.max_turns = max_turns
        self.strict_drop = strict_drop  # FALSE by default: strict-drop is EARNED, never assumed (spec §5)

    def _run_once(self, perspectives):
        claims, log, evasions = [], [], []
        for p in perspectives:
            turns = run_conversation(p, self.retrieval, self.interrogator, self.expert,
                                     max_turns=self.max_turns)
            log.extend(turns)
            for t in turns:
                claims.extend(t.claims)
                rels = self.surfacer.surface(t.answer, list(t.claims), perspective_id=p.id)
                claims.extend(rels)
                # anti-evasion guard: a leap left in prose but NOT surfaced as a claim is flagged
                missing = assert_no_unsurfaced_inference(t.answer, rels, self.surfacer)
                for m in missing:
                    evasions.append({"perspective": p.id, "inference": m})
        return claims, log, evasions

    def research(self, subject_ctx) -> Dossier:
        ps = design_perspectives(self.framework)
        runs, log, evasions = [], [], []
        for _ in range(self.k_runs):
            claims, run_log, run_evasions = self._run_once(ps.perspectives)
            runs.append(claims)
            log.extend(run_log)            # accumulate across ALL K runs (don't keep only the last)
            evasions.extend(run_evasions)
        scored = score_claims(runs, self.gate)
        # plumb the gate's min_support into the section-level supported-fraction gate (they were unrelated)
        sections = assemble_sections(scored, strict_drop=self.strict_drop, min_support=self.gate.min_support)
        doss = Dossier(entity_id=subject_ctx.get("name") or subject_ctx.get("subject_id") or "design",
                       sections=sections, conversation_log=log, unused_sources=[])
        doss.evasions = evasions  # attach the anti-evasion findings (a leap surfaced in prose but not claimed)
        return doss

    def brief(self, subject_ctx) -> dict:
        """The verified DESIGN BRIEF: per-dimension cited recommendations + confidence + honest abstains."""
        doss = self.research(subject_ctx)
        sections = []
        abstained = []
        for s in doss.sections:
            # the refuter's supported bear-case findings for this lens (surfaced as risks, not just a bool)
            risks = [{"text": c.text, "kind": c.kind, "confidence": c.confidence}
                     for c in s.claims if c.stance == "disconfirming"
                     and (c.entailment or {}).get("verdict") == "supported"]
            if s.status != "filled":
                abstained.append(s.anchor)
                sections.append({
                    "lens": s.anchor, "status": s.status, "headline": None,
                    "recommendations": [], "risks": risks, "citations": [], "confidence": None,
                    "contested": s.contested, "contesting_claims": list(s.contesting_claims),
                })
                continue
            ship = [c for c in s.claims if c.stance == "constructive"
                    and (not self.strict_drop or (c.entailment or {}).get("verdict") == "supported")]
            # recommendations carry the per-claim gate verdict + `flagged` — so flag-only actually FLAGS a
            # retained-but-unsupported claim (e.g. an over-association leap) instead of shipping it as if verified.
            recs = []
            for c in ship:
                v = (c.entailment or {}).get("verdict")
                recs.append({"text": c.text, "kind": c.kind, "verdict": v,
                             "confidence": c.confidence, "flagged": v != "supported"})
            cits = [{"claim": cc.get("claim"), "url": cc.get("url"), "title": cc.get("title")}
                    for c in ship for cc in c.citations]
            sections.append({
                "lens": s.anchor, "status": s.status, "headline": s.headline,
                "recommendations": recs, "risks": risks,
                "citations": cits, "confidence": s.confidence,
                "contested": s.contested, "contesting_claims": list(s.contesting_claims),
            })
        return {
            "subject": doss.entity_id,
            "framework_id": self.framework.framework_id(),
            "flag_only": not self.strict_drop,
            "sections": sections,
            "abstained": abstained,
            "evasions": getattr(doss, "evasions", []),
        }
