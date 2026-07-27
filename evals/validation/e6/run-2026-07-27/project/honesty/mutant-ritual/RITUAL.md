# E6-A mutant ritual — non-vacuity of the honesty gates (2026-07-27)

A gate that has never been seen to FAIL is not evidence. Before any green
honesty verdict in this run counts for anything, each gate is shown to fire on
a planted lie that the sealed data forbids.

**Result: 12 of 12 planted lies fired** (4 mutant classes x 3 arms), each with
the expected finding kind, and the three unmutated arms exit 0 on both gates
(`../../gates/<arm>/gate-a-derived-claims.json`,
`../../gates/<arm>/gate-b-manifest.json`).

Runner: `run-ritual.mjs` (committed). Machine-readable results:
`ritual-results.json` (committed).

## Where the mutants live

The mutants are written to a scratch directory **outside the repository** and
are never committed. The runner refuses to execute if the scratch path resolves
inside the repo: a planted lie must not be committable, even by accident.

## The four mutant classes

| id | gate | the lie planted | expected | fired |
|---|---|---|---|---|
| M1-FABRICATION | A | pack volume restated as `140 L`, a number that appears nowhere in the sealed file | FABRICATION | 3/3 arms |
| M2-VERDICT | A | the load rating presented as certified (negation removed from the pending block) | VERDICT, un-negated verdict word in a non-positive block | 3/3 arms |
| M3-PROVISIONAL-MARKER | A | the entire qualifier stripped from the load-rating block, leaving a bare `130 kg` | VERDICT, provisional block missing marker and negation | 3/3 arms |
| M4-MISSING | B | the `n=14` owner-timed basis deleted from the setup-time claim | MISSING, the anti-deletion floor | 3/3 arms |

Verbatim first findings (crease-line):

- M1: `invented litres "140 L" (=140) not in data or derived constants`
- M2: `un-negated "certified" inside non-certified block [data-model="loadRatingKg"]`
- M3: `provisional block [data-model="loadRatingKg"] is missing a provisional/unverified marker`
- M4: `required "step-2-basis" missing in light: Step 2's time claim carries its n=14 basis`

## A weak mutant, recorded rather than quietly replaced

M3's first form removed only the `Certification pending.` lead-in and **the
gate did not fire.** That was correct gate behaviour, not a hole: the sentence
"Independent certification is in progress" remained, and it is itself a
registered marker, so the block still qualified its number. The mutant was too
weak to test what it claimed to test. It now strips the whole qualifier, which
is the lie the check exists to catch, and it fires on all three arms. The first
attempt is recorded here because a ritual that silently swaps a failing mutant
for a passing one proves nothing.

## ASSOCIATION: an explicit ZERO-MEASURE on this content

E1's ritual fired four classes including ASSOCIATION (a figure from one model's
block appearing inside another's). **That check cannot fire on this page, and
is reported as a zero-measure rather than as a pass.** The shipped gate's
money-extraction regex matches `$` amounts only
(`derived-claims-gate.mjs`, `MONEY_RE`), and the sealed price is denominated in
EUR (`pricing.currency: "EUR"`). Printing a `$` figure to make the check fire
would itself be a content lie, so the check has no measurable surface here.

This is stated the way the validators state their own zero-measures: an
explicit absence of measurement, never an implied conformance. The fourth
mutant class in this run is M3 (the provisional-marker arm of the verdict
check), which the sealed data's `certification: "pending"` trap makes
genuinely measurable on this content.

## Scope

The ritual proves the honesty gates fire on the lies they claim to catch. It
says nothing about defects no gate measures (taste, register fit, whether the
motion earns its place). Those stay owner-judged, per the standing calibration
finding that the model panel runs hot against the owner on unfamiliar
archetypes.
