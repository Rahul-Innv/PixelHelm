# Close the loop — record shapes + write policy (the single home)

Every design pass that shows the owner pixels ENDS by recording what happened,
so the next pass starts smarter. This file is the one canonical home for the
loop's record shapes; `pixelhelm-judge/references/recipe.md` and
`pixelhelm-record-lesson/references/capture-and-versioning.md` point here instead of
duplicating.

## Where records live (the durable store)

Nothing is ever written inside the plugin directory — installed plugins are
replaced wholesale on update. The store, by precedence (highest wins for
reads; writes go to the layer named below):

| Layer | Path | Holds |
|---|---|---|
| project | `<project>/.pixelhelm/` | `profile.json` · `LESSONS.md` · `council/ledger.md` · `council/<YYYY-MM-DD>--<surface>--council.json` · `signoffs/<YYYY-MM-DD>--<surface>.json` · `jurors/<YYYY-MM-DD>--<surface>--<juror>--<label>.json` · `runs/<YYYY-MM-DD>--<surface>--run.json` · `capability/LEDGER.md` + `capability/entries/` + `capability/escapes/` · `baseline.json` · `references.md` |
| durable data dir | `$CLAUDE_PLUGIN_DATA`, else `~/.claude/pixelhelm/` | `LESSONS.md` · `fingerprints.md` · `currency-log.md` · `profiles/<project>.json` · `render-targets/` · `baselines/<project>/` |
| owner-global (optional) | `~/.claude/pixelhelm/LESSONS.md` | cross-project lessons, if the user keeps one |
| shipped (read-only) | `<plugin>/seeds/` + `<plugin>/profiles/examples/` | seed lessons · seed fingerprints · the example profile |

## Write policy (two kinds of writes — never blur them)

- **Archives** — verdict JSONs, ledger lines, sign-off records, rendered
  baselines — are append-only FACTUAL records of what happened. Write them
  directly, at the moment they happen. Never edit an archive.
- **Behavior-bearing stores** — `LESSONS.md`, profiles (including `_taste`),
  `fingerprints.md`, `currency-log.md` — change how future runs behave. They
  are ONLY ever mutated via a reviewable diff the owner saves (the
  pixelhelm-record-lesson WRITE-BACK ethos). Never write them silently.

## The record machinery (SHIPPED — write through it, never around it)

`records.mjs` (this skill's `scripts/`) is the writer AND validator for all
four record schemas below. **A panel or run whose record does not validate
did not happen** — that is the method law (CONTRIBUTING: no pass described as
complete before its artifacts exist), enforced in code:

```
node "${CLAUDE_PLUGIN_ROOT}/skills/pixelhelm-loop/scripts/records.mjs" template <judge-verdict|signoff|run|juror-record>
node "${CLAUDE_PLUGIN_ROOT}/skills/pixelhelm-loop/scripts/records.mjs" validate <file.json> [...]
node "${CLAUDE_PLUGIN_ROOT}/skills/pixelhelm-loop/scripts/records.mjs" write <kind> --project <dir>  # record JSON on stdin
```

`write` validates first and REFUSES an invalid record (exit 1, nothing
written); it refuses to overwrite an existing archive (append-only, above);
for a judge verdict it also appends the ledger line. Validation is not shape
box-ticking: juror count must be odd ≥ 3, each candidate carries one score
per juror, recorded medians must EQUAL the recomputed median of their scores,
and the winner must be a real candidate id — a fabricated record fails loudly.
Exit contract: 0 valid/written · 1 invalid or refused · 2 runner error.

Panel integrity (SOFT, per the sealed E4 sheet): writing a judge verdict
checks `jurors/` for matching per-juror records (same date + surface) and
WARNS on stderr (JSON mode: a `warnings` array) when none exist. Absence is
never a refusal — records that predate the juror-record schema stay valid —
but a NEW panel without per-juror records is a defective panel
(`evals/validation/PREREG-E4-CALIBRATION.md`).

Floor integrity (SOFT, same pattern, per the R1 repair): writing a judge
verdict also WARNS when a SCORED candidate carries no referenced floor
evidence — no `floorEvidence` entry, or one that names neither a gate-output
path nor an explicit `UNSCORED` status. Absence is never a refusal (records
predating the R1 repair stay valid), but a scored candidate with no floor
evidence is an R1 violation: floor-clean is a precondition for esteem
scoring, and a candidate that fails or lacks its gates is UNSCORED, never
scored low (`evals/validation/E4-JUDGING-SEAT-REPAIR-DECISION.md`).

## Verdict record — `pixelhelm/judge-verdict@1`

Written by pixelhelm-judge immediately after the chair's synthesis (Phase 2.5),
to `<project>/.pixelhelm/council/<date>--<surface>--council.json`:

```json
{ "schema": "pixelhelm/judge-verdict@1",
  "date": "YYYY-MM-DD", "project": "", "surface": "",
  "mode": "redesign-tournament | incremental-polish | review | new-design",
  "pass": "fast | deep",
  "candidates": { "<id>": { "label": "", "kind": "incumbent | challenger", "render": "<path>",
                            "floorEvidence": { "gateOutputs": ["<gate artifact path>"], "notRun": ["<gate id>"] } } },
  "unscored": [ { "candidate": "", "gate": "<the failing or missing gate>", "why": "" } ],
  "registerFitPanel": { "jurors": 5, "scores": { "<id>": [0] }, "medians": { "<id>": 0 },
                        "nonOverlapping": true, "modeFairness": "both-modes | same-mode | <note>" },
  "lensScores": { "<lens>": { "<id>": 0 } },
  "constraints": [ { "seat": "<lens or composite>", "finding": "", "severity": "blocker | major | minor" } ],
  "aggregation": { "contract": "<the contract doc + date used>", "weightedScores": {}, "guardOutcome": "" },
  "winner": "<id> | incumbent",
  "registerSafeGrafts": [], "rejectedGrafts": [],
  "rejectedDirections": [ { "direction": "", "why": "" } ],
  "ownerVerdict": null }
```

`ownerVerdict` starts null; the router's Close-the-loop step fills it after
the owner speaks with
`{ "decision": "approved" | "rejected" | "approved-with-changes", "ownerWords": "<short verbatim quote>" }`.

`floorEvidence` and `unscored` carry the R1/R2 repair
(`evals/validation/E4-JUDGING-SEAT-REPAIR-DECISION.md`). Both are OPTIONAL for
compatibility — records written before the repair stay valid — and both are
shape-validated when present:

- **`candidates.<id>.floorEvidence`** — the floor bundle that travelled with
  this candidate's renders into every juror input set (R2). `gateOutputs` lists
  the Layer-1 gate ARTIFACT paths (never a prose "Layer-1 passed"); `notRun`
  names the gates that did not run, because silence would otherwise read as a
  pass. Appearing in `candidates` MEANS the candidate was scored, so its floor
  bundle must be non-empty: the writer WARNS when it is missing or empty.
- **`unscored`** — the candidates R1 excluded: floor-failing, or with no gate
  outputs to point at. They are NOT listed in `candidates`, carry NO scores, NO
  rank, and NO juror records; each entry names the failing or missing gate. This
  is how the panel's silence stays auditable — the record says UNSCORED and the
  gate, never a comparative adjective and never a low score.

## Ledger line — `<project>/.pixelhelm/council/ledger.md`

One line per council run. This is what the NEXT run actually reads first; the
JSONs are drill-down. Append:

```
| YYYY-MM-DD | <surface> | <mode>/<pass> | winner: <id> | reg-fit medians: <id> N / ... | rejected: <direction-slugs> | grafts open: N | owner: <verdict or pending> | <verdict filename> |
```

## Sign-off record — `pixelhelm/signoff@1`

Written by the `pixelhelm` router's Close-the-loop step, right after the owner
approval gate, to `<project>/.pixelhelm/signoffs/<date>--<surface>.json`:

```json
{ "schema": "pixelhelm/signoff@1", "date": "", "project": "", "surface": "",
  "artifact": "<render path or council/<file> ref>",
  "decision": "approved | rejected | approved-with-changes",
  "ownerWords": "<short verbatim quote>",
  "clarifies": "register | taste | scope | none",
  "followUp": ["lesson-proposed" | "profile-taste-proposed" | "none"] }
```

## Run record — `pixelhelm/run@1` (the cost/instrumentation archive)

Written by the router's Close-the-loop step (archive — direct write) to
`<project>/.pixelhelm/runs/<date>--<surface>--run.json`. Purpose: cost and shape
comparisons (edition vs edition, engines vs none) accrue from REAL runs
(owner-requested 2026-07-02). Record MEASURED numbers only — subagent/workflow
token usage the harness reports; never estimate main-context tokens into it.

```json
{ "schema": "pixelhelm/run@1", "date": "", "project": "", "surface": "", "intent": "",
  "edition": "full | lite | dev", "workerModel": "",
  "skillsFired": [], "engines": ["internal-E1..E4", "stitch", "claude-design"],
  "council": { "pass": "fast | deep", "seats": 0, "registerJurors": 0 },
  "iterations": 0, "renders": { "items": 0, "cells": 0 },
  "tokens": { "subagentsMeasured": 0, "workflowsMeasured": 0,
              "note": "measured-only; main-context usage is not observable in-session" },
  "wallClockMinutes": 0,
  "outcome": "shipped | current-design-wins | needs-human-review | report-only",
  "notes": "" }
```

## Juror record — `pixelhelm/juror-record@1` (per-juror evidence)

ONE record per juror per SCORED candidate, written via
`records.mjs write juror-record` BEFORE the panel's verdict is written (E1
critique finding 1: without a per-juror schema the panel's evidence chain stops
at the aggregate). An R1-UNSCORED candidate gets no juror record at all — it is
named in the verdict's `unscored` array instead. Archive path:
`jurors/<date>--<surface>--<jurorId>--<blindLabel>.json`.

```json
{ "schema": "pixelhelm/juror-record@1",
  "date": "YYYY-MM-DD", "project": "", "surface": "",
  "jurorId": "<stable id within the panel, e.g. juror-3>",
  "blindLabel": "<the neutral label this candidate was presented under>",
  "rubric": "<the sealed rubric sheet the criterion numbers key to>",
  "scores": { "<criterion number>": 0 },
  "rationales": { "<criterion number>": "<max 2 sentences>" },
  "inputTranscriptSha256": "<sha256 of the juror's verbatim input transcript>",
  "shuffleSeed": "<this juror's presentation-order seed>" }
```

What validation enforces: criterion keys are the rubric sheet's printed
numbers (positive integers), every score is an integer 0..10 (the rubric
scale), every scored criterion carries a non-empty rationale of at most two
sentences, `inputTranscriptSha256` is 64 lowercase hex chars binding the
record to the committed verbatim transcript (never a summary), and
`shuffleSeed` records the blind presentation order. The transcript itself is
committed alongside the run (the hash makes tampering visible); the record
carries only its hash.

**R2: the hashed transcript COVERS the gate outputs.** The juror's verbatim
input transcript is the renders *and* each scored candidate's Layer-1 gate
outputs (plus the named not-run gates), so `inputTranscriptSha256` binds the
record to what the juror actually saw about the measured floor — not to the
renders alone. A transcript that hashes only renders does not satisfy R2, and a
panel run that way is the E4 failure mode
(`evals/validation/E4-JUDGING-SEAT-REPAIR-DECISION.md`).

## The capability ledger — `pixelhelm/capability-entry@1` + `pixelhelm/capability-escape@1`

The four records above answer "what happened in THIS pass". The capability
ledger answers the question a pass cannot: **what has this system actually
done, across runs, per archetype** — so that "consistently good" could one day
be evidenced by repetition instead of asserted. It is written by its own
script, which is the writer AND validator for both shapes:

```
node "${CLAUDE_PLUGIN_ROOT}/skills/pixelhelm-loop/scripts/capability-ledger.mjs" template <entry|escape>
node "${CLAUDE_PLUGIN_ROOT}/skills/pixelhelm-loop/scripts/capability-ledger.mjs" validate <file.json> [...]
node "${CLAUDE_PLUGIN_ROOT}/skills/pixelhelm-loop/scripts/capability-ledger.mjs" write <entry|escape> --project <dir>
node "${CLAUDE_PLUGIN_ROOT}/skills/pixelhelm-loop/scripts/capability-ledger.mjs" summary --project <dir>
node "${CLAUDE_PLUGIN_ROOT}/skills/pixelhelm-loop/scripts/capability-ledger.mjs" check   --project <dir>
```

Store: `<project>/.pixelhelm/capability/` — `entries/<date>--<archetype>--<runId>.json`,
`escapes/<date>--<runId>--<defect>.json`, and the append-only roll-up
`LEDGER.md` (one line per entry and per escape; the JSONs are drill-down).
Exit contract matches `records.mjs`: 0 valid/written/clean · 1 invalid,
refused, or unledgered runs found · 2 runner error.

**It records history; it never rewrites it.** Entries and escapes are archives
under the write policy above: `write` REFUSES an existing path. A defect found
after a run closed is a NEW `capability-escape@1` naming that run's `runId` —
the run's entry stays exactly as written.

```json
{ "schema": "pixelhelm/capability-entry@1",
  "date": "YYYY-MM-DD", "runId": "<lowercase-kebab id>", "archetype": "<slug>",
  "kind": "design-run | calibration-experiment",
  "project": "", "surface": "", "runRecord": "<pixelhelm/run@1 path> | unknown",
  "artifacts": ["<path>"],
  "floor": { "outcome": "pass | fail | unknown", "firedInLoop": [], "failedAtClose": [],
             "notRun": [], "evidence": ["<gate artifact path>"] },
  "panel": { "standing": "binding | advisory-only | unknown", "jurors": 5,
             "medians": { "<candidate>": 0 }, "winner": "", "winnerMedian": 0 },
  "owner": { "decision": "approved | rejected | approved-with-changes | pending | unknown",
             "band": 0, "bandBasis": "stated | approximate | upper-bound | unknown",
             "ownerWords": "<short verbatim quote>", "record": "<signoff@1 path>" },
  "ownerVsPanel": 0, "plants": { "planted": 0, "caught": 0 }, "notes": "" }

{ "schema": "pixelhelm/capability-escape@1",
  "date": "YYYY-MM-DD", "runId": "<the entry this attaches to>", "archetype": "<slug>",
  "defect": "", "defectClass": "",
  "escapedPast": "floor | panel | owner | shipped-artifact | unknown",
  "caughtBy": "<gate id | panel | owner | external-critic>",
  "whenFound": "in-loop | post-hoc",
  "cleared": { "date": "YYYY-MM-DD | open", "how": "", "artifact": "" },
  "artifacts": ["<path>"], "notes": "" }
```

What validation enforces, beyond shape — it is the anti-fabrication half:

- **Every record cites an artifact.** `artifacts` must be non-empty. A ledger
  line with nothing to point at is refused, same law as the records above.
- **Unmeasured is the literal string `"unknown"`, never an omission and never a
  reconstruction.** `panel.medians`, `owner.band`, `plants` and the rest each
  take a value or `"unknown"`; a historical run whose report does not state a
  field is written `"unknown"` rather than inferred from context.
- **`ownerVsPanel` is RECOMPUTED**, and must equal `owner.band -
  panel.winnerMedian` when both are numbers — and must be `"unknown"` when
  either is. A calibration delta against an unmeasured side cannot be recorded.
- **`panel.winnerMedian` must equal `panel.medians[panel.winner]`.**
- **A numeric owner band carries its basis** (`stated` / `approximate` /
  `upper-bound`), so "the owner said maximum 6" never hardens into "the owner
  scored 6". A band with no `ownerWords` is rejected as a reconstruction.
- **A floor `"pass"` carries gate artifacts** in `floor.evidence`, and a floor
  `"fail"` must name its gate in `floor.failedAtClose`.

`summary` is DERIVED on every invocation and never stored as truth: per
archetype it reports run count, date span, floor outcomes, the panel winner
medians, owner decisions, the owner-vs-panel deltas *and how many runs they
could be measured on*, planted-defect totals, escapes open vs cleared, and the
count of `"unknown"` fields — the ledger's own honesty count, so gaps stay
visible instead of averaging into confidence.

`check` exits 1 when a `pixelhelm/run@1` archive in the store has no entry
covering it. That is the mechanical half of "closing a loop appends its ledger
line", and it is the check the Close-the-loop step below runs.

The ledger does NOT define the archetype taxonomy; it records the slug the run
declared and groups by it.

## The Close-the-loop step (router, mandatory after the owner gate)

1. Write the sign-off record (archive — direct write, THROUGH
   `records.mjs write signoff`). Update the matching verdict's `ownerVerdict`
   and its ledger line. Write the `pixelhelm/run@1` record (above) for the whole
   pass via `records.mjs write run`. A refused write is a blocking finding,
   not a formality to skip.
2. Append the pass's capability-ledger entry via
   `capability-ledger.mjs write entry --project <dir>`, citing the run record
   just written, then run `capability-ledger.mjs check --project <dir>`. A
   non-zero `check` means a closed loop left no ledger line: that is a blocking
   finding, not a formality. Fields the pass did not measure are written
   `"unknown"` — never reconstructed to make the line look complete.
3. Route by content:
   - owner CORRECTED or REJECTED something → dispatch `pixelhelm-record-lesson`
     WRITE-BACK: propose exactly ONE stamped, tagged lesson diff.
   - the verdict CLARIFIES taste or the register → propose a profile `_taste`
     diff (below).
   - plain approval → record an `approvedExemplars` candidate ONLY if the
     owner used superlatives; routine sign-offs are not taste.
4. Never skip this step because the outcome felt routine — the highest-value
   lesson this plugin carries came from an owner rejection that almost went
   unrecorded.

## Profile `_taste` block (accrues on the project's profile)

```json
"_taste": {
  "approvedExemplars":      [ { "date": "", "what": "", "ref": "<render path>", "why": "" } ],
  "rejectedDirections":     [ { "date": "", "direction": "", "why": "", "ref": "<verdict path>" } ],
  "registerClarifications": [ { "date": "", "clarification": "", "ref": "<signoff path>" } ]
}
```

Cap ~10 per list; supersede-not-append (replace the stale item, don't grow).
Consumed by `pixelhelm-ground` into the ground context. Register-fit jurors MAY
read `registerClarifications` as elaborations OF `_register` — never as a
replacement for the literal `_register` string the gate binds to.

## What the next run consumes (hard rules)

- `pixelhelm-judge` Phase 0 reads `ledger.md` + the latest verdict for the
  surface: a direction in any prior `rejectedDirections` (or an
  owner-REJECTED verdict) for this surface must NOT be re-proposed or
  re-crowned unless the owner explicitly reopens it; still-open
  `registerSafeGrafts` surface as the grafts backlog; the prior winner /
  recorded baseline is the incumbent candidate source.
- `pixelhelm-ground` folds the profile's `_taste` + the most recent ledger lines
  + sign-offs into the ground context.
- `pixelhelm-record-lesson` READ injects lessons via the shared reader (see
  `pixelhelm-record-lesson/SKILL.md`); its WRITE-BACK targets the durable-store
  `LESSONS.md` (or the project layer for project-scoped lessons).
