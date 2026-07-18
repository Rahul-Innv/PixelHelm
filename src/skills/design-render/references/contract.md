# The render artifact contract

design-render is an **adapter**: downstream skills depend on the artifact contract,
not on the browser or backend that produced it. Any backend (the default
Playwright `render.mjs`, or a live Playwright-MCP path) MUST emit the same artifacts
so the render step survives a backend swap.

## The artifacts (what render actually emits)

Per item × viewport × mode cell:

| Artifact | File | Who reads it |
|---|---|---|
| screenshot | `<out>/<name>__<vp>__<mode>.png` — fullPage, deviceScaleFactor 2, fonts settled | the owner (opened via `--open`), design-council jurors, design-evaluate Layer-2 |
| manifest | `<out>/render.json` — one per run: every cell + its `modeFidelity` + `extreme` flag | design-council (mode-fair check, H2), design-evaluate, any orchestrator verifying the matrix is complete |

`modeFidelity` is the machine half of KB **L-028 H2**: render.mjs sets the theme
EXPLICITLY for both modes (attribute + class), then asserts the rendered body
background luminance matches the requested mode. A `"warn"` cell means the theme
likely did not apply — a register-fit juror must never score a mode clause
("dark-first") off that cell.

**Not emitted (honestly):** rendered-DOM dumps, a11y-tree JSON, and computed-style
harvests are NOT part of the current contract — `design-evaluate`'s machine gates
read the project SOURCE + profile (static-gates.mjs), and DOM-aware a11y runs as its
own axe pass. If a future backend adds those artifacts, they extend `render.json`;
nothing may silently depend on them until then.

## Security: only FIXED in-page code runs

In-page evaluation is an arbitrary-code surface. render.mjs injects exactly THREE fixed
snippets — the theme setter (attribute/class per mode), the background-luminance probe,
and (only under `--axe`) the VENDORED axe-core suite read from this skill's own
node_modules — plus one FIXED style tag (transitions/animations off for the whole
capture, so the probe and the shots read END-STATES, never a mid-transition blend) —
and nothing else. **Never pass model-authored JavaScript into the page**,
and never extend the in-page code at runtime; any new harvest is a reviewed script change.
With `--axe`, each manifest cell may carry `axe: { serious, critical, violations[≤10] }`
(id / impact / node count / one sample selector) and the manifest root carries the run
totals; absence of the field means axe did not run for that cell — consumers must treat
not-run as NOT-CHECKED, never as clean.

<!-- FULL-ONLY-START -->
## Extreme-content variants (the P56 machine arm)

A file item with `substitutions` renders a REAL variant of the surface with
real-extreme content (longest string / max items / biggest number) swapped in before
load; the substituted HTML is kept under `<out>/_extreme/` for audit. This is what
lets the council's / evaluator's **P56 Content-Robustness** composite JUDGE instead of
abstain: a load-bearing value that clips or ellipsizes only appears under the extreme
variant, never in the flattering demo render. See
`recipes.md#extreme-content-re-render-the-p56-machine-arm`.
<!-- FULL-ONLY-END -->
<!-- LITE-ONLY: ## Extreme-content variants -->
<!-- LITE-ONLY: A file item with `substitutions` renders a REAL variant of the surface with real-extreme content (longest string / max items / biggest number) swapped in before load; the substituted HTML is kept under `<out>/_extreme/` for audit. This is what lets the council's / evaluator's **Content-Robustness** check JUDGE instead of abstain: a load-bearing value that clips or ellipsizes only appears under the extreme variant, never in the flattering demo render. See `recipes.md#extreme-content-re-render`. -->

## Backends behind the contract (degrade gracefully)

1. **Default — `render.mjs`**: Playwright with the channel fallback chain
   `configured → msedge → chrome → bundled chromium`, so it runs on a stock Windows
   (Edge), macOS/Linux (Chrome), or anywhere `npx playwright install chromium` ran.
   Self-contained, no MCP required. This is the path the skill runs.
2. **Optional — live Playwright MCP**: if connected, the same sequence can run through
   it — OPTIONAL, behind this contract, never a hard dependency.

Both backends MUST emit the PNG cells and the `render.json` manifest identically, so
consumers cannot tell which backend ran. Pick ONE browser engine — never run
puppeteer and playwright side by side.
