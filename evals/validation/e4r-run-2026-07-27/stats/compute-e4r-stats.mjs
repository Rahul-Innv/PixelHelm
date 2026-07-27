#!/usr/bin/env node
// compute-e4r-stats.mjs — the E4 pre-registered statistics, UNCHANGED, recomputed for the
// E4-R re-run. Sealed sources: evals/validation/PREREG-E4-CALIBRATION.md (b)/(c) carried
// verbatim into evals/validation/PREREG-E4R-ADDENDUM.md (b)/(c)/(d).
//
// AGREEMENT (tau): Kendall's tau-b between the internal panels' candidate rankings (the
//   committed internal panel-results.json overall medians; ties intact) and the external
//   panels' aggregate rankings (external per-candidate overall medians under the same
//   registered aggregation), across all ranked pairs POOLED over the four judged sets,
//   REAL candidates only (plants excluded): 3 pairs per set x 4 sets = 12 ranked pairs.
//   tau_b = (C - D) / sqrt((n0 - n1) * (n0 - n2)).  Threshold: tau >= 0.5.
//
// INFLATION: mean over the 12 real candidates (pooled) of
//   (internal overall median - external overall median). Bound: |infl| <= 1.5.
//
// PLANT CRITERION (sealed wording): "every planted flaw is caught — the plant may not win
//   any set, and at least one juror (or the floor battery, which runs on plants too) must
//   surface its defect class." Under the R1 repair the plant is UNSCORED by the committed
//   floor battery and is therefore absent from the external aggregate ranking, so it wins
//   no set BY CONSTRUCTION of the repair. This script records that honestly: it reports
//   the battery's own hard-fail list per plant (the "or the floor battery" limb of the
//   sealed disjunction), and separately reports how many jurors independently honored the
//   precondition when handed the failing gate outputs (R2). The second number is evidence
//   about the seat; it is NOT used to decide the criterion.
//
// Every input is a committed artifact, cited by repo-relative path in the output.
// Dependency-free, network-free, clock-free.
//
// Usage: node compute-e4r-stats.mjs   (writes stats-results.json next to itself)
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const RUN = dirname(HERE);
const VALIDATION = dirname(RUN);
const RUNDIR = "e4r-run-2026-07-27";

const SETS = {
  "e1-utility": {
    internalPanel: "e1/run-2026-07-26/jurors/panel-results.json",
    real: ["trail-ledger", "status-board", "first-light"],
    plant: "stone-steps",
    registeredClass: "reflow: page-level horizontal overflow at narrow width (WCAG 2.2 1.4.10)",
    plantGates: `${RUNDIR}/plants/e1-utility/gates/battery.json`,
  },
  "e3-saas": {
    internalPanel: "e3/run-2026-07-26-saas/jurors/panel-results.json",
    real: ["worked-invoice", "fair-quote", "driveway-to-paid"],
    plant: "job-sheet",
    registeredClass: "structural output floor: no main landmark, heading-order skip, styled heading impostors",
    plantGates: `${RUNDIR}/plants/e3-saas/gates/battery.json`,
  },
  "e3-commerce": {
    internalPanel: "e3/run-2026-07-26/jurors/panel-results.json",
    real: ["packet-rack", "sowing-almanac", "seed-annual"],
    plant: "glass-house",
    registeredClass: "keyboard trap: modal dialog that Escape does not close and that never restores focus (WCAG 2.1.2)",
    plantGates: `${RUNDIR}/plants/e3-commerce/gates/battery.json`,
  },
  "e3-editorial": {
    internalPanel: "e3/run-2026-07-26-editorial/jurors/panel-results.json",
    real: ["almanac-rail", "weir-plates", "two-inks"],
    plant: "gauge-house",
    registeredClass: "real-render interactive STATE contrast below threshold in hover and focus (WCAG 1.4.3 / 1.4.11)",
    plantGates: `${RUNDIR}/plants/e3-editorial/gates/battery.json`,
  },
};

const load = (p) => JSON.parse(readFileSync(join(VALIDATION, p), "utf8"));
const sgn = (x) => (x > 0 ? 1 : x < 0 ? -1 : 0);

let C = 0, D = 0, n1 = 0, n2 = 0, n0 = 0;
const inflationTerms = [];
const perSet = {};

for (const [set, cfg] of Object.entries(SETS)) {
  const internal = load(cfg.internalPanel);
  const external = load(`${RUNDIR}/jurors/${set}/panel-results.json`);
  const compliance = load(`${RUNDIR}/jurors/${set}/r1-compliance.json`);
  const battery = load(cfg.plantGates);

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
      pairs.push({
        pair: `${a} vs ${b}`, internalDiff: xi, externalDiff: yi,
        class: sx === 0 && sy === 0 ? "tied-both" : sx === 0 ? "tied-internal" : sy === 0 ? "tied-external" : sx === sy ? "concordant" : "discordant",
      });
    }
  }

  const infl = cfg.real.map((c) => ({
    candidate: c,
    internal: internal.arms[c].overallMedian,
    external: external.candidates[c].overallMedian,
    term: internal.arms[c].overallMedian - external.candidates[c].overallMedian,
  }));
  inflationTerms.push(...infl.map((t) => t.term));

  // plant checks, under R1
  const unscoredEntry = (external.unscored || []).find((u) => u.candidate === cfg.plant) || null;
  const rankedIds = external.aggregateRanking.map((r) => r.candidate);
  const plantInRanking = rankedIds.includes(cfg.plant);
  const jurorsHonoring = compliance.perJuror.filter((j) => j.scoredFloorFailing.length === 0 && j.unscoredCleanCandidate.length === 0).length;
  const jurorsNamingGate = compliance.perJuror.filter((j) => j.declaredUnscored.some((d) => d.candidate === cfg.plant && d.failingGate)).length;

  perSet[set] = {
    internalSource: `evals/validation/${cfg.internalPanel}`,
    externalSource: `evals/validation/${RUNDIR}/jurors/${set}/panel-results.json`,
    pairs,
    inflationTerms: infl,
    plant: {
      name: cfg.plant,
      registeredDefectClass: cfg.registeredClass,
      floorBattery: {
        artifact: `evals/validation/${cfg.plantGates}`,
        hardFails: battery.hardFails,
        caughtByFloor: battery.hardFails.length > 0,
      },
      r1: {
        unscored: Boolean(unscoredEntry),
        gate: unscoredEntry ? unscoredEntry.gate : null,
        inExternalRanking: plantInRanking,
        winsSet: plantInRanking && external.aggregateRanking[0].candidate === cfg.plant,
        tiedForTop: plantInRanking && external.aggregateRanking[0].overallMedian === (external.aggregateRanking.find((r) => r.candidate === cfg.plant) || {}).overallMedian,
      },
      seatEvidence: {
        _note: "R2 evidence about the judging seat: whether each juror, handed the failing gate outputs, independently refused to score the candidate. Reported, never used to decide the criterion.",
        jurorsHonoringPrecondition: `${jurorsHonoring}/5`,
        jurorsNamingTheFailingGate: `${jurorsNamingGate}/5`,
      },
      caught: battery.hardFails.length > 0 && !plantInRanking,
    },
    externalAggregateRanking: external.aggregateRanking,
  };
}

const denom = Math.sqrt((n0 - n1) * (n0 - n2));
const tauB = denom === 0 ? null : (C - D) / denom;
const inflation = inflationTerms.reduce((a, b) => a + b, 0) / inflationTerms.length;

const results = {
  _script: `evals/validation/${RUNDIR}/stats/compute-e4r-stats.mjs`,
  _protocol: [
    "evals/validation/PREREG-E4-CALIBRATION.md (sealed, untouched)",
    "evals/validation/PREREG-E4R-ADDENDUM.md (sealed before any plant was authored)",
  ],
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
    anyPlantWins: Object.values(perSet).some((s) => s.plant.r1.winsSet),
    anyPlantTiedForTop: Object.values(perSet).some((s) => s.plant.r1.tiedForTop),
  },
  perSet,
};
results.verdicts.overallSuccess =
  results.verdicts.tauPass && results.verdicts.inflationPass && results.verdicts.everyPlantCaught && !results.verdicts.anyPlantWins;

writeFileSync(join(HERE, "stats-results.json"), JSON.stringify(results, null, 2) + "\n");
console.log(JSON.stringify({ tauB, inflation, verdicts: results.verdicts }, null, 2));
