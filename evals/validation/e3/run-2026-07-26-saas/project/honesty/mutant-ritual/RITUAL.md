# 4-mutant non-vacuity ritual — record (2026-07-26, E3 saas run)

Per design-evaluate/references/honesty-gates.md: before trusting the honesty
gates on this project, one deliberate lie per failure class was planted on
throwaway copies of the worked-invoice arm OUTSIDE the repo (session
scratchpad; mutated pages never committed) and each was confirmed to fire;
the unmutated arms are confirmed clean (gates/<arm>/gate-a*.json,
gate-b*.json — all pass, 14 blocks scoped each). Committed outputs and stderr
captures are redacted to %USERPROFILE% markers (path hygiene; no gate content
changed).

| Mutant | Plant | Expected | Result |
|---|---|---|---|
| m1 fabrication | "Customers save £250 a month." injected into the lede (250 in no data leaf; registered `gbp` extra context) | Gate A FABRICATION | FIRED, exit 1, both modes (m1-gate-a.json) |
| m2 association | "Typical month billed: $2,387." injected inside tier-solo's block | Gate A ASSOCIATION | FIRED (ASSOCIATION + FABRICATION), exit 1 (m2-gate-a.json) |
| m3 false verdict | the beta QuickBooks integration's mark changed BETA → LIVE (beta presented as shipped — the sealed data's own trap) | Gate A VERDICT | FIRED, exit 1, CRITICAL in both modes (m3-gate-a.json) |
| m4 deletion | the mandatory VAT note "All prices exclude VAT." removed from the pricing block | Gate B MISSING | FIRED, exit 1, `vat-note` missing in both modes (m4-gate-b.json) |

Verdict: 4/4 fired + clean green on all three unmutated arms. The gates are
non-vacuous on this project — including on the two archetype-specific traps
(beta-as-shipped, VAT-note deletion) — and may be relied on for the E3
tournament.
