# Web craft rulebook — the universal numeric thresholds (Layer-1.5)

A consolidated set of UNIVERSAL, register-agnostic craft thresholds — the mechanical floor that
holds regardless of whether the surface is an app, a data product, or email. It extends the craft
rubric (KB L-014: 4px grid + modular scale) from spacing/radius/type to the full
measure / line-height / tracking / tap-target / states / heading set.

**Scope (SCOPE A, 2026-07-06):** these are the thresholds that apply everywhere. The
MARKETING-SITE-only dimensions — a performance budget (Core Web Vitals: LCP/INP/CLS, hero/JS
weight, font count) and an SEO / share-meta layer (title/desc length, OG image, JSON-LD) — are
PARKED as surface-triggered lenses that fire ONLY when the surface is a real marketing page; they
are not part of this floor and do not run for app/data/email surfaces. (See `POWER-DESIGN-ABSORPTION.md`.)

**How to read the "checked by" column.** Each threshold is one of:
- **Layer-1 machine** — a deterministic check (`static-gates.mjs` source scan, or `render --axe`).
- **axe (render --axe)** — covered by the vendored axe-core arm when renders are captured with `--axe`.
- **Layer-2 lens Q** — a rendered/judgemental check the lens audit asks; advisory, never a hard gate.

Sourcing note: these thresholds restate long-standing craft canon (Bringhurst, Butterick/Practical
Typography, WCAG 2.2, WAI-ARIA APG, Refactoring UI, Utopia, NN/g, Baymard). They are paraphrased
from that canon — the same canon our registry already cites — not lifted from any single rulebook.

## The thresholds

| # | Threshold | Bar | Checked by | Notes |
|---|---|---|---|---|
| 1 | **Contrast (text)** | ≥ 4.5:1 (both modes) | **Layer-1 machine (HARD)** | the existing token-contrast gate; already the floor. AAA 7:1 body is aspirational, not gated. |
| 2 | **Contrast (non-text/graphic)** | ≥ 3:1 | **Layer-1 machine (HARD)** | bar fills, icons, focus rings, borders that carry meaning. |
| 3 | **No opacity-composited text below AA** | a text color at reduced opacity must STILL clear its size's floor | **Layer-1 machine** (source scan) | an inline opacity (`text-<token>/NN`, `rgb(... / NN%)`, alpha `color:`) **escapes the token lockstep** — the lockstep gates full-opacity pairs only. Flagged for judgement (composite the alpha and re-check AA). *Proven on Lentova 2026-07-06: `text-on-surface-variant/70` composited to 3.99:1.* |
| 4 | **Measure (line length)** | 45–75ch (~66 ideal); cap running text ~65–75ch | Layer-2 lens Q | Bringhurst. `max-w-prose`/`ch` cap on prose columns; long measure kills readability. |
| 5 | **Body line-height** | ≥ 1.5 for body; 1.0–1.2 for display | Layer-2 lens Q | WCAG 1.4.12 floor for body; display can tighten. |
| 6 | **Display tracking** | −0.01 to −0.02em on large display; never negative on body | Layer-2 lens Q | tightening buys optical polish on headings only. |
| 7 | **Tap / target size** | ≥ 44×44 CSS px (interactive); ≥ 8px between targets | axe (`target-size`, 24px) + Layer-2 lens Q | axe's `target-size` gates the WCAG 2.2 AA 24px minimum; **44px is the stronger AAA/mobile bar** — advisory above 24. |
| 8 | **Type sizes per view** | ≤ ~4 distinct sizes | Layer-2 lens Q | more than ~4 reads as unsystematic; `static-gates` type-scale ratios inform this. |
| 9 | **5 interactive states + focus ring** | default·hover·active·focus·disabled all visible; focus ring ≥ 3:1, ≥ 2px | axe (focus-order/visible partial) + Layer-2 lens Q | states are KB L-016/L-025; ring contrast is threshold #2's 3:1 applied to the ring. |
| 10 | **Empty / loading / error states** | all three designed, not just the happy path | Layer-2 lens Q | KB L-016; Refactoring UI. |
| 11 | **Exactly one `<h1>`; heading order** | one `<h1>` per page; no skipped levels | **axe (render --axe)** | axe `page-has-heading-one` + `heading-order`. Make it explicit in the audit. |
| 12 | **No justified body text** | body left-aligned (LTR); never `text-align: justify` | **Layer-1 machine** (source scan) | justified text opens rivers on the web (no hyphenation engine); flagged for judgement. |
| 13 | **Landmarks + keyboard-complete** | nav/main/contentinfo present; every control reachable + operable by keyboard | axe (partial) + Layer-2 lens Q | axe covers landmark/role basics; full keyboard walk is a lens Q. |
| 14 | **Motion** | 150–300ms typical; < 3 flashes/s; `prefers-reduced-motion` honored | Layer-2 lens Q (+ render reduced-motion arm) | folds into `design-motion`; reduced-motion is a floor, checked at render. |
| 15 | **OKLCH token ramps (consideration)** | prefer OKLCH for the token color space when minting a ramp | Layer-2 lens Q / `design-tokens` | Tailwind v4 mints OKLCH; perceptually-even ramps. A `design-tokens` upgrade candidate, NOT a gate — never fail a project for using hex tokens. |

## Boundaries (do not over-reach)

- **Only the mechanical, fully-computable thresholds are machine-observed, and not all of those
  hard-gate:** #1/#2 (contrast) HARD-gate; #11 (one-`<h1>` / heading-order) is covered by the axe
  arm; #3 (opacity-composited text) and #12 (justified) are SOFT signals — reported for a re-check,
  never a hard fail. The judgemental ones (measure, tracking, state completeness, fold clarity, F/Z
  scan) stay Layer-2 lens Qs — a false hard-gate is worse than an advisory miss (the static-gates
  philosophy: only CERTAIN checks fail the build).
- **Register still governs.** These are a FLOOR, not a taste target; clearing all 15 does not make a
  design good (the honest banner still applies). Register-fit remains the gate that decides.
- **Never fail a project for an aspirational bar** (AAA 7:1, 44px over 24px, OKLCH) — report it as
  advisory headroom, not a blocker.
