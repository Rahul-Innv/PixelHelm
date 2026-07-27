# E1 pass 2 report — owner-directed repair of `trail-ledger` (2026-07-26)

Documented `pixelhelm-repair` pass executed after the owner's
APPROVED-WITH-CHANGES verdict on the E1 winner. Plan and scope: `PLAN.md`.
Everything here is evidence-backed by files in this directory; the original
run trail (`../project/`, `../REPORT.md`) is untouched. No panel re-judge was
run and — per the E1 calibration lesson — no self-graded scores are claimed
anywhere in this pass; quality judgment on the revision belongs to the owner
at sign-off.

## Changes applied (all three findings from PLAN.md)

1. **Status structure / color association graft (owner change 1).** The single
   ledger list is now four explicitly headed status groups — OPEN / CAUTION /
   CLOSED / NO REPORT — each header a stamp in the status color plus its trail
   count ("3 trails"), and a stamped status-count strip sits at the top of the
   log. Executed in ledger idiom: stamps, type, and ruled lines — no tiles, no
   card chrome; statuses remain words first, color never the only signal.
2. **In-use affordances (owner change 2).** The count strip is jump
   navigation ("Jump to: 3 OPEN · 2 CAUTION · 2 CLOSED · 2 NO REPORT"); the
   closure notice's trail names anchor to their ledger entries; a back-to-top
   link closes the log; smooth scrolling only under
   `prefers-reduced-motion: no-preference`.
3. **Data-age framing (recorded panel advisory, minor).** "Morning log / open
   this morning" → "Daily log / open today" (title area, meta description,
   summary). No time-of-day claim the sealed data does not carry.

Token contract: byte-identical to the winning arm's. Content: sealed data +
injected constants only (new visible numbers are exactly {3, 2, 9}).

## Gate results (ALL shipped HARD gates re-run on the revised candidate)

| gate | result | evidence |
|---|---|---|
| token-contract AA recompute | PASS — 14 pass / 0 fail (pairs×modes) | `gates/token-contract.txt` |
| static gates (contrast) | PASS | `gates/static-gates.json` |
| structural output floor | PASS (all checks) | `gates/output-floor.json` |
| `verify_responsive` 280/320/414 | PASS | `gates/verify_responsive.json` |
| `verify_states` light+dark | PASS — 8 controls/mode, 0 failures | `gates/verify_states.json` |
| `verify_targetsize` 375×812 | PASS — 8 targets, 0 failures | `gates/verify_targetsize.json` |
| `verify_focustrap` | not-applicable pass (no dialog) | `gates/verify_focustrap.json` |
| honesty Gate A (derived claims, both modes) | PASS — 36 allowed numbers, 0 violations | `gates/gate-a-derived-claims.json` |
| honesty Gate B (content manifest, both modes) | PASS — 27/27 required items | `gates/gate-b-manifest.json` |
| axe (per render cell) | 0 serious / 0 critical × 4 cells | `renders/render.json` |
| mode fidelity | ok × 4 cells | `renders/render.json` |

The 8 measured interactive controls are the new affordances (skip link, 4
jump stamps, 2 notice anchors, back-to-top) — every one passes state-aware
contrast in both modes and WCAG 2.2 target size.

## Before / after renders

- Before (winning candidate as judged): `../project/renders/trail-ledger__{desktop,mobile}__{light,dark}.png`
- After (this pass): `renders/trail-ledger-r2__{1440w,375w}__{light,dark}.png`

## Records

- `pixelhelm/run@1` for this pass: `../project/.pixelhelm/runs/2026-07-26--trail-conditions-pass2--run.json`
  (written via `records.mjs write run`, append-only store).
- `signoff@1` for this pass: **deliberately not written** — the owner has not
  yet seen the revision; sign-off happens at owner review.

## Execution decisions (complete list)

- Owner-directed status strip supersedes the tournament-stage "no legend
  block" motif budget for this arm (owner is the final judge); the sealed
  DIRECTIONS sheet is untouched and the deviation is recorded here and in
  `PLAN.md`.
- Render cell names use the flag-driven `{width}w` convention
  (`trail-ledger-r2__1440w__light.png`) rather than the original run's named
  viewports; the matrix (1440×900 / 375×812 × light/dark) is identical.
- Browser work deliberately deferred until the three E3 sessions finished
  (machine-load instruction); browser-free gates ran first and were committed
  separately.
