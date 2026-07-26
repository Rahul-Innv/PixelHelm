# Committed gate runs — the floor validators executed against this example

Every JSON here is the `--json` output of one shipped Layer-1 floor validator run
against `../status-page.html` (the loop's committed output, deliberately untouched).
These are the first committed gate-run artifacts in this repository — the evidence
grade the docs previously only attested. Regenerate any of them from the repo root:

```
node plugins/pixelhelm-lite/skills/pixelhelm-evaluate/scripts/output-floor-gate.mjs examples/harborline/status-page.html --json
node plugins/pixelhelm-lite/skills/pixelhelm-evaluate/scripts/verify_responsive.mjs examples/harborline/status-page.html --json
node plugins/pixelhelm-lite/skills/pixelhelm-evaluate/scripts/verify_states.mjs     examples/harborline/status-page.html --json
node plugins/pixelhelm-lite/skills/pixelhelm-evaluate/scripts/verify_focustrap.mjs  examples/harborline/status-page.html --json
node plugins/pixelhelm-lite/skills/pixelhelm-evaluate/scripts/verify_targetsize.mjs examples/harborline/status-page.html --json
```

(The `verify_*` validators need a browser: Playwright resolved from the
`pixelhelm-render` skill's install, driving system Edge/Chrome.)

## What the runs show — kept honest on purpose

| Artifact | Exit | What it means |
|---|---|---|
| `output-floor-gate.json` | **1 (FAIL)** | The gate catches this page's three known structural gaps — no `<main>` landmark, two styled-div `.section-title` headings, no meta description. These were documented as gaps in the 2026-07 assessment; now they are BLOCKED, not advised. The page is left as-is because it is the loop's real output — hand-fixing it would fake a capability the loop has not demonstrated. |
| `verify_responsive.json` | **1 (FAIL)** | A NEW escape the floor caught on its first run: the stations table forces a page-level sideways scroll at 280/320px (widest culprit named in the output). The committed render matrix only ever covered 375px, so this was never machine-checked before. The fix (a future loop pass): give the data table its own `overflow-x` container so the PAGE never scrolls sideways. |
| `verify_states.json` | 0 (PASS) | Both modes measured; this page has **0 interactive controls**, so there was nothing to fail — the report says so explicitly rather than implying state-contrast conformance. |
| `verify_focustrap.json` | 0 (NOT APPLICABLE) | No dialog on this page; the validator refuses to call that a trap-semantics pass. |
| `verify_targetsize.json` | 0 (PASS) | 0 interactive targets measured at 375×812 — same explicit not-a-conformance-claim note as states. |

Committed FAILs are the point: they prove the gates fire on real output, and they are
the honest to-do list for the next Harborline loop pass. Per the method law
(CONTRIBUTING "Evidence and claim discipline"), do not delete or regenerate these to
green by editing the page outside the loop.
