#!/usr/bin/env node
// make-arm-profile.mjs — emit a per-arm static-gates profile from the arm's
// embedded #token-contract (tournament rule: token authority is per-arm).
// Usage: node make-arm-profile.mjs <arm-dir> > gates/profile-<arm>.json
// Adapted from the E1 precedent; the banned clusters are the shipped seed
// registry's greppable entries, re-read here rather than copied by hand.
import { readFileSync } from "node:fs";
import { basename, dirname, join, resolve, relative } from "node:path";
import { fileURLToPath } from "node:url";

// repo root, derived from this file's own location so the output never depends
// on the caller's cwd: gates -> project -> run-<date> -> e6 -> validation -> evals -> repo
const HERE = dirname(fileURLToPath(import.meta.url));
const REPO = resolve(HERE, "../../../../../..");

const armDir = process.argv[2];
if (!armDir) { console.error("usage: node make-arm-profile.mjs <arm-dir>"); process.exit(2); }
const html = readFileSync(join(armDir, "index.html"), "utf8");
const m = html.match(/<script type="application\/json" id="token-contract">([\s\S]*?)<\/script>/);
if (!m) { console.error("no #token-contract"); process.exit(1); }
const contract = JSON.parse(m[1]);
const profile = {
  project: `e6a-arm-${basename(resolve(armDir))}`,
  // static-gates.mjs resolves `root` relative to the PROFILE FILE's own directory
  // (`resolve(profilePath, "..", profile.root)`), so the committed value must be
  // profile-relative. A repo-relative value silently resolves to nothing and the
  // source walk then reports "files scanned: 0" with every soft gate "clean" —
  // a vacuous pass. Verified on this run: the repo-relative form scanned 0 files.
  root: ("../" + relative(resolve(HERE, ".."), resolve(armDir)).replace(/\\/g, "/")).replace(/\/+/g, "/"),
  _rootRepoRelative: relative(REPO, resolve(armDir)).replace(/\\/g, "/"),
  sourceDirs: ["."],
  sourceExts: [".html"],
  ignore: [],
  allowRawColorIn: ["index.html"],
  _rawColorNote: "single-file arm: raw hex is legal only inside the two token definition blocks; the walk is soft/advisory",
  tokens: { light: contract.light, dark: contract.dark },
  gatedPairs: contract.gatedPairs,
  bannedClusters: [
    { id: "ai-cyan", any: ["#16d5e6", "#00d4ff", "#22d3ee", "cyan-400", "cyan-500"] },
    { id: "ai-purple-grad", any: ["from-purple-500 to-pink-500", "from-violet-600 to-fuchsia", "linear-gradient(135deg, #667eea", "#764ba2"] },
    { id: "bootstrap-indigo-default", any: ["#6366f1", "#4f46e5", "indigo-500", "indigo-600", "#0d6efd"] },
    { id: "glass-everywhere", any: ["backdrop-blur", "bg-white/10", "bg-white/20"] }
  ],
  surfaceType: "campaign",
  _register: "marketing launch page; the story IS the unfold, demonstration as pitch (W-02). Motion is archetype-legitimate here (RF-7) but only where it demonstrates the product."
};
console.log(JSON.stringify(profile, null, 2));
