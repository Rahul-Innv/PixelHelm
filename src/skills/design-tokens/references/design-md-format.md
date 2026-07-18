# DESIGN.md / DTCG canonical format

Source: `google-labs-code__design.md/docs/spec.md` (the DESIGN.md format) +
`terrazzoapp__terrazzo` DTCG guide + rulings C10/C11. DESIGN.md is the
human-and-machine source of truth a design system travels in; the enforced runtime
contract is still the ESM token module + lockstep test. DESIGN.md ↔ `tokens.json`
↔ Figma variables ↔ Tailwind theme convert losslessly because both use typed token
groups and `{path.to.token}` refs.

**Contents:** [File shape](#file-shape) · [Section order](#section-order-c11) ·
[Token types](#token-types) · [Token references](#token-references-c10) ·
[Recommended names](#recommended-token-names-non-normative) ·
[Unknown content](#consumer-behavior-for-unknown-content)

## File shape

Two parts: optional YAML front matter (machine-readable typed tokens) + a markdown
body (human-readable rationale). Prose may use descriptive names ("Midnight Forest
Green") that map to systematic token names (`primary`). **Tokens are normative;
prose is context.** Front matter is delimited by lines containing exactly `---`.

```yaml
---
version: alpha
name: Daylight Prestige
colors:
  primary: "#1A1C1E"
  secondary: "#6C7278"
  tertiary: "#B8422E"
typography:
  h1:
    fontFamily: Public Sans
    fontSize: 48px
    fontWeight: 600
    lineHeight: 1.1
    letterSpacing: -0.02em
---
```

## Section order (C11)

All sections use `<h2>` (`##`). Present sections MUST appear in this order; absent
ones may be skipped. An optional `<h1>` title is not parsed as a section. A
DUPLICATE section heading is an ERROR — reject the file.

1. **Overview** (also "Brand & Style")
2. **Colors**
3. **Typography**
4. **Layout** (also "Layout & Spacing")
5. **Elevation & Depth** (also "Elevation")
6. **Shapes**
7. **Components**
8. **Do's and Don'ts**

Ruling C11: accept VoltAgent-style trailing extras (Responsive / Iteration /
Known-Gaps) as recognized trailing sections so a real-world corpus passes lint —
but keep these 8 canonical sections in order.

## Token types

YAML front-matter groups and their value types:

- `colors: map<string, Color>` — at least `primary` required. Color = any valid CSS
  color string (hex `#RRGGBB` recommended; also named, `rgb()/hsl()/hwb()`,
  wide-gamut `oklch()/lch()/lab()`, `color-mix()`). All converted to sRGB for WCAG
  checking; original preserved for display.
- `typography: map<string, Typography>` — props: `fontFamily` (string), `fontSize`
  (Dimension), `fontWeight` (number), `lineHeight` (Dimension | unitless multiplier
  — multiplier recommended), `letterSpacing` (Dimension), optional `fontFeature`,
  `fontVariation`. Most systems have 9–15 levels (`headline`/`display`/`body`/
  `label`/`caption` × `sm`/`md`/`lg`). Require family/size/weight/lineHeight present
  BEFORE value-level checks.
- `spacing: map<string, Dimension | number>` — a unitless number = column counts /
  ratios.
- `rounded: map<string, Dimension>` — corner radii (`sm`/`md`/`lg`/`full`).
- `components: map<string, map<string, string>>` — per-component property tokens
  (`backgroundColor`, `textColor`, `typography`, `rounded`, `padding`, `size`,
  `height`, `width`), literal or token-ref values. Variants under related keys
  (`button-primary`, `button-primary-hover`, `button-primary-active`).

**Dimension** = a string with unit `px | em | rem`.

## Token references (C10)

Wrap a reference in curly braces with a dotted path to another value:
`{colors.primary-60}`, `{rounded.md}`. For most groups the ref must point at a
PRIMITIVE (`colors.primary-60`), not a group (`colors`). Inside `components`, refs
to COMPOSITE values (`{typography.label-md}`) are allowed.

Ruling C10: use curly-brace `{group.token}` refs — lighter for LLM authoring.
Support DTCG `$ref` JSON-pointers ONLY if a property-level need appears. Emitting
`$ref` pointers in a DESIGN.md is a FAIL.

## Recommended token names (non-normative)

- **Colors:** `primary`, `secondary`, `tertiary`, `neutral`, `surface`,
  `on-surface`, `error`
- **Typography:** `headline-display`, `headline-lg`, `headline-md`, `body-lg`,
  `body-md`, `body-sm`, `label-lg`, `label-md`, `label-sm`
- **Rounded:** `none`, `sm`, `md`, `lg`, `xl`, `full`

## Consumer behavior for unknown content

| Scenario | Behavior |
|---|---|
| Unknown section heading (`## Iconography`) | preserve; do not error |
| Unknown color token name | accept if value valid |
| Unknown typography token name | accept as valid typography |
| Unknown spacing value | accept; store as string if not a valid Dimension |
| Unknown component property | accept with warning |
| Duplicate section heading | ERROR — reject the file |

## DTCG JSON parity

The equivalent `tokens.json` uses `$type` + `$value` per token, infinitely
nestable groups (declare each group name once — avoids the "blue/bleu" typo class),
and the same `{group.token}` ref intent. Use the JSON as an EXPORT target for
Figma/Tailwind/native; the enforced contract stays the ESM module + lockstep test.
