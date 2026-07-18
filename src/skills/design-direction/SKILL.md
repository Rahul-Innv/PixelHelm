---
name: design-direction
description: Produces N named direction mockups on REAL data before any real code, so the owner picks the visual thesis from a screenshot matrix instead of rejecting a finished build. Use when starting a redesign, visual overhaul, or new UI surface and the owner has NOT mandated a specific look; when the user says "give me a few directions", "design options", "mockup some looks", "explore the visual direction", "what should this screen feel like", "show me 2-3 takes before you build", or "I don't know what I want yet, show me options". This is the brainstorm, compact-token-system, critique-vs-generic step that runs after design-tokens/design-reference and feeds design-generate plus design-council. NOT for generating production code (that is design-generate), NOT for auditing built UI (design-evaluate), NOT for picking a single mandated design.
shell: bash
---

# Design Direction

!`node "${CLAUDE_PLUGIN_ROOT}/scripts/read-lessons.mjs" design-direction 2>/dev/null`

Produce **N named direction mockups on REAL data**, screenshot them across the matrix
(light/dark x desktop/mobile), and get the **owner's verdict BEFORE real code exists**.
Taste belongs to the owner; this skill gets their pick cheaply. The failure this prevents:
building one take-it-or-leave-it design on the real surfaces, having it rejected, and paying
rework twice.

This is a **subjective taste step** — it is graded qualitatively, never by a numeric rubric.
Ship a thesis, a compact token system, and the process; let the owner judge the screenshots.

## Where this sits in the plugin

The `design` router dispatches here on a NEW DESIGN / REDESIGN intent. Do NOT re-implement
routing. Honor the seams:
- **design-tokens is the single token source of truth.** Author every mockup with the REAL
  token names/classes from the active profile's token module so implementing the winner is
  mechanical, not a translation. Do not invent a parallel palette.
- This skill **precedes** `design-generate` (which runs the run-time tournament) and feeds
  `design-council` (which judges). A "direction" here = a *thesis the owner can pick*, cheaply,
  on throwaway HTML. The tournament that follows turns the chosen thesis into competing
  production candidates.
- The active **per-project REGISTER is a hard input — never homogenize.** E.g. a warm consumer
  app = warm-premium-fun-but-calm; a regulated trust portal = serious-trust; an analyst data
  product = analyst-terminal. Read the
  profile in `${CLAUDE_PLUGIN_ROOT}/profiles/<project>.json` (or the path the router passes) and
  judge directions AGAINST that register, not a global ideal. See
  `references/honesty-and-registers.md`.

## Inputs required before starting

1. **The brief** from `design-reference` (register, locked constraints, north-star steal-set,
   grounded diagnosis, scope) — register, locked constraints, steal-set, diagnosis, scope in one file.
2. **The token contract** from `design-tokens` (real semantic token names + the AA/drift
   lockstep). Mockups use these names.
3. **REAL data** copied from the live system for the target surface — actual rows, real copy,
   real numbers. Lorem ipsum hides density and length problems; never use it.
4. **The surface type** (product UI vs marketing/landing) — it branches the anti-slop tell-set
   (`references/canon.md`). The router or brief sets this.

If the brief left a visual axis free, do NOT spend that freedom on a default look (the three AI
clusters in `references/canon.md`). If the brief pins a look — even a default one — **the brief's
own words always win.**

## The process (brainstorm -> compact tokens -> critique-vs-generic -> build -> critique again)

Run this in order. Full detail and worked examples: `references/recipe.md`.

1. **Distill 2-3 (up to 4) NAMED directions with genuinely distinct theses.** A direction =
   a name + a one-line thesis about what the surface IS. Example trio:
   "Flight Deck — the price is the hero, the verdict its qualifier" vs "Ledger — 5-8 similar
   items scan best as a refined list" vs "Verdict Board — the verdict is a structured band, the
   loudest element per card". If the theses are not genuinely different, you have ONE direction
   plus decoration — go find a real alternative. Derive distinctiveness from the **subject's own
   world** (its materials, vocabulary, artifacts), not from a preset menu.

2. **Per direction, write a compact token system, then critique it vs generic.** Two passes,
   in thinking, before any HTML:
   - **Brainstorm:** color (4-6 named hex roles mapped onto the real token names), type (2+
     roles: a characterful display used with restraint, a body face, a utility/data face), layout
     (one-sentence prose + an ASCII wireframe), and the **single signature element** the surface
     will be remembered by.
   - **Critique-vs-generic:** review each part against the brief — "if I worked a *similar*
     prompt, would I arrive here anyway?" If any part reads like the generic default rather than
     a choice for THIS brief, revise it and state what changed and why. Spend boldness in ONE
     place (the signature); keep everything else quiet. Apply Chanel's mirror: remove one
     accessory. The swap/squint/signature/token tests in `references/canon.md` make
     "distinctive" checkable.

3. **Build one self-contained THROWAWAY HTML mockup per direction per surface.**
   - REAL data inlined; **every state/tier visible** — add clearly-marked synthetic rows for
     states the real data lacks (empty, error, unverified, no-data, longest copy).
   - Authored with the REAL token names/classes (so the winner ports mechanically).
   - Throwaway means throwaway: gitignored, never imported by real code, never shipped.

4. **Render the screenshot matrix.** light + dark x desktop + mobile for every direction. Do
   NOT re-implement rendering — invoke `design-render` (its `render.mjs` drives a real browser,
   captures both viewports + both modes, and shows the owner the PNG). A direction that wins on
   desktop-light can lose on mobile-dark; the matrix matters more than any single shot.

5. **Owner picks from the screenshots BEFORE any real-surface code.** Present the matrix as a
   comparison, name each direction, state its thesis in one line, and ask for the pick. If the
   answer is "none of these", run **ONE** mockup-only revision round — still no real code. A
   5-minute eyeball beats a day of rework.
   On a CONSUMER-FACING surface (a non-expert reads/enters consequential data), run the
   **persona bench** on the leading mockup BEFORE the owner pick — two diverse persona
   subagents think aloud over the PNG (staffing + convergence rule:
   `design-council/references/persona-bench.md`); a comprehension bug fixed at the mockup is
   the cheapest fix in the whole loop (L-017). The council seat re-runs on the BUILT surface
   either way.

6. **Hand the winner off.** The chosen thesis + its compact token system + the mockup become the
   input to `design-generate` (tournament) / direct implementation. Note the losing directions'
   best ideas for the audit trail.

## Hard rules (do not violate)

- **No fabricated data, ever.** Mockups render REAL rows. A real review caught a hardcoded
  `Math.max(2, …)` "seller count" — fabricated confidence is a trust violation. Mark synthetic
  state-coverage rows clearly as synthetic.
- **Honesty bindings outrank looks** for any surface rendering claims about money/safety/facts:
  an unverified estimate never wears the positive verdict's color; "no data" is an honest empty
  state, not a stale number styled as current. Full list: `references/honesty-and-registers.md`.
- **Surface anatomy scales with canvas** — re-judge the winner PER surface. Band-cards that
  breathe on a wide dashboard read cramped at 600px; the same thesis may need flat divider rows
  on a narrow surface. One thesis, re-expressed per canvas — never copy the dashboard layout.
- **The quality floor is non-negotiable even in throwaway mockups**: responsive to mobile,
  visible keyboard focus, reduced-motion respected, all tiers distinguishable in grayscale. The
  floor lives in `design-tokens` + `design-evaluate`; this skill must not author mockups that
  would fail it.

## References

- `references/recipe.md` — the step-by-step direction process, the per-direction screenshot
  review checklist, the "none of these" revision round, and worked examples.
- `references/canon.md` — the taste canon: the three AI-default clusters to avoid, the
  brief-always-wins rule, "spend boldness in one place", the swap/squint/signature/token exit
  tests, and the product-UI vs marketing/landing tell-sets (surface-branched anti-slop).
- `references/honesty-and-registers.md` — data-product honesty bindings (non-negotiable trust
  duties) and the per-project register profiles (never homogenize).
