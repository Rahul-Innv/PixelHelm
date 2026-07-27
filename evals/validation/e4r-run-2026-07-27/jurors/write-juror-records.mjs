#!/usr/bin/env node
// write-juror-records.mjs — write one pixelhelm/juror-record@1 per juror per SCORED
// candidate, THROUGH the shipped record machinery (validate-then-write, append-only).
// R1-UNSCORED candidates get no juror record; they are named in the run's unscored list
// (close-the-loop.md, as amended by the R1 repair).
//
// The record's inputTranscriptSha256 is the sha256 of that juror's committed verbatim
// transcript, which under R2 carries the floor outputs as well as the renders — so the
// hash binds the record to what the juror saw about the measured floor, not to the
// renders alone.
//
// Usage: node write-juror-records.mjs   (writes into <run>/.pixelhelm/jurors/)

import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const RUN = dirname(HERE);
const VALIDATION = dirname(RUN);
const REPO = resolve(VALIDATION, "..", "..");
const RECORDS = join(REPO, "plugins/pixelhelm-lite/skills/pixelhelm-loop/scripts/records.mjs");
const DATE = "2026-07-27";

const SETS = {
  "e1-utility": { surface: "E4R e1 utility external", rubric: "evals/validation/e1/PREREG-RUBRIC-utility.md" },
  "e3-saas": { surface: "E4R e3 saas external", rubric: "evals/validation/e3/PREREG-RUBRIC-saas-marketing.md" },
  "e3-commerce": { surface: "E4R e3 commerce external", rubric: "evals/validation/e3/PREREG-RUBRIC-commerce.md" },
  "e3-editorial": { surface: "E4R e3 editorial external", rubric: "evals/validation/e3/PREREG-RUBRIC-editorial.md" },
};

const read = (p) => readFileSync(p, "utf8");
const sha256 = (b) => createHash("sha256").update(b).digest("hex");

function parseJuror(text) {
  let t = text.trim();
  const fence = t.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
  if (fence) t = fence[1];
  const s = t.indexOf("{"), e = t.lastIndexOf("}");
  if (s > 0 || e < t.length - 1) t = t.slice(s, e + 1);
  return JSON.parse(t);
}

let written = 0, refused = 0;
const refusals = [];
for (const [set, cfg] of Object.entries(SETS)) {
  const setDir = join(HERE, set);
  const map = JSON.parse(read(join(setDir, "blind-map.json")));
  const panel = JSON.parse(read(join(setDir, "panel-results.json")));
  const unscored = new Set((panel.unscored || []).map((u) => u.candidate));

  for (let j = 1; j <= 5; j++) {
    const jid = `juror-${j}`;
    const info = map.jurors[jid];
    const tPath = join(setDir, `${jid}-transcript.md`);
    const tHash = sha256(readFileSync(tPath));
    if (tHash !== info.transcriptSha256) {
      console.error(`write-juror-records: transcript hash drift for ${set}/${jid} — refusing to write`);
      process.exit(2);
    }
    const raw = parseJuror(read(join(setDir, "raw", `${jid}.json`)));
    for (const [label, entry] of Object.entries(raw.candidates)) {
      const cand = info.labelToCandidate[label];
      if (unscored.has(cand)) continue; // R1: no juror record for an UNSCORED candidate
      const record = {
        schema: "pixelhelm/juror-record@1",
        date: DATE,
        project: "pixelhelm-validation-e4r",
        surface: cfg.surface,
        jurorId: jid,
        blindLabel: label,
        rubric: cfg.rubric,
        scores: entry.scores,
        rationales: entry.rationales,
        inputTranscriptSha256: tHash,
        shuffleSeed: info.jurorSeed,
      };
      const r = spawnSync("node", [RECORDS, "write", "juror-record", "--project", RUN, "--json"], {
        input: JSON.stringify(record), encoding: "utf8",
      });
      const out = r.stdout ? JSON.parse(r.stdout) : { valid: false, errors: [r.stderr] };
      if (r.status === 0 && out.valid) { written++; }
      else { refused++; refusals.push({ set, juror: jid, label, errors: out.errors }); }
    }
  }
}
console.log(`juror records: ${written} written, ${refused} refused`);
for (const f of refusals) console.error(`REFUSED ${f.set}/${f.juror}/${f.label}: ${JSON.stringify(f.errors)}`);
process.exit(refused ? 1 : 0);
