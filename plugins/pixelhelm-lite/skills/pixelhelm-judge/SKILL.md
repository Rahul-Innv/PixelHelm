---
name: pixelhelm-judge
description: Compare rendered UI candidates through named expert lenses and synthesize an owner-facing verdict. Use after candidates have comparable render and gate evidence. Do not use for deterministic accessibility checks, candidate generation, or final owner approval.
---

# Judge candidates

Use the retained lens and recipe resources. Keep each lens independent, label
uncertainty, and ABSTAIN-BLOCK when comparable evidence or the active register is
missing. Apply the incumbent guard on redesigns. The verdict advises; the owner remains
the final judge.

## Floor-clean is a precondition for scoring (R1)

Score a candidate only when every shipped HARD Layer-1 gate for its surface exited 0
and those gate outputs exist as artifacts. Otherwise the candidate is UNSCORED: no
rubric score, no lens score, no rank, no juror record, no place in the winner tally.
Record the word UNSCORED and name the failing or missing gate.

UNSCORED is never "scored low" and never a comparative adjective. A low score is an
opinion, and this seat has no standing to hold one about a surface the floor already
ruled on or never measured. A prose claim that the gates passed, with no artifact to
point at, is a missing bundle and therefore UNSCORED. Do not restore an UNSCORED
candidate on lens praise; a repaired candidate re-enters only by re-running the floor
clean.

## Panels read the gate outputs with the renders (R2)

Where a candidate is scored, its gate outputs travel with its renders in the juror
input set, and the juror record inputTranscriptSha256 covers them. Name any gate that
did not run; silence must never read as a pass. Do not spend praise on a property the
floor already measured, and do not relitigate a gate the floor already passed.

Every panel ends by writing its verdict record through the pixelhelm-loop records
script (validate-then-write, append-only). A panel whose record does not validate did
not happen; never report an unrecorded panel result.
