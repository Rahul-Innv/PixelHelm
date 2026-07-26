#!/usr/bin/env node
// prepare-blind-inputs.mjs — builds the per-juror blinded input sets for the
// E3(saas) rubric panel. Deterministic seeded shuffles; seeds recorded in the
// output JSON (registered requirement: "seeds recorded"). E3 has no E2 blind
// judges (divergence measurement was E1-only): jurors only, seeds 202607560+k
// (distinct from E1's ranges by construction).
//
// Shuffle: Fisher-Yates driven by mulberry32(seed), identical to E1's
// committed machinery. Juror k (1..5) uses seed 202607560+k for arm
// presentation order; the neutral-named full render matrix per juror is
// written OUTSIDE the repo (session scratchpad) — only blind-map.json is
// committed, AFTER judging, so the mapping is auditable but never shown.
//
// Usage: node prepare-blind-inputs.mjs <rendersDir> <outDir>
import { readdirSync, mkdirSync, copyFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ARMS = ["worked-invoice", "driveway-to-paid", "fair-quote"]; // fixed order: DIRECTIONS.md order
function mulberry32(a) {
  return function () {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
function shuffled(arr, seed) {
  const rng = mulberry32(seed), out = [...arr];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

const [rendersDir, outDir] = process.argv.slice(2);
if (!rendersDir || !outDir) { console.error("usage: node prepare-blind-inputs.mjs <rendersDir> <outDir>"); process.exit(2); }
const cells = readdirSync(rendersDir).filter((f) => f.endsWith(".png"));
const record = { armOrderBase: ARMS, jurors: {} };

for (let k = 1; k <= 5; k++) {
  const jurorSeed = 202607560 + k;
  const armOrder = shuffled(ARMS, jurorSeed);
  const jdir = join(outDir, `juror-${k}`);
  mkdirSync(jdir, { recursive: true });
  armOrder.forEach((arm, i) => {
    for (const cell of cells.filter((c) => c.startsWith(`${arm}__`))) {
      copyFileSync(join(rendersDir, cell), join(jdir, cell.replace(`${arm}__`, `candidate-${i + 1}__`)));
    }
  });
  record.jurors[`juror-${k}`] = { jurorSeed, armOrder };
}
const HERE = dirname(fileURLToPath(import.meta.url));
writeFileSync(join(HERE, "blind-map.json"), JSON.stringify(record, null, 2) + "\n");
console.log("blind juror inputs prepared:", JSON.stringify(Object.keys(record.jurors)));
