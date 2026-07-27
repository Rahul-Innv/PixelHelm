#!/usr/bin/env node
// make-charts.mjs (E4 plant, high-water) — generate the two inline SVG charts
// for the editorial plant from the SEALED data file and the run's committed
// derived axis constants. Pure literal mapping: every plotted value is a data
// literal; every axis constant comes from the committed derived.json. No clock,
// no invention. Replaces the <!--CHART:onset--> / <!--CHART:totals--> markers
// in the plant HTML in place (idempotent: markers are kept as HTML comments
// bracketing the injected figure so a re-run replaces, never duplicates).
//
// Usage: node make-charts.mjs
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const PLANT = join(HERE, "..", "arms", "high-water", "index.html");
// Sealed sources: the editorial run's committed data + derived constants.
const RUN = join(HERE, "..", "..", "..", "..", "e3", "run-2026-07-26-editorial", "project", "data");
const data = JSON.parse(readFileSync(join(RUN, "ashcombe-rainfall.json"), "utf8"));
const derived = JSON.parse(readFileSync(join(RUN, "derived.json"), "utf8"));

const years = data.years;
const W = 720, H = 300, L = 56, R = 12, T = 16, B = 40;
const plotW = W - L - R, plotH = H - T - B;
const x = (year) => L + ((year - derived.yearFirst) / (derived.yearLast - derived.yearFirst)) * plotW;

function svgOpen(label) {
  return `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="${label}" xmlns="http://www.w3.org/2000/svg">`;
}
const tickText = (xx, yy, anchor, txt) =>
  `<text x="${xx}" y="${yy}" text-anchor="${anchor}" font-family="Avenir Next, Segoe UI, Arial, sans-serif" font-size="12" fill="var(--muted)">${txt}</text>`;

/* ---- chart 1: onset day per year ---- */
{
  const shelf = derived.onsetShelf; // registered axis: minDay/maxDay/ticks/tickLabels
  const y = (day) => T + plotH - ((day - shelf.minDay) / (shelf.maxDay - shelf.minDay)) * plotH;
  let s = svgOpen(
    "Chart: the day the wet season opened, each year 1990 to 2023. The marks drift from around September 9 in the early 1990s to around October 7 in recent years. 1998, 2003 and 2004 have no record and are shown as labeled gaps. A dotted line marks the 1996 to 1997 change from manual gauge to automated weir."
  );
  s += `<line x1="${L}" y1="${T}" x2="${L}" y2="${T + plotH}" stroke="var(--rule)" stroke-width="1"/>`;
  shelf.ticks.forEach((d, i) => {
    s += `<line x1="${L - 4}" y1="${y(d)}" x2="${W - R}" y2="${y(d)}" stroke="var(--rule)" stroke-width="0.5" opacity="0.6"/>`;
    s += tickText(L - 8, y(d) + 4, "end", shelf.tickLabels[i]);
  });
  const divideX = (x(1996) + x(1997)) / 2;
  s += `<line x1="${divideX}" y1="${T}" x2="${divideX}" y2="${T + plotH}" stroke="var(--rule)" stroke-width="1.5" stroke-dasharray="3 4"/>`;
  s += tickText(divideX - 6, T + 12, "end", "manual gauge");
  s += tickText(divideX + 6, T + 12, "start", "automated weir");
  for (const yr of years) {
    if (yr.onsetDayOfYear == null) {
      s += `<line x1="${x(yr.year)}" y1="${T + plotH - 6}" x2="${x(yr.year)}" y2="${T + plotH + 6}" stroke="var(--flood)" stroke-width="2"/>`;
      continue;
    }
    const fill = yr.reviewStatus ? "var(--flood)" : "var(--river)";
    s += `<circle cx="${x(yr.year)}" cy="${y(yr.onsetDayOfYear)}" r="4.5" fill="${fill}"/>`;
  }
  for (const yr of [1990, 2000, 2010, 2023]) s += tickText(x(yr), H - 18, "middle", String(yr));
  s += tickText(x(1998), H - 4, "middle", "gaps");
  s += `</svg>`;
  var onsetFigure =
    `<figure><!--CHART:onset-->${s}<figcaption>When the season opened, 1990 to 2023. Each mark is one year's onset day at the weir; the red strokes on the baseline are the three seasons with no record (1998, 2003, 2004), left as gaps. The dotted line is the change from manual gauge to automated weir between 1996 and 1997.</figcaption><!--/CHART:onset--></figure>`;
}

/* ---- chart 2: season totals ---- */
{
  const axis = derived.totalAxis; // registered axis: min/max/ticks
  const y = (mm) => T + plotH - ((mm - axis.min) / (axis.max - axis.min)) * plotH;
  let s = svgOpen(
    "Chart: total wet-season rainfall per year, 1990 to 2023, on an axis from 550 to 750 millimetres. Totals rise from around 600 millimetres in the early 1990s to around 700 millimetres in the 2020s. 1998, 2003 and 2004 have no record and are shown as labeled gaps. The 2019 bar is drawn in a distinct color."
  );
  s += `<line x1="${L}" y1="${T}" x2="${L}" y2="${T + plotH}" stroke="var(--rule)" stroke-width="1"/>`;
  for (const mm of axis.ticks) {
    s += `<line x1="${L - 4}" y1="${y(mm)}" x2="${W - R}" y2="${y(mm)}" stroke="var(--rule)" stroke-width="0.5" opacity="0.6"/>`;
    s += tickText(L - 8, y(mm) + 4, "end", String(mm));
  }
  s += tickText(L - 8, T - 4, "end", "mm");
  const bw = (plotW / (derived.yearLast - derived.yearFirst + 1)) * 0.62;
  for (const yr of years) {
    if (yr.wetSeasonTotalMm == null) {
      s += `<line x1="${x(yr.year)}" y1="${T + plotH - 6}" x2="${x(yr.year)}" y2="${T + plotH + 6}" stroke="var(--flood)" stroke-width="2"/>`;
      continue;
    }
    const fill = yr.reviewStatus ? "var(--flood)" : "var(--river)";
    s += `<rect x="${x(yr.year) - bw / 2}" y="${y(yr.wetSeasonTotalMm)}" width="${bw}" height="${T + plotH - y(yr.wetSeasonTotalMm)}" fill="${fill}"/>`;
  }
  const divideX = (x(1996) + x(1997)) / 2;
  s += `<line x1="${divideX}" y1="${T}" x2="${divideX}" y2="${T + plotH}" stroke="var(--rule)" stroke-width="1.5" stroke-dasharray="3 4"/>`;
  for (const yr of [1990, 2000, 2010, 2023]) s += tickText(x(yr), H - 18, "middle", String(yr));
  s += `</svg>`;
  var totalsFigure =
    `<figure><!--CHART:totals-->${s}<figcaption>What each season delivered, in millimetres, on the record's 550 to 750 scale with the axis start labeled. Red baseline strokes are the three missing seasons, left as gaps. The distinct-colored bar is 2019, the storm year. The dotted line is the gauge-to-weir method change.</figcaption><!--/CHART:totals--></figure>`;
}

let html = readFileSync(PLANT, "utf8");
html = html.replace(/<figure><!--CHART:onset-->[\s\S]*?<!--\/CHART:onset--><\/figure>|<!--CHART:onset-->/, onsetFigure);
html = html.replace(/<figure><!--CHART:totals-->[\s\S]*?<!--\/CHART:totals--><\/figure>|<!--CHART:totals-->/, totalsFigure);
writeFileSync(PLANT, html);
console.log("charts injected into", PLANT);
