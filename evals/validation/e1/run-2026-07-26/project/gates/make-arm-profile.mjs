#!/usr/bin/env node
// make-arm-profile.mjs — emit a per-arm static-gates profile from the arm's
// embedded #token-contract (tournament rule: token authority is per-arm).
// Usage: node make-arm-profile.mjs <arm-dir> > gates/profile-<arm>.json
import { readFileSync } from "node:fs";
import { basename, join, resolve } from "node:path";

const armDir = process.argv[2];
if (!armDir) { console.error("usage: node make-arm-profile.mjs <arm-dir>"); process.exit(2); }
const html = readFileSync(join(armDir, "index.html"), "utf8");
const m = html.match(/<script type="application\/json" id="token-contract">([\s\S]*?)<\/script>/);
if (!m) { console.error("no #token-contract"); process.exit(1); }
const contract = JSON.parse(m[1]);
const profile = {
  project: `e1-arm-${basename(resolve(armDir))}`,
  root: resolve(armDir).replace(/\\/g, "/"),
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
  surfaceType: "data",
  _register: "calm, factual, outdoors-trust; zero marketing voice."
};
console.log(JSON.stringify(profile, null, 2));
