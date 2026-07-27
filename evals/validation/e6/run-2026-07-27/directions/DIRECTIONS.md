# E6-A DIRECTIONS — three arms, written BEFORE any render exists (2026-07-27)

Stage 2 of the admitted loop. Per the sealed pre-registration: each arm
carries a one-sentence intent (frozen here) and, per Amendment A1, a
declared-breaks block — which conventions the direction deliberately breaks
and why the break serves its thesis. The machine floor is never breakable; an
undeclared break found in a candidate scores as a mistake. **No candidate
code, render, gate output, score, or verdict exists at the time of this
commit.**

Rubric criterion 8 ("Novelty budget") reads these blocks as its evidence: the
reading and purchasing mechanics stay conventional, the cinema lives in the
brand layer.

---

## Arm `crease-line`

**Intent (one sentence, frozen):**
"A naval architect's plan sheet that inks itself in as you read: the six
creases draw one at a time and the folded bag resolves into a 4.1 m hull in
line-work, so you watch the boat be explained rather than advertised."

**Declared breaks (A1):**
1. **No photograph, no product shot, no filled render anywhere** — the entire
   product is line-work on a plan sheet, breaking the launch-page convention
   that the hero is a beauty shot of the object. Why it serves the thesis:
   this buyer's objection is mechanical ("does it really fold, and does it
   hold up"), and a drawing answers a mechanical objection in a way a beauty
   shot cannot. The drawing IS the proof-by-experience.
2. **Dimensions are printed as drawing callouts, not as a spec table** — the
   84 x 56 x 24 cm and 4.1 m figures live on leader lines against the artwork
   instead of in a bordered spec block, breaking the specs-in-a-table
   convention. Why: on a plan sheet a dimension belongs to a part; putting the
   number where the part is makes the fold legible instead of merely stated.

Planned layout class: **drawing-spine** — one narrow reading column running
beside a persistent drawing stage. Palette world: cool plan-sheet — bone
paper, graphite ink, one rust-orange reserved for the tension lever and the
purchase actions (dark mode: drafting-table dark, bone line-work). Motif
budget: the drawing stage and its dimension callouts only. No cards, no
gradient, no icon row.

Motion thesis: scroll progress inks SVG paths (stroke-dashoffset) crease by
crease. Nothing moves that is not part of the boat.

---

## Arm `under-the-bed`

**Intent (one sentence, frozen):**
"Start in the flat and not on the water: the page opens with the bag in the
room it actually lives in, and the unfold happens at the scale of your
hallway before the water is ever mentioned."

**Declared breaks (A1):**
1. **The water is withheld until the third act** — a kayak launch page that
   shows no water in its first two viewports breaks the category's opening
   convention outright. Why it serves the thesis: the sealed audience is
   people "who assumed kayaking wasn't for them," and their real blocker is
   storage and carrying, not paddling. Answering the storage objection first
   is the argument; the water is the reward for having answered it.
2. **A human-scale reference object is on screen the whole time** — a
   doorway, a bed, a stair — so every size claim is read against something
   domestic instead of against open water, breaking the convention that
   outdoor gear is always shown in its outdoor context. Why: 84 x 56 x 24 cm
   means nothing next to a river and everything next to a door frame.

Planned layout class: **scene-stack** — full-bleed sequential scenes with a
persistent fact rail. Palette world: warm interior — plaster, clay, warm
shadow, with a deep desaturated water-green arriving only in act three (dark
mode: night flat, lamp warmth). Motif budget: the three room-scale scenes and
the fact rail. No cards, no metric grid.

Motion thesis: a scale-shift. The bag holds still and the room changes scale
around it, so the object's size is argued by comparison rather than asserted.

---

## Arm `three-counts`

**Intent (one sentence, frozen):**
"Three counts and a clock: the page is exactly three beats — bag, unfold,
water — each held on its own fact, with the median setup time counting
alongside so the pitch and the proof are the same object."

**Declared breaks (A1):**
1. **A running elapsed-time readout is the page's primary ornament** — a
   number that advances is doing the decorative work a hero image usually
   does, breaking the convention that the launch page's biggest visual is the
   product. Why it serves the thesis: the single most contested claim on this
   page is "3 min 40 s median," and making time itself the ornament puts the
   claim where it can be checked rather than skimmed. The readout is
   explicitly labeled with its n=14 owner-timed basis at every appearance, so
   the ornament carries its own caveat.
2. **Only three screens of content, with the specs reached by a jump link
   rather than by scrolling past them** — breaking the long-marketing-page
   convention of stacking every section vertically. Why: three physical steps
   deserve three beats, and a returning visitor should not have to scroll a
   narrative to reach a price.

Planned layout class: **beat-strip** — three numbered full-height acts, each a
single held statement, with a fixed jump bar. Palette world: high-contrast
near-black ground, bone type, one signal chartreuse (the vireo is a
yellow-green bird) used only for the count marks and the primary action (dark
mode: the same world inverted to bone ground, ink type).

Motion thesis: counted beats. Each act arrives on its own, and the clock is
the through-line; the motion is rhythm, not spectacle.

**Honesty watch specific to this arm:** because the time claim is the
ornament, this arm carries the highest risk of reading the claim as verified.
`verified: false` in the sealed data binds it: the readout must never be
framed as a measurement the visitor is watching happen, and the n=14
owner-submitted basis must be adjacent to every instance.

---

## Shared discipline (all arms — floor, not taste)

Every item below is floor and identical across arms, so the tournament
compares direction and not compliance.

- **Content:** sealed data file only. No derived arithmetic, no injector: every
  number is a literal transcription. The setup-time claim always carries
  "n=14, owner-submitted"; pack volume always reads as estimated; the load
  rating always carries its pending certification and is never called
  certified; the company name keeps its "(fictional)" marker.
- **Static-first, JS-rebuilds (L-084):** the complete story ships as static
  HTML and JS rebuilds it into the animated form. `<noscript>` is forbidden in
  this run — L-084 records that a script-stripped copy cannot verify it.
- **Every hidden-until-animated state is gated on BOTH** `html.js` AND
  `@media (prefers-reduced-motion: no-preference)` AND the absence of the
  still flag, so no fact can be invisible to a no-JS, reduced-motion, or
  skipped visitor.
- **`?still` is the skip control** (L-084): a visible in-page control, not a
  test hook, that forces the static form; it is also the deterministic
  screenshot mode.
- **Second-visit bypass:** the still preference persists, so a returning
  visitor lands on the static form and reaches specs and price without
  re-watching anything, with a visible control to play the unfold again.
- **Scroll is never hijacked:** no wheel/touch capture, no `preventDefault` on
  scroll input, no scroll-snap, no programmatic scrolling. Motion is driven by
  IntersectionObserver and rAF reading scroll position, never by taking it.
- **Motion is transform/opacity only**, rAF-driven, never `setTimeout`
  (L-084), and above-the-fold content is visible by default.
- **Machine floor per GROUND.md**, plus the four pre-registered budgets, all
  measured by the P1-5 validators.
- **Anti-cliche:** no seed-registry `any[]` string in code or computed styles.
  The live design-level risk for this archetype is `centered-hero-blob`; each
  arm's opening is a stated thesis object, and no arm may open on a centered
  gradient-mesh or blob with a single CTA.
- **No em dashes in page copy** (L-083).

## Provenance statement (recorded before building, per the sealed brief)

Every arm is authored from scratch in SVG/CSS/JS with no libraries, no vendored
code, and no copied text; no asset is imported. The motion techniques planned
here are long-standing, widely documented web primitives:
`stroke-dashoffset` path drawing, `IntersectionObserver` reveal, and rAF
reading `scrollY` for a progress value. **No material from Jack Roberts'
scroll-film-studio was consulted, read, or vendored in producing these
directions.** The obligation stays live rather than closed: if any technique in
a built arm turns out to trace to that source, it gets idea-level credit in the
report and vendoring stays blocked pending a license (P3-6). The run's
provenance finding is recorded in the report either way.
