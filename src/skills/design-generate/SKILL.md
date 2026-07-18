---
name: design-generate
description: >-
  Generates competing PRODUCTION UI directions as a run-time TOURNAMENT — spawns
  3-4 distinct taste engines (Anthropic restraint two-pass, v0 registry-grounded,
  north-star brand match, a justified risk), each grounded in the token contract
  and edit-survivable, then renders + has design-council judge + keeps the winner.
  Use when the user wants new UI or a redesign BUILT (not just mocked): "build
  this screen/page/component", "generate the UI", "make the real thing", "code
  this design", "implement the winning direction", "write the production
  front-end", "give me a few takes and pick the best", "make it not look
  AI-generated / templated / generic", or "design-and-build". This is the
  build-and-tournament step after design-direction/design-tokens; it consumes
  design-tokens, is judged by design-council, hard-gated by design-evaluate. NOT
  for throwaway pre-build mockups (design-direction), auditing built UI
  (design-evaluate), applying fixes (design-fix), or the token contract itself
  (design-tokens).
shell: bash
---

# design-generate — the run-time tournament

!`node "${CLAUDE_PLUGIN_ROOT}/scripts/read-lessons.mjs" design-generate 2>/dev/null`

Generate **N competing production directions** from genuinely DISTINCT taste
engines, render every one, let `design-council` judge, and advance the winner
through a self-correct loop. Distinctiveness is the product: it comes from
*competing intentional directions*, not from one prompt asked to "be beautiful".
This is the single strongest defense against AI-slop.

This is a **subjective taste skill** — graded qualitatively by the council, never
by a numeric rubric. Ship prose, a token-grounded prompt stack, and the
brainstorm → critique-vs-generic → build → critique-again process. Do NOT invent
a 1-10 score or an "approval threshold"; the floor (PASS/FAIL) belongs to
`design-evaluate` Layer-1, the taste verdict to `design-council`.

## MUST rules (read first)

- **The token contract WINS every conflict.** Prepend the project's token module
  as the DESIGN-SYSTEM block of every engine's prompt, verbatim, with the rule
  *"If the design system conflicts with other instructions, prioritize the design
  system."* No raw hex, no `text-white`/`bg-white`/`bg-black`, no `p-[16px]`
  literals — every value resolves from a token. (Token law + YES/NO patterns:
  `references/token-law.md`.)
- **The falsifiable bar — EVERY engine must clear it.** *"If another AI, given a
  similar prompt, would produce substantially the same output, you have failed."*
  Distinctiveness is derived from the SUBJECT'S OWN WORLD (its materials, vocabulary,
  artifacts), never from a preset menu.
- **Run a real TOURNAMENT, not one prompt.** Spawn ≥3 engines with DIFFERENT
  system-prompt personas against the SAME brief + token block. One prompt cannot
  produce 3 genuinely different intentional directions. (Roster: `references/taste-engines.md`.)
- **Honor the project REGISTER — never homogenize.** Read the active profile and
  generate AGAINST its intended feeling (e.g. a regulated trust portal's serious-trust /
  a warm consumer app's warm-premium-fun / an analyst data product's
  analyst-terminal). Loud is correct for one
  register and wrong for another. Profile resolution: `<project>/.design/profile.json` →
  `<dataDir>/profiles/<project>.json` (see the `design` skill's `references/close-the-loop.md`).
  The register is judged downstream as a FIRST-CLASS pre-aggregation VETO
  (design-council's Register-fit gate — a 5-juror MEDIAN panel on mode-fair renders):
  a candidate that is colder / less-on-register
  than the incumbent is eliminated regardless of its discipline. Spend the character
  budget on the register's named qualities (for a warm consumer register: warmth, play, color, voice),
  not on looking safe.
- **Anti-homogeneity guards are a FLOOR, never the aesthetic.** No bootstrap-blue /
  indigo / purple-violet unless the brief specifies it; ≤5 colors; ≤2 fonts (+mono);
  no decorative gradients. These eliminate the slop cluster; they do not make a
  design good. (`references/anti-homogeneity.md`.)
- **Edit-survivable output.** Reuse existing `components/ui/*`; make surgical
  edits via exact string replacement, never regenerate a whole file. Structure CSS
  so selectors don't cancel each other out (the `.section` vs `.cta`
  padding/margin trap). (`references/edit-discipline.md`.)

## Where this sits in the plugin

The `design` router dispatches here on a BUILD / GENERATE / IMPLEMENT intent. Do
not re-implement routing. Honor the seams:

- **`design-tokens` is the single token source of truth** — generate CONSUMES it
  (the DESIGN-SYSTEM block). Never invent a parallel palette or loosen a threshold.
- **`design-direction` precedes this** — it produced the owner-picked thesis on
  throwaway mockups. This skill turns that one thesis into competing PRODUCTION
  candidates. If no thesis exists yet and the owner has not mandated a look, run
  `design-direction` first.
- **`design-council` is the JUDGE of this tournament** — it reads the rendered
  PNGs, runs the exit tests, picks the winner, and names the grafts. Generate does
  not self-declare a winner.
- **`design-evaluate` Layer-1 hard-gates every candidate (machine) BEFORE taste** —
  any direction failing contrast / token-drift / a11y is eliminated; a model
  cannot argue past a measured failure.
- **`design-render` produces the PNGs + DOM** — never re-implement rendering.

## Inputs required before starting

1. **The brief / thesis** — from `design-direction` (the picked direction + its
   compact token system) or the owner's mandate. If a visual axis is free, do NOT
   spend that freedom on a default look. If the brief pins a look — even a default
   one — **the brief's own words always win.** Treat the brief's DIAGNOSIS findings
   (declutter / kill the food photo / flatten the card-sea / recede the chrome —
   restraint-and-discipline levers) as CONSTRAINTS every candidate must satisfy,
   NOT as taste points that earn score. Satisfying the diagnosis is table stakes; it
   never buys a candidate a win over the register. The register-fit gate (warmth /
   play / color / voice for the active profile) is judged SEPARATELY and ranks above
   discipline. A candidate that aces the diagnosis but loses register-fit loses.
<!-- FULL-ONLY-START -->
   **If the ground context carries a `stormBrief`** (from `design-ground` → `design-storm`),
   its SUPPORTED constructive recommendations + refuter `risks` join the diagnosis CONSTRAINTS
   every engine must satisfy (grounded, cited — but still table stakes, never scored taste).
   `flagged` (unsupported) recommendations are advisory-only; `abstained` lenses carry no weight
   (silence ≠ absence). A STORM finding NEVER out-ranks the register-fit gate — declutter/recede
   findings are constraints, not a licence to strip the register's warmth (the L-012 rule).
<!-- FULL-ONLY-END -->
2. **The token contract** from `design-tokens` (real semantic token names + the AA
   lockstep). This becomes the DESIGN-SYSTEM block.
3. **The active profile** (register + banned color clusters + token module path).
4. **REAL content** for the surface — real rows, real copy, real numbers. Generic
   copy makes a design feel as templated as generic visuals. Mark any synthetic
   state-coverage rows (empty / error / longest copy) clearly as synthetic; never
   fabricate data presented as real.
5. **The construction context** — new build vs update; has prior history; has a
   file snapshot; what modality drove it. This selects the strategy (below).
6. **The incumbent** (REDESIGN only). The current live surface, rendered to the
   SAME matrix as the candidates and entered into the tournament labeled
   `incumbent`. It is candidate 0, not a deleted baseline. On a redesign the
   tournament must BEAT a real thing, not pick the best of new-only options.

## The procedure

### Step 0 — Build the prompt STACK (never a monolith)

Assemble ordered, swappable blocks (the screenshot-to-code stack pattern), same
for every engine EXCEPT the persona:

```
SYSTEM (engine persona)  →  POLICIES (token law, anti-homogeneity floor, quality
floor)  →  DESIGN-SYSTEM (the token module, verbatim, "prioritize the design
system")  →  PLAN/TASK (the brief + real content + surface type + construction
strategy)
```

Pick the **construction strategy** with a router, not if-soup — exactly ONE of:
`create_from_brief` · `create_from_image` · `update_from_history` ·
`update_from_file_snapshot` (derive from: new-vs-update, history present, file
snapshot present, modality). Full assembly + the prompt-enhancer meta-step:
`references/prompt-stack.md`.

### Step 1 — Spawn the engine tournament (≥3 distinct personas)

Give each engine the SAME stack but a DIFFERENT SYSTEM persona — plus, when the
ground context carries `referenceSources`, a DIFFERENT per-arm divergence axis
(persona-only variation is the L-040 homogenization attractor; the a11y canon is
every arm's floor, never an axis — `references/taste-engines.md` §divergence-axes).
The default roster (full definitions, levers, and the exact persona text in
`references/taste-engines.md`):

| Engine | Optimizes for | Distinct levers |
|---|---|---|
| **E1 — Intentional / Restraint** | one signature concept; restraint | "spend your boldness in one place"; the hero/subject as thesis; runs the **two-pass plan→critique-vs-generic** before emitting |
| **E2 — Registry-grounded / Production** | token-law correctness, ships-clean | ≤5 colors, ≤2 fonts, reuse `components/ui/*`, strict semantic tokens, 8pt grid — the "safe but correct" baseline |
| **E3 — North-star match** | brand-grounded distinctiveness | pull the closest real exemplar via `design-reference` by vertical+style tags; imitate its TOKEN SYSTEM (canvas ladder, tracking, elevation), never its hex |
| **E4 — Justified risk** (optional 4th) | the boldness ceiling | saturated motivated palette, dramatic type scale, ONE signature motion moment; loud is allowed — the council's false-positive filter protects motivated boldness from the deslop pass |
<!-- FULL-ONLY-START -->
| **E5 — External engine** (optional, one arm per CONNECTED engine) | an external generator's beauty ceiling under OUR floor | wraps Stitch / Claude Design (v0 documented, flagged off) behind the generator-agnostic adapter contract: grounded prompt + DS in → standalone HTML out → MANDATORY fabrication re-verify + token-conform → competes as a labeled `E5-external:<engine>` arm. Probe at run time; FAIL-SOFT to E1–E4 when nothing is attached. Full contract + per-engine ops: `references/external-engines.md` |
<!-- FULL-ONLY-END -->

Each engine produces ONE direction. E1 MUST run the two-pass self-critique
(below) inside itself before emitting.

**NEW-PALETTE tournaments embed a `#token-contract`.** When the tournament lets
candidates PROPOSE their own palette (rather than consuming the project's frozen
token module verbatim), every candidate MUST embed its proposal as a machine-checkable
block so Layer-1 can prove it before any taste judgment:

```html
<script type="application/json" id="token-contract">
  { "light": { "<token>": "#hex", ... }, "dark": { ... },
    "gatedPairs": [ { "fg": "<token>", "on": ["<token>", ...], "kind": "text" | "graphic" } ] }
</script>
```

Authoring rule: gate **MEANING-BEARING pairs only** — text on its real surfaces, status/
state colors on theirs, load-bearing graphics (kind `"graphic"`, 3.0 floor) — never
decorative hairlines or ornaments (gating those forces false fails and teaches engines to
mute the register). The checker is design-evaluate's `scripts/check-token-contracts.mjs`
(text ≥ 4.5 / graphic ≥ 3.0, both modes; unresolvable names FAIL).

### Step 2 — The two-pass self-critique (inside every engine, E1 mandatory)

Before writing code, work in two passes in thinking:

1. **Brainstorm a compact token system** for this direction: color (4-6 named hex
   roles mapped onto the REAL token names), type (a characterful display used with
   restraint + a body face + a utility/data face), layout (one-sentence prose + an
   ASCII wireframe), and the single **signature element** the surface is remembered by.
2. **Critique-vs-generic.** Review each part against the brief: *"if I worked a
   similar prompt, would I arrive here anyway?"* If any part reads like the generic
   default rather than a choice for THIS brief, revise it and say what changed and
   why. Spend boldness in ONE place; apply Chanel's mirror — remove one accessory.

Then write the code following the revised plan exactly, deriving every color and
type decision from it.

### Step 3 — Self-check each candidate (pre-flight, NOT the verdict)

Before paying for render, run the four exit tests on each candidate as a quick
self-check (authoritative judgment is the council's — `references/four-exit-tests`
in `design-council`): **Swap** (swap typeface/layout for defaults — if nothing
changes, it defaulted), **Squint** (does hierarchy survive blur?), **Signature**
(point to 5 elements expressing THIS subject), **Token** (do the var names —
`--ink`/`--canvas` vs `--gray-700` — evoke a world or a template?). A candidate
that fails its own swap test is not distinct — regenerate it before rendering.

### Step 4 — Render every candidate

Render all directions desktop + mobile, light + dark (and a reduced-motion
variant) via `design-render`'s
`${CLAUDE_PLUGIN_ROOT}/skills/design-render/scripts/render.mjs`. Never
re-implement rendering. A direction that wins desktop-light can lose mobile-dark.
On a REDESIGN, render the incumbent on the identical matrix and add it to the
candidate set as `incumbent`. Do not exclude it from any later step.

### Step 5 — Gate, then judge

1. **Layer-1 machine gates eliminate first.** Run
   `${CLAUDE_PLUGIN_ROOT}/skills/design-evaluate/scripts/static-gates.mjs` against
   every candidate. On a NEW-PALETTE tournament, ALSO run
   `${CLAUDE_PLUGIN_ROOT}/skills/design-evaluate/scripts/check-token-contracts.mjs`
   on the candidate files — each embedded `#token-contract` is recomputed for AA and
   a fail eliminates the candidate. Any direction failing contrast / token-drift /
   a11y is OUT before taste judgment. Never re-author these gates.
2. **`design-council` judges the survivors** — it reads the PNGs, runs the exit
   tests, scores every candidate (on a REDESIGN this MUST include `incumbent`),
   picks the winner, and names the best grafts from the losers. Hand it the
   renders + the brief + (on a redesign) the incumbent render; do not self-declare
   a winner. On a redesign the winner must clear the incumbent guard (design-council
   synthesis step) or the verdict is "current design wins — no change".

### Step 6 — Self-correct the winner

Apply the council's keeps/cuts and grafts to the winning direction via surgical
edits (exact string replacement — never regenerate the file). Re-render, re-gate
(Layer-1 must stay green), and stop at the council's reviewed verdict. Note the
losing directions' best ideas for the audit trail. If the user wants the findings
turned into further mutations, hand off to `design-fix` — generate builds, it does
not own the post-audit patch loop.

## Hard rules (do not violate)

- **No fabricated data, ever.** Generate with REAL content; mark synthetic
  state-coverage rows as synthetic. Fabricated confidence (a hardcoded count
  styled as real) is a trust violation.
- **The quality floor is non-negotiable** in every candidate: responsive to
  mobile, visible keyboard focus (box-shadow ring that respects radius;
  `outline:none` without `:focus-visible` is a FAIL), reduced-motion respected,
  every tier distinguishable in grayscale. The floor is enforced by
  `design-tokens` + `design-evaluate`; do not emit candidates that would fail it.
- **Animate only `transform`/`opacity`**, enter=decelerate / exit=accelerate
  (shorter), and ship a `prefers-reduced-motion` block that degrades to opacity —
  never `display:none`. Motion tokens come from `design-motion`; reference them, no
  raw ms / cubic-bezier in component CSS. Restraint: extra animation reads as
  AI-generated.
- **Never strip an intentional bold choice.** A motivated saturated palette or
  dramatic scale is a SUCCESS — apply the council's false-positive filter; when
  unsure whether something is a tell or a decision, treat it as a decision.

## References

- `references/taste-engines.md` — the full engine roster: each persona's exact
  system text, what it optimizes, its distinct levers, and the source channeled.
- `references/prompt-stack.md` — the composable SYSTEM→POLICIES→DESIGN-SYSTEM→TASK
  block order, the construction-strategy router, the prompt-enhancer meta-step,
  and the versioned/swappable prompt-library pattern.
- `references/token-law.md` — no-raw-color law, YES/NO Tailwind patterns, the
  "prioritize the design system" rule, component reuse.
- `references/anti-homogeneity.md` — the banned color/font floor and the AI-slop
  tell-sets, branched by surface (product-UI vs marketing/landing).
- `references/edit-discipline.md` — exact-string-replacement edits, CSS-specificity
  traps, "do not regenerate the whole file".
- `references/incremental-polish.md` — the good→great diff-polish recipe (incremental-polish
  mode: tighten an already-shipped surface toward the register without a full tournament).
<!-- FULL-ONLY-START -->
- `references/external-engines.md` — the E5 external-engine adapter contract (grounded prompt +
  DS in → standalone HTML out → mandatory fabrication re-verify + token-conform → labeled
  tournament arm; fail-soft) and the per-engine registry (Stitch reference implementation,
  Claude Design probe-then-adopt, v0 notes-only).
<!-- FULL-ONLY-END -->
