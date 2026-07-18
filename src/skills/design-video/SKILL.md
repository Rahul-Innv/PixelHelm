---
name: design-video
description: >-
  Add VIDEO to a front-end the right way for the brand. Use whenever the user
  wants an "explainer video", "onboarding video", "avatar / talking-head video",
  "product demo video", "AI presenter", "live / interactive / conversational
  avatar", "video hero", "captioned video", "localized / translated video", a
  "data-driven / programmatic video", or asks "should we put a video/avatar on
  this page", "embed a HeyGen / LiveAvatar avatar", "make a video of our founder
  saying...", "render a video with Remotion / HyperFrames". Routes to ONE of three
  recipes by trust-fit: A = pre-rendered captioned video (default, safe,
  in-product OK); B = a live AI avatar embed (GATED — marketing/sales only, never
  in-product on a trust/data brand); programmatic = Remotion/HyperFrames reusing
  the design system. Enforces the HARD trust rule + lazy-load / captions /
  AI-disclosure / cost guards. NOT tokens (design-tokens), NOT UI generation
  (design-generate), NOT scoring (design-evaluate).
disable-model-invocation: false
user-invocable: true
shell: bash
---

# design-video — situational video module (taste-graded, trust-gated)

!`node "${CLAUDE_PLUGIN_ROOT}/scripts/read-lessons.mjs" design-video 2>/dev/null`

Decide whether video belongs on a surface at all, pick the recipe that fits the
brand's trust posture, then build it so it loads fast, captions correctly, and
never lies about being AI. Video is a **situational** module: most product
surfaces are better without it. The win is restraint plus correct execution, not
"add an avatar." This is a **subjective taste skill** — graded qualitatively by
the council + owner against the active register, NOT by a numeric rubric.

## The seams (honor them; do not collapse them)

- **Routing is owned by the `design` router.** It dispatches here when the request
  is squarely about video/avatar. Do not re-implement routing. After building, the
  artifact goes back through `design-render` (capture it on the page) and
  `design-evaluate` Layer-1 (the surrounding UI still hard-gates: contrast of
  captions/controls, target size of the play button, reduced-motion, CWV).
- **`design-tokens` is the single token source of truth.** Player chrome, caption
  styling, the poster/placeholder, the AI-disclosure label, and any programmatic
  (Remotion/HyperFrames) frames pull color/type/spacing/radius from the project
  token module via `design-ground`. Never mint a hex for a caption or a control.
- **The per-project REGISTER is a HARD input — never homogenize.** A live avatar
  that delights on a warm consumer app's marketing page is a trust liability inside
  a regulated trust portal.
  Load the active profile (`${CLAUDE_PLUGIN_ROOT}/profiles/<project>.json`) and its
  `_register`; the trust rule below reads it.
- **`design-council` judges the result.** Video taste (does it earn its weight, is
  the AI presenter honest, does motion respect the register) is graded by the lens
  panel + owner, not a score this skill invents.

## The HARD trust rule (non-negotiable; read the register first)

Live AI avatars (Recipe B) are for **high-intent marketing / sales / top-of-funnel
surfaces ONLY** — a landing hero, a sales/demo page, a campaign page. **NEVER embed
a live avatar in-product (dashboards, settings, data views, transactional flows)
for a trust / data / fintech brand.** An AI face hovering over real numbers reads as
manipulative and erodes exactly the credibility those products sell.

- **A regulated trust portal (serious-trust / fintech-grade):** Recipe B is effectively banned
  in-product; allowed only on a pure marketing surface, and even there default to
  Recipe A first. An avatar over compliance/data = FAIL.
- **An analyst data product (analyst-terminal):** no live avatar anywhere in the terminal; the
  credible move is **programmatic / data-driven video** (Remotion/HyperFrames) that
  animates the real data in the brand — this is the upside, not a talking head.
- **A warm consumer app (warm-premium-fun-but-calm):** Recipe B is defensible on the marketing
  site / onboarding welcome; keep it calm, never autoplay, always escapable.

When in doubt, downgrade: B → A → no video. Surface the call as a User-Challenge
(state what the user asked, what the register implies, the cost if wrong); the
owner's direction is the default but the trust risk must be named out loud.

## The three recipes (pick ONE)

| Recipe | What it is | Default for | Source skill modeled on |
|---|---|---|---|
| **A — Pre-rendered** | API/HyperFrames-produced MP4 (avatar explainer, onboarding, demo, localized dub) delivered as a lazy-loaded, captioned `<video>` | **The default. Safe in-product.** Any brand. | HeyGen `heygen-video` / `heygen-translate` |
| **B — Live avatar** | HeyGen LiveAvatar real-time embed (iframe or Web SDK) | **GATED** — marketing/sales only, never trust-brand in-product | HeyGen `liveavatar-integrate` (Embed / FULL / LITE) |
| **Programmatic** | Remotion / HyperFrames data-driven video built FROM the design system | analyst-terminal data stories; any repeatable/automated clip | HeyGen `hyperframes` + `frame.md` |

Detail per recipe lives in references (one level deep):
`references/recipe-a-prerendered.md`, `references/recipe-b-liveavatar.md`,
`references/recipe-programmatic.md`. Read the one you routed to.

## The process (brainstorm → critique-vs-generic → build → critique-again)

Video taste is subjective, so run the same loop the rest of the plugin uses for
taste, not a checklist-to-recite:

1. **Ground.** Confirm `design-ground` resolved the profile + register + token
   module (router does this; if reached standalone, read the profile). The register
   gates the recipe before anything else.
2. **Brainstorm — should this be video at all, and which recipe?** Name the job the
   video does (explain / onboard / sell / localize / animate-data) and the surface's
   trust posture. Apply the HARD trust rule. Most in-product asks resolve to "no
   video" or "Recipe A." If the honest answer is "a sentence + a static diagram does
   this better," say so — that is a win, not a failure.
3. **Critique vs the generic default.** Hold the idea against the slop baseline:
   an autoplaying muted hero loop, a chirpy AI avatar that adds nothing, a 90-second
   talking head nobody watches past 5s, captions burned in the wrong language. If
   the proposal is indistinguishable from that default, it has not earned its weight
   — redesign or drop it. Distinction comes from the brand (the register, the real
   data, the actual message), never from "add motion."
4. **Build to the recipe.** Follow the routed reference. Every recipe obeys the
   universal MUSTs below. Pull all chrome/caption/disclosure styling from tokens.
5. **Critique again (council + owner).** Hand the surface to `design-render` (capture
   it in the page, both modes, all viewports) and to `design-council` for the taste
   read against THIS register. Layer-1 still hard-gates the surrounding UI. Ask the
   honest questions: does it earn the bytes? is the AI disclosed? does it work muted,
   captioned, reduced-motion, on a 375px phone? Loop or downgrade.

## Universal MUSTs (every recipe, fail-closed)

These are correctness, not taste — each maps to a real failure mode in the source
skills. The council grades taste; these are the floor under it.

- **Lazy, never eager.** Video is the heaviest thing on most pages. Pre-rendered =
  `preload="none"` + a token-styled poster, decode on interaction/viewport (and for
  Recipe B, the live session starts **behind an explicit click**, never on load).
  Reserve the player's box (aspect-ratio) so it costs **CLS 0** — design-evaluate's
  CWV gate will catch a layout shift.
- **Never autoplay with sound. Captions always.** Autoplay (if used at all) is muted
  + looping + decorative only and respects `prefers-reduced-motion` (a static poster
  variant, not a kill). Any speech video ships captions/subtitles; localized video
  ships captions in the target language (HeyGen translate burns or sidecars them).
- **A text fallback always exists.** A transcript, the key message as real text, or
  the static poster — the surface must convey its point with the video blocked,
  muted, or failed. Video is never the only carrier of meaning.
- **AI presenters are disclosed as AI (Recipe B especially).** A synthetic/live
  avatar carries a visible, honest "AI" label or equivalent. No passing a synthetic
  face off as a human — that is the trust rule's whole point and Compliance-honesty
  will fail it.
- **Secrets stay server-side.** Recipe B: the `X-API-KEY` is BACKEND-only; the
  browser gets a short-lived session/client token from a server route. An API key in
  client code is a stop-and-restructure (`liveavatar-integrate` L116). Recipe A
  generation/translation runs server-side or offline; the page only loads the
  finished asset.
- **Cost & perf are guarded.** Recipe B burns credits per minute and a network/RTC
  session: teardown on unmount, a 5-min inactivity timeout, never more than one live
  session per page, and a hard "you are about to start a paid AI session" affordance.
  Pre-rendered is generated once and served as a static asset (cheap to play).

## Decision handling (auto-decide vs surface)

- **Mechanical** (auto-decide silently): lazy-load attrs, aspect-ratio box, caption
  on, reduced-motion poster, token-sourced chrome, server-side token route shape.
- **Taste** (auto-decide WITH a one-line recommendation, surface at the gate):
  Recipe A vs programmatic for a given story; avatar look/voice tone; whether a
  marketing hero even wants video.
- **User-Challenge** (NEVER auto-decide): putting a **live avatar** anywhere it
  violates the trust rule (in-product on a trust/data brand). Surface what the user
  asked, what the register implies, the cost if wrong. Default to downgrade.

## References

- `references/recipe-a-prerendered.md` — the default. Producing the asset
  (HeyGen Video Agent / translation pipeline highlights), and the lazy-loaded,
  captioned, poster-backed, reduced-motion `<video>` embed pattern.
- `references/recipe-b-liveavatar.md` — the gated live embed. The trust gate, the
  three integration paths (Embed iframe / FULL / LITE), the server-token split, the
  click-to-start + AI-disclosure + teardown + keep-alive guards, sandbox testing.
- `references/recipe-programmatic.md` — Remotion / HyperFrames data-driven video
  built FROM the design system (`frame.md` = `design.md` inverted for the camera),
  determinism, and the analyst-terminal upside.
- `references/trust-and-taste.md` — the per-register trust matrix, the slop baseline
  to critique against, and the qualitative taste questions the council asks (no
  numeric rubric — taste is graded against the active register).

## Anti-patterns (reject)

- A live AI avatar inside a trust/data/fintech product surface (the cardinal sin).
- Autoplay-with-sound; a hero loop that ignores `prefers-reduced-motion`.
- A talking-head video with no captions, no transcript, no text fallback.
- A synthetic presenter not disclosed as AI.
- `X-API-KEY` in client code; a live session that starts on page load; a session
  that never tears down (silent credit burn).
- A video player that shifts layout on load (no reserved aspect-ratio box).
- Minting a caption color / control hex instead of pulling from the token module.
- "Add a video to make it pop" with no job for the video to do — drop it instead.
```
