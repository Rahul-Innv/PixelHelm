# The deterministic floor — axis honesty + numeric rails

Table of contents
- [Axis honesty](#axis-honesty)
- [Tabular numeric rails + alignment](#tabular-numeric-rails--alignment)
- [Contrast of data ink](#contrast-of-data-ink)
- [What pixelhelm-evaluate Layer-1 checks](#what-pixelhelm-evaluate-layer-1-checks)

These are the rules that are (a) verifiable and (b) violated often enough to deserve
a hard gate. The taste layer lives in `canon.md`; this is the floor that stops a
chart from *lying* or being *unscannable*.

## Axis honesty

A chart that distorts the data is worse than no chart — it launders a false claim
through visual authority. The honest defaults:

### Bars / columns / areas baseline at ZERO

Length and area encode magnitude, and the eye reads the *whole bar*. Truncating the
baseline makes a 2% difference look like a 2x difference.

```
BAD  (lies):  y-axis 90..100, two bars at 94 and 96 -> looks like 96 is ~2x of 94
GOOD (true):  y-axis 0..100, two bars at 94 and 96  -> looks like the ~2% it is
```

- **FAIL** any bar/column/area whose value axis does not include zero.
- If a 2% real difference is the story and zero-based bars hide it, the bar is the
  WRONG encoding — switch to a line, a delta number, or a dot plot with a labeled
  range. Don't fix a lying bar by keeping the lie; change the encoding.

### Lines may use a non-zero range — but must DECLARE it

Lines encode *rate/trend* (the slope), not magnitude against zero, so a zoomed range
is legitimate to reveal a trend. The honesty requirement is disclosure:

- The y-range MUST be labeled (visible min/max) so the reader knows it's not zero-based.
- Never draw a filled area under a non-zero-baselined line (the fill re-introduces the
  magnitude lie an area chart would make).

### Fixed domains across comparisons

Small multiples, panels, re-renders, and live updates that the user will COMPARE must
share ONE axis domain. An axis that auto-fits per panel makes incomparable magnitudes
look identical.

- Lock the domain to the data's overall extent (or a declared fixed range), not each
  panel's local extent.
- Live/streaming charts: fix the axis or the data appears to "rescale" misleadingly as
  new points arrive.

### Never a dual y-axis

Two different y-axes on one chart let you slide two unrelated series into apparent
correlation by choosing the scales — it is a manufactured-correlation tell. Use two
**vertically aligned panels** sharing the x-axis instead.

## Tabular numeric rails + alignment

The Bloomberg rail: a column of numbers you can scan in one fixation because the
digits line up. This requires monospaced *figures* (not necessarily a mono font) and
correct alignment. (Rule owned by `pixelhelm-typography`; source: interfaces.rauno.me
"tabular figures with `font-variant-numeric: tabular-nums` … particularly in tables/
timers" — the build spec's interface-quality micro-check "tabular-nums on dynamic
numbers".)

- **`font-variant-numeric: tabular-nums`** (or a tabular/mono typeface) on every
  column of numbers AND every live-updating number (timers, counters, prices,
  metrics). Proportional figures jitter and misalign — only acceptable in prose.
  - **FAIL** dynamic / columnar numbers rendered with proportional figures.
- **Alignment:**
  - **Right-align** plain integers and counts.
  - **Decimal-align** money / decimals (align on the decimal point so magnitudes
    stack readably; pad to consistent decimal places).
  - **Left-align** text / labels.
  - Headers align with their column's data (right-aligned header over right-aligned
    numbers).
- **Consistent precision per column** — don't mix 1, 2, and 3 decimal places down a
  column. Pick the precision the decision needs and hold it.
- **Units once** — put the unit in the header (`Revenue ($k)`) not on every cell, so
  the digits stay a clean rail.

```
BAD  (proportional, mixed precision, left-aligned):
  Revenue
  1234.5
  98.20
  10000

GOOD (tabular-nums, right/decimal-aligned, $k in header):
  Revenue ($k)
     1,234.5
        98.2
    10,000.0
```

## Contrast of data ink

The data marks and the numbers carry the meaning, so they must clear contrast — but
chrome (gridlines, axes) should be FAINT so it recedes. Both directions matter:

- **Data ink / numbers:** meet the project AA contrast floor (pixelhelm-color owns the
  numbers; this skill requires the data ink role passes). A pale series on a pale
  background is unreadable AND fails AA.
- **Chrome:** gridlines and axes are intentionally low-contrast (faint rules) so they
  structure without competing — but a gridline still needs enough contrast to be seen
  if it carries a reference value. Decorative-only gridlines can go very faint;
  reference gridlines (zero line, target band) get more weight.
- Encode state (alert/up/down) with a color that itself passes contrast against its
  background — never a pure-hue red/green that fails AA or fails for CVD users (see
  `color-for-data.md`).

## What pixelhelm-evaluate Layer-1 checks

Do not re-implement these — `pixelhelm-evaluate` runs `static-gates.mjs`. This floor
maps onto its gates so building to it means the gate passes:

- `tabular-nums on dynamic numbers` micro-check (already in static-gates) — satisfied
  by the numeric-rail rule above.
- Token-contrast + real-render contrast gates — satisfied by the data-ink contrast
  rule (and color-for-data.md keeping the palette AA-true).
- The `token` test (zero raw hex) — satisfied by binding every chart value to a
  pixelhelm-tokens role.
- Axis-honesty is largely a Layer-2 judgment (a model reads the rendered chart), but
  build to the floor here so it never reaches a finding.
