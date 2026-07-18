# Fluid two-anchor type scale

Table of contents:
- [Why two anchors](#why-two-anchors)
- [The algorithm (ported Utopia)](#the-algorithm-ported-utopia)
- [The rem-in-clamp invariant](#the-rem-in-clamp-invariant)
- [WCAG 1.4.4 zoomability gate](#wcag-144-zoomability-gate)
- [Defaults and emitting tokens](#defaults-and-emitting-tokens)
- [Regression vectors (snapshot these)](#regression-vectors-snapshot-these)
- [Footguns](#footguns)

Source: ported from `trys/utopia-core` (`src/index.ts`), the math behind
Utopia.fyi. The WCAG checker is credited to Maxwell Barvian (fluid.style). Do NOT
add the npm dependency — `scripts/type-scale.mjs` ports ~40 lines.

## Why two anchors
A single fixed size or a viewport-only `font-size` is wrong: the first does not
adapt, the second breaks zoom. The fluid two-anchor model interpolates BOTH the base
size AND the ratio between a min viewport and a max viewport, so the scale is tighter
on phones (less vertical waste) and more dramatic on desktop. One body anchor then
drives the whole system — scale steps, the leading check, the measure (ch)
computation, and the fallback `size-adjust` — a single source of truth instead of
four disconnected knobs.

## The algorithm (ported Utopia)
Config (two anchors + steps):

```
minWidth, maxWidth        // e.g. 320, 1240  (px)
minFontSize, maxFontSize  // the BODY anchor, e.g. 18, 20  (px) — step 0
minTypeScale, maxTypeScale// e.g. 1.2, 1.25  (minor third -> major third)
positiveSteps, negativeSteps
relativeTo                // 'viewport' (vw) | 'container' (cqi) | viewport-inline (vi)
```

Per step `n`, evaluated at each anchor viewport `vp`:

```
lerp(a,b,t)   = a*(1-t) + b*t
invlerp(a,b,x)= clamp01((x-a)/(b-a))
range(x1,y1,x2,y2,x) = lerp(x2,y2, invlerp(x1,y1,x))

scale(vp)    = range(minWidth, maxWidth, minTypeScale, maxTypeScale, vp)
fontSize(vp) = range(minWidth, maxWidth, minFontSize, maxFontSize, vp)
size(vp,n)   = fontSize(vp) * scale(vp)^n
```

`minSize = size(minWidth, n)`, `maxSize = size(maxWidth, n)`. Note the SCALE itself
is interpolated, not just the size — that is what makes the ratio tighter on small
screens.

## The rem-in-clamp invariant
Emit the clamp with `divider = 16`, `unit = 'rem'`:

```
slope        = ((maxSize/16) - (minSize/16)) / ((maxWidth/16) - (minWidth/16))
intersection = (-1 * (minWidth/16)) * slope + (minSize/16)
clamp(  {round(min/16)}rem ,  {round(intersection)}rem + {round(slope*100)}vw ,  {round(max/16)}rem )
```

- **ALWAYS keep rem** (min, intersection, and max are all in rem). Px-only clamps do
  not respond to the user's root font-size, breaking browser zoom and the
  user-set-default-font-size accessibility affordance. This is the single most
  important invariant of the engine — never emit a px-only clamp for type.
- `relativeTo` switches the relative unit only: `viewport`→`vw`, `container`→`cqi`,
  viewport-inline→`vi`. The same engine serves container-query layouts.
- Round every emitted number to 4 dp using the `(n + Number.EPSILON) * 1e4` rounded
  /1e4 trick (matches Utopia output exactly, so the regression vectors below hold).
- If `minSize > maxSize` (a negative step where small-screen is larger), swap so the
  clamp's first/last args stay min/max; the middle term keeps its sign.

## WCAG 1.4.4 zoomability gate
A fluid clamp with a steep `vw` slope can produce a step that cannot reach 200% of
its 100%-zoom size at some viewport — failing WCAG SC 1.4.4 (Resize Text). Run every
step through `checkWCAG(min, max, minWidth, maxWidth)`:

- It solves the piecewise functions for `z5 < 2*z1` (5× zoom in Chrome/Firefox vs the
  2× requirement) and returns `[from, to]` viewport px where the step fails, or
  `null`.
- **Policy:** REJECT a failing step (or, if the owner sets warn-mode, surface the
  exact failing viewport range — never ship it silently). This gate is rare, cheap,
  and free craft; no other type tool ships it.

## Defaults and emitting tokens
Plugin default (lock unless the project profile overrides): body anchor **18→20px**,
ratio **1.2→1.25**, anchors **320→1240px**, positive 5 / negative 2.

Emit steps as CSS custom properties written into the **pixelhelm-tokens** contract
(never a parallel file):

```css
:root {
  --step--2: clamp(...);
  --step--1: clamp(...);
  --step-0:  clamp(...);  /* body */
  --step-1:  clamp(...);
  ...
  --step-5:  clamp(...);
}
```

Provide a label map for downstream ergonomics (utopia `0/1/2`, tailwind
`sm/base/lg/xl`, or t-shirt `s/m/l/xl`) but the custom-prop name is the contract.

## Regression vectors (snapshot these)
`scripts/type-scale.mjs` must reproduce these EXACTLY (from `index.test.ts` /
`README.md`). They are the engine's correctness proof:

```
calculateClamp({16,32,320,1240})                       === "clamp(1rem, 0.6522rem + 1.7391vw, 2rem)"
calculateClamp({16,32,320,1240, usePx:true})           === "clamp(16px, 10.4348px + 1.7391vw, 32px)"
calculateClamp({16,32,320,1240, relativeTo:container}) === "clamp(1rem, 0.6522rem + 1.7391cqi, 2rem)"
```

And the example scale `calculateTypeScale({320,1240, 18,20, 1.2,1.25, positive:5, negative:2})`
yields step 5 ≈ `{ minFontSize: 44.79, maxFontSize: 61.04, clamp: 'clamp(2.7994rem, 2.4461rem + 1.7663vw, 3.815rem)' }`.

## Footguns
- Utopia's TYPE `negativeSteps` is a COUNT (number); its SPACE `negativeSteps` is an
  ARRAY of multipliers. Do not copy one API onto the other when wrapping.
- The engine will happily build around a bad base — it has no opinion on the anchor.
  Keep step-0 in the 15–25px body range (see `numerics.md`); 18→20 is the default.
- It is scale + space math only: no leading, measure, quotes, pairing, or loading —
  those live in the sibling references. The body anchor stitches them together.
