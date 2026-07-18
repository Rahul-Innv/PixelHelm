---
name: design-color
description: >-
  Color systems and contrast-by-construction. Build perceptual, role-mapped color
  scales that are AA-by-construction, and EMIT them into the design-tokens contract
  (never mint tokens independently). Use when the user says "color palette", "pick
  brand colors", "the teal scale", "AA-safe colors", "fix contrast", "dark-mode
  colors", "accessible palette", or when a contrast/palette finding comes back from
  design-evaluate. NOT the token source of truth itself (that is design-tokens) and
  NOT the contrast GATE (that is design-evaluate) — this designs the color values
  the contract holds.
shell: bash
---

# design-color (color systems & contrast-by-construction)

!`node "${CLAUDE_PLUGIN_ROOT}/scripts/read-lessons.mjs" design-color 2>/dev/null`

Design color that is accessible because of how it is constructed, not because a checker
happened to pass — then hand the values to `design-tokens`, the single source of truth.

This is a craft skill: prose + a recipe, grounded in the active project's `_register`.

## When to use this
Palette creation/repair, semantic color roles, dark-mode color, white-label tenant
accents, or any contrast/palette finding. NOT: defining the token module structure
(design-tokens), running the AA hard gate (design-evaluate), or non-color theming.

## The recipe (best-of-breed)

1. **Author in a perceptual space, never HSL/RGB.** Build ramps in OKLCH (CSS) / HCT
   (Material). *Critical caveat:* the same OKLCH lightness does NOT guarantee equal
   contrast across hues — drive lightness by **CIE L\*/relative luminance** when you need
   a contrast guarantee (Radix/`color.js`/`culori` for the math).
2. **Numbered step -> fixed UI role (Radix Colors model).** A 12-step scale where the
   number tells you BOTH where it's allowed AND that it's accessible there: 1-2 app/subtle
   bg · 3-5 component bg (normal/hover/active) · 6-8 borders (focus ring @8) · 9-10 solid
   fills · 11-12 text (11 low-contrast, 12 high). Ship light + dark + alpha.
3. **Contrast as INPUT, not output (Adobe Leonardo model).** For solid/text colors, state
   the target ratio and solve for the hex, so the palette is compliant by construction.
4. **Make contrast structural (Material HCT).** Tone distance guarantees contrast: a tone
   gap of 40 -> >=3:1, 50 -> >=4.5:1. Turns "is it readable?" into a property of the scale.
5. **On-color pairing.** Every foreground role names the surface it sits on (Material
   `on-*`); separate the brighter "color as text/icon" role from the "solid fill that
   carries on-color" role so one hue never has to be both legible AS text and UNDER text.
6. **Dual-track accessibility.** Gate on **WCAG 2.2** (the legal floor: 4.5:1 text / 3:1
   large+UI, no rounding) AND advise with **APCA Lc** (size/weight aware; never trust a
   single symmetric ratio in dark mode — WCAG-2 false-passes ~49% below #a0a0a0).
7. **Restraint + register.** Grayscale-first, color-last; one accent doing the work; honor
   the project register (e.g. a warm consumer app's two role-locked food-coded accents ·
   a regulated trust portal's single locked teal palette · an analyst data product with
   color reserved for the momentum channel, no-red).
8. **White-label.** A tenant supplies ONE accent, validated at save, usable only in
   contrast-safe slots (chip border / underline / ring / fill) — raw accent carries text
   only if the pair passes AA.

## Emit into the contract (the seam)
Output the resolved values to `design-tokens` (the single source of truth: token module +
computed-AA lockstep + drift guard). `design-color` proposes/repairs values; `design-tokens`
holds them; `design-evaluate` asserts the rendered UI matches and clears the contrast gate.
Never write raw hex outside the token contract.

## Anti-patterns
- Picking colors in HSL and hoping; or trusting same-OKLCH-L to mean same contrast.
- Minting tokens here instead of emitting into design-tokens.
- The generative-AI cyan/neon-teal and the purple->pink gradient (see the profile's `bannedClusters`).

## References
- Read-and-follow `design-tokens` (where the values live + the AA lockstep).
- Real sources: github.com/radix-ui/colors · github.com/adobe/leonardo ·
  github.com/color-js/color.js · github.com/Evercoder/culori.
