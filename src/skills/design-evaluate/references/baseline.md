# The baseline — `<project>/.design/baseline.json` (regression memory)

> ToC: [Why](#why) · [The script](#the-script-shipped) · [Keying](#keying-merge-base) ·
> [Classification](#classification) · [Measurements](#measurements) ·
> [Screenshots](#screenshots-what-is-and-is-not-wired) · [Shape](#file-shape) ·
> [Re-baselining](#re-baselining)

## Why

Without a baseline the evaluator re-litigates everything every run: plugin87 has machine gates but
no regression memory; OneRedOak certifies nothing; reg-suit flags INTENDED changes as bugs. The
baseline makes evaluation COMPOUND — a Layer-1 PASS that later regresses is auto-top-severity, and
findings that already passed are not re-raised. Surface only **New** and **Regressed**.

It is also the only way a redesign can PROVE it did not make things worse. "Layer-1 is green" is a
statement about the candidate alone; "nothing that passed before fails now, and every measured
number held" is a statement about the change.

## The script (SHIPPED)

`pixelhelm-baseline/scripts/baseline.mjs` is the writer, validator, and comparator. Dependency-free,
network-free. Exit contract: **0** clean · **1** regression found or write refused · **2** runner error.

```
node "${CLAUDE_PLUGIN_ROOT}/skills/pixelhelm-baseline/scripts/baseline.mjs" template [--out <file>]
node "${CLAUDE_PLUGIN_ROOT}/skills/pixelhelm-baseline/scripts/baseline.mjs" validate <baseline.json> [...]
node "${CLAUDE_PLUGIN_ROOT}/skills/pixelhelm-baseline/scripts/baseline.mjs" capture \
     --project <dir> --key <merge-base> --screen <id> [inputs] [--rebaseline] [--json]
node "${CLAUDE_PLUGIN_ROOT}/skills/pixelhelm-baseline/scripts/baseline.mjs" compare \
     --project <dir> --key <merge-base> --screen <id> [inputs] [--json]
```

Inputs (repeatable; identical for `capture` and `compare`, so the incumbent and the candidate are
described the same way):

| Input | Meaning |
|---|---|
| `--gate-artifact <path.json>` | Read a shipped validator's own `--json` output. The gate id is its `validator` field; the state is `n/a` when `applicable === false`, else `pass`/`fail` from its boolean `pass`. Refuses to guess if either field is missing. |
| `--gate <id>=<pass\|fail\|n/a\|not-run>` | Declare a gate state directly — including `not-run`, which is a real state, never an omission. |
| `--measure <id>=<value>:<lower\|higher>[:<tolerance>]` | A key number plus **which direction is better** and how much movement is noise. Direction is stored with the measurement so a comparison can never guess it. |
| `--finding "<rule>\|<severity>\|<location>"` | A Layer-2 surviving finding. Severity: `blocker\|high\|medium\|nit`. |
| `--screenshot <path.png>` | Records the file's path + sha256. See the screenshots section. |
| `--date <YYYY-MM-DD>` | `capture` only; defaults to today. |

The store is `<project>/.design/baseline.json`; proposals go to `<project>/.design/baseline.proposed.json`.

## Keying (merge-base)

Key the baseline by the git merge-base, mirroring `git diff --merge-base origin/HEAD` (reg-suit
`keygen-git-hash`, README L36). Comparing against the branch point — not the last run — means the
baseline answers "what did THIS branch change," which is the reviewable unit. `compare` REFUSES a
key that does not match the stored one: a cross-branch-point comparison answers a different
question, and answering it silently would be worse than not answering.

## Classification

`compare` diffs the run's gate states, measurements and findings against the baseline entry:

| Class | Meaning | Treatment |
|---|---|---|
| **New** | Not in baseline; present now | Report at its own severity. |
| **Persistent** | In baseline AND now, unchanged | Suppress passes; report still-open issues once, unescalated. |
| **Fixed** | In baseline, gone now | Note as resolved (positive signal); do not block. |
| **Regressed** | Passed at baseline, FAILS now | **Auto-top-severity (Blocker).** A proven backslide is the worst class. |
| **Lost evidence** | Passed at baseline, declared `not-run` now | **Blocker, under its own name.** Not a proven regression — an *unprovable* one. A candidate that stopped measuring a gate cannot claim it did not regress there. |
| **Not compared** | In baseline, absent from this run's inputs | Neither pass nor regression. Listed BY NAME, and it costs the run its `provenNoRegression` verdict. |

(Community-Access `accessibility-regression-detector.md` L26-32, plus the two honesty classes this
implementation adds.)

**Silence is never a pass.** That is why `not-compared` exists rather than defaulting either way,
and it is what keeps the cost-aware targeted re-render (the router's gates-and-loop §5) honest: a
one-viewport re-render is a legitimate, cheap thing to do, and it simply does not prove the whole
surface. The comparator says so instead of implying otherwise.

`compare` exits **1** when any Regressed or Lost-evidence item exists. It reports
`provenNoRegression: true` only when a baseline existed for the screen, nothing regressed, AND
nothing was left un-compared.

## Measurements

Gate PASS/FAIL is coarse: a frame-time p95 can go 16.8 → 24 ms with the gate still green if the
budget is 33. Measurements catch that drift. Each one carries its own direction and tolerance at
capture time, and the comparison uses the BASELINE's copy — the baseline is the contract. A
candidate that declares the opposite direction for a stored metric is REFUSED: changing which way
is better is a re-registration, not a comparison, and it goes through `--rebaseline`.

## Screenshots — what is and is not wired

**Not wired:** antialias-tolerant pixel diffing (reg-suit's `thresholdPixel` + `enableAntialias`,
README L120-141) — no image decoder ships with this plugin and it takes no dependencies.

**Wired:** `--screenshot` records the file's path and sha256, and `compare` reports
`identical` / `changed` / `not-compared`. A changed screenshot is a POINTER FOR A HUMAN — it is
never a finding and never a blocker, because a 1px antialias shift and a broken layout produce the
same verdict here. Do not report it as a visual regression.

## File shape

```json
{
  "schema": "pixelhelm/baseline@1",
  "key": "<merge-base-sha>",
  "captured": "YYYY-MM-DD",
  "screens": {
    "<screen-id>": {
      "layer1": { "<gate-id>": "pass | fail | n/a | not-run" },
      "measurements": { "<metric-id>": { "value": 0, "better": "lower | higher", "tolerance": 0 } },
      "findings": [
        { "rule": "<rule-id>", "severity": "high", "location": "<sel>", "hash": "<finding-hash>" }
      ],
      "screenshot": { "path": "<relative-png-path>", "sha256": "<64 hex>" }
    }
  }
}
```

- A finding's identity is `rule + location`, hashed (sha256 of the NUL-joined pair, first 16 hex
  chars) so the same issue at the same place is matched across runs, not duplicated. `validate`
  recomputes every hash and rejects a mismatch.
- Storage: committed JSON + small PNGs gives shared regression memory but bloats the repo — this is
  an OWNER call (committed PNGs vs hashes-only). Default to committed JSON; make PNG commitment a
  profile flag. The baseline itself stores only the path + hash, so hashes-only costs nothing.

## Re-baselining

A human re-baselines INTENDED changes (reg-suit's accept/reject stays human). The evaluator never
silently absorbs a regression into the baseline — proposing a baseline update is a reviewable diff,
never an in-place mutation. `capture` enforces exactly that:

| Situation | What happens |
|---|---|
| No baseline yet | Written. Creating memory that does not exist is not a mutation. |
| Same key, screen not yet captured | Added. Additive; no existing memory is touched. |
| Same key, screen identical | No-op, exit 0. |
| Same key, screen DIFFERENT | **REFUSED** (exit 1) with the field-level diff printed. |
| Different key | **REFUSED** (exit 1) — re-keying drops every screen captured at the old branch point. |
| Either refusal, with `--rebaseline` | Writes `baseline.proposed.json` and prints the diff. `baseline.json` is UNCHANGED; a human accepts the proposal. Nothing in this script does that for them. |
