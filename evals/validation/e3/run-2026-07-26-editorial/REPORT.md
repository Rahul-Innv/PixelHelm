# E3 editorial run report — 2026-07-26 (sealed "The Season That Moved" data-narrative brief)

**E3-editorial verdict: the complete evidenced loop ran end-to-end on an
unfamiliar archetype with zero improvisation outside the documented process.**
Every stage has committed artifacts; the panel verdict and run records
validate through `records.mjs` (a panel whose record does not validate did not
happen — these do). All judged scores below are **system-esteem** (RF-1/RF-4):
conformance to the pre-registered rubric as judged by model jurors, not
user-outcome evidence. Per **Amendment C1** (owner-approved, pre-generation),
every criterion or overall median of 9+ in this report reads as **"strong,
owner-verify"** — never as achieved distinctive excellence; the owner's
verification pass is the binding read at the top of the scale.

## Loop trail (each stage committed as it happened)

1. **Admission** — ChoiceGate continuation admitted against the re-accepted
   v0.2.1 authority: `admitted: true`, edition `pixelhelm-lite`
   (`admission/`, sha256 `094c6c9d…9ce54`).
2. **Ground** — register, content authority (sealed data sha256
   `68f8c940…386a44`), machine floor incl. the brief's binding accessibility
   bar, registry state, honesty-gate binding (`ground/GROUND.md`).
3. **Directions** — three arms with frozen one-sentence intents + A1
   declared-breaks blocks, committed before any candidate code existed
   (`directions/DIRECTIONS.md`): `almanac-rail`, `weir-plates`, `two-inks`.
4. **Candidates** — all three full arms committed (winner and losers):
   `project/arms/`. Derived numbers only via the committed injector
   (`scripts/inject.mjs` → `data/derived.json`); chart geometry generated
   deterministically from the sealed data by the committed
   `scripts/make-charts.mjs` (every coordinate a pure linear mapping).
   Pre-freeze machine-floor tuning (declared-allowed): plate legibility
   (key chips to a top row, wider left margin, in-plot mean labels dropped in
   favor of figcaption + keyed notes) and two dark-mode `rule` tokens
   raised to clear the 3.0 graphic-contrast recompute; recorded in the git log.
5. **Render** — 12 cells (desktop/mobile × light/dark), mode-fidelity ok on
   all, axe 0 serious / 0 critical on all (`project/renders/`).
6. **Gates** — every shipped HARD gate green for all three arms:
   token-contract AA recompute, structural output floor, static contrast,
   `verify_responsive` (280/320/414), `verify_states` (both modes),
   `verify_targetsize`, `verify_focustrap` (no dialog — not-applicable pass),
   honesty Gate A (34 year blocks scoped, both modes) and Gate B (17 required
   items, both modes) (`project/gates/`).
7. **Accessibility bar (precondition, demonstrably met)** — every chart is a
   named, described element whose accessible name/figcaption states the actual
   finding (axe-verified names; descriptions in the committed HTML); the full
   story's conclusion, the method caveat, and the scope note sit in plain text
   inside the FIRST mobile viewport on all three arms (verified against the
   375×812 renders); keyboard traversal reaches everything interactive
   (focusable, labeled table-scroll regions; visible focus styles; axe
   serious/critical = 0). No scrollytelling exists on any arm — the base page
   is the only path, with `prefers-reduced-motion` parity on the one entrance
   fade.
8. **Mutant ritual** — 4/4 planted lies fired (FABRICATION, ASSOCIATION,
   VERDICT, MISSING) on never-committed scratch copies; unmutated arms clean
   (`project/honesty/mutant-ritual/RITUAL.md`).
9. **Panel** — 5 blind model jurors, fresh contexts, shuffled neutral labels
   (seeds in `jurors/blind-map.json`); inputs exactly per the sealed evaluator
   rule + the A1 declared-breaks blocks (A1 makes them criterion 8's
   evidence), renders presented under neutral candidate names. Raw per-juror
   JSONs: `jurors/raw/`. Aggregation per the registered rule:
   `jurors/panel-results.json`.
10. **Repair** — one targeted machine-repair round inside the loop's cap:
    the first render pass surfaced axe `scrollable-region-focusable`
    (serious) on the two table-carrying arms; fixed (focusable, labeled
    scroll regions) and re-verified clean. No further Layer-1 failure and no
    [Blocker]; panel advisory findings recorded in the verdict's constraints.
11. **Records** — `pixelhelm/judge-verdict@1` + ledger line +
    `pixelhelm/run@1` written and validated via `records.mjs`
    (`project/.pixelhelm/`). `signoff@1` deliberately NOT written: the owner
    has not yet spoken on the artifact; sign-off happens at owner review.

## Panel result (system-esteem; C1 reading applies)

| arm | overall median | min criterion median | criteria at 9+ (strong, owner-verify) |
|---|---|---|---|
| **weir-plates** (winner) | **9.0** | 8 | 7 of 10 |
| two-inks | 9.0 | 8 | 6 of 10 |
| almanac-rail | 9.0 | 7 | 6 of 10 |

All three arms tied at overall median 9.0; the winner was decided by the
mechanical hierarchy documented in `jurors/TIEBREAK.md` (E1's five-stage rule
adopted verbatim — committed before this run began): stage (a) eliminated
almanac-rail (min 7 vs 8/8), stage (b) separated weir-plates from two-inks
(7 vs 6 criteria at median ≥ 9). **PASS bar: MET, and tie-invariantly** —
gates + ritual + accessibility-bar precondition green; no criterion median
below 6 (winner's minimum: 8); overall median 9.0 ≥ 8; all three arms clear
the bar, so the quality claim does not depend on the tie-break.

**The panel's sharpest finding (recorded as the verdict's constraint):** four
of five jurors independently docked `almanac-rail`'s chart integrity for the
same defect — season-total bars LENGTH-encoded from a 550 mm baseline, so a
real 14% rise reads as several-fold longer bars — and three read it as an
undeclared convention break (criterion 2 median 7, criterion 8 median 7).
The scale is disclosed and the honesty gates are green (advisory, not
blocker), and `weir-plates`' position-encoded dots on the same disclosed
scale drew no such finding. This is the anti-imitation rubric doing its job
on encoding honesty, and it is exactly the kind of finding the archetype
transfer test exists to surface.

## Archetype falsification check (from the sealed brief)

**Not falsified.** The registered failure modes did not occur: no arm
regressed to the utility register (no dashboard grammar — each arm is a
long-form narrative whose charts serve prose), and floor failures did not
cluster here (single axe finding, repaired; all HARD gates green on all
arms). The anti-Snow-Fall criterion (10) carried median 9 on all three arms:
no scroll effects exist at all — every device traces to the dataset.

## Deviations & execution decisions (complete list)

- **Winner tie-break** — not registered; E1's committed five-stage hierarchy
  applied verbatim (fixed before any E3 value existed); all stage values
  recorded, including that stage (c), had the order differed, favored
  two-inks (`jurors/TIEBREAK.md`, `tiebreak.json`).
- **Admission driver inventory read** — component contents read from the
  pinned inventory commit's object store (`git show <commit>:<path>`) rather
  than the working tree; byte-identical binding, fingerprint assert
  unchanged and fail-closed (`admission/driver.py`).
- **A1 juror inputs** — as in E1: the declared-breaks blocks are criterion
  8's evidence, so they were included (neutral-labeled) as juror input.
- **No extreme-content render variants** — substitutions would inject
  non-sealed strings; the sealed data is the only content authority.
- **Era definitions for the injected means** — fixed in the committed
  injector before any candidate existed: first era = 1990–1994 (all manual
  gauge), recent era = the last five VERIFIED years (2018 + 2020–2023),
  2019 excluded from every mean because of its unverified flag; every use of
  a cross-era mean carries the method-change disclosure.
- **Gate-profile roots** — written profile-dir-relative (`../arms/<arm>`)
  from the start: satisfies the E1 path-hygiene law while keeping the
  profiles re-runnable from any checkout.
- **Pre-freeze tuning** — declared-allowed machine-floor tuning only (axe
  repair, AA token values, plate label collisions), all before any juror
  saw any render; nothing changed after scores existed.
- **No E2 divergence measurement** — per the run instruction; E3 measures
  archetype transfer, not inter-arm divergence.

## What may be claimed

The complete artifact trail exists; gates fire correctly (mutant ritual
recorded); the panel produced a validated verdict with recorded per-juror
scores — **E3-editorial's own success criterion is met: the loop transferred
to an unfamiliar archetype without improvisation.** The winner clears the
owner PASS bar (system-esteem; all 9+ medians read as strong-owner-verify
under Amendment C1, with E1's ≈1-point-hot calibration in mind). Scope
honesty: with E1 (utility) and this run (editorial), passing evidence now
covers two archetypes; the saas and commerce arms of E3 are separate runs,
and portfolio/product-application remain untested and unclaimable. No
user-outcome claim is made or permitted from this run. Owner sign-off (and
any promotion) remains pending and owner-gated; `signoff@1` is deliberately
absent until the owner speaks.
