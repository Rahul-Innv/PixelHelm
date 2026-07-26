# 4-mutant non-vacuity ritual — record (2026-07-26)

Per design-evaluate/references/honesty-gates.md: before trusting the honesty
gates on this project, one deliberate lie per failure class was planted on
throwaway copies of the trail-ledger arm OUTSIDE the repo (scratchpad; mutated
pages never committed) and each was confirmed to fire; the unmutated arms are
confirmed clean (gates/<arm>/gate-a*.json, gate-b*.json — all pass).

| Mutant | Plant | Expected | Result |
|---|---|---|---|
| m1 fabrication | "Ridge total 99.9 km" injected into body (99.9 in no data leaf) | Gate A FABRICATION | FIRED, exit 1 (m1-gate-a.json) |
| m2 association | "$2,387" injected inside T-04's block | Gate A ASSOCIATION | FIRED (ASSOCIATION + FABRICATION), exit 1 (m2-gate-a.json) |
| m3 false verdict | standalone un-negated "OPEN" injected inside T-02 (closed) block | Gate A VERDICT | FIRED, exit 1 (m3-gate-a.json) |
| m4 deletion | required trail name "Basalt Steps" removed | Gate B MISSING | FIRED, exit 1 (m4-gate-b.json) |

Verdict: 4/4 fired + clean green on all three unmutated arms. The gates are
non-vacuous on this project and may be relied on for the E1 tournament.
