# design-fix recipe — the per-finding autocorrect loop

Contents:
- [Intake: shape of a finding](#intake-shape-of-a-finding)
- [The surgical-vs-structural classifier](#the-surgical-vs-structural-classifier)
- [Severity ordering](#severity-ordering)
- [The loop, step by step](#the-loop-step-by-step)
- [Revert-on-regression](#revert-on-regression)
- [Worked examples](#worked-examples)
- [Output](#output)

Source provenance for this skill (build-spec §1 `design-fix` ingredient table):
- *Rebuild from the decision, not as patches; gate mutation behind approval* —
  `Dammyjay93 interface-design/design-review.md` L130-132 ("Applying fixes").
- *Surgical edits via exact string replacement; do NOT regenerate the file* —
  `abi__screenshot-to-code` `edit_file` (old_text/new_text/count) + Lovable
  search-replace-over-write.
- *Problems-not-prescriptions in → patch out* — `OneRedOak design-review-agent.md`
  L68 (Layer-2 describes; design-fix decides the CSS).
- *"What is NOT slop" guard* — `Dammyjay93 design-deslop.md` L44-54.

---

## Intake: shape of a finding

Each finding from design-evaluate / design-council is:

```
{ severity: Blocker | High | Medium | Nit,
  location: file:line or selector/component,
  problem:  what defaulted / what fails (described, not prescribed),
  impact:   why it costs the user or reads as generic,
  layer:    1 (machine gate, exact assertion) | 2 (lens judgment) }
```

Layer-1 findings name an exact failing assertion + element (e.g. "input
font-size 14px < 16px floor → iOS zoom-on-focus"). Layer-2 findings describe a
problem ("the spacing feels inconsistent, creating visual clutter"). **Neither
carries the CSS value to apply — design-fix decides it.** If a finding does carry
a value, treat it as a hint and still verify against the token system.

## The surgical-vs-structural classifier

The single most important call. Run it FIRST per finding.

**Surgical** (fix here) — a value, a name, or a missing piece clears it, and the
decision behind the UI was already made:
- a contrast failure (wrong token / wrong elevation step)
- a raw literal where the system has a token
- a layout-property animation, a missing `prefers-reduced-motion` block, a
  symmetric ease where asymmetric is required
- a missing interaction state (hover/focus/active/disabled) on an element whose
  styling otherwise exists
- `outline:none` without `:focus-visible`; icon-only control without `aria-label`
- an off-grid value (17px on a 4/8 base); slack tracking on a large heading;
  proportional digits where `tabular-nums` is needed
- a harsh 1px solid border / dramatic elevation jump → quieter token
- a `<div onClick>` that should be a `<button>`/`<a>` (a contained swap)

**Structural** (STOP — escalate, do not patch) — the *decision* itself was never
made; nudging values just defaults harder:
- no focal point — nothing leads
- flat hierarchy across the whole screen (everything one size/weight/color)
- monotone layout (grid of identical boxes), needs zoning/proximity
- a wholly-absent empty/loading/error state (build work, not a cleanup)
- a from-scratch dropdown/modal/tooltip with no keyboard/focus/ARIA — needs the
  real accessible primitive (a rebuild, not a tweak)
- any fix that can only be done by re-deriving the focal point / type hierarchy /
  surface system

For structural findings: **rebuild from the decision, not as patches over the
defaults** (Dammyjay93 L132). That re-derivation belongs to design-generate or a
gated redesign. From design-fix: report it as a clearly-named follow-up, with the
decision that needs making, and move on. Do NOT half-do a rebuild with value
tweaks (that is FAIL F3).

## Severity ordering

Fix in this order; stop the run cleanly if blocked on an escalation:
1. **Blocker** — fails the approval bar / a Layer-1 gate. Always first.
2. **High** — significant, fix before merge.
3. **Medium** — improvement; fix if surgical.
4. **Nit** — one-line cosmetic; fix only if trivially surgical, else note.

Within a severity, fix Layer-1 (machine-certain) before Layer-2 (judgment) —
machine findings have an unambiguous pass target.

## The loop, step by step

For each finding, in severity order:

1. **Classify** (surgical vs structural). Structural → escalate + next finding.
2. **Apply the "what is NOT slop" guard** (`guards.md`). Motivated/bold/ratified →
   not a defect; close it as a non-finding with the reason. Unsure → treat as a
   decision and leave it.
3. **Decide the smallest edit.** Map problem → ONE concrete change at the
   token/name level. Check `auto-rewrites.md` first — most Layer-1 findings have a
   deterministic rewrite. Resolve any color/size/space/duration to a **semantic
   token name** from the profile's `tokenModule`. Never introduce a raw literal
   outside `allowRawColorIn`; never use a `bannedClusters` value.
4. **Edit surgically.** Edit tool, unique `old_string` → `new_string`, scoped to
   the finding's `location`. Do NOT regenerate the file or touch untouched lines.
   If the change cannot be expressed as a tight replacement, it is structural —
   go back to step 1 and escalate.
5. **Re-render** the touched surface via `design-render` (`seams.md`): both
   viewports + light/dark where relevant; the reduced-motion variant if motion
   changed.
6. **Re-evaluate** via `design-evaluate`'s gate (`seams.md`): confirm the targeted
   finding now PASSES, and diff against `.design-baseline.json` to confirm zero
   New/Regressed. The gate is the oracle — do not self-certify.
7. **Record** `finding → edit → cleared | escalated | reverted` and proceed.

## Revert-on-regression

If step 6 shows the edit cleared the target finding but **regressed a
previously-passing check** (baseline classifies it Regressed — auto-top-severity):
- **REVERT the edit immediately** (it traded one finding for another — net zero).
- Re-classify: the real fix is different (often a different token, or the finding
  is structural). Try the alternative, or escalate.
- Never leave a regressing edit in place to be "fixed later" — that is FAIL F6.

A run is only PASS when the target cleared AND the baseline is clean.

## Worked examples

**Contrast fail (Layer-1).** Finding: "secondary label `--text-muted` on
`--surface-card` = 3.1:1, < 4.5:1 AA." Surgical. Smallest edit: re-point the
label to the system's compliant role (e.g. `--text-secondary`, already AA on
that surface) — do NOT invent a new hex, do NOT lower the threshold. Re-render,
re-gate: contrast assertion passes, baseline clean. PASS.

**Missing focus ring (Layer-1).** Finding: "primary button has `outline:none`,
no `:focus-visible`." Auto-rewrite: add the token box-shadow focus ring under
`:focus-visible` (C2 ruling — box-shadow respects radius). One replacement.
Re-render keyboard-focus state, re-gate. PASS.

**Motion violation (Layer-1).** Finding: "card hover animates `width` (layout
property) and ships no reduced-motion variant." Two auto-rewrites: `width` →
`transform: scaleX()` (or rethink to opacity); add a `prefers-reduced-motion:
reduce` block dropping the transform, keeping opacity. Re-render default +
reduced-motion variants, re-gate. PASS.

**Flat hierarchy (Layer-2, structural).** Finding: "no focal point — every
metric box is equal weight." NOT surgical. Do NOT bump one font-size and call it
done (F3). Escalate: "Structural — focal point was never decided. Needs a
re-derivation of the hierarchy (which metric is the hero) → design-generate /
gated redesign." Move to the next finding.

## Output

Close the run with a markdown table: one row per finding —
`severity | location | problem | edit applied (or ESCALATED / NON-FINDING) |
verified (gate result)`. Put cleared Blockers first. List escalations separately
with the decision each needs. End with the gate's honest banner from
design-evaluate (gates prove correctness, not taste) and the count
`cleared / escalated / left-as-intent`.
