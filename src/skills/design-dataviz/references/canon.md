# Dataviz canon — the Bloomberg-x-Wikipedia discipline

Table of contents
- [The thesis](#the-thesis)
- [The generic-dashboard anti-slop tell-list](#the-generic-dashboard-anti-slop-tell-list)
- [Choosing the encoding (by question + data shape)](#choosing-the-encoding)
- [Density vs cramped](#density-vs-cramped)
- [Master / detail](#masterdetail)
- [The distinctiveness gate (squint / swap / signature / token)](#the-distinctiveness-gate)
- [Register notes](#register-notes)

## The thesis

On a data product the data is not *inside* the design — the data IS the design.
Two reference poles, held in tension:

- **Bloomberg** — ruthless density and a numeric rail. A Bloomberg screen shows
  hundreds of numbers and a professional scans it in seconds because the digits
  align, the layout is rhythmic, and color means something specific (up/down,
  alert). Density is respect for the user's time, not clutter.
- **Wikipedia** — calm, neutral, trustworthy typographic structure. No brand
  flourish competing with content; quiet rules, generous-but-consistent rhythm,
  the *content* is the hero. It reads as authoritative because it is not trying to
  impress you.

Bloomberg-x-Wikipedia = pack the rail and let the signal read (Bloomberg) inside
calm, neutral, honest structure (Wikipedia). The opposite — the thing to avoid —
is the **marketing dashboard**: big rounded cards, one number each, color sprayed
for mood, a hero donut, lots of air and very little information. That is decoration
pretending to be an instrument.

## The generic-dashboard anti-slop tell-list

These are the tells that make a data UI read as AI-generated / template-default.
Detecting and removing them is the deslop pass for the data surface (the product-UI
tell-set, per the build spec C6 ruling — apply the data tell-set, not the
hero/campaign one). If a candidate has these, kill it in critique step 2.

- **Three rounded "metric cards"** in a row, each one big colored number + tiny
  up/down arrow, oceans of padding. (The shadcn-default dashboard cluster.)
- **Rainbow donut / pie** for >4 slices, or a pie used where a sorted bar is honest.
- **Gradient area-chart fill** "because it looks nice" — decoration spending the
  color channel.
- **Colored card backgrounds** behind KPIs (a green card, a red card) — color as
  mood, not data.
- **Color sprayed on chrome** — colored gridlines, colored section headers, a
  different hue per card for no reason.
- **A y-axis that auto-fits / starts non-zero** on bars to make a small change look
  dramatic.
- **Proportional digits** that jitter as values update; numbers that don't align in
  a column.
- **Lorem / 5 fake rows** hiding the real density problem; a table that only looks
  good empty.
- **An unsorted table** — rows in arbitrary/insertion order, making the user scan
  for the max.
- **A big number with no comparison** — a metric with no baseline, target, delta,
  or trend, so it means nothing.
- **More chart types than questions** — a "dashboard of dashboards" where variety is
  the point instead of the answer.

## Choosing the encoding

Pick the form from the QUESTION and the DATA SHAPE, never from what looks impressive.
Brainstorm ≥3 and choose:

| The user's question | Honest default encoding | Cheaper/denser alternative |
|---|---|---|
| Is it up or down vs last period? | A delta number with direction + color | Sparkline in the cell |
| What's the trend over time? | Line chart (non-zero ok, labeled) | Inline sparkline |
| Which category is biggest? | Sorted horizontal bar (zero-based) | Ranked list with bar-in-cell |
| How do parts make a whole? | Sorted bar or stacked bar | Single 100% stacked bar; avoid pie >4 |
| How do 100s of rows compare? | Sortable table + sparkline column | Small multiples |
| Is a value within tolerance? | Gauge / bullet vs target band | Number + colored threshold dot |
| Correlation of two series? | Two ALIGNED panels (never dual-axis) | Scatter |
| Distribution? | Histogram / box plot | Strip plot |

Rules of thumb: **position beats length beats angle beats area beats color** for
encoding a quantity (humans read position most accurately, area/color worst). Prefer
a bar (length/position) over a pie (angle/area). Reserve color for category/state,
not magnitude, unless using a deliberate sequential scale.

## Density vs cramped

Density is the goal; cramped is the failure. The difference is *consistency*, not
amount of space:

- **Dense** = tight but **rhythmic** spacing from the shared scale (design-typography
  / spacing scale, 25%-minimum jumps per `gnurio 04-apply-consistent-spacing`),
  proximity grouping ("more space between groups than within groups"), chrome
  suppressed ("whitespace and rule-lines over heavy borders").
- **Cramped** = random/ad-hoc tightening, equal space everywhere so groups don't
  read, heavy borders boxing everything, content touching edges.

To increase density honestly: shrink padding *consistently*, replace borders with
faint rules or alignment, put micro-charts (sparklines, bar-in-cell) inside table
cells, use small multiples, and remove decorative chrome — never shrink the type
below the legibility floor or remove the labels that make numbers mean something.

## Master / detail

For more than ~one screen of data, use master/detail, not one giant grid:

- **Master** = a scannable, sorted, dense list/table. The numeric rail aligns; the
  default sort is meaningful (rank / time / magnitude).
- **Detail** = a focused pane for the selected row — its full numbers, its chart, its
  context. Keep selection state visible and the numeric formatting identical to the
  master so the eye doesn't re-anchor.

## The distinctiveness gate

After building, run the four named tests (defined authoritatively in
`design-council`'s `references/four-exit-tests.md` — the plugin's canonical
distinctiveness rubric):

- **Squint** — blur the screen (or squint). Does the *signal* still read — does your
  eye land on the answer first? If everything is equal-weight mush, hierarchy failed.
- **Swap** — would this chart/table be equally at home in any generic admin template?
  If yes, it's generic (bad). It should be specific to THIS data and THIS register.
- **Signature** — is there one intentional, register-true move (the way the rail is
  set, the one accent that means "alert", the small-multiple grid)? Decided design
  has a signature; generated design has none.
- **Token** — is every value a token? Zero raw hex in the chart, axis, grid, or marks.
  (Also a Layer-1 gate — but check it here so it never reaches the gate.)

## Register notes

The craft canon is constant; the *restraint dial* is register-specific:

- **An analyst data product — analyst-terminal.** This skill's home. Max density, a real mono
  for numerics, faint grid, ink-heavy data, color strictly state/series. Think
  terminal, not dashboard.
- **A regulated trust portal — serious-trust.** Data is calm and exact; never flashy. No gradient
  fills, no animated counters. Precision reads as trustworthy.
- **A warm consumer app — warm-premium-fun-but-calm.** A metric can carry a little delight (a
  soft accent, a gentle reveal) but the floor still holds: honest axes, tabular
  rails, reserved color. Fun never buys a lie.
