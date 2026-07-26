# E1 run report — 2026-07-26 (sealed Kestrel Ridge utility brief)

**E1 verdict: the complete evidenced loop ran end-to-end with zero
improvisation outside the documented process.** Every stage has committed
artifacts; the panel verdict and run records validate through `records.mjs`
(a panel whose record does not validate did not happen — these do). All
judged scores below are **system-esteem** (RF-1/RF-4): conformance to the
pre-registered rubric as judged by model jurors, not user-outcome evidence.

## Loop trail (each stage committed as it happened)

1. **Admission** — ChoiceGate continuation admitted against the re-accepted
   v0.2.1 authority: `admitted: true`, edition `pixelhelm-lite`
   (`admission/`, sha256 `5afa59d7…c10226`).
2. **Ground** — register, content authority, machine floor, registry state
   (`ground/GROUND.md`).
3. **Directions** — three arms with frozen one-sentence intents + A1
   declared-breaks blocks, committed before any candidate code existed
   (`directions/DIRECTIONS.md`).
4. **Candidates** — all three full arms committed (winner and losers):
   `trail-ledger`, `status-board`, `first-light` (`project/arms/`). One
   pre-freeze palette tuning pass (declared-allowed) separated two warm
   color worlds after an early ΔE00 check read 7.02; recorded in the git log.
5. **Render** — 12 cells (desktop/mobile × light/dark), mode-fidelity ok on
   all, axe 0 serious / 0 critical on all (`project/renders/`).
6. **Gates** — every shipped HARD gate green for all three arms:
   token-contract AA recompute, structural output floor, static contrast,
   `verify_responsive` (280/320/414), `verify_states` (both modes),
   `verify_targetsize`, `verify_focustrap` (no dialog — not-applicable pass),
   honesty Gate A (9 blocks scoped) and Gate B (`project/gates/`).
7. **Mutant ritual** — 4/4 planted lies fired (FABRICATION, ASSOCIATION,
   VERDICT, MISSING) on never-committed scratch copies; unmutated arms clean
   (`project/honesty/mutant-ritual/RITUAL.md`).
8. **Panel** — 5 blind model jurors, fresh contexts, shuffled neutral labels
   (seeds in `divergence/blind-map.json`); inputs exactly per the sealed
   evaluator rule + the A1 declared-breaks blocks (A1 makes them criterion
   8's evidence). Raw per-juror JSONs: `jurors/raw/`. Aggregation per the
   registered rule: `jurors/panel-results.json`.
9. **Repair** — not triggered: no Layer-1 failure and no [Blocker]; panel
   advisory findings recorded in the verdict's constraints (the loop spends
   iterations only on machine failures/blockers).
10. **Records** — `pixelhelm/judge-verdict@1` + ledger line +
    `pixelhelm/run@1` written and validated via `records.mjs`
    (`project/.pixelhelm/`). `signoff@1` deliberately NOT written: the owner
    has not yet spoken on the artifact; sign-off happens at owner review.

## Panel result (system-esteem)

| arm | overall median | min criterion median | criteria at 9+ |
|---|---|---|---|
| **trail-ledger** (winner) | **9.0** | 8 | 6 of 10 |
| first-light | 9.0 | 8 | 6 of 10 |
| status-board | 8.0 | 6 | 2 of 10 |

The top two arms tied on every registered aggregate; the winner was decided
by the mechanical five-stage tie-break documented in `jurors/TIEBREAK.md`
(stage (e): per-juror preference, 2–1 with two jurors tied). **Owner PASS
bar: MET, and tie-invariantly** — gates precondition green + mutant ritual
recorded; no criterion median below 6 (winner's minimum: 8); overall median
9.0 ≥ 8. Tier-3 (9+) criterion medians are claimable as system-esteem
signals only.

## E2 divergence report (registered threshold → measured, no reframing)

| metric | registered threshold | measured | verdict |
|---|---|---|---|
| (a) palette ΔE00, every arm pair (light-mode tokens, declared pre-measurement) | mean matched ΔE00 ≥ 10.0 | 27.005 / 18.954 / 11.560 | PASS |
| (b) layout class | no two arms share a class | list-ledger / grid-first / split-hero, each unanimous 5–0 | PASS |
| (c) motif Jaccard, every arm pair | J ≤ 0.40 | 0.25 / 0.25 / 0.143 | PASS |
| (d) fingerprint registry | zero arms match any active signature | zero matches (code + rendered computed styles); seed sha256 `bc12f903…` recorded; live registry absent at run time (recorded) | PASS |
| (e) blind-intent assignment | ≥ 3 of 5 judges fully correct | 5 of 5 | PASS |

**E2: not falsified — every registered threshold met.** Scope honesty carried
from the sheet: this shows measured difference between arms; the stronger
"meaningful creative divergence" property is only probed by E5. Secondary
chromatic-only ΔE00 (recorded, no threshold): 10.903 / 11.454 / 18.864.

## Deviations & execution decisions (complete list)

- **Winner tie-break** — not registered; fixed mechanically at aggregation
  time before computing whom it favors (`jurors/TIEBREAK.md`).
- **Palette-metric mode** — the sealed sheet doesn't name a color mode; the
  committed script declared light-mode binding (dark reported as context)
  before any measurement.
- **A1 juror inputs** — the sealed evaluator rule lists rubric/brief/data/
  renders/gate outputs; Amendment A1 makes the declared-breaks blocks
  criterion 8's evidence, so they were included (neutral-labeled) as juror
  input. Reading documented here.
- **No extreme-content render variants** — substitutions would inject
  non-sealed strings; the sealed data is the only content authority.
- **Pre-freeze palette tuning** — declared in DIRECTIONS.md before building;
  used once, before any render/score existed.

## What may be claimed

The complete artifact trail exists; gates fire correctly (mutant ritual
recorded); the panel produced a validated verdict with recorded per-juror
scores — **E1's own success criterion is met**. The winner clears the owner
PASS bar (system-esteem). No user-outcome claim is made or permitted from
this run. Owner sign-off (and any promotion) remains pending and owner-gated.
