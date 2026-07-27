#!/usr/bin/env node
// make-arm-profile.mjs — emit a per-arm static-gates profile from the arm's
// embedded #token-contract (tournament rule: token authority is per-arm).
// The profile root is written RELATIVE to the profile's own directory
// (E1 path-hygiene lesson: no user-absolute path in any committed artifact,
// and a relative root keeps the profile re-runnable from any checkout).
// Usage: node make-arm-profile.mjs <arm-name> > gates/profile-<arm-name>.json
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const armName = process.argv[2];
if (!armName) { console.error("usage: node make-arm-profile.mjs <arm-name>"); process.exit(2); }
const here = dirname(fileURLToPath(import.meta.url));
const html = readFileSync(join(here, "..", "arms", armName, "index.html"), "utf8");
const m = html.match(/<script type="application\/json" id="token-contract">([\s\S]*?)<\/script>/);
if (!m) { console.error("no #token-contract"); process.exit(1); }
const contract = JSON.parse(m[1]);
const profile = {
  project: `e3-arm-${armName}`,
  root: `../arms/${armName}`,
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
  surfaceType: "editorial",
  _register: "patient local-paper journalism — concrete, unsensational, place-loving; the data is the story, never decoration."
};
console.log(JSON.stringify(profile, null, 2));
