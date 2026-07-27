# design-direction — the recipe (step-by-step + checklists + examples)

> Read this when running the direction process. It expands SKILL.md's 6 steps with the
> per-direction mechanics, the screenshot review checklist, the revision round, and worked
> examples. Source base: the owner's direction-mockup production process notes +
> Anthropic's frontend-design skill (two-pass plan->critique-vs-generic).

## Contents
- [0. Elicit the intended feeling (REQUIRED, before any thesis)](#0-elicit-the-intended-feeling-required-before-any-thesis)
- [1. Distill named directions](#1-distill-named-directions)
- [2. Compact token system per direction (two passes)](#2-compact-token-system-per-direction-two-passes)
- [3. Build throwaway mockups](#3-build-throwaway-mockups)
- [4. Render the matrix](#4-render-the-matrix)
- [5. Owner picks + the revision round](#5-owner-picks--the-revision-round)
- [Screenshot review checklist](#screenshot-review-checklist)
- [Worked examples](#worked-examples)

## 0. Elicit the intended feeling (REQUIRED, before any thesis)

This step runs FIRST — before a direction name, a thesis, a palette, or a wireframe
exists. It is not the hands-on "ground-confirm" checkpoint (that confirms what the
loop RESOLVED); this asks what the owner WANTS, which the profile may never have been
told.

Ask, in ONE bounded exchange (three questions, not an interview):

1. **Feeling** — "what should this surface feel like when someone lands on it?" Take
   the answer in their words: *quiet · expensive · friendly · serious · alive ·
   old-fashioned · technical*. Adjectives are the data here.
2. **Register, and its negative space** — what tone is wanted, and what is explicitly
   NOT wanted. The banned half is usually the more useful half.
3. **Reference points** — surfaces they already like, and the specific thing they like
   about each. "Like Stripe" is not usable; "like Stripe's numbers" is.

Then:

- **Capture it VERBATIM.** A paraphrase is a second design decision wearing the
  owner's voice. Quote them.
- **Fold it into the ground context** as a constraint every direction must serve, and
  say which direction serves which part when you present the field.
- It **adds to** the profile `_register`; it never replaces it. The register-fit seat
  still binds to the literal `_register` string. If the answer genuinely contradicts
  `_register`, that is a register clarification for the owner to save
  (`design/references/close-the-loop.md`, `_taste.registerClarifications`) — not
  something this step overwrites.
- If the owner explicitly declines, **record the waiver in their own words** and
  proceed. A waiver you wrote yourself is not a waiver.

A run that neither asked nor holds a waiver is a **process defect**, surfaced like any
other blocking finding — and its `run@1` record is refused by the writer, so the pass
cannot be reported complete (`design/references/gates-and-loop.md` §0).

*Why this step exists: the loop ran to completion on four archetypes without ever
asking. Owner, E3 commerce, 2026-07-26: "Stop reusing the same design language; the
loop should ASK the owner what theme and feeling is wanted before generating."*

## 1. Distill named directions

- Produce **2-3 directions** (a 4th only if there is a genuinely distinct high-variance/bold
  take worth showing). Never one — one option is a mandate, not a choice, and the owner can't
  judge taste against nothing.
- A direction = **a name + a one-line thesis about what the surface IS.** The thesis names the
  hero and the hierarchy logic, not the decoration. Good theses answer "what is the loudest true
  thing on this surface, and why?"
- The falsifiable bar (`Dammyjay93 interface-design` L26): *if another AI given a similar prompt
  would produce substantially the same output, you have failed.* Distinctiveness comes from the
  **subject's own world** — its materials, instruments, artifacts, vernacular — not from a theme
  preset. (Reject named-preset menus: shipping "neo-brutalism / modern-dark" manufactures the
  homogeneity this whole pipeline fights.)
- Sanity test BEFORE building: if the three theses, stated aloud, are interchangeable, you have
  one direction plus styling. Go find a real alternative (a different hero, a different hierarchy
  metaphor, a different signature), don't recolor.

## 2. Compact token system per direction (two passes)

Do this **in thinking**, before any HTML. The compact token system is the design plan; the mockup
just renders it. Source: `anthropics frontend-design` L33-35.

**Pass A — brainstorm the plan.** For each direction emit:
- **Color** — 4-6 named hex roles, each mapped onto a REAL semantic token name from the active
  profile's token module (e.g. `--ink`, `--canvas`, `--accent`, not `--gray-700`). The mapping is
  what makes implementing the winner mechanical.
- **Type** — typefaces for 2+ roles: a characterful display face used with restraint, a
  complementary body face, and a utility/data face for captions or numbers if the surface is
  data-dense. Set a clear scale with intentional weights/widths/spacing; make the type treatment
  itself memorable, not a neutral delivery vehicle.
- **Layout** — a one-sentence prose concept + an ASCII wireframe to compare cheaply. Wireframes
  let you reject a layout before paying for HTML.
- **Signature** — the ONE element this surface is remembered by, embodying the brief. Exactly one.

**Pass B — critique vs generic.** Review the plan against the brief: "work through a *similar*
prompt — would I arrive somewhere similar anyway?" Any part that reads like the generic default
rather than a choice for THIS brief gets revised; **state what changed and why** (this note is
the audit trail and the anti-slop proof). Then apply the exit tests in `canon.md`
(swap / squint / signature / token). Spend boldness in ONE place; cut any decoration that does
not serve the brief; remove one accessory.

## 3. Build throwaway mockups

One self-contained HTML file per direction per surface. Rules:
- **REAL data inlined** — copy actual rows/copy/numbers from the live system. No lorem ipsum (it
  hides density and length problems). No fabricated statistics (see honesty bindings).
- **Every state/tier visible.** Add clearly-marked synthetic rows for states the real data lacks:
  empty, error, unverified, no-data, loading, AND the longest realistic copy (truncation/overflow
  shows up only at the longest string).
- **Real token names/classes** from `design-tokens` — so porting the winner is mechanical.
- **Quality floor holds even here**: responsive to mobile, visible keyboard focus ring on every
  interactive element, `prefers-reduced-motion` respected, all tiers distinguishable in grayscale
  (icon + label + shape, never color alone).
- **Throwaway means throwaway** — gitignored, never imported by real code, deleted after the pick.

## 4. Render the matrix

Invoke `design-render` (do not re-implement). It runs `render.mjs` against a real browser, shoots
**light + dark x desktop + mobile** full-page at real content width, and surfaces the PNG to the
owner (the owner cannot read HTML or `file://` from chat — they need the image). The matrix is the
deliverable; a direction that wins desktop-light can lose mobile-dark.

## 5. Owner picks + the revision round

- Present the matrix as a side-by-side **comparison**: each direction named, its one-line thesis,
  its screenshots. Ask for the pick. Do not advocate — surface the taste choice, let the owner
  decide (taste is theirs).
- If the answer is **"none of these"**: run exactly **ONE** mockup-only revision round — adjust the
  losing theses or generate a fresh one, re-render, re-present. STILL no real code. If a second
  "none" happens, the brief is wrong — go back to `design-reference`, don't keep mocking.
- On a pick: hand the winning thesis + its compact token system + the mockup to `design-generate`
  (tournament) / implementation. Note the losing directions' best ideas for the audit trail —
  good ideas from a rejected direction often survive into the winner.

## Screenshot review checklist

Run on every direction and on every iteration of the winner (from
`direction-mockup-process.md`). These are the eyeball gates the owner is implicitly judging:
- [ ] one glance answers "what changed / what should I do" (a summary layer is present)
- [ ] exactly 1 hero element per card; nothing else competes at that size
- [ ] <= 2 alignment zones per section; numbers right-aligned and tabular
- [ ] 3 type tiers visible; no functional text under 12px
- [ ] spacing rhythm 16/8/4; no ad-hoc gaps (>=25% jumps between steps)
- [ ] cards separate from the page in BOTH modes (shadow in light / surface-advance in dark)
- [ ] saturated color only on verdict/signature elements; "unverified" reads hedged — never
      alarming, never positive
- [ ] all tiers distinguishable in GRAYSCALE (icon + label + shape)
- [ ] keyboard focus ring visible on every interactive element
- [ ] no-data rows look intentional (honest empty state, not broken)

## Worked examples

**Three distinct theses for a price/verdict card surface:**
- *Flight Deck* — the price is the hero; the verdict is its qualifier.
- *Ledger* — 5-8 similar items scan best as a refined list, not cards.
- *Verdict Board* — the verdict is a structured band, the loudest element per card.
These are genuinely different (different hero, different hierarchy metaphor) — a valid trio.

**Per-surface re-judging (real owner outcome):** an owner picked direction C (band-cards) for the
wide dashboard and, on a second pass, direction A's flat divider rows for the 600px email — both
correct. Same project, the winning thesis re-expressed per canvas. Carry the thesis into the email
skeleton, do not copy the dashboard layout (the email constraint sheet caps what an email can be).

**Worked pilot scope (a real example):** start with the single highest-leverage
screen (Today), produce 2-3 named directions on real protein/log data, render, council judges
against the warm-premium-fun register + the Oura/MacroFactor/Linear/Things-3 steal-set, owner
picks; the chosen language then cascades to Log / meal-detail / Insights.
