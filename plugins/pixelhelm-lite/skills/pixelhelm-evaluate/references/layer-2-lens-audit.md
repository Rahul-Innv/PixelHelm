# Layer-2 — live-browser lens audit (model judgment, advisory)

> ToC: [Preconditions](#preconditions) · [Live-Environment-First](#live-environment-first) ·
> [The 7-phase sweep](#the-7-phase-sweep) · [Severity matrix](#severity-matrix-4-rung-canonical) ·
> [Per-lens Decision Criteria](#per-lens-decision-criteria) · [Problems over prescriptions](#problems-over-prescriptions)
> · [The mandatory false-positive filter](#the-mandatory-false-positive-filter) · [Approval bar](#approval-bar)

Layer-2 is the taste/UX lens audit. It is **advisory** and runs ONLY after Layer-1 is green. It
DESCRIBES problems; it never prescribes CSS (that is `pixelhelm-repair`). Every finding is labeled
`advisory`.

## Preconditions

- Layer-1 PASSED (`N/N = 100%`). If Layer-1 failed, do NOT run Layer-2 — a model cannot argue past
  a proven machine fail, and a long taste list buries the real Blocker.
- The baseline diff has run (so Regressed items are already top-severity).
- The active project profile is loaded — the REGISTER decides what "good" means here (a
  serious-trust register and a warm-fun register fail different things; see `register-profiles.md`).

## Live-Environment-First

Drive a REAL browser and assess the interactive experience BEFORE static analysis (OneRedOak
`design-review-agent.md` L11-12). Prioritize what the user actually feels over theoretical
perfection. Use the `pixelhelm-render` live backend (Playwright); never pass model-authored JS into
`browser_evaluate`.

## The 7-phase sweep

(OneRedOak design-review-agent, phases adapted.)

1. **Interaction & user flow** — execute the primary flow; test hover/active/disabled; verify
   destructive-action confirmations; assess perceived performance.
2. **Responsiveness** — desktop 1440 / tablet 768 / mobile 375 (screenshot each); no overlap.
   (Hard overflow is already a Layer-1 gate; here judge layout ADAPTATION quality.)
3. **Visual polish** — alignment, spacing rhythm, typographic hierarchy, palette coherence,
   image quality. Apply the craft rubric below.
4. **Accessibility (WCAG 2.1 AA, manual ~70%)** — keyboard nav + Tab order, visible focus on every
   control, Enter/Space activation, semantic HTML, form labels, alt text, meaningful contrast.
   (This covers what axe's ~⅓ misses — the needs-review bucket lands here.)
5. **Robustness** — invalid-input validation, content-overflow stress, loading/empty/error states,
   edge cases.
6. **Code health** — component reuse over duplication, design-token usage (no magic numbers),
   pattern adherence.
7. **Content & console** — read every visible string for TRUTH (does the screen tell one coherent
   story?), grammar, clarity; check the browser console for errors/warnings.

Always review desktop AND mobile, light AND dark (single-viewport review is an anti-pattern).

## Severity matrix (4-rung, canonical)

OneRedOak's 4 rungs are CANONICAL. Map every other taxonomy onto them:

| Rung | Meaning | Maps from |
|---|---|---|
| **[Blocker]** | Reads as generic/broken; fails the approval bar. No focal point, flat hierarchy, monotone layout, timid/competing palette, missing states, structural hacks. | axe critical; gnurio Critical; Regressed (auto); register-fit below the incumbent on a redesign (auto). |
| **[High-Priority]** | Significant craft gap a design lead would call out; still functions. | axe serious; gnurio High. |
| **[Medium-Priority]** | Improvement for follow-up. | axe moderate; gnurio Medium. |
| **Nit** (prefix "Nit:") | Minor aesthetic detail. | axe minor; gnurio Low. |

Wire to gate: **any surviving [Blocker] → not approved.**

## Per-lens Decision Criteria

Each lens emits explicit PASS/FAIL with an Anti-Pattern table (pattern | why | fix-as-decision).
Apply the lenses relevant to the surface; do not force all on a tiny component.

### Hierarchy / focal point (Dammyjay93 + gnurio 01)
- PASS: one clear focal point; hierarchy via the THREE levers (size + weight + color) — never size
  alone; squint test survives (blur and the hierarchy still reads).
- FAIL: flat hierarchy; CTA buried; everything competes for attention.

### Typography (gnurio 02 + Butterick numerics)
- PASS: ≤ ~6 sizes from a ratio scale; measure ~45–90ch; line-height 1.2 display / 1.5 body;
  curly quotes + en/em dashes.
- FAIL: a dozen ad-hoc sizes; lines too long/short; straight quotes.

### Color / palette (gnurio 03/09 + profile)
- PASS: coherent role-mapped palette; ~60/30/10 distribution; one saturated role carries the
  loudest verdict; matches the register; no banned cluster (profile `bannedClusters`).
- FAIL: timid or competing palette; monotone; AI-cyan / AI purple→pink gradient; bootstrap-blue /
  indigo / prominent purple unless specified.

### Register-fit (profile `_register` — FIRST-CLASS, gate)
- PASS: the surface FEELS like the active profile `_register` in its own words —
  warmth/play/color/voice for a warm-fun register; calm authority for serious-trust;
  density-with-precision for analyst-terminal. Judged against `_register`, never a global ideal.
- FAIL ([Blocker] on a redesign): reads colder / greyer / more sterile / less characterful than
  the register asks, OR than the incumbent it replaces — i.e. the diagnosis/declutter was bought at
  the cost of the register. A Layer-2 redesign verdict that scores register-fit BELOW the incumbent
  is a [Blocker], not advisory polish.
- **Harden a DECISIVE register-fit [Blocker] (H1 + H2, global KB L-028).** When the register-fit call
  is what would BLOCK the ship (redesign-is-colder-than-incumbent), corroborate it with a
  **multi-juror MEDIAN** (an odd panel of N=5, min 3, judging the same renders), and only issue the
  [Blocker] on a **non-overlapping supermajority** — an overlapping/coin-flip panel is not confident
  enough to block on taste. Judge on **mode-fair renders** (every candidate incl. the incumbent in the
  same mode[s]; reuse the both-theme axe-sweep renders) — never dock a register's mode clause (e.g.
  "dark-first") off a screenshot whose mode is a `render.mjs` capture artifact (LESSON 3.6). A
  single-juror register-fit gate flipped on a blind re-run and would have blessed an owner-rejected
  cold variant (the oracle-validation archive lives in the owner's dev workspace; the rule is L-028).

### Spacing (gnurio 04)
- PASS: systematic scale, ≥25% jumps; MORE space around groups than within (no ambiguous spacing);
  whitespace over borders.
- FAIL: arbitrary values (13/27/41px); equal spacing everywhere; ambiguous grouping.

### Surface / depth (tokens-and-aa-enforcement + gnurio 08)
- PASS: ONE committed elevation strategy; whisper-quiet steps; dark mode = lightness deltas
  (+5–7%) + 1px border, NO shadow; concentric radius (outer = inner + padding).
- FAIL: decorative shadows on everything; invisible shadows on dark; mixed depth strategies.

### Interaction quality (interfaces.rauno.me — non-greppable)
- PASS: frequent interactions ≤200ms / standard <300ms / overlays 200–500ms; optimistic UI with
  rollback; hover suppressed on touch; theme switch has no transition flash.
- FAIL: sluggish frequent actions; no rollback; hover artifacts on touch.

### States & robustness (gnurio 07 + OneRedOak phase 5)
- PASS: loading / empty / error states designed, not afterthoughts; validation is humane.
- FAIL: missing states; raw error dumps; empty state is a blank box.

### Content coherence (Dammyjay93 step 3)
- PASS: title, body, and metrics belong to ONE product/story.
- FAIL: incoherent strings; placeholder lorem; three products in one screen.


## Problems over prescriptions

Describe the problem and its impact + screenshot evidence; do NOT hand a CSS value. Open with what
works (OneRedOak L68,76).

- Good: "The spacing between the metric cards feels inconsistent with the section gap, so the group
  doesn't read as one unit." 
- Bad: "Change margin to 16px." (prescriptions belong to `pixelhelm-repair`.)

For each surviving finding give THREE things (Dammyjay93 step 5): **what defaulted**, **why it
reads generic / costs the user**, and the **crafted fix as a DECISION** (not a patch).

## The mandatory false-positive filter

Run BEFORE emitting anything (Dammyjay93 design-review L81-93). Drop a candidate finding if it is:

- **Taste, not defect** — "I'd have used a different font/accent/layout." A coherent, well-executed
  choice is not a finding even if you'd choose differently. Distinctive ≠ wrong.
- **A bold choice working as intended** — a saturated palette / dramatic scale matching a stated
  bold intent is a SUCCESS, never auto-flagged. (Protects the maximalist register/engine output.)
- **Out of scope** — outside the scope set in phase 0, or on lines a diff didn't touch.
- **Ratified by the system** — already decided in the token module / DESIGN.md / profile register.
- **A lint/format/compile concern** — owned elsewhere, not a design finding.

If you can't say WHY a finding costs the user or makes the UI read as generated, it's taste — cut
it. Prefer a few high-conviction findings over forty nitpicks.

## Approval bar

Layer-2 does NOT approve because it renders and aligns. Pass requires: a clear focal point, hierarchy
on all three levers, a register-coherent palette with no banned cluster, designed states, and no
surviving Blocker. Layer-2 PASS is still gated behind Layer-1 PASS — and the OVERALL verdict (and the
honest banner) is computed by the SKILL.md Decision Criteria, not by this layer alone.
