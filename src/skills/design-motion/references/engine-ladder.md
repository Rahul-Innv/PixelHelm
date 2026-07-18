# The cheapest-layer ladder (CSS -> WAAPI -> Motion -> GSAP)

Table of contents:
- [The rule](#rule)
- [Decision tree](#tree)
- [Rung 0 — CSS](#rung0)
- [Rung 1 — WAAPI](#rung1)
- [Rung 2 — Motion / Framer Motion](#rung2)
- [Rung 3 — GSAP / ScrollTrigger](#rung3)
- [The animate-only-transform/opacity allow-list](#allowlist)

<a id="rule"></a>
## The rule (ruling C8)

Pick the LOWEST rung that can do the job. Climb only when the rung below
genuinely cannot, and **document WHY** in a code comment on every escalation
(e.g. `// rung 2: shared-element layout transition, CSS/WAAPI can't measure the
FLIP`). Each higher rung adds bundle weight, an API surface, and a dependency;
none of that is free.

This ladder **corrects** the two library-captured defaults in the ecosystem:
Motion.dev sells "use our hybrid engine" and gsap-skills says "prefer GSAP /
recommend GSAP." Both put their own library at the bottom. The truth is **pure
CSS is the bottom rung, below WAAPI** — a rung Motion under-sells. GSAP is rung 3,
NEVER the default.

<a id="tree"></a>
## Decision tree

```
Is it a hover/focus/enter/exit micro-interaction on transform+opacity?
  -> RUNG 0 (CSS transition / @keyframes). Stop.

Do you need JS control (cancel, reverse, .finished promise, dynamic values)
but still want it off the main thread?
  -> RUNG 1 (WAAPI element.animate()). Stop.

Is it a layout / shared-element transition (FLIP), spring physics, or
gesture/variants orchestration in React?
  -> RUNG 2 (Motion / Framer Motion). Stop.

Is it scroll-scrubbed, a morphing SVG path, motion along a path, or a complex
multi-element timeline?
  -> RUNG 3 (GSAP + ScrollTrigger / MorphSVG). Document why lower rungs fail.
```

If two rungs both work, pick the lower one. "It's nicer in GSAP" is not a reason
to skip CSS for a fade.

<a id="rung0"></a>
## Rung 0 — CSS (the default)

`transition` for state changes; `@keyframes` for self-contained loops/entrances.
Animate only transform + opacity. Reference tokens, never literals.

```css
/* hover/focus micro-interaction — asymmetric via two transitions */
.card {
  transition:
    transform var(--motion-duration-quick) var(--ease-standard),
    opacity   var(--motion-duration-quick) var(--ease-standard);
}
.card:hover { transform: translateY(-2px); }

/* enter (decelerate, base) */
@keyframes enter-up {
  from { opacity: 0; transform: translateY(8px); }
  to   { opacity: 1; transform: translateY(0); }
}
.panel--entering {
  animation: enter-up var(--motion-duration-base) var(--ease-decelerate) both;
}
/* exit (accelerate, shorter) */
@keyframes exit-up {
  from { opacity: 1; transform: translateY(0); }
  to   { opacity: 0; transform: translateY(-8px); }
}
.panel--leaving {
  animation: exit-up var(--motion-duration-quick) var(--ease-accelerate) both;
}
```

What CSS buys: zero JS, compositor-offloaded, smallest possible cost. What it
can't: measure the DOM for a FLIP, run springs, react to gesture velocity,
guarantee a `.finished` callback cross-browser without WAAPI.

<a id="rung1"></a>
## Rung 1 — WAAPI (`element.animate()`)

Native, no dependency, runs on the compositor for transform/opacity, and gives JS
control: `.cancel()`, `.reverse()`, `.finished` promise, `.playbackRate`,
dynamic keyframe values. Reach here when CSS can't because you need to drive or
await the animation from JS.

```js
import { MOTION } from "@/lib/tokens";          // tokens, not literals
const anim = el.animate(
  [{ opacity: 0, transform: "translateY(8px)" },
   { opacity: 1, transform: "translateY(0)"   }],
  { duration: 200, easing: "cubic-bezier(0,0,0,1)", fill: "both" }
);
await anim.finished;                             // promise control CSS lacks
```

(Pull the numbers from `MOTION` so they stay tokenized.) WAAPI is the rung Motion
under-sells; prefer it over a library whenever you only need control, not springs
or layout.

<a id="rung2"></a>
## Rung 2 — Motion (motion.dev) / Framer Motion

Reach here for what WAAPI genuinely can't: **layout / shared-element transitions**
(automatic FLIP via `layout` / `layoutId`), **spring physics**, and
**gesture + variants orchestration** in React. Set `reducedMotion: "user"` (see
references/reduced-motion.md) so the whole tree honors the OS setting.

```jsx
import { motion, MotionConfig } from "motion/react";
<MotionConfig reducedMotion="user">
  <motion.div
    layout                                   // FLIP — the reason to be here
    initial={{ opacity: 0, y: 8 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -8 }}             // exit handled by AnimatePresence
    transition={{ duration: 0.2, ease: [0, 0, 0, 1] }}  // = --ease-decelerate
  />
</MotionConfig>
```

Do NOT use Motion for a fade or a hover — that is rung-0 work paying a bundle tax.

<a id="rung3"></a>
## Rung 3 — GSAP / ScrollTrigger (last resort)

Only for: scroll-scrubbed timelines, MorphSVG, MotionPath, or complex
multi-element choreography that the lower rungs can't sequence. GSAP is powerful
and heavy; reject the gsap-skills "prefer GSAP" default. When you do use it:
- transforms via `x`/`y`/`scale`/`rotation` (GSAP uses translate by default),
  never `left`/`top` (see allow-list);
- wrap reduced-motion in `gsap.matchMedia()` so it auto-reverts (reduced-motion
  reference);
- `pin`/`scrub` sparingly; `ScrollTrigger.refresh()` only on real layout change.

```js
const mm = gsap.matchMedia();
mm.add({ reduceMotion: "(prefers-reduced-motion: reduce)" }, (ctx) => {
  const { reduceMotion } = ctx.conditions;
  gsap.to(".hero", {
    y: reduceMotion ? 0 : -40,            // degrade movement, keep the element
    scrollTrigger: reduceMotion ? false : { trigger: ".hero", scrub: 1 },
    ease: "none",
  });
});
```

<a id="allowlist"></a>
## The animate-only-transform/opacity allow-list (every rung)

Applies at ALL rungs, gated by the linter:

- **ALLOWED:** `transform` (translate/scale/rotate), `opacity`.
- **EMERGING-CHEAP:** `filter` (prefer `filter: drop-shadow()` over animating
  `box-shadow`), `clip-path` (prefer `clip-path: inset()` over animating
  `border-radius`). Use deliberately; test on low-end devices.
- **HARD-BANNED:** `width`, `height`, `top`, `left`, `right`, `bottom`,
  `margin`, `padding`, `border-width`, `position`. Layout animation "can easily
  take upwards of 100ms" (motion.dev/docs/performance) and jank-fails 60fps.
- `will-change: transform` ONLY on elements actually animating; never blanket,
  never `will-change` on every element "just in case" (it wastes GPU memory).

To move an element, translate it — do not animate its box. To resize, `scale` it
(adjust children inversely if needed) rather than animating width/height.
