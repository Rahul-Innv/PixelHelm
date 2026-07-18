# pixelhelm-render recipes

Concrete render flows. All commands run the pre-written
`${CLAUDE_PLUGIN_ROOT}/skills/pixelhelm-render/scripts/render.mjs` — never regenerate it.

## Contents
- [Webfonts must settle first](#webfonts-must-settle-first)
- [The owner must SEE it (Start-Process)](#the-owner-must-see-it-start-process)
- [Baseline archiving](#baseline-archiving)
- [Tournament-matrix rendering](#tournament-matrix-rendering)
- [Extreme-content re-render](#extreme-content-re-render)
- [Reduced-motion variant](#reduced-motion-variant)
- [Real content width, longest copy](#real-content-width-longest-copy)
- [Re-render only what changed](#re-render-only-what-changed)
- [Environment](#environment)

## Webfonts must settle first

render.mjs awaits `document.fonts.ready` before every screenshot, plus a short settle.
This prevents the L-006 failure: a self-hosted `@font-face` pointing at
missing files silently falls back to `Segoe UI`/`system-ui`, and the owner judges that
font-less render as "cheap/bland." After a render, eyeball the PNG's type: if the
brand font is specified but a system font clearly rendered, the fonts are missing.
If they are OSS, **fetch them yourself** (e.g. Fontsource via jsDelivr)
and re-render — do not leave it an owner to-do.

## The owner must SEE it (Start-Process)

The owner cannot read HTML, a `file://` link, or a DOM dump from chat — they react to
pixels. `--open` makes render.mjs open the PNGs on screen after capture (the files
when ≤4 cells, the folder for bigger matrices; the script picks the OS opener). When
a human is in the loop, ALWAYS pass `--open`; presenting only a path the owner cannot
open defeats the skill's purpose. Omit `--open` only on a pure machine turn feeding
`pixelhelm-evaluate`.

## Baseline archiving

Render the CURRENT UI BEFORE any redesign — honest before/after + a safe revert
("Baseline archiving is a hard requirement"). Point `--out` (or a targets.json
`outDir`) at the project's baseline store in the DURABLE data dir — never inside the
plugin directory (it is replaced on update):

```
node "${CLAUDE_PLUGIN_ROOT}/skills/pixelhelm-render/scripts/render.mjs" \
  --target http://localhost:3000/screen \
  --out "<durable-data-dir>/baselines/<project>/screen" \
  --viewports 1440,768,375 --modes light,dark
```

(The durable data dir and the full store map: `pixelhelm` skill →
`references/close-the-loop.md`.) Do NOT overwrite an existing baseline for a screen —
baselines are the revert point; add a dated subfolder if re-baselining.

## Tournament-matrix rendering

`pixelhelm-generate` produces N competing directions; render ALL of them so
`pixelhelm-judge` and the owner pick the winner (build-spec §2: each direction is
rendered desktop+mobile, light/dark via pixelhelm-render). One out-dir per direction:

```
for D in dir-a dir-b dir-c; do
  node "${CLAUDE_PLUGIN_ROOT}/skills/pixelhelm-render/scripts/render.mjs" \
    --target "build/$D/index.html" --out "out/$D" \
    --viewports 1440,375 --modes light,dark --open
done
```

(Tablet 768 can be dropped for the pick stage to save cost; restore the full
1440/768/375 matrix for the chosen winner before pixelhelm-evaluate.)

## Extreme-content re-render
The council's / evaluator's **Content-Robustness** check must never judge the flattering demo render — a load-bearing value that clips only shows under REAL-extreme content (validated originally on a 53-char company name @ 1440 + 820px, where the flattering render showed none of the wrap risk). Give it its evidence with a
`substitutions` target — copy `targets/extreme-content.template.json` and fill in the
surface's longest REAL strings / max counts / biggest numbers:

```json
{
  "outDir": "renders/screen-x-extreme",
  "viewports": [{ "name": "1440w", "width": 1440, "height": 900 },
                 { "name": "820w",  "width": 820,  "height": 900 }],
  "modes": ["light", "dark"],
  "items": [{
    "name": "screen-x-extreme",
    "file": "path/to/screen-x.html",
    "substitutions": [
      { "find": "Acme",  "replace": "A Fifty-Three Character Organization Name For Wrap" },
      { "find": "$1.2M", "replace": "$1,234,567,890.00" }
    ]
  }]
}
```

Rules: substitutions are REAL-extreme (the longest value the data can actually hold),
never lorem; the set MUST also swap every DERIVED string — totals, after-tax/net
values, %-offs, deltas, counts — recomputed by YOU, the author of the set, so the
extreme variant is never self-contradictory (a swapped price beside an unswapped
"after-tax" total reads as a math bug and poisons the judgment); use the narrow
viewport the container actually renders at (not just
desktop); render BOTH modes; hand the evaluator the extreme PNGs alongside the normal ones. If a surface can't be re-rendered this way (a live app state you can't reproduce), the content-robustness check ABSTAINS — an abstain is "unassessed", never a PASS.

## Reduced-motion variant

When the screen animates, also capture the reduced-motion state so pixelhelm-evaluate can
verify the motion DEGRADES (cross-fade/opacity) rather than being killed:

```
node "${CLAUDE_PLUGIN_ROOT}/skills/pixelhelm-render/scripts/render.mjs" \
  --target <t> --out <dir>-rm --reduced-motion --modes light,dark
```

(Use a separate out dir for the variant pass — filenames don't carry an rm marker.)

## Real content width, longest copy

Render at the app's TRUE container width, not a guess — a too-narrow render shows a
false "it wraps", a too-wide one hides a real wrap (L-010). Read the real container
width from the project profile / the app's CSS and pass it explicitly:

```
node "${CLAUDE_PLUGIN_ROOT}/skills/pixelhelm-render/scripts/render.mjs" \
  --target <t> --out <dir> --viewports <real-container-width>
```

The active project profile carries the register and content constraints. Never
homogenize — the register differs per project; pixelhelm-render captures faithfully and
imposes no look. Use REAL fixtures only — no fabricated companies/amounts/metrics in
the rendered copy (L-004); show the LONGEST realistic copy per state.

## Re-render only what changed

pixelhelm-render is cost-aware. After a `pixelhelm-repair` that touched one viewport or one
token, re-render only the affected cell — pass the single `--viewports`/`--modes` value
rather than the full matrix. Restore the full matrix before the final evaluate pass.

## Environment

- **Browser**: Playwright with a channel fallback chain — the configured channel →
  system Edge (`msedge`) → system Chrome (`chrome`) → bundled Chromium. A stock
  Windows box uses Edge, macOS/Linux typically Chrome; no Playwright browser download
  is needed when a system browser exists (`PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1 npm i`).
- **No browser at all**: render.mjs exits 2 with a clear message — install Edge/Chrome,
  run `npx playwright install chromium`, or connect a Playwright MCP; do not silently
  produce no artifacts.
- **Optional live MCP backend**: a connected Playwright MCP can serve the same
  contract (see `contract.md`); it is never required. Detect-and-degrade — if no MCP,
  use the default Edge path.
- **Opener**: Windows uses PowerShell `Start-Process`; render.mjs selects the OS
  opener for `--open`.
