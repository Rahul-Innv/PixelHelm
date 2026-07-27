---
name: pixelhelm-evaluate
description: Evaluate rendered UI evidence with machine-certain accessibility, token, state, target-size, contrast, and performance gates. Use for design audits or after rendering. Do not use to generate UI, make subjective winner choices, or silently fix findings.
---

# Evaluate rendered evidence

Run the retained deterministic gates against identified renders and code. Separate
hard machine failures from confidence-labeled advisory observations. Never let a lens
score override a hard failure or turn a machine pass into design approval. Emit one
deduplicated finding list with evidence locations.

Between the layers, diff this run against the captured baseline with
pixelhelm-baseline's scripts/baseline.mjs (`compare`, same inputs the incumbent was
captured with). A gate or measurement that was clean at the baseline and is not now
is a Blocker regardless of how the candidate scores on its own; a gate that stopped
being measured is never reported as a pass. Report only New and Regressed; suppress
what already passed. Details: references/baseline.md.
