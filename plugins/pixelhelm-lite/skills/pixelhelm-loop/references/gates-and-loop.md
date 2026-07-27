# Gates and the iterate loop

Table of contents:
1. Why GROUND -> taste -> code (the gate-order rationale)
2. The two-layer evaluator seam (Layer-1 hard / Layer-2 advisory)
3. The honest banner (always relay it)
4. The iterate loop + the 3-iteration cap
5. Cost-aware re-render
6. Candidate elimination in the tournament
7. The incumbent guard (REDESIGN)

The router owns gate ORDER and the loop. The gates themselves live in the
sub-skills (`pixelhelm-evaluate` Layer-1 = `static-gates.mjs`; `pixelhelm-render` =
`render.mjs`). The router never re-implements them — it sequences them.

---

## 1. Why GROUND -> taste -> code

Gate #0 GROUND (`pixelhelm-ground`) resolves the contract (`core <- profile <- session`),
loads the project profile + register, fetches version-matched docs, and reads the
lessons. It runs first on every intent except a pure LEARN. Rationale:

- **An ungrounded taste pass hallucinates the contract.** Generate/direction must read
  the REAL token names, the register, and the locked constraints, or it invents a
  parallel palette that the implementer then has to translate.
- **Code before ground bakes in wrong assumptions** that are expensive to unwind once
  real surfaces exist.

So the priority is always: ground (the contract) -> taste (directions/generation,
judged against the register) -> code (the production build) -> render -> evaluate ->
iterate.

---

## 2. The two-layer evaluator seam

`pixelhelm-evaluate` runs two layers in order. The router enforces this seam when reading
the evaluator's output and deciding the next gate:

- **Layer-1 — machine-certain gates.** No model in the loop. Honest shipping status
  (keep this list truthful — it is itself gate-checked by the docs-equal-code rule in
  CONTRIBUTING):
  - **Shipped, HARD (exit 1):** token contrast light + dark (`static-gates.mjs`),
    axe-core a11y fail on serious|critical (when `render.mjs --axe` ran), the two
    honesty gates (`derived-claims-gate.mjs`, `content-manifest-gate.mjs`), candidate
    token-contract recomputation (`check-token-contracts.mjs`), the structural output
    floor — landmarks / heading hierarchy / meta description
    (`output-floor-gate.mjs`), and motion-lint (Full edition).
  - **Shipped, HARD when a browser is available (run them whenever the loop
    rendered; not run ⇒ say so, never imply they passed):** real-render state
    contrast in default/hover/focus (`verify_states.mjs`), responsive overflow at
    280/320/414 (`verify_responsive.mjs`), dialog focus trap
    (`verify_focustrap.mjs`), target size WCAG 2.5.8 beyond axe's rule
    (`verify_targetsize.mjs`), keyboard traversal + focus-visible capture
    (`verify_keyboard.mjs`), and deterministic scroll-position capture under the
    page-readiness contract (`verify_scrollcapture.mjs`).
  - **Shipped, HARD when a browser is available — LAB-budget pair (same rule, plus
    an honesty caveat the evaluator must relay):** frame-time percentiles against a
    pre-registered p95 budget (`verify_frametime.mjs`) and lab CWV capture — LCP /
    CLS / INP-proxy — against configurable budgets, desktop + emulated mobile
    (`verify_cwv.mjs`). Their verdicts are single-machine LAB evidence that binds
    the run that produced them; they are directional across machines and never a
    field/RUM claim.
  - **Shipped, SOFT (reported, never exit 1):** raw-color drift walk, anti-cliche
    registry grep, type-scale ratio, web-craft signals.
  - **Designed, NOT YET WIRED (no validator ships):** states-present (distinct
    hover/focus styles exist at all), token conformance (computed === resolved
    token value). See `pixelhelm-evaluate/references/layer-1-gates.md` for their specs.
  A Layer-1 PASS means every SHIPPED hard gate exited 0 — nothing more. Do not
  describe unwired gates as part of the enforced floor.
- **Layer-2 — expert-lens, ADVISORY.** Scored on the screenshots by a cross-model VLM
  judge / the 7-seat council, pairwise, grounded in Layer-1's measured evidence. A
  dimension <=4 is a [High] finding ("describe the problem, not the px").

**Seam rules the router MUST obey:**
- **Floor-clean is a HARD PRECONDITION for Layer-2 scoring (R1).** Layer-2 may score
  a candidate ONLY if every SHIPPED HARD Layer-1 gate for that surface exited 0 AND
  those gate outputs exist as artifacts. A candidate that fails a hard gate, or whose
  gate outputs do not exist, is **UNSCORED**: it gets no rubric score, no lens score,
  no rank, and no place in the winner tally — and it is recorded with that word and
  the failing (or missing) gate named. UNSCORED is **never** "scored low": a low score
  is an opinion, and the seat has no standing to hold one about a surface the floor
  already ruled on or never measured. A prose claim that "Layer-1 passed" with no
  artifact to point at is a MISSING bundle, hence UNSCORED, not a pass. *(Why: E4
  falsified the render-only judging seat — a candidate with a real 3.12:1 AA contrast
  failure won its external set and no juror surfaced it. Decision:
  `evals/validation/E4-JUDGING-SEAT-REPAIR-DECISION.md` R1; evidence:
  `evals/validation/e4-run-2026-07-26/REPORT.md`.)*
- **Layer-2's inputs carry Layer-1's outputs (R2).** Wherever a candidate IS scored,
  its gate outputs travel with its renders in every juror/lens input set, and the
  juror record's `inputTranscriptSha256` covers them. Gates that did not run are named
  as not-run in that same input set — never omitted, since silence would read as a
  pass. R1 removes defective candidates; R2 removes the seat's ignorance of what was
  measured, so esteem cannot be spent on properties the machine already ruled on.
- **Layer-2 NEVER overrides a Layer-1 FAIL.** If Layer-1 fails, the surface is not
  shippable regardless of any lens praise — route to `pixelhelm-repair`.
- **A Layer-1 PASS is NEVER "design approved."** A clean machine pass proves
  tokens/contrast/a11y/no-drift correctness, not taste. Do not present "Layer-1 green"
  as final approval.
- **Layer-2 never blocks the loop** — with ONE carve-out. A low lens score advises; it
  does not, on its own, trigger a fix iteration. Only a Layer-1 FAIL or a [Blocker]
  (and owner discretion on a [High]) costs an iteration. The carve-out: on a REDESIGN
  the Register-fit gate is a pre-aggregation VETO over the VERDICT (the incumbent
  guard, §7) — it decides who may be crowned, it does not spend iterations.
- The axe "needs review / incomplete" bucket routes explicitly to Layer-2 (human
  judgment), never silently passed (axe catches roughly a third of WCAG).

---

## 3. The honest banner

`pixelhelm-evaluate` prints a scope banner; the router relays it verbatim with every
evaluator result:

> These gates prove tokens / contrast / a11y / no-drift correctness. They do not prove
> taste.

Never let a green machine gate read as a design endorsement. Quality is owner-judged
(render-and-show-the-owner against the register's north-star bar), not an automated
score.

---

## 4. The iterate loop + the 3-iteration cap

```
LOOP (after pixelhelm-render + pixelhelm-evaluate):
  if any Layer-1 gate FAILED, or a [Blocker] is present:
      -> pixelhelm-repair (target ONLY that finding; smallest change)
      -> pixelhelm-render (the affected viewport[s] only)
      -> pixelhelm-evaluate (prove the finding cleared AND nothing regressed)
      -> increment iteration; repeat
  else if Layer-1 PASS and no Blocker (only [Medium]/Nit + advisory lens notes):
      -> present the result + the advisory list; do NOT loop further
  if iteration count == 3 and findings remain:
      -> STOP. Surface "needs human review" with the open findings + what was tried.
```

The cap exists because past three machine-gated rounds, remaining issues are usually
taste calls a VLM cannot reliably grade — escalate to the owner rather than thrash.

**Regressions detected against the baseline are auto-top-severity (a Layer-1 PASS
that regresses is treated as a Blocker), and that rule is EXECUTED, not advised.**
The comparator is `pixelhelm-baseline/scripts/baseline.mjs` (`compare`), which reads the
regression memory captured by the same script's `capture` and exits 1 on any of:

- **Regressed** — a gate that was `pass`/`n/a` at the baseline and fails now.
- **Regressed measurement** — a captured number that moved the wrong way by more
  than its captured tolerance (the direction is stored WITH the measurement, so the
  comparison never guesses which way is better).
- **Lost evidence** — a gate that passed at the baseline and is declared `not-run`
  now. It is reported under that name, not as "Regressed": an unprovable regression
  is not a proven one, but a candidate that stopped measuring a gate cannot claim it
  did not regress there, so it blocks the same way.

Two things the comparator will not do. It never treats **silence** as a pass: a
baseline gate absent from the run's inputs is reported `not-compared` by name, and
it costs the run its `provenNoRegression` verdict (this is what keeps §5's targeted
re-render honest — a one-viewport re-render simply does not prove the whole surface).
And it never absorbs a change into the memory: `capture` REFUSES to overwrite an
existing screen or re-key an existing baseline, and `--rebaseline` writes a separate
reviewable proposal a human accepts. Protocol and file shape:
`pixelhelm-evaluate/references/baseline.md`.

---

## 5. Cost-aware re-render

Match render cost to the change. `pixelhelm-render` supports targeted re-render:

- A single-token / single-element fix re-renders ONE viewport in the relevant mode, not
  the full desktop+mobile x light+dark matrix.
- A layout-level change re-renders the affected breakpoints.
- A new direction or a full candidate re-renders the whole matrix.

The router passes the change scope to `pixelhelm-render` so it does not pay for a full
matrix on a one-line fix.

---

## 6. Candidate elimination in the tournament

For NEW DESIGN / REDESIGN, `pixelhelm-generate` produces N competing candidates. The
router's ordering rule: **Layer-1 machine gates run on every candidate FIRST.** Any
candidate that fails contrast / token-drift / a11y is eliminated before taste judgment
(a model cannot argue past a machine FAIL). Only Layer-1-passing candidates advance to
`pixelhelm-judge` for the taste verdict; the winner enters the iterate loop. Note the
losing candidates' best ideas in the Decision Audit Trail.

**Elimination is UNSCORED, not a low score (R1).** An eliminated candidate is recorded
as `UNSCORED` with the failing gate named, and it is excluded from every ranking, every
median, and the winner tally. Two eliminating conditions, not one:

```
A candidate is UNSCORED when EITHER holds:
  1. any SHIPPED HARD Layer-1 gate for its surface exited non-zero;  or
  2. its gate outputs do not exist as artifacts (nothing to point at,
     or only a prose claim that they passed).
An UNSCORED candidate:
  - receives NO rubric score, NO lens score, NO rank, NO juror record;
  - may NOT be restored by any lens, chair, or owner-facing argument short
    of re-running the floor clean on a repaired candidate;
  - is NOT "the worst candidate" — the panel is silent on its taste, and
    the report says UNSCORED plus the gate, never a comparative adjective.
```

The elimination is what makes the panel's silence honest: E4 showed that a
render-judged panel cannot see a measured defect, so the only safe seam is to keep the
defective candidate out of the panel entirely rather than trust the panel to mark it
down. The surviving candidates advance carrying their gate outputs (R2, §2).

---

## 7. The incumbent guard (REDESIGN — never ship a regression)

A redesign exists to BEAT the current design, so on every REDESIGN the current/live
design is entered into the tournament as the labeled competitor `incumbent`
(`routing.md` REDESIGN). After `pixelhelm-judge` scores all candidates, the router
applies the guard BEFORE declaring any new direction the winner:

```
GUARD (a new direction D may be crowned only if BOTH hold):
  1. D weighted council score  >  incumbent weighted score   (BETTER overall)
  2. D register-fit score      >= incumbent register-fit score  (NEVER colder/less on-register)
If NO new direction satisfies BOTH:
  -> STOP the loop. Report verbatim: "Current design wins — no change recommended."
     Include WHY (which directions failed clause 1, which failed clause 2) and the best
     grafts that COULD be applied to the incumbent WITHOUT lowering register-fit.
  -> Do NOT crown a "least-bad" new direction. The status quo is the winner.
```

Clause 2 is absolute and not averaged away: a direction more disciplined but LESS
on-register than what exists is a regression in the one dimension that defines the
product. "Better overall + at least as warm/on-register" is the only pass. The guard
is the redesign analogue of the baseline-regression rule (Section 4): a redesign that
lowers register-fit vs the incumbent is treated like a Layer-1 regression — blocked.

This guard is SHARED by both REDESIGN methods — the tournament (`pixelhelm-judge`) and
incremental-polish mode — so no REDESIGN path, however small the change, can ship a
direction that is worse overall or colder/less on-register than the incumbent.
