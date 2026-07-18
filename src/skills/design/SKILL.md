---
name: design
description: >-
  The front-end-design router and orchestrator. Use this FIRST for ANY UI,
  visual, or design-quality request, then it dispatches the right sub-skills in
  the right order and owns the design -> render -> evaluate -> iterate loop. Use
  whenever the user says "design", "redesign", "build a UI/screen/page",
  "improve the look", "make this look better/premium", "design review", "audit
  my UI", "check contrast/accessibility/AA", "polish this", "fix the spacing/
  hierarchy/states", "tokens/brand/design system", "color palette", "type/
  fonts", "motion/animation", "email design", or "explore some directions" --
  even if they do not name a sub-skill. Classifies the request (new / redesign /
  review / fix / tokens / color / type / motion / email / direction / learn),
  loads the active project profile + register, and runs the gates in priority
  order (ground -> taste -> code). NOT a re-implementation of any step: this
  skill only routes, sequences gates, and runs the iterate loop; the named
  sub-skills do the work.
shell: bash
---

# design (router / orchestrator)

!`node "${CLAUDE_PLUGIN_ROOT}/scripts/read-lessons.mjs" design 2>/dev/null`

Classify the incoming design request, load the active project profile, dispatch the
right sub-skills in the optimal order, and own the **design -> render -> evaluate ->
iterate** loop. This skill routes and sequences ONLY. It NEVER re-implements a
sub-skill's work inline — it reads the named sub-skill and runs it at full depth.

This is an **objective orchestration skill**: its `## Decision Criteria` below give
explicit PASS/FAIL so routing and gate-ordering can be graded.

## Purpose

Most design tooling generates OR reviews; nothing runs generate -> render ->
measure-against-its-own-claims -> iterate as one loop with a project-grounded
contract underneath. This router is that loop's conductor. It picks the intent,
enforces the **gate order** (an ungrounded taste pass hallucinates; a taste pass
before machine gates wastes iterations chasing a score a model cannot reliably
grade), keeps **machine gates hard and lens scores advisory**, and stops at the
owner gates the active INVOLVEMENT MODE defines (autonomous: exactly ONE final
approval gate — the unchanged default; hands-on: cheap early checkpoints plus the
same final gate). Pattern source: `gstack/autoplan` thin-orchestrator (read
sub-skills from disk, run at full depth, auto-decide mechanical choices, surface
taste choices, log a Decision Audit Trail, STOP at the mode's gates).

## The seams (honor them; never collapse them)

- **This is the router.** It dispatches to the sub-skills. Do not duplicate their
  bodies; Read each one and follow it. The list of sub-skills + their order is in
  `references/routing.md`.
- **`design-tokens` is the single token source of truth.** `design-ground` resolves
  the contract; `design-generate` consumes it; `design-render` injects it;
  `design-evaluate` asserts conformance against it. Never let two skills mint tokens.
- **`design-generate` is a TOURNAMENT judged by `design-council`.** Several taste
  engines produce competing directions; the council picks the winner. The router
  spawns the tournament; it does not pick the winner itself. On a REDESIGN the
  tournament INCLUDES the current design as the incumbent competitor, and the winner
  must clear the incumbent guard (`references/gates-and-loop.md` Section 7) or the
  router reports "current design wins — no change recommended".
- **`design-evaluate` is two layers:** Layer-1 hard-gates (machine, no model in the
  loop); Layer-2 advises (lens). **Layer-2 NEVER overrides a Layer-1 FAIL; a Layer-1
  PASS is NEVER "design approved."** Always relay the honest banner the evaluator
  prints.
- **The per-project REGISTER differs — never homogenize.** A warm consumer app =
  warm-premium-fun-but-calm; a regulated trust portal = serious-trust; an analyst
  data product = analyst-terminal.
  Load and pass the active profile so every sub-skill judges against THAT register.

## Decision Criteria (explicit PASS / FAIL)

Routing is correct when ALL of these hold. Any violation is a routing FAIL.

- **PASS** invokes the design router as the FIRST action on a matching request (do
  not answer the design request directly, do not hand-code UI before grounding).
  **FAIL** = answering inline or skipping straight to code.
- **PASS** runs `design-ground` (Gate #0) before any taste or code step, every intent
  except a pure `LEARN`. **FAIL** = generating, rendering, or evaluating ungrounded.
- **PASS** maps the request to exactly one primary intent (see `references/routing.md`)
  and runs that intent's gate sequence in order. **FAIL** = wrong intent, or gates out
  of order (e.g. evaluate before render, generate before ground).
- **PASS** keeps machine gates HARD and lens scores ADVISORY: a Layer-1 FAIL or a
  Blocker routes to `design-fix` and re-renders; a low lens score alone never burns an
  iteration. **FAIL** = blocking the loop on a subjective score, or shipping past a
  Layer-1 FAIL.
- **PASS** on a REDESIGN enters the current/live design as the incumbent competitor and
  crowns a new direction ONLY if it beats the incumbent on the weighted council score AND
  scores no lower than the incumbent on register-fit; if nothing clears that guard it
  reports "current design wins — no change recommended" and STOPS. **FAIL** = a redesign
  with no incumbent in the tournament, or shipping a direction colder / less on-register
  than what exists, or forcing a least-bad winner.
- **PASS** caps the auto-iterate loop at **3** rounds, then STOPS and surfaces "needs
  human review". **FAIL** = looping unbounded.
- **PASS** classifies each intermediate choice Mechanical (auto-decide silently) vs
  Taste (auto-decide WITH a recommendation, surface at the gate) vs User-Challenge
  (never auto-decide), logs a Decision Audit Trail (its first line names the
  involvement mode that ran), and STOPS at the owner gates the active mode defines.
  **FAIL** = silently making a taste/irreversible call, or no audit trail.
- **PASS** resolves `ownerInvolvement` at Phase 0 (profile field; unset → ask ONE
  question at run start and OFFER to record the answer in the profile): `autonomous`
  (the default) runs the classic loop with exactly ONE final approval gate;
  `hands-on` runs the early checkpoints (see "Owner-involvement modes") BEFORE the
  expensive stages. **FAIL** = silently switching modes, skipping a hands-on
  checkpoint, or nagging an autonomous owner with mid-loop questions.
- **PASS** passes the resolved profile + register to every dispatched sub-skill.
  **FAIL** = homogenizing across projects or dropping the register.
- **PASS** closes the loop after the owner gate: the sign-off record is written, and a
  correction/rejection dispatched design-learn WRITE-BACK (or a taste clarification
  proposed a profile `_taste` diff). **FAIL** = an owner verdict that produced no
  record — the correction evaporates.

## Phase 0 — orient (run first, always)

1. **Read the registry + the sub-skills you will dispatch from disk.** The registry is
   `${CLAUDE_PLUGIN_ROOT}/skills.json` (typed: `id` / `skill-type` / `dependencies` /
   `path`). For each sub-skill the intent needs, Read its `SKILL.md` and follow it at
   full depth. Do NOT inline-duplicate sub-skill content. (`gstack/autoplan` L207-214.)
2. **Resolve the active project profile.** Resolution order: the project's own
   `<project>/.design/profile.json` (preferred — commits with the repo, accrues
   `_taste`) → `<dataDir>/profiles/<project>.json` (the durable data dir) → none
   found: offer to BOOTSTRAP one from
   `${CLAUDE_PLUGIN_ROOT}/profiles/examples/example.json` (the `_register` string is
   mandatory at creation — the register gate ABSTAIN-BLOCKs without it; ask for it in
   the owner's own words). A profile carries the token module path, source dirs,
   `allowRawColorIn`, `bannedClusters`, `_register`, and the accrued `_taste` block.
   Pick by the working directory / the user's named project; if ambiguous, ASK which
   project (one question). The profile's `_register` is a hard input downstream.
   Resolve `ownerInvolvement` ("hands-on" | "autonomous") in the same step; unset →
   ask ONE question at run start ("More involved early — confirm the direction on
   cheap mockups before I build — or hands-off until the final gate?") and OFFER to
   record the answer in the profile (KB L-041). Autonomous stays the default and the
   unchanged classic loop; the option is OFFERED, never silently switched.
   Store map + dataDir definition: `references/close-the-loop.md`.
3. **Classify the intent.** Map the request to ONE primary intent using the table in
   `references/routing.md`. When two intents both fit (e.g. "review then fix"), pick the
   earliest in the loop and let the loop carry it forward.
4. **Pick the execution depth** (`gnurio` Quick/Deep/Fix): Quick = a single targeted
   pass (one screen, one gate); Deep = the full loop with the tournament; Fix = go
   straight to the render->evaluate->fix sub-loop on an existing surface.
5. **First run / anything environmental failing?** Run the preflight —
   `node "${CLAUDE_PLUGIN_ROOT}/scripts/doctor.mjs" --project <project-dir>` — it checks
   node, the per-version render deps, a system browser, the profile + `_register`, the
   token contract, the durable data dir, python-for-STORM, and points at the optional
   engines. One fix line per failure. Run it BEFORE debugging any tool error by hand.

## The intents and their gate order

Gate #0 GROUND always runs first. Full sequences, triggers, and the iterate loop are
in `references/routing.md`. Summary:

```
Gate #0 GROUND (always) -> design-ground: resolve contract + profile + fresh docs + lessons
  NEW DESIGN  -> [design-direction?] -> design-generate (tournament) -> design-render -> design-evaluate -> LOOP
  REDESIGN    -> design-evaluate(current) -> design-generate(delta) -> design-render -> design-evaluate -> LOOP
  REVIEW/EVAL -> design-render -> design-evaluate -> STOP (report)        # evaluator usable standalone
  FIX         -> design-render -> design-evaluate -> design-fix -> design-render -> design-evaluate
  TOKENS      -> design-tokens (+ design-color / design-typography / design-motion as scoped)
  EMAIL       -> design-ground -> design-email (email-safe subset; reuse evaluate's contrast gate)
  LEARN       -> design-learn (standalone; the only intent that may skip Gate #0)
```

The craft sub-skills (`design-color`, `design-typography`, `design-motion`,
`design-email`, `design-dataviz`, `design-content`, `design-video`) attach by concern:
dispatch one explicitly when the request is squarely about it (a chart → design-dataviz;
copy/labels/empty-state text → design-content; video/avatar → design-video), or when a
gate finding points at it. `design-storm` (deep-research verified brief) is seated by
`design-ground` on a HIGH-STAKES new design/redesign — situational, never every pass.

## Owner-involvement modes (hands-on vs autonomous)

`ownerInvolvement` (resolved at Phase 0) selects how much the owner steers BEFORE the
final gate. **AUTONOMOUS (the default)** = the loop exactly as written elsewhere in
this file: one final approval gate, everything else auto-decided per Decision
handling. **HANDS-ON** = the same loop plus THREE cheap checkpoints, each placed
before an expensive stage — a checkpoint costs one question; a tournament + council
costs millions of tokens, so spend the question first:

1. **Ground-confirm** (after `design-ground`, before ANY taste work): show the
   resolved register (the verbatim `_register`), the chosen `referenceSources`
   subset, and the constraints; ask ONE question — "did I ground this right?" A
   wrong register caught here saves an entire rejected field (KB L-037/L-040).
2. **Direction pick** (before ANY production tournament): run `design-direction` —
   2-3 named THROWAWAY register mockups on real data; the owner picks the thesis
   BEFORE production candidates are built. Hands-on promotes `design-direction`
   from optional to MANDATORY for NEW DESIGN and tournament-method REDESIGN (skip
   only when the owner already mandated a look, and say so in the audit trail).
3. **Post-council bar-check** (after the verdict, BEFORE the fix loop): show the
   council verdict + the finalist renders and ask "does ANY of these reach your
   bar?" (the L-037 rule, built in) — a field-wide rejection here costs one
   question, not a fix loop on a doomed winner.

The FINAL approval gate is unchanged and applies to BOTH modes. Checkpoint answers
are OWNER decisions: record each in the Decision Audit Trail, and route register /
taste clarifications through Close-the-loop as usual.

## The iterate loop (the loop this skill owns)

```
After design-render + design-evaluate:
  any Layer-1 gate FAIL or a [Blocker]  -> design-fix (target ONLY that finding)
                                        -> re-render the affected viewport(s) only
                                        -> re-evaluate -> repeat
  Layer-1 PASS and no Blocker, only [Medium]/Nit + advisory lens notes
                                        -> present result + the advisory list; do NOT loop
  iteration count reaches 3             -> STOP; surface "needs human review" with the
                                           open findings and what was tried
```

Cost-aware: a single-token fix re-renders one viewport, not the whole matrix
(`design-render` supports targeted re-render). Never burn an iteration on a Layer-2
score; Layer-2 is advisory and never blocks iteration — the REDESIGN register-fit
veto (below) is a verdict rule, not an iteration cost (see `references/gates-and-loop.md`).

REDESIGN-only, before the loop starts: apply the incumbent guard
(`references/gates-and-loop.md` Section 7). If no new direction beats the incumbent on the
weighted score AND holds register-fit at least at the incumbent, do NOT enter the iterate
loop — report "current design wins — no change recommended" and STOP. The loop iterates
only on a direction that cleared the guard.

REDESIGN method by headroom (the router classifies before generating): a REDESIGN runs in
one of two methods picked by the incumbent's headroom against its register.
- **Tournament** — bad→good, big headroom (the incumbent is off-register or weak): spawn N
  bold competing directions PLUS the incumbent, let `design-council` judge, then apply the
  guard.
- **Incremental polish** — good→great, already on-register: do NOT tear out a working
  design. Generate a ranked set of small, surgical diffs off the incumbent (one change
  each), render each, A/B each diff against the incumbent under the SAME guard, and stack
  only the diffs that improve overall without lowering register-fit. Nothing is torn out.
The incumbent guard (`references/gates-and-loop.md` Section 7) applies to BOTH methods.
Method selection + the diff-polish recipe: `references/routing.md` and
`${CLAUDE_PLUGIN_ROOT}/skills/design-generate/references/incremental-polish.md`.

## Decision handling (auto-decide vs surface)

Classify every intermediate choice and act per `gstack/autoplan`:

- **Mechanical** (one right answer): auto-decide silently — e.g. run the machine gates
  (always), render both viewports + both modes (always), re-render only the changed
  viewport.
- **Taste** (reasonable people differ): auto-decide WITH a one-line recommendation and
  surface it at the final approval gate — e.g. which direction the tournament should
  favor, borderline scope.
- **User-Challenge** (the evidence says the user's stated direction should change):
  NEVER auto-decide. Surface with what the user said / what the evidence shows / the
  cost if wrong. The user's direction is the default.

Maintain a short **Decision Audit Trail** (one line per non-trivial decision; the
first line names the involvement mode that ran) and STOP at the owner gates the
active mode defines — exactly ONE final approval gate in both modes, plus the three
early checkpoints when hands-on. No work lands on real surfaces before the final
gate. Detail and the principle list: `references/decisions-and-orchestration.md`.

## Close the loop (MANDATORY, right after the owner approval gate)

Every pass that showed the owner pixels ENDS by recording what happened — the next pass
starts smarter, and the highest-value lesson this plugin carries came from an owner
rejection that almost went unrecorded. Never skip this because the outcome felt routine.

1. **Write the sign-off record** (`design/signoff@1` — a direct archive write) to
   `<project>/.design/signoffs/<date>--<surface>.json`: decision
   (approved / rejected / approved-with-changes), a short verbatim owner quote, what it
   clarifies (register / taste / scope / none). Update the matching council verdict's
   `ownerVerdict` + its ledger line. Write the **`design/run@1` run record** (edition,
   skills fired, engines, council shape, iterations, renders, MEASURED tokens, wall
   clock, outcome) to `<project>/.design/runs/` — cost comparisons accrue from real
   runs; measured numbers only, never estimates.
2. **Route by content:**
   - the owner CORRECTED or REJECTED something → dispatch `design-learn` WRITE-BACK
     (propose exactly ONE stamped, tagged lesson diff);
   - the verdict CLARIFIES taste or the register → propose a profile `_taste` diff
     (approvedExemplars / rejectedDirections / registerClarifications — reviewable, the
     owner saves it; clarifications elaborate the `_register`, never replace it);
   - plain approval → record an `approvedExemplars` candidate ONLY if the owner used
     superlatives; routine sign-offs are not taste.

Record shapes, the store map, and the archive-vs-diff write policy:
`references/close-the-loop.md`.

## Hard rules

- Invoke the matching sub-skill via the Skill tool / Read-and-follow as the FIRST
  action; do not answer a design request directly. (Descriptions alone undertrigger —
  `gstack` proved it; the plugin's `CLAUDE.md` routing block reinforces this.)
- GROUND before taste before code. An ungrounded generate hallucinates the contract.
- Machine gates are hard; lens scores advise. Never block the loop on a VLM score.
- One token source of truth. If a sub-skill needs a token, it comes from
  `design-tokens` via `design-ground` — never minted ad hoc.
- Never homogenize registers. Pass the profile to every sub-skill.
- Honor the involvement mode: autonomous = ONE final gate, never nag mid-loop;
  hands-on = the three early checkpoints are owner decisions (never skip or
  self-answer one). The mode is asked-and-recorded, never silently switched.
- Cap the loop at 3; then escalate to the owner. Do not silently keep iterating.
- Do not re-implement `static-gates.mjs` (evaluate) or `render.mjs` (render). Dispatch
  those skills; they own and run those scripts at
  `${CLAUDE_PLUGIN_ROOT}/skills/design-evaluate/scripts/static-gates.mjs` and
  `${CLAUDE_PLUGIN_ROOT}/skills/design-render/scripts/render.mjs`.

## References

- `references/routing.md` — the intent classification table (trigger phrases ->
  intent), the full per-intent gate sequences, the sub-skill registry map, and
  near-miss exclusions (what NOT to route here).
- `references/gates-and-loop.md` — gate ordering rationale, the two-layer seam
  (Layer-1 hard / Layer-2 advisory + the honest banner), the iterate loop with the
  3-iteration cap, and cost-aware re-render.
- `references/decisions-and-orchestration.md` — the thin-orchestrator contract (read
  from disk, run at full depth), Mechanical/Taste/User-Challenge classification, the
  auto-decide principle list, the Decision Audit Trail, and the single approval gate.
- `references/close-the-loop.md` — the durable store map (project `.design/` · dataDir ·
  owner-global · shipped seeds), the archive-vs-diff write policy, and the canonical
  record shapes (`design-council/verdict@1`, `design/signoff@1`, the ledger line, the
  profile `_taste` block).
