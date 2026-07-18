# Font loading & CLS elimination

Table of contents:
- [The recipe](#the-recipe)
- [Format and self-hosting](#format-and-self-hosting)
- [Preload the critical face](#preload-the-critical-face)
- [font-display](#font-display)
- [The metric-matched fallback (the CLS killer)](#the-metric-matched-fallback-the-cls-killer)
- [The four-descriptor formula](#the-four-descriptor-formula)
- [Worked example](#worked-example)
- [Where to get metrics](#where-to-get-metrics)
- [The CLS-safe check](#the-cls-safe-check)

Source: web.dev "Improved font fallbacks" + the Chrome blog font-fallbacks article
(the override math). The biggest shipped typography bug is layout shift when the web
font swaps in over a differently-sized fallback. This recipe drives that shift to ≈0.
Generate the fallback with `scripts/font-fallback.mjs`.

## The recipe
1. WOFF2 only, self-hosted, subset.
2. Preload the critical face with `crossorigin`.
3. `font-display: swap` (brand-critical) or `fallback`/`optional` (shift-sensitive).
4. A metric-matched fallback `@font-face` from a `local()` system font.
5. Stack = `['Web', 'Web-fallback', <system stack>]`.

## Format and self-hosting
- **WOFF2** gives the best compression / performance; no other format is needed for
  evergreen browsers.
- **Self-host** (don't hot-link a third-party CDN) for privacy, reliability, and so
  preload works predictably.
- **Subset** to the glyphs/weights actually used (Latin + the punctuation in
  `numerics.md` — curly quotes, em/en dashes, ellipsis). Loading whole families is a
  waste and a perf bug.

## Preload the critical face
```html
<link rel="preload" as="font" type="font/woff2" crossorigin
      href="/fonts/Inter-roman.var.woff2">
```
`crossorigin` is **required even when self-hosting** (fonts are always fetched in
CORS mode); omit it and the browser double-fetches. Preload ONLY the above-the-fold
critical face(s), not every weight.

## font-display
- `swap` — show fallback immediately, swap to web font when ready. Best for
  brand-critical headings where the face matters.
- `fallback` — short block, then keep the fallback if the web font is late. Good
  middle ground.
- `optional` — use the web font only if it's essentially instant; otherwise keep the
  fallback for the whole page load. Best when CLS/perf outranks the brand face.
- **Never `block`** (FOIT / invisible text) for body copy.

## The metric-matched fallback (the CLS killer)
`font-display: swap` alone still shifts layout, because the system fallback and the
web font have different per-glyph metrics — text reflows when the swap happens. Fix it
with a SECOND `@font-face` that re-shapes a `local()` system font to the web font's
metrics, so the fallback occupies the web font's exact box. Zero shift on swap.

```css
@font-face {
  font-family: 'Inter-fallback';
  src: local('Arial');
  size-adjust: 107.40%;        /* computed, never hardcoded */
  ascent-override: 90.00%;
  descent-override: 22.43%;
  line-gap-override: 0.00%;
}
:root { --font-sans: 'Inter', 'Inter-fallback', system-ui, sans-serif; }
```

## The four-descriptor formula
Computed from the WEB font's metrics, normalized by units-per-em (UPM):

```
size-adjust       = webfont.avgCharWidth / fallback.avgCharWidth        (as %)
ascent-override   = webAscent  / (webUPM * size-adjust)                  (as %)
descent-override  = webDescent / (webUPM * size-adjust)                  (as %)
line-gap-override = webLineGap / (webUPM * size-adjust)                  (as %)
```

All four expressed as percentages. `size-adjust` corrects horizontal advance (so line
breaks match); the ascent/descent/line-gap overrides correct vertical box (so line
heights match). `size-adjust: 100%` is the deceptive trap — real cross-family matches
(e.g. Arial → a tall x-height web font) need genuine per-font numbers. Never hardcode.

## Worked example
Roboto over an Arial fallback (Chrome blog's canonical example) lands near
`size-adjust: 100.06%`, which looks trivial — that is a coincidence of two similar
metrics. Inter over Arial does NOT: it needs ~107% size-adjust and ~90% ascent. The
lesson: always COMPUTE from the actual pair; never copy a percentage between fonts.

## Where to get metrics
The formula needs real font metrics (UPM, ascent, descent, lineGap, avgCharWidth),
which require reading the font binary or a precomputed dataset — a SKILL cannot derive
them from a font name alone:
- `@capsizecss/metrics` — parses arbitrary fonts (a dep, but general).
- `khempenius/font-fallbacks-dataset` — precomputed overrides for Google Fonts
  (lighter, offline-friendly, Google-Fonts-only). Prefer this for the common case.
- `unjs/fontaine` / `next/font` — automate the whole thing in a build; reference, do
  not reimplement.

`scripts/font-fallback.mjs` reads from the dataset (or capsize when present) and emits
the `@font-face`. Do not hand-roll metrics.

## The CLS-safe check
Emit a "CLS-safe" PASS only when **every** web face used has a corresponding
metric-matched fallback `@font-face` AND the critical face is preloaded with
`crossorigin`. A web font without a metric-matched fallback is a CLS finding for
`design-evaluate` (which also measures CLS ≤ 0.1 on the rendered page).
