#!/usr/bin/env node
// prepare-blind-inputs.mjs — builds the per-juror blinded input sets and VERBATIM
// input transcripts for the four E4 external panels (sealed E4 sheet (a); E1
// critique findings 1 & 4 evidence bar).
//
// Per set: 4 candidates (the 3 real arms in the set's committed base order, plus
// the E4 plant appended last) are Fisher-Yates shuffled per juror with recorded
// seeds (mulberry32, identical to the committed E1/E3 machinery). The i-th
// candidate in a juror's shuffled order is presented as "candidate-i". Neutral-
// named render copies are written to jurors-blind/<set>/juror-k/ at the REPO
// ROOT (untracked, never committed: they are byte-identical duplicates of
// committed renders); blind-manifest.json binds every neutral file to its
// committed source by sha256 so what each juror saw is fully determined by
// committed bytes.
//
// The transcript committed per juror is the EXACT prompt text the juror
// receives: assembly wrapper + tier definitions verbatim + the set's sealed
// rubric sheet verbatim + the neutral candidate file list + output contract.
// Nothing else. No PixelHelm docs, no gate outputs, no internal scores.
//
// E4 juror seeds: 2026076<set><juror> — e1 202607611..15, saas 202607621..25,
// commerce 202607631..35, editorial 202607641..45 (disjoint from every
// committed prior range: ...461-465, ...561-565).
//
// Usage: node prepare-blind-inputs.mjs   (idempotent; rewrites everything)
import { readdirSync, readFileSync, mkdirSync, copyFileSync, writeFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));           // .../e4-run-2026-07-26/jurors
const E4 = dirname(HERE);
const VALIDATION = dirname(E4);
const REPO = join(VALIDATION, "..", "..");
const BLIND_ROOT = join(REPO, "jurors-blind");

const SETS = {
  "e1-utility": {
    baseOrder: ["trail-ledger", "status-board", "first-light"],
    realRenders: join(VALIDATION, "e1", "run-2026-07-26", "project", "renders"),
    realRendersRepo: "evals/validation/e1/run-2026-07-26/project/renders",
    plant: "switchback",
    plantRenders: join(E4, "plants", "e1-utility", "renders"),
    plantRendersRepo: "evals/validation/e4-run-2026-07-26/plants/e1-utility/renders",
    rubricPath: join(VALIDATION, "e1", "PREREG-RUBRIC-utility.md"),
    rubricName: "evals/validation/e1/PREREG-RUBRIC-utility.md",
    seedBase: 202607610,
    cellsPerCandidate: 4,
  },
  "e3-saas": {
    baseOrder: ["worked-invoice", "driveway-to-paid", "fair-quote"],
    realRenders: join(VALIDATION, "e3", "run-2026-07-26-saas", "project", "renders"),
    realRendersRepo: "evals/validation/e3/run-2026-07-26-saas/project/renders",
    plant: "day-rate",
    plantRenders: join(E4, "plants", "e3-saas", "renders"),
    plantRendersRepo: "evals/validation/e4-run-2026-07-26/plants/e3-saas/renders",
    rubricPath: join(VALIDATION, "e3", "PREREG-RUBRIC-saas-marketing.md"),
    rubricName: "evals/validation/e3/PREREG-RUBRIC-saas-marketing.md",
    seedBase: 202607620,
    cellsPerCandidate: 4,
  },
  "e3-commerce": {
    baseOrder: ["seed-annual", "packet-rack", "sowing-almanac"],
    realRenders: join(VALIDATION, "e3", "run-2026-07-26", "project", "renders"),
    realRendersRepo: "evals/validation/e3/run-2026-07-26/project/renders",
    plant: "potting-bench",
    plantRenders: join(E4, "plants", "e3-commerce", "renders"),
    plantRendersRepo: "evals/validation/e4-run-2026-07-26/plants/e3-commerce/renders",
    rubricPath: join(VALIDATION, "e3", "PREREG-RUBRIC-commerce.md"),
    rubricName: "evals/validation/e3/PREREG-RUBRIC-commerce.md",
    seedBase: 202607630,
    cellsPerCandidate: 8,
  },
  "e3-editorial": {
    baseOrder: ["almanac-rail", "weir-plates", "two-inks"],
    realRenders: join(VALIDATION, "e3", "run-2026-07-26-editorial", "project", "renders"),
    realRendersRepo: "evals/validation/e3/run-2026-07-26-editorial/project/renders",
    plant: "high-water",
    plantRenders: join(E4, "plants", "e3-editorial", "renders"),
    plantRendersRepo: "evals/validation/e4-run-2026-07-26/plants/e3-editorial/renders",
    rubricPath: join(VALIDATION, "e3", "PREREG-RUBRIC-editorial.md"),
    rubricName: "evals/validation/e3/PREREG-RUBRIC-editorial.md",
    seedBase: 202607640,
    cellsPerCandidate: 4,
  },
};

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
const sha256 = (buf) => createHash("sha256").update(buf).digest("hex");

const tierDefs = readFileSync(join(HERE, "TIER-DEFINITIONS-VERBATIM.md"), "utf8");

function transcript(setKey, cfg, jurorK, order, fileList) {
  const rubric = readFileSync(cfg.rubricPath, "utf8");
  const lines = [];
  lines.push(`# Juror input transcript — external panel, ${setKey}, juror-${jurorK}`);
  lines.push("");
  lines.push("You are one independent juror on a blind design panel. You will score FOUR");
  lines.push("website candidates from their rendered screenshots. Your ONLY inputs are the");
  lines.push("three materials in this document: (1) the tier definitions, (2) the scoring");
  lines.push("rubric, (3) the candidate render files listed at the end. Read only the files");
  lines.push("listed in section 3; do not open, search, or read any other file, directory,");
  lines.push("or document, and do not use any outside knowledge of these candidates.");
  lines.push("");
  lines.push("Where the rubric's evaluator rule mentions materials that are not part of this");
  lines.push("document (a brief, a data file, gate outputs, other jurors), they are");
  lines.push("intentionally not among your inputs: score what is observable in the renders,");
  lines.push("on the rubric's criteria and scale, as this panel's single independent juror.");
  lines.push("");
  lines.push("## Section 1 — Tier definitions (verbatim)");
  lines.push("");
  lines.push(tierDefs.trimEnd());
  lines.push("");
  lines.push(`## Section 2 — The sealed scoring rubric (verbatim: ${cfg.rubricName})`);
  lines.push("");
  lines.push(rubric.trimEnd());
  lines.push("");
  lines.push("## Section 3 — The four candidates (neutral labels; order fixed for you)");
  lines.push("");
  lines.push("Each candidate is one design, rendered at desktop (1440px) and mobile (375px)");
  lines.push("widths in both light and dark modes. View EVERY listed file of a candidate");
  lines.push("before scoring it. File paths are relative to your working directory.");
  lines.push("");
  for (let i = 0; i < order.length; i++) {
    lines.push(`### candidate-${i + 1}`);
    lines.push("");
    for (const f of fileList[i]) lines.push(`- jurors-blind/${setKey}/juror-${jurorK}/${f}`);
    lines.push("");
  }
  lines.push("## Section 4 — Your output (return EXACTLY this JSON, nothing else)");
  lines.push("");
  lines.push("Score every candidate on every rubric criterion (integers 0-10, the rubric's");
  lines.push("anchors). Give each scored criterion a rationale of AT MOST TWO sentences");
  lines.push("(one is preferred; never more than two; avoid abbreviations that end in a");
  lines.push("period). Then give a STRICT ranking of all four candidates, best first, no");
  lines.push("ties. Return ONLY this JSON object as your final message, no markdown fences:");
  lines.push("");
  lines.push(JSON.stringify({
    juror: `juror-${jurorK}`,
    set: setKey,
    candidates: Object.fromEntries(
      order.map((_, i) => [`candidate-${i + 1}`, {
        scores: { "1": 0, "2": 0, "3": 0, "4": 0, "5": 0, "6": 0, "7": 0, "8": 0, "9": 0, "10": 0 },
        rationales: { "1": "…", "2": "…", "3": "…", "4": "…", "5": "…", "6": "…", "7": "…", "8": "…", "9": "…", "10": "…" },
      }])
    ),
    ranking: order.map((_, i) => `candidate-${i + 1}`),
  }, null, 2));
  lines.push("");
  lines.push("The ranking array above is a placeholder ordering: replace it with YOUR");
  lines.push("best-to-worst order. Fill every score and rationale with your own judgment.");
  lines.push("");
  return lines.join("\n");
}

const summary = {};
for (const [setKey, cfg] of Object.entries(SETS)) {
  const candidates = [...cfg.baseOrder, cfg.plant];
  const outSetDir = join(HERE, setKey);
  mkdirSync(join(outSetDir, "raw"), { recursive: true });
  const map = { candidateOrderBase: candidates, plant: cfg.plant, jurors: {} };
  const manifest = { _note: "sha256 binding of every neutral-named blind render file to its committed source; blind copies live untracked at repo root jurors-blind/ and are byte-identical duplicates.", jurors: {} };
  for (let k = 1; k <= 5; k++) {
    const jurorSeed = cfg.seedBase + k;
    const order = shuffled(candidates, jurorSeed);
    const jdir = join(BLIND_ROOT, setKey, `juror-${k}`);
    mkdirSync(jdir, { recursive: true });
    const fileList = [];
    const fileManifest = [];
    order.forEach((cand, i) => {
      const srcDir = cand === cfg.plant ? cfg.plantRenders : cfg.realRenders;
      const srcRepo = cand === cfg.plant ? cfg.plantRendersRepo : cfg.realRendersRepo;
      const cells = readdirSync(srcDir).filter((f) => f.endsWith(".png") && f.startsWith(cand));
      if (cells.length !== cfg.cellsPerCandidate) {
        throw new Error(`${setKey}/${cand}: expected ${cfg.cellsPerCandidate} cells, found ${cells.length}`);
      }
      const neutral = [];
      for (const cell of cells.sort()) {
        const dest = cell.replace(cand, `candidate-${i + 1}`);
        copyFileSync(join(srcDir, cell), join(jdir, dest));
        neutral.push(dest);
        fileManifest.push({ neutral: dest, sourceRepoPath: `${srcRepo}/${cell}`, sha256: sha256(readFileSync(join(srcDir, cell))) });
      }
      fileList.push(neutral);
    });
    const text = transcript(setKey, cfg, k, order, fileList);
    const tPath = join(outSetDir, `juror-${k}-transcript.md`);
    writeFileSync(tPath, text);
    map.jurors[`juror-${k}`] = { jurorSeed, candidateOrder: order, labelToCandidate: Object.fromEntries(order.map((c, i) => [`candidate-${i + 1}`, c])), transcriptSha256: sha256(readFileSync(tPath)) };
    manifest.jurors[`juror-${k}`] = fileManifest;
  }
  writeFileSync(join(outSetDir, "blind-map.json"), JSON.stringify(map, null, 2) + "\n");
  writeFileSync(join(outSetDir, "blind-manifest.json"), JSON.stringify(manifest, null, 2) + "\n");
  summary[setKey] = Object.fromEntries(Object.entries(map.jurors).map(([j, v]) => [j, v.jurorSeed]));
}
console.log("blind inputs + transcripts prepared:", JSON.stringify(summary, null, 1));
