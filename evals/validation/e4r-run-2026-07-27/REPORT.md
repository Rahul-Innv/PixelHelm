# E4-R run report — re-validating the judging seat after the R1+R2 repair

Run date: 2026-07-27. Sealed protocol: `evals/validation/PREREG-E4-CALIBRATION.md`
(untouched) plus `evals/validation/PREREG-E4R-ADDENDUM.md` (sealed at commit
`b844352`, before any E4-R plant existed). Repair under test:
`evals/validation/E4-JUDGING-SEAT-REPAIR-DECISION.md` (R1 + R2), implemented at
commit `c0d4a08`. Prior run: `evals/validation/e4-run-2026-07-26/REPORT.md`.

## Verdict against the registered thresholds (no reframing)

| Registered threshold (verbatim from the sealed sheet) | Measured value | Verdict |
|---|---|---|
| Agreement: Kendall's tau between the internal panel's candidate ranking and the external panel's aggregate ranking, pooled over the four judged sets (12 ranked pairs, real candidates only, tau-b for ties). **Threshold: τ ≥ 0.5.** | **τ-b = 0.378** (C=2, D=0, n0=12, tied-internal n1=8, tied-external n2=5; (C−D)/√((n0−n1)(n0−n2)) = 2/√28) | **FAIL** |
| Inflation: mean(internal overall median − external overall median) per candidate, pooled. **Acceptable bound: \|inflation\| ≤ 1.5 points.** | **+0.875** (12 real candidates; every non-zero term is internal-hotter) | **PASS** |
| Adversarial seed: **every planted flaw is caught** — the plant may not win any set, and at least one juror (or the floor battery, which runs on plants too) must surface its defect class. | Floor battery hard-failed **4 of 4** plants on exactly their registered gate; **0 of 4** plants entered any external ranking, so none won or tied for top. Jurors additionally named the failing gate for the plant **20 of 20** times. | **PASS** |

**Success/falsification clause, applied verbatim:** "Falsified if: τ below
threshold, inflation beyond bound, or any planted flaw wins — the internal
judging seat is then demoted to advisory-only until repaired, and no Tier-3
claim may rest on internal scores alone."

**E4-R outcome: FALSIFIED on the agreement criterion.** τ-b measured 0.378
against a registered floor of 0.5. The clause is disjunctive, so the inflation
and plant criteria passing does not soften it. **The standing advisory-only
demotion therefore is not lifted by this run.** Lifting it was never this run's
to decide in any case (addendum, success/falsification section), but E4-R does
not even present the coordinator with a passing sheet.

### What the failure is, stated precisely

**Zero discordant pairs.** Across all 12 pooled ranked pairs, the external
panel never inverted an internal ordering: C=2, D=0. The shortfall is entirely
a loss of *resolvable* agreement — 8 of 12 pairs are tied on the internal side
(the internal panels scored almost everything at overall median 9) and 5 of 12
are tied on the external side, leaving only 2 pairs on which both panels
expressed a direction, and both of those agreed.

For comparison with the prior run under the same formula: E4 measured C=4,
D=0, n1=8, n2=2 → τ-b = 0.632. E4-R measured C=2, D=0, n1=8, n2=5 → 0.378. The
internal side is identical (the same committed internal panels, n1=8 both
times). What changed is the external side: this external panel produced more
ties (5 vs 2) and fewer directional agreements (2 vs 4).

**This report does not claim to know why.** Candidate explanations that the
committed artifacts are consistent with — a different external panel drawing
finer distinctions, the R2 floor outputs flattening the field by removing
gate-adjacent differentiators from the taste conversation, or simple
panel-to-panel variance on a 12-pair statistic — are not separable from these
artifacts alone. τ-b on 12 pairs with 8 internal ties is a low-resolution
instrument, and that is a property of the registered statistic, which the
addendum deliberately did not change.

## The four sets: internal vs external

External aggregation used the same registered rule as every prior run
(per-criterion median of 5 jurors; overall = median of the 10 criterion
medians; no means, no weights). Internal values are the committed
`panel-results.json` of each judged run; external values are this run's
`jurors/<set>/panel-results.json`. Plants are excluded from τ and inflation by
the sealed sheet, and under R1 they are excluded from the ranking entirely.

### Set 1 — e1/run-2026-07-26 (utility, plant: stone-steps)

| Candidate | Internal overall | External overall | External rank |
|---|---|---|---|
| trail-ledger (internal winner) | 9.0 | 8.0 | 1 (three-way tie) |
| status-board | 8.0 | 8.0 | 1 (three-way tie) |
| first-light | 9.0 | 8.0 | 1 (three-way tie) |
| **stone-steps (PLANT)** | — | **UNSCORED** | not ranked — `verify_responsive` FAIL |

The external panel tied all three real candidates at 8.0, so both of this set's
directional internal pairs became tied-external. This set contributes 0
concordant and 0 discordant pairs.

### Set 2 — e3/run-2026-07-26-saas (SaaS marketing, plant: job-sheet)

| Candidate | Internal overall | External overall | External rank |
|---|---|---|---|
| fair-quote | 9.0 | 8.5 | 1 |
| worked-invoice (internal winner) | 9.0 | 8.0 | 2 |
| driveway-to-paid | 8.0 | 7.0 | 3 |
| **job-sheet (PLANT)** | — | **UNSCORED** | not ranked — `output-floor-gate` FAIL |

Both of this set's directional pairs are concordant; these are the only two
concordant pairs in the pooled statistic.

### Set 3 — e3/run-2026-07-26 (commerce, both surfaces, plant: glass-house)

| Candidate | Internal overall | External overall | External rank |
|---|---|---|---|
| packet-rack (internal winner) | 9.0 | 8.0 | 1 (tied) |
| sowing-almanac | 9.0 | 8.0 | 1 (tied) |
| seed-annual | 9.0 | 7.0 | 3 |
| **glass-house (PLANT)** | — | **UNSCORED** | not ranked — `verify_focustrap` FAIL (catalog) |

All three internal pairs are tied internally (all 9.0), so this set contributes
no concordant or discordant pairs regardless of what the external panel said.

### Set 4 — e3/run-2026-07-26-editorial (editorial, plant: gauge-house)

| Candidate | Internal overall | External overall | External rank |
|---|---|---|---|
| almanac-rail | 9.0 | 9.0 | 1 |
| two-inks | 9.0 | 8.0 | 2 (tied) |
| weir-plates (internal winner) | 9.0 | 8.0 | 2 (tied) |
| **gauge-house (PLANT)** | — | **UNSCORED** | not ranked — `verify_states` FAIL |

Same as commerce: all three internal pairs are tied internally, so this set
contributes nothing to C or D.

## Inflation detail (pooled mean +0.875)

Per-candidate terms (internal − external): trail-ledger +1.0, status-board 0,
first-light +1.0, worked-invoice +1.0, fair-quote +0.5, driveway-to-paid +1.0,
packet-rack +1.0, sowing-almanac +1.0, seed-annual +2.0, almanac-rail 0,
weir-plates +1.0, two-inks +1.0. Every non-zero term is internal-hotter. One
term (seed-annual, +2.0) individually exceeds the 1.5 bound; the registered
statistic is the **pooled mean**, which is +0.875 and passes, and the
individual term is reported here rather than being smoothed away. The pooled
figure is up from E4's +0.625, i.e. this external panel sat slightly further
below the internal panels than the last one did.

## The plant criterion under R1 (recorded honestly)

Each plant carried exactly ONE planted floor defect, in a class registered in
the addendum before any plant was authored and distinct from all four E4
classes. Each plant's committed battery shows exactly one hard-failing gate,
and it is the registered one:

| Set | Plant | Registered class | Gate | Measured |
|---|---|---|---|---|
| e1-utility | stone-steps | reflow overflow (WCAG 2.2 1.4.10) | `verify_responsive` | FAIL: 56px overflow at 280px, 16px at 320px; clean at 414px |
| e3-saas | job-sheet | structural output floor | `output-floor-gate` | FAIL: no `main` landmark, h1→h3 skip, 5 heading impostors |
| e3-commerce | glass-house | keyboard trap (WCAG 2.1.2) | `verify_focustrap` | FAIL: Escape does not close the dialog; focus never returns to the trigger |
| e3-editorial | gauge-house | interactive state contrast (WCAG 1.4.3 / 1.4.11) | `verify_states` | FAIL: hover and focus at 1.91:1 against a 4.5:1 threshold, light mode |

**What this criterion does and does not prove.** Under R1 the floor battery
eliminates a failing candidate before any esteem score exists, so "the plant
may not win any set" is satisfied *by construction of the repair*, not by juror
perceptiveness. The sealed threshold's own disjunction anticipates this — "at
least one juror **or the floor battery**" — and the floor battery limb is the
one satisfied here. Stated plainly: this criterion validates the mechanical
enforcement of the precondition and the floor seat behind it. It says nothing
about whether jurors could have seen these defects unaided, and none of these
four defects is visible in any committed render (the reflow clears at both
rendered viewports, the structural defect is markup-only, the dialog is closed
on load, and the contrast failure exists only in hover and focus states).

**Separately measured, as registered (addendum (d) item 4): does the seat honor
the precondition when handed the evidence?** Each plant WAS placed in the juror
input set with its failing gate outputs, and each juror was asked to mark any
floor-failing candidate UNSCORED and leave it out of the ranking.

- **20 of 20 jurors** marked the plant `"unscored": true` and excluded it from
  their ranking.
- **20 of 20** named the correct failing gate.
- **0 of 20** scored a floor-failing candidate; **0 of 20** wrongly withheld a
  score from a floor-clean candidate.

This is the direct behavioral contrast with E4, where five render-only jurors
rated a candidate carrying a real 3.12:1 contrast failure at the top of its set
and none surfaced the defect. It is reported as evidence about the seat and is
used in **no** statistic: the exclusion that decides the criterion is computed
by the committed script from the gate records, never from juror discretion.

## Scope honesty (carried verbatim from the sealed sheet)

> Agreement between two model-panel contexts sharing one constructed standard
> measures *inter-context consistency of that standard*, NOT validity against
> real audiences — only E5/Stage-12 data speak to that. Catching planted floor
> defects validates the floor seat, not creative ranking. Both limits carry
> into any report of E4 results.

Plus the two limits the addendum added, which bind this report equally: (1)
R1+R2 repair the seat's blindness to *measured* defects only, and do nothing
for defects no gate measures (taste, register fit, content quality), which
remain owner-judged; (2) with R1 in force a floor-caught plant never reaches
the ranking, so the plant criterion tests the precondition's enforcement, not
juror perceptiveness.

Applied to this run: the failing τ says the constructed standard did **not**
travel across contexts at the registered resolution on this run; it says
nothing about real audiences either way. The passing plant criterion validates
the floor seat and the R1 machinery; it does not validate creative ranking.

## Method (what each juror actually received, and how it is evidenced)

- **Inputs per juror, exactly:** the Phase-1 dossier's tier definitions, copied
  verbatim with provenance (reused byte-for-byte from
  `../e4-run-2026-07-26/jurors/TIER-DEFINITIONS-VERBATIM.md`); the set's sealed
  rubric sheet verbatim; the renders of 4 candidates (3 real + 1 plant) under
  neutral shuffled labels; and — **the one R2 change to the sealed input list** —
  each candidate's Layer-1 floor outputs, quoted from the committed gate records
  themselves, with the gates that did not run named explicitly. No PixelHelm
  docs, no knowledge of which candidate the system preferred, no internal
  scores, no sealed data files.
- **Blinding of the floor outputs.** The gate records quote their own target
  paths, which carry the candidate's real arm name. `build-panels.mjs` withholds
  every file path inside a digest, so the juror sees each gate's name, verdict
  and findings but not the candidate's identity. A leak scan over all 20
  transcripts found no candidate name and no unblinded path.
- **Blindness:** fresh-context subagents, one per juror, with no sight of each
  other, of this report, of the addendum, or of the plant note. Per-juror
  Fisher-Yates shuffles (mulberry32), seeds `202607711`–`202607730` as
  registered, disjoint from E4's `202607611`–`202607645`.
- **Verbatim-input evidence:** each juror's full input transcript is committed
  (`jurors/<set>/juror-N-transcript.md`) and its sha256 is carried inside every
  one of that juror's records. Because the transcript carries the floor outputs,
  that hash covers them (R2). Delivery mechanism: a fixed bootstrap prompt
  (committed verbatim, `jurors/BOOTSTRAP-PROMPT.txt`) pointed each juror at its
  transcript; the juror's complete input = bootstrap + transcript + the listed
  render files. The neutral-named render copies are byte-identical duplicates of
  committed renders, bound file-by-file by sha256 in
  `jurors/<set>/blind-manifest.json`; the duplicates lived untracked at the repo
  root during judging (committing 5 copies of every render would add ~160 MB of
  duplicated binaries, as recorded in the E4 run).
- **Per-juror records:** 60 schema-valid `pixelhelm/juror-record@1` files (one
  per juror per SCORED candidate) written via
  `plugins/pixelhelm-lite/skills/pixelhelm-loop/scripts/records.mjs` into
  `.pixelhelm/jurors/`; the writer validated all 60 with zero refusals. An
  R1-UNSCORED candidate gets no juror record by design (close-the-loop.md, as
  amended by the repair), which is why the count is 60 and not 80.
- **Raw outputs:** each juror's final message is committed verbatim under
  `jurors/<set>/raw/` (one juror prefixed a prose line before its JSON; the file
  keeps it, parsers tolerate it).
- **Plants:** authored after the addendum was sealed; page identity asserted by
  explicit `file://` URL in fresh contexts before any render or measurement
  (L-081, `plants/identity.json`); floor battery = the same committed gates and
  honesty configs the sets' real arms faced, run as-produced by
  `plants/scripts/run-plant-battery.mjs`, all outputs committed under
  `plants/<set>/gates/`, path-redacted. Sealed note's sha256 committed before
  any judging (commit `91e25ab`); note text committed only after all verdicts,
  hash re-verified at commit time.
- **Statistics:** `stats/compute-e4r-stats.mjs`, committed and cited by sha256
  in the run record (`.pixelhelm/runs/2026-07-27--e4r-external-calibration--run.json`),
  results in `stats/stats-results.json`.

## Deviations and honest notes (complete list)

1. **Batteries were run twice; the committed run is the second.** During
   authoring, each plant's battery was run once before the L-081 identity
   assertion existed. The identity assertion was then made, and every battery
   was re-run and overwritten, so the committed gate outputs all post-date the
   identity assertion, as method law requires. The discarded first-pass outputs
   agreed with the committed ones on every gate.
2. **Plants reuse their set's proven-clean token contract.** Each plant embeds a
   palette already proven AA-clean in a committed run (the E1/E3 winner's
   contract for e1-utility, e3-commerce and e3-editorial; the E4 saas plant's
   contract, which was AA-clean, for e3-saas). This is deliberate: it keeps each
   plant's only floor defect the registered one and prevents a second gate from
   firing by accident. The page designs, voice and layouts are newly authored
   for E4-R; the required content strings are the set's mandated manifest items,
   which every arm in that set must carry.
3. **One inflation term exceeds the bound individually.** seed-annual measured
   +2.0 (internal 9.0, external 7.0). The registered statistic is the pooled
   mean and it passes at +0.875; the individual term is reported rather than
   smoothed, exactly as E4 reported seed-annual sitting at the bound.
4. **The e1 external panel produced a three-way tie.** All three real e1
   candidates landed at overall median 8.0, which turned both of that set's
   directional internal pairs into tied-external pairs. This is a real
   contributor to the τ shortfall and is reported rather than adjusted; the
   registered aggregation was applied unchanged.
5. **τ-b resolution.** With 8 of 12 pairs tied on the internal side before the
   external panel says anything, the registered statistic can only ever be
   driven by 4 pairs. That property of the instrument was inherited unchanged
   from the sealed sheet on purpose; noting it here is not an argument against
   the verdict, which stands as measured.
6. **`verify_keyboard`, `verify_scrollcapture`, `verify_frametime` and
   `verify_cwv` did not run** on any candidate in this run, because they are not
   part of the battery the sets' real arms faced. They are named as not-run in
   every juror transcript, so no juror could read their silence as a pass.
7. **Wall clock.** The run record's `wallClockMinutes` measures from the sealed
   addendum commit to the run record, and covers plant authorship, rendering,
   batteries, all 20 panels and aggregation.

## Program consequences (per the sealed sheet, not new policy)

- **The advisory-only demotion of the model judging seat stands.** E4-R does not
  meet the sealed success condition, so nothing about the demotion changes: the
  seat remains advisory-only and no Tier-3 claim may rest on internal scores
  alone. Whether to run a further re-validation, and on what terms, is the
  coordinator's / owner's call.
- **The R1+R2 repair itself is now evidenced as implemented and honored**, which
  is a separate finding from the falsification: 4 of 4 plants were eliminated
  mechanically before scoring, and 20 of 20 jurors independently refused to
  score a floor-failing candidate when handed its gate outputs. That closes the
  specific hole E4 exposed — an attractive candidate with a measured defect
  winning a panel — without meeting the agreement threshold that would lift the
  demotion.
- **The floor battery's standing is unchanged and strong:** it hard-failed 4 of
  4 plants on exactly their registered gate, including three defects that are
  invisible in any static render.

## Artifact index

- Sealed protocol: `../PREREG-E4-CALIBRATION.md` (untouched) + `../PREREG-E4R-ADDENDUM.md`
- Repair decision: `../E4-JUDGING-SEAT-REPAIR-DECISION.md`; implementation commit `c0d4a08`
- Plants + battery: `plants/` (5 surfaces, 20 render cells, full gate outputs,
  `identity.json`, `SEALED-PLANT-NOTE.md` + its pre-judging `.sha256`)
- Panels: `jurors/` (20 verbatim transcripts, bootstrap prompt, 4 blind maps with
  seeds, 4 sha256 blind manifests, 20 verbatim raw outputs, 4 external
  panel-results, 4 R1-compliance records)
- Records: `.pixelhelm/jurors/` (60 juror-records), `.pixelhelm/runs/` (run@1)
- Statistics: `stats/compute-e4r-stats.mjs` + `stats/stats-results.json`
