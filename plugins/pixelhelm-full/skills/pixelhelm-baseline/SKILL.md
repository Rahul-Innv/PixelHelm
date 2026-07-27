---
name: pixelhelm-baseline
description: Capture the current UI incumbent before a redesign or comparative review. Use when later claims must be measured against existing rendered behavior, gates, and register fit. Do not use to generate alternatives, repair findings, or promote a candidate.
---

# Capture a baseline

Record the target, revision identity, viewport/theme matrix, render artifacts, and
machine-gate results without editing the surface. A baseline is immutable evidence for
the task. If the target or revision is ambiguous, stop rather than compare mismatched
surfaces.

## The flow

1. **Resolve the key.** The baseline is keyed by the git merge-base, so it answers
   "what did THIS branch change". Ambiguous revision, no capture.
2. **Render and gate the incumbent** through `pixelhelm-render` and
   `pixelhelm-evaluate`. This skill never re-implements either; it consumes their
   artifacts.
3. **Capture** the gate outputs, the key measurements, and any surviving findings:

```
node "${CLAUDE_PLUGIN_ROOT}/skills/pixelhelm-baseline/scripts/baseline.mjs" capture \
  --project <dir> --key <merge-base> --screen <id> \
  --gate-artifact <gate.json> [...] \
  --measure <id>=<value>:<lower|higher>[:<tolerance>] \
  --finding "<rule>|<severity>|<location>" --screenshot <path.png>
```

4. **Compare** a candidate later with the same inputs and `compare` in place of
   `capture`. Exit 1 means the candidate regressed.

Gates that did not run are declared `--gate <id>=not-run`, never omitted. Silence is
not a pass: a baseline gate missing from a comparison's inputs is reported
`not-compared` by name and costs that run its no-regression proof.

## What a comparison blocks on

A gate that was clean at baseline and fails now is **Regressed** — auto-top-severity,
a Blocker, outranking the candidate's own clean machine pass. A captured measurement
that moved the wrong way past its tolerance is the same class. A gate that was clean
at baseline and is `not-run` now is **lost evidence**: not a proven regression, but a
candidate that stopped measuring cannot claim it did not regress there, so it blocks
too.

## What this skill must never do

Never absorb a change into the memory. `capture` REFUSES to overwrite a captured
screen or re-key an existing baseline; `--rebaseline` writes a separate proposal file
and prints the diff for a human to accept. Accepting an intended change is the
owner's call, never this skill's.

Never read a changed screenshot as a visual regression. The capture stores a file
hash, not a tolerant pixel diff — identical/changed is a pointer for a human.

Protocol, file shape, and classification table: the evaluator's
`references/baseline.md`.
