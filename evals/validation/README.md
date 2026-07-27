# Validation program — artifact home

**Status: ACTIVE PROGRAM. A sheet licenses generation only once it is owner-approved
AND committed; sheets carry their approval state in their own status lines. (This
line replaced the original draft banner 2026-07-26 — Codex critique finding 5.)**

This directory is the committed artifact home for the validation and experiment
program defined in the 2026-07-26 capability research (artifact 14). Ground rules,
restated as binding here:

- **A run without artifacts did not happen** (D14/F1 law; CONTRIBUTING "Evidence
  and claim discipline"). Every experiment commits its full trail: candidates
  (including losers), juror JSONs, gate outputs, renders, run records.
- **All judged scores are *system-esteem*** (RF-1/RF-4). Nothing here measures
  user outcomes; only E5-style human tests may ground user-outcome language.
- **Pre-registration before generation** (RF-4 integrity): rubric and metric
  sheets are written, owner-approved, and committed BEFORE any candidate exists.
  No post-hoc rubric fitting.
- Briefs are small and synthetic — never the owner's real portfolio.

## E0 — Truth reconciliation (precondition) — VERIFICATION RECORD

Verified 2026-07-26 against main at `27d08a7` (P0 truth-fixes merge, pushed):

| Item | Status | Evidence |
|---|---|---|
| P0-1 phantom validators | CLOSED | four validators absent from tree and from docs; gate list in `gates-and-loop.md` states shipped-hard / shipped-soft / designed-not-wired honestly |
| P0-2 claim voice | CLOSED | README splits "Committed evidence" from "Attested history"; 9/10 blind-panel claim labeled narrative-without-artifacts |
| P0-3 ChoiceGate lite-only | CLOSED (documented as deliberate) | `docs/authority-boundary.md`; widening to Full is owner-gated |
| P0-7 method law | CLOSED | CONTRIBUTING.md "Evidence and claim discipline (method law)" |
| P0-4 floor gates / P0-5 judge-record writers / P0-6 SEO-landmark gate | IN FLIGHT | separate engineering task, own worktree; **E1 execution is blocked until these land** — juror JSONs and committable gate outputs are E1 success criteria |

E0 verdict: the docs-equal-code half is closed — the system under test is the
system described. E1 may be pre-registered now but may not RUN before P0-4/5/6
merge.

## Experiment index

- `e1/` — E1: **RUN COMPLETE + OWNER-SIGNED 2026-07-26; graded by in-tree adversarial
  critique as: completed, owner-reviewed, arithmetically reproducible — with
  material pre-registration/provenance defects (run-2026-07-26/CODEX-CRITIQUE-2026-07-26.md
  + CRITIQUE-RESPONSE.md; per-juror record machinery gap, palette result carries an
  in-loop-feedback caveat).**
  Pre-registration pack: `PREREG-BRIEF.md` (+ Amendment A1: declared convention
  breaks), `PREREG-RUBRIC-utility.md`, `PREREG-METRICS-divergence.md`, sealed
  ground data in `e1/data/`. Full run trail in `e1/run-2026-07-26/` (read
  `REPORT.md` first): all shipped HARD gates green ×3 arms, 4/4 mutant ritual,
  **E2 thresholds met as measured (palette: with the critique's in-loop-feedback caveat)**, winner `trail-ledger`
  (overall median 9.0, dead-heat tiebreak recorded in `jurors/TIEBREAK.md`),
  records validated via `records.mjs`. **Calibration finding (RF-4):** the
  blind panel ran ≈1 point hot vs the owner on all three arms (9/9/8 vs
  ~8/8/7) — 9+ medians read as "strong, owner-verify," never as achieved
  distinctive excellence. An admission-precondition failure and its
  owner-authorized ChoiceGate v0.2.1 re-acceptance are recorded in
  `e1/attempt-2026-07-26-admission-blocked/` and `reacceptance-2026-07-26/`.
- `e3/` — E3: the transfer test — three unfamiliar archetypes, full loop each.
  Pre-registration pack (drafted while E1 ran; sealed only after owner
  approval): `PREREG-BRIEF-saas.md` / `PREREG-BRIEF-commerce.md` /
  `PREREG-BRIEF-editorial.md`, matching `PREREG-RUBRIC-*.md` sheets (RF-8:
  one rubric per archetype), sealed data in `e3/data/`. Scope honesty: passing
  covers four archetypes total; portfolio and product-application stay
  untested and unclaimable.
- `PREREG-E5-COMPARATOR-RULE.md` — E5's comparator construction rule, required
  sealed BEFORE E3 begins (critic-2 D9); execution record + Amendment A1-E5 in
  `PREREG-E5-COMPARATOR-SELECTION-ADDENDUM.md` (two registered queries returned
  degenerate results; amended pre-generation toward stronger comparators).
- `e6/` — E6-A: the motion-storytelling launch page (Lane-A, original work —
  owner-directed 2026-07-26). Blocked on E1 review + P1-5 measurement tooling;
  human comprehension check owner-gated.
- `e4-run-2026-07-26/` — E4: **RUN 2026-07-26/27 — FALSIFIED per its sealed
  criteria** (tau-b 0.632 PASS, inflation +0.625 PASS, plant criterion FAIL:
  a planted real contrast failure won its external set unnoticed by all five
  jurors; the floor battery caught 4/4 plants deterministically). Standing
  consequence, in force: **the model judging seat is advisory-only until
  repaired; no Tier-3 claim may rest on internal scores alone; the machine
  floor's authority is strengthened.** Repair direction is an open owner
  decision (REPORT.md lists candidates).
- E5 human protocol: defined in artifact 14; owner-gated (recruitment).
