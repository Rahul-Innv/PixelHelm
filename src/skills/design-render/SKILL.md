---
name: design-render
description: This skill should be used when the user wants to "render the UI", "screenshot the design", "show me the screen", "see it in a real browser", "capture light and dark", "render at mobile/desktop", "open the PNG so I can see it", or when another design skill needs rendered screenshots to judge or evaluate UI. Renders a URL or HTML file in a real system browser via Playwright (Edge/Chrome channel fallback), captures full-page screenshots at 1440/768/375 in light and dark, settles webfonts before the shot, then opens the PNG so the OWNER actually sees it (the owner cannot read HTML or file:// links from chat). Also use to baseline-archive a project's current UI before a redesign, to render every tournament direction for design-council, and to produce the P56 extreme-content re-render (substitutions target). Not for scoring or grading (that is design-evaluate) and not for producing UI (that is design-generate).
disable-model-invocation: false
user-invocable: true
shell: bash
---

# design-render

!`node "${CLAUDE_PLUGIN_ROOT}/scripts/read-lessons.mjs" design-render 2>/dev/null`

Render real UI in a real browser, capture proof at every viewport in both color
modes, and **show the owner the PNG**. This skill produces the rendered artifacts
every downstream design skill depends on; it does not judge them.

## Purpose

The owner cannot read HTML, `file://` paths, or a DOM dump from chat — they judge
quality by *seeing pixels*. Generators and evaluators that never render against the
real browser hallucinate (wrong font, fabricated data, dark-mode failures invisible
until on-device). This skill closes that gap: it drives a **real system browser**
via Playwright (channel fallback: Edge → Chrome → bundled Chromium — no browser
download needed when a system browser exists), settles webfonts, screenshots at
**1440 / 768 / 375** in **light + dark**, and opens the result on the owner's screen
so they react to reality.

It is the render half of the loop: `design-generate` produces UI → **design-render**
captures it → `design-council` / the owner pick → `design-evaluate` Layer-1 reads the
same artifacts to hard-gate. design-render emits a fixed artifact set so those skills
depend on the **contract, not the tool**.

## When this runs (routing)

The `design` router dispatches here — do not re-implement routing. design-render is
invoked for: REVIEW/EVAL (render → evaluate), FIX (re-render after a patch),
NEW/REDESIGN (render each direction for the council + owner), and **baseline
archiving** (render the current UI BEFORE any redesign, for honest before/after and a
safe revert). When a single-token fix changed one viewport, re-render only that
viewport — rendering is cost-aware.

## Run it — do not rewrite the script

The render engine is the pre-written, source-visible script
`${CLAUDE_PLUGIN_ROOT}/skills/design-render/scripts/render.mjs`. **Run it; never
regenerate its logic** (LOW-altitude: a fragile browser/font/Start-Process sequence
where consistency is critical). Inspect its real flags first:

```
node "${CLAUDE_PLUGIN_ROOT}/skills/design-render/scripts/render.mjs" --help
```

Canonical full-matrix invocation (URL or HTML file, all viewports, both modes,
fonts settled, PNG opened for the owner):

```
node "${CLAUDE_PLUGIN_ROOT}/skills/design-render/scripts/render.mjs" \
  --target <url|file.html> \
  --out <absolute-out-dir> \
  --viewports 1440,768,375 \
  --modes light,dark \
  --open
```

`--open` puts the PNGs on the owner's screen. Omit `--open` only
when rendering purely to feed `design-evaluate` (no human in the loop that turn).
Add `--axe` when the render feeds a Layer-1 verdict: it runs the vendored axe-core
suite on every rendered cell (both modes) and writes per-cell serious/critical
violations into `render.json` — `design-evaluate` treats any serious/critical as a
Layer-1 FAIL; render itself only reports.
See `references/cli.md` for every flag (`--reduced-motion`, `--modes asis`,
`--channel`, `--axe`, config-file mode with multi-item targets + `substitutions`)
and the exact output paths.

## The artifact contract (what render emits)

Every run writes, per item × viewport × mode, a **fullPage PNG** —
`<name>__<vp>__<mode>.png` — plus ONE **`render.json` manifest** listing every cell
with its **`modeFidelity`** verdict (the KB L-028 H2 assertion: the rendered
background luminance must match the requested mode, or the cell is flagged and a
register mode clause must not be judged from it) and an `extreme` flag for
substitution variants. Consumers depend on this contract, not on Playwright.

**Never inject model-authored JavaScript into the page** — render.mjs runs exactly
three FIXED snippets (the theme setter, the luminance probe, and — only under
`--axe` — the vendored axe-core suite from this skill's own node_modules) plus one
FIXED style tag (transitions/animations off, so the probe and the shots read end-states,
never a mid-transition blend); arbitrary in-page JS is a code-execution hole. Full contract + what is deliberately NOT
emitted: `references/contract.md`.

## Decision Criteria

A render PASSES only when ALL of the following hold (objective; gradeable by a schema
gate + LLM judge). Any unmet item is a FAIL — fix and re-render, do not report a
partial render as done.

- **PASS** webfonts are LOADED before every screenshot (`document.fonts.ready`
  awaited; the PNG shows the brand font, not a `Segoe UI`/`system-ui` fallback).
  **FAIL** = showing a font-less render — the owner reads
  it as "cheap/bland" (L-006). If brand fonts are OSS and missing, fetch them, do not
  defer to the owner.
- **PASS** the full matrix exists: a screenshot for **each** requested viewport × each
  requested mode, `render.json` listing every cell, exit code 0, and no
  `modeFidelity: "warn"` cells relied on for a mode judgment. **FAIL** = a
  single-viewport or single-mode render presented as complete (L-010), or a partial
  matrix (exit 1) reported as done.
- **PASS** the render uses **REAL sample data / fixtures**; no fabricated companies,
  dollar amounts, metrics, or licenses appear (L-004). **FAIL** = any invented fact
  in the rendered copy.
- **PASS** the screen is rendered at the project's **real content width** and shows
  the **LONGEST realistic copy** per state (L-010). **FAIL** = a guessed width that
  produces a false "it wraps" / hides a real wrap.
- **PASS** an extreme-content (`substitutions`) variant swaps every DERIVED string too —
  totals, after-tax/net values, %-offs, deltas, counts, recomputed by the AUTHOR of the
  substitution set — so the extreme render is never self-contradictory. **FAIL** = an
  extreme render whose derived values still describe the demo data (a swapped price beside
  an unswapped "after-tax" total reads as a math bug and poisons the content-robustness
  judgment).
- **PASS** when motion exists, a `prefers-reduced-motion` variant is also captured
  (`--reduced-motion`) for design-evaluate's motion-a11y check.
- **PASS** the screenshot is `fullPage` (whole scrollable screen), not just the fold.
- **PASS** when a human is in the loop, the PNG is OPENED (`--open` / Start-Process);
  reporting a path the owner cannot open is a FAIL of this skill's whole reason to
  exist.

## Per-project register — never homogenize

Render against the active project's profile, which sets the real content width,
the token module, and the register. Pass the app's TRUE container width via
`--viewports` (read it from the profile / the app's CSS), never a guess (L-010).
design-render captures faithfully — it imposes no aesthetic of its own.

## Baselines (archive before redesign)

Before any redesign, render the CURRENT UI to the baseline store (in the durable
data dir, never inside the plugin) so before/after is honest and revert is safe.
See `references/recipes.md#baseline-archiving`.

## Environment

Playwright with a browser-channel fallback chain: the configured channel → system
Edge → system Chrome → bundled Chromium (install once per plugin version with
`PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1 npm i` in this skill's directory — a system
browser means no Playwright browser download). The `--open` opener is
OS-appropriate (Start-Process / open / xdg-open). `references/recipes.md#environment`
covers the no-browser fallbacks and the optional live Playwright-MCP backend (one
backend behind the same contract).

## Install (one-time, and after each plugin update)

```
cd "${CLAUDE_PLUGIN_ROOT}/skills/design-render"
PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1 npm i
```

(The installed plugin directory is per-version — re-run after an update. Without a
system Edge/Chrome, drop the env var or run `npx playwright install chromium`.)

## Additional Resources

- **`references/cli.md`** — every render.mjs flag, config-file mode, outputs, exit codes.
- **`references/contract.md`** — the PNG + render.json contract, mode-fidelity,
  extreme-content variants, and why model-authored in-page JS is banned.
- **`references/recipes.md`** — baseline archiving, tournament-matrix rendering, the
  P56 extreme-content re-render, reduced-motion, the opener, offline fallbacks.
- **`targets/extreme-content.template.json`** — copy-and-fill target for the P56 arm.
