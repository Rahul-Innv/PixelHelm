# Encoding confidence / uncertainty — opacity, not noise

Table of contents
- [The rule](#the-rule)
- [Why opacity is the right channel](#why-opacity-is-the-right-channel)
- [The channels for uncertainty](#the-channels-for-uncertainty)
- [What NOT to do](#what-not-to-do)
- [Worked patterns](#worked-patterns)
- [The honesty rule: never drop, never overstate](#the-honesty-rule)

## The rule

When a value is uncertain — an estimate, a forecast, a projection, a low-sample
figure, a stale/late-arriving number, or anything with a margin of error — **show
the uncertainty; do not hide it and do not let it look like a hard fact.** The
primary, cheap, honest channel for "less certain" is **reduced opacity**. Add an
error band / confidence interval and/or an explicit confidence label when the
magnitude of uncertainty matters.

## Why opacity is the right channel

- **It reads correctly.** Lower opacity literally looks fainter / "less there" —
  the perception maps to the meaning ("less certain") without a legend.
- **It's cheap to render.** `opacity` (and `transform`) are the GPU-cheap compositor
  properties (build spec: motion.dev "transform & opacity cheapest"); fading a mark
  is free, unlike re-coloring or re-drawing.
- **It composites honestly.** A faded mark over the grid still shows the value's
  position — you see *where* it is and that you should trust it *less*. It doesn't
  fabricate or distort the number.
- **It doesn't spend the color budget.** Encoding uncertainty by adding a NEW color
  steals a hue from the data channel (see `color-for-data.md`). Opacity is orthogonal
  to hue, so a faded series keeps its identity.

## The channels for uncertainty

Pick by what the data needs; combine where it helps:

| Uncertainty type | Encoding |
|---|---|
| A value is an estimate / projection | **Reduce opacity** of the mark (e.g. actuals at 100%, estimates at ~50–60%) |
| Forecast vs actual on a time series | Actual = solid full-opacity line; forecast = **dashed** stroke and/or reduced opacity, optionally a shaded cone |
| A range / CI / margin of error | **Error band** (a faded fill between low/high) or error bars; the band IS the uncertainty made visible |
| Low sample size / low confidence score | Reduced opacity + a small explicit label ("n=12", "low confidence", a confidence chip) |
| Stale / late data | Reduced opacity + a timestamp / "as of" / "updating…" marker |

Tie the opacity (and any band) to a token so it's consistent and themeable:
`--data-ink-muted` for the faded ink, and a faded variant of the series color for
the band. Don't eyeball the alpha per chart.

## What NOT to do

Adding *noise* to "show uncertainty" makes the chart harder to read and conveys no
quantity. Banned:

- **Jitter / wiggle / animation** on uncertain marks — adds motion noise, not
  information, and reads as a bug.
- **Blur** as the uncertainty channel — destroys the value's readable position.
- **An extra color** for "uncertain" — steals the color budget; uncertainty isn't a
  category.
- **Texture/pattern spam** beyond a single clear "forecast = dashed" convention.
- **Silently dropping** the uncertain data — the most common and most dishonest move.
- **Showing an estimate as a hard fact** (same weight/opacity as actuals, no band,
  no label) — overstates confidence the data doesn't have.

## Worked patterns

```
Forecast time series:
  actual:   solid line, --data-1, opacity 1
  forecast: dashed line, --data-1, opacity ~0.55
  CI cone:  fill --data-1 at opacity ~0.12 between low/high bounds
  divider:  a faint "now" rule between actual and forecast

KPI tile with an estimate:
  value:      "≈ $1.2M"  (the ≈ + --data-ink-muted signals estimate)
  sublabel:   "estimated · low sample (n=14)"
  vs a confirmed tile: "$1.20M" full --data-ink, "actual"

Bar chart with margins of error:
  bar:        full opacity, zero-based (see floor.md)
  error bar:  thin cap line spanning ±MoE in --data-ink-muted
```

## The honesty rule

**Never drop, never overstate.** Uncertain data is still data:

- Do not silently omit low-confidence rows/points — show them, marked as uncertain.
- Do not round an estimate into a confident-looking exact figure (`$1,203,847` for a
  number you only know to ±15%); show appropriate precision and the range.
- Do not let an estimate share the exact visual weight of a measured value.
- When confidence is too low to act on, say so explicitly rather than presenting a
  faded-but-precise number that invites false trust.

This pairs with the axis-honesty floor (`floor.md`): the chart must not lie about
magnitude (axes) OR about certainty (uncertainty encoding). Both are non-negotiable
on a data product where people make decisions from the screen.
