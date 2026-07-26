#!/usr/bin/env node
// prepare-blind-inputs.mjs — builds the per-judge blinded input sets for the
// E2 blind protocols (e: intent matching; b: layout class; c: visual motifs)
// and for the E1 rubric jurors. Deterministic seeded shuffles; seeds recorded
// in the output JSON (registered requirement: "seeds recorded").
//
// Shuffle: Fisher-Yates driven by mulberry32(seed). Seeds fixed here, in the
// committed script, before any judging: judge k (1..5) uses seed 202607260+k
// for the RENDER order and seed 202607360+k for the INTENT order; rubric juror
// k uses seed 202607460+k for arm presentation order.
//
// Usage: node prepare-blind-inputs.mjs <rendersDir> <outDir>
//   rendersDir: contains <arm>__<vp>__<mode>.png cells
//   outDir: writes judge-k/ and juror-k/ dirs with neutral-named copies +
//           blind-map.json (the seed record; committed AFTER judging so the
//           mapping is auditable, never shown to judges).
import { readdirSync, mkdirSync, copyFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const ARMS = ["trail-ledger", "status-board", "first-light"]; // fixed order: alphabetical of dir creation order in DIRECTIONS.md
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
const record = { armOrderBase: ARMS, judges: {}, jurors: {} };

for (let k = 1; k <= 5; k++) {
  // E2 blind judges: desktop-light full-page renders only, neutral names R1..R3
  const renderSeed = 202607260 + k, intentSeed = 202607360 + k;
  const renderOrder = shuffled(ARMS, renderSeed);
  const intentOrder = shuffled(ARMS, intentSeed);
  const dir = join(outDir, `judge-${k}`);
  mkdirSync(dir, { recursive: true });
  renderOrder.forEach((arm, i) => {
    const src = cells.find((c) => c.startsWith(`${arm}__desktop__light`));
    if (!src) throw new Error(`missing desktop-light cell for ${arm}`);
    copyFileSync(join(rendersDir, src), join(dir, `render-${i + 1}.png`));
  });
  record.judges[`judge-${k}`] = { renderSeed, intentSeed, renderOrder, intentOrder };

  // E1 rubric jurors: full matrix per arm, neutral names candidate-1..3
  const jurorSeed = 202607460 + k;
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
writeFileSync(join(outDir, "blind-map.json"), JSON.stringify(record, null, 2) + "\n");
console.log("blind inputs prepared:", JSON.stringify(Object.keys(record.judges)));
