#!/usr/bin/env node
// aggregate-external.mjs — aggregate the E4 external panels using the SAME
// registered aggregation as the internal panels (each sealed rubric sheet):
// per-criterion score = median of the 5 jurors; overall = median of the 10
// criterion medians. No means, no weights. Applied per candidate (3 real + 1
// plant) per set, with blind labels mapped back to candidate names via the
// committed blind-map. Also collects each juror's strict ranking (mapped to
// candidate names) verbatim from the raw outputs.
//
// Raw juror files are the jurors' VERBATIM final messages saved as
// <set>/raw/juror-k.json. If a juror wrapped the JSON in markdown fences, the
// fences are stripped for parsing only; the raw file is never rewritten.
//
// Usage: node aggregate-external.mjs   (writes <set>/panel-results.json x4)
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const SETS = ["e1-utility", "e3-saas", "e3-commerce", "e3-editorial"];
const CRITERIA = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10"];

const median = (arr) => {
  const s = [...arr].sort((a, b) => a - b);
  const mid = Math.floor(s.length / 2);
  return s.length % 2 ? s[mid] : (s[mid - 1] + s[mid]) / 2;
};

function parseRaw(text) {
  // Raw files are VERBATIM juror final messages; one juror prefixed a prose
  // line before the JSON. Parse from the first "{" to the last "}" without
  // rewriting the committed raw bytes.
  let t = text.trim();
  const fence = t.match(/^```(?:json)?\s*([\s\S]*?)\s*```$/);
  if (fence) t = fence[1];
  const start = t.indexOf("{"), end = t.lastIndexOf("}");
  if (start > 0 || end < t.length - 1) t = t.slice(start, end + 1);
  return JSON.parse(t);
}

for (const set of SETS) {
  const map = JSON.parse(readFileSync(join(HERE, set, "blind-map.json"), "utf8"));
  const candidates = map.candidateOrderBase; // 3 real + plant, canonical names
  const byCandidate = Object.fromEntries(candidates.map((c) => [c, Object.fromEntries(CRITERIA.map((k) => [k, []]))]));
  const jurorRankings = {};
  for (let k = 1; k <= 5; k++) {
    const raw = parseRaw(readFileSync(join(HERE, set, "raw", `juror-${k}.json`), "utf8"));
    const labelMap = map.jurors[`juror-${k}`].labelToCandidate;
    for (const [label, cand] of Object.entries(labelMap)) {
      const entry = raw.candidates[label];
      if (!entry) throw new Error(`${set} juror-${k}: missing ${label}`);
      for (const c of CRITERIA) {
        const v = entry.scores[c];
        if (!Number.isInteger(v) || v < 0 || v > 10) throw new Error(`${set} juror-${k} ${label} criterion ${c}: bad score ${v}`);
        byCandidate[cand][c].push(v);
      }
    }
    const ranking = raw.ranking.map((label) => labelMap[label]);
    if (new Set(ranking).size !== candidates.length) throw new Error(`${set} juror-${k}: ranking not a strict permutation`);
    jurorRankings[`juror-${k}`] = ranking;
  }
  const out = {
    _note: "External panel aggregation, registered rule (per-criterion median of 5 jurors; overall = median of the 10 criterion medians). Candidates include the E4 plant; the plant is excluded from tau/inflation by the sealed E4 sheet.",
    plant: map.plant,
    candidates: {},
    jurorRankings,
  };
  for (const cand of candidates) {
    const criterionMedians = Object.fromEntries(CRITERIA.map((c) => [c, median(byCandidate[cand][c])]));
    out.candidates[cand] = {
      criterionScores: byCandidate[cand],
      criterionMedians,
      overallMedian: median(Object.values(criterionMedians)),
      minCriterionMedian: Math.min(...Object.values(criterionMedians)),
    };
  }
  out.aggregateRanking = [...candidates].sort((a, b) => out.candidates[b].overallMedian - out.candidates[a].overallMedian)
    .map((c) => ({ candidate: c, overallMedian: out.candidates[c].overallMedian, plant: c === map.plant }));
  writeFileSync(join(HERE, set, "panel-results.json"), JSON.stringify(out, null, 2) + "\n");
  console.log(set, "->", out.aggregateRanking.map((r) => `${r.candidate}${r.plant ? "(plant)" : ""} ${r.overallMedian}`).join(" | "));
}
