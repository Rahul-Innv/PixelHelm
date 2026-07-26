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
node plugins/pixelhelm-lite/skills/pixelhelm-evaluate/scripts/verify_scrollcapture.mjs examples/harborline/status-page.html --json
node plugins/pixelhelm-lite/skills/pixelhelm-evaluate/scripts/verify_frametime.mjs  examples/harborline/status-page.html --json
node plugins/pixelhelm-lite/skills/pixelhelm-evaluate/scripts/verify_frametime.mjs  examples/harborline/status-page.html --mobile --json
node plugins/pixelhelm-lite/skills/pixelhelm-evaluate/scripts/verify_cwv.mjs        examples/harborline/status-page.html --json
node plugins/pixelhelm-lite/skills/pixelhelm-evaluate/scripts/verify_keyboard.mjs   examples/harborline/status-page.html --json
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
| `verify_scrollcapture.json` | 0 (PASS) | All five positions (0/25/50/75/100% of a 600 px scroll range) reached within 1 px, offset-stable, and reproduced across 2 passes; the page-readiness contract evidence (readyState/fonts/layout-settle, animations killed) is embedded in the record. |
| `verify_frametime.json` | 0 (PASS) | Desktop scripted-scroll pass: p95 16.8 ms against the 16.7 ms budget + 1.0 ms fixed jitter allowance (an idle-vsync page — 0% dropped frames). LAB, this machine; the verdict binds this run only. |
| `verify_frametime.mobile.json` | **1 (FAIL)** | A NEW escape the floor caught on its first run: under emulated mid-tier mobile (375×812 @ DPR 2, 4× CPU throttle) frame-time p95 is **83.2 ms** against the pre-registered 33 ms budget, with 11.8% dropped frames. Cause not diagnosed here — that is a future loop pass's job; the page stays as-is because it is the loop's real output. Small-sample honesty: with 17 samples, nearest-rank p95 equals the max — the record carries the sample count so a reviewer can weigh it. |
| `verify_cwv.json` | 0 (PASS) | LCP 192 ms desktop / 388 ms emulated mobile and CLS 0 in both profiles, well inside the 2500 ms / 0.1 budgets. INP-proxy is an explicit zero-measure — this page has **0 interactive elements**, so the responsiveness budget is not-applicable, never implied-passed. |
| `verify_keyboard.json` | 0 | **0 focus stops** — the first Tab leaves the document. Explicit zero-measure record (the page has nothing focusable), NOT a keyboard-support conformance claim. When a Harborline pass adds controls, this record becomes the committable Tab/Shift-Tab/Enter path for gate review. |

Committed FAILs are the point: they prove the gates fire on real output, and they are
the honest to-do list for the next Harborline loop pass. Per the method law
(CONTRIBUTING "Evidence and claim discipline"), do not delete or regenerate these to
green by editing the page outside the loop.
