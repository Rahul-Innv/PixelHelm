#!/usr/bin/env node
// palette-de00.mjs — E2 metric (a): palette distance between tournament arms.
// Registered in PREREG-METRICS-divergence.md; committed BEFORE any measurement
// result exists and cited by hash in the run record.
//
// Method exactly as registered:
//  - Color set per arm: the FIVE most-used color tokens; usage = count of
//    references to the token name across the arm's committed stylesheets and
//    markup. This script's deterministic operationalization (declared here,
//    before results): a "reference" is each occurrence of `var(--<name>` in the
//    arm's single committed file (definitions in the token blocks are not
//    references). Ties broken by alphabetical token name.
//  - Token -> color value: the arm's embedded #token-contract. The registered
//    sheet does not name a mode; DECLARED INTERPRETATION (pre-measurement):
//    the threshold binds on LIGHT-mode values (the mode every judge protocol
//    renders); the same computation over dark values is reported as context.
//  - Distance per arm pair: CIEDE2000 (dE00) under D65/2deg over a
//    minimum-cost perfect matching between the two five-color sets (exact:
//    all 120 assignments); pair score = mean dE00 of the 5 matched pairs.
//  - Threshold: every arm pair mean matched dE00 >= 10.0 (light mode).
//  - Secondary, recorded, no threshold: same matched-mean over chromatic
//    tokens only (OKLCh chroma >= 0.04, same usage ranking).
//
// Usage: node palette-de00.mjs <arm1.html> <arm2.html> <arm3.html> > out.json

import { readFileSync } from "node:fs";
import { basename, dirname } from "node:path";

const srgbToLinear = (c) => (c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4));
function hexToRgb(hex) {
  const h = hex.replace("#", "");
  const full = h.length === 3 ? h.split("").map((c) => c + c).join("") : h;
  return [0, 2, 4].map((i) => parseInt(full.slice(i, i + 2), 16) / 255);
}
function rgbToLab([r, g, b]) {
  const [R, G, B] = [r, g, b].map(srgbToLinear);
  // sRGB D65 -> XYZ
  const X = 0.4124564 * R + 0.3575761 * G + 0.1804375 * B;
  const Y = 0.2126729 * R + 0.7151522 * G + 0.0721750 * B;
  const Z = 0.0193339 * R + 0.1191920 * G + 0.9503041 * B;
  const [Xn, Yn, Zn] = [0.95047, 1.0, 1.08883]; // D65/2deg white
  const f = (t) => (t > 216 / 24389 ? Math.cbrt(t) : (24389 / 27 * t + 16) / 116);
  const [fx, fy, fz] = [f(X / Xn), f(Y / Yn), f(Z / Zn)];
  return [116 * fy - 16, 500 * (fx - fy), 200 * (fy - fz)];
}
// CIEDE2000 (Sharma, Wu, Dalal 2005)
function de00(lab1, lab2) {
  const [L1, a1, b1] = lab1, [L2, a2, b2] = lab2;
  const rad = Math.PI / 180, deg = 180 / Math.PI;
  const C1 = Math.hypot(a1, b1), C2 = Math.hypot(a2, b2);
  const Cbar = (C1 + C2) / 2;
  const G = 0.5 * (1 - Math.sqrt(Math.pow(Cbar, 7) / (Math.pow(Cbar, 7) + Math.pow(25, 7))));
  const a1p = (1 + G) * a1, a2p = (1 + G) * a2;
  const C1p = Math.hypot(a1p, b1), C2p = Math.hypot(a2p, b2);
  const h1p = C1p === 0 ? 0 : ((Math.atan2(b1, a1p) * deg) + 360) % 360;
  const h2p = C2p === 0 ? 0 : ((Math.atan2(b2, a2p) * deg) + 360) % 360;
  const dLp = L2 - L1, dCp = C2p - C1p;
  let dhp = 0;
  if (C1p * C2p !== 0) {
    dhp = h2p - h1p;
    if (dhp > 180) dhp -= 360; else if (dhp < -180) dhp += 360;
  }
  const dHp = 2 * Math.sqrt(C1p * C2p) * Math.sin((dhp / 2) * rad);
  const Lbp = (L1 + L2) / 2, Cbp = (C1p + C2p) / 2;
  let hbp = h1p + h2p;
  if (C1p * C2p !== 0) {
    if (Math.abs(h1p - h2p) > 180) hbp += (h1p + h2p < 360 ? 360 : -360);
    hbp /= 2;
  } else hbp = h1p + h2p;
  const T = 1 - 0.17 * Math.cos((hbp - 30) * rad) + 0.24 * Math.cos(2 * hbp * rad)
    + 0.32 * Math.cos((3 * hbp + 6) * rad) - 0.20 * Math.cos((4 * hbp - 63) * rad);
  const dTheta = 30 * Math.exp(-Math.pow((hbp - 275) / 25, 2));
  const RC = 2 * Math.sqrt(Math.pow(Cbp, 7) / (Math.pow(Cbp, 7) + Math.pow(25, 7)));
  const SL = 1 + (0.015 * Math.pow(Lbp - 50, 2)) / Math.sqrt(20 + Math.pow(Lbp - 50, 2));
  const SC = 1 + 0.045 * Cbp;
  const SH = 1 + 0.015 * Cbp * T;
  const RT = -Math.sin(2 * dTheta * rad) * RC;
  return Math.sqrt(
    Math.pow(dLp / SL, 2) + Math.pow(dCp / SC, 2) + Math.pow(dHp / SH, 2)
    + RT * (dCp / SC) * (dHp / SH)
  );
}
function oklchChroma(hex) {
  const [r, g, b] = hexToRgb(hex).map(srgbToLinear);
  const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b);
  const m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b);
  const s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b);
  const A = 1.9779984951 * l - 2.4285922050 * m + 0.4505937099 * s;
  const B = 0.0259040371 * l + 0.7827717662 * m - 0.8086757660 * s;
  return Math.hypot(A, B);
}

function armPalette(file) {
  const text = readFileSync(file, "utf8");
  const m = text.match(/<script type="application\/json" id="token-contract">([\s\S]*?)<\/script>/);
  if (!m) throw new Error(`no #token-contract in ${file}`);
  const contract = JSON.parse(m[1]);
  const counts = {};
  for (const name of Object.keys(contract.light)) {
    const re = new RegExp(`var\\(--${name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "g");
    counts[name] = (text.match(re) || []).length;
  }
  const ranked = Object.keys(counts).sort((a, b) => (counts[b] - counts[a]) || a.localeCompare(b));
  const top5 = ranked.slice(0, 5);
  const chromatic = ranked.filter((n) => oklchChroma(contract.light[n]) >= 0.04).slice(0, 5);
  return { arm: basename(dirname(file)), counts, top5, chromatic,
           light: contract.light, dark: contract.dark };
}

function permutations(arr) {
  if (arr.length <= 1) return [arr];
  return arr.flatMap((x, i) => permutations([...arr.slice(0, i), ...arr.slice(i + 1)]).map((p) => [x, ...p]));
}
function matchedMean(hexesA, hexesB) {
  const labsA = hexesA.map((h) => rgbToLab(hexToRgb(h)));
  const labsB = hexesB.map((h) => rgbToLab(hexToRgb(h)));
  const n = Math.min(labsA.length, labsB.length);
  if (n === 0) return { mean: null, matching: [] };
  let best = null;
  for (const perm of permutations([...Array(labsB.length).keys()].slice(0, labsB.length))) {
    if (labsA.length !== labsB.length) break; // registered metric uses 5v5; chromatic sets may differ - handled below
    const ds = perm.map((j, i) => de00(labsA[i], labsB[j]));
    const mean = ds.reduce((s, d) => s + d, 0) / ds.length;
    if (!best || mean < best.mean) best = { mean, matching: perm.map((j, i) => ({ a: i, b: j, de00: +ds[i].toFixed(3) })) };
  }
  if (!best) { // unequal sizes (chromatic secondary only): match the smaller set optimally into the larger
    const [small, large, swap] = labsA.length <= labsB.length ? [labsA, labsB, false] : [labsB, labsA, true];
    let bestU = null;
    const idx = [...Array(large.length).keys()];
    const choose = (remaining, i, acc, sum) => {
      if (i === small.length) { if (!bestU || sum / i < bestU.mean) bestU = { mean: sum / i, matching: [...acc] }; return; }
      for (const j of remaining) choose(remaining.filter((x) => x !== j), i + 1,
        [...acc, swap ? { a: j, b: i } : { a: i, b: j }], sum + de00(small[i], large[j]));
    };
    choose(idx, 0, [], 0);
    best = bestU;
  }
  return { mean: +best.mean.toFixed(3), matching: best.matching };
}

const files = process.argv.slice(2);
if (files.length !== 3) { console.error("usage: node palette-de00.mjs <arm1.html> <arm2.html> <arm3.html>"); process.exit(2); }
const arms = files.map(armPalette);
const pairs = [];
for (let i = 0; i < arms.length; i++) for (let j = i + 1; j < arms.length; j++) {
  const A = arms[i], B = arms[j];
  const light = matchedMean(A.top5.map((n) => A.light[n]), B.top5.map((n) => B.light[n]));
  const dark = matchedMean(A.top5.map((n) => A.dark[n]), B.top5.map((n) => B.dark[n]));
  const chromatic = matchedMean(A.chromatic.map((n) => A.light[n]), B.chromatic.map((n) => B.light[n]));
  pairs.push({
    pair: `${A.arm} vs ${B.arm}`,
    top5: { [A.arm]: A.top5, [B.arm]: B.top5 },
    meanMatchedDe00Light: light.mean, matchingLight: light.matching,
    thresholdRegistered: 10.0, pass: light.mean >= 10.0,
    meanMatchedDe00DarkContext: dark.mean,
    chromaticOnlySecondary: { sets: { [A.arm]: A.chromatic, [B.arm]: B.chromatic }, meanMatchedDe00: chromatic.mean },
  });
}
const result = {
  metric: "E2(a) palette distance",
  interpretationDeclaredPreMeasurement: "threshold on light-mode token values; dark reported as context",
  usageRule: "references = occurrences of var(--<name>; ties alphabetical",
  arms: arms.map((a) => ({ arm: a.arm, top5: a.top5, usage: Object.fromEntries(a.top5.map((n) => [n, a.counts[n]])) })),
  pairs,
  allPairsPass: pairs.every((p) => p.pass),
};
console.log(JSON.stringify(result, null, 2));
