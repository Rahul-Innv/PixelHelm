"""
design_adapter/gate.py — the DESIGN VerificationGate + its live entailment judge.

Three tiers (design Part II, all portable):
  entailment      — "does the cited principle/reference/standard SUPPORT this design claim, in full?"
                    A relational claim with no `supports:"link"` citation is structurally unsupported
                    (the over-association catch, judge-independent) — the same P2-1 rule as the upstream reference adapter.
  self_consistency— keep claims recurring across all K runs (annotated with the run fraction). MANDATORY.
  corroboration   — OPTIONAL. Returns None by default -> the 2-tier gate the spec recommends for design
                    (design research is low-stakes; a weak design "fact" carries no legal risk). Set
                    corroborate=True to enable channel-count corroboration (>=2 distinct channels agree).

The judge (`DesignVerify`) re-reads the cited LOCAL file and asks an LLM whether the page/section supports
the WHOLE proposition (including any evaluative/causal predicate) — never a sub-span. silence != absence:
an unreadable/missing source returns `unclear` (no opinion), never `unsupported`.
"""
from __future__ import annotations

from collections import defaultdict
from dataclasses import replace
from typing import Optional

from ..storm_engine.contracts import Claim, Verdict


def _norm(s: str) -> str:
    return " ".join("".join(ch.lower() if ch.isalnum() else " " for ch in (s or "")).split())


_VERDICT_SCHEMA = {
    "type": "object", "additionalProperties": False,
    "properties": {
        "verdict": {"type": "string", "enum": ["supported", "unsupported", "unclear"]},
        "note": {"type": "string"},
    },
    "required": ["verdict", "note"],
}

_JUDGE_SYSTEM = (
    "You are a neutral evidence checker for a DESIGN brief. Decide whether the SOURCE (a design "
    "principle, reference, or accessibility/performance standard) supports the design CLAIM exactly as "
    "stated. Judge the FULL proposition — if the claim asserts a relationship, ranking, threshold, or "
    "judgment ('fails AA', 'improves conversion', 'therefore', 'because', 'stronger hierarchy'), the "
    "source must support THAT, not merely an underlying fact. Verdicts: 'supported' (the source "
    "substantiates the whole claim), 'unsupported' (it contradicts the claim or does not substantiate "
    "the load-bearing part), 'unclear' (the source is ambiguous or off-topic). Be factual and unbiased; "
    "report a split honestly. Output the verdict and a one-line note.")


class DesignVerify:
    """Fetch-and-judge entailment provider. `read_source(url)->str|None` re-reads the cited local file;
    `llm` is a DesignLLM judge role. Both injectable for offline proofs."""

    def __init__(self, llm, read_source):
        self.llm = llm
        self.read = read_source
        self._page: dict = {}

    def _fetch(self, url: str):
        if url in self._page:
            return self._page[url]
        text = None
        try:
            text = self.read(url)
        except Exception:
            text = None
        self._page[url] = text
        return text

    def verify(self, claim: str, url: str) -> dict:
        page = self._fetch(url)
        if not page:
            return {"verdict": "unclear", "note": "source unfetchable or empty (silence != absence)"}
        user = f"CLAIM: {claim}\n\nSOURCE ({url}):\n{page[:7000]}\n\nVerdict?"
        out = self.llm.structured(_JUDGE_SYSTEM, user, _VERDICT_SCHEMA, max_tokens=300)
        v = out.get("verdict")
        if v not in ("supported", "unsupported", "unclear"):
            return {"verdict": "unclear", "note": "judge returned no parseable verdict"}
        return {"verdict": v, "note": (out.get("note") or "").strip()}


class DesignGate:
    """VerificationGate for the design adapter. `verify_provider` must expose verify(claim_text, url)->
    {verdict, note}; wire a DesignVerify for a live run, a stub for offline proofs."""

    def __init__(self, verify_provider, *, min_support: float = 0.5, corroborate: bool = False):
        self.vp = verify_provider
        self.min_support = min_support
        self.corroborate = corroborate

    def entailment(self, claim: Claim) -> Verdict:
        cits = list(claim.citations or ())
        if claim.kind == "relational":
            # only a citation tagged supports:"link" backs the inference itself (P2-1 over-association catch)
            cits = [c for c in cits if c.get("supports") == "link"]
            if not cits:
                return {"verdict": "unsupported", "note": "no citation supports the inferred link", "fraction": 0.0}
        if not cits:
            return {"verdict": "unsupported", "note": "no citations", "fraction": 0.0}
        verdicts = [self.vp.verify(claim.text, c.get("url", "")) for c in cits]
        supported = sum(1 for v in verdicts if v.get("verdict") == "supported")
        contradicted = sum(1 for v in verdicts if v.get("verdict") == "unsupported")
        frac = round(supported / len(verdicts), 2)
        if supported >= 1 and frac >= self.min_support:
            return {"verdict": "supported", "note": f"{supported}/{len(verdicts)} citations support", "fraction": frac}
        if contradicted == 0:
            # not enough support, but NO source contradicts -> the shortfall is absent/ambiguous
            # evidence, so verdict is 'unclear' (engine scores it 0.4), NOT 'unsupported' (0.0).
            # silence != absence: 'we could not confirm' must never read as 'the source says no'.
            return {"verdict": "unclear",
                    "note": f"{supported}/{len(verdicts)} support, none contradict (unclear)", "fraction": frac}
        return {"verdict": "unsupported",
                "note": f"{supported}/{len(verdicts)} support, {contradicted} contradict", "fraction": frac}

    def corroboration(self, claim: Claim) -> Optional[float]:
        if not self.corroborate:
            return None  # 2-tier gate (the spec's recommendation for low-stakes design research)
        channels = {c.get("channel") for c in (claim.citations or ()) if c.get("channel")}
        if not channels:
            return None
        return round(min(1.0, len(channels) / 2.0), 2)  # >= 2 independent channels -> full

    @staticmethod
    def _key(c):
        # Recurrence key: namespace by STANCE (the engine's claim_id hashes only kind+text+urls and
        # IGNORES stance — so a refuter's same-text disconfirming claim would otherwise overwrite the
        # constructive survivor and force the lens to abstain) and NORMALIZE the text (trivial rewordings
        # still recur). Full paraphrase tolerance needs semantic matching — an engine-coordination item
        # (claim_id / self_consistency recurrence semantics are engine-owned; see the backlog §5b).
        urls = tuple(sorted(cc.get("url", "") for cc in (c.citations or ())))
        return (c.stance, _norm(c.text), urls)

    def self_consistency(self, claims_by_run) -> list:
        runs = [r for r in claims_by_run if r is not None]
        n = len(runs) or 1
        seen: dict = defaultdict(int)
        rep: dict = {}
        for run in runs:
            keys_in_run = set()
            for c in run:
                k = self._key(c)
                rep[k] = c
                keys_in_run.add(k)
            for k in keys_in_run:  # count RUN-presence (a claim repeated within a run counts once)
                seen[k] += 1
        out = []
        for k, count in seen.items():
            if count >= n:  # unanimous across runs (K=2 -> must recur in both)
                out.append(replace(rep[k], self_consistency=round(count / n, 2)))
        return out
