# Email as a `key-set` token surface (the drift guard)

Source: `design/INDEX.md` L17-19 + the tokens lockstep contract owned by
`design-tokens`. This file says HOW email binds to the tokens; the contract
itself lives in `design-tokens` — do not re-author it here.

## Contents
- [Why key-set, not css-root](#why-key-set-not-css-root)
- [Wiring the builder](#wiring-the-builder)
- [What the lockstep proves](#what-the-lockstep-proves)

## Why key-set, not css-root

Email has NO `:root`. Gmail does not resolve CSS custom properties (`var(--ink)`);
all CSS must be inline literals at send time. So email cannot be a `css-root`
mirror like a web stylesheet. Instead the email builder **imports the project
token module directly** and reads values out of it as a key-set — the exported
roles (`SEMANTIC_COLORS.POSITIVE`, type scale, spacing) become the literal inline
values baked into the HTML. The email is registered in the `design-tokens`
lockstep test's `SURFACES` list as a `key-set` surface.

This is the whole point: importing the module (not copying hex) means a palette
change in the token module flows through to the email automatically, and the
lockstep test FAILS loudly if the email ever references a key the module no longer
exports. The email can never silently drift from the tokens.

## Wiring the builder

- The email builder is a PURE function: `build(data) -> {subject, html, text}`.
- It `import`s the project token module (path from the active profile, e.g.
  the project's `src/lib/tokens.mjs`) and reads role values for chips, prices, CTAs,
  type, and spacing — NO literal hex/sizes in the markup.
- The chip recipe is built from token values per MUST 2 (text color + border, no
  background). Example shape (values from the module):
  `color:${POSITIVE.fg};border:2px solid ${POSITIVE.fg};…` for the loud positive
  tier; `border:1px dashed ${UNVERIFIED.border}` for the unverified shape cue.
- The TEST imports the SAME module and asserts the built HTML contains the
  token-sourced recipe (see `test-recipes.md`, "token-sourced style guards"), so a
  palette change flows through without editing tests.

## What the lockstep proves

The `design-tokens` lockstep test, with the email registered as `key-set`,
proves the email surface uses the exact keys the token module exports. Combined
with the email's own meaning-level tests it gives two independent guarantees:
1. (lockstep, in `design-tokens`) the email reads real, current token keys — no
   stale/renamed-away keys, no drift from the palette.
2. (this skill's tests) the built HTML actually renders those values in the
   client-safe recipe (text+border chip, strikethrough price, bulletproof CTA).

Defer the contract, the AA contrast computation, and the non-vacuity ritual to
`design-tokens` — this skill only wires the email as a consumer of that contract.
