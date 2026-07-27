---
name: design-typography
description: >-
  Type-system craft for web UI: choose and pair typefaces, build a fluid
  two-anchor type scale (clamp() that keeps rem for zoom), set measure/leading,
  fix straight quotes and hyphen-dashes, use tabular figures for data, and
  eliminate font CLS via self-hosted WOFF2 + metric-matched fallbacks. Use
  whenever the user works on typography, fonts, font pairing, a type scale or
  ramp, fluid/responsive type, font sizes, line-height/leading, line length or
  measure, letter-spacing/tracking, headings vs body, web-font loading, FOUT/
  FOIT/CLS or layout shift from fonts, @font-face, font-display, preload,
  tabular vs proportional numbers, or smart quotes and em/en dashes — even when
  not explicitly named. For palette/contrast use design-color; for the token
  contract use design-tokens; routing is owned by the design skill.
user-invocable: true
shell: bash
---

# design-typography

!`node "${CLAUDE_PLUGIN_ROOT}/scripts/read-lessons.mjs" design-typography 2>/dev/null`

Make type the strongest part of the interface: distinctive, readable, fluid, and
shift-free. This is a **taste skill with a measurable floor** — the scale math,
the typographic numerics, and the CLS recipe are deterministic and verifiable; the
*choice* of typeface and the *pairing* are judged qualitatively against the active
project register. Do both: pass the machine checks AND beat the generic default.

## Seams (do not duplicate)
- **design-tokens** is the single source of truth. Type tokens (fontFamily,
  fontSize, fontWeight, lineHeight, letterSpacing) live there; this skill produces
  scale + family + loading values that get written INTO tokens, never a parallel set.
- **design-color** owns palette/contrast; **design-typography** owns the
  WCAG 1.4.4 *zoomability* check on every type step (different concern).
- **design-generate** consumes these tokens; **design-evaluate** Layer-1 hard-gates
  the numerics below (machine) and Layer-2 advises on craft (lens). **design-council**
  judges pairings in the tournament.
- The per-project **register differs** — never homogenize. Read the active profile
  (`${CLAUDE_PLUGIN_ROOT}/../profiles/<project>.json` and its DESIGN doc) for the
  brand voice before choosing type. E.g. a regulated trust portal = serious-trust
  (restrained grotesque, no character display faces); a warm consumer app =
  warm-premium-fun (rounded/humanist with delight); an analyst data product =
  analyst-terminal (a real mono for data, dense). The same
  craft canon applies; the typeface personality is register-specific.

## The process (taste — run it every time, do not skip the critique)
Typography fails by defaulting to the safe cluster (Inter everywhere, 16px/1.5,
one weight, system-emoji-grade quotes). Beat that with a loop, not a guess.

1. **Brainstorm (3+ directions).** From the register + content model, propose at
   least three *distinct* type directions, each as: display family + body family +
   (optional mono) + the contrast rationale. Vary the form-model (e.g. a
   high-contrast serif display over a neutral grotesque; a single humanist
   superfamily across weights; a geometric display over a workhorse text face).
   Name the mood each evokes. See `references/pairing.md`.
2. **Critique vs the generic default.** For each direction, state plainly: *how is
   this different from Inter/Roboto/system-default for this brief, and is the
   difference earned by the content?* Kill any direction whose only argument is "it's
   modern/clean." Distinctive ≠ wrong; default ≠ safe. Pick or combine the survivors.
3. **Build deterministically.** Generate the fluid scale, the loading CSS, and the
   numeric defaults with the math below — no eyeballed clamps, no guessed
   size-adjust. Write values into the design-tokens contract.
4. **Critique again (against itself, rendered).** After render, check measure,
   leading, real quotes/dashes, tabular figures on data, weight contrast between
   display and body, and that no step broke 200% zoom. Fix the smallest thing.
   If a pairing reads generic or muddy at real sizes, return to step 1.

## Scale: fluid two-anchor, rem kept in the clamp (DETERMINISTIC)
Use one body anchor that drives everything (scale steps, leading, measure, fallback
metrics). Default: **step-0 = 18px→20px**, ratio **1.2→1.25** (minor third on small
screens widening to major third on large), anchored at **320px→1240px**.

Generate every step with the ported Utopia algorithm — run the script, do not write
clamps by hand:

```
node ${CLAUDE_PLUGIN_ROOT}/skills/design-typography/scripts/type-scale.mjs \
  --min-width 320 --max-width 1240 --min-size 18 --max-size 20 \
  --min-scale 1.2 --max-scale 1.25 --positive 5 --negative 2
```

Hard rules (enforced by the script and by design-evaluate):
- **Keep rem in the clamp.** Emit `clamp({min/16}rem, {intersection}rem + {slope}vw, {max/16}rem)`,
  never px-only — px-only clamps break user zoom. (`viewport`→vw, `container`→cqi, `viewport`-inline→vi.)
- **WCAG 1.4.4 gate.** Every step is run through `checkWCAG`; a step that cannot
  reach 200% zoom across the viewport range is REJECTED (or surfaced with the failing
  range). Never ship a non-zoomable step silently.
- **Steps ≥ ~25% apart** so the hierarchy is legible (design-evaluate asserts this).

Full algorithm, the rem invariant, and the exact regression vectors (e.g.
`calculateClamp(16,32,320,1240) === 'clamp(1rem, 0.6522rem + 1.7391vw, 2rem)'`) are in
`references/scale.md`.

## Numerics: the machine-checkable craft floor (DETERMINISTIC)
These are linted by `design-evaluate` Layer-1 and re-checkable here via
`scripts/lint-typography.mjs`. Translated from Butterick's Practical Typography —
treat as value ranges, not vibes:

- **Measure 45–90 characters** (target ~66). Set `max-width: 65ch` on prose
  containers. FAIL if rendered line > 90ch or < 45ch.
- **Leading (line-height) 1.2–1.45 unitless for body.** Display steps (≥ step 2) may
  go tighter (1.0–1.15). FAIL body leading outside [1.2, 1.45].
- **Body size 15–25px** at the relevant anchor (step-0 ≥ 16px recommended).
- **Real quotes/dashes.** Curly `’ “ ”`, apostrophe `’` (not `'`); en `–` for
  ranges; FAIL straight `'` `"` used as quotes. Dash hygiene fixes a dash that is
  already there — it never ADDS an em dash to generated copy, where the em dash is a
  registered AI-voice tell the owner banned (`ai-em-dash-copy`; see
  `references/numerics.md`, the exception under the punctuation table).
- **No double spaces** / no runs of whitespace between sentences.
- **Caps need tracking.** All-caps / small-caps runs carry letter-spacing
  **0.05em–0.12em** and stay under one line.
- **Emphasis discipline.** No underline except `<a>`; never bold+italic on the same
  run.
- **Tabular figures for data.** Any column of numbers (tables, prices, metrics,
  timers) uses `font-variant-numeric: tabular-nums` (or a tabular face) so digits
  align; proportional figures for prose. Critical for analyst-terminal-style data UIs.

Rule-by-rule detail, the regex substitutions, and the structured-report shape are in
`references/numerics.md`.

## Pairing: by form-contrast within one mood (TASTE — advisory)
- **Cap at 2 families** (body + display); a 3rd only for **mono/code**. One strong
  system stack is a legitimate, CLS-cheap choice — do not reflexively shun system
  fonts.
- Pair by **contrast inside a coherent mood**: a high-contrast display/serif against
  a neutral workhorse sans, OR a single superfamily across weights. The failure mode
  is **two families that are too similar** (same classification, similar contrast and
  x-height) — that reads as a mistake, not a choice.
- Use **open-license (OFL/Google) fonts** for anything self-hosted; avoid commercial
  picks with licensing friction. The pairing heuristic, a curated OFL table with
  classification/contrast/x-height/mood, and superfamily options are in
  `references/pairing.md`.

## Loading: self-hosted WOFF2 + metric-matched fallback ⇒ CLS ≈ 0 (DETERMINISTIC)
The biggest typography bug in shipped UI is layout shift when the web font swaps.
Kill it:

- **WOFF2 only, self-hosted, subset** to used glyphs/weights.
- **Preload the critical face:** `<link rel="preload" as="font" type="font/woff2"
  crossorigin href="…">` — `crossorigin` is required even when self-hosting.
- **`font-display: swap`** for brand-critical text; `fallback`/`optional` when
  minimizing shift matters more than showing the brand face.
- **Metric-matched fallback `@font-face`** from a `local()` system font so the
  fallback occupies the web font's box (size-adjust + ascent/descent/line-gap
  overrides). Compute the overrides from real metrics — never hardcode
  `size-adjust: 100%`. Generate with:

```
node ${CLAUDE_PLUGIN_ROOT}/skills/design-typography/scripts/font-fallback.mjs --font "Inter" --fallback Arial
```

Then the stack is `['Inter', 'Inter-fallback', <system stack>]`. The four-descriptor
formula, the `@capsizecss/metrics` / fallback-dataset source, and a worked example
are in `references/loading.md`.

## Output of this skill
1. Type values written into the **design-tokens** contract (scale steps as custom
   props `--step--2 … --step-5`, families, weights, leading, letter-spacing).
2. A `typography.css` fragment: the fluid scale custom props + `@font-face` web +
   `@font-face` metric-matched fallback + the preload `<link>` tags.
3. A lint report (structured findings keyed to the numeric rules + any WCAG-1.4.4
   step violations) for design-evaluate to fold in.

## References
- `references/scale.md` — fluid two-anchor algorithm, rem-in-clamp invariant, the
  WCAG 1.4.4 zoom check, regression vectors.
- `references/numerics.md` — measure/leading/size/quotes/dashes/caps/tabular rules,
  regex substitutions, structured-report shape.
- `references/pairing.md` — pair-by-contrast heuristic, curated OFL pairing table,
  superfamily + system-stack options, register notes.
- `references/loading.md` — WOFF2/self-host/preload/font-display + the four-descriptor
  fallback formula and worked example.

## Scripts
- `scripts/type-scale.mjs` — generate the fluid scale (rem-kept clamps) + run the
  WCAG zoom gate per step. (Relocated in by the orchestrator.)
- `scripts/lint-typography.mjs` — value-range craft linter (measure/leading/quotes/
  dashes/caps/tabular).
- `scripts/font-fallback.mjs` — emit the metric-matched fallback `@font-face`.
