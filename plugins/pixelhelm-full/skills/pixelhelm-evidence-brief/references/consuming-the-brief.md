# Consuming a STORM design brief — the constraint contract

The STORM brief is **grounded evidence**, not a design. How you fold it into the loop decides whether it
strengthens grounding or silently reintroduces the **L-012 regression** (a disciplined-but-colder direction
beating the warmer incumbent because discipline findings out-voted the register). This file is the contract.
Read it before wiring any brief into `pixelhelm-directions` / `pixelhelm-generate` / `pixelhelm-judge`.

## The five claim classes and what each becomes

| Brief element | Gate meaning | How the loop treats it |
|---|---|---|
| `sections[].recommendations[]` with `flagged=false` (supported constructive) | the judge re-read the cited source and it substantiates the whole claim | **CONSTRAINT** — every candidate must satisfy it. Same status as a brief DIAGNOSIS finding: table stakes, NOT scored taste. It never buys a candidate a win over the register. |
| `sections[].risks[]` (supported disconfirming, from the refuter) | a real, evidenced usability / a11y / perf FAILURE | **HARD CONSTRAINT** — fix it. A `contested` lens (confidence floored to 0.1) is the flag. |
| `recommendations[]` with `flagged=true` (retained under flag-only, verdict ≠ supported) | an over-association / leap the gate could NOT ground | **ADVISORY ONLY, LOW TRUST** — may inform a hypothesis; NEVER promote to a constraint or a scored point. |
| `status = "insufficient_evidence"` (abstained lens) | no supported constructive claim survived | **NO WEIGHT.** silence ≠ absence: do not read it as "this dimension is fine", and do not invent findings to fill it. |
| `sections[].citations[]` | the local principle/reference/standard the claim rests on | the receipt. A register-fit or craft critique that cites one of these is GROUNDED; one that doesn't is vibes. |

## The register-fit invariant (do not violate)

The recalibrated council (global KB **L-012**) makes **Register-fit a chair-weighted GATE** judged strictly
against the profile `_register`, ranked ABOVE any single discipline/craft lens, with an **incumbent guard**
on redesigns. STORM must **strengthen** that gate, never bypass it:

1. **STORM grounds the register-fit critique; it does not replace it.** The `visual_brand` lens's supported
   findings (and their citations) let a juror say "this drifts from the register per <cited principle>"
   instead of vibing — but the verdict is still the Register-fit gate's, judged against `_register`.
2. **A STORM discipline finding is a constraint, not a register mandate.** `accessibility`,
   `conversion_ux`, `responsive`, `performance` findings — and any `visual_brand` finding phrased as
   *declutter / recede / flatten / restrain* — are **constraints-not-taste**, exactly like the brief's
   diagnosis. Satisfying them is table stakes; they must NEVER out-rank the register or crown a colder
   direction. Stripping the register's warmth to satisfy a "declutter" finding is the L-012 failure.
3. **The incumbent guard still binds.** On a redesign, a new direction wins only if it beats the incumbent
   overall AND scores ≥ it on register-fit — regardless of how many STORM constraints it aces.
4. **Abstains and flags are not evidence.** They cannot lower or raise a register-fit score.

## Where each consumer reads it

- **`pixelhelm-ground`** folds the whole brief into the ground context as `stormBrief` (with its `abstained`
  list intact, so downstream skills see the honest gaps).
- **`pixelhelm-generate`** input #1 (brief/thesis): the supported constructive recommendations + refuter risks
  join the DIAGNOSIS constraints every engine must satisfy; flagged/abstained are omitted from the
  constraint set. The register budget is still spent on the profile's named qualities, not on the
  constraints.
- **`pixelhelm-judge`**: in Phase 0 the panel reads the brief alongside the profile; the Register-fit and
  Craft lenses may cite its supported findings; the chair treats STORM constraints like diagnosis
  constraints in the synthesis (satisfied = table stakes), and the Register-fit gate + incumbent guard are
  unchanged.

## One-line test before you use a brief

> "Am I about to let a STORM finding do anything the profile `_register` wouldn't?" If yes — stop. It is a
> constraint, not the personality.
