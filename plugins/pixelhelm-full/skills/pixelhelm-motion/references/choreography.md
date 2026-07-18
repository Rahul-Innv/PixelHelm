# Choreography & stagger — orchestrate one moment

Table of contents:
- [The restraint critique checklist](#critique)
- [Asymmetric enter/exit recipe](#enterexit)
- [Stagger math](#stagger)
- [Modal / overlay](#modal)
- [Page / route transition](#page)
- [Scroll reveal](#scroll)

The governing principle (Anthropic frontend-design + the tournament): prefer ONE
orchestrated moment over scattered effects. Distinctiveness comes from a single
intentional choreography that serves the subject, not from animating everything.
"Extra animation contributes to the feeling that the design is AI-generated."

<a id="critique"></a>
## The restraint critique checklist (run before shipping any motion)

- **Does it serve the subject?** Name the job (confirm a verdict, reveal data,
  commit a modal). If you can't, cut the animation.
- **Is there exactly one moment?** If three things animate independently on load,
  collapse to one orchestrated reveal or remove the rest.
- **Is it different from the default fade-slide-up?** If swapping it for the
  generic 300ms ease-in-out fade-up changes nothing, it defaulted — redesign or
  remove.
- **Asymmetric?** Enter decelerates; exit accelerates AND is shorter.
- **Cheap?** Only transform/opacity; lowest engine rung that works.
- **Degraded?** A designed `prefers-reduced-motion` variant exists.
- **On budget for the register?** Serious-trust minimal; analyst-terminal near-zero;
  warm-consumer one earned spring.

<a id="enterexit"></a>
## Asymmetric enter/exit recipe

Enter = `{duration: base|slow, ease: decelerate}`; exit =
`{duration: fast|quick, ease: accelerate}` and SHORTER. The element arrives
calmly and leaves briskly — matching how attention works.

```css
@keyframes enter { from { opacity:0; transform: translateY(8px) scale(.98); }
                   to   { opacity:1; transform: translateY(0)   scale(1);  } }
@keyframes exit  { from { opacity:1; transform: translateY(0); }
                   to   { opacity:0; transform: translateY(-6px); } }
.x--in  { animation: enter var(--motion-duration-base)  var(--ease-decelerate) both; }
.x--out { animation: exit  var(--motion-duration-quick) var(--ease-accelerate) both; }
```

Exit moves a smaller distance (-6px vs +8px) as well as shorter time — leaving
should feel like getting out of the way, not a full second performance.

<a id="stagger"></a>
## Stagger math

Per-item offset **30-60ms**. CAP total so the last item is not perceptibly late:
`offset × count` should stay roughly under 300-400ms. For long lists, stagger
only the first visible window, or switch to one group cross-fade.

```
total = offset * (count - 1)
if total > ~350ms:  lower offset, OR animate only visible items, OR group-fade
```

CSS (delay per item via index var) or Motion `staggerChildren`:

```jsx
// Motion — relative position, not hand-tuned per-item delays
<motion.ul variants={{ show: { transition: { staggerChildren: 0.04,
                                              delayChildren: 0.05 } } }}
           initial="hide" animate="show">
  {items.map(i => <motion.li key={i} variants={{
     hide: { opacity:0, y:8 }, show: { opacity:1, y:0,
       transition:{ duration:0.2, ease:[0,0,0,1] } } }} />)}
</motion.ul>
```

For hero reveals use `from:"center"` / `from:"edges"` (GSAP stagger) so the
sequence radiates rather than reading strictly left-to-right. Express sequence
order with relative timeline positions / `delayChildren`, never a wall of
hand-tuned `setTimeout`/`delay` values.

<a id="modal"></a>
## Modal / overlay

Overlay budget 200-500ms. Backdrop fades (opacity only); the panel enters with a
small translate+scale on a decelerate curve; exit reverses faster on accelerate.
Keep the backdrop a pure cross-fade so it survives reduced-motion unchanged.

```css
.backdrop      { transition: opacity var(--motion-duration-base) var(--ease-standard); }
.dialog--in    { animation: enter var(--motion-duration-slow)  var(--ease-emphasized-decelerate) both; }
.dialog--out   { animation: exit  var(--motion-duration-quick) var(--ease-emphasized-accelerate) both; }
```

(Focus-trap / `aria-modal` correctness is pixelhelm-evaluate's gate, not motion's —
but never animate a modal in a way that delays focus moving into it.)

<a id="page"></a>
## Page / route transition

Keep it fast (frequent interaction): outgoing accelerates out (`quick`),
incoming decelerates in (`base`) with a tiny offset so they don't strictly
overlap. Avoid full-screen slides that move large surface area (jank + vestibular
risk) — prefer a content-region cross-fade with a small translate.

<a id="scroll"></a>
## Scroll reveal

Lowest-rung option first: a CSS `@keyframes` enter triggered by adding a class
via `IntersectionObserver` (no scroll library). Only escalate to GSAP
ScrollTrigger when you truly need scrubbing (progress tied to scroll position),
pinning, or a multi-element scroll timeline.

```js
const io = new IntersectionObserver((entries) => {
  for (const e of entries) if (e.isIntersecting) {
    e.target.classList.add("x--in");        // CSS does the animation (rung 0)
    io.unobserve(e.target);                  // reveal once, then stop
  }
}, { threshold: 0.2 });
document.querySelectorAll("[data-reveal]").forEach(el => io.observe(el));
```

Scroll-scrubbed and autoplaying motion are the top vestibular offenders — they
MUST be disabled under `prefers-reduced-motion: reduce` (see
references/reduced-motion.md), not merely shortened.
