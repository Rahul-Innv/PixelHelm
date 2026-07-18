# render.mjs — CLI reference

The render engine is pre-written and source-visible at
`${CLAUDE_PLUGIN_ROOT}/skills/pixelhelm-render/scripts/render.mjs`. This skill RUNS it;
it does not regenerate the logic. The script is the source of truth — confirm the live
flag set with `--help` before relying on this doc.

## Two invocation modes

**Flag mode** (one target, quick):

```
node "${CLAUDE_PLUGIN_ROOT}/skills/pixelhelm-render/scripts/render.mjs" \
  --target <url|file.html> [--out <dir>] [flags]
```

**Config mode** (multi-item matrices, baselines, tournaments, extreme-content):

```
node "${CLAUDE_PLUGIN_ROOT}/skills/pixelhelm-render/scripts/render.mjs" <targets.json>
```

## Flags

| Flag | Default | Meaning |
|---|---|---|
| `--target <url\|path>` | (required in flag mode) | URL (e.g. `http://localhost:3000/x`) or a path to an HTML file. |
| `--out <dir>` | `renders` | Output directory (resolved from the cwd in flag mode). |
| `--name <n>` | file stem / `page` | The item name used in output filenames. |
| `--viewports <list>` | `1440x900` | Comma-separated `W` or `WxH` (bare width gets height 900), e.g. `1440,768,375` or `1440x900,375x812`. |
| `--modes <list>` | `light` | `light`, `dark`, and/or `asis` (render the page untouched — no theme forcing). |
| `--channel <c>` | (fallback chain) | Preferred browser channel; the chain `<channel> → msedge → chrome → bundled chromium` is always tried in order. |
| `--reduced-motion` | off | Emulate `prefers-reduced-motion: reduce` for every cell (use a separate `--out` for the variant pass). |
| `--open` | off | After capture, open the PNGs on the owner's screen (files if ≤4 cells, else the folder). REQUIRED when a human is in the loop (L-013). |
| `--axe` | off | Run the vendored axe-core suite on every rendered cell; per-cell `axe: {serious, critical, violations[]}` lands in `render.json` plus a run total. Report-only here — `pixelhelm-evaluate` Layer-1 gates on serious/critical. Config mode: `"axe": true`. Needs `axe-core` from this skill's `npm i`. |
| `--help` | — | Print the live flag set. |

## targets.json (config mode)

```json
{
  "browserChannel": "msedge",
  "outDir": "renders/my-surface",
  "viewports": [{ "name": "desktop", "width": 1440, "height": 900 }],
  "modes": ["light", "dark"],
  "darkAttr": "data-theme",
  "reducedMotion": false,
  "open": false,
  "items": [
    { "name": "screen-x", "file": "relative/or/abs/path.html" },
    { "name": "screen-y", "url": "http://localhost:3000/y" },
    { "name": "screen-x-extreme", "file": "path.html",
      "substitutions": [ { "find": "Acme", "replace": "A Fifty-Three Character Organization Name For Wrap" } ] }
  ]
}
```

- Paths resolve relative to the targets.json file.
- `darkAttr` is the attribute set on `<html>` per mode (both `data-theme` and a
  `dark`/`light` class are set — covers both theming idioms).
- `substitutions` (file items only) swap demo strings for real-extreme content before
rendering — the extreme-content machine arm. See `recipes.md#extreme-content-re-render`.

## Outputs

Per item × viewport × mode: `<name>__<vp>__<mode>.png` (fullPage, deviceScaleFactor 2),
plus ONE `render.json` manifest in the out dir:

```json
{ "generated": "...", "viewports": [...], "modes": [...], "darkAttr": "data-theme",
  "shots": [ { "file": "screen-x__desktop__dark.png", "item": "screen-x",
               "viewport": "desktop", "mode": "dark",
               "modeFidelity": "ok|warn|n/a", "extreme": false } ] }
```

`modeFidelity: "warn"` means the rendered background luminance CONTRADICTS the requested
mode (the theme likely didn't apply — KB L-028 H2): never judge a register mode clause
off that cell. Substituted (extreme) HTML variants are kept under `<out>/_extreme/`.

## Exit codes

- `0` — every requested cell captured (fonts settled, matrix complete).
- `1` — one or more cells/items FAILED (navigation or screenshot). stderr names each
  `[skip]`/`[fail]`. Do not present a partial matrix as done — fix and re-render.
- `2` — config/usage/browser-launch error (bad flags, unreadable targets.json,
  playwright not installed, no launchable browser).
