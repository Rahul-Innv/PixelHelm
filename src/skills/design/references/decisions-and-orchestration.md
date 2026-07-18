# Decisions and orchestration

Table of contents:
1. The thin-orchestrator contract (read from disk, run at full depth)
2. Mechanical / Taste / User-Challenge classification
3. The auto-decide principle list
4. The Decision Audit Trail
5. The single owner approval gate

Source pattern: `garrytan/gstack/autoplan` — the canonical thin-orchestrator. It reads
the sub-skill files from disk and runs them sequentially at full depth, replacing only
the human's intermediate answers with explicit auto-decision principles + a decision
classification + a Decision Audit Trail + one final approval gate.

---

## 1. The thin-orchestrator contract

The router orchestrates; it does NOT re-implement. For each gate the intent requires:

- **READ** the sub-skill's `SKILL.md` from disk (via the Skill tool or the Read tool)
  and follow it. Run it at the **same depth** as if the user invoked it directly. The
  only thing the router changes is *who answers the intermediate questions* (the router,
  via the principles below) — never the depth of the analysis.
- **DO NOT** compress a sub-skill into a one-line summary, write "looks good" instead of
  the sub-skill's required output, skip a step because "it doesn't apply" without stating
  what was checked, or inline-duplicate the sub-skill's body into the router.
- **DO** produce every artifact the sub-skill requires, pass it the resolved profile +
  register, and carry its output forward to the next gate.

"No findings" is a valid sub-skill output — but only after the analysis ran and the
sub-skill states what it examined. "Skipped" is never valid for a gate the intent
requires.

---

## 2. Mechanical / Taste / User-Challenge classification

Every intermediate choice the router would otherwise ask the user gets classified:

- **Mechanical** — one clearly right answer. **Auto-decide silently.** Examples: run the
  Layer-1 machine gates (always yes), render both viewports + both modes (always yes),
  re-render only the changed viewport after a scoped fix (always yes), eliminate a
  candidate that failed Layer-1 (always yes), GROUND before generate (always yes).
- **Taste** — reasonable people could disagree. **Auto-decide WITH a one-line
  recommendation, then surface it at the final gate.** Three natural sources:
  1. Close directions — two tournament candidates are both viable with different
     tradeoffs.
  2. Borderline scope — a fix in the blast radius but ambiguous in size.
  3. Lens disagreement — a council lens recommends differently and has a valid point.
- **User-Challenge** — the evidence says the user's stated direction should change
  (e.g. the mandated look fails the register, or a requested pattern is an anti-cliche).
  **NEVER auto-decide.** Surface with: what the user said / what the evidence shows /
  why / what we might be missing / the cost if the user was right and we changed it. The
  user's original direction is the default; the router must make the case for change, not
  the reverse.

Exception: if a machine gate proves the user's direction is a hard a11y/contrast FAIL
(not a preference), frame the User-Challenge with appropriate urgency — but the user
still decides.

---

## 3. The auto-decide principle list

When auto-deciding a Mechanical or Taste choice, apply these in order, adapted from the
`gstack/autoplan` 6 principles for the design domain:

1. **Honor the contract + register.** The grounded token contract and the project
   register win over any generic default. Never homogenize.
2. **Machine-certain over subjective.** A Layer-1 gate result outranks a lens opinion.
3. **Distinctive over generic.** When two options are otherwise equal, pick the one that
   is derived from the subject (passes swap/squint/signature/token), not the AI-default
   cluster. But never sacrifice a machine gate for boldness.
4. **Smallest correct change.** For fixes, the minimal edit that clears the specific
   finding beats a rewrite. Target only the violation.
5. **Completeness within scope.** Cover the states/viewports/modes the surface needs;
   do not ship the happy path only. Out-of-scope work is flagged, not silently expanded.
6. **Bias to render-and-show.** When a taste call is genuinely a coin-flip, render both
   and let the owner pick at the gate rather than deliberate. Quality is owner-judged.

---

## 4. The Decision Audit Trail

Keep a short running log — one line per non-trivial decision — so the owner can see (and
reverse) what was auto-decided. The FIRST line records which involvement mode ran
(and why, when the router had to ask):

```
- [Mode] ownerInvolvement=hands-on (profile). Checkpoints: ground-confirm, direction pick, bar-check.
- [Mechanical] Ran Layer-1 on all 3 candidates; C2 failed dark-mode contrast -> eliminated.
- [Checkpoint] Ground-confirm: owner corrected the register emphasis ("calm" over "premium") -> re-grounded.
- [Taste] Favored direction "Ledger" over "Flight Deck" (denser, fits the register). RECOMMEND, owner confirm at gate.
- [User-Challenge] Brief asked for a purple->pink hero gradient; that is the AI-default cluster + fails the register. Surfaced; awaiting owner.
```

Log durable choices (direction, scope, tool/pattern, reversals) and every hands-on
checkpoint answer, not turn-level trivia. Carry the losing tournament candidates'
best ideas here too.

---

## 5. The owner approval gates (per involvement mode)

How many owner gates run is set by the profile's `ownerInvolvement` (resolved by the
router at Phase 0; unset → the router asks ONE question at run start and offers to
record the answer):

- **`autonomous` (the default — the unchanged classic contract):** exactly ONE owner
  approval gate, at the end, before any work lands on real surfaces. Never nag an
  autonomous owner mid-loop.
- **`hands-on`:** the SAME final gate, plus cheap early checkpoints placed before the
  expensive stages — ground-confirm (register + reference sources + constraints),
<!-- FULL-ONLY-START -->
  the direction pick on 2-3 throwaway `design-direction` mockups (mandatory before
  any production tournament unless a look is mandated),
<!-- FULL-ONLY-END -->
  and the post-council bar-check ("does ANY finalist reach your bar?" — before the
  fix loop). Checkpoint answers are owner decisions: log each in the audit trail.
<!-- LITE-ONLY: (The throwaway-mockup direction-pick checkpoint ships in the full edition; this edition's hands-on mode runs the ground-confirm and bar-check checkpoints.) -->

Whatever the mode, no work lands on real surfaces before the FINAL gate. At that
gate present:

- the rendered result (the PNG the owner can actually see — `design-render` does the
  showing; the owner cannot read HTML / `file://` from chat),
- the merged, severity-ranked evaluator findings + the honest banner,
- the Decision Audit Trail (Mechanical decisions as a summary; every Taste and
  User-Challenge decision explicit, with its recommendation),
- any "needs human review" items if the loop hit its 3-iteration cap.

Do not land changes on real surfaces before this gate. For REVIEW/EVAL there is no
landing step — the gate is simply the report. For destructive or one-way actions,
require an explicit typed confirmation; never proceed on a vague reply.
