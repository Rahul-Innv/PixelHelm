# Reduced motion as a designed variant

Table of contents:
- [The philosophy: degrade, don't kill](#philosophy)
- [What to drop vs keep](#dropkeep)
- [Canonical CSS block](#css)
- [Motion / Framer Motion](#motion)
- [GSAP matchMedia (auto-revert)](#gsap)
- [WAAPI](#waapi)
- [Common mistakes](#mistakes)

<a id="philosophy"></a>
## The philosophy: degrade, don't kill

`prefers-reduced-motion: reduce` is set by users with vestibular disorders (and
many who simply dislike movement). It is **a second designed state, authored, not
an afterthought.** The wrong response is `display:none` or a global kill switch
that strips the interface bare; the right response is a degraded variant that
removes the *vestibular triggers* (large movement, parallax, scroll-scrubbed,
spin/zoom) while KEEPING the non-triggering feedback (opacity and color
cross-fades) so the UI still communicates state.

Render BOTH states (design-render captures the reduced variant) and critique
both. A reduced variant that is just "everything instant, no feedback at all"
fails the same way the over-animated default does — it was not designed.

<a id="dropkeep"></a>
## What to drop vs keep under reduce

| Drop (vestibular triggers) | Keep (safe feedback) |
|---|---|
| translate/parallax/large-movement transforms | opacity cross-fades |
| scale/zoom reveals, spin/rotate | color / background transitions |
| scroll-scrubbed & autoplaying motion | instant state changes (just no slide) |
| spring overshoot, bounce | a near-instant fade in place |
| staggered slide-ins | a single quick opacity fade for the group |

Cap any remaining transition to near-instant (`--motion-duration-instant`/
`fast`). Disable autoplay and infinite loops entirely.

<a id="css"></a>
## Canonical CSS block

Author the default for full motion, then a reduce block that swaps movement for a
cross-fade and caps duration. Two patterns:

```css
/* Pattern A — neutralize movement globally, keep opacity. Put LAST in the
   cascade. The 0.01ms (not 0s) keeps animationend/transitionend events firing
   so JS that awaits them still resolves. */
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}

/* Pattern B — DESIGNED degrade for a specific component (preferred for the
   signature moment): keep a real cross-fade, drop the slide. */
.panel--entering {
  animation: enter-up var(--motion-duration-base) var(--ease-decelerate) both;
}
@media (prefers-reduced-motion: reduce) {
  .panel--entering {
    animation: enter-fade var(--motion-duration-fast) var(--ease-standard) both;
  }
}
@keyframes enter-fade { from { opacity: 0; } to { opacity: 1; } }  /* no transform */
```

Use Pattern A as a safety net AND Pattern B for the moments that matter. The
linter fails any keyframe/transition block that has NO `prefers-reduced-motion`
counterpart anywhere in scope — so at minimum ship Pattern A.

<a id="motion"></a>
## Motion / Framer Motion

Set it once at the root; the whole tree honors the OS setting. `reducedMotion:
"user"` keeps opacity/color changes and skips transform-based motion.

```jsx
import { MotionConfig } from "motion/react";
<MotionConfig reducedMotion="user">{children}</MotionConfig>
```

For a per-component designed degrade, read the preference and branch the variant:

```jsx
import { useReducedMotion } from "motion/react";
const reduce = useReducedMotion();
<motion.div
  initial={{ opacity: 0, y: reduce ? 0 : 8 }}   // drop the slide, keep the fade
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: reduce ? 0.1 : 0.2 }}
/>
```

<a id="gsap"></a>
## GSAP matchMedia (auto-revert)

`gsap.matchMedia()` (3.11+) runs setup only while a query matches and
**automatically reverts** every animation/ScrollTrigger it created when it stops
matching — the cleanest reduced-motion machinery in the ecosystem. Pass a
conditions object; branch on `reduceMotion`.

```js
const mm = gsap.matchMedia();
mm.add(
  { isDesktop: "(min-width: 800px)",
    reduceMotion: "(prefers-reduced-motion: reduce)" },
  (ctx) => {
    const { reduceMotion } = ctx.conditions;
    gsap.from(".hero", {
      y: reduceMotion ? 0 : 40,          // degrade movement, keep the element
      opacity: 0,                        // keep the cross-fade
      duration: reduceMotion ? 0.1 : 0.6,
      ease: reduceMotion ? "none" : "power3.out",
      scrollTrigger: reduceMotion ? false : { trigger: ".hero", scrub: 1 },
    });
    // return () => {} only for custom cleanup; matchMedia reverts the rest.
  }
);
// mm.revert() on unmount. Do NOT nest gsap.context() inside matchMedia.
```

<a id="waapi"></a>
## WAAPI

No built-in preference handling — guard manually:

```js
const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
el.animate(
  reduce
    ? [{ opacity: 0 }, { opacity: 1 }]                       // fade only
    : [{ opacity: 0, transform: "translateY(8px)" },
       { opacity: 1, transform: "translateY(0)" }],
  { duration: reduce ? 100 : 200, easing: "cubic-bezier(0,0,0,1)", fill: "both" }
);
```

<a id="mistakes"></a>
## Common mistakes

- `display:none` / removing content under reduce — that destroys the state.
- `transition: none` everywhere with no cross-fade — feedback vanishes; users
  can't tell something changed. Keep opacity.
- `0s` instead of `0.01ms` — some browsers skip the `*end` event, hanging JS
  that awaits it.
- Authoring only the full-motion state and never rendering/checking the reduced
  one — the linter and design-render exist to force both.
- Forgetting scroll-scrubbed / autoplay motion (the worst vestibular offenders) —
  these MUST be disabled, not merely shortened.
