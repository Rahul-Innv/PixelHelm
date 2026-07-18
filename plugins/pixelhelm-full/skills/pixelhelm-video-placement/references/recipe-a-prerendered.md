# Recipe A — Pre-rendered captioned video (the default, safe everywhere)

Table of contents:
1. When Recipe A is the answer
2. Producing the asset (HeyGen Video Agent — the highlights)
3. Localization / dubbing (HeyGen translation — the highlights)
4. The embed pattern (lazy, captioned, poster-backed, reduced-motion)
5. Token wiring
6. Accept / reject

Recipe A is a finished MP4 produced once (by an API pipeline, an offline render, or
a human edit) and served as a static, lazy-loaded asset. It is **the default** and
the only recipe that is safe in-product for any brand: nothing live, no credits per
view, no synthetic face hovering over real data, fully cacheable. Reach for B or
programmatic only when the job genuinely needs them.

## 1. When Recipe A is the answer

- An explainer, onboarding clip, product demo, or founder/announcement message.
- A presenter-led video where the SAME finished clip is shown to everyone.
- A localized version of an existing video (translate/dub — see §3).
- Any in-product video at all (B is gated out of product on trust brands).

The job test: name what the video conveys in one sentence. If a sentence of real
text + a static diagram conveys it as well, drop the video (see `trust-and-taste.md`).

## 2. Producing the asset (HeyGen Video Agent — the highlights)

Generation is a SERVER-SIDE / offline step; the page only ever loads the finished
MP4. If the user is generating via HeyGen, the production wisdom worth carrying
(condensed from HeyGen's public heygen-video skill/docs):

- **One idea per video.** Single-topic produces dramatically better results;
  multi-topic → recommend separate videos.
- **Front-load the hook.** First 5s ≈ 80% of retention. Don't pad to a duration.
- **Script is a concept, not a transcript.** Tell the engine: *"This script is a
  concept and theme to convey — not a verbatim transcript. You have full creative
  freedom to expand… Do not pad with silence or pauses."* Without it the engine adds
  dead air to hit the target length.
- **Extract a `CRITICAL ON-SCREEN TEXT` block** (numbers, quotes, handles, URLs,
  CTAs) into the prompt, or the engine rephrases them.
- **When an avatar is set, do NOT describe its appearance** in the prompt — say "the
  selected presenter." Describing it is the #1 cause of avatar mismatch.
- **End the prompt with a style block** (colors, fonts, media-type guidance, motion).
  Match the style to the active project register — pull hex/fonts from the token
  module, not the engine's stock palette. Style/technical directives stay in English
  even when the script is another language.
- **Media-type guidance:** motion graphics for data/stats/brand; AI-generated for
  abstract/custom; stock for real environments. Be explicit or the engine guesses.
- **Orientation:** landscape for web/YouTube/LinkedIn; portrait for Reels/Shorts.

The engine, transport detection, frame-check (aspect correction), polling, and the
self-eval log are HeyGen's concern — defer to HeyGen's own docs if the
user is driving generation through it. This skill's job starts when the MP4 exists.

## 3. Localization / dubbing (HeyGen translation — the highlights)

To ship the same video in more languages (condensed from HeyGen's public translate docs):

- The presenter keeps their face; voice is cloned into the target language; lips
  re-sync. It rides on an EXISTING source video — for a NEW video in another
  language, generate it directly with the script in that language instead.
- **Speaker count is the #1 quality killer** — count exactly for interviews/panels.
- **Source quality is the ceiling** — muffled audio, fast cuts, occluded/low-res
  faces cap lip-sync. Say it BEFORE rendering, never after a bad result.
- **Regional variants matter** — Spanish (Spain) vs (Mexico), Portuguese (PT) vs
  (BR), Mandarin Simplified vs Cantonese Traditional are not interchangeable.
- **Captions in the target language** ship burned-in or as a sidecar SRT. Prefer the
  proofread → editable-SRT path for high-stakes/branded content so captions can be
  restyled to the brand (token-styled) instead of a fixed engine font.
- **Dynamic duration** lets translated speech breathe (en→zh/ja/ko run ~30% shorter);
  fixed-length output degrades these pairs.

## 4. The embed pattern (lazy, captioned, poster-backed, reduced-motion)

The finished asset is delivered as a `<video>` that obeys every universal MUST. This
is the load-bearing part for the front-end. Token references shown as `var(--…)`;
in JSX/CSS-in-JS they come from the project token module via `pixelhelm-ground`.

```html
<!-- Reserve the box so loading costs CLS 0; poster is token-styled, not raw black -->
<figure class="video" style="aspect-ratio: 16 / 9; background: var(--surface);">
  <video
    preload="none"               <!-- do NOT fetch the MP4 until interaction/viewport -->
    poster="/media/explainer-poster.webp"
    controls                     <!-- user owns play; never autoplay-with-sound -->
    playsinline
    width="1280" height="720"    <!-- intrinsic dims back the aspect-ratio box -->
  >
    <source src="/media/explainer.webm" type="video/webm" />
    <source src="/media/explainer.mp4"  type="video/mp4"  />
    <!-- Captions ALWAYS. Localized variants add more <track>s in their language. -->
    <track kind="captions" src="/media/explainer.en.vtt" srclang="en" label="English" default />
    <!-- Text fallback if the element itself can't render -->
    <a href="/media/explainer.mp4">Watch the explainer (MP4)</a>
  </video>
  <figcaption>
    <!-- The key message as REAL text: the point survives a blocked/muted/failed video -->
    The portal verifies every credential before it reaches an employer.
  </figcaption>
</figure>
```

Behaviors to implement around it:

- **Decode on demand.** `preload="none"` + load the source on first interaction or
  when the figure enters the viewport (IntersectionObserver). The poster (a
  token-styled WebP, not a raw frame on a black box) is what the user sees until then.
- **Reduced motion.** If a background/hero loop is used at all: muted + looping +
  decorative, and under `@media (prefers-reduced-motion: reduce)` swap the looping
  video for the **static poster** (cross-fade-out, not an abrupt stop). Never autoplay
  a content video; only a purely decorative loop may, and only muted.
- **Captions styling** (`::cue`) pulls from tokens — caption text/background contrast
  must clear the same WCAG floor pixelhelm-evaluate enforces on body text.
- **Controls reachable.** The play button and scrubber are real targets ≥ 24×24 CSS
  px (target-size gate); keyboard-operable; focus-visible from tokens.
- **Text fallback** is the transcript link or the `<figcaption>` message above —
  always present.

## 5. Token wiring

- Poster background, the `<figure>`/player frame, focus rings, and `::cue` caption
  colors come from the project token module (via `pixelhelm-ground`) — never a literal.
- Caption contrast and any on-player text are checked by `pixelhelm-evaluate` Layer-1
  exactly like the rest of the surface; the video is not exempt.
- If the brand's video itself was generated (HeyGen style block), feed it the SAME
  hex/fonts from the token module so the rendered MP4 matches the page register.

## 6. Accept / reject (qualitative — graded by the council, not a score)

Accept when: the video has a one-sentence job a static alternative can't do as well;
it is `preload="none"` in a reserved box (CLS 0); captions ship and a text fallback
exists; reduced-motion is honored; all chrome/caption colors are token-sourced; the
key message survives the video being blocked. Reject when: it autoplays with sound,
has no captions/fallback, shifts layout on load, hard-codes colors, or exists only
"to add motion." Downgrade to "no video" freely — restraint is the win.
