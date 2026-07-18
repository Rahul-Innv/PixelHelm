---
name: design-fix
description: Applies the SMALLEST surgical change that clears ONE specific design finding, then re-renders and re-evaluates only the targeted area to confirm green — the autocorrect step of the design loop. Use when a design-evaluate / design-council audit returned findings and the user says "fix the findings", "fix the blockers", "clear the contrast failure", "apply the fix", "make the audit pass", "remediate the violations", "patch this finding", "auto-fix the a11y issues", "swap the literals for tokens", "add the reduced-motion block", or "deslop this without redesigning it". Takes problems-described findings (no prescribed CSS) and decides the minimal edit. NOT for generating new UI from a brief (that is design-generate), NOT for grading or producing findings (that is design-evaluate / design-council), NOT for a full redesign or rebuild from scratch (escalate). Honors the token source of truth and never flattens a motivated bold choice.
shell: bash
---

# Design Fix

!`node "${CLAUDE_PLUGIN_ROOT}/scripts/read-lessons.mjs" design-fix 2>/dev/null`

Apply the **smallest change that clears a specific finding**, re-target only the
violation, then **re-render + re-evaluate** to prove it cleared. This is the
*autocorrect* step of the design loop: a finding came in, one minimal edit goes
out, the gate confirms green. It is the mutation skill — separate, on purpose,
from the skills that judge.

This is an **OBJECTIVE skill**: it succeeds or fails against the gate, so it
ships explicit PASS/FAIL Decision Criteria below (a schema gate + LLM judge can
grade it). It does NOT produce findings and it does NOT grade taste.

## Where this sits in the plugin

The `design` router dispatches here on a FIX / remediate / "make the audit pass"
intent, with a findings set in hand. Do NOT re-implement routing. Honor the seams:

- **design-evaluate / design-council DESCRIBE; design-fix DECIDES the value.**
  Findings arrive as *problem + impact* ("the spacing reads inconsistent",
  "secondary text fails contrast on the card") — never as a prescribed CSS value.
  This skill chooses the concrete edit. If a finding already carries a value,
  treat it as a hint, not a mandate.
- **design-tokens is the single token source of truth.** Every fix that touches a
  color/size/space/duration resolves to a **semantic token name**, never a raw
  literal. "Change the hex, never the threshold" — you may not weaken a gate to
  pass it. Read the active profile's `tokenModule` and `allowRawColorIn` so the
  edit uses real token names and respects the only files allowed to carry hex.
- **design-render renders; design-evaluate gates.** After every fix, re-render the
  touched surface (`design-render`'s `render.mjs`) and re-run the gate
  (`design-evaluate`'s `static-gates.mjs`). Do NOT re-implement render or the
  gates — invoke the existing scripts (paths below).
- The active **per-project REGISTER is a hard input — never homogenize.** E.g. a
  regulated trust portal = serious-trust; a warm consumer app =
  warm-premium-fun-but-calm; an analyst data product =
  analyst-terminal. A "fix" that drags the surface toward a global default is a
  regression. Read `${CLAUDE_PLUGIN_ROOT}/profiles/<project>.json`.

## Inputs required before starting

1. **The findings set** from design-evaluate / design-council: each a
   `{ severity, location, problem, impact }`. Layer-2 (lens) findings describe;
   Layer-1 (machine-gate) findings name an exact failing assertion + element.
2. **The active profile** (`${CLAUDE_PLUGIN_ROOT}/profiles/<project>.json`, or the
   path the router passes): `tokenModule`, `allowRawColorIn`, `bannedClusters`,
   the register. Token names come from here.
3. **The current baseline** (`.design-baseline.json`) if present, so a fix is not
   credited for clearing a finding while regressing a previously-Fixed one.
4. **The system-of-record of intent** (the project's `system.md` / DESIGN.md /
   brief) — needed to apply the "what is NOT slop" guard before mutating.

If a finding's location, problem, or the intended token target is genuinely
ambiguous, STOP and ask — do not guess and mutate.

## The autocorrect loop (one finding at a time)

Run this loop per finding, **blockers first, then high, then medium**. Full
detail + the auto-rewrite catalog: `references/recipe.md`.

1. **Classify the finding.** Surgical (a value/name/missing-state edit clears it)
   vs structural (the decision itself was never made — no focal point, flat
   hierarchy, monotone layout). **Surgical → fix here. Structural → STOP and
   escalate** (rebuild from the decision is design-generate / a gated redesign,
   not a patch). See the classifier in `references/recipe.md`.
2. **Apply the "what is NOT slop" guard BEFORE editing.** A motivated bold choice
   — a saturated palette, a dramatic scale, a one-off focal radius, an asymmetric
   layout with a reason — is a SUCCESS, not a defect. When unsure whether
   something is a tell or a decision, **treat it as a decision and leave it**.
   Anything ratified by `system.md` is a decision. A cleanup that strips intent is
   worse than the slop. Details: `references/guards.md`.
3. **Decide the smallest edit.** Resolve the problem to ONE concrete change at the
   token/name level. Prefer the auto-rewrite rules where they apply
   (`references/auto-rewrites.md`): layout-property animation → `transform`/
   `opacity`; raw literal → semantic token; missing `prefers-reduced-motion` →
   add the reduced variant; `outline:none` → `:focus-visible` ring; icon-only
   control → add `aria-label`; off-grid value → snap to the scale.
4. **Edit surgically — exact string replacement, never a rewrite.** Use the Edit
   tool with a unique `old_string` → `new_string`. Do NOT regenerate the file,
   the component, or untouched lines. Re-target ONLY the violation; touch nothing
   outside the finding's location. One finding = one tight diff.
5. **Re-render the touched surface.** Invoke `design-render` so the change is
   verified on the real rendered DOM, both viewports + light/dark where relevant
   (and the reduced-motion variant if motion changed).
6. **Re-evaluate — only the violation + the baseline.** Re-run the gate; confirm
   the targeted finding now PASSES and **no previously-passing check regressed**
   (the baseline catches this). If the fix regressed something, REVERT it and
   re-classify — a fix that trades one finding for another has not cleared
   anything.
7. **Record + move to the next finding.** Note `finding → edit → cleared` for the
   audit trail. Repeat until the findings set is exhausted or only
   structural/escalated items remain.

## Decision Criteria (PASS / FAIL)

A design-fix run **PASSES** only when ALL hold:

- **P1 — Targeted finding cleared.** The specific finding's gate assertion (or its
  described problem, re-evaluated) now passes on the re-rendered DOM.
- **P2 — No regression.** Every check that passed before still passes; the
  baseline shows zero New/Regressed findings introduced by the edit.
- **P3 — Minimal diff.** The change is the smallest edit that clears the finding —
  exact-string replacement scoped to the finding's location, no rewrite of
  untouched code, no opportunistic refactor.
- **P4 — Token-true.** Any color/size/space/duration touched resolves to a
  semantic token name (or sits inside an `allowRawColorIn` file); no new raw
  literal, no banned-cluster value, no weakened gate/threshold.
- **P5 — Intent preserved.** No motivated/bold/ratified choice was flattened; the
  surface still reads in its project register.

A run **FAILS** if ANY hold:

- **F1 — Gate weakened.** A threshold, an assertion, or a test was edited to make
  a finding "pass" instead of fixing the UI.
- **F2 — Scope creep.** The diff rewrote the file/component, touched lines outside
  the finding, or bundled an unrelated change.
- **F3 — Structural patch.** A "decision never made" finding (no focal point, flat
  hierarchy, monotone layout) was nudged with value tweaks instead of escalated.
- **F4 — New literal / banned value.** The edit introduced a raw hex/px outside an
  allowed file, or a `bannedClusters` value.
- **F5 — Intent flattened.** A bold, motivated, or system-ratified choice was
  removed because it looked uncommon.
- **F6 — Unverified.** The fix was not re-rendered + re-evaluated, or it regressed
  a previously-passing check and was left in place.

## Hard rules (do not violate)

- **Fix the UI, never the gate.** Editing `static-gates.mjs`, a contrast
  threshold, an `expect`, or a token's AA value to clear a finding is the cardinal
  sin (F1). The thresholds are constants.
- **One finding, one minimal diff.** No batch-rewrites; no "while I'm here". Re-run
  the loop per finding so each edit is independently verifiable and revertible.
- **Surgical, not regenerative.** Exact string replacement. If a fix can only be
  done by rebuilding the component, it is structural — escalate, do not half-do it.
- **Treat ambiguity as a decision, not a defect.** When unsure if something is slop
  or intent, leave it and note it. Distinctive is the goal, not the bug.
- **Always re-render + re-evaluate.** An unverified fix is not a fix. A fix that
  regresses the baseline must be reverted, not shipped.

## References

- `references/recipe.md` — the per-finding loop in full, the surgical-vs-structural
  classifier, severity ordering, the revert-on-regression rule, and worked
  examples (contrast fail, missing focus ring, motion violation).
- `references/auto-rewrites.md` — the deterministic auto-rewrite catalog (each:
  pattern → minimal edit → token target), sourced from the motion/evaluate findings.
- `references/guards.md` — the "what is NOT slop" filter, the
  surgical-vs-structural / rebuild-from-the-decision boundary, and the
  exact-string-replacement edit discipline.
- `references/seams.md` — the script/skill handoffs: which render/gate scripts to
  invoke (never re-author), the problems-not-prescriptions contract, the baseline
  regression check, and the profile inputs.
