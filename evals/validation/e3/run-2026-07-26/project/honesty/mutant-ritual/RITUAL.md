# 4-mutant non-vacuity ritual — record (2026-07-26, E3 commerce)

Per design-evaluate/references/honesty-gates.md: before trusting the honesty
gates on this project, one deliberate lie per failure class was planted on
throwaway copies of the seed-annual catalog OUTSIDE the repo (scratchpad;
mutated pages never committed) and each was confirmed to fire; the unmutated
arms are confirmed clean on BOTH surfaces
(gates/<arm>/gate-a-*.json, gate-b-*.json — all pass).

| Mutant | Plant | Expected | Result |
|---|---|---|---|
| m1 fabrication | "Every packet £9.99 while stocks last." injected into the standfirst (9.99 in no data leaf; proves the registered gbp extraNumericContexts pattern is live) | Gate A FABRICATION | FIRED, exit 1 (m1-gate-a.json) |
| m2 association | "Was $2,387 at auction." injected inside FF-011's block | Gate A ASSOCIATION | FIRED (ASSOCIATION + FABRICATION), exit 1 (m2-gate-a.json) |
| m3 false verdict | un-negated "In stock at the nursery" injected inside FF-017's (stock: 0) block | Gate A VERDICT | FIRED, exit 1 (m3-gate-a.json) |
| m4 deletion | required variety name "Black Nebula Carrot" removed | Gate B MISSING | FIRED in both modes, exit 1 (m4-gate-b.json) |

Scope note, stated honestly (also in GROUND.md): the shipped per-block money
ASSOCIATION check binds to $-amounts (the shipped money regex); GBP amounts
are covered against whole-body FABRICATION via the registered gbp context
(proven by m1), and Gate B requires each product's OWN price inside its own
block. A swapped-but-existing £ price inside a foreign block is not
machine-covered by Gate A alone.

Verdict: 4/4 fired + clean green on all three unmutated arms (both
surfaces). The gates are non-vacuous on this project and may be relied on
for the E3 tournament.
