# The baseline — `.pixelhelm/baseline.json` (regression memory)

> ToC: [Why](#why) · [Keying](#keying-merge-base) · [Classification](#classification) ·
> [Screenshot diff tolerance](#screenshot-diff-tolerance) · [Shape](#file-shape) · [Re-baselining](#re-baselining)

## Why

Without a baseline the evaluator re-litigates everything every run: plugin87 has machine gates but
no regression memory; OneRedOak certifies nothing; reg-suit flags INTENDED changes as bugs. The
baseline makes evaluation COMPOUND — a Layer-1 PASS that later regresses is auto-top-severity, and
findings that already passed are not re-raised. Surface only **New** and **Regressed**.

## Keying (merge-base)

Key the baseline by the git merge-base, mirroring `git diff --merge-base origin/HEAD` (reg-suit
`keygen-git-hash`, README L36). Comparing against the branch point — not the last run — means the
baseline answers "what did THIS branch change," which is the reviewable unit.

## Classification

Diff the current run's findings (Layer-1 gate results + Layer-2 surviving findings) against the
baseline entry. Classify each:

| Class | Meaning | Treatment |
|---|---|---|
| **New** | Not in baseline; present now | Report at its own severity. |
| **Persistent** | In baseline AND now, unchanged | Suppress passes; report still-open issues once, unescalated. |
| **Fixed** | In baseline, gone now | Note as resolved (positive signal); do not block. |
| **Regressed** | Passed at baseline, FAILS now | **Auto-top-severity (Blocker).** A proven backslide is the worst class. |

(Community-Access `accessibility-regression-detector.md` L26-32.)

## Screenshot diff tolerance

Pixel-diff with tolerance so a 1px antialias shift is not a "bug" (reg-suit `thresholdPixel` +
`enableAntialias`, README L120-141). Only diffs beyond tolerance count as a visual finding.

## File shape

```json
{
  "key": "<merge-base-sha>",
  "screens": {
    "<screen-id>": {
      "layer1": { "G1": "pass", "G2": "pass", "...": "..." },
      "findings": [
        { "rule": "<rule-id>", "severity": "high", "location": "<sel>", "hash": "<finding-hash>" }
      ],
      "screenshot": "<relative-png-path>"
    }
  }
}
```

- A finding's identity is `rule + location` (a stable hash) so the same issue at the same place is
  matched across runs, not duplicated.
- Storage: committed JSON + small PNGs gives shared regression memory but bloats the repo — this is
  an OWNER call (committed PNGs vs hashes-only). Default to committed JSON; make PNG commitment a
  profile flag.

## Re-baselining

A human re-baselines INTENDED changes (reg-suit's accept/reject stays human). The evaluator never
silently absorbs a regression into the baseline — proposing a baseline update is a reviewable diff,
never an in-place mutation.
