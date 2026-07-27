# E3 run report — 2026-07-26 (sealed Foxglove & Fern small-commerce brief)

**E3 (commerce archetype) verdict: the complete evidenced loop ran end-to-end
on an unfamiliar archetype with zero improvisation outside the documented
process, and the outputs did NOT regress to the utility register.** Every
stage has committed artifacts; the panel verdict and run records validate
through `records.mjs` (a panel whose record does not validate did not happen —
these do). All judged scores below are **system-esteem** (RF-1/RF-4):
conformance to the pre-registered rubric as judged by model jurors, not
user-outcome evidence — and per **Amendment C1** every 9+ median is recorded
as *"strong, owner-verify"*, never as achieved distinctive excellence.

Two linked surfaces per arm (the transfer test's new demand): the catalog
page and the product page for SKU FF-011, built and judged as one system.

## Loop trail (each stage committed as it happened)

1. **Admission** — ChoiceGate continuation admitted against the public
   v0.2.1 authority pinned in `src/family.json` (`admitted: true`, edition
   `pixelhelm-lite`; `admission/`, sha256 `6da4b70d…e6487`).
   `admit_choicegate.py` untouched.
2. **Ground** — register, content authority + honesty traps, binding display
   conventions, machine floor, registry state, prior-state read (E1
   calibration lesson consumed; its effect already sealed as Amendment C1)
   (`ground/GROUND.md`).
3. **Directions** — three arms with frozen one-sentence intents + A1
   declared-breaks blocks, committed before any candidate code existed;
   breaks confined to the brand layer, never checkout-adjacent mechanics
   (`directions/DIRECTIONS.md`).
4. **Candidates** — all three full arms committed (winner and losers), each
   with BOTH surfaces: `seed-annual`, `packet-rack`, `sowing-almanac`
   (`project/arms/`). Two pre-freeze layout tunes (declared-allowed, before
   any score existed) recorded in the git log.
5. **Render** — 24 cells (3 arms × 2 surfaces × desktop/mobile ×
   light/dark), mode-fidelity ok on all 24, axe 0 serious / 0 critical on
   all 24 (`project/renders/`).
6. **Gates** — every shipped HARD gate green for all three arms on BOTH
   surfaces: token-contract AA recompute (identical contract embedded in
   both surfaces of each arm), structural output floor, static contrast
   orchestrator, `verify_responsive` (280/320/414), `verify_states` (both
   modes, zero fails and zero needs-review), `verify_targetsize`,
   `verify_focustrap` (no dialog — explicit not-applicable pass per
   surface), honesty Gate A (8 product blocks, 53 allowed numbers) and
   Gate B (39-item catalog manifest / 19-item product manifest)
   (`project/gates/`).
7. **Mutant ritual** — 4/4 planted lies fired (FABRICATION via the
   registered £ context, ASSOCIATION, VERDICT on the out-of-stock block,
   MISSING) on never-committed scratch copies; unmutated arms clean
   (`project/honesty/mutant-ritual/RITUAL.md`).
8. **Panel** — 5 blind model jurors, fresh contexts, shuffled neutral labels
   (seeds in `jurors/blind-map.json`), both surfaces shown together per arm;
   renders staged under neutral filenames so labels could not leak; inputs
   exactly per the sealed evaluator rule + the A1 declared-breaks blocks.
   Raw per-juror JSONs: `jurors/raw/`. Aggregation per the registered rule:
   `jurors/panel-results.json`.
9. **Repair** — not triggered: no Layer-1 failure and no [Blocker]; panel
   advisory findings recorded in the verdict's constraints.
10. **Records** — `pixelhelm/judge-verdict@1` + ledger line +
    `pixelhelm/run@1` written and validated via `records.mjs`
    (`project/.pixelhelm/`). `signoff@1` deliberately NOT written: sign-off
    happens at owner review.

## Panel result (system-esteem; C1 reading applies)

| arm | overall median | min criterion median | criteria at 9+ (strong, owner-verify) |
|---|---|---|---|
| **packet-rack** (winner) | **9.0** | 8 | 7 of 10 |
| seed-annual | 9.0 | 7 | 7 of 10 |
| sowing-almanac | 9.0 | 7 | 7 of 10 |

All three arms tied at 9.0 overall — a genuine three-way top tie. The winner
was decided by the mechanical hierarchy committed for E1 and reused as
precedent (`jurors/TIEBREAK.md`): stage (a), higher minimum criterion
median, is decisive — packet-rack is the only arm with no criterion median
below 8. **Owner PASS bar: MET, and tie-invariantly** — gates precondition
green + mutant ritual recorded; no criterion median below 6 (winner's
minimum: 8); overall median 9.0 ≥ 8; all three tied arms clear every clause.
Per Amendment C1, the 9.0 overalls and every 9+ criterion median are
recorded as **"strong, owner-verify"** — the owner's verification pass is
the binding read at the top of the scale (E1 calibration: the panel ran
≈1 point hot against the owner).

## Archetype falsification check (the point of E3)

The sealed brief falsifies this archetype if outputs regress to the utility
register (a seed *status dashboard* instead of a shop) or floor failures
cluster here. Neither occurred: zero floor failures across 3 arms × 2
surfaces × every shipped gate, and the juror record describes three
shop-true registers (printed annual / counter rack / potting-bench almanac)
with the money path "ruthlessly conventional" in all three — the wow budget
stayed in voice and botanical art direction as the brief demands. All four
data honesty traps (stock 0, null price, estimated germination, UK-only
shipping) verified handled on every arm by gates AND by jurors against the
sealed data. **Not falsified; the E3-commerce success condition (both
surfaces clear the floor battery and the winner clears the bar) is met.**

## No E2 divergence measurement

Per the E3 protocol, divergence (E2) was not re-measured: no palette ΔE00,
layout-class, motif-Jaccard, fingerprint-registry, or blind-intent runs. The
fingerprint-seed consequence (no banned cluster in any arm) was still
enforced by the static gates' anti-cliché walk.

## Deviations & execution decisions (complete list)

- **Winner tie-break** — the sealed sheet registers no tie-break; the
  three-way 9.0 tie was broken by reusing E1's committed mechanical
  hierarchy verbatim (fixed before this panel existed), with stage values
  recorded (`jurors/TIEBREAK.md`). PASS is tie-invariant.
- **A1 juror inputs** — as in E1, the declared-breaks blocks are criterion
  8's evidence and were included (neutral-labeled) as juror input.
- **Juror blinding of render filenames** — committed render files carry arm
  names, so each juror received copies staged under neutral candidate
  filenames outside the repo; the seeded blind map records the per-juror
  order.
- **Gate A currency scope** — the shipped money regex is $-scoped; a
  registered `extraNumericContexts` pattern covers £ amounts against
  FABRICATION (proven live by mutant m1). Per-block £ ASSOCIATION is not
  machine-covered by the shipped gate; recorded honestly in GROUND.md and
  RITUAL.md, with Gate B requiring each product's own price inside its own
  block as partial compensation.
- **`verify_focustrap` invocation** — the script accepts a single target, so
  it ran once per surface (all other browser validators took both surfaces
  in one invocation).
- **No extreme-content render variants** — substitutions would inject
  non-sealed strings; the sealed data is the only content authority (the
  long real names already exercise wrap behavior).
- **Pre-freeze tuning** — two layout tunes (packet-rack 4-up shelves;
  facts-lines wrapping as units) declared and committed before any render
  was scored; no tuning after scores existed.
- **Path hygiene** — all committed gate/mutant outputs redacted to
  `%USERPROFILE%` (including JSON-escaped variants); gate-profile roots are
  written relative to the profile file, so no machine path was ever emitted.

## What may be claimed

The complete artifact trail exists on a second archetype with a two-surface
demand; gates fire correctly here too (4/4 mutant ritual recorded on this
project's own configs); the panel produced a validated verdict with recorded
per-juror scores — **E3-commerce's own success criterion is met and its
falsification conditions did not trigger**. The winner clears the owner PASS
bar (system-esteem; all 9+ readings are "strong, owner-verify" under
Amendment C1). Scope honesty per the pre-registration: passing this brief
covers the commerce archetype only; the saas and editorial archetypes are
separate E3 runs, and portfolio and product-application remain untested and
unclaimable. No user-outcome claim is made or permitted from this run. Owner
sign-off (and any promotion) remains pending and owner-gated.
