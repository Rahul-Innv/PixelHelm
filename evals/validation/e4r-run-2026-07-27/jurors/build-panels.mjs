#!/usr/bin/env node
// build-panels.mjs — assemble the E4-R external juror panels: blind maps, byte-identical
// neutral-label render copies, the R2 floor digests, and each juror's verbatim input
// transcript. Deterministic and model-free: every string it emits is copied from a
// committed artifact or computed from one.
//
// Usage: node build-panels.mjs            (writes jurors/<set>/… and ./jurors-blind/…)
//
// What R2 changes versus E4: each candidate section now carries that candidate's Layer-1
// FLOOR DIGEST — the committed gate records' own verdicts and findings, quoted, plus the
// explicit names of gates that did not run — beside its renders. The transcript file is
// what each juror record's inputTranscriptSha256 binds to, so the hash covers the gate
// outputs and not the renders alone (PREREG-E4R-ADDENDUM.md (a)).
//
// The neutral-label render copies live UNTRACKED at the repo root (committing 5 copies of
// every render would add ~160MB of duplicated binaries, as recorded in the E4 run); the
// blind-manifest binds every copy to its committed source by sha256.

import { createHash } from "node:crypto";
import { copyFileSync, existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const RUN = dirname(HERE);
const VALIDATION = dirname(RUN);
const REPO = resolve(VALIDATION, "..", "..");
const BLIND_ROOT = join(REPO, "jurors-blind");

const sha256 = (buf) => createHash("sha256").update(buf).digest("hex");
const read = (p) => readFileSync(p, "utf8");
const posix = (p) => p.replace(/\\/g, "/");

// ---------- the four judged sets ----------
// renderKeys: the per-surface render name stems, in the order a juror should view them.
const SETS = {
  "e1-utility": {
    rubric: "e1/PREREG-RUBRIC-utility.md",
    rubricLabel: "evals/validation/e1/PREREG-RUBRIC-utility.md",
    renderDir: "e1/run-2026-07-26/project/renders",
    gateDir: "e1/run-2026-07-26/project/gates",
    surfaces: [""],
    real: ["trail-ledger", "status-board", "first-light"],
    plant: "stone-steps",
    plantSet: "e1-utility",
  },
  "e3-saas": {
    rubric: "e3/PREREG-RUBRIC-saas-marketing.md",
    rubricLabel: "evals/validation/e3/PREREG-RUBRIC-saas-marketing.md",
    renderDir: "e3/run-2026-07-26-saas/project/renders",
    gateDir: "e3/run-2026-07-26-saas/project/gates",
    surfaces: [""],
    real: ["worked-invoice", "fair-quote", "driveway-to-paid"],
    plant: "job-sheet",
    plantSet: "e3-saas",
  },
  "e3-commerce": {
    rubric: "e3/PREREG-RUBRIC-commerce.md",
    rubricLabel: "evals/validation/e3/PREREG-RUBRIC-commerce.md",
    renderDir: "e3/run-2026-07-26/project/renders",
    gateDir: "e3/run-2026-07-26/project/gates",
    surfaces: ["-catalog", "-product"],
    real: ["packet-rack", "sowing-almanac", "seed-annual"],
    plant: "glass-house",
    plantSet: "e3-commerce",
  },
  "e3-editorial": {
    rubric: "e3/PREREG-RUBRIC-editorial.md",
    rubricLabel: "evals/validation/e3/PREREG-RUBRIC-editorial.md",
    renderDir: "e3/run-2026-07-26-editorial/project/renders",
    gateDir: "e3/run-2026-07-26-editorial/project/gates",
    surfaces: [""],
    real: ["almanac-rail", "weir-plates", "two-inks"],
    plant: "gauge-house",
    plantSet: "e3-editorial",
  },
};
const SET_ORDER = ["e1-utility", "e3-saas", "e3-commerce", "e3-editorial"];
// Seeds registered in PREREG-E4R-ADDENDUM.md (a): 202607711–202607730, disjoint from E4's.
const SEED_BASE = 202607711;

// ---------- deterministic shuffle (mulberry32 + Fisher-Yates), as in E4 ----------
function mulberry32(a) {
  return function () {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
function shuffle(list, seed) {
  const out = [...list];
  const rnd = mulberry32(seed);
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rnd() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

// ---------- floor digest (R2) ----------
// Every line below is copied from a committed gate record. No judgement is added; the
// digest names the gate, its own verdict, and its own findings, and lists gates that did
// not run so silence can never read as a pass.
const HARD_GATES = [
  { file: "static-gates.json", id: "static-gates", what: "declared token pairs recomputed for WCAG AA contrast, light and dark" },
  { file: "token-contract.txt", id: "check-token-contracts", what: "the page's own embedded token contract recomputed for AA" },
  { file: "output-floor.json", id: "output-floor-gate", what: "structural floor: landmarks, heading hierarchy, meta description" },
  { file: "gate-a{S}.json", id: "derived-claims-gate", what: "honesty A: every number on the rendered page traces to the sealed data" },
  { file: "gate-b{S}.json", id: "content-manifest-gate", what: "honesty B: every required content item is present in both modes" },
  { file: "verify_responsive.json", id: "verify_responsive", what: "reflow: horizontal overflow at 280 / 320 / 414 px" },
  { file: "verify_states.json", id: "verify_states", what: "real-render contrast in default / hover / focus, both modes" },
  { file: "verify_targetsize.json", id: "verify_targetsize", what: "interactive target size, WCAG 2.5.8" },
  { file: "verify_focustrap{S}.json", id: "verify_focustrap", what: "dialog keyboard trap: semantics, Tab confinement, Escape release" },
];
const NOT_RUN = [
  "verify_keyboard (keyboard traversal capture)",
  "verify_scrollcapture (deterministic scroll-position capture)",
  "verify_frametime (frame-time percentiles against a lab budget)",
  "verify_cwv (lab LCP / CLS / INP-proxy capture)",
];

function gateFileFor(dir, template, surfaces) {
  // "-catalog"/"-product" sets name gate-a-catalog.json; single-surface sets use the
  // committed bare names (gate-a-derived-claims.json / gate-b-manifest.json).
  const out = [];
  for (const s of surfaces) {
    let name = template.replace("{S}", s);
    if (!s) {
      if (name === "gate-a.json") name = "gate-a-derived-claims.json";
      if (name === "gate-b.json") name = "gate-b-manifest.json";
    }
    if (existsSync(join(dir, name))) out.push(name);
  }
  return out;
}

function digestOne(dir, name, gate) {
  const lines = [];
  if (name.endsWith(".txt")) {
    const text = read(join(dir, name)).trim();
    const verdicts = text.split("\n").filter((l) => /PASS|FAIL|RESULT/i.test(l));
    lines.push(`  file: ${name}`);
    for (const v of (verdicts.length ? verdicts : text.split("\n").slice(0, 6))) lines.push(`  ${v.trim()}`);
    return lines;
  }
  const rec = JSON.parse(read(join(dir, name)));
  lines.push(`  file: ${name}`);
  if (typeof rec.applicable === "boolean" && !rec.applicable) lines.push("  applicable: false (this is not a pass; the check did not apply to this page)");
  if (typeof rec.pass === "boolean") lines.push(`  pass: ${rec.pass}`);
  // static-gates.json reports per-gate instead of a single top-level pass
  if (typeof rec.hardGatesPassed === "boolean") {
    lines.push(`  hardGatesPassed: ${rec.hardGatesPassed}`);
    for (const [gid, g] of Object.entries(rec.gates || {})) {
      lines.push(`  ${gid}: hard=${g.hard} ran=${g.ran}${g.ran ? ` pass=${g.pass}` : " (did not run; not a pass)"}${g.total !== undefined ? ` over ${g.total} pair(s)` : ""}`);
      for (const f of g.failures || []) lines.push(`  [fail] ${gid}: ${JSON.stringify(f)}`);
    }
  }
  const push = (level, id, msg) => lines.push(`  [${level}] ${id}: ${msg}`);
  const collect = (node) => {
    if (Array.isArray(node)) { node.forEach(collect); return; }
    if (!node || typeof node !== "object") return;
    for (const f of node.findings || []) if (f.level !== "pass") push(f.level, f.id, f.msg);
    for (const f of node.failures || []) push("fail", f.selector || f.id || "measure", JSON.stringify(f));
    for (const f of node.needsReview || []) push("needs-review", f.selector || f.id || "measure", JSON.stringify(f));
    for (const f of node.missing || []) push("fail", f.id || "missing", JSON.stringify(f));
    for (const f of node.violations || []) push("fail", f.id || "violation", JSON.stringify(f));
    for (const key of ["targets", "cells", "modes", "profiles", "results"]) if (node[key]) collect(node[key]);
    if (node.pass === false && node.width) push("fail", `${node.width}px`, `overflow ${node.overflowPx}px`);
  };
  collect(rec);
  return lines;
}

function floorDigest(dir, surfaces, label) {
  const out = [`FLOOR OUTPUTS for ${label} — the machine gate records themselves, quoted.`, ""];
  let anyFail = false;
  for (const g of HARD_GATES) {
    const files = gateFileFor(dir, g.file, surfaces.length ? surfaces : [""]);
    if (!files.length) { out.push(`- ${g.id} — NO OUTPUT COMMITTED for this candidate (${g.what}). Absence of an output is not a pass.`, ""); continue; }
    out.push(`- ${g.id} — ${g.what}`);
    for (const f of files) {
      const lines = digestOne(dir, f, g);
      out.push(...lines);
      const rec = f.endsWith(".json") ? JSON.parse(read(join(dir, f))) : null;
      if (rec && (rec.pass === false || rec.hardGatesPassed === false)) anyFail = true;
      if (!rec && /FAIL/.test(read(join(dir, f)))) anyFail = true;
    }
    out.push("");
  }
  out.push("- Gates that did NOT run for this candidate (named so that silence is not read as a pass):");
  for (const n of NOT_RUN) out.push(`  ${n}`);
  out.push("");
  out.push(`SUMMARY: ${anyFail ? "at least one HARD gate FAILED for this candidate." : "every hard gate that ran exited clean for this candidate."}`);
  return { text: blindPaths(out.join("\n")), anyFail };
}

// Blinding filter: the gate records quote their own target paths, which carry the
// candidate's real arm name (".../arms/status-board/index.html"). Those would identify
// the candidate to a juror, so every file path inside a digest is withheld. Only the
// gate's own name, verdict, and findings survive — the evidence R2 requires, with the
// identity R2 does not.
function blindPaths(text) {
  return text
    .replace(/(^|\s)[\w.@-]*(?:[\\/][\w.@-]+)+\.(?:html|json|txt|png|mjs)/g, "$1(path withheld for blinding)")
    .replace(/\barms[\\/][\w.@-]+/g, "(path withheld for blinding)");
}

// ---------- transcript ----------
const TIER_DEFS = read(join(VALIDATION, "e4-run-2026-07-26/jurors/TIER-DEFINITIONS-VERBATIM.md"));

const PREAMBLE = `You are one independent juror on a blind design panel. You will score FOUR
website candidates. Your ONLY inputs are the four kinds of material in this
document: (1) the tier definitions, (2) the scoring rubric, (3) for each
candidate, its rendered screenshots AND its machine floor-gate outputs, and
nothing else. Read only the files listed in section 3; do not open, search, or
read any other file, directory, or document, and do not use any outside
knowledge of these candidates.

Where the rubric's evaluator rule mentions materials that are not part of this
document (a brief, a data file, other jurors), they are intentionally not among
your inputs: score what is observable in the renders and in the floor outputs
quoted here, on the rubric's criteria and scale, as this panel's single
independent juror.

THE FLOOR PRECONDITION (read this before you score anything). Every candidate
below carries the output of the machine floor gates that were run on it. Those
gates are measurements, not opinions, and they are not yours to relitigate.

- If a candidate's floor outputs show that EVERY hard gate that ran exited
  clean, score that candidate normally on the rubric. Do not award it extra
  credit for passing the floor, and do not spend praise on a property the
  gates already measured.
- If a candidate's floor outputs show ANY hard gate FAILED, that candidate is
  UNSCORED. Do not give it rubric scores. Do not rank it. Do not call it the
  worst, or weakest, or last: you are simply silent on its taste, because the
  floor has already ruled and you have no standing to hold an opinion about it.
  Mark it in your output with "unscored": true and name the failing gate.
- An UNSCORED candidate is left out of your ranking entirely. Rank only the
  candidates you scored.
`;

const OUTPUT_SPEC = (juror, set, labels, criteria) => {
  const scored = {};
  for (const l of labels) {
    scored[l] = {
      unscored: false,
      failingGate: null,
      scores: Object.fromEntries(criteria.map((c) => [String(c), 0])),
      rationales: Object.fromEntries(criteria.map((c) => [String(c), "…"])),
    };
  }
  const shape = {
    juror,
    set,
    candidates: scored,
    ranking: labels.filter((_, i) => i < labels.length - 1),
  };
  return `## Section 4 — Your output (return EXACTLY this JSON, nothing else)

For every candidate whose floor outputs are clean, score every rubric criterion
(integers 0-10, the rubric's anchors) with a rationale of AT MOST TWO sentences
each (one is preferred; never more than two; avoid abbreviations that end in a
period), and set "unscored": false and "failingGate": null.

For every candidate whose floor outputs show a hard gate FAILURE, set
"unscored": true, set "failingGate" to that gate's name, leave "scores" and
"rationales" as empty objects, and leave that candidate out of "ranking".

Then give a STRICT ranking, best first, no ties, of the SCORED candidates only.
Return ONLY this JSON object as your final message, no markdown fences. The
shape below shows all four candidates scored; adjust it to what you actually
found.

\`\`\`json
${JSON.stringify(shape, null, 2)}
\`\`\`
`;
};

// ---------- criteria count per rubric (read from the sheet's printed numbers) ----------
function criteriaOf(rubricText) {
  const nums = [...rubricText.matchAll(/^###?\s*(\d{1,2})[.)]\s/gm)].map((m) => Number(m[1]));
  const uniq = [...new Set(nums)].sort((a, b) => a - b);
  if (uniq.length) return uniq;
  const alt = [...rubricText.matchAll(/^\s*(\d{1,2})\.\s+\*\*/gm)].map((m) => Number(m[1]));
  return [...new Set(alt)].sort((a, b) => a - b);
}

// ---------- build ----------
mkdirSync(BLIND_ROOT, { recursive: true });
const summary = [];

for (const [si, setKey] of SET_ORDER.entries()) {
  const spec = SETS[setKey];
  const rubricPath = join(VALIDATION, spec.rubric);
  const rubricText = read(rubricPath);
  const criteria = criteriaOf(rubricText);
  if (!criteria.length) { console.error(`build-panels: no criterion numbers parsed from ${spec.rubric}`); process.exit(2); }

  const setDir = join(HERE, setKey);
  mkdirSync(join(setDir, "raw"), { recursive: true });

  const candidates = [...spec.real, spec.plant];
  const plantRenderDir = join(RUN, "plants", spec.plantSet, "renders");
  const plantGateDir = join(RUN, "plants", spec.plantSet, "gates");

  // per-candidate source render files + floor digest
  const sourceFor = (cand) => {
    const isPlant = cand === spec.plant;
    const dir = isPlant ? plantRenderDir : join(VALIDATION, spec.renderDir);
    const stems = spec.surfaces.map((s) => `${cand}${s}`);
    const files = [];
    for (const stem of stems) {
      for (const vp of ["desktop", "mobile"]) {
        for (const mode of ["light", "dark"]) {
          const f = `${stem}__${vp}__${mode}.png`;
          if (!existsSync(join(dir, f))) { console.error(`build-panels: missing render ${join(dir, f)}`); process.exit(2); }
          files.push({ abs: join(dir, f), stem, vp, mode });
        }
      }
    }
    const gateDir = isPlant ? plantGateDir : join(VALIDATION, spec.gateDir, cand);
    return { files, gateDir, isPlant };
  };

  const digests = {};
  for (const cand of candidates) {
    const src = sourceFor(cand);
    digests[cand] = floorDigest(src.gateDir, spec.surfaces, "this candidate");
  }

  const blindMap = { candidateOrderBase: candidates, plant: spec.plant, jurors: {} };
  const manifest = { set: setKey, _note: "Every neutral-label render copy is byte-identical to its committed source; both sha256 sums are recorded here.", jurors: {} };

  for (let j = 1; j <= 5; j++) {
    const jurorId = `juror-${j}`;
    const seed = SEED_BASE + si * 5 + (j - 1);
    const order = shuffle(candidates, seed);
    const labels = order.map((_, i) => `candidate-${i + 1}`);
    const labelToCandidate = Object.fromEntries(labels.map((l, i) => [l, order[i]]));

    // copy renders under neutral labels
    const outDir = join(BLIND_ROOT, setKey, jurorId);
    mkdirSync(outDir, { recursive: true });
    const entries = [];
    const sectionLines = [];
    for (const [i, cand] of order.entries()) {
      const label = labels[i];
      const src = sourceFor(cand);
      sectionLines.push(`### ${label}`, "");
      const surfaceNames = spec.surfaces.length > 1 ? spec.surfaces.map((s) => s.replace(/^-/, "")) : [""];
      for (const [k, f] of src.files.entries()) {
        const surfaceIdx = Math.floor(k / 4);
        const surfaceTag = surfaceNames.length > 1 ? `-${surfaceNames[surfaceIdx]}` : "";
        const destName = `${label}${surfaceTag}__${f.vp}__${f.mode}.png`;
        const dest = join(outDir, destName);
        copyFileSync(f.abs, dest);
        const sum = sha256(readFileSync(f.abs));
        entries.push({ label, source: posix(relative(REPO, f.abs)), copy: posix(relative(REPO, dest)), sha256: sum, copySha256: sha256(readFileSync(dest)) });
        sectionLines.push(`- ${posix(relative(REPO, dest))}`);
      }
      sectionLines.push("", "```", ...digests[cand].text.split("\n"), "```", "");
    }
    manifest.jurors[jurorId] = entries;

    const transcript = [
      `# Juror input transcript — external panel, ${setKey}, ${jurorId}`,
      "",
      PREAMBLE,
      "## Section 1 — Tier definitions (verbatim)",
      "",
      TIER_DEFS.trim(),
      "",
      `## Section 2 — The sealed scoring rubric (verbatim: ${spec.rubricLabel})`,
      "",
      rubricText.trim(),
      "",
      "## Section 3 — The four candidates (neutral labels; order fixed for you)",
      "",
      "Each candidate is one design, rendered at desktop (1440px) and mobile (375px)",
      "widths in both light and dark modes. View EVERY listed file of a candidate",
      "before scoring it, then read the floor outputs printed beneath its files. File",
      "paths are relative to your working directory.",
      "",
      ...sectionLines,
      OUTPUT_SPEC(jurorId, setKey, labels, criteria),
      "",
    ].join("\n");

    const tPath = join(setDir, `${jurorId}-transcript.md`);
    writeFileSync(tPath, transcript);
    const tSum = sha256(readFileSync(tPath));
    blindMap.jurors[jurorId] = {
      jurorSeed: seed,
      candidateOrder: order,
      labelToCandidate,
      transcriptSha256: tSum,
      floorFailingCandidates: order.filter((c) => digests[c].anyFail),
    };
    summary.push({ set: setKey, juror: jurorId, seed, transcript: posix(relative(REPO, tPath)), sha256: tSum });
  }

  writeFileSync(join(setDir, "blind-map.json"), JSON.stringify(blindMap, null, 2) + "\n");
  writeFileSync(join(setDir, "blind-manifest.json"), JSON.stringify(manifest, null, 2) + "\n");
  writeFileSync(join(setDir, "criteria.json"), JSON.stringify({ set: setKey, rubric: spec.rubricLabel, criteria }, null, 2) + "\n");
  console.log(`${setKey}: 5 transcripts, ${criteria.length} criteria, plant=${spec.plant}`);
}

writeFileSync(join(HERE, "panel-index.json"), JSON.stringify({ _note: "E4-R juror panels. Blind render copies live untracked at <repo>/jurors-blind/ and are bound to their committed sources by sha256 in each set's blind-manifest.json.", panels: summary }, null, 2) + "\n");
console.log(`built ${summary.length} juror transcripts`);
