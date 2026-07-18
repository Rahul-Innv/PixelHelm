# Color reserved for the data channel

Table of contents
- [The principle: color is the data channel](#the-principle)
- [The color budget](#the-color-budget)
- [Sequential / diverging / categorical — pick by data type](#scale-types)
- [Why rainbow-as-quantitative is banned](#why-rainbow-is-banned)
- [Colorblind-safety](#colorblind-safety)
- [The token roles to add](#the-token-roles)

## The principle

On a data product, **color is a scarce, meaningful channel — spend it only on data
that carries meaning.** This is the dataviz reading of the build spec's Dammyjay93
hierarchy ruling (`60/30/10`, "accent ≤ ~10%", "weight and color do more hierarchy
work than size") and the build-spec "NEVER ship taste as an adjective" ruling
(no relation to the council's retired composite-C3 seat): structure
is carried by GRAYSCALE/INK; saturated color is reserved for the marks the user must
distinguish or the states that demand attention.

Grayscale-first means: build the entire chart/table/dashboard in ink (black/white/
grays) FIRST — grid, axes, labels, borders, default marks. It should already be
readable and hierarchical. THEN add color *only* where color does a job the ink
can't: distinguishing series, encoding magnitude on a deliberate scale, or flagging
state (alert/up/down). If you remove the color and the chart becomes unreadable, the
color was load-bearing (good). If removing it changes nothing but "mood," it was
decoration (delete it).

**Decoration color is a FAIL:** gradient fills "because it looks nice", colored card
backgrounds behind KPIs, a different hue per section, colored gridlines, a rainbow
donut. Each one spends the channel the data needs and trains the user's eye to ignore
color — so when color finally means "alert", it's lost in the noise.

## The color budget

- **≤ ~6 categorical hues** in one view. Beyond ~6 the eye cannot reliably bind a
  color to a series via the legend — you get a "match the color to the legend" chore.
  When you have more categories: switch to **direct labels** on the marks,
  **small multiples** (one panel per series, shared axis), or **highlight-one /
  gray-the-rest** (the one series in question gets the accent, all others are muted
  gray).
- **One accent for "now / selected / alert."** Reserve a single high-salience color
  for the thing that needs attention. If everything is colorful, nothing is urgent.
- **Chrome stays ink.** Gridlines, axes, borders, default text — grayscale, low
  contrast, recessive. (See `floor.md` data-ink contrast.)

## Scale types

Pick the scale by the DATA TYPE, not by what's pretty:

| Data type | Scale | What it looks like | Use for |
|---|---|---|---|
| Nominal / categorical (no order) | **Categorical** | ≤6 distinct hues, similar lightness | Series, segments, statuses |
| Ordered magnitude, one direction | **Sequential** | Light→dark of ONE hue | Heatmaps, choropleths, density |
| Ordered with a meaningful midpoint | **Diverging** | Two hues from a neutral center | Above/below target, +/- change, sentiment |

- **Sequential**: vary lightness (and a little chroma) within a single hue so "darker
  = more" reads monotonically. Generate it through design-color's perceptual
  (OKLCH-based) machinery so steps are perceptually even — do NOT interpolate in
  HSL/RGB (the build spec bans HSL/RGB interpolation for scales).
- **Diverging**: anchor a neutral midpoint at the meaningful zero (e.g. on-target,
  zero change), with two distinguishable hues stepping out each way. The midpoint
  must sit at the data's true center, not the visual middle.
- **Categorical**: distinct hues at roughly equal lightness so no series looks
  "heavier" by accident; order them so adjacent series are distinguishable.

## Why rainbow is banned

Never use a rainbow (full-spectrum) ramp as a QUANTITATIVE scale:

- It is **perceptually non-uniform** — equal data steps produce unequal perceived
  steps, and the yellow band creates a false bright "peak" that isn't in the data.
- It has **no intrinsic order** — viewers can't tell whether green > blue or blue >
  green without constant legend lookups.
- It reads as **decoration**, training the eye that color here is mood, not meaning.

Use sequential (ordered, one hue) or diverging (midpoint) instead. Rainbow as a
*categorical* palette is also discouraged past a few hues for the same legend-binding
reason — prefer a curated categorical set at even lightness.

## Colorblind-safety

~8% of men have a color-vision deficiency, most commonly red/green. Meaning encoded
by red-vs-green hue alone is invisible to them.

- **Never encode meaning by hue alone.** Pair hue with a second channel: position,
  shape, label, icon, or value (lightness). E.g. up = green + ▲ + "+2.1%"; down =
  red + ▼ + "−2.1%".
- **Prefer CVD-safe ramps** for sequential/diverging (lightness does the work, so it
  survives CVD). Diverging schemes that go through a light midpoint with distinct
  lightness on each arm survive better than red↔green.
- **Verify, don't eyeball.** Check the chosen data palette through design-color's
  checks against the project token palette — CVD-safety and AA contrast are both
  design-color's machinery; this skill consumes the verified result.

## The token roles

Add these data-channel roles to the project's design-tokens module (not inline hex).
design-color generates the perceptual, AA-checked values; design-tokens stores them:

```
--data-1 … --data-6        # categorical series (even lightness, distinguishable, CVD-aware)
--data-seq-50 … --data-seq-900   # one-hue sequential ramp (perceptual steps)
--data-div-neg / --data-div-mid / --data-div-pos   # diverging anchors
--data-alert / --data-up / --data-down   # state accents (each paired with shape/label, AA-true)
--data-grid                # faint gridlines (recessive)
--data-axis                # axis lines / ticks
--data-ink                 # default data mark / number ink (AA against surface)
--data-ink-muted           # uncertain / secondary data ink (see uncertainty.md)
```

Every chart, table, gauge, and sparkline binds to these — zero raw hex (the `token`
distinctiveness test and the Layer-1 token gate both depend on it).
