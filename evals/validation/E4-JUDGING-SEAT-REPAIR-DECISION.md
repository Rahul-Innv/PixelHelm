# Judging-seat repair decision — after E4's falsification

**Date:** 2026-07-27. **Owner-approved direction** (Rahul, 2026-07-27): adopt
BOTH repair candidates from the E4 report, together. This document is the
decision record; implementation and re-validation are tracked below and are NOT
claimed complete here.

## What E4 actually proved (the defect being repaired)

E4 was falsified on its plant criterion: `switchback`, a planted candidate with
a real 3.12:1 AA contrast failure under an attractive surface, WON its external
set (3 of 5 jurors first; zero jurors surfaced the defect), while the machine
floor battery caught 4 of 4 plants deterministically. Statistics passed
(tau-b 0.632, inflation +0.625); the failure was not calibration drift, it was
**blindness to measured defects**.

Diagnosis: E4's external protocol deliberately gave jurors only the dossier
tiers, the rubric, and renders — never the floor outputs. Model jurors scoring
renders cannot see contrast ratios, overflow, or honesty violations, so an
attractive broken candidate is indistinguishable from an attractive sound one.
The internal loop does not have this hole by architecture (Layer-1 runs on every
candidate before the council, `gates-and-loop.md` §6), which is why the standing
demotion binds **standalone panel claims**, not gated loop verdicts.

## The repair (both parts are required; either alone is insufficient)

**R1 — Floor-clean is a hard precondition for esteem scoring.** No candidate may
receive a rubric or lens score unless every shipped HARD Layer-1 gate for its
surface exited 0 and those outputs exist as artifacts. A candidate without gate
evidence is `UNSCORED`, never "scored low" — the seat may not express an opinion
about something it has no standing to judge. This closes the architectural hole:
a defective candidate cannot reach the panel at all.

**R2 — Panels receive the floor outputs with the renders.** Where a candidate is
scored, its gate outputs travel with it in the juror input set, and the juror
record's `inputTranscriptSha256` covers them. Rationale: R1 removes defective
candidates, R2 removes the seat's ignorance of what was measured, so praise
cannot be spent on properties the machine already ruled on. R2 also makes the
E4-style plant detectable rather than merely absent.

**Scope boundary kept honest:** R1+R2 repair the seat's blindness to *measured*
defects. They do nothing for defects no gate measures (taste, register fit,
content quality). Those remain owner-judged, per the standing E1/E3 calibration
finding that the panel runs 2 to 3 points hot against the owner on unfamiliar
archetypes.

## Status of the standing demotion

The demotion stays IN FORCE: the model judging seat is advisory-only, and no
Tier-3 claim may rest on internal scores alone. It is not lifted by this
decision, by implementation, or by any self-assessment. **Lifting it requires
E4-R:** a re-run of the sealed E4 protocol with R1+R2 applied and fresh plants
(new defect classes, newly hash-sealed), meeting the same unchanged thresholds.
Until E4-R's artifacts exist and pass, every panel-scored claim in this
repository carries the advisory label.

## Tracking

- Implementation (mechanical enforcement in the judging recipe, the loop seam,
  and the record writers): queued engineering, not done at this document's date.
- E4-R re-validation: queued, blocked on implementation.
- The sealed `PREREG-E4-CALIBRATION.md` is untouched; E4-R will pre-register its
  own plant set under the same statistics and thresholds.
