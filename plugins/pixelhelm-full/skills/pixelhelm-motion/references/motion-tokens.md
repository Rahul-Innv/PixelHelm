# Motion tokens — values, provenance, and how they emit

Table of contents:
- [Durations (6-step web scale)](#durations)
- [Easing curves](#easings)
- [The M3 "emphasized" trap](#emphasized-trap)
- [Expressive curves (easings.net)](#expressive)
- [Emitting into the pixelhelm-tokens module](#emit)
- [Per-register motion budget](#register)

Motion tokens are NOT a parallel config. They live in the project's ONE
`tokens.mjs` (the pixelhelm-tokens seam) and emit as BOTH CSS custom properties and
a JS object, exactly like color/type. Components reference them only; a literal
`ms`/`cubic-bezier()`/hex in a component is drift and fails the linter.

<a id="durations"></a>
## Durations (6-step web scale)

M3 ships 16 duration tokens (`short1-4`, `medium1-4`, `long1-4`, `extra-long1-4`).
That granularity is noise for web UI — trim to 6, mapped to M3's short/medium
backbone (m3.material.io/styles/motion/easing-and-duration).

| Token | ms | M3 origin | Typical use |
|---|---|---|---|
| `--motion-duration-instant` | 50 | short1 | state flip, tap/press feedback, checkbox |
| `--motion-duration-fast` | 100 | short2 | exit of a small element (chip, tooltip) |
| `--motion-duration-quick` | 150 | short3 | hover/focus transition, most exits |
| `--motion-duration-base` | 200 | short4 | standard enter, frequent interactions |
| `--motion-duration-slow` | 300 | medium2 | larger enter, dropdown/menu, overlay |
| `--motion-duration-deliberate` | 400 | medium4 | the ONE signature moment, big overlay |

**Ceiling is tiered, not one number** (ruling C5, reconciling rauno.me's 200ms
with Dammyjay93's <300ms / 200-500ms): 200ms for frequent interactions, <300ms
standard, 200-500ms for overlays/modals. Anything past `deliberate` (400ms) needs
a justification — it is almost always decorative.

**Asymmetry pairing** (see the four-rules section in SKILL.md): an enter picks
`base`/`slow`; its matching exit picks `quick`/`fast` — one step or more SHORTER.

<a id="easings"></a>
## Easing curves (M3 system set, verbatim)

Ship the M3 system curves verbatim. The names encode the asymmetric rule so an
author picks the right curve by what the element is doing.

| Token | cubic-bezier | Role |
|---|---|---|
| `--ease-standard` | `0.2,0,0,1` | within-screen moves (element stays on screen) |
| `--ease-decelerate` | `0,0,0,1` | **ENTER** — element arriving (ease-out) |
| `--ease-accelerate` | `0.3,0,1,1` | **EXIT** — element leaving (ease-in) |
| `--ease-emphasized-decelerate` | `0.05,0.7,0.1,1` | emphasized enter (big/hero) |
| `--ease-emphasized-accelerate` | `0.3,0,0.8,0.15` | emphasized exit (big/hero) |

The asymmetric enter/exit principle is M3's (m1.material.io/motion/duration-easing
"Authentic motion" / "Natural easing curves"): things that enter the screen
decelerate to rest (ease-out); things that leave accelerate off (ease-in). A
`linear` curve reads mechanical; `ease-in-out` on an enter reads sluggish.

<a id="emphasized-trap"></a>
## The M3 "emphasized" trap (ruling)

M3's flagship "Emphasized" easing is **a multi-segment SVG path, NOT a single
`cubic-bezier()`** — it cannot be expressed as one CSS easing keyword. Do not
paste it as a bezier and claim it is M3-emphasized. Either:
- approximate with the `--ease-emphasized-*` single beziers above (close enough
  for most UI), or
- if the exact M3 emphasized curve is required, author it as `@keyframes` /
  `linear()` easing with the sampled path points, and document that it is an
  approximation.

Same caution for **elastic / bounce / spring** curves from easings.net: those are
NOT single beziers either. Express them with `@keyframes`, a WAAPI/Motion spring
(rung 1-2), or skip. A "bouncy" `cubic-bezier` with a negative control point
(like `--ease-out-back`) overshoots but does not truly bounce.

<a id="expressive"></a>
## Expressive curves (easings.net — playful/marketing registers)

Add a small expressive set from easings.net for hero reveals and marketing
surfaces. Use sparingly and register-gated.

| Token | cubic-bezier | Character |
|---|---|---|
| `--ease-out-cubic` | `0.215,0.61,0.355,1` | smooth confident enter |
| `--ease-out-quart` | `0.165,0.84,0.44,1` | stronger settle |
| `--ease-out-expo` | `0.19,1,0.22,1` | dramatic fast-then-rest |
| `--ease-out-back` | `0.36,0,0.66,-0.56` | overshoot — playful ONLY |

`--ease-out-back` (and any negative-control-point overshoot) is BANNED in
serious-trust registers (a regulated trust portal) and data-terminal registers (an
analyst data product). It belongs only where delight is part of the brief (a warm
consumer app). The asymmetry rule
still holds: these are all ease-OUT (enter) curves — never use them on an exit.

<a id="emit"></a>
## Emitting into the pixelhelm-tokens module

Motion values join the SAME `tokens.mjs` the AA-lockstep pattern governs
(pixelhelm-tokens skill). Shape them as a `MOTION` block exporting durations +
easings, mirrored to a CSS `:root` block. Example (illustrative — the canonical
module is pixelhelm-tokens' `tokens.template.mjs`):

```js
// in tokens.mjs — alongside SEMANTIC_COLORS, TYPE, etc.
export const MOTION = {
  duration: { instant: "50ms", fast: "100ms", quick: "150ms",
              base: "200ms", slow: "300ms", deliberate: "400ms" },
  ease: {
    standard: "cubic-bezier(0.2,0,0,1)",
    decelerate: "cubic-bezier(0,0,0,1)",      // ENTER
    accelerate: "cubic-bezier(0.3,0,1,1)",    // EXIT
    emphasizedDecelerate: "cubic-bezier(0.05,0.7,0.1,1)",
    emphasizedAccelerate: "cubic-bezier(0.3,0,0.8,0.15)",
    outCubic: "cubic-bezier(0.215,0.61,0.355,1)",
    outQuart: "cubic-bezier(0.165,0.84,0.44,1)",
    outExpo:  "cubic-bezier(0.19,1,0.22,1)",
    outBack:  "cubic-bezier(0.36,0,0.66,-0.56)",  // playful only
  },
};
```

```css
:root {
  --motion-duration-instant: 50ms;  --motion-duration-fast: 100ms;
  --motion-duration-quick: 150ms;   --motion-duration-base: 200ms;
  --motion-duration-slow: 300ms;    --motion-duration-deliberate: 400ms;
  --ease-standard: cubic-bezier(0.2,0,0,1);
  --ease-decelerate: cubic-bezier(0,0,0,1);
  --ease-accelerate: cubic-bezier(0.3,0,1,1);
  /* ...emphasized + expressive... */
}
```

Unlike color, motion tokens have no AA computation, so they do not add rows to
the contrast test — but the **drift guard still applies**: the linter
(`scripts/motion-lint.mjs`) fails any component CSS that writes a literal `ms`
or `cubic-bezier()` instead of referencing a `--motion-*` var. "Change the ms,
never reach for a literal."

<a id="register"></a>
## Per-register motion budget

Read `${CLAUDE_PLUGIN_ROOT}/../profiles/<project>.json` + its DESIGN doc. Same
token table; different budget and curve allow-list:

| Register | Budget | Curves allowed | Notes |
|---|---|---|---|
| a regulated trust portal (serious-trust) | minimal, functional | standard/decelerate/accelerate/emphasized | NO overshoot/bounce; motion confirms, never decorates |
| a warm consumer app (warm-premium-fun) | moderate, earned delight | + expressive + `--ease-out-back` | a little spring allowed in ONE moment |
| an analyst data product (analyst-terminal) | near-zero | instant/quick only, standard | data must not jiggle; prefer `instant`/`fast`; almost no decorative motion |
