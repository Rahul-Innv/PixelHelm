---
name: design-dataviz
description: >-
  Data-visualization and dense-UI craft for data products: gauges, charts,
  sparklines, KPI tiles, numeric tables and master/detail screens that read like
  Bloomberg-crossed-with-Wikipedia, not a generic dashboard. Use whenever the
  user works on a chart, graph, plot, gauge, sparkline, KPI / metric tile,
  scorecard, data table, grid, leaderboard, heatmap, time series, trend line,
  dashboard, analytics or reporting screen, a dense / data-heavy / information-
  dense / terminal / "analyst" UI, fixed vs auto axis, y-axis baseline, axis
  honesty / misleading chart, confidence / uncertainty / error bars / margin-of-
  error / "how sure are we", encoding a value as opacity, color scales /
  sequential / diverging / categorical palettes for data, sorting & aligning
  numbers, or making numbers / columns line up -- even when not named. For the
  fluid type scale use design-typography; for the palette + AA contrast use
  design-color; for the token contract use design-tokens; routing is owned by the
  design skill.
user-invocable: true
shell: bash
---

# design-dataviz

!`node "${CLAUDE_PLUGIN_ROOT}/scripts/read-lessons.mjs" design-dataviz 2>/dev/null`

Make the DATA the interface. On a data product the chart, the number, and the
table ARE the design — chrome recedes so the signal reads. The target is
**Bloomberg crossed with Wikipedia**: ruthless density and a numeric rail you can
scan in one fixation (Bloomberg), wrapped in calm, neutral, trustworthy typographic
structure (Wikipedia). Not a decorated dashboard; an instrument.

This is a **subjective taste skill with a measurable floor**. Some rules are
deterministic and verifiable (axis honesty, tabular figures, alignment, the color
budget); the *composition* — what to show, what to suppress, what density feels
authoritative vs cramped — is judged qualitatively against the active project
register. Do both: pass the floor AND beat the generic-dashboard default.

## Seams (do not duplicate)

- **design-tokens is the single source of truth.** Chart colors, the data color
  scale, axis/grid/ink values, density spacing steps — all live as semantic tokens
  in the project's token module. Never hand a chart a raw hex; bind to a token role
  (`--data-1`, `--data-grid`, `--data-ink-muted`). New data-scale roles get added to
  design-tokens, not minted inline.
- **design-color** owns perceptual generation + AA of the palette; this skill owns
  *how color is SPENT on the data channel* (the budget, sequential vs diverging vs
  categorical, colorblind-safety). **design-typography** owns the type scale and the
  `tabular-nums` rule; this skill *requires* tabular figures on every numeric rail
  and consumes the scale.
- **design-generate** consumes these decisions; **design-evaluate** Layer-1
  hard-gates the deterministic floor (axis honesty, tabular-nums on dynamic numbers,
  contrast of the data ink) and Layer-2 advises on density/composition craft.
  **design-council** judges the dataviz direction in the tournament.
- The per-project **REGISTER is a hard input — never homogenize.** An analyst
  data product = analyst-terminal (max density, mono numerics, this skill's home
  register); a regulated trust portal = serious-trust (data is calm and exact, never
  flashy); a warm consumer app =
  warm-premium-fun (a metric can have a little delight, still honest). Read the
  active profile (`${CLAUDE_PLUGIN_ROOT}/profiles/<project>.json` or the path the
  router passes) and judge density/restraint AGAINST that register, not a global ideal.

## The process (taste — run it every time; do not skip the critique)

Dataviz fails by defaulting to the generic-dashboard cluster: three rounded "metric
cards" with a big colored number and a tiny up-arrow, a rainbow donut, a gradient
area chart, color sprayed everywhere for decoration, proportional digits that jitter
as they update, a y-axis that starts at a flattering non-zero baseline. Beat that
with a loop, not a guess.

1. **Brainstorm (3+ encodings).** For the actual question the user is answering
   ("is this up or down", "which segment is biggest", "is x within tolerance",
   "how do these 200 rows compare"), propose at least three *distinct* ways to
   encode it — vary the chart form AND the density. E.g. for a trend: a full chart
   vs an inline sparkline-in-a-table-cell vs a single delta number with direction.
   Pick the encoding by the question and the data shape, never by what looks
   impressive. See `references/canon.md` ("choose the encoding").
2. **Critique vs the generic dashboard.** For each candidate, state plainly: *how is
   this different from the default metric-card / rainbow-donut / gradient-area
   dashboard, and is the difference earned by the data?* Kill any candidate whose
   only argument is "it looks like a dashboard." Check it against the anti-slop
   tell-list in `references/canon.md`. Distinctive density ≠ cramped; calm ≠ generic.
3. **Build to the floor (deterministic).** Apply the verifiable rules below —
   fixed-axis honesty, tabular numeric rails, the color budget, confidence-by-opacity.
   Bind every value to a token. No raw hex, no eyeballed axis, no rainbow.
4. **Critique again (rendered, at real density and real data).** Render with the
   REAL row counts and real numbers (never lorem / never 5 fake rows — density and
   length problems only show at scale). Squint: does the signal still read? Can you
   align and scan the numbers in one pass? Is color carrying meaning or decoration?
   Does any axis mislead? Fix the smallest thing; if it reads generic, return to 1.

## The deterministic floor (verifiable via design-evaluate — the contrast items hard-gate on Layer-1; the axis/encoding items are Layer-2 checkable findings)

These are not vibes — they are checkable and several are wrong often enough to be
worth a hard gate. Full rationale + worked examples in `references/floor.md`.

- **Axis honesty — fixed, zero-based, declared.**
  - **Bar / area / column charts MUST baseline at zero.** A non-zero baseline on a
    bar exaggerates differences and is the single most common honest-chart violation.
    FAIL a truncated bar baseline.
  - **Line charts MAY use a non-zero y-range** (trend, not magnitude) but MUST then
    label the range and never imply zero. Annotate the truncation.
  - **Fixed axes across small multiples / re-renders / live updates.** Comparable
    charts share one scale; an axis that auto-fits per panel makes incomparable things
    look comparable. Lock the domain.
  - **Never a dual y-axis** to manufacture a correlation. Use two aligned panels.
- **Tabular numeric rails.** Every column or live-updating field of numbers uses
  `font-variant-numeric: tabular-nums` (or a tabular/mono face) so digits occupy
  equal width and align; **right-align numbers**, decimal-align money; left-align
  text. Proportional figures only in prose. This is the Bloomberg rail — without it
  the numbers jitter and you cannot scan a column. (design-typography owns the rule;
  this skill requires it on EVERY numeric rail.)
- **The color budget — color is the data channel, reserved.** Grayscale/ink carries
  structure (grid, axes, labels, borders, chrome); **saturated color is spent ONLY
  on data marks that carry meaning**, and on as few categories as the eye can hold.
  - **≤ ~6 categorical hues** (beyond that, the eye can't bind color→series — switch
    to direct labels, small multiples, or highlight-one-gray-the-rest).
  - **Sequential** scale for ordered magnitude (light→dark of one hue), **diverging**
    for a meaningful midpoint (two hues from a neutral center), **categorical** for
    nominal series — never a rainbow as a quantitative scale (rainbow is perceptually
    non-uniform and reads as decoration). See `references/color-for-data.md`.
  - **Colorblind-safe:** never encode meaning by red/green hue alone; pair hue with
    shape/position/label or pick a CVD-safe ramp. Verify against the project palette
    in design-color, not by eye.
  - Decoration color (a gradient fill "because it looks nice", a colored card
    background behind a KPI) is a FAIL — it steals the channel the data needs.
- **Confidence / uncertainty is ENCODED, not omitted, via opacity — not noise.**
  When a value has uncertainty (estimate, forecast, low sample, stale), show it:
  reduce the mark's **opacity** (or use a hatch/dashed stroke for forecast vs actual),
  add an error band / CI interval, or a small explicit confidence label. **Opacity is
  the cheap, honest channel** (it composites, it's a cheap render property, and lower
  opacity *reads as* "less certain"). Do NOT add jitter, blur, extra colors, or
  wiggle to "show uncertainty" — that adds noise, not information. Never silently drop
  the uncertain data or present an estimate as a hard fact. See `references/uncertainty.md`.

## The taste layer (advisory — judged against the register)

The floor stops a chart from lying; it does not make it *read as decided*. Apply the
density + hierarchy craft (detail in `references/canon.md`):

- **Density is the point — earn it, don't fear it.** A data product that wastes the
  viewport on padding and one number per card is failing its user. Pack the rail;
  use small multiples; put a sparkline IN the table cell. Density comes from tight,
  *consistent* spacing (the design-typography/spacing scale, not random tightening),
  proximity grouping (more space between groups than within), and suppressing chrome
  — "whitespace and rule-lines over heavy borders." Cramped = inconsistent spacing;
  dense = rhythmic spacing. Know the difference.
- **Hierarchy by the three levers, never size alone.** Weight + color + position do
  more hierarchy work than size on a dense screen. The hero number is the value
  (heaviest, ink-strongest); its label is secondary (lighter/muted); its delta/meta
  is tertiary. One focal point per view (60/30/10 — the eye lands on the answer first).
- **Master/detail for >~1 screen of data.** A scannable list/table (the master) +
  a focused detail pane, not one giant unbrowsable grid. Keep selection state and
  the numeric rail aligned across master and detail.
- **Chrome recedes; ink is the data.** Gridlines are faint, axes are quiet, the
  number is loud. Borders whisper. Sort by default into a meaningful order (rank,
  time, magnitude) — an unsorted data table makes the user do the work the UI should.

After building, run the **distinctiveness gate** (squint / swap / signature / token,
see `references/canon.md`): squint — does the signal survive blur? swap — would this
chart be at home in any generic admin template (bad) or is it specific to this data
(good)? signature — is there one intentional, register-true move? token — is every
value a token, zero raw hex?

## Output of this skill

1. The chosen encoding(s) per question, with the brainstorm/critique recorded (why
   this form, why not the generic default).
2. Data-channel decisions written INTO design-tokens: the categorical/sequential/
   diverging data-scale roles (`--data-1..n`, `--data-seq-*`), `--data-grid`,
   `--data-axis`, `--data-ink`, density spacing steps — AA-checked via design-color.
3. The chart/table/tile markup bound to those tokens, with: zero-based bars,
   declared/locked axes, `tabular-nums` right-aligned numeric rails, opacity-encoded
   uncertainty, ≤6 hues.
4. A short floor report (axis honesty, tabular-nums coverage, color budget, contrast
   of data ink) keyed to the rules above for design-evaluate to fold in.

## References

- `references/canon.md` — the Bloomberg-x-Wikipedia thesis, the generic-dashboard
  anti-slop tell-list, choosing the encoding by question + data shape, the density vs
  cramped distinction, master/detail, and the squint/swap/signature/token gate.
- `references/floor.md` — the deterministic rules with rationale + worked
  before/after: axis honesty (zero-baseline, fixed domains, no dual-axis), tabular
  numeric rails + alignment, contrast of data ink.
- `references/color-for-data.md` — color reserved for the data channel: the budget,
  sequential/diverging/categorical selection, colorblind-safety, the token roles to
  add, and why rainbow-as-quantitative is banned.
- `references/uncertainty.md` — encoding confidence/uncertainty via opacity (and
  bands/dashes/labels), why opacity not noise, and the "never drop, never overstate"
  rule.
