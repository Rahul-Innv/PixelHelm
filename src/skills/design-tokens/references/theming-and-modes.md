# Dark mode, white-label, and DTCG modes

Sources: `terrazzoapp__terrazzo` modes + DTCG-resolvers docs + the two-block dark
plumbing the lockstep test assumes. A "mode" is an ALTERNATE VALUE of a token for a
context the user can only be in one of at a time.

**Contents:** [Dark mode plumbing](#dark-mode-plumbing) ·
[White-label as modes](#white-label-multi-brand-as-modes) ·
[Mode do / dont](#mode-do--dont) · [DTCG modes vs resolvers](#dtcg-modes-vs-resolvers)

## Dark mode plumbing

One light `:root` block + one inside `@media (prefers-color-scheme: dark)`. Every
per-mode token appears in BOTH blocks; mode-independent tokens (spacing, type,
radius) are declared ONCE in the light block. No JS — OS preference drives it. The
lockstep test asserts exactly this two-block shape (`MODES = ['light','dark']`),
so deviating from it breaks the drift guard.

Dark-mode rules baked into the token module:

- Dark `card` uses **surface advancement** (~+5–7% lightness vs `page` + a light
  1px border), NOT a drop shadow — shadows are invisible on dark.
- Many tinted chip backgrounds collapse to `transparent` (outline-only) in dark;
  the test then measures contrast against the card, not the (absent) fill.
- Re-measure contrast in dark independently — a pair that passes light can fail
  dark and vice-versa.

## White-label / multi-brand as modes

A brand is a MODE, not a fork. Keep components mode-agnostic; resolve brand values
through a selector layer:

```css
:root { --primary: #0b6e6e; }                 /* default brand */
[data-brand="acme"]   { --primary: #6d28d9; } /* override only what differs */
[data-brand="globex"] { --primary: #b8422e; }
```

Each brand declares ONLY the tokens that differ from the default (resolver-style
fallback). The lockstep test must run contrast for EVERY brand's resolved values —
add each brand to the test's mode/brand matrix so a new brand can't ship an
AA-failing override. This is the difference between "the spec is white-label" and
"every brand provably passes AA".

## Mode do / dont

A mode is best used for two variations that are NEVER used together on the same
page.

**Do** use a mode for:
- user preferences (text size, reduced motion, colorblind mode)
- device (mobile / desktop)
- region / language
- product area (marketing site vs dashboard)
- **brand / white-label theme**

**Don't** use a mode for things that coexist on one page:
- semantic color (success / error — those are ROLES, present together)
- localized state (disabled / active)
- color shades / hues
- components (Card / Button)

Mixing these into the mode axis is the classic mistake that makes `light` and
`large` fight over the same token. Keep separate "swimlanes" (theme vs size vs
brand).

## DTCG modes vs resolvers

The DTCG format (the canonical token JSON spec) historically expressed modes via
`$extensions.mode`; the Oct-2025 v2025.10 spec standardizes **resolvers** with
named swimlanes and fallbacks (a `dark-protanopia` token can fall back to `dark`,
not `light`). When authoring a DTCG `tokens.json` alongside the module, prefer the
resolver shape for multi-axis theming; the project's enforced contract remains the
ESM module + lockstep test (the JSON is an export target, not the oracle). See
`references/design-md-format.md` for the curly-brace ref syntax this plugin uses
(ruling C10) and the DESIGN.md ↔ tokens.json conversion.
