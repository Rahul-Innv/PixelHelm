# The lockstep pattern (why + rules)

Source: `design/tokens-and-aa-enforcement.md` (production-verified) + the runnable
`templates/tokens.template.mjs` / `tokens.test.template.mjs` pair. This file is the
*why and the rules*; the templates are the *how*.

**Contents:** [The pattern in one paragraph](#the-pattern-in-one-paragraph) ·
[Rules table](#rules-parameter--default--rationale) · [Pitfalls](#pitfalls-each-one-happened)

## The pattern in one paragraph

Every design value (color, type, spacing, radius, elevation, icon glyph) lives in
ONE ESM module, named by semantic role (`SEMANTIC_COLORS.POSITIVE`), never by hue.
A partner `node:test` file makes two guarantees PERMANENT: (1) it re-computes exact
WCAG 2.x contrast for every color pair in every mode and fails under threshold —
**change the hex, never the threshold**; (2) it parses every downstream surface
(CSS `:root` custom-property blocks, hardcoded JS/JSX maps, key sets in template
engines) and fails on any name/value drift. Surfaces that can't import ESM mirror
the names; the test makes the mirror honest. Enforcement is mechanical, not
aspirational — discipline does not survive refactors; tests do.

## Why a partner `node:test`, not a linter config

The contrast math, the mode shape, and the drift comparison are all in ONE file
the project already runs (`node --test`, zero deps). It is the single oracle: a
new hire who lowers a hex sees the test go red with the exact pair and ratio. The
template ships the exact WCAG 2.x sRGB-channel math (`srgbChannel` → `luminance` →
`contrast` = (hi+0.05)/(lo+0.05)); **do not modify that block** — only the hex
values and the `SURFACES`/`THRESHOLDS`/`FILLED_ROLES` knobs are edited.

## Rules (parameter · default · rationale)

| Parameter | Default | Rationale |
|---|---|---|
| Token shape | role-based `{role}.{mode}.{bg,fg,border}` — never raw hex in components | M3/Carbon/Polaris all parameterize by semantic role; values swap per project |
| Text contrast | ≥ 4.5:1 vs every surface it sits on | WCAG 2.2 AA — threshold is a constant, never a negotiation |
| Graphic/border contrast | ≥ 3:1 vs card | WCAG 2.2 AA non-text |
| Saturation hierarchy | ONE filled, saturated role = the single positive verdict; everything else tinted/outline | the loud element must be unique to stay loud (`FILLED_ROLES` in the test) |
| Redundant cues | icon + label + shape (e.g. dashed border for unverified), never color alone | WCAG 1.4.1; grayscale must still read |
| Type scale | base 14px × ratio 1.125 (dense UI), `clamp()` fluid, ONE ratio system-wide | 1.2+ is editorial, not instrument-panel — actual scale comes from `pixelhelm-typography` |
| Line-height | 1.5 body/labels, 1.2 display | M3/Butterick/WCAG 1.4.12; inverse to size |
| Size floors | body ≥ 14px, secondary ≥ 12px, nothing functional < 12px | Apple HIG / M3 floors |
| Font weights | 400 body / 500–600 labels / 700 emphasis; never < 400 under 16px | light weights fail small |
| Spacing | 4px grid, named scale, nesting rhythm 16 → 8 → 4 (card → section → element) | rhythm beats ad-hoc gaps |
| Radius | 6–10px surfaces, 999px pills only | 12px+ reads soft |
| Elevation (light) | layered 2-shadow + 1px border | single naive shadow reads flat |
| Elevation (dark) | NO shadow; card ~+5–7% lightness vs page + light 1px border | shadows are invisible on dark |
| Mode plumbing | one `:root` light block + one inside `@media (prefers-color-scheme: dark)`; every per-mode token in both | OS preference, no JS; the test assumes this shape |
| Numerals | `font-variant-numeric: tabular-nums` on EVERY monetary/numeric column | numbers must not jiggle |
| Webfont (data UI) | variable font, pinned CDN, `font-display:swap`, metric-matched fallback actually wired into the stack | a fallback defined but not in the font stack is dead code (real bug) |

Hex values, font stacks, and CDN pins anywhere in this doc set are EXAMPLES from
one project (they pass AA so the templates run green out of the box) — they are not
a recommended palette. Taste belongs to the project owner; the per-project REGISTER
(e.g. a regulated trust portal's serious-trust teal-only, a warm consumer app's
warm-premium-fun, an analyst data product's
analyst-terminal) lives in its profile, never homogenized here.

## Project-semantics guards

Beyond contrast + drift, encode the project's DOMAIN rules as assertions so a
refactor can't silently violate them. Two real patterns from the template:

- **channel-order guard** — an "unverified" role must stay muted amber, never read
  red or green: `const [r,g,b] = hexChannels(fg); assert.ok(r >= g && g > b)`.
- **copy-guard pairs** — a NEGATIVE assertion ("no positive color on unverified
  rows") is vacuous alone; pair it with the POSITIVE twin ("the positive color DOES
  appear on verified rows"). A guard with no companion positive test is a
  vacuously-green guard.

## Pitfalls (each one happened)

- Loosening a threshold to ship a color: the threshold IS the contract.
- Styling values living in JSX/inline literals instead of tested CSS classes —
  they escape the lockstep. Move them into classes/tokens the test greps.
- The "metric-matched fallback" defined in `@font-face` but missing from the
  `font-family` stack — silently dead, CLS work lost.
- A guard with no companion positive test — vacuously green.
- Skipping the non-vacuity ritual: an enforcement test never seen red proves nothing.
