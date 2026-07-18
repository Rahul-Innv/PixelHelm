# Recipe — Programmatic / data-driven video (reuse the design system)

Table of contents:
1. When programmatic is the answer (the analyst-terminal upside)
2. Two engines: HyperFrames (HTML) vs Remotion (React)
3. frame.md — the design system, inverted for the camera
4. Determinism + the production loop
5. Token wiring (the seam that makes this win)
6. Accept / reject

Programmatic video is built from code that consumes the SAME design system and the
SAME real data the app already has, then rendered to a deterministic MP4. No talking
head, no live session, no trust problem — the brand and the data ARE the content.
This is the recipe that turns a data brand's weakness-toward-video into a strength.
Patterns condensed from HeyGen's public HyperFrames project (README, DESIGN.md, frame.md).

## 1. When programmatic is the answer (the analyst-terminal upside)

- **Data stories:** a metric moving over time, a chart race, a cohort/momentum gauge
  animating — an analyst data product's analyst-terminal register has no business with an AI
  avatar, but a sourced, on-brand data animation is exactly credible. This is the
  upside the trust rule points at.
- **Repeatable / automated clips:** a weekly auto-generated recap, a per-customer
  personalized stat reel, a PR/changelog-to-video — anything where the same template
  re-renders with new data deserves code, not a one-off edit.
- **Design-system-faithful motion graphics:** kinetic type, a stat hit, a logo sting,
  a lower-third — all drawn with the project's own tokens so they match the product.

If the content is one person explaining something, that is Recipe A (or, gated, B).
Programmatic is for design-led, data-led, or templated video.

## 2. Two engines: HyperFrames (HTML) vs Remotion (React)

Both render with headless Chrome + FFmpeg; the difference is the authoring model.

| | HyperFrames | Remotion |
|---|---|---|
| Authoring | HTML + CSS + seekable animation (`data-*` timing attrs, `class="clip"`, tracks) | React components |
| Build step | None; `index.html` plays as-is | Bundler required |
| Agent handoff | Plain HTML files | JSX / React project |
| Animation | Seekable via adapters (GSAP / Lottie / Three.js / Anime.js / CSS / WAAPI) | Wall-clock patterns need care to stay frame-accurate |
| License | Apache 2.0 | Source-available Remotion License |

Pick by the project: a React/Next app can use
**Remotion** to literally reuse existing components, OR **HyperFrames** for a
no-build, agent-friendly HTML composition. For "reuse the design-system components"
the build spec calls out, Remotion's React reuse is the most direct; HyperFrames wins
when you want plain HTML the agent can write and a deterministic CLI loop.

Minimal HyperFrames composition (timing via data attributes, GSAP timeline registered
on `window.__timelines`):

```html
<div id="stage" data-composition-id="recap" data-start="0" data-width="1920" data-height="1080">
  <h1 id="title" class="clip" data-start="1" data-duration="4" data-track-index="1">This week</h1>
  <audio data-start="0" data-duration="6" data-track-index="2" data-volume="0.5" src="music.wav"></audio>
  <script src="https://cdn.jsdelivr.net/npm/gsap@3/dist/gsap.min.js"></script>
  <script>
    const tl = gsap.timeline({ paused: true });
    tl.from("#title", { opacity: 0, y: 40, duration: 0.8 }, 1);
    (window.__timelines ||= {}).recap = tl;
  </script>
</div>
```

CLI loop: `npx hyperframes init` → `preview` (live reload) → `lint` → `render` (MP4).
Requires Node 22+ and FFmpeg. (Remotion: a React project + its own preview/render.)

## 3. frame.md — the design system, inverted for the camera

The key insight from HyperFrames: **every brand has a `design.md`, but none were
written for a camera.** `frame.md` is the translation layer — the same tokens, the
same rules, rewritten so the values make sense in a 1920×1080 frame instead of a web
viewport (scale, motion, no web chrome). "Atoms stay sacred, composition stays free,
numbers come from the script."

For this plugin that maps cleanly onto the seam:

- `pixelhelm-tokens` already owns the brand atoms (color/type/spacing/radius).
- A `frame.md` for the project is `pixelhelm-ground`'s resolved contract expressed for
  video: the same token values, plus camera-scale type sizes and motion tokens.
- The programmatic composition imports those token values directly, so a palette
  change in the token module flows into the rendered video — no drift.

Do NOT hand-pick video colors/fonts. Derive them from the token module exactly like
the app and the email surface do.

## 4. Determinism + the production loop

- **Deterministic by design:** same input → same frames → same output. The renderer
  seeks each frame in headless Chrome and encodes with FFmpeg, so renders are
  reproducible — good for CI, regression baselines, and automated pipelines.
- **The loop:** plan the video → write valid composition (HTML or React) → wire
  seekable animation → add media → lint/validate → preview → render. Same
  brainstorm → critique-vs-generic → build → critique-again taste loop as the rest of
  this skill; the council judges the rendered output against the register.
- The finished MP4 is then delivered to the page exactly as **Recipe A** (lazy,
  captioned if it has speech, poster-backed, reduced-motion) — see
  `recipe-a-prerendered.md` §4 for the embed. Programmatic is a *production* method;
  the *delivery* is still Recipe A.

## 5. Token wiring (the seam that makes this win)

- Frames pull color/type/spacing/radius from the project token module (via
  `pixelhelm-ground` / `frame.md`) — never a literal hex in the composition.
- Reusing actual app components (Remotion) inherits token conformance for free;
  hand-authored HTML (HyperFrames) must reference the same token values.
- The rendered output is delivered through Recipe A, so pixelhelm-evaluate Layer-1
  still gates the surrounding player (caption contrast, controls, CWV).

## 6. Accept / reject (qualitative)

Accept when: the content is data-led / design-led / templated; colors/type/motion
come from the token module (or reused components); the render is deterministic; and
the delivery follows Recipe A. This is the right call for analyst-terminal data stories and
any repeatable clip. Reject when: a one-off talking-head was forced into code for no
reason (use Recipe A), or the composition hard-codes brand values instead of pulling
tokens (it will drift from the product).
