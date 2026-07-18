# Deep-pass composites — the surface-triggered bench

The council runs in **two tiers**. This file defines the DEEP tier. It was derived by a STORM
perspective-discovery pass (7 + 7 expert traditions → de-dup → primary-source verify → 3 adversarial
skeptics; the discovery archive lives in the owner's dev workspace).
The headline finding: a flat 30–56-juror panel is *thoroughness theater* and **maximally dilutes the
register gate**. So the extra coverage lives here as a **small bench seated only by the triggering
artifact** — never all at once.

## The two tiers

- **FAST pass (default) = the 7 seats** — Jobs · Norman · Hall · Spool · Compliance-honesty · Craft ·
  **Register-fit (gate)**, wrapped by the frame (below). Unchanged. This is enough for most surfaces.
- **DEEP pass = the 7 seats + a triggered bench** of composites (this file). **Cap ≈ 12–13 jurors on any
  one surface** — seat a composite ONLY when the surface carries its trigger artifact.
- **Machine floor is NOT a juror.** Contrast / computed-AA (both themes) / focus-trap / target-size /
  states-present / reflow are `design-evaluate` **Layer-1** line items — measured, no model in the loop.
  The council never re-litigates them. Only the *model-judged* residue (a widget's keyboard contract, an
  overflow signifier, whether AA reads *designed-in*) is a juror — and that lives on C4 / Hall, not on a
  new a11y seat.

## When to run the deep pass

A redesign that will ship, a high-stakes surface, or any surface that carries a trigger artifact (a chart,
a dense table, an auth/consent/sensitive-action surface, an AI-extracted number).
Otherwise the fast pass is sufficient — do not seat composites a surface doesn't earn.

## Trigger matrix

| Trigger artifact on the surface | Seat |
|---|---|
| a chart / graph / any quantitative encoding | **C1** (+ **C7** if it's a KPI dashboard) |
| a dense data table | **C2** |
| a custom composite widget (menu, combobox, tabs, tree, carousel) or hidden-scroll overflow | **C4** |
| an auth / role / permission / sensitive-action / consent surface | **C5** |
| user-facing copy that could invert meaning, or AI-extracted / derived text | **C6** |
| a consumer-facing surface where a NON-EXPERT reads/enters consequential data (money, health, deals, legal, forms) | **C8** |
| **every deep pass, always** | **P56**, **P45**, **P25** |

(First-run/empty-state coverage is SETTLED as folded checklist lines inside Spool + Compliance-honesty —
`lenses.md` §4/§5 — not a composite seat.)

Per project (the usual seating, e.g.): **a trust portal** → C5 · C6 · C8 · P56 · **an analyst tool** → C1 · C2 · C4 · C7 · P56 ·
**a warm consumer app** → C8 · P56.

## The frame (preconditions — every pass, fast or deep)

- **P0a Basic-Fact Baseline** — real (not fabricated) data, token-faithful values, all states present,
  correct-container **and MODE-FAIR** screenshots: every candidate incl. the incumbent rendered in the
  SAME color mode(s), ideally both themes (H2). A register mode clause (e.g. "dark-first") is never
  scored off a screenshot whose mode is a `render.mjs` capture artifact (LESSON 3.6). Ground truth the
  jurors build on. *(method invariant + NN/g realistic content; L-004.)*
- **P0b Adversarial Refuter** — breaks consensus, names the silent-killer omission. **Register-subordinate**
  (its "this is bad" is a constraint, never a mandate to strip the register).
- **P0c Register-Fit Gatekeeper [GATE]** *(also counted as the 7th fast-pass seat — the gate and the seat are one lens, not double-counted)* — scores strictly vs the profile's **literal `_register` string**;
  **VETO**; **DISQUALIFY** any candidate scoring below the incumbent on register-fit; **ABSTAIN-BLOCK** if
  the profile carries no `_register` string (never guess a register); **exempt** from the P45 provenance
  discount. Full definition = `lenses.md` §7.
- **P0d Incumbent-Present Precondition** — on a REDESIGN the live design MUST be entered as a labeled
  competitor, rendered to the same matrix. No incumbent → a regression is undetectable → **STOP** and ask.
  *(L-012 fix #1, promoted to a first-class precondition.)*

## The composites

Each is **register-subordinate**: its findings are CONSTRAINTS every candidate must satisfy, never levers
that out-rank the register. Weights are `T/W/A` = trust portal / warm consumer / analyst tool emphasis, 0 (n/a) – 3
(central).

- **C1 — Quantitative Honesty & Encoding** · *T2 W1 A3* · **trigger:** any chart/encoding.
  Judges: chart-type fits the question; the most important quantity rides the most accurately-decoded
  channel (Cleveland-McGill rank); bars start at a **zero baseline** (Tufte lie-factor ≈ 1); no dual-axis
  correlation theater; **% vs percentage-point** labeled; denominator visible; precision honest (no more
  sig-figs than the data supports); uncertainty shown when the value is an estimate; colorblind-safe and
  **not color-alone**; a **text-equivalent** exists.
  Grounds: `references/dataviz-canon.md` (Tufte VDQI Ch.2; Cleveland-McGill JASA 1984; Ware) + WCAG 1.4.1 +
  **L-005**. Tells: a truncated bar y-axis; a pie used for precise comparison; a rate with no base.
- **C2 — Dense-Table Operability & Analyst Efficiency** · *T1 W0 A3* · **trigger:** a dense table.
  Judges: visible + persistent sort/filter/pin state; row density tuned for scanning; expert keyboard
  paths; **tabular figures** so numeric columns align. Grounds: Nielsen H7 (flexibility & efficiency) +
  KLM + WAI-ARIA APG grid/table pattern + dataviz-canon (tabular alignment). Tells: no visible sort state;
  filters that reset on navigation; ragged numeric columns.
- **C3 — First-Run Activation** · **SETTLED (owner, 2026-07-01): NOT a standing composite.** Folded into
  the fast-pass lenses as checklist lines — Spool carries "empty/thin sub-states answer what-is-this /
  what-do-I-do with forward-scent + a populate-threshold" and Compliance-honesty carries "an empty state
  names its SPECIFIC cause (scarcity vs staleness vs not-yet-run)" (`lenses.md` §4/§5). A populated
  surface's empty SUB-states are fully covered by those lines; when the WHOLE surface is a first-run
  screen, Spool judges it as the primary task. Grounds: Nielsen empty-state + Norman.
- **C4 — Composite-Widget & Overflow Operability** · *T2 W1 A3* · **trigger:** a custom composite widget or
  hidden-scroll overflow. Judges: the **APG keyboard contract** for the widget (arrow/Home/End/Esc/type-
  ahead as the pattern specifies); a **signifier** for content hidden behind a scroll. Grounds: WAI-ARIA
  Authoring Practices + Apple HIG. *(Canon-clean.)* Tells: a custom combobox/menu/tabs with no keyboard
  model; a scroll region with no affordance that more exists.
- **C5 — Trust, Sensitive-Action & Auth Legibility** · *T3 W1 A1* · **trigger:** auth / role / sensitive /
  consent surface. Judges: a **graduated-confirmation ladder proportional to the stakes** (a destructive or irreversible or
  legal/financial action is confirmable/recoverable); legible auth & role state; a disclosure at any data
  **egress** (export/share/send); no phishing-residue framing. Grounds: **WCAG 3.3.4** (error prevention:
  legal/financial/data) + Apple HIG + Nielsen H1/H3/H5 + Brignull. *(Canon-clean.)*
- **C6 — Semantic-Honesty Copy & Mental-Model Match** · *T3 W2 A2* · **trigger:** copy that can invert
  meaning, or AI-extracted/derived text. Judges: verbs/framing don't invert meaning (a *protection* isn't
  framed as a *deadline*); an AI-extracted value is **hedged**, never shown as verified fact; labels name
  the user's goal, not the system; and it matches the **platform idiom** (native / web convention, P13). Grounds: Norman (mental models) + **L-017 / L-021** (semantic honesty) +
  **L-004 / L-026** (AI-honesty). *(Canon + project lessons.)*
- **C7 — Dashboard Focal-KPI Hierarchy** · *T1 W1 A3* · **trigger:** a KPI dashboard. Judges: **one**
  dominant number (≈≥2× the rest — no five co-equal KPIs); small multiples share a coherent axis. Grounds:
  dataviz-canon (Tufte small multiples) + Few, *Information Dashboard Design* (**heuristic** — pending
  firmer canon).
- **C8 — Persona Bench (think-aloud consumer read)** · *T2 W3 A1* · **trigger:** a consumer-facing
  surface where a NON-EXPERT reads or enters consequential data (money, health, deals, legal
  acknowledgments, forms). Two DIVERSE persona subagents (careful anxious first-timer + time-pressed
  skimmer) think aloud through the rendered PNGs; BOTH independently flagging the same confusion =
  a HIGH constraint-grade finding, one = advisory. Findings are CONSTRAINTS (excluded from the
  ranking mean, register-subordinate). Grounds: **L-017 (VERIFIED ×2** — two independent convergence
  events where personas surfaced HIGH comprehension bugs a 5-lens council + craft pass both missed). Full seat definition,
  staffing, and honest bounds: `references/persona-bench.md`. Also runs pre-build on
  `design-direction` mockups (cheapest fix point); a mockup pass never exempts the built surface.
- **P56 — Content-Robustness under Real-Extreme Content** · *T3 W3 A3* · **trigger:** always (deep pass).
  Re-render each field at the **longest real string / max item count / biggest number**. Ellipsis or clip
  on a **load-bearing value** = FAIL unless it is both recoverable AND honest. Grounds: **WCAG 1.4.4**
  (resize text) + **1.4.10** (reflow) + NN/g + **L-003 / L-010 / L-022**. **Machine arm:** a real
  container-width re-render with extreme content is REQUIRED — the reusable extreme-content harness lives
  in `design-render` (`references/recipes.md`, the extreme-content target; validated on a 53-char company
  name @1440+820px, where the flattering render showed none of the wrap risk). If no extreme-content
  re-render is available for the surface, P56 must **DEMAND it or ABSTAIN** — it must never rubber-stamp a
  value that only fits the demo string. The substitution set must swap every DERIVED string too (totals,
  after-tax values, %-offs, deltas — recomputed by its author; design-render's rule): a self-contradictory
  extreme render is a harness-authoring bug to fix, never a P56 content finding. *(The strongest-grounded
  of the new lenses; the STORM completeness critic's find.)*
- **P45 — Evidence & Source Provenance** *(meta)* · *T3 W2 A3* · labels each finding **grounded** (cites a
  primary source / project lesson) vs **heuristic** (a plausible-but-unpinned claim), and discounts the
  heuristic ones in the mean. Has **no authority over P0c** — the register gate is never discounted.
  Grounds: Krug / Nielsen (evidence over opinion).
- **P25 — State-Coverage & Honest-State** · *T3 W3 A3* · trigger: always (deep pass). No **optimistic lie**
  (a value shown before it's confirmed; a stale value shown as live); every state (empty/loading/error/
  disabled/success) truthfully rendered; static **perceived-performance** (fonts-in-place, skeleton-not-
  spinner). Grounds: **L-016 / L-025** + NN/g. *(Absorbs the old runtime `performance` dim's static half;
  runtime CWV LCP/INP/CLS stay OUT until a Playwright + device harness exists.)*

## The aggregation contract (machine-enforced — NOT a flat mean)

This is the load-bearing change and the one that stops the deep bench from re-creating the L-012 regression
by construction. It formalizes the recalibration in `references/lenses.md` §7 + `design/references/
gates-and-loop.md`:

1. **Gate, then rank.** Register-fit (P0c) is a **pre-aggregation VETO**, not a vote inside the mean.
   The veto is a **MULTI-JUROR MEDIAN** (H1): staff P0c with an odd panel of **N=5** (min 3)
   independent jurors and take the **median** per candidate. A redesign clears the gate only if its
   median ≥ the incumbent's median **AND** the panels are **non-overlapping** (challenger max ≤
   incumbent min — a confident supermajority). Overlapping panels = a coin-flip → the incumbent wins
   ("no confident change"). A single-juror gate flipped on a blind re-run and would have crowned an
   owner-rejected variant; the median is what makes the veto trustworthy (`perspective-discovery/
   TASK1-oracle-validation-findings.md`).
2. **Constraints are excluded from the ranking mean.** Discipline / craft / honesty / a11y / composite
   findings are CONSTRAINTS every candidate must satisfy — satisfying them is table stakes, not ranking
   score. Only the register (decisive) + conviction axes rank the winner — and **conviction may
   only break ties among candidates already holding register-fit ≥ incumbent; it can never
   compensate for a register deficit** (register is decisive).
3. **Incumbent as competitor** (P0d). The live design is scored on the same scale; a new direction wins
   only if it beats the incumbent overall AND ≥ incumbent on register-fit (the incumbent guard).
4. **Count ≠ weight.** A concern surfaced by many composites is better *coverage*, not a heavier vote.
5. **P0c binds to the literal `_register` string** and is **exempt** from the P45 provenance discount.

## L-012 — non-negotiable

Every composite is **register-subordinate**. A composite's *declutter / restraint / tighten / recede*
finding is a CONSTRAINT, never a mandate to strip the register's warmth / character / color. A colder-but-
more-disciplined direction must **never** out-rank a warm incumbent on register-fit. The bench ADDS coverage
of honesty, data-viz, robustness, and dense-data operability; it does **not** touch the gate.

## Honest open items (owner decides)

- **C1 / C2 / C7 data-viz grounding** now rests on `references/dataviz-canon.md` — confirm it pins the
  Tufte / Cleveland-McGill / Ware rules you want cited (C7's Few is heuristic).
- The exact **deep-pass cap** (12–13) and the trigger matrix above are the recommended defaults — tune per
  owner.

(Previously open, now settled: C3 → folded into Spool + Compliance checklist lines, not a composite;
P56's extreme-content re-render harness → built, validated, and wired as a `design-render` recipe/target.)
