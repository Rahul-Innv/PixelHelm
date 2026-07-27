#!/usr/bin/env node
// write-juror-records.mjs — write ONE pixelhelm/juror-record@1 per juror per
// candidate (4 sets x 5 jurors x 4 candidates = 80 records) via the record
// machinery in src/skills/pixelhelm-loop/scripts/records.mjs (E1 critique
// finding 1 closure; required by the sealed E4 sheet (a)). Each record carries
// the sha256 of that juror's committed VERBATIM input transcript and the
// juror's recorded shuffle seed. The writer validates and REFUSES invalid
// records; this script surfaces any refusal loudly and never edits juror text.
//
// Records are keyed by BLIND LABEL (what the juror actually scored); the
// committed blind-map carries the label-to-candidate mapping.
//
// Usage: node write-juror-records.mjs   (idempotent only in the sense that
// existing archives are refused by the writer; a clean run writes 80 records)
import { readFileSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const E4 = dirname(HERE);
const REPO = join(E4, "..", "..", "..");
const RECORDS = join(REPO, "src", "skills", "pixelhelm-loop", "scripts", "records.mjs");
const SETS = {
  "e1-utility": "evals/validation/e1/PREREG-RUBRIC-utility.md",
  "e3-saas": "evals/validation/e3/PREREG-RUBRIC-saas-marketing.md",
  "e3-commerce": "evals/validation/e3/PREREG-RUBRIC-commerce.md",
  "e3-editorial": "evals/validation/e3/PREREG-RUBRIC-editorial.md",
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

let written = 0, refused = 0;
for (const [set, rubric] of Object.entries(SETS)) {
  const map = JSON.parse(readFileSync(join(HERE, set, "blind-map.json"), "utf8"));
  for (let k = 1; k <= 5; k++) {
    const jinfo = map.jurors[`juror-${k}`];
    const raw = parseRaw(readFileSync(join(HERE, set, "raw", `juror-${k}.json`), "utf8"));
    for (const label of Object.keys(jinfo.labelToCandidate)) {
      const entry = raw.candidates[label];
      const record = {
        schema: "pixelhelm/juror-record@1",
        date: "2026-07-26",
        project: "pixelhelm-validation-e4",
        surface: `${set}-external`,
        jurorId: `juror-${k}`,
        blindLabel: label,
        rubric,
        scores: entry.scores,
        rationales: entry.rationales,
        inputTranscriptSha256: jinfo.transcriptSha256,
        shuffleSeed: jinfo.jurorSeed,
      };
      try {
        execFileSync("node", [RECORDS, "write", "juror-record", "--project", E4], {
          input: JSON.stringify(record), encoding: "utf8",
        });
        written++;
      } catch (e) {
        refused++;
        console.error(`REFUSED ${set} juror-${k} ${label}:`);
        console.error(String(e.stderr || e.stdout || e.message).trim());
      }
    }
  }
}
console.log(`juror-records written: ${written}, refused: ${refused}`);
process.exit(refused ? 1 : 0);
