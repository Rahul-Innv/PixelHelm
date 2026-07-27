# Committed gate runs — the floor validators executed against this example

Every JSON here is the `--json` output of one shipped Layer-1 floor validator run
against `../status-page.html` (the loop's committed output). The 2026-07-26 repair
pass (`../repairs/2026-07-26/REPAIR.md` — ChoiceGate-admitted, surgical edits only)
cleared two of the three originally-committed FAILs through the documented loop and
regenerated every record below against the repaired page. The third — the
emulated-mobile frame-time FAIL — was resolved the same day by an owner-approved
RE-REGISTRATION of the gate (not a page edit): the repair pass diagnosed the long
frames as a headless frame-scheduling stall of the harness itself, and the mobile
profile now excludes that one diagnosed gap per scripted wheel step before
percentile math, budgets unchanged, every excluded gap on the record (see
`layer-1-gates.md`, "Frame-time budget"). Regenerate any of them from the repo root:

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
| `output-floor-gate.json` | 0 (PASS) | The page's three original structural gaps — no `<main>` landmark, two styled-div `.section-title` heading impostors, no meta description — were an honest committed FAIL until the 2026-07-26 repair pass cleared them through the loop: real `header/main/footer` landmarks, real `<h2>` section headings, an honest meta description. The residual `nav` warn is confirmed legitimate: the content model defines no navigation content. |
| `verify_responsive.json` | 0 (PASS) | The floor's first-run catch (stations table forcing page-level sideways scroll at 280/320 px) was cleared by the repair pass with exactly the fix the original record prescribed: the data table got its own `overflow-x` container. Now 0 px page overflow at 280/320/414. |
| `verify_states.json` | 0 (PASS) | Both modes measured; this page has **0 interactive controls**, so there was nothing to fail — the report says so explicitly rather than implying state-contrast conformance. |
| `verify_focustrap.json` | 0 (NOT APPLICABLE) | No dialog on this page; the validator refuses to call that a trap-semantics pass. |
| `verify_targetsize.json` | 0 (PASS) | 0 interactive targets measured at 375×812 — same explicit not-a-conformance-claim note as states. |
| `verify_scrollcapture.json` | 0 (PASS) | All five positions (0/25/50/75/100% of the scroll range) reached within 1 px, offset-stable, reproduced across 2 passes; the page-readiness contract evidence (readyState/fonts/layout-settle, animations killed) is embedded in the record. |
| `verify_frametime.json` | 0 (PASS) | Desktop scripted-scroll pass: p95 16.8 ms against the 16.7 ms budget + 1.0 ms fixed jitter allowance (an idle-vsync page — 0% dropped frames). No stall exclusion applies on desktop. LAB, this machine; the verdict binds this run only. |
| `verify_frametime.mobile.json` | 0 (PASS) | The formerly-committed FAIL, resolved by the owner-approved 2026-07-26 gate re-registration — not by editing the page. The repair pass diagnosed the long frames as a headless frame-scheduling stall of the harness (one multi-vsync gap per scripted wheel step; throttle-invariant, absent at DPR 1, present on a plain-text control, all traced processes idle — `../repairs/2026-07-26/REPAIR.md`), so the mobile profile now excludes the single largest frame gap per wheel step before percentile math. This run: 2 wheel steps, 2 gaps excluded (16.7 and 83.3 ms — both sizes on the record; 18 → 16 samples), p95 **33.3 ms** against the UNCHANGED 33 ms budget + 1.0 ms allowance (6.3% dropped). Small-sample honesty carries over: at 16 samples, nearest-rank p95 equals the max — the verdict is within budget by 0.7 ms, and it binds this run only. |
| `verify_cwv.json` | 0 (PASS) | LCP 328 ms desktop / 880 ms emulated mobile and CLS 0 in both profiles, inside the 2500 ms / 0.1 budgets. INP-proxy is an explicit zero-measure — this page has **0 interactive elements**, so the responsiveness budget is not-applicable, never implied-passed. |
| `verify_keyboard.json` | 0 | **0 focus stops** — the first Tab leaves the document. Explicit zero-measure record (the page has nothing focusable), NOT a keyboard-support conformance claim. When a Harborline pass adds controls, this record becomes the committable Tab/Shift-Tab/Enter path for gate review. |

Committed FAILs were the point: they proved the gates fire on real output, and they
were the honest to-do list this repair pass worked from. The two cleared FAILs were
cleared through the documented loop (admission → surgical repair → regenerated
records — never by hand-editing a record), and the remaining FAIL keeps its place
per the method law (CONTRIBUTING "Evidence and claim discipline"): its budget can
only be satisfied, its profile re-registered, or its record left standing — never
quietly rewritten.
