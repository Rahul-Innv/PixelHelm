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
| project | `<project>/.pixelhelm/` | `profile.json` · `LESSONS.md` · `council/ledger.md` · `council/<YYYY-MM-DD>--<surface>--council.json` · `signoffs/<YYYY-MM-DD>--<surface>.json` · `jurors/<YYYY-MM-DD>--<surface>--<juror>--<label>.json` · `references.md` |
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

Felt-variety integrity (SOFT, same pattern): writing a MULTI-CANDIDATE judge
verdict WARNS when it carries no `houseStyleCheck` — the cross-run comparison
against prior committed winners. It is a warning by design, and the check
itself is ADVISORY: a recurring signature is recorded and surfaced, it never
vetoes a winner.

Elicitation (HARD — the one write-time refusal beyond schema shape):
`write run` REFUSES a run record with no `intentElicitation` block (exit 1,
nothing written), so a run that never asked the owner what the design should
FEEL like cannot close its loop quietly. `validate` stays permissive, so run
archives written before this rule remain valid.

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
  "houseStyleCheck": { "comparedAgainst": ["<prior committed winner ref>"],
                       "recurringSignatures": [ { "signature": "", "evidence": "", "runs": ["", ""] } ],
                       "verdict": "no-house-style-tell | house-style-tell | not-run", "why": "" },
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

`houseStyleCheck` carries the CROSS-RUN felt-variety check (also OPTIONAL for
compatibility, shape-validated when present). A tournament judges arms against
each other WITHIN one run; it structurally cannot see a house style that repeats
ACROSS runs. On E3 (2026-07-26) every registered in-run divergence metric — dE00,
layout class, motif Jaccard, blind-intent — PASSED while the owner wrote: *"I see
a theme - all of them are similar to each other and to the set-1 style I called
merely easier on the eyes."* Those metrics measure difference; they do not measure
felt variety.

- **`comparedAgainst`** — references to PRIOR runs' committed winners (ledger
  lines, verdict records, baseline renders). A remembered impression of past runs
  is not a comparison; name the artifacts.
- **`recurringSignatures`** — each `{ signature, evidence, runs }` with at least
  two run references. The fingerprint registry's ADD/PROMOTE evidence gate applies
  verbatim here: an uncited tell is not a finding, and the writer refuses a record
  that carries one.
- **`verdict`** — `no-house-style-tell` · `house-style-tell` · `not-run`
  (`not-run` must say why, e.g. no prior committed winner exists for this surface;
  silence must never read as "checked and clean").
- **ADVISORY, and recorded.** A `house-style-tell` verdict does NOT block, veto or
  demote a winner. It is surfaced to the owner with its evidence and it lands in
  the archive, so the next run starts from a named suspicion instead of a feeling.

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
  "intentElicitation": { "asked": true, "ownerWords": "", "capturedInto": "",
                         "waived": false, "waiverWords": "" },
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

### `intentElicitation` — REQUIRED on every new run record (ENFORCED)

The loop must ASK the owner what the design should FEEL like BEFORE any direction
intent is written, and the answer becomes part of the ground context the directions
have to serve. `records.mjs write run` REFUSES a record without this block — and the
loop treats a refused write as a blocking finding, so a run that skipped the question
cannot be reported complete. `validate` stays permissive: run archives written before
this rule remain valid.

| Field | Rule |
|---|---|
| `asked` | `true` when the question was put to the owner and answered. |
| `ownerWords` | the owner's VERBATIM answer — intended feeling, register words, reference points. A paraphrase is not the answer. |
| `capturedInto` | where the answer entered the ground context (the profile `_register` / a `registerClarifications` entry / the run's brief file). |
| `waived` | `true` only when the owner explicitly declined the question. |
| `waiverWords` | the owner's own words declining. A self-issued waiver is not a waiver. |

Exactly one of `asked` / `waived` is true. Neither-true is rejected: a run that
neither asked nor holds a waiver is a process defect, and the record says so rather
than staying silent.

*Source: the E3 commerce sign-off, 2026-07-26 — "Stop reusing the same design
language; the loop should ASK the owner what theme and feeling is wanted before
generating." Until this landed, nothing in the loop asked.*

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

### Rubric authoring — the in-use usability criterion (guidance, FUTURE sheets only)

Every NEW rubric sheet a run seals must carry an explicit **in-use usability**
criterion, worded so it is judged on the RENDERED ARTIFACT rather than on a
description of it: *does this surface give the visitor the affordances their actual
task needs — the controls, states, entry points and next steps that task requires —
and are they present and reachable in the render, not merely implied by the copy?*
Absent affordances are the finding; "the page explains what you could do" is not the
same as the page letting you do it.

This governs sheets authored from now on. It does NOT retrofit any sealed sheet: no
past experiment's rubric is edited, re-scored, or re-interpreted against a criterion
it never carried. The corresponding judging seat is the Spool lens's in-use clause
(`pixelhelm-judge/references/lenses.md` §4).

*Source: the owner, twice on separate surfaces — "there is still a lot of improvement
with how easy it is for the user to use" (E1) and "there is a lot of missing UI, how
is it easy for the user?" (E1 council review). Recorded across E1 and E3 as the one
weakness present in every run.*

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
   and its ledger line. Write the `pixelhelm/run@1` record (above) for the whole
   pass via `records.mjs write run`. A refused write is a blocking finding,
   not a formality to skip — and a run record with no `intentElicitation` is
   refused outright, so a pass that never asked the owner what the design should
   FEEL like surfaces here as a blocking process defect.
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
