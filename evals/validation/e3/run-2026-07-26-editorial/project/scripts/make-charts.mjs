#!/usr/bin/env node
// make-charts.mjs — deterministic SVG plate generator for the E3 editorial arms.
// Every coordinate is a pure linear mapping of sealed-data literals (plus the
// injected axis constants from derived.json). No clock, no invention: the
// generator draws exactly the record — gaps as gaps, the 1996/1997 seam, the
// 2019 outlier hollow — and the arms inline its output verbatim.
//
// Usage: node make-charts.mjs   (writes charts/*.svg next to the scripts dir)
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const project = dirname(here);
const data = JSON.parse(readFileSync(join(project, "data", "ashcombe-rainfall.json"), "utf8"));
const derived = JSON.parse(readFileSync(join(project, "data", "derived.json"), "utf8"));
const outDir = join(project, "charts");
mkdirSync(outDir, { recursive: true });

const years = data.years;
const recorded = years.filter((y) => y.onsetDayOfYear !== null);
const gaps = [[1998, 1998], [2003, 2004]];   // from the sealed gapReason rows
const Y0 = 1990, Y1 = 2023;

// Plot box (viewBox 0 0 400 240): x 34..394, y 14..214.
const X = (year) => +(34 + ((year - Y0) * 360) / (Y1 - Y0)).toFixed(1);
const XM = (year) => +(34 + ((year + 0.5 - Y0) * 360) / (Y1 - Y0)).toFixed(1); // midpoint after `year`
const r1 = (v) => +v.toFixed(1);

const yOnset = (d) => r1(214 - ((d - derived.onsetShelf.minDay) * 200) / (derived.onsetShelf.maxDay - derived.onsetShelf.minDay));
const yTotal = (v) => r1(214 - ((v - derived.totalAxis.min) * 200) / (derived.totalAxis.max - derived.totalAxis.min));
const yHeavy = (v) => r1(214 - (v * 200) / derived.max24hAxis.max);

const XT = [1990, 2000, 2010, 2020];

function frame({ yTicks, yLabel }) {
  let s = "";
  s += `<line class="axis" x1="34" y1="14" x2="34" y2="214"/>`;
  s += `<line class="axis" x1="34" y1="214" x2="394" y2="214"/>`;
  for (const t of yTicks) {
    s += `<line class="tickline" x1="31" y1="${t.y}" x2="34" y2="${t.y}"/>`;
    s += `<text class="ticklabel" x="29" y="${r1(t.y + 3)}" text-anchor="end">${t.label}</text>`;
  }
  for (const yr of XT) {
    s += `<line class="tickline" x1="${X(yr)}" y1="214" x2="${X(yr)}" y2="217"/>`;
    s += `<text class="ticklabel" x="${X(yr)}" y="228" text-anchor="middle">${yr}</text>`;
  }
  if (yLabel) s += `<text class="axislabel" x="4" y="9" text-anchor="start">${yLabel}</text>`;
  return s;
}

function gapRects() {
  let s = "";
  for (const [a, b] of gaps) {
    const x0 = XM(a - 1), x1 = XM(b);
    s += `<rect class="gaprect" x="${x0}" y="14" width="${r1(x1 - x0)}" height="200"/>`;
  }
  return s;
}

const seamX = XM(1996);
const seam = () => `<line class="seam" x1="${seamX}" y1="14" x2="${seamX}" y2="214"/>`;

function key(letter, x, y) {
  return `<g class="keychip"><circle cx="${x}" cy="${y}" r="7"/><text x="${x}" y="${r1(y + 3.2)}" text-anchor="middle">${letter}</text></g>`;
}

function meanSeg(cls, y, xa, xb, label, labelX, labelAnchor, labelDy = -4) {
  return `<line class="${cls}" x1="${xa}" y1="${y}" x2="${xb}" y2="${y}"/>` +
         `<text class="meanlabel" x="${labelX}" y="${r1(y + labelDy)}" text-anchor="${labelAnchor}">${label}</text>`;
}

const svgOpen = (id) => `<svg viewBox="0 0 400 240" role="img" aria-labelledby="${id}" preserveAspectRatio="xMidYMid meet">`;

/* ---------- Plate I: onset (both arms; class scheme differs) ---------- */
function plateOnset({ id, twoInks }) {
  let s = svgOpen(id);
  s += gapRects() + seam();
  s += frame({
    yTicks: derived.onsetShelf.ticks.map((d, i) => ({ y: yOnset(d), label: derived.onsetShelf.tickLabels[i] })),
    yLabel: "first sustained rain",
  });
  s += meanSeg(twoInks ? "meanline g" : "meanline", yOnset(derived.onsetMeanFirst), X(1990), X(1994),
    `${derived.onsetFirstDate.month.slice(0, 3)} ${derived.onsetFirstDate.day}`, X(1990), "start", -5);
  s += meanSeg(twoInks ? "meanline w" : "meanline", yOnset(derived.onsetMeanLast), X(2018), X(2023),
    `${derived.onsetLastDate.month.slice(0, 3)} ${derived.onsetLastDate.day}`, X(2023), "end", -5);
  for (const y of recorded) {
    const cls = y.reviewStatus ? "dot hollow" : (twoInks ? (y.year <= 1996 ? "dot g" : "dot w") : "dot");
    s += `<circle class="${cls}" cx="${X(y.year)}" cy="${yOnset(y.onsetDayOfYear)}" r="3.2"/>`;
  }
  s += key("a", seamX, 22) + key("b", XM(2003), 22) + key("c", r1(X(2018) - 12), yOnset(derived.onsetMeanLast)) +
       key("d", X(2019), r1(yOnset(years.find((y) => y.year === 2019).onsetDayOfYear) - 14));
  return s + `</svg>`;
}

/* ---------- Plate II: season totals (dots joined only between adjacent years) ---------- */
function plateTotals({ id }) {
  let s = svgOpen(id);
  s += gapRects() + seam();
  s += frame({
    yTicks: derived.totalAxis.ticks.map((v) => ({ y: yTotal(v), label: v === derived.totalAxis.max ? `${v} mm` : String(v) })),
    yLabel: `season total (scale starts at ${derived.totalAxis.min} mm)`,
  });
  s += meanSeg("meanline", yTotal(derived.totalMeanFirst), X(1990), X(1994), `${derived.totalMeanFirst} mm`, X(1990), "start", -5);
  s += meanSeg("meanline", yTotal(derived.totalMeanLast), X(2018), X(2023), `${derived.totalMeanLast} mm`, X(2023), "end", -5);
  let prev = null;
  let path = "";
  for (const y of recorded) {
    const px = X(y.year), py = yTotal(y.wetSeasonTotalMm);
    if (prev && y.year === prev.year + 1) path += `<line class="join" x1="${prev.px}" y1="${prev.py}" x2="${px}" y2="${py}"/>`;
    prev = { year: y.year, px, py };
  }
  s += path;
  for (const y of recorded) {
    const cls = y.reviewStatus ? "dot hollow" : "dot";
    s += `<circle class="${cls}" cx="${X(y.year)}" cy="${yTotal(y.wetSeasonTotalMm)}" r="3.2"/>`;
  }
  s += key("a", seamX, 22) + key("b", XM(2003), 22) +
       key("c", r1(X(2018) - 12), yTotal(derived.totalMeanLast)) +
       key("d", X(2019), r1(yTotal(years.find((y) => y.year === 2019).wetSeasonTotalMm) - 14));
  return s + `</svg>`;
}

/* ---------- Plate III: heaviest day (lollipops from a true zero) ---------- */
function plateHeavy({ id }) {
  let s = svgOpen(id);
  s += gapRects() + seam();
  s += frame({
    yTicks: [0, 50, 100, 150].map((v) => ({ y: yHeavy(v), label: v === 150 ? `${v} mm` : String(v) })),
    yLabel: "heaviest single day (from zero)",
  });
  s += meanSeg("meanline", yHeavy(derived.max24hMeanFirst), X(1990), X(1994), `${derived.max24hMeanFirst} mm`, X(1990), "start", -5);
  s += meanSeg("meanline", yHeavy(derived.max24hMeanLast), X(2018), X(2023), `${derived.max24hMeanLast} mm`, X(2023), "end", -5);
  for (const y of recorded) {
    const px = X(y.year), py = yHeavy(y.max24hMm);
    const flagged = !!y.reviewStatus;
    s += `<line class="stem${flagged ? " dashed" : ""}" x1="${px}" y1="214" x2="${px}" y2="${py}"/>`;
    s += `<circle class="dot${flagged ? " hollow" : ""}" cx="${px}" cy="${py}" r="3.2"/>`;
  }
  s += key("a", seamX, 22) + key("b", XM(2003), 22) +
       key("c", r1(X(2018) - 12), yHeavy(derived.max24hMeanLast)) +
       key("d", r1(X(2019) - 13), r1(yHeavy(years.find((y) => y.year === 2019).max24hMm) + 2));
  return s + `</svg>`;
}

writeFileSync(join(outDir, "plate-onset.svg"), plateOnset({ id: "p1-name", twoInks: false }) + "\n");
writeFileSync(join(outDir, "plate-totals.svg"), plateTotals({ id: "p2-name" }) + "\n");
writeFileSync(join(outDir, "plate-heavy.svg"), plateHeavy({ id: "p3-name" }) + "\n");
writeFileSync(join(outDir, "drift-two-inks.svg"), plateOnset({ id: "drift-name", twoInks: true }) + "\n");
console.log("charts written: plate-onset, plate-totals, plate-heavy, drift-two-inks");
