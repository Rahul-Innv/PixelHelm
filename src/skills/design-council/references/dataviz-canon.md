# dataviz-canon.md — Primary-source canon for data-visualization honesty & encoding quality

**When to cite this.** Invoke this file whenever a design under review contains a
quantitative graphic — chart, plot, sparkline, gauge, KPI tile, trend line, or a
dense data table that a chart could stand in for. It is the receipt-bearing ground
for three "deep-pass" composite council lenses:

- **C1 — Quantitative-Honesty & Encoding.** Does the graphic tell the truth about
  the numbers, and does it encode the *most important* quantity in the *most
  accurately-decoded* visual channel?
- **C2 — Dense-Table Operability.** When numbers must stay as numbers, is the table
  scannable, aligned, and honest about precision and denominators?
- **C7 — Dashboard Focal-KPI Hierarchy.** Does one figure earn the eye first, and is
  its encoding proportionate to its claim (no gauge theater, no truncated hero bar)?

Every rule below names a specific work + chapter/year so a juror can point to the
source. Where a rule is *general statistical-graphics practice* rather than one
named author's coinage, it is labeled **[general practice]** — do not attribute it
to a single person.

---

## 1. Tufte — Graphical Integrity

**Primary sources.**
- Edward R. Tufte, *The Visual Display of Quantitative Information* (2nd ed., 2001;
  1st ed. 1983), **Chapter 2, "Graphical Integrity."**
- Edward R. Tufte, *Envisioning Information* (1990) — small multiples, layering.
- Edward R. Tufte, *Visual Explanations* (1997) — integrity in causal/quantitative
  claims (e.g. the Challenger and cholera analyses).

**RULE 1.1 — Lie Factor ≈ 1.0.** Tufte, *VDQI* Ch.2 defines
**Lie Factor = (size of effect shown in the graphic) ÷ (size of effect in the
data).** An honest graphic has a Lie Factor of **1.0**; Tufte flags anything
outside roughly **0.95–1.05** as distortion. To apply: pick the quantity that
changes, measure its change in pixels/area on screen, measure its change in the
underlying numbers, and divide. A 2× data change drawn as a 5× visual change is a
Lie Factor of 2.5 — **fail**.

**RULE 1.2 — Bars start at a zero baseline.** For any length-encoded mark (bar,
column, filled area), the value axis **must begin at zero**, because the bar's
*length* is the quantity; truncating the axis multiplies the Lie Factor directly
(a bar that is visually 3× taller for a 1.1× real difference is lying). *VDQI*
Ch.2. **Exception:** position-encoded marks that are *not* length (line charts,
dot plots) may use a non-zero, clearly-labeled range — the eye reads their
*position*, not a filled length — but the truncation must be visible and honest,
never disguised.

**RULE 1.3 — Maximize the data-ink ratio; erase chartjunk.** *VDQI* Ch.4–5.
**Data-ink ratio = ink used to present data ÷ total ink.** Remove non-data ink:
heavy gridlines, 3-D extrusion, drop shadows, decorative fills, redundant
duplicated legends. 3-D bar/pie effects are called out specifically because the
added depth *distorts* the encoded length/area (compounds Rule 1.1).

**RULE 1.4 — Small multiples for comparison.** *Envisioning Information* (1990) and
*VDQI* Ch.4. When the same measure is shown across many categories/time slices,
prefer a grid of **small multiples** sharing one common scale over one crowded
overlay or a series of separately-scaled charts. Shared scale is what makes the
comparison honest (ties to Rule 2.1).

---

## 2. Cleveland & McGill — Elementary Perceptual Tasks (encoding accuracy rank)

**Primary sources.**
- William S. Cleveland & Robert McGill, "Graphical Perception: Theory,
  Experimentation, and Application to the Development of Graphical Methods,"
  **Journal of the American Statistical Association, Vol. 79, No. 387 (1984),
  pp. 531–554.**
- William S. Cleveland, *The Elements of Graphing Data* (1985; rev. 1994).

**RULE 2.1 — Encode the key quantity in the highest-accuracy channel.** Cleveland &
McGill (1984) ranked how *accurately* people decode a quantity from each channel,
most-accurate first:

1. **Position along a common (aligned) scale** — most accurate
2. **Position along non-aligned but identical scales**
3. **Length**
4. **Angle / slope**
5. **Area**
6. **Volume**
7. **Color hue / color saturation / density** — least accurate

To apply: identify the graphic's *most important* quantity and check which channel
carries it. If the headline comparison rides on **angle/area** (pie, donut, gauge
arc) or **color shade** (a bare heatmap value the user must read precisely), it is
encoded in a weak channel — **flag**, and recommend a **bar or dot plot** (position
on a common scale) instead.

**RULE 2.2 — Pie/donut/gauge are weak by construction.** A pie slice encodes value
as **angle + area** (ranks 4–5); a radial gauge encodes it as angle along a
non-common arc. Both are acceptable *only* for a rough part-of-whole gestalt with
few (≤ ~5) segments, and are **not** acceptable when the reader must compare
magnitudes or rank them. For ranking/comparison, position-on-common-scale wins.
This is the Cleveland–McGill result applied, not a style preference.

**RULE 2.3 — Color is for category or coarse magnitude, not for precise reading.**
Because hue/saturation sit at the bottom of the accuracy rank, do not ask a reader
to extract a *precise* number from color alone. Color-encoded magnitude needs a
legend *and* should carry a redundant channel (position/label) for any value that
matters (bridges to §3).

---

## 3. Ware — Perception, Pre-attentive Channels, and Color-Safety

**Primary source.**
- Colin Ware, *Information Visualization: Perception for Design* (Morgan Kaufmann;
  eds. 2004 / 2012 / 4th ed. 2021). Chapters on color and on pre-attentive
  processing.

**RULE 3.1 — Exploit pre-attentive channels for the one thing that matters.** Ware:
certain visual features (hue, orientation, size, motion, position) are processed
**pre-attentively** — spotted in <~250 ms without serial search. Use *one* such
channel to make the single most important mark pop (the focal KPI, the outlier,
the alert row). Overloading many pre-attentive channels at once destroys the pop
and creates noise. (Direct support for **C7**: the focal KPI should win one strong
pre-attentive contrast, not five competing ones.)

**RULE 3.2 — Color must not be the SOLE carrier of meaning.** Ware documents that a
substantial share of the population has color-vision deficiency (CVD), most
commonly red–green. Therefore any meaning conveyed by color **must be redundantly
encoded** by a second channel — shape, label, position, texture, or a direct text
annotation. This is the design-side statement of **WCAG 2.x Success Criterion
1.4.1 "Use of Color" (Level A)**: color is not used as the *only* visual means of
conveying information. Red/green "good/bad" with no icon or label = **fail**.

**RULE 3.3 — Use colorblind-safe, perceptually-ordered scales.** Prefer palettes
built to survive CVD and to be perceptually well-ordered — the **ColorBrewer**
families (Cynthia Brewer / Mark Harrower, colorbrewer2.org) and **viridis**
(Stéfan van der Walt & Nathaniel Smith, 2015) are the canonical CVD-safe,
monotonic-luminance choices; cite them as *reference families*. **Keep the
principle, not the colormap-uniformity math:** the canon rule is "sequential data →
a scale that is ordered and CVD-safe; categorical data → a qualitative CVD-safe
set," **not** a demand for scientific-visualization perceptual-uniformity metrics.
**Anti-pattern:** the rainbow/jet colormap — perceptually non-uniform, introduces
false boundaries, and is not CVD-safe.

---

## 4. Numeric / Statistical Honesty  **[general statistical-graphics practice]**

The rules in this section are **general statistical-graphics and data-journalism
practice**, taught across the literature (Cleveland; Wilkinson, *The Grammar of
Graphics*, 1999/2005; Cairo, *The Truthful Art*, 2016; and standard statistics
style guides). They are **not** the coinage of any single author — cite them as
"general statistical-graphics practice," not as a named work, unless you have a
specific edition in hand.

**RULE 4.1 — No dual-axis charts that manufacture correlation.** Two series plotted
against two independent y-axes let the author *choose* the scales, and thereby
*choose* how tightly the two lines appear to track. This "correlation theater" is a
well-known distortion. **Flag any dual-y-axis chart** whose purpose is to imply two
things move together; prefer indexing both series to a common base (e.g. = 100 at
t₀) on **one** shared axis, small multiples, or an explicit scatter with a stated
correlation.

**RULE 4.2 — Distinguish percent from percentage-point.** A move from 4% to 5% is
**+1 percentage point** *or* **+25 percent** — different claims. The graphic and its
label must state which. Conflating them (labeling a +1pp change as "+25%" beside a
bar, or vice-versa) is a numeric-honesty failure. **[general practice]**

**RULE 4.3 — Denominator transparency.** Any rate, ratio, percentage, or "per X"
must make its **base/denominator visible or one hover/label away** (n = ?, "of
1,204 applications"). A percentage with a hidden or tiny denominator ("100% — of 2
cases") is misleading. For **C2**, dense tables that show rates must carry the count
they were computed from. **[general practice]**

**RULE 4.4 — Precision honesty (significant figures).** Do not render more
significant figures than the data supports. A survey of 30 people is not "63.33%";
it is ~63%. Spurious decimals imply false precision. Round to the resolution the
sample/measurement justifies, and be consistent within a table column. **[general
practice]**

**RULE 4.5 — Show uncertainty when the value is an estimate.** If a number is an
estimate, forecast, sample statistic, or model output, display its uncertainty —
**error bars, a confidence interval, or a ± range** — rather than a bare point that
reads as exact. A projected/forecast segment should be visually distinguished
(dashed, shaded band) from observed data. **[general practice]**

**RULE 4.6 — Every chart has a text-equivalent / data table.** For accessibility
(WCAG 1.1.1 "Non-text Content," Level A) *and* auditability, each chart must have a
machine- and human-readable equivalent: an adjacent/toggleable **data table**, a
descriptive text summary, or accessible markup (e.g. `<table>`, `aria-label`, or a
"View data" affordance). A chart a screen-reader user or an auditor cannot read in
numbers is incomplete. **[general practice + WCAG]**

---

## Chart-honesty checklist (compact — run this on every quantitative graphic)

Each item cites its rule above; a juror can point to the receipt.

- [ ] **Zero baseline for bars/areas** — length-encoded marks start at 0; any
      truncation is on a position (line/dot) chart and is visible & labeled.
      *(Tufte VDQI Ch.2 — R1.2)*
- [ ] **Lie Factor ≈ 1.0** — visual magnitude of the effect matches the data;
      no 3-D extrusion inflating length/area. *(Tufte VDQI Ch.2, Ch.4–5 — R1.1, R1.3)*
- [ ] **Encoding fits the Cleveland–McGill rank** — the headline quantity rides
      position-on-a-common-scale (bar/dot), not pie/donut/gauge angle-area or bare
      color. *(Cleveland & McGill, JASA 1984 — R2.1–2.3)*
- [ ] **No dual-axis correlation theater** — two series share one indexed axis (or
      it's an honest scatter), not two hand-tuned y-axes. *(general practice — R4.1)*
- [ ] **% vs percentage-point labeled** — the change is stated in the correct unit.
      *(general practice — R4.2)*
- [ ] **Denominator visible** — every rate/ratio shows or exposes its base (n).
      *(general practice — R4.3)*
- [ ] **Precision honest** — no more significant figures than the data supports;
      consistent within a column. *(general practice — R4.4)*
- [ ] **Uncertainty shown when estimated** — error bars / CI / ± for estimates &
      forecasts; projected data visually distinct. *(general practice — R4.5)*
- [ ] **Colorblind-safe + not color-alone** — CVD-safe ordered/qualitative palette,
      and every color-borne meaning is redundantly labeled/shaped. *(Ware; WCAG
      1.4.1 — R3.2, R3.3)*
- [ ] **Text-equivalent present** — a data table / summary / accessible markup
      backs the chart. *(WCAG 1.1.1; general practice — R4.6)*
- [ ] **(Dashboards, C7) One focal KPI wins one pre-attentive contrast** — the hero
      number pops via a single strong channel, its encoding proportionate to its
      claim. *(Ware — R3.1; + R1.2 for any hero bar/gauge)*
