# 4-mutant non-vacuity ritual — record (2026-07-26, E3 editorial)

Per design-evaluate/references/honesty-gates.md: before trusting the honesty
gates on this project, one deliberate lie per failure class was planted on
throwaway copies of the almanac-rail arm OUTSIDE the repo (scratchpad; mutated
pages never committed) and each was confirmed to fire; the unmutated arms are
confirmed clean (gates/<arm>/gate-a-derived-claims.json, gate-b-manifest.json
— all pass, 34 blocks bound, both modes).

| Mutant | Plant | Expected | Result |
|---|---|---|---|
| m1 fabrication | "The valley has taken 999.9 mm this generation" injected into the standfirst (999.9 in no data leaf) | Gate A FABRICATION | FIRED both modes, exit 1 (m1-gate-a.json) |
| m2 association | "$2,387" injected inside the 2005 year block | Gate A ASSOCIATION | FIRED (ASSOCIATION + FABRICATION), exit 1 (m2-gate-a.json) |
| m3 false verdict | standalone un-negated "VERIFIED" injected inside the 2019 (unverified-outlier) block | Gate A VERDICT | FIRED, exit 1 (m3-gate-a.json) |
| m4 deletion | required 1998 gap reason "gauge failure; station offline all season" removed | Gate B MISSING (gap-1998-reason) | FIRED, exit 1 (m4-gate-b.json) |

Verdict: 4/4 fired + clean green on all three unmutated arms. The gates are
non-vacuous on this project and may be relied on for the E3 editorial
tournament. Scratch paths in the captured outputs are redacted to
`<scratch>/mutants/...` (path-hygiene law).
