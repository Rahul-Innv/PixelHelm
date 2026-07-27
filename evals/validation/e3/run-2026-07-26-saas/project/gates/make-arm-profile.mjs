#!/usr/bin/env node
// make-arm-profile.mjs — emit a per-arm static-gates profile from the arm's
// embedded #token-contract (tournament rule: token authority is per-arm).
// E3 note: root is emitted RELATIVE TO THE PROFILE'S OWN DIRECTORY
// ("../arms/<arm>") so the committed profile is runnable from anywhere and
// carries no user-absolute path (E1 path-hygiene lesson, applied from the start).
// Usage: node make-arm-profile.mjs <arm-name> > gates/profile-<arm>.json
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const arm = process.argv[2];
if (!arm) { console.error("usage: node make-arm-profile.mjs <arm-name>"); process.exit(2); }
const html = readFileSync(join(HERE, "..", "arms", arm, "index.html"), "utf8");
const m = html.match(/<script type="application\/json" id="token-contract">([\s\S]*?)<\/script>/);
if (!m) { console.error("no #token-contract"); process.exit(1); }
const contract = JSON.parse(m[1]);
const profile = {
  project: `e3-arm-${arm}`,
  root: `../arms/${arm}`,
  _rootNote: "relative to this profile's directory (repo-portable; no user-absolute path)",
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
  surfaceType: "marketing",
  _register: "plain-spoken, tradesperson-respecting, zero startup hype; every claim traces to the sealed data file."
};
console.log(JSON.stringify(profile, null, 2));
