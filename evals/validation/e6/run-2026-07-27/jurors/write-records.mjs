#!/usr/bin/env node
// write-records.mjs — write pixelhelm/judge-verdict@1 and pixelhelm/run@1 for
// E6-A through the shipped records.mjs, which validates them. A verdict whose
// record does not validate did not happen.
//
// pixelhelm/signoff@1 is DELIBERATELY NOT WRITTEN: the owner has not spoken on
// this artifact, and sign-off happens at owner review.

import { readFileSync } from "node:fs";
import { dirname, resolve, join } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const HERE = dirname(fileURLToPath(import.meta.url));
const RUN = resolve(HERE, "..");
const PROJECT = join(RUN, "project");
const REPO = resolve(RUN, "../../../..");
const RECORDS = join(REPO, "plugins/pixelhelm-lite/skills/pixelhelm-loop/scripts/records.mjs");

const panel = JSON.parse(readFileSync(join(HERE, "panel-results.json"), "utf8"));
const blindMap = JSON.parse(readFileSync(join(HERE, "blind-map.json"), "utf8"));
const raw = {};
for (let n = 1; n <= 5; n++) raw[n] = JSON.parse(readFileSync(join(HERE, "raw", `juror-${n}.json`), "utf8"));

const ARMS = blindMap.armOrderBase;
const CRIT = Array.from({ length: 10 }, (_, i) => String(i + 1));
const median = (a) => { const s = [...a].sort((x, y) => x - y); const m = s.length >> 1; return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2; };

// Each juror's single score for a candidate = the median of that juror's own ten
// criterion scores for it. The REGISTERED aggregation (per-criterion median across
// jurors, then median of the ten) is recorded in aggregation.contract and is what
// the PASS bar was applied to; this per-juror reduction exists because the record
// schema stores one number per juror per candidate.
const perJuror = {};
for (const arm of ARMS) perJuror[arm] = [];
for (let n = 1; n <= 5; n++) {
  blindMap.jurors[`juror-${n}`].order.forEach((arm, i) => {
    const c = raw[n][`candidate-${i + 1}`];
    perJuror[arm].push(median(CRIT.map((k) => Number(c.scores[k]))));
  });
}

const verdict = {
  schema: "pixelhelm/judge-verdict@1",
  date: "2026-07-27",
  project: "pixelhelm-validation-e6a",
  surface: "e6a-motion-launch",
  mode: "new-design",
  pass: "deep",
  candidates: Object.fromEntries(ARMS.map((arm) => [arm, {
    label: arm,
    kind: "challenger",
    render: `evals/validation/e6/run-2026-07-27/project/renders/motion/${arm}__desktop__light.png (motion set) + renders/no-motion/${arm}__desktop__light.png (parity set); 8 cells per arm`,
  }])),
  registerFitPanel: {
    jurors: 5,
    scores: Object.fromEntries(ARMS.map((a) => [a, perJuror[a]])),
    medians: Object.fromEntries(ARMS.map((a) => [a, median(perJuror[a])])),
    nonOverlapping: true,
    modeFairness: "both-modes AND both motion modes: every arm judged on 4 light/dark x desktop/mobile MOTION cells and 4 matching NO-MOTION parity cells; criterion 1 scorable only from the parity cells",
  },
  lensScores: {},
  constraints: [
    { seat: "panel (advisory-only)", severity: "minor", finding: "three-counts scores lowest on criterion 7 (the motion IS the argument), median 6, the panel's floor value: four of five jurors read the clock/dial ornament as visualising a time metric rather than the bag-to-hull-to-water transformation the anti-spectacle test asks for." },
    { seat: "panel (advisory-only)", severity: "minor", finding: "crease-line and three-counts both draw the observation that a conventional spec table coexists with a declared break that said dimensions would run as drawing callouts and not as a spec table; the panel reads this as softening the declared break rather than contradicting it." },
    { seat: "run verification (machine)", severity: "minor", finding: "FALSE JUROR OBSERVATION, verified against the artifacts: jurors 1 and 5 independently reported a stray strip of nav-sized text near crease-line's footer and both spent it as a criterion-5 penalty. The DOM carries exactly one nav element (pageY 12) and direct crops of all four crease-line desktop captures show no such strip. The defect is not in the artifact." },
    { seat: "run verification (machine)", severity: "minor", finding: "FALSE JUROR OBSERVATION, verified against the artifacts: jurors 2 and 3 penalised crease-line for empty space beside steps 2 and 3. The drawing stage is position:sticky and was measured in a real viewport as visible beside BOTH steps; the emptiness is an artifact of the full-page screenshot the panel judges, not of the page." },
    { seat: "seat scope (standing)", severity: "major", finding: "A static capture cannot show choreography (design KB L-085). Criterion 7 turns on motion, and no juror could observe it; every criterion-7 score rests on the declared intent plus the runtime motion measurements supplied in the transcript, never on seen motion. Recorded before the panel ran, in GROUND.md." },
  ],
  aggregation: {
    contract: "PREREG-RUBRIC-motion-launch.md (sealed 2026-07-26) + PREREG-BRIEF-motion-launch.md Amendment A2; registered rule: per-criterion median of the 5 jurors, overall = median of the 10 criterion medians, no means and no weights. Applied by jurors/aggregate.mjs.",
    weightedScores: Object.fromEntries(ARMS.map((a) => [a, panel.arms[a].overallMedian])),
    guardOutcome: "R1 (E4 repair decision) enforced as a precondition: all three arms are floor-clean, so all three are scorable and none is UNSCORED. R2 enforced: gate outputs travelled with the renders and are covered by each juror record's inputTranscriptSha256. The standing advisory-only demotion is NOT lifted by this run.",
  },
  winner: panel.winner,
  registerSafeGrafts: [
    "under-the-bed's per-act diagram (a fresh drawing for each of the three steps) into crease-line, whose single sticky drawing leaves the other two steps without their own visual answer in a static reading.",
    "three-counts' explicit ornament disclaimer (the dial is an ornament and is not timing your visit) as a general pattern wherever an ornament could be mistaken for a live measurement.",
  ],
  rejectedGrafts: [
    "three-counts' jump-bar split into separate Specs and Price links into the other arms: it scored well on criterion 10 but the panel also read the same page as weakest on criterion 7, so the graft would import a navigation habit without the narrative that justified it.",
  ],
  rejectedDirections: [],
  ownerVerdict: null,
};

const runRecord = {
  schema: "pixelhelm/run@1",
  date: "2026-07-27",
  project: "pixelhelm-validation-e6a",
  surface: "e6a-motion-launch",
  intent: "E6-A: build the Vireo Fold motion-storytelling launch prototype under the full gate discipline and test whether it clears the sealed motion floor in BOTH motion and no-motion modes within the pre-registered performance budgets.",
  edition: "lite",
  workerModel: "claude-opus-5 (executing loop); the five blind jurors ran as separate fresh-context subagents on claude-sonnet-5",
  skillsFired: ["pixelhelm-choicegate", "pixelhelm-ground", "pixelhelm-generate", "pixelhelm-render", "pixelhelm-evaluate", "pixelhelm-judge"],
  engines: ["node", "python", "playwright (msedge channel; bundled chromium absent by design under PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1)", "axe-core"],
  council: { pass: "deep", seats: 0, registerJurors: 5 },
  iterations: 1,
  renders: { items: 3, cells: 24 },
  tokens: { subagentsMeasured: 651398, workflowsMeasured: 0, note: "measured-only: the sum of the five juror subagents' reported token usage; main-context usage is not observable in-session and is NOT estimated here" },
  wallClockMinutes: 63,
  outcome: "needs-human-review",
  notes: "Every shipped HARD gate exited 0 on all three arms; 12 of 12 planted lies fired in the mutant ritual; every pre-registered budget measured and met. signoff@1 deliberately NOT written: the owner has not spoken on this artifact. Panel scores are ADVISORY-ONLY under the standing E4 judging-seat demotion and no claim in this run rests on them. Two juror observations were verified FALSE against the artifacts and are recorded in the verdict constraints rather than repaired.",
};

for (const [kind, rec] of [["judge-verdict", verdict], ["run", runRecord]]) {
  const r = spawnSync(process.execPath, [RECORDS, "write", kind, "--project", PROJECT, "--json"],
    { input: JSON.stringify(rec), encoding: "utf8", timeout: 60000 });
  console.log(`${kind}: exit ${r.status}`);
  if (r.stdout.trim()) console.log(r.stdout.trim().slice(0, 400));
  if (r.status !== 0) { console.error(r.stderr); process.exitCode = 1; }
}
