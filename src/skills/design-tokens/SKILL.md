---
name: design-tokens
description: >-
  The single source-of-truth seam for design values — produces and enforces the
  ONE token module + DESIGN.md the whole front-end-design plugin reads from.
  Use whenever the user mentions "design tokens", "design system", a "DESIGN.md",
  a token contract, semantic color roles, "AA/WCAG-checked colors", contrast
  ratios, "the CSS keeps drifting from the theme", dark mode, white-label /
  multi-brand / theming, a token drift guard, or "make the rendered page actually
  match the tokens" (conformance). Also use when generate/render/evaluate need
  the token contract, or before styling anything with more than one surface or
  more than one mode. NOT for picking a brand palette from scratch (that is
  design-color), the fluid type scale (design-typography), motion tokens
  (design-motion), or grading taste (design-council).
shell: bash
---

# design-tokens — the token contract seam

!`node "${CLAUDE_PLUGIN_ROOT}/scripts/read-lessons.mjs" design-tokens 2>/dev/null`

The token module is the SPINE of this plugin. Everything else binds to it:
`design-color`/`design-typography`/`design-motion` **emit into** it,
`design-generate` **consumes** it (no raw hex in components), `design-render`
**injects** it, `design-evaluate` **asserts conformance** against it. One rule
holds the whole thing together: **change the hex, never the threshold.**

> Routing is owned by the `design` router skill — do not re-implement it here.
> This skill is invoked when the work is the token contract itself.

The preamble above injects this skill's vetted lessons — they override the
defaults below on conflict.

## Purpose

Establish and enforce ONE authoritative token module per project so that (a)
every design value lives in exactly one place named by semantic ROLE, (b) WCAG
AA contrast is recomputed mechanically and can never silently regress, (c) every
downstream surface (CSS `:root`, JS maps, email, DESIGN.md) is provably in
lockstep with the module, and (d) the rendered DOM is proven to match the tokens
(conformance — the gap nobody else closes). This is mechanical, not aspirational:
discipline does not survive refactors; tests do.

## What this skill owns vs. delegates

| Owns (do here) | Delegates to |
|---|---|
| The token MODULE shape + the lockstep test (computed-AA + drift guard) | — |
| DESIGN.md / DTCG authoring + the canonical format | `design-reference` (retrieval of exemplars) |
| Color ROLE map, dark-mode plumbing, white-label theming structure | `design-color` (perceptual hex generation) |
| Wiring type/motion tokens INTO the module | `design-typography` / `design-motion` (the values) |
| CONFORMANCE assertion (computed === resolved token) | `design-render` (captures DOM), `design-evaluate` (runs the gate) |

This skill defines the *contract and the enforcement*; the value-producers fill
in AA-passing numbers. When asked to "build the palette" or "the type scale",
route to `design-color` / `design-typography` and have them emit into the module
defined here.

## Procedure (the lockstep wiring)

Drives the runnable pair that ships in this skill:
`${CLAUDE_PLUGIN_ROOT}/skills/design-tokens/templates/tokens.template.mjs` and
`tokens.test.template.mjs`. Copy BOTH, fill values, wire surfaces — never
hand-author the contrast math.

1. **Inventory with the owner.** Semantic roles (verdict/confidence/state names —
   by MEANING, never hue), modes (light/dark, plus any white-label brands), and
   every surface that will render them.
2. **Copy AND RENAME the pair.** `tokens.template.mjs` → `<project>/lib/tokens.mjs`;
   `tokens.test.template.mjs` → `<project>/test/tokens.test.mjs` (the test file
   MUST end `.test.mjs` for `node --test` discovery). Fix the test's import line
   to point at the renamed module.
3. **Replace every `EXAMPLE` block** with the project's values. **COMPUTE
   AA-passing hex** — the test is the computer; never eyeball (eyeballed palettes
   fail AA routinely). For NEW palettes, hand the role+contrast targets to
   `design-color` and paste back its emitted hex.
4. **Register each surface** in the test's `SURFACES` list as
   `css-root` | `js-map` | `key-set` (recipe table in `references/surface-recipes.md`).
5. **Run `node --test`.** Fix hex until green.
6. **Non-vacuity ritual (MUST, once per wiring).** Break one hex on purpose →
   the test MUST fail with a contrast/drift message → restore. An enforcement
   test you have never seen fail proves nothing.
7. **On every later color change:** edit the token module, keep the test green,
   and let the lockstep FAILURES walk you to every surface. Never edit a surface
   directly.

## Decision Criteria (PASS / FAIL — a schema gate + LLM judge grades these)

A token contract this skill produces is **PASS** only if ALL hold; any single
miss is **FAIL**.

- **PASS** every design value (color, type, spacing, radius, elevation, icon)
  resolves from the token module; components reference tokens only (CSS `var(--…)`
  / a token ref), no raw hex, no `text-white`/`bg-black`, no `p-[16px]` literals.
  **FAIL** a styling literal lives in a component/JSX/inline style instead of a
  token — it escapes the lockstep.
- **PASS** roles are named by MEANING (`SEMANTIC_COLORS.POSITIVE`, `--ink`,
  `--canvas`, `surface-elevated`). **FAIL** roles named by hue (`--teal-500`,
  `--gray-700`) or by template-flavored generics that "evoke a template, not a
  world".
- **PASS** the partner `node:test` recomputes WCAG 2.x contrast for every pair in
  every mode at the constant thresholds (text ≥ 4.5:1, graphic/border ≥ 3:1) and
  is green. **FAIL** any threshold was loosened to ship a color, or a pair sits
  under threshold.
- **PASS** every per-mode token exists in BOTH the light block and the dark block;
  dark elevation uses surface advancement (~+5–7% lightness + 1px border), not a
  shadow. **FAIL** a token defined in one mode only, or a drop-shadow used on dark.
- **PASS** exactly ONE filled/saturated role (the single positive verdict);
  state is also carried by icon + label + shape (e.g. dashed border for
  unverified), never color alone. **FAIL** multiple loud fills, or meaning carried
  by color alone (fails grayscale / WCAG 1.4.1).
- **PASS** every mirroring surface is registered in `SURFACES` and the drift test
  is green. **FAIL** a surface mirrors tokens with no lockstep entry.
- **PASS** the non-vacuity ritual was performed (a deliberate break was observed
  to fail, then restored). **FAIL** the enforcement test has never been seen red.
- **PASS** (when a DESIGN.md is produced) it follows the canonical format:
  curly-brace `{group.token}` refs, the 8 sections in order, ≥ `primary` color +
  required typography props present. **FAIL** `$ref` JSON-pointers, out-of-order
  or duplicate sections, missing required props (see `references/design-md-format.md`).
- **PASS** (when conformance is in scope) the rendered DOM is asserted —
  `getComputedStyle` on token-bound elements equals the resolved token value
  within the sRGB rounding epsilon. **FAIL** validation stopped at the spec and
  never checked the browser.

Always print the honest banner alongside a PASS: *these gates prove
tokens/contrast/no-drift/conformance correctness — they do not prove taste.*

## Color roles, dark mode, white-label (summary)

- **Role scale:** adopt the Radix 12-step ROLE map (bg → component bg → borders →
  solid → text) but use **flat semantic names**, not MD3 `ref/sys/comp` prefixes
  (ruling C7). Layer aliasing conceptually; do not force the prefixes onto an
  LLM-authored DESIGN.md. Full step→role map in `references/color-roles.md`.
- **Dark mode:** one light `:root` + one inside `@media (prefers-color-scheme:
  dark)`; every per-mode token in both blocks (no JS). The lockstep test assumes
  exactly this two-block shape.
- **White-label / theming:** a brand is a MODE, not a fork. Add brand values as
  alternate token values resolved by a `[data-brand]` / `.theme-*` selector layer;
  keep components mode-agnostic. See `references/theming-and-modes.md` (mode rules:
  a mode is for two variations never used together — never for semantic color or
  localized state).

## Conformance — the moat

Validating a DESIGN.md or a tokens file is **NOT conformance** (ruling C15).
After render, prove the browser actually applied the tokens: read
`getComputedStyle` on each token-bound element and assert it equals the resolved
token value (sRGB epsilon, owner-set). This closes the loop nobody else does.
This skill OWNS the assertion contract; the deterministic gate that runs it is
`design-evaluate`'s `${CLAUDE_PLUGIN_ROOT}/skills/design-evaluate/scripts/static-gates.mjs`
and the DOM is captured by `${CLAUDE_PLUGIN_ROOT}/skills/design-render/scripts/render.mjs`
— REFERENCE them, do not re-author them. Details in `references/conformance.md`.

## Resources

- `references/lockstep-pattern.md` — the why + rules table (parameter · default ·
  rationale) for token shape, contrast, saturation, type, spacing, elevation, modes.
- `references/surface-recipes.md` — `css-root` / `js-map` / `key-set` wiring,
  email-as-key-set, per-role CSS-rule coverage.
- `references/color-roles.md` — Radix 12-step role map, flat-name ruling,
  contrast-as-input via `design-color`.
- `references/theming-and-modes.md` — dark mode plumbing, white-label as modes,
  DTCG modes/resolvers, mode do/don't.
- `references/design-md-format.md` — canonical DESIGN.md / DTCG schema, section
  order, curly-brace refs, consumer behavior for unknown content.
- `references/conformance.md` — the rendered-DOM assertion contract + epsilon.
- `templates/tokens.template.mjs` + `templates/tokens.test.template.mjs` — copy,
  rename, fill, wire (relocated in by the orchestrator).

## Anti-patterns (reject)

- Loosening a contrast threshold to ship a color — the threshold IS the contract.
- Styling values in JSX/inline literals instead of tested token classes.
- A "metric-matched fallback" in `@font-face` but missing from the `font-family`
  stack — silently dead.
- A guard with no companion positive test — vacuously green; pair every negative
  assertion with its positive twin.
- Naming tokens by hue or shipping a generic-per-vertical palette as brand truth.
- Calling spec validation "conformance" — own the rendered-DOM assertion.
- `$ref` JSON-pointers in DESIGN.md — use curly-brace `{group.token}` refs.
