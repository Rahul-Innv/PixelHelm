# Color roles — the 12-step ROLE map + flat naming

Sources: `radix-ui__colors` (understanding-the-scale 12-step role map) +
ruling C7 (flat semantic names) + the contrast-as-input recipe owned by
`design-color`. This file defines the ROLE STRUCTURE the token module uses; the
AA-passing hex are produced by `design-color`, not here.

## The 12-step ROLE map (Radix, verbatim intent)

A full color scale is 12 perceptual steps, each with a fixed semantic JOB. Map a
project's roles onto these jobs rather than inventing ad-hoc shades:

| Step | Role / job |
|---|---|
| 1 | App background |
| 2 | Subtle background |
| 3 | Component background (normal) |
| 4 | Component background (hover) |
| 5 | Component background (pressed / selected) |
| 6 | Border (subtle — separators, disabled) |
| 7 | Border (UI element — interactive) |
| 8 | Border (strong — focus ring, hover boundary) |
| 9 | Solid background (the saturated fill) |
| 10 | Solid background (hover) |
| 11 | Low-contrast text (secondary / placeholder) |
| 12 | High-contrast text (primary) |

Step 9 is the single saturated solid — reserve it for the one filled role (the
positive verdict). Steps 11/12 are the text steps that must clear the contrast
thresholds against steps 1–2 (the backgrounds).

## Flat semantic names, not MD3 prefixes (ruling C7)

Name tokens by MEANING with flat names: `primary`, `on-primary`,
`surface-elevated`, `surface-dark-elevated`, `border-focus`. Do NOT adopt MD3's
`md.ref/sys/comp` prefix layering — it over-formalizes an LLM-authored DESIGN.md.
Adopt the ref→sys→comp ALIASING *concept* (primitives → semantic → component) but
express it with flat names and curly-brace refs (`{colors.primary-60}`).

Token-name smell test (from the generate tournament's "Token" exit test): read the
CSS var names — `--ink` / `--canvas` evoke a world; `--gray-700` / `--surface-2`
evoke a template. Names that read as a specific subject PASS; generic shade names
FAIL.

## Contrast-as-INPUT (not hand-tuned hex)

Do not ship frozen hand-tuned hex as the generator. Hand `design-color` the role +
its target contrast vs the step-2 background; it generates in OKLCH, gamut-maps,
**re-measures after mapping** (same OKLCH-L ≠ same contrast), and emits hex that
clears the gate. Paste those hex into the token module's `EXAMPLE` slots and run
`node --test`. Rulings carried from `design-color`:

- **APCA is the authority for text** (Lc 60 for step 11, Lc 90 for step 12); WCAG2
  (4.5/3/7) is the reported secondary floor and the REQUIRED legal/a11y gate. Carry
  both; if a hue can't pass both at small lightness deltas, APCA wins and WCAG2 is
  reported.
- Light background lightness L≈97, dark L≈8.
- Never trust a requested ratio as delivered — verify the emitted hex with the
  lockstep test (Leonardo overshoots; re-measure after gamut-map).

## What stays in THIS skill

The token module's role STRUCTURE (which roles exist, that exactly one is filled,
that each has bg/fg/border per mode) and the partner test that enforces AA on the
emitted hex. The perceptual generation lives in `design-color`; this skill is where
the result is contracted and enforced.
