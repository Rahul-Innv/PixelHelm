---
name: design-content
description: Treats UX writing as design material — the words in a UI (labels, buttons, errors, empty states, headings, helper text, toasts, confirmations). Use when writing or rewriting interface copy, naming controls and actions, fixing error messages that apologize or are vague, turning blank screens into empty states that invite action, making button/toast/flow wording consistent, plainening jargon or system-shaped names, or matching copy tone to the project's voice. Triggers: "write the copy/microcopy", "name this button/field/action", "this error is bad/confusing/apologetic", "what should the empty state say", "make the wording consistent", "this reads too technical/salesy/robotic", "rewrite this label/heading/CTA", "the toast doesn't match the button", "plain-language this", "tone is off". NOT visual layout (design-generate), NOT auditing built UI (design-evaluate), NOT applying a found fix to the DOM/JSX (design-fix); this skill decides the words.
shell: bash
---

# design-content — UX writing as design material

!`node "${CLAUDE_PLUGIN_ROOT}/scripts/read-lessons.mjs" design-content 2>/dev/null`

Words appear in a UI for ONE reason: to make it easier to understand, and therefore
easier to use. They are design material, not decoration — bring the same intentionality
to copy that goes into spacing and color. This skill decides the words: the labels,
buttons, headings, helper text, errors, empty states, toasts, and confirmations.

This is a **subjective taste skill** — graded qualitatively, never by a numeric rubric.
Ship plain, consistent, register-matched copy and the *process* that gets there; do not
invent a score. (Source: anthropics `frontend-design/SKILL.md` "More on writing in design".)

## Where this sits in the plugin

The `design` router dispatches here; it owns sequencing — do NOT re-implement routing.
Honor the seams:

- **`design-generate` / `design-direction` produce real, intentional copy, not lorem
  ipsum.** When a new build needs words, those skills call this one for the labels/CTAs/
  empty-states/errors so the mockup reads with REAL copy. Bad copy makes a design feel as
  templated as bad layout. This skill is the copy authority they consume.
- **`design-evaluate` Layer-2's 7-phase sweep includes a "Content & console" phase.** When that phase flags copy (a vague error, a system-shaped name, an
  inconsistent action), the finding is a *problem statement*, not the rewrite. This skill
  decides the replacement words; **`design-fix` applies them to the JSX/DOM.** Copy review
  describes; design-content rewrites; design-fix patches.
- **The per-project REGISTER is a hard input — never homogenize.** A regulated trust portal =
  serious-trust; a warm consumer app = warm-premium-fun-but-calm; an analyst data product =
  analyst-terminal. The SAME plain-language
  craft applies to all; the *tone* differs. The same empty state is "Add your first claim"
  (consumer-warm) vs "No claims yet" (trust-restrained) — same job, opposite warmth. Load the
  register before writing. See `references/registers.md`.
- **Copy never overrides an honesty binding.** If the surface renders money/safety/facts,
  the words obey `design-direction`'s honesty bindings: an unverified number's hedge is in the
  copy adjacent to the value; "no data" is an honest empty state, never a confident-sounding
  lie. Friendly tone never softens a true hedge into a false reassurance.

## The five laws (apply to every string)

These are the non-negotiable craft rules. Full rationale + before/after examples:
`references/canon.md`.

1. **Name by what people control, never by how the system is built.** Write from the user's
   side of the screen. A person manages *notifications*, not *webhook config*; *team members*,
   not *user entities*. Plain, recognizable, specific. Specific always beats clever.
2. **Active voice; a control says exactly what happens.** "Save changes", not "Submit".
   "Delete project", not "OK". Describe what it does in plain terms — never sell it.
3. **One action keeps ONE name through the whole flow.** The button that says "Publish"
   produces a toast that says "Published" and a history row that says "Published" — never
   "Publish" → "Your content is now live". The interface's vocabulary is the signposting
   people learn the product by; cohesion is how they find their way around.
4. **Errors explain + recover; they never apologize and are never vague.** State what went
   wrong and the next step to fix it, in the interface's voice (not a person's "Sorry!").
   "Oops, something went wrong" is the failure to avoid. See the error recipe in
   `references/recipe.md`.
5. **Empty states are invitations, not dead ends.** A blank screen says what goes here, why
   it's worth doing, and the one action to start — not "No items." Treat emptiness as
   direction, not mood.

Plus the standing register: plain verbs, **sentence case**, no filler, tone matched to the
brand and audience. Let each element do exactly ONE job — a label labels, an example
demonstrates; nothing quietly does double duty.

## The process (brainstorm -> critique-vs-generic -> build -> critique again)

Mirror the design taste loop. Run in thinking; show the user higher-confidence copy, not
every draft. Worked examples + per-surface checklists: `references/recipe.md`.

1. **Frame what the design needs to SAY.** Before writing a string, ask: what must this
   element communicate to help the person navigate? List the strings the surface needs
   (every control, state, error, empty, confirmation) and the user's goal at each.

2. **Brainstorm the copy against the register.** Draft each string applying the five laws.
   Name actions by their effect; pick the one verb each action will carry through its whole
   flow; draft the error's what-happened + how-to-recover; draft the empty state's
   invitation. Tune tone to the active register (`references/registers.md`).

3. **Critique-vs-generic (the anti-slop pass).** For each string ask: *"if I wrote copy for
   a similar product, would I produce this exact string anyway?"* The default-LLM copy tells
   — read them in `references/canon.md` — are the giveaways: "Oops! Something went wrong",
   "Get started" / "Get Started today", "Welcome back!", "Manage your X", "Submit", "Learn
   more", emoji-as-personality, exclamation-as-enthusiasm, "seamless / powerful / effortless"
   marketing adjectives in a product UI, and "we" apologizing. If a string reads like the
   generic default rather than a choice for THIS product, rewrite it from the subject's own
   vocabulary and say what changed and why.

4. **Build the strings into the surface** (or hand the rewrite to `design-fix`). Use the
   real product's nouns. Keep the action vocabulary consistent across the flow — verify the
   button/toast/history triple matches.

5. **Critique again — consistency + Chanel's mirror.** Read every control in the flow as a
   set: does one action have two names? Does any string do two jobs? Remove one word that
   isn't pulling weight (the copy equivalent of removing one accessory). Confirm sentence
   case, no filler, no apology, no unearned exclamation, and that the tone is THIS project's
   register — not homogenized.

## Hard rules (do not violate)

- **No lorem ipsum, ever.** Placeholder copy hides length, density, and tone problems and
  makes a design read templated. Write real strings with the product's real nouns.
- **Errors never apologize or go vague.** Every error states what happened + the recovery
  step. "Something went wrong" / "Oops" / a bare error code with no next step is a FAIL.
- **One action, one name, whole flow.** A renamed action mid-flow (button vs toast vs log)
  is a defect — it breaks the vocabulary people navigate by.
- **Match the register; never homogenize.** Warm copy is RIGHT for a warm consumer app and
  WRONG for a regulated trust portal. When the project is unknown, ask the router/owner
  which project before writing.
- **Copy obeys honesty bindings.** Friendly tone never converts a true hedge or "no data"
  into a confident-sounding claim about money/safety/facts.
- **Sentence case, plain verbs, one job per element.** Title Case buttons, filler words,
  and double-duty strings are slop tells.

## References

- `references/canon.md` — the full craft canon: the five laws with before/after examples,
  the catalogue of default-LLM copy tells to avoid (the anti-slop tell-set), the
  button/toast/history consistency triple, and the swap/read-aloud/one-job exit tests.
- `references/recipe.md` — the step-by-step writing process, per-surface checklists
  (errors, empty states, buttons/CTAs, confirmations/destructive actions, forms & helper
  text, onboarding/first-run), and worked rewrites.
- `references/registers.md` — the per-project tone profiles (a regulated trust portal /
  a warm consumer app / an analyst data product) and how the SAME string changes wording
  per register without breaking a law
  (never homogenize); plus how copy defers to the honesty bindings.
