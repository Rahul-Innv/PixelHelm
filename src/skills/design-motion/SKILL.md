---
name: design-motion
description: >-
  Motion and interaction craft for web UI — design a tokenized motion vocabulary
  (durations + easing curves), apply asymmetric easing (ease-out on enter,
  ease-in on exit, exits shorter), animate ONLY transform/opacity, pick the
  cheapest engine layer (CSS -> WAAPI -> Motion -> GSAP), author reduced-motion
  as a designed variant (not a kill switch), and choreograph timeline/stagger
  reveals. Use whenever the user works on animation, transitions, easing or
  easing curves, cubic-bezier, motion tokens, a duration scale, hover/focus/
  enter/exit micro-interactions, page or modal transitions, staggered list
  reveals, parallax or scroll-driven motion, spring physics, prefers-reduced-
  motion / vestibular accessibility, janky or laggy animation / 60fps, "should I
  use GSAP or Framer Motion / Motion", or animation that "feels AI-generated" —
  even when not explicitly named. For palette use design-color, type use
  design-typography, the token contract use design-tokens; routing is owned by
  the design skill.
user-invocable: true
shell: bash
---

# design-motion

!`node "${CLAUDE_PLUGIN_ROOT}/scripts/read-lessons.mjs" design-motion 2>/dev/null`

Make motion serve the subject: tokenized, cheap-by-default, asymmetric,
accessible, restrained. This is a **taste skill with a measurable floor** — the
token values, the banned-property list, the asymmetry rule and the reduced-motion
variant are deterministic and lintable; *whether and how much to animate* is
judged qualitatively against the active project register. Do both: pass the
machine checks AND beat the generic default.

The headline restraint rule (Anthropic frontend-design): **extra animation
contributes to the feeling that the design is AI-generated.** Orchestrate one
intentional moment; do not scatter effects. Before adding any motion, ask whether
it serves the subject — if it is decorative, cut it.

## Seams (do not duplicate)
- **design-tokens** is the single source of truth. Motion tokens (durations +
  easings) live IN that module and emit as CSS custom props AND a JS object,
  joining the same AA-lockstep `tokens.mjs` pattern. This skill produces the
  *values and rules*; never spawn a parallel motion config. "Change the ms,
  never reach for a literal."
- **design-generate** consumes motion tokens (no raw `ms`/`cubic-bezier()`/
  keyframes-with-magic-numbers in components). **design-render** captures the
  `prefers-reduced-motion` variant. **design-evaluate** Layer-1 hard-gates the
  banned-property / token-drift / missing-reduced-motion / asymmetry checks
  (machine); Layer-2 advises on motion taste (lens). **design-council** judges
  the signature moment in the tournament.
- **Routing is owned by the `design` router skill** — do not re-implement it.
  This skill is invoked when the work is motion itself.
- The per-project **register differs** — never homogenize. Read the active
  profile (`${CLAUDE_PLUGIN_ROOT}/../profiles/<project>.json` and its DESIGN doc)
  for the motion voice. E.g. a regulated trust portal = serious-trust (restrained,
  functional, no playful overshoot/bounce); a warm consumer app = warm-premium-fun
  (a little spring, earned delight); an analyst data product = analyst-terminal
  (near-instant, data-respecting,
  almost no decorative motion). Same craft canon; different motion budget.

## The process (taste — run it every time, do not skip the critique)
Motion fails by defaulting to the AI cluster: everything fades-and-slides-up
300ms ease-in-out, symmetric, decorative, on every element. Beat that with a
loop, not a guess.

1. **Brainstorm the moment (not the effects).** From the register + the screen's
   job, name the ONE moment motion should serve (the verdict landing, the modal
   committing, the list arriving). Propose 2-3 distinct treatments for it, each
   stated as: trigger -> what moves -> token (duration + easing) -> why this
   curve. Vary the form-model. See `references/choreography.md`.
2. **Critique vs the generic default.** For each treatment ask plainly: *is this
   different from the default fade-slide-up, and is the difference earned by the
   content?* Kill any treatment whose only argument is "it feels modern/smooth."
   Kill decorative motion outright (restraint gate). Pick or combine survivors.
3. **Build deterministically.** Emit/reuse motion tokens (the table below), apply
   the asymmetric rule, animate only transform/opacity, pick the lowest engine
   rung that works. Write values into the design-tokens contract — never inline.
4. **Critique again (rendered, both states).** Render the normal AND the
   `prefers-reduced-motion` variant. Confirm: enters decelerate / exits
   accelerate-and-shorter; nothing animates a layout property; reduced-motion
   degrades (keeps cross-fades) rather than killing; the moment reads at the
   chosen budget; no scattered decoration crept in.

## Motion tokens (the vocabulary — emit into design-tokens)
Trim M3's 16 durations to a 6-step web scale; ship the M3 system curves verbatim
plus a small expressive set from easings.net. These are the ONLY motion values
components may reference.

| Token | Value | Use |
|---|---|---|
| `--motion-duration-instant` | `50ms` | state flips, tap feedback |
| `--motion-duration-fast` | `100ms` | exits of small elements |
| `--motion-duration-quick` | `150ms` | hover/focus, most exits |
| `--motion-duration-base` | `200ms` | standard enter, frequent interactions |
| `--motion-duration-slow` | `300ms` | larger enters, overlays |
| `--motion-duration-deliberate` | `400ms` | the one signature moment |
| `--ease-standard` | `cubic-bezier(0.2,0,0,1)` | within-screen moves |
| `--ease-decelerate` | `cubic-bezier(0,0,0,1)` | **ENTER** (ease-out) |
| `--ease-accelerate` | `cubic-bezier(0.3,0,1,1)` | **EXIT** (ease-in) |
| `--ease-emphasized-decelerate` | `cubic-bezier(0.05,0.7,0.1,1)` | emphasized enter |
| `--ease-emphasized-accelerate` | `cubic-bezier(0.3,0,0.8,0.15)` | emphasized exit |
| `--ease-out-cubic` | `cubic-bezier(0.215,0.61,0.355,1)` | expressive enter |
| `--ease-out-quart` | `cubic-bezier(0.165,0.84,0.44,1)` | stronger expressive enter |
| `--ease-out-expo` | `cubic-bezier(0.19,1,0.22,1)` | dramatic settle |
| `--ease-out-back` | `cubic-bezier(0.36,0,0.66,-0.56)` | overshoot — playful registers ONLY |

Duration ceiling is **tiered, not one number** (ruling C5): 200ms for frequent
interactions, <300ms standard, 200-500ms for overlays. Full value table,
provenance and the M3 "emphasized is an SVG path, not a bezier" trap are in
`references/motion-tokens.md`.

## The four rules (the machine floor — design-evaluate gates these)

1. **Asymmetric easing.** Elements ENTERING use a decelerate (ease-out) curve;
   elements LEAVING use an accelerate (ease-in) curve; within-screen moves use
   `--ease-standard`. **Exits are SHORTER than enters** (e.g. exit `quick`/150ms,
   enter `base`-`slow`/200-300ms). Symmetric ease + equal enter/exit duration is
   the AI tell — reject it. Codify: `enter = {duration: base|slow, ease: decelerate}`,
   `exit = {duration: fast|quick, ease: accelerate}`.
2. **Animate only transform + opacity.** Allow-list: `transform`
   (translate/scale/rotate) and `opacity`. `filter` and `clip-path` are
   emerging-cheap (prefer `filter: drop-shadow()` over animating `box-shadow`;
   `clip-path: inset()` over animating `border-radius`). **HARD-BAN** animating
   `width`/`height`/`top`/`left`/`right`/`bottom`/`margin`/`padding`/
   `border-width`/`position` — layout animation "can easily take upwards of
   100ms" (Motion.dev). Use `will-change: transform` only on elements that are
   actually animating, never blanket.
3. **Cheapest engine layer.** Climb the ladder only when the rung below cannot do
   the job, and document WHY on every escalation:
   - **Rung 0 — CSS** `transition` / `@keyframes` on transform+opacity — the
     default for hover/focus/enter/exit micro-interactions.
   - **Rung 1 — WAAPI** `element.animate()` — when JS control is needed
     (cancel/reverse/promise/finish) but compositor offload is still wanted.
   - **Rung 2 — Motion (motion.dev/Framer Motion)** — layout & shared-element
     transitions, spring physics, gesture/variants orchestration.
   - **Rung 3 — GSAP/ScrollTrigger** — scroll-scrubbed timelines, MorphSVG,
     motion paths, complex multi-element choreography.
   CSS is the bottom rung (ruling C8 — corrects Motion's and GSAP's own
   library-captured defaults). GSAP is rung 3, NEVER the default. Decision tree
   in `references/engine-ladder.md`.
4. **Reduced-motion is a designed variant, degrade don't kill.** Under
   `@media (prefers-reduced-motion: reduce)`: drop transform/parallax/large-
   movement, but **KEEP opacity and color cross-fades**; cap durations near-
   instant; disable autoplay and scroll-scrubbed motion. Never `display:none` /
   kill-switch — that destroys the second state instead of authoring it. Ship the
   reduced variant alongside the default. Canonical CSS + the JS equivalents
   (Motion `reducedMotion:'user'`, GSAP `matchMedia` with auto-revert) are in
   `references/reduced-motion.md`.

## Choreography & stagger (orchestrate one moment)
Prefer ONE orchestrated moment over scattered effects. Stagger lists with a
per-item offset of **30-60ms**, and CAP the total so the last item is not
perceptibly late (offset × count must stay short). Use `from:"center"` /
`from:"edges"` for hero reveals. Express sequences with relative position
(timeline position params / `staggerChildren` + `delayChildren`), not hand-tuned
per-item delays. Recipes (entrance, list stagger, modal, page transition,
scroll-reveal) in `references/choreography.md`.

## Validate
After authoring, run the motion linter — it gates the four rules (banned layout
property, raw `ms`/`cubic-bezier()`/hex literal instead of a `--motion-*` token,
any keyframe/transition block with no `prefers-reduced-motion` counterpart, an
enter using an ease-in curve or an exit using an ease-out curve):

`node "${CLAUDE_PLUGIN_ROOT}/skills/design-motion/scripts/motion-lint.mjs" <css-or-dir>`

This is the deterministic floor that feeds **design-evaluate** Layer-1; it
does NOT prove the motion is *good* — that is the qualitative process above.
Print the honest banner with a PASS: *this proves cheap/tokenized/asymmetric/
reduced-motion correctness, not taste.* Do not re-author `static-gates.mjs` or
`render.mjs` — reference them via their owning skills (design-evaluate /
design-render).

## Resources
- `references/motion-tokens.md` — full duration + easing tables, provenance
  (M3 / easings.net), the emphasized-bezier trap, how values emit into tokens.
- `references/engine-ladder.md` — the CSS->WAAPI->Motion->GSAP decision tree,
  per-rung copyable snippets, and what each rung uniquely buys.
- `references/reduced-motion.md` — the designed-variant philosophy, canonical
  CSS block, Motion `reducedMotion:'user'`, GSAP `matchMedia` auto-revert.
- `references/choreography.md` — asymmetric enter/exit recipes, stagger math,
  modal/page/scroll patterns, the restraint critique checklist.
- `scripts/motion-lint.mjs` — the four-rule linter (lives in THIS skill; siblings
  reference it by cross-skill path). Lessons inject via the plugin-shared
  `${CLAUDE_PLUGIN_ROOT}/scripts/read-lessons.mjs` (the preamble above).

## Anti-patterns (reject)
- Everything fades-and-slides-up, symmetric, ease-in-out, 300ms, on every
  element — the AI motion cluster.
- Symmetric ease + equal enter/exit duration; an enter that accelerates or an
  exit that decelerates.
- Animating `width`/`height`/`top`/`left`/`margin`/`padding`/`border` for an
  effect a transform achieves; `will-change` on everything "just in case".
- Reaching for GSAP (or Motion) for what CSS/WAAPI does; "prefer GSAP" as a
  default (reject gsap-skills' inverted recommendation).
- Reduced-motion as `display:none` or a global kill switch instead of a degraded
  opacity-only variant.
- Raw `ms` / `cubic-bezier()` / hex in component CSS instead of a `--motion-*`
  token (drift — same spirit as the AA-lockstep test).
- M3's full 16-duration granularity; using M3 "emphasized" as a single
  cubic-bezier (it is a multi-segment SVG path).
- `--ease-out-back` overshoot/bounce in a serious-trust register; elastic/bounce
  as a single bezier (not expressible — use keyframes or skip).
- Decorative motion that does not serve the subject (the AI-generated tell).
