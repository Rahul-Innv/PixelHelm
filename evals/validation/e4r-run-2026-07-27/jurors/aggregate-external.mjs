#!/usr/bin/env node
// aggregate-external.mjs — de-blind the E4-R juror outputs and aggregate them under the
// registered rule, with the R1 precondition applied MECHANICALLY.
//
// Registered aggregation (unchanged from E1/E3/E4): per-criterion median of the 5 jurors;
// overall = median of the criterion medians. No means, no weights.
//
// R1 (PREREG-E4R-ADDENDUM.md (d)): a candidate whose committed Layer-1 battery shows a
// HARD FAIL is UNSCORED — excluded from the medians, from the aggregate ranking, and from
// every statistic. That exclusion is computed HERE from the committed gate records, never
// from juror discretion; whether each juror independently honored the precondition is
// recorded separately as r1Compliance and changes no number.
//
// Usage: node aggregate-external.mjs   (writes <set>/panel-results.json + r1-compliance.json)

import { existsSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const RUN = dirname(HERE);
const VALIDATION = dirname(RUN);

const SETS = {
  "e1-utility": { gateDir: "e1/run-2026-07-26/project/gates", surfaces: [""], real: ["trail-ledger", "status-board", "first-light"], plant: "stone-steps", plantSet: "e1-utility" },
  "e3-saas": { gateDir: "e3/run-2026-07-26-saas/project/gates", surfaces: [""], real: ["worked-invoice", "fair-quote", "driveway-to-paid"], plant: "job-sheet", plantSet: "e3-saas" },
  "e3-commerce": { gateDir: "e3/run-2026-07-26/project/gates", surfaces: ["-catalog", "-product"], real: ["packet-rack", "sowing-almanac", "seed-annual"], plant: "glass-house", plantSet: "e3-commerce" },
  "e3-editorial": { gateDir: "e3/run-2026-07-26-editorial/project/gates", surfaces: [""], real: ["almanac-rail", "weir-plates", "two-inks"], plant: "gauge-house", plantSet: "e3-editorial" },
};

const read = (p) => readFileSync(p, "utf8");
const median = (arr) => {
  const s = [...arr].sort((a, b) => a - b);
  const m = Math.floor(s.length / 2);
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
};

// ---------- R1: which candidates the committed floor battery eliminates ----------
const GATE_FILES = (surfaces) => {
  const names = ["static-gates.json", "token-contract.txt", "output-floor.json", "verify_responsive.json", "verify_states.json", "verify_targetsize.json"];
  for (const s of surfaces) {
    names.push(s ? `gate-a${s}.json` : "gate-a-derived-claims.json");
    names.push(s ? `gate-b${s}.json` : "gate-b-manifest.json");
    names.push(`verify_focustrap${s}.json`);
  }
  return names;
};

function floorFails(dir, surfaces) {
  const fails = [];
  for (const name of GATE_FILES(surfaces)) {
    const p = join(dir, name);
    if (!existsSync(p)) continue;
    if (name.endsWith(".txt")) { if (/FAIL/.test(read(p))) fails.push(name.replace(/\.txt$/, "")); continue; }
    const rec = JSON.parse(read(p));
    if (rec.pass === false || rec.hardGatesPassed === false) fails.push(rec.validator || name.replace(/\.json$/, ""));
  }
  return fails;
}

// ---------- parse a verbatim juror message ----------
function parseJuror(text) {
  let t = text.trim();
  const fence = t.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
  if (fence) t = fence[1];
  const start = t.indexOf("{"), end = t.lastIndexOf("}");
  if (start > 0 || end < t.length - 1) t = t.slice(start, end + 1);
  return JSON.parse(t);
}

const summary = {};
for (const [set, cfg] of Object.entries(SETS)) {
  const setDir = join(HERE, set);
  const map = JSON.parse(read(join(setDir, "blind-map.json")));
  const criteria = JSON.parse(read(join(setDir, "criteria.json"))).criteria.map(String);
  const candidates = [...cfg.real, cfg.plant];

  // mechanical R1 verdict per candidate
  const unscored = [];
  const floorEvidence = {};
  for (const cand of candidates) {
    const isPlant = cand === cfg.plant;
    const dir = isPlant ? join(RUN, "plants", cfg.plantSet, "gates") : join(VALIDATION, cfg.gateDir, cand);
    const fails = floorFails(dir, cfg.surfaces);
    floorEvidence[cand] = { gateDir: dir.replace(/\\/g, "/").split("/evals/")[1] ? "evals/" + dir.replace(/\\/g, "/").split("/evals/")[1] : dir, hardFails: fails };
    if (fails.length) unscored.push({ candidate: cand, gate: fails.join(", "), why: "committed Layer-1 battery shows a hard gate FAIL; UNSCORED under R1, excluded from every ranking and statistic" });
  }
  const scored = candidates.filter((c) => !unscored.some((u) => u.candidate === c));

  // collect juror scores
  const perCandidate = {};
  for (const c of scored) perCandidate[c] = Object.fromEntries(criteria.map((k) => [k, []]));
  const compliance = [];
  for (let j = 1; j <= 5; j++) {
    const jid = `juror-${j}`;
    const rawPath = join(setDir, "raw", `${jid}.json`);
    if (!existsSync(rawPath)) { console.error(`aggregate: missing ${rawPath}`); process.exit(2); }
    const raw = parseJuror(read(rawPath));
    const l2c = map.jurors[jid].labelToCandidate;
    const declaredUnscored = [], scoredFloorFailing = [], unscoredCleanCandidate = [];
    for (const [label, entry] of Object.entries(raw.candidates || {})) {
      const cand = l2c[label];
      if (!cand) { console.error(`aggregate: ${set}/${jid} returned unknown label ${label}`); process.exit(2); }
      const jurorSaysUnscored = entry.unscored === true;
      const floorSaysUnscored = unscored.some((u) => u.candidate === cand);
      if (jurorSaysUnscored) declaredUnscored.push({ label, candidate: cand, failingGate: entry.failingGate ?? null });
      if (!jurorSaysUnscored && floorSaysUnscored) scoredFloorFailing.push({ label, candidate: cand });
      if (jurorSaysUnscored && !floorSaysUnscored) unscoredCleanCandidate.push({ label, candidate: cand });
      if (floorSaysUnscored) continue; // R1: never enters a statistic, whatever the juror said
      for (const k of criteria) {
        const v = entry.scores?.[k];
        if (!Number.isInteger(v)) { console.error(`aggregate: ${set}/${jid}/${label} criterion ${k} is not an integer score`); process.exit(2); }
        perCandidate[cand][k].push(v);
      }
    }
    compliance.push({ juror: jid, declaredUnscored, scoredFloorFailing, unscoredCleanCandidate, ranking: raw.ranking || [] });
  }

  // medians
  const out = {};
  for (const c of scored) {
    const criterionMedians = Object.fromEntries(criteria.map((k) => {
      if (perCandidate[c][k].length !== 5) { console.error(`aggregate: ${set}/${c} criterion ${k} has ${perCandidate[c][k].length} score(s), want 5`); process.exit(2); }
      return [k, median(perCandidate[c][k])];
    }));
    out[c] = {
      criterionScores: perCandidate[c],
      criterionMedians,
      overallMedian: median(Object.values(criterionMedians)),
      minCriterionMedian: Math.min(...Object.values(criterionMedians)),
    };
  }
  const aggregateRanking = scored
    .map((c) => ({ candidate: c, overallMedian: out[c].overallMedian }))
    .sort((a, b) => b.overallMedian - a.overallMedian || a.candidate.localeCompare(b.candidate));

  const results = {
    aggregation: "per-criterion median of 5 jurors; overall = median of the criterion medians (registered; unchanged from E1/E3/E4)",
    set,
    r1: "floor-clean is a precondition for scoring; UNSCORED candidates are excluded from the medians, the ranking, and every statistic (PREREG-E4R-ADDENDUM.md (d))",
    unscored,
    floorEvidence,
    candidates: out,
    aggregateRanking,
  };
  writeFileSync(join(setDir, "panel-results.json"), JSON.stringify(results, null, 2) + "\n");
  writeFileSync(join(setDir, "r1-compliance.json"), JSON.stringify({
    set,
    _note: "Whether each juror independently honored the R1 precondition when handed the floor outputs (R2). Recorded evidence about the SEAT; it changes no number, because the exclusion above is mechanical.",
    floorUnscored: unscored.map((u) => u.candidate),
    perJuror: compliance,
  }, null, 2) + "\n");

  summary[set] = { unscored: unscored.map((u) => `${u.candidate} (${u.gate})`), ranking: aggregateRanking, jurorsHonoringR1: compliance.filter((c) => c.scoredFloorFailing.length === 0 && c.unscoredCleanCandidate.length === 0).length };
  console.log(`${set}: unscored ${JSON.stringify(summary[set].unscored)} | jurors honoring R1: ${summary[set].jurorsHonoringR1}/5`);
}
writeFileSync(join(HERE, "aggregate-summary.json"), JSON.stringify(summary, null, 2) + "\n");
