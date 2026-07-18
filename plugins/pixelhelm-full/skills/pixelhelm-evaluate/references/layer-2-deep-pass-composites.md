# Layer-2 — deep-pass composites on an AUDIT (the eval-side mirror)

> **This is use-case #2 of the STORM integration: the same deep-pass bench, on the EVALUATION side.**
> The council (`pixelhelm-judge`) *judges a tournament*; `pixelhelm-evaluate` Layer-2 *audits one built UI*.
> Both draw the extra critique coverage from ONE shared source of truth — do not re-define the
> composites here. Canonical definitions + trigger matrix + per-register weights + the data-viz canon:
>
> - `${CLAUDE_PLUGIN_ROOT}/skills/pixelhelm-judge/references/deep-pass-composites.md` (C1–C8, P56, P45, P25, the frame, the aggregation contract)
> - `${CLAUDE_PLUGIN_ROOT}/skills/pixelhelm-judge/references/dataviz-canon.md` (Tufte / Cleveland-McGill / Ware — grounds C1/C2/C7)
>
> Derived by the STORM perspective-discovery pass and validated by a blind oracle re-run (the discovery archive lives in the owner's dev workspace). This file states ONLY what is DIFFERENT on the audit side: seating, severity mapping, the audit-mode aggregation analog, the Layer-1 boundary, and the register-fit median gate.

## Two tiers, on an audit

- **FAST audit (default)** — the 7-phase sweep + the per-lens Decision Criteria in `layer-2-lens-audit.md`.
  Enough for most surfaces.
- **DEEP audit** — the fast sweep **plus the composite lenses the surface's trigger artifact earns**
  (below). Run it on a redesign that will ship, a high-stakes surface, or any surface carrying a trigger
  artifact. **Cap ≈ 12–13 model-judged lenses; never seat all at once.** Every composite is
  **register-subordinate** — a constraint, never the register.

## Seating (identical trigger matrix to the council)

| Trigger artifact on the audited surface | Seat |
|---|---|
| a chart / graph / any quantitative encoding | **C1** (+ **C7** if a KPI dashboard) |
| a dense data table | **C2** |
| a custom composite widget (menu/combobox/tabs/tree/carousel) or hidden-scroll overflow | **C4** |
| an auth / role / permission / sensitive-action / consent surface | **C5** |
| copy that can invert meaning, or AI-extracted / derived text | **C6** |
| a consumer-facing surface where a NON-EXPERT reads/enters consequential data (money, health, deals, legal, forms) | **C8** |
| **every deep audit, always** | **P56**, **P45**, **P25** |

(First-run/empty-state coverage is SETTLED as folded checklist lines inside the Spool +
Compliance-honesty lenses — see the council's `lenses.md` §4/§5 — not a composite seat.)

Per project (the usual seating, e.g.): **a trust portal** → C5 · C6 · C8 · P56 · **an analyst tool** → C1 · C2 · C4 · C7 · P56 ·
**a warm consumer app** → C8 · P56. (Read the composite's full "judges-for" list + grounding from the council file.)

## Composite finding → the 4-rung severity matrix

A composite is a Layer-2 lens: its findings are **advisory**, severity-triaged onto the canonical 4 rungs
(`layer-2-lens-audit.md`), and run through the mandatory false-positive filter before emitting. Guidance:

- **[Blocker]** — a composite finding that makes the surface **dishonest or broken**: a chart whose
  encoding lies (C1 truncated hero bar / pie-for-precise-comparison / dual-axis correlation theater /
  undisclosed % vs pp); an AI-extracted value shown as verified fact (C6); a sensitive/irreversible
  action with no confirmation-or-recovery (C5); an **optimistic lie** (P25); a load-bearing value that
  **clips/ellipsizes** under real-extreme content with no recovery (P56, only when a real re-render
  proved it — see below). Register-fit below the incumbent on a redesign stays **[Blocker]** (the gate).
- **[High-Priority]** — a real honesty/operability gap that still functions: a weak-channel encoding for
  a secondary quantity (C1); a table with no visible/persistent sort state or ragged numeric columns
  (C2); a custom widget missing part of its APG keyboard contract (C4); five co-equal KPIs, no focal
  number (C7); a hidden-scroll region with no overflow signifier (C4).
- **[Medium]** / **Nit** — precision/uncertainty polish (C1 sig-figs, missing ± on an estimate), a
  provenance label that could be firmer (P45), minor state-copy nits.

## The audit-mode aggregation analog (what the contract becomes with no winner)

An audit emits severity-triaged findings, not a ranked winner — so the council's "gate-then-rank +
constraints-excluded-from-the-mean" contract translates to these invariants:

1. **Machine-certain a11y stays on LAYER-1 — never a Layer-2 composite.** Contrast / computed-AA (both
   themes) / focus-trap / target-size / states-present / reflow are `layer-1-gates.md` G1–G8 (PASS/FAIL,
   no model). The composites are only the **model-judged residue** (an encoding's honesty, a widget's
   keyboard contract, whether AA reads *designed-in*). A composite NEVER re-litigates or overrides a
   Layer-1 result — a Layer-1 FAIL short-circuits before Layer-2 runs at all (the seam rule).
2. **Register-fit is the gate; composites are constraints under it.** A composite's *declutter / restrain
   / tighten* finding is a CONSTRAINT, never a mandate to strip the register's warmth/character/color. On
   a redesign audit, a register-fit call BELOW the incumbent is a **[Blocker]** that a composite win can
   never buy back (the L-012 invariant, eval-side).
3. **count ≠ severity.** A concern surfaced by several composites is better *coverage*, not an
   auto-higher rung. Dedupe by theme (as the 7-phase sweep already does); the merged finding takes the
   highest single justified severity, not a sum.
4. **P56 ABSTAINS without a real-container re-render.** If the audit only has the flattering render, P56
   must DEMAND a container-width re-render with real-extreme content (longest string / max items /
   biggest number) or **abstain** — it must never rubber-stamp a value that only fits the demo string.
   The reusable extreme-content harness lives in `pixelhelm-render` (`references/recipes.md`, the
   extreme-content target) — run it rather than abstaining when the surface is renderable.
   An abstaining composite is **not a PASS** (silence ≠ absence); report it as "unassessed — needs the
   re-render," not "robust."
   Before judging an extreme render, VERIFY the substitution set swapped every DERIVED string too
   (totals, after-tax/net values, %-offs, deltas — pixelhelm-render's authoring rule). A
   self-contradictory variant (swapped price, unswapped total) is a HARNESS-AUTHORING bug: report it
   as that and demand a corrected re-render; never file the contradiction as a P56 content finding.
5. **P45 provenance labels each composite finding** grounded (cites the canon / a project lesson) vs
   heuristic — but has **no authority over the register-fit gate** (never discount a register call).

## The Register-fit gate on an audit — median + mode-fair (H1 + H2)

The Register-fit lens in `layer-2-lens-audit.md` is the eval-side gate. On a **redesign** audit where the
register-fit call is decisive (it produces a [Blocker] that unseats the shipped design), harden it the
same way the council gate was hardened (global KB **L-028**):

- **H1 — corroborate a decisive register-fit [Blocker] with a MULTI-JUROR MEDIAN**, not one read. Run the
  register-fit judgment as an odd panel (N=5, min 3) of independent jurors on the same renders; the gate
  value is the **median**. Only issue the register-fit [Blocker] (redesign-is-colder-than-incumbent) when
  the panel is a **non-overlapping supermajority** — an overlapping/coin-flip panel is NOT confident
  enough to block the ship on taste. (The other Layer-2 lenses stay single-pass — they're advisory and
  severity-filtered; their noise doesn't gate the ship.) *Why: a single-juror gate flipped on a blind
  re-run and would have blessed an owner-rejected cold variant — `TASK1-oracle-validation-findings.md`.*
- **H2 — judge register-fit on MODE-FAIR renders.** Audit the built UI in the SAME color mode(s) the
  register names (ideally both themes); never score a register's mode clause (e.g. "dark-first") off a
  screenshot whose mode is a `render.mjs` capture artifact (LESSON 3.6). This is also a Layer-1 hygiene
  win: the both-theme axe sweep already renders both modes — reuse those renders for the register-fit read.

## Honest open items (owner decides — same as the council)

- **C1 / C2 / C7 data-viz grounding** rests on `dataviz-canon.md` (C7's Few is heuristic).
- The exact **deep cap (12–13)** + trigger matrix are recommended defaults — tune per owner.

(Previously open, now settled: C3 → folded into Spool + Compliance checklist lines, not a composite;
P56's extreme-content re-render harness → built, validated, and wired as a `pixelhelm-render` recipe/target.)
