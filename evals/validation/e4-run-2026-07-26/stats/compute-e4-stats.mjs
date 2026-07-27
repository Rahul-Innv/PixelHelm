#!/usr/bin/env node
// compute-e4-stats.mjs — the E4 pre-registered statistics, computed EXACTLY as
// sealed in evals/validation/PREREG-E4-CALIBRATION.md (b)/(c):
//
// AGREEMENT (tau): Kendall's tau-b between the internal panels' candidate
//   rankings (the committed internal panel-results.json overall medians; ties
//   intact) and the external panels' aggregate rankings (external per-candidate
//   overall medians under the same registered aggregation), computed across all
//   ranked pairs POOLED over the four judged sets, REAL candidates only (plants
//   excluded): 3 pairs per set x 4 sets = 12 ranked pairs. Ties are handled by
//   the tie-aware tau-b: with C = concordant pairs, D = discordant pairs,
//   n0 = 12, n1 = pairs tied on the internal side, n2 = pairs tied on the
//   external side, tau_b = (C - D) / sqrt((n0 - n1) * (n0 - n2)).
//   Threshold: tau >= 0.5.
//
// INFLATION: mean over the 12 real candidates (pooled) of
//   (internal overall median - external overall median). Bound: |infl| <= 1.5.
//
// PLANT CRITERION: every plant caught — (i) the plant wins no set on the
//   external aggregate ranking (strictly-top OR tied-top are both reported;
//   the sealed falsifier "any planted flaw wins" is evaluated on strictly-top,
//   with tied-top reported explicitly if it occurs), and (ii) its defect class
//   is surfaced by at least one juror or by the floor battery (battery results
//   read from the committed E4 plant gate outputs; juror surfacing is reported
//   from rationale text as supporting evidence).
//
// Every input is a committed artifact, cited by repo-relative path below.
// Dependency-free, network-free, clock-free.
//
// Usage: node compute-e4-stats.mjs   (writes stats-results.json next to itself)
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const E4 = dirname(HERE);
const VALIDATION = join(E4, "..");

const SETS = {
  "e1-utility": {
    internalPanel: "e1/run-2026-07-26/jurors/panel-results.json",
    real: ["trail-ledger", "status-board", "first-light"],
    plant: "switchback",
    plantFloorEvidence: {
      caught: true,
      by: ["token-contract AA recompute FAIL (light muted on paper 3.12 < 4.5)", "static-gates hard contrast FAIL", "render axe: 2 serious color-contrast"],
      artifacts: [
        "evals/validation/e4-run-2026-07-26/plants/e1-utility/gates/token-contract.txt",
        "evals/validation/e4-run-2026-07-26/plants/e1-utility/gates/static-gates.json",
        "evals/validation/e4-run-2026-07-26/plants/e1-utility/renders/render.json",
      ],
    },
    jurorDefectPattern: /contrast|legib|faint|too light|hard to read|washed|muted metadata|low-contrast/i,
  },
  "e3-saas": {
    internalPanel: "e3/run-2026-07-26-saas/jurors/panel-results.json",
    real: ["worked-invoice", "driveway-to-paid", "fair-quote"],
    plant: "day-rate",
    plantFloorEvidence: {
      caught: true,
      by: ["gate-a derived-claims FABRICATION: invented percent 98% not in data or derived constants (both modes)"],
      artifacts: ["evals/validation/e4-run-2026-07-26/plants/e3-saas/gates/gate-a-derived-claims.json"],
    },
    jurorDefectPattern: /98\s?%|unsubstantiat|unverifiab|unsupported (stat|claim|figure|number)|no (source|basis)|invented|fabricat|cannot (be )?(verify|verified|trace)/i,
  },
  "e3-commerce": {
    internalPanel: "e3/run-2026-07-26/jurors/panel-results.json",
    real: ["seed-annual", "packet-rack", "sowing-almanac"],
    plant: "potting-bench",
    plantFloorEvidence: {
      caught: true,
      by: ["verify_targetsize FAIL: 6 catalog + 1 product-page targets under the 24px minimum (WCAG 2.2 2.5.8), spacing exception defeated"],
      artifacts: ["evals/validation/e4-run-2026-07-26/plants/e3-commerce/gates/verify_targetsize.json"],
    },
    jurorDefectPattern: /target|too small|tiny (button|control)|24\s?px|tap|touch|fiddly|small (button|control|stepper)|older (reader|user)s? .*small/i,
  },
  "e3-editorial": {
    internalPanel: "e3/run-2026-07-26-editorial/jurors/panel-results.json",
    real: ["weir-plates", "two-inks", "almanac-rail"],
    plant: "high-water",
    plantFloorEvidence: {
      caught: true,
      by: ["gate-a VERDICT: un-negated VERIFIED inside the 2019 block (both modes)", "gate-b MISSING: required 'unverified' label absent from the 2019 block (both modes)"],
      artifacts: [
        "evals/validation/e4-run-2026-07-26/plants/e3-editorial/gates/gate-a-derived-claims.json",
        "evals/validation/e4-run-2026-07-26/plants/e3-editorial/gates/gate-b-manifest.json",
      ],
    },
    jurorDefectPattern: /unverified|verified|outlier|132\s?mm|corroborat|review status|sensor spike|record .*(label|flag|caveat)/i,
  },
};

const load = (p) => JSON.parse(readFileSync(join(VALIDATION, p), "utf8"));
const sgn = (x) => (x > 0 ? 1 : x < 0 ? -1 : 0);

let C = 0, D = 0, n1 = 0, n2 = 0, n0 = 0;
const inflationTerms = [];
const perSet = {};

for (const [set, cfg] of Object.entries(SETS)) {
  const internal = load(cfg.internalPanel);
  const external = load(`e4-run-2026-07-26/jurors/${set}/panel-results.json`);
  const pairs = [];
  for (let i = 0; i < cfg.real.length; i++) {
    for (let j = i + 1; j < cfg.real.length; j++) {
      const a = cfg.real[i], b = cfg.real[j];
      const xi = internal.arms[a].overallMedian - internal.arms[b].overallMedian;
      const yi = external.candidates[a].overallMedian - external.candidates[b].overallMedian;
      n0++;
      const sx = sgn(xi), sy = sgn(yi);
      if (sx === 0) n1++;
      if (sy === 0) n2++;
      if (sx !== 0 && sy !== 0) { if (sx === sy) C++; else D++; }
      pairs.push({ pair: `${a} vs ${b}`, internalDiff: xi, externalDiff: yi, class: sx === 0 && sy === 0 ? "tied-both" : sx === 0 ? "tied-internal" : sy === 0 ? "tied-external" : sx === sy ? "concordant" : "discordant" });
    }
  }
  const infl = cfg.real.map((c) => ({ candidate: c, internal: internal.arms[c].overallMedian, external: external.candidates[c].overallMedian, term: internal.arms[c].overallMedian - external.candidates[c].overallMedian }));
  inflationTerms.push(...infl.map((t) => t.term));

  // plant checks
  const ranking = external.aggregateRanking;
  const top = ranking[0];
  const plantEntry = ranking.find((r) => r.candidate === cfg.plant);
  const topMedian = top.overallMedian;
  const plantStrictWin = plantEntry.overallMedian === topMedian && ranking.filter((r) => r.overallMedian === topMedian).length === 1 && top.candidate === cfg.plant;
  const plantTiedTop = plantEntry.overallMedian === topMedian && !plantStrictWin;

  // juror surfacing: scan committed rationales for the plant's blind label per juror
  const map = load(`e4-run-2026-07-26/jurors/${set}/blind-map.json`);
  const surfaced = [];
  for (let k = 1; k <= 5; k++) {
    const jinfo = map.jurors[`juror-${k}`];
    const label = Object.entries(jinfo.labelToCandidate).find(([, c]) => c === cfg.plant)[0];
    let text = readFileSync(join(VALIDATION, `e4-run-2026-07-26/jurors/${set}/raw/juror-${k}.json`), "utf8").trim();
    const fence = text.match(/^```(?:json)?\s*([\s\S]*?)\s*```$/);
    if (fence) text = fence[1];
    // raw files are verbatim juror messages; tolerate leading prose before the JSON
    const start = text.indexOf("{"), end = text.lastIndexOf("}");
    if (start > 0 || end < text.length - 1) text = text.slice(start, end + 1);
    const raw = JSON.parse(text);
    const rats = Object.values(raw.candidates[label].rationales).join(" ");
    if (cfg.jurorDefectPattern.test(rats)) {
      const hits = Object.entries(raw.candidates[label].rationales).filter(([, v]) => cfg.jurorDefectPattern.test(v)).map(([crit, v]) => ({ juror: `juror-${k}`, criterion: crit, rationale: v }));
      surfaced.push(...hits);
    }
  }

  perSet[set] = {
    internalSource: `evals/validation/${cfg.internalPanel}`,
    externalSource: `evals/validation/e4-run-2026-07-26/jurors/${set}/panel-results.json`,
    pairs,
    inflationTerms: infl,
    plant: {
      name: cfg.plant,
      externalOverallMedian: plantEntry.overallMedian,
      externalAggregateRanking: ranking,
      strictlyWinsSet: plantStrictWin,
      tiedForTop: plantTiedTop,
      floorBattery: cfg.plantFloorEvidence,
      jurorSurfacing: { pattern: String(cfg.jurorDefectPattern), hits: surfaced },
      caught: (!plantStrictWin) && (cfg.plantFloorEvidence.caught || surfaced.length > 0),
    },
  };
}

const denom = Math.sqrt((n0 - n1) * (n0 - n2));
const tauB = denom === 0 ? null : (C - D) / denom;
const inflation = inflationTerms.reduce((a, b) => a + b, 0) / inflationTerms.length;

const results = {
  _script: "evals/validation/e4-run-2026-07-26/stats/compute-e4-stats.mjs",
  registered: {
    tauThreshold: ">= 0.5",
    inflationBound: "|inflation| <= 1.5",
    plantCriterion: "every plant caught: wins no set AND defect class surfaced by >=1 juror or the floor battery",
  },
  tau: { n0, concordant: C, discordant: D, tiedInternal_n1: n1, tiedExternal_n2: n2, formula: "(C - D) / sqrt((n0 - n1) * (n0 - n2))", tauB },
  inflation: { terms: inflationTerms.length, mean: inflation },
  verdicts: {
    tauPass: tauB !== null && tauB >= 0.5,
    inflationPass: Math.abs(inflation) <= 1.5,
    everyPlantCaught: Object.values(perSet).every((s) => s.plant.caught),
    anyPlantStrictlyWins: Object.values(perSet).some((s) => s.plant.strictlyWinsSet),
    anyPlantTiedForTop: Object.values(perSet).some((s) => s.plant.tiedForTop),
  },
  perSet,
};
results.verdicts.overallSuccess = results.verdicts.tauPass && results.verdicts.inflationPass && results.verdicts.everyPlantCaught && !results.verdicts.anyPlantStrictlyWins;

writeFileSync(join(HERE, "stats-results.json"), JSON.stringify(results, null, 2) + "\n");
console.log(JSON.stringify({ tauB, inflation, verdicts: results.verdicts }, null, 2));
