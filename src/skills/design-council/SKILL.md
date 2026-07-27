---
name: design-council
description: The judge for visual design. Runs a panel of distinct NAMED design lenses (Jobs, Norman, Hall, Spool, Compliance-honesty, plus a craft lens) that each READ the rendered screenshots, critique from one point of view, and pick a winner; then a chair synthesizes the best-of-all into one brief. Use to judge a design-generate tournament (which of N rendered directions wins, and what to graft from the losers), to run a multi-lens design review or critique of built/mocked UI, to break a tie between mockups, or whenever the user says "judge these designs", "which direction is best", "run the design council", "critique this UI from multiple perspectives", "design panel / jury / review board", "pick the winning mockup", or "synthesize the best of these options" — even if they don't name the council.
shell: bash
---

# design-council — the multi-lens design judge

Render-grounded, qualitative judgment. A panel of NAMED lenses each critiques the SAME rendered designs from one strong point of view, then a chair synthesizes one best-of-all brief. This is the **judge** of the design pipeline: it scores the `design-generate` tournament and runs multi-lens REVIEW passes. It is the Layer-2 taste authority that `design-evaluate` defers to.

!`node "${CLAUDE_PLUGIN_ROOT}/scripts/read-lessons.mjs" design-council 2>/dev/null`

## MUST rules (read first)

- **Judge the PIXELS, not the prose or the HTML.** Each lens reads the actual rendered PNGs (desktop + mobile, light + dark). A picture is worth 1000 tokens. If no renders exist, STOP and route to `design-render` first — never judge from source code or a description.
- **This is qualitative.** There is NO numeric rubric and NO pass/fail score. Taste is graded with prose verdicts, a ranked winner, and concrete keeps/cuts. Do not invent a 1–10 scale or an "approval threshold" — that is `design-evaluate` Layer-1's job, not the council's.
- **Machine gates run FIRST and are not relitigated. Floor-clean is a PRECONDITION for scoring (R1).** A candidate may be scored only if every SHIPPED HARD `design-evaluate` Layer-1 gate for its surface exited 0 AND those gate outputs exist as artifacts. Otherwise it is **UNSCORED** — no rubric score, no lens score, no rank, no juror record, no place in the tally — recorded with that word and the failing (or missing) gate named. UNSCORED is **never** "scored low": a low score is an opinion, and this seat has no standing to hold one about a surface the floor already ruled on or never measured. A prose claim that Layer-1 passed with no artifact to point at is a MISSING bundle, hence UNSCORED. *(E4 falsified the render-only seat: a candidate with a real 3.12:1 AA contrast failure won its external set and no juror saw it — `evals/validation/E4-JUDGING-SEAT-REPAIR-DECISION.md`.)*
- **Panels read the gate outputs WITH the renders (R2).** Where a candidate is scored, its Layer-1 gate outputs travel with its renders in every juror input set, and the juror record's `inputTranscriptSha256` covers them. Gates that did not run are named as not-run — silence never reads as a pass. Praise is not spent on a property the floor already measured; a gate the floor passed is not relitigated.
- **Honor the project's REGISTER.** Judge against the active profile's intended feeling (a serious-trust register and a warm-fun register fail different things), never a global ideal. Loud is correct for one register and wrong for another. Profile resolution: `<project>/.design/profile.json` → `<dataDir>/profiles/<project>.json` → none found = the gate ABSTAIN-BLOCKs.
- **Distinctive ≠ wrong (the false-positive filter).** A motivated bold choice — a saturated palette, dramatic type scale, a signature motion moment — is a SUCCESS, never a defect. When unsure whether something is a tell or a decision, treat it as a decision. The panel must not flatten intent into a safe default. (See `references/false-positive-filter.md`.)

## When this fires

- **Tournament judge** — `design-generate` produced N rendered directions from different taste engines; the council picks the winner and names the grafts. This is the default and most important use.
- **Multi-lens review** — the user wants a built or mocked UI critiqued from several expert perspectives at once.
- **Tie-break / decision** — two directions are close; the council resolves it with reasoned verdicts.

Routing is owned by the `design` router skill — it dispatches here. Do not re-implement routing.

<!-- FULL-ONLY-START -->
## Two tiers — fast pass vs deep pass

The council runs in two tiers (full definition + trigger matrix + register-weights: `references/deep-pass-composites.md`, derived by a STORM perspective-discovery pass and validated by a blind oracle re-run):

- **FAST pass (default)** — the **7 seats** (six lenses + the Register-fit gate) wrapped by the frame (Basic-Fact, Refuter, Incumbent-Present — the Register-fit gate is the 7th seat, not re-listed in the frame). Enough for most surfaces.
- **DEEP pass** — the 7 seats **plus a small bench of composite lenses seated ONLY by the surface's trigger artifact**: a chart → **C1** Quantitative-Honesty (grounded in `references/dataviz-canon.md`); a dense table → **C2**; a custom composite widget or hidden-scroll overflow → **C4**; an auth/consent/sensitive-action surface → **C5**; copy that can invert meaning or AI-extracted text → **C6**; a KPI dashboard → **C7**; a consumer-facing surface where a non-expert reads/enters consequential data → **C8** Persona-Bench (`references/persona-bench.md`); and **always** → **P56** Content-Robustness + **P45** Provenance + **P25** Honest-State. (First-run/empty-state coverage is NOT a standing composite — it is SETTLED as checklist lines inside the Spool and Compliance-honesty lenses; see `references/lenses.md`.) **Cap ≈ 12–13 jurors on any one surface — never all at once.** Every composite is **register-subordinate** (a constraint, never the register).

Run the deep pass on a redesign that will ship, a high-stakes surface, or any surface carrying a trigger artifact; otherwise the fast pass suffices. The machine-certain a11y checks (contrast / computed-AA both themes / focus-trap / target-size / reflow) are `design-evaluate` **Layer-1** items — measured, no model in the loop, **never** council jurors.
<!-- FULL-ONLY-END -->
<!-- LITE-ONLY: ## The council panel (the 7 seats) -->
<!-- LITE-ONLY: The council runs as **7 seats** — six discipline/craft lenses + the Register-fit gate — wrapped by the frame (Basic-Fact, Refuter, Incumbent-Present). The machine-certain a11y checks (contrast / computed-AA both themes / focus-trap / target-size / reflow) are `design-evaluate` **Layer-1** items — measured, no model in the loop, **never** council jurors. -->

## The workflow: Council → Synthesize → (Build) → Verify

A four-phase recipe. Run it as a thin orchestrator: read each lens definition from `references/lenses.md` and apply it at FULL DEPTH; never inline-summarize a lens away.

### Phase 0 — Ground the panel (always)

Read, in order:
0. **The council ledger + the latest verdict for this surface** —
   `<project>/.design/council/ledger.md` (or the dataDir archive), if any. HARD RULES:
   a direction listed in a prior `rejectedDirections` (or an owner-REJECTED verdict) for
   this surface must NOT be re-proposed or re-crowned unless the owner explicitly reopens
   it; still-open `registerSafeGrafts` surface as the grafts backlog; the recorded
   winner/baseline is the incumbent candidate source. (Record shapes: the `design` skill's
   `references/close-the-loop.md`.)
1. The active project **profile** (register, banned color clusters, token module) — see the profiles resolution above. Read the profile's **literal `_register` string** — the Register-fit gate scores against those exact words. If the profile carries **no `_register` string, the gate ABSTAIN-BLOCKs** (never guess a register).
<!-- FULL-ONLY-START -->
   On a DEEP pass, note which trigger artifacts the surface carries and seat the matching composites (`references/deep-pass-composites.md`).
<!-- FULL-ONLY-END -->
2. The **rendered PNGs** for every candidate (every viewport + mode) **and that candidate's Layer-1 gate outputs** (R2 — the two travel together in every input set). If renders are absent → route to `design-render`, then return; if the gate outputs are absent → the candidate is UNSCORED (R1), not judged on its renders alone. On a **REDESIGN**, the candidate set MUST include the current/live design as a labeled competitor **incumbent** (rendered to the same matrix). If the redesign brief gave no incumbent render, STOP and ask for it — a redesign judged with no incumbent cannot detect a regression.
3. `references/lenses.md` (the six lens definitions) and `references/four-exit-tests.md` (the Swap / Squint / Signature / Token tests).
4. The **brief / product context** so each lens knows the subject, audience, and the page's single job.
<!-- FULL-ONLY-START -->
   If the ground context carries a **`stormBrief`** (from `design-ground` → `design-storm`), read it too: the Register-fit and Craft lenses may CITE its supported findings to ground a critique (evidence, not vibes), the chair treats its supported findings as constraints (table stakes, like the diagnosis), and its `flagged`/`abstained` entries carry NO evidentiary weight (silence ≠ absence). A STORM finding never lowers or raises the Register-fit gate — that stays judged against `_register`.
<!-- FULL-ONLY-END -->

State the subject, audience, and job in one line before judging. Distinctive choices come from the subject's own world; a lens cannot tell "intentional" from "generic" without knowing the brief.

### Phase 1 — Council (the jurors, in parallel)

Run the **six discipline/craft lenses independently and in parallel** (one Task per lens scales best; sequential is acceptable); the seventh seat — the Register-fit gate — is staffed separately as a multi-juror median panel (H1, below). Each juror:
1. Reads ALL candidate PNGs from its single point of view.
2. Runs the **four exit tests** on each candidate (Swap / Squint / Signature / Token — see `references/four-exit-tests.md`).
3. Writes a short verdict per candidate (including **incumbent** on a redesign — score it on the same scale as the new directions, never exempt or anchor it), **picks a winner from its lens**, and lists the concrete **best aspects of EACH candidate to keep** plus the weaknesses to cut.
4. Applies the false-positive filter to its own findings (bold-on-purpose is not a flaw).

The seven seats — six discipline/craft lenses plus the Register-fit gate (full definitions in `references/lenses.md`):

| Lens | Judges for |
|---|---|
| **Jobs** | conviction over configuration; one opinionated point of view; "a generation ahead", never toy-like |
| **Norman** | calm is load-bearing; cognitive ease; one obvious next action; signifier/affordance honesty |
| **Register-fit** (CHAIR-WEIGHTED, gate) | does this match the active profile `_register` — its stated feeling (for a warm consumer register: warm / playful / fun / colorful, characterful executed WITH Linear-discipline, NOT discipline as the personality)? Judged ONLY against `_register`, never a global "good design" ideal. The warmth/character/color/voice fidelity seat. |
| **Hall** | brand honesty; AA-as-brief; identity separation; fintech-grade rigor at a welcoming threshold |
| **Spool** | findability + task success + scannability — "what is this / what do I do" answered in one glance |
| **Compliance-honesty** | anti-dark-pattern; uncoerced consent; honest empty/error/sample states (product-specific; swap per profile) |
| **Craft** | micro-craft floor: spacing rhythm, hierarchy, typographic detail, state coverage, motion restraint, premium polish |

**Register-fit is a SEVENTH, distinguished seat.** It is NOT averaged equally with the others: the chair treats it as a **GATE** (Phase 2) and weights it above any single discipline/craft lens. Rationale: register-fit is the project identity; the other lenses are quality. A direction can be impeccably disciplined and still be the WRONG product — that is a register-fit FAIL the average must never wash out.

**Staff the gate as a MULTI-JUROR MEDIAN (H1), not one read.** Run Register-fit as an **odd** panel of **N=5** (min 3 — odd so the median resolves to one real juror's score, never an averaged 2–2 split) independent jurors scoring the same **mode-fair** renders (H2 — every candidate incl. the incumbent in the same color mode[s]) blind against the literal `_register`; take the **median** per candidate. A redesign clears the gate only if its median ≥ the incumbent's median AND the panels are **non-overlapping** (a confident supermajority); an overlapping/coin-flip panel keeps the incumbent ("no confident change"). The other six lenses stay single-juror (they're excluded from the ranking mean, so their noise doesn't decide). Full rule: `references/lenses.md` §7. *(Why: on a blind re-run a single-juror gate flipped and would have crowned an owner-rejected variant; a 5-juror median was unanimous.)*

Lens 5 (Compliance-honesty) is the one product-specific seat — replace it per profile when the product isn't trust/legal-shaped, but keep an honesty lens. The other five are stable; **Register-fit** is the chair-weighted gate seat and is ALWAYS present, scored strictly against the profile `_register`.

### Phase 2 — Synthesize (the chair)

One chair agent (not a lens) consolidates, using the gnurio meta-refactor consolidation pattern — **collect verdicts → group findings by theme → DEDUPE across lenses → prioritize → resolve conflicts**:
1. **Tally the verdicts, then apply the incumbent guard (REDESIGN).** Compute each candidate's weighted score with **Register-fit weighted ABOVE any single discipline/craft lens** (gate seat, not 1/N of a flat mean). The gate value is the **MEDIAN of the N-juror register-fit panel** (H1); unseat the incumbent only on a **non-overlapping supermajority** (challenger median ≥ incumbent median AND challenger max ≤ incumbent min) — an overlapping panel keeps the incumbent.
<!-- FULL-ONLY-START -->
   The machine-enforced **aggregation contract** (`references/deep-pass-composites.md`) governs the mechanic:
<!-- FULL-ONLY-END -->
<!-- LITE-ONLY: The machine-enforced **aggregation contract** governs the mechanic: -->
   register-fit is a **pre-aggregation VETO** (not a term inside the mean), and discipline / craft / honesty / composite findings are **constraints excluded from the ranking mean** — only register (decisive) + conviction rank the winner. On a redesign a new direction may be named winner ONLY if it (a) beats **incumbent** on the weighted score AND (b) scores at least incumbent on Register-fit. If no new direction clears BOTH, the winner is the incumbent: report **"current design wins — no change recommended"**, name which directions failed which clause, and list grafts that could improve the incumbent without lowering its register-fit. Never average a flat mean that lets a more-disciplined-but-colder direction beat the incumbent (the exact failure that crowned Restraint over the warmer incumbent on a warm consumer app's home screen). Otherwise name the winning **frame** (the direction most lenses favor and that survives the exit tests best).
2. **Name the grafts.** List the specific best-of-EACH-loser elements worth keeping (a loser's nav, another's empty state).
3. **Resolve lens conflicts explicitly, register-fit first.** When discipline/calm lenses (Norman, Spool, Craft) pull against character/conviction (Jobs) or against Register-fit, the register-fit gate wins: a candidate calmer/cleaner but lower on register-fit does NOT win on a redesign. State the trade-off and cite the `_register`; never average them into a mush that lets discipline impersonate the register.
4. Write a **component-by-component unified brief**: for each component, the source direction + why.
5. Record a short **Decision Audit Trail** (what was chosen, what was rejected, the one-line reason each) so the call is reviewable.

### Phase 2.5 — Write the verdict record (always, immediately after the chair)

Archive the verdict as a direct write (append-only factual record, no review needed):
the `design-council/verdict@1` JSON to `<project>/.design/council/<date>--<surface>--council.json`
plus one ledger line in `<project>/.design/council/ledger.md` — candidates (incl. the
incumbent), the register-fit panel scores/medians/non-overlap, constraints, guard outcome,
winner, grafts, `rejectedDirections`, and `ownerVerdict: null` (the `design` router's
Close-the-loop step fills it after the owner speaks). Exact shapes: the `design` skill's
`references/close-the-loop.md`. A council run that produced no record is INCOMPLETE — the
next run cannot honor decisions it can't see.

### Phase 3 — Build (optional, only if asked)

If the user wants the synthesized winner built, hand the unified brief to `design-generate` (or build directly), copying tokens + icons verbatim from the shared design-system contract. The council does not own generation — keep this thin.

### Phase 4 — Verify

Run the built/winning design back through the floor: `design-evaluate` Layer-1 (token purity, AA, states), the four exit tests one more time, and the profile's honesty rules (no fabricated data; labeled synthetic data). The council's job ends at a reviewed, render-grounded verdict — not a silent rubber-stamp.

## Output shape

Return one consolidated verdict, not six raw transcripts:
- **Winner** — the direction + a two-line why.
- **Incumbent comparison (REDESIGN)** — the incumbent's weighted + register-fit scores, and for the crowned winner the explicit "beats incumbent overall AND at least on register-fit" check (or "current design wins — no change recommended" if nothing cleared it).
- **Per-lens one-liner** — each lens's pick + its single strongest reason.
- **Grafts** — concrete best-of-each to merge in.
- **Cuts** — what every direction should drop.
- **Conflicts resolved** — the trade-offs the chair adjudicated, with the register cited.
- **Decision Audit Trail** — chosen / rejected / reason.

## How this fits the pipeline

- `design` routes here; do not duplicate its routing logic.
- `design-generate` is the TOURNAMENT this skill judges; `design-render` produces the PNGs the lenses read; `design-evaluate` Layer-1 hard-gates (machine) before the council's Layer-2 advises (these seven seats ARE that Layer-2 panel).
- `design-tokens` is the single token source of truth — the **Token** exit test reads its var names; never assert tokens the council didn't get from the profile/contract.
- Reuse `design-render`'s `${CLAUDE_PLUGIN_ROOT}/skills/design-render/scripts/render.mjs` and `design-evaluate`'s `${CLAUDE_PLUGIN_ROOT}/skills/design-evaluate/scripts/static-gates.mjs` — the council never reimplements rendering or the machine gates.

## Reference files

- **`references/lenses.md`** — the council's named seats in full (six discipline/craft lenses + the Register-fit gate: what each looks for, its winner heuristic, its failure tells, how it reads a render).
- **`references/four-exit-tests.md`** — Swap / Squint / Signature / Token, with the pass/fail call for each.
- **`references/false-positive-filter.md`** — the "distinctive ≠ defect" guard so the panel never flattens intent.
- **`references/registers.md`** — how each project register changes what "good" means; reading the profile.
- **`references/recipe.md`** — the full Council→Synthesize→Build→Verify run with the tournament-judge variant and consolidation algorithm.
- **`references/craft-rubric.md`** — the NUMERIC proportion contract the Craft seat grades against (4px grid, radius ladder, type-scale adherence, icon size-set, key:value rails; L-014).
<!-- FULL-ONLY-START -->
- **`references/deep-pass-composites.md`** — the DEEP-pass bench: the surface-triggered composite lenses (C1–C8, P56, P45, P25), the trigger matrix, the numeric per-register weight matrix, the frame preconditions, and the machine-enforced aggregation contract.
- **`references/persona-bench.md`** — the C8 consumer think-aloud seat in full (two diverse personas, the convergence rule, constraint-grade findings, honest bounds; L-017).
- **`references/dataviz-canon.md`** — the primary-source canon (Tufte / Cleveland-McGill / Ware + numeric-honesty) that grounds the data-viz composites C1/C2/C7.
<!-- FULL-ONLY-END -->
