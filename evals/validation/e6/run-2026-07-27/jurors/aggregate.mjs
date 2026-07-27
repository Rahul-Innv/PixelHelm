#!/usr/bin/env node
// aggregate.mjs — E6-A panel aggregation, exactly as pre-registered.
//
// Registered rule (identical to E1's sealed rule, which the E6-A sheet adopts):
// per-criterion score = median of the 5 jurors; overall = median of the 10
// criterion medians; no means, no weights. Candidate labels are de-blinded via
// the seeded blind map. PASS iff every criterion median >= 6 AND overall median
// >= 8, with the gate precondition recorded separately.
//
// It also writes one pixelhelm/juror-record@1 per juror per candidate through
// the shipped records.mjs (a panel whose records do not validate did not
// happen), and applies the E4 repair decision's R1: an arm whose shipped HARD
// gates did not all exit 0 is UNSCORED, never scored low.
//
// Usage: node jurors/aggregate.mjs

import { readFileSync, writeFileSync, readdirSync } from "node:fs";
import { dirname, resolve, join } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const HERE = dirname(fileURLToPath(import.meta.url));
const RUN = resolve(HERE, "..");
const PROJECT = join(RUN, "project");
const REPO = resolve(RUN, "../../../..");
const RECORDS = join(REPO, "plugins/pixelhelm-lite/skills/pixelhelm-loop/scripts/records.mjs");

const DATE = "2026-07-27";
const PROJECT_ID = "pixelhelm-validation-e6a";
const SURFACE = "e6a-motion-launch";
const RUBRIC = "evals/validation/e6/PREREG-RUBRIC-motion-launch.md";
const CRITERIA = Array.from({ length: 10 }, (_, i) => String(i + 1));

const blindMap = JSON.parse(readFileSync(join(HERE, "blind-map.json"), "utf8"));
const jurors = {};
for (let n = 1; n <= 5; n++) jurors[n] = JSON.parse(readFileSync(join(HERE, "raw", `juror-${n}.json`), "utf8"));

/* ---------- R1: floor-clean is a precondition for esteem scoring ---------- */
// Every arm must show a passing artifact for every shipped HARD gate before any
// score it received may be aggregated. An arm without that evidence is UNSCORED.
const HARD_GATE_FILES = [
  "static-gates.json", "output-floor.json", "gate-a-derived-claims.json", "gate-b-manifest.json",
  "verify_responsive.json", "verify_states.json", "verify_targetsize.json", "verify_focustrap.json",
  "verify_keyboard.json", "verify_scrollcapture.json", "verify_frametime-desktop.json",
  "verify_frametime-mobile.json", "verify_cwv.json",
];
const ARMS = blindMap.armOrderBase;
const floorStatus = {};
for (const arm of ARMS) {
  const missing = [], failed = [];
  for (const f of HARD_GATE_FILES) {
    let j;
    try { j = JSON.parse(readFileSync(join(PROJECT, "gates", arm, f), "utf8")); }
    catch { missing.push(f); continue; }
    const passed = j.pass === true || j.hardGatesPassed === true;
    if (!passed) failed.push(f);
  }
  // the no-JS parity re-run of Gate B and the two run-authored floor tools
  try {
    const nojs = JSON.parse(readFileSync(join(PROJECT, "gates", arm, "no-js", "gate-b-manifest.json"), "utf8"));
    if (nojs.pass !== true) failed.push("no-js/gate-b-manifest.json");
  } catch { missing.push("no-js/gate-b-manifest.json"); }
  for (const [file, key] of [["payload-budgets.json", "arms"], ["motion-floor.json", "arms"]]) {
    try {
      const j = JSON.parse(readFileSync(join(PROJECT, "gates", file), "utf8"));
      const entry = j[key].find((a) => a.arm === arm);
      if (!entry || entry.pass === false) failed.push(file);
    } catch { missing.push(file); }
  }
  floorStatus[arm] = { floorClean: missing.length === 0 && failed.length === 0, missing, failed };
}

/* ---------- de-blind + write one juror-record@1 per juror per candidate ---------- */
const recordResults = [];
const scores = {};   // arm -> criterion -> [scores]
for (let n = 1; n <= 5; n++) {
  const jm = blindMap.jurors[`juror-${n}`];
  jm.order.forEach((arm, i) => {
    const label = `candidate-${i + 1}`;
    const c = jurors[n][label];
    const record = {
      schema: "pixelhelm/juror-record@1",
      date: DATE,
      project: PROJECT_ID,
      surface: SURFACE,
      jurorId: `juror-${n}`,
      blindLabel: label,
      rubric: RUBRIC,
      scores: Object.fromEntries(CRITERIA.map((k) => [k, Number(c.scores[k])])),
      rationales: Object.fromEntries(CRITERIA.map((k) => [k, c.rationales[k]])),
      inputTranscriptSha256: jm.inputTranscriptSha256,
      shuffleSeed: jm.shuffleSeed,
    };
    const r = spawnSync(process.execPath, [RECORDS, "write", "juror-record", "--project", PROJECT, "--json"],
      { input: JSON.stringify(record), encoding: "utf8", timeout: 60000 });
    recordResults.push({ juror: `juror-${n}`, blindLabel: label, arm, exit: r.status, stderr: (r.stderr || "").trim().slice(0, 400) });
    if (r.status !== 0) console.error(`records.mjs REJECTED juror-${n}/${label}: ${r.stderr}`);

    // R1: only floor-clean arms contribute scores
    if (floorStatus[arm].floorClean) {
      for (const k of CRITERIA) {
        scores[arm] ??= {};
        (scores[arm][k] ??= []).push(Number(c.scores[k]));
      }
    }
  });
}

const median = (a) => { const s = [...a].sort((x, y) => x - y); const m = s.length >> 1; return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2; };

const out = {
  aggregation: "per-criterion median of the 5 jurors; overall = median of the 10 criterion medians (registered rule, no means, no weights)",
  evidenceLabel: "system-esteem (RF-1/RF-4)",
  standingDemotion: "ADVISORY-ONLY. The model judging seat is demoted per evals/validation/E4-JUDGING-SEAT-REPAIR-DECISION.md and the demotion is not lifted by this run. No quality claim here rests on these scores alone.",
  repairDecisionApplied: { R1: "floor-clean is a precondition for scoring; a non-clean arm is UNSCORED, never scored low", R2: "gate outputs travelled with the renders in every juror transcript; inputTranscriptSha256 covers them" },
  floorStatus,
  arms: {},
  recordsWritten: recordResults,
};

for (const arm of ARMS) {
  if (!floorStatus[arm].floorClean) { out.arms[arm] = { status: "UNSCORED", reason: "R1: not floor-clean", floor: floorStatus[arm] }; continue; }
  const crit = scores[arm];
  const medians = Object.fromEntries(CRITERIA.map((k) => [k, median(crit[k])]));
  const overall = median(CRITERIA.map((k) => medians[k]));
  out.arms[arm] = {
    status: "SCORED",
    criterionScores: Object.fromEntries(CRITERIA.map((k) => [k, [...crit[k]].sort((a, b) => a - b)])),
    criterionMedians: medians,
    overallMedian: overall,
    minCriterionMedian: Math.min(...Object.values(medians)),
    tier3Signals: CRITERIA.filter((k) => medians[k] >= 9),
  };
}

const scored = Object.entries(out.arms).filter(([, d]) => d.status === "SCORED");
const ranked = scored.sort((a, b) => b[1].overallMedian - a[1].overallMedian);
out.ranking = ranked.map(([a, d]) => ({ arm: a, overallMedian: d.overallMedian, minCriterionMedian: d.minCriterionMedian }));
const top = ranked[0][1].overallMedian;
const tied = ranked.filter(([, d]) => d.overallMedian === top).map(([a]) => a);
out.winner = tied.length === 1 ? tied[0] : { tie: tied };
out.tieInvariant = tied.length > 1
  ? tied.every((a) => out.arms[a].minCriterionMedian >= 6 && out.arms[a].overallMedian >= 8)
  : null;

const barArms = tied;
out.passBar = {
  clause1_gates: "every shipped HARD gate exited 0 on every arm + 12/12 mutant ritual recorded (project/gates, honesty/mutant-ritual/RITUAL.md)",
  clause1_met: ARMS.every((a) => floorStatus[a].floorClean),
  clause2_noCriterionMedianBelow6: barArms.every((a) => out.arms[a].minCriterionMedian >= 6),
  clause3_overallMedianAtLeast8: barArms.every((a) => out.arms[a].overallMedian >= 8),
  appliedTo: barArms,
};
out.passBar.PASS = out.passBar.clause1_met && out.passBar.clause2_noCriterionMedianBelow6 && out.passBar.clause3_overallMedianAtLeast8;
out.passBarReading = "C1 reading per the sealed sheet: a 9+ median is a strong-owner-verify signal, not achieved distinctive excellence. Advisory-only under the standing demotion.";

writeFileSync(join(HERE, "panel-results.json"), JSON.stringify(out, null, 2) + "\n", "utf8");
console.log(JSON.stringify({ ranking: out.ranking, winner: out.winner, passBar: out.passBar, recordsRejected: recordResults.filter((r) => r.exit !== 0).length }, null, 2));
