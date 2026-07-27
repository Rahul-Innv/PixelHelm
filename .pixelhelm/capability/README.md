# PixelHelm's own capability ledger

This is the canonical project store (`<project>/.pixelhelm/`) for *this* repository,
holding the capability ledger backlog item P3-1 asked for: a committed,
machine-appendable record of what this system has actually done across runs, per
archetype — run counts and dates, which floor gates fired, panel medians, OWNER
verdicts and the owner-vs-panel delta, planted-defect results, and the defects that
got past a stage and were found later.

It exists so that "consistently exceptional" could one day be **evidenced by
repetition** instead of asserted. Today it evidences something narrower and more
useful: a floor that holds, and a panel the owner does not agree with.

## Layout

| Path | What it is |
|---|---|
| `LEDGER.md` | Append-only roll-up, one line per entry and per escape. Read this first. |
| `entries/` | `pixelhelm/capability-entry@1` — one per recorded run. |
| `escapes/` | `pixelhelm/capability-escape@1` — one per defect that got past a stage, written whenever it is found. |

## Commands

```
node src/skills/pixelhelm-loop/scripts/capability-ledger.mjs summary  --project .
node src/skills/pixelhelm-loop/scripts/capability-ledger.mjs check    --project .
node src/skills/pixelhelm-loop/scripts/capability-ledger.mjs validate .pixelhelm/capability/entries/*.json
```

`summary` is DERIVED from the entries every time it runs and is never stored as truth.
`check` fails when a `pixelhelm/run@1` archive in this store has no ledger entry —
that is the mechanical half of "closing a loop appends its ledger line".

Schema shapes, field meanings, and the write policy live in one place: the `design`
skill's `references/close-the-loop.md`.

## Two rules this directory lives by

1. **It records history; it never rewrites it.** Entries and escapes are archives.
   The writer refuses to overwrite one. A defect discovered after a run closed is a
   NEW escape record naming that run's `runId` — the run's own entry stays exactly as
   it was written.
2. **Unmeasured is `unknown`, never reconstructed.** Every field that a run did not
   record is the literal string `"unknown"`, and `summary` counts those unknowns per
   archetype so the gaps stay visible rather than averaging into confidence. The
   writer recomputes `ownerVsPanel` from `owner.band - panel.winnerMedian` and
   refuses a delta asserted against an unmeasured side.

## How this seed was built, and what it may not be read as

Every line here was written by piping a record into the shipped writer — the same
validate-then-write path a live run uses — from the committed artifacts each entry
cites. Nothing was reconstructed to fill a gap. What that leaves:

- **`panel.standing` is `unknown` on E1 and all three E3 runs.** Those reports state
  no standing for the model judging seat, and the advisory-only demotion post-dates
  them (E4, recorded 2026-07-27). Inferring "binding" from the dates would be
  reconstruction, so the field stays unknown.
- **Owner bands carry their basis.** Two of the five owner bands are `upper-bound`
  ("the 9.0 arms are a maximum 6", "none above 6"), two are `approximate` ("most of
  them maybe eights", "maybe sevens"), one is `stated` ("8.5"). A `-3` delta built on
  an upper bound is a floor on the gap, not a measurement of it.
- **Harborline is almost entirely unknown.** The worked example predates the record
  machinery: no run record, no committed juror scores, no verdict, no losing
  candidates. Its README's two-blind-panel history is *attested*, not committed, so
  no median is recorded for it here.
- **The E4/E4-R entries carry no winner or medians.** Each judged four separate
  external sets rather than one candidate set, so a single winner or run-level median
  does not exist for them. Their load-bearing number is the plant result: 8 of 8
  planted defects caught by the floor across the two runs.
- **Nothing here measures user outcomes.** Every panel number is system-esteem
  (RF-1/RF-4); E5 has not run. See `evals/validation/PROGRAM-REPORT-2026-07-27.md`
  for the binding statement of what the program earned.

## What the seed already shows

Six archetype groups, nine recorded runs, six escapes. The floor passed at close on
every recorded run, and fired inside the loop on two of them. Where both sides were
measured, the owner scored the panel's winner **below** the panel every single time —
-1, -2, -3, -3 — and the panel's winner median was 9.0 on four of five scored runs.
That is the calibration finding, carried as data rather than as prose.
