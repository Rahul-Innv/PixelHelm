# E6-A blind panel, juror 4 of 5

You are one of five independent jurors scoring three candidate launch pages
against a rubric that was sealed before any of them existed. You have not seen
the other jurors and will not. Score only what is in this transcript and in the
render files it names.

## What the product is

A launch page for the Vireo Fold, a fictional 9.8 kg folding touring kayak that
packs to a carry-on-sized bag. The brief asked that the page's motion narrative
walk the visitor through bag, unfold, water in the product's own three steps,
so that the demonstration IS the pitch. Audience: city commuters and small-flat
dwellers who assumed kayaking wasn't for them.

All content traces to one sealed data file. Three figures in it carry
qualifications that the page must not drop: the setup-time claim ("3 min 40 s
median") is owner-submitted timings with n=14 and is NOT independently
verified; the pack volume (118 L) is ESTIMATED from CAD; the load rating
(130 kg) has certification PENDING and may never be presented as certified.

## The rubric (sealed, verbatim)

Section A — fundamentals:

1. **No-motion story parity.** Reduced-motion / no-JS / keyboard visitors get
   the complete three-step story and every fact — judged on the parity renders,
   scored for equality of experience, not existence of a fallback.
2. **Ten-second value clarity.** Before any motion sequence completes, the
   first viewport already says what this is and who it's for.
3. **Data honesty surface.** Setup-time claim carries its n=14 owner-timed
   basis; pack volume flagged estimated; load rating never presented as
   certified; price and trial terms plain.
4. **User-controlled pacing.** Native scroll preserved end-to-end; motion
   responds to the visitor; the skip control is findable without hunting.
5. **Craft discipline.** Spacing, hierarchy, palette coherent across the
   cinematic and static registers — one system, both modes, both themes.
6. **Performance within budget, gracefully.** The measured budgets are met AND
   degradation is designed (what a slow device gets is a designed experience,
   not a broken one).

Section B — archetype-true distinction:

7. **The motion IS the argument.** The unfold sequence demonstrates the
   product's actual promise (bag → hull → water); remove the product and the
   motion would be pointless — the anti-spectacle test (W-02).
8. **Novelty budget.** Breaks declared per A1; the reading/purchasing mechanics
   stay conventional; the cinema lives in the brand layer.
9. **Voice.** Copy specific to this boat and this buyer; no launch-page
   hype-idiom; no competitor could run it unchanged.
10. **Survives the second visit.** Returning visitor reaches specs/price
    instantly; the motion rewards revisiting rather than taxing it (RF-7,
    corpus: mandatory playful loaders read as friction on visit two).

Anchors: 0–2 broken · 3–4 below professional · 5–6 professional baseline ·
7–8 strong professional · 9–10 distinctive-excellence signal (system-esteem).

Anchors: 0-2 broken, 3-4 below professional, 5-6 professional baseline,
7-8 strong professional, 9-10 distinctive-excellence signal.

## Rules that bind your scoring

1. **Criterion 1 (no-motion story parity) may ONLY be scored from the NO-MOTION
   parity renders.** That is the sealed evaluator rule. Do not score criterion 1
   from the motion renders.
2. Every candidate below has already passed every shipped machine gate. Gate
   outputs travel with the renders on purpose: do not spend praise on properties
   the machine has already ruled on, and do not award points for accessibility,
   contrast, overflow or honesty conformance as though you had discovered them.
   Use them to rule out the opposite error, that an attractive page is quietly
   broken.
3. A known limitation of your seat: **a static capture cannot show choreography.**
   A correctly animated page and a static page are indistinguishable in a
   screenshot. Where a criterion turns on motion (7 especially), score from the
   declared intent, the runtime motion measurements quoted above, and what the
   captures do show, and say plainly in your rationale when the evidence does not
   settle it. Do not infer that a page is motionless because a still image is.
4. The candidates are presented to you in an order that is not the order any
   other juror sees. Labels are neutral and carry no ranking.

## Your output

Return ONE JSON object, nothing else, of this exact shape:

{
  "candidate-1": { "scores": { "1": <int 0-10>, ... "10": <int> },
                   "rationales": { "1": "<max TWO sentences>", ... "10": "..." } },
  "candidate-2": { ... },
  "candidate-3": { ... }
}

Every criterion 1 through 10 must carry an integer score and a rationale of AT
MOST TWO SENTENCES. The two-sentence limit is enforced by the record schema and
a longer rationale is rejected.

---

# Candidates

## candidate-1

Direction intent (written and committed before any code existed): "Start in the flat and not on the water: the page opens with the bag in the room it actually lives in, and the unfold happens at the scale of your hallway before the water is ever mentioned."

Declared convention breaks (per the pre-registration's Amendment A1, these and ONLY these are this candidate's deliberate breaks; any other convention break you find is undeclared and scores as a mistake, not a signature):
- The water is withheld until the third act, so a kayak launch page shows no water in its first two viewports (breaks the category's opening convention; the audience's real blocker is storage and carrying, not paddling).
- A human-scale reference object stays on screen throughout, a doorway or a bed, so every size claim reads against something domestic (breaks the convention that outdoor gear is shown in its outdoor context).

Machine-gate outcome for this candidate. EVERY shipped HARD gate exited 0:
  - token-contract AA recompute, light and dark: PASS, 8 of 8 gated pairs
  - structural output floor (one main, one h1, heading order, no impostor headings, meta description): PASS
  - axe-core on all 8 rendered cells (motion and no-motion): 0 serious, 0 critical
  - no horizontal overflow at 280 / 320 / 414 px: PASS
  - state-aware contrast, default/hover/focus, both modes: PASS
  - target size (WCAG 2.5.8): PASS
  - focus trap: not applicable, this page has no dialog (explicit, not a silent pass)
  - keyboard traversal: PASS, real Tab path recorded, Shift-Tab the exact reverse, every stop shows a focus response
  - deterministic scroll capture: PASS, reproduced across passes, both with animations killed and with motion live
  - honesty Gate A (derived claims) and Gate B (required-content manifest): PASS
  - Gate B re-run against the script-stripped NO-JS copy of this page: PASS

Measured against the brief's pre-registered budgets:
  - initial payload 17.7 KB (budget 1.5 MB) and JS 1.3 KB gzipped (budget 300 KB)
  - LCP 384 ms desktop / 700 ms emulated mid-tier mobile (budget 2500 ms)
  - CLS 0 desktop / 0 emulated mobile (budget 0.10)
  - interaction-latency proxy 48 ms desktop / 64 ms emulated mobile (budget 200 ms)
  - frame time p95 16.9 ms desktop (budget 16.7 ms) / 16.8 ms emulated mobile (budget 33 ms)

Motion floor, measured at runtime rather than inferred from the captures:
  - [PASS] first-visit-plays: html.js=true, html.still=false (a first visit must play)
  - [PASS] motion-is-real: scroll-linked style delta between top and mid-page with motion on (L-085: a capture cannot show this)
  - [PASS] no-wheel-capture: wheel defaultPrevented=false
  - [PASS] no-scroll-snap: scroll-snap-type html="none" body="none"
  - [PASS] native-scroll-offset: requested +300px, moved 300px
  - [PASS] no-scroll-rewrite: offset stable after 300ms: scrollY=1936 (no script pulled it back to 0)
  - [PASS] skip-control-visible: "Skip the unfold" href="?still=1" 126x37 css px
  - [PASS] skip-control-works: after clicking skip: html.still=true, claim blocks below full opacity=0
  - [PASS] second-visit-bypass: returning visit: html.still=true, claim blocks below full opacity=0, price block fully visible=true
  - [PASS] reduced-motion-nothing-hidden: elements hidden or below full opacity at load under prefers-reduced-motion: 0
  - [PASS] reduced-motion-is-static: no scroll-linked style delta under prefers-reduced-motion (the same probe that proved motion is real)
  - [PASS] reduced-motion-blocks-laid-out: 7 claim blocks, all with non-zero box and text; degenerate: 0
  - [PASS] no-js-every-fact-present: with scripting disabled in the ENGINE: 9/9 sealed strings present
  - [PASS] no-js-no-motion-gate: html class="" (without the js class every hidden-until-animated state is inert)

Gate artifact digests (this transcript's hash therefore covers the gate evidence):
    static-gates.json  sha256 7a7505f063b9853f...
    output-floor.json  sha256 42fd734a29a0fcd4...
    gate-a-derived-claims.json  sha256 b1acd9c35372902f...
    gate-b-manifest.json  sha256 a6babd47c227ae7f...
    verify_responsive.json  sha256 826ffc1956bd5962...
    verify_states.json  sha256 231366269db6602b...
    verify_targetsize.json  sha256 b8a0664a9811dfc2...
    verify_focustrap.json  sha256 3329f951c5a55f7d...
    verify_keyboard.json  sha256 4ea24ea981630878...
    verify_scrollcapture.json  sha256 5553b19cd134efc3...
    verify_frametime-desktop.json  sha256 8084f2b8298ade34...
    verify_frametime-mobile.json  sha256 ef6f0dad2304b11d...
    verify_cwv.json  sha256 e3cf8b363b1d9c88...

Renders for candidate-1 (8 cells). MOTION set, the animated build:
  candidate-1__motion__desktop__light.png
  candidate-1__motion__desktop__dark.png
  candidate-1__motion__mobile__light.png
  candidate-1__motion__mobile__dark.png
NO-MOTION parity set, the same build under prefers-reduced-motion:
  candidate-1__no-motion__desktop__light.png
  candidate-1__no-motion__desktop__dark.png
  candidate-1__no-motion__mobile__light.png
  candidate-1__no-motion__mobile__dark.png

---

## candidate-2

Direction intent (written and committed before any code existed): "Three counts and a clock: the page is exactly three beats, bag, unfold, water, each held on its own fact, with the median setup time counting alongside so the pitch and the proof are the same object."

Declared convention breaks (per the pre-registration's Amendment A1, these and ONLY these are this candidate's deliberate breaks; any other convention break you find is undeclared and scores as a mistake, not a signature):
- A running elapsed-time readout is the page's primary ornament, so a number does the decorative work a hero image usually does (breaks the convention that the biggest visual is the product; it puts the most contested claim where it can be checked).
- Only three screens of content, with the specs reached by a jump link rather than by scrolling past them (breaks the long-marketing-page convention; a returning visitor should not scroll a narrative to reach a price).

Machine-gate outcome for this candidate. EVERY shipped HARD gate exited 0:
  - token-contract AA recompute, light and dark: PASS, 8 of 8 gated pairs
  - structural output floor (one main, one h1, heading order, no impostor headings, meta description): PASS
  - axe-core on all 8 rendered cells (motion and no-motion): 0 serious, 0 critical
  - no horizontal overflow at 280 / 320 / 414 px: PASS
  - state-aware contrast, default/hover/focus, both modes: PASS
  - target size (WCAG 2.5.8): PASS
  - focus trap: not applicable, this page has no dialog (explicit, not a silent pass)
  - keyboard traversal: PASS, real Tab path recorded, Shift-Tab the exact reverse, every stop shows a focus response
  - deterministic scroll capture: PASS, reproduced across passes, both with animations killed and with motion live
  - honesty Gate A (derived claims) and Gate B (required-content manifest): PASS
  - Gate B re-run against the script-stripped NO-JS copy of this page: PASS

Measured against the brief's pre-registered budgets:
  - initial payload 15.4 KB (budget 1.5 MB) and JS 1.3 KB gzipped (budget 300 KB)
  - LCP 364 ms desktop / 964 ms emulated mid-tier mobile (budget 2500 ms)
  - CLS 0 desktop / 0 emulated mobile (budget 0.10)
  - interaction-latency proxy 40 ms desktop / 72 ms emulated mobile (budget 200 ms)
  - frame time p95 17.1 ms desktop (budget 16.7 ms) / 17.3 ms emulated mobile (budget 33 ms)

Motion floor, measured at runtime rather than inferred from the captures:
  - [PASS] first-visit-plays: html.js=true, html.still=false (a first visit must play)
  - [PASS] motion-is-real: scroll-linked style delta between top and mid-page with motion on (L-085: a capture cannot show this)
  - [PASS] no-wheel-capture: wheel defaultPrevented=false
  - [PASS] no-scroll-snap: scroll-snap-type html="none" body="none"
  - [PASS] native-scroll-offset: requested +300px, moved 300px
  - [PASS] no-scroll-rewrite: offset stable after 300ms: scrollY=1952 (no script pulled it back to 0)
  - [PASS] skip-control-visible: "Skip the unfold" href="?still=1" 124x36 css px
  - [PASS] skip-control-works: after clicking skip: html.still=true, claim blocks below full opacity=0
  - [PASS] second-visit-bypass: returning visit: html.still=true, claim blocks below full opacity=0, price block fully visible=true
  - [PASS] reduced-motion-nothing-hidden: elements hidden or below full opacity at load under prefers-reduced-motion: 0
  - [PASS] reduced-motion-is-static: no scroll-linked style delta under prefers-reduced-motion (the same probe that proved motion is real)
  - [PASS] reduced-motion-blocks-laid-out: 7 claim blocks, all with non-zero box and text; degenerate: 0
  - [PASS] no-js-every-fact-present: with scripting disabled in the ENGINE: 9/9 sealed strings present
  - [PASS] no-js-no-motion-gate: html class="" (without the js class every hidden-until-animated state is inert)

Gate artifact digests (this transcript's hash therefore covers the gate evidence):
    static-gates.json  sha256 5d7c4517b38263cc...
    output-floor.json  sha256 ac291859d0db6a00...
    gate-a-derived-claims.json  sha256 dd70225e54a9f964...
    gate-b-manifest.json  sha256 641e982e60531235...
    verify_responsive.json  sha256 b7a9fddd4d3ad000...
    verify_states.json  sha256 de8f5545b88fee1d...
    verify_targetsize.json  sha256 dc2ad17cf9b60e66...
    verify_focustrap.json  sha256 2417ae5c878466db...
    verify_keyboard.json  sha256 dcb0c8fa2c4dce7c...
    verify_scrollcapture.json  sha256 cd1eedc6271d47c2...
    verify_frametime-desktop.json  sha256 e2cf914aeac36b5a...
    verify_frametime-mobile.json  sha256 3ed0d6c1c758913a...
    verify_cwv.json  sha256 59fa67f4dea8c15f...

Renders for candidate-2 (8 cells). MOTION set, the animated build:
  candidate-2__motion__desktop__light.png
  candidate-2__motion__desktop__dark.png
  candidate-2__motion__mobile__light.png
  candidate-2__motion__mobile__dark.png
NO-MOTION parity set, the same build under prefers-reduced-motion:
  candidate-2__no-motion__desktop__light.png
  candidate-2__no-motion__desktop__dark.png
  candidate-2__no-motion__mobile__light.png
  candidate-2__no-motion__mobile__dark.png

---

## candidate-3

Direction intent (written and committed before any code existed): "A naval architect's plan sheet that inks itself in as you read: the six creases draw one at a time and the folded bag resolves into a 4.1 m hull in line-work, so you watch the boat be explained rather than advertised."

Declared convention breaks (per the pre-registration's Amendment A1, these and ONLY these are this candidate's deliberate breaks; any other convention break you find is undeclared and scores as a mistake, not a signature):
- No photograph, no product shot, no filled render anywhere: the entire product is line-work on a plan sheet (breaks the launch-page convention that the hero is a beauty shot; a drawing answers a mechanical objection that a beauty shot cannot).
- Dimensions are printed as drawing callouts on leader lines, not as a spec table (breaks the specs-in-a-table convention; on a plan sheet a dimension belongs to a part).

Machine-gate outcome for this candidate. EVERY shipped HARD gate exited 0:
  - token-contract AA recompute, light and dark: PASS, 8 of 8 gated pairs
  - structural output floor (one main, one h1, heading order, no impostor headings, meta description): PASS
  - axe-core on all 8 rendered cells (motion and no-motion): 0 serious, 0 critical
  - no horizontal overflow at 280 / 320 / 414 px: PASS
  - state-aware contrast, default/hover/focus, both modes: PASS
  - target size (WCAG 2.5.8): PASS
  - focus trap: not applicable, this page has no dialog (explicit, not a silent pass)
  - keyboard traversal: PASS, real Tab path recorded, Shift-Tab the exact reverse, every stop shows a focus response
  - deterministic scroll capture: PASS, reproduced across passes, both with animations killed and with motion live
  - honesty Gate A (derived claims) and Gate B (required-content manifest): PASS
  - Gate B re-run against the script-stripped NO-JS copy of this page: PASS

Measured against the brief's pre-registered budgets:
  - initial payload 17.5 KB (budget 1.5 MB) and JS 1.7 KB gzipped (budget 300 KB)
  - LCP 280 ms desktop / 440 ms emulated mid-tier mobile (budget 2500 ms)
  - CLS 0 desktop / 0 emulated mobile (budget 0.10)
  - interaction-latency proxy 32 ms desktop / 64 ms emulated mobile (budget 200 ms)
  - frame time p95 16.8 ms desktop (budget 16.7 ms) / 16.9 ms emulated mobile (budget 33 ms)

Motion floor, measured at runtime rather than inferred from the captures:
  - [PASS] first-visit-plays: html.js=true, html.still=false (a first visit must play)
  - [PASS] motion-is-real: scroll-linked style delta between top and mid-page with motion on (L-085: a capture cannot show this)
  - [PASS] no-wheel-capture: wheel defaultPrevented=false
  - [PASS] no-scroll-snap: scroll-snap-type html="none" body="none"
  - [PASS] native-scroll-offset: requested +300px, moved 300px
  - [PASS] no-scroll-rewrite: offset stable after 300ms: scrollY=1300 (no script pulled it back to 0)
  - [PASS] skip-control-visible: "Skip the unfold" href="?still=1" 124x36 css px
  - [PASS] skip-control-works: after clicking skip: html.still=true, claim blocks below full opacity=0
  - [PASS] second-visit-bypass: returning visit: html.still=true, claim blocks below full opacity=0, price block fully visible=true
  - [PASS] reduced-motion-nothing-hidden: elements hidden or below full opacity at load under prefers-reduced-motion: 0
  - [PASS] reduced-motion-is-static: no scroll-linked style delta under prefers-reduced-motion (the same probe that proved motion is real)
  - [PASS] reduced-motion-blocks-laid-out: 7 claim blocks, all with non-zero box and text; degenerate: 0
  - [PASS] no-js-every-fact-present: with scripting disabled in the ENGINE: 9/9 sealed strings present
  - [PASS] no-js-no-motion-gate: html class="" (without the js class every hidden-until-animated state is inert)

Gate artifact digests (this transcript's hash therefore covers the gate evidence):
    static-gates.json  sha256 2c7c47b4473cd909...
    output-floor.json  sha256 9f9715e7ce7985d8...
    gate-a-derived-claims.json  sha256 85fa22fabc82ee34...
    gate-b-manifest.json  sha256 d143c3cff3c213dd...
    verify_responsive.json  sha256 c0e5235b7305abb8...
    verify_states.json  sha256 3293caecd8b0ecb3...
    verify_targetsize.json  sha256 12450eeecd834ce0...
    verify_focustrap.json  sha256 9ec4ab17ddae929d...
    verify_keyboard.json  sha256 074ebebadaa09940...
    verify_scrollcapture.json  sha256 ff55ce713f4c3004...
    verify_frametime-desktop.json  sha256 1fdbcf18ba56f639...
    verify_frametime-mobile.json  sha256 dcadaa6a7e4b1aa2...
    verify_cwv.json  sha256 86e970aff66435fc...

Renders for candidate-3 (8 cells). MOTION set, the animated build:
  candidate-3__motion__desktop__light.png
  candidate-3__motion__desktop__dark.png
  candidate-3__motion__mobile__light.png
  candidate-3__motion__mobile__dark.png
NO-MOTION parity set, the same build under prefers-reduced-motion:
  candidate-3__no-motion__desktop__light.png
  candidate-3__no-motion__desktop__dark.png
  candidate-3__no-motion__mobile__light.png
  candidate-3__no-motion__mobile__dark.png
