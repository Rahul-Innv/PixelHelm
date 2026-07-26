---
name: pixelhelm-judge
description: Compare rendered UI candidates through named expert lenses and synthesize an owner-facing verdict. Use after candidates have comparable render and gate evidence. Do not use for deterministic accessibility checks, candidate generation, or final owner approval.
---

# Judge candidates

Use the retained lens and recipe resources. Keep each lens independent, label
uncertainty, and ABSTAIN-BLOCK when comparable evidence or the active register is
missing. Apply the incumbent guard on redesigns. The verdict advises; the owner remains
the final judge.

Every panel ends by writing its verdict record through the pixelhelm-loop records
script (validate-then-write, append-only). A panel whose record does not validate did
not happen; never report an unrecorded panel result.
