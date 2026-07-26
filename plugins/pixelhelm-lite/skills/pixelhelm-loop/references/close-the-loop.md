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
| project | `<project>/.pixelhelm/` | `profile.json` · `LESSONS.md` · `council/ledger.md` · `council/<YYYY-MM-DD>--<surface>--council.json` · `signoffs/<YYYY-MM-DD>--<surface>.json` · `references.md` |
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
three record schemas below. **A panel or run whose record does not validate
did not happen** — that is the method law (CONTRIBUTING: no pass described as
complete before its artifacts exist), enforced in code:

```
node "${CLAUDE_PLUGIN_ROOT}/skills/pixelhelm-loop/scripts/records.mjs" template <judge-verdict|signoff|run>
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

## Verdict record — `pixelhelm/judge-verdict@1`

Written by pixelhelm-judge immediately after the chair's synthesis (Phase 2.5),
to `<project>/.pixelhelm/council/<date>--<surface>--council.json`:

```json
{ "schema": "pixelhelm/judge-verdict@1",
  "date": "YYYY-MM-DD", "project": "", "surface": "",
  "mode": "redesign-tournament | incremental-polish | review | new-design",
  "pass": "fast | deep",
  "candidates": { "<id>": { "label": "", "kind": "incumbent | challenger", "render": "<path>" } },
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

## The Close-the-loop step (router, mandatory after the owner gate)

1. Write the sign-off record (archive — direct write, THROUGH
   `records.mjs write signoff`). Update the matching verdict's `ownerVerdict`
   and its ledger line. Write the `pixelhelm/run@1` record (above) for the whole
   pass via `records.mjs write run`. A refused write is a blocking finding,
   not a formality to skip.
2. Route by content:
   - owner CORRECTED or REJECTED something → dispatch `pixelhelm-record-lesson`
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
