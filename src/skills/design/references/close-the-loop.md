# Close the loop — record shapes + write policy (the single home)

Every design pass that shows the owner pixels ENDS by recording what happened,
so the next pass starts smarter. This file is the one canonical home for the
loop's record shapes; `design-council/references/recipe.md` and
`design-learn/references/capture-and-versioning.md` point here instead of
duplicating.

## Where records live (the durable store)

Nothing is ever written inside the plugin directory — installed plugins are
replaced wholesale on update. The store, by precedence (highest wins for
reads; writes go to the layer named below):

| Layer | Path | Holds |
|---|---|---|
| project | `<project>/.design/` | `profile.json` · `LESSONS.md` · `council/ledger.md` · `council/<YYYY-MM-DD>--<surface>--council.json` · `signoffs/<YYYY-MM-DD>--<surface>.json` · `jurors/<YYYY-MM-DD>--<surface>--<juror>--<label>.json` · `references.md` |
| durable data dir | `$CLAUDE_PLUGIN_DATA`, else `~/.claude/design/frontend-design-skill/` if it exists, else `~/.claude/design-pixelhelm/` | `LESSONS.md` · `fingerprints.md` · `currency-log.md` · `profiles/<project>.json` · `render-targets/` · `baselines/<project>/` |
| owner-global (optional) | `~/.claude/design/LESSONS.md` | cross-project lessons, if the user keeps one |
| shipped (read-only) | `<plugin>/seeds/` + `<plugin>/profiles/examples/` | seed lessons · seed fingerprints · the example profile |

## Write policy (two kinds of writes — never blur them)

- **Archives** — verdict JSONs, ledger lines, sign-off records, rendered
  baselines — are append-only FACTUAL records of what happened. Write them
  directly, at the moment they happen. Never edit an archive.
- **Behavior-bearing stores** — `LESSONS.md`, profiles (including `_taste`),
  `fingerprints.md`, `currency-log.md` — change how future runs behave. They
  are ONLY ever mutated via a reviewable diff the owner saves (the
  design-learn WRITE-BACK ethos). Never write them silently.

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

## Verdict record — `design-council/verdict@1`

Written by design-council immediately after the chair's synthesis (Phase 2.5),
to `<project>/.design/council/<date>--<surface>--council.json`:

```json
{ "schema": "design-council/verdict@1",
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

## Ledger line — `<project>/.design/council/ledger.md`

One line per council run. This is what the NEXT run actually reads first; the
JSONs are drill-down. Append:

```
| YYYY-MM-DD | <surface> | <mode>/<pass> | winner: <id> | reg-fit medians: <id> N / ... | rejected: <direction-slugs> | grafts open: N | owner: <verdict or pending> | <verdict filename> |
```

## Sign-off record — `design/signoff@1`

Written by the `design` router's Close-the-loop step, right after the owner
approval gate, to `<project>/.design/signoffs/<date>--<surface>.json`:

```json
{ "schema": "design/signoff@1", "date": "", "project": "", "surface": "",
  "artifact": "<render path or council/<file> ref>",
  "decision": "approved | rejected | approved-with-changes",
  "ownerWords": "<short verbatim quote>",
  "clarifies": "register | taste | scope | none",
  "followUp": ["lesson-proposed" | "profile-taste-proposed" | "none"] }
```

## Run record — `design/run@1` (the cost/instrumentation archive)

Written by the router's Close-the-loop step (archive — direct write) to
`<project>/.design/runs/<date>--<surface>--run.json`. Purpose: cost and shape
comparisons (edition vs edition, engines vs none) accrue from REAL runs
(owner-requested 2026-07-02). Record MEASURED numbers only — subagent/workflow
token usage the harness reports; never estimate main-context tokens into it.

```json
{ "schema": "design/run@1", "date": "", "project": "", "surface": "", "intent": "",
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

## The Close-the-loop step (router, mandatory after the owner gate)

1. Write the sign-off record (archive — direct write, THROUGH
   `records.mjs write signoff`). Update the matching verdict's `ownerVerdict`
   and its ledger line. Write the `design/run@1` record (above) for the whole
   pass via `records.mjs write run`. A refused write is a blocking finding,
   not a formality to skip.
2. Route by content:
   - owner CORRECTED or REJECTED something → dispatch `design-learn`
     WRITE-BACK: propose exactly ONE stamped, tagged lesson diff.
   - the verdict CLARIFIES taste or the register → propose a profile `_taste`
     diff (below).
   - plain approval → record an `approvedExemplars` candidate ONLY if the
     owner used superlatives; routine sign-offs are not taste.
3. Never skip this step because the outcome felt routine — the highest-value
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
Consumed by `design-ground` into the ground context. Register-fit jurors MAY
read `registerClarifications` as elaborations OF `_register` — never as a
replacement for the literal `_register` string the gate binds to.

## What the next run consumes (hard rules)

- `design-council` Phase 0 reads `ledger.md` + the latest verdict for the
  surface: a direction in any prior `rejectedDirections` (or an
  owner-REJECTED verdict) for this surface must NOT be re-proposed or
  re-crowned unless the owner explicitly reopens it; still-open
  `registerSafeGrafts` surface as the grafts backlog; the prior winner /
  recorded baseline is the incumbent candidate source.
- `design-ground` folds the profile's `_taste` + the most recent ledger lines
  + sign-offs into the ground context.
- `design-learn` READ injects lessons via the shared reader (see
  `design-learn/SKILL.md`); its WRITE-BACK targets the durable-store
  `LESSONS.md` (or the project layer for project-scoped lessons).
