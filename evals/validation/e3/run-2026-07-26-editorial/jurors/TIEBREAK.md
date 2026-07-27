# Winner tie-break record (execution decision, documented at aggregation time)

The sealed rubric registers the aggregation (criterion median of 5 jurors;
overall = median of the 10 criterion medians) and the PASS bar, but no winner
tie-break. The panel produced a genuine THREE-WAY top tie: weir-plates 9.0,
almanac-rail 9.0, two-inks 9.0 overall. The mechanical hierarchy applied is
E1's, verbatim (fixed and committed in `e1/run-2026-07-26/jurors/TIEBREAK.md`
before this run began — i.e., fixed before any E3 stage value could be known);
the hierarchy stops at the first stage that separates the remaining tied arms,
and every stage's values are recorded:

| stage | rule | weir-plates | almanac-rail | two-inks | result |
|---|---|---|---|---|---|
| (a) | higher minimum criterion median | 8 | 7 | 8 | almanac-rail eliminated |
| (b) | more criteria at median >= 9 | **7** | (6) | 6 | **weir-plates** |
| (c) | pairwise criterion-median wins (recorded, not reached) | 4 | (3) | 5 | — |
| (d) | higher sum of criterion medians (recorded, not reached) | 87 | (84) | 87 | — |
| (e) | per-juror preference (each juror's own median over their 10 scores; juror-internal ties broken by that juror's raw sum) (recorded, not reached) | 4 | (0) | 1 | — |

Winner: **weir-plates**, by stage (b), 7 criteria at median ≥ 9 against
two-inks' 6. Full stage computation: `tiebreak.json`.

Honesty notes, stated without reframing:

- two-inks equals the winner on both registered aggregates that survive stage
  (a) — overall 9.0 and minimum criterion median 8 — and stage (c), had it
  been reached first, favors two-inks (5 pairwise wins to 4). The hierarchy's
  ORDER decided; that order was inherited from E1's committed record, not
  chosen after seeing these values.
- The PASS bar outcome is tie-invariant: ALL THREE arms clear it
  (minimum criterion medians 8 / 7 / 8, all ≥ 6; overall 9.0 each, ≥ 8), so
  the run's quality claim does not depend on the tie-break. The tie-break
  decides only which candidate is crowned for the verdict record; the owner
  remains the final judge.
- Per Amendment C1 (owner-approved, pre-generation), every 9+ median here is
  recorded as **"strong, owner-verify"** — not achieved distinctive
  excellence. E1's calibration (panel ≈1 point hot vs the owner) applies to
  this panel's reading.
