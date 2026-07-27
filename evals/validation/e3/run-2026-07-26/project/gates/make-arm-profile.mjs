#!/usr/bin/env node
// make-arm-profile.mjs — emit a per-arm static-gates profile from the arm's
// embedded #token-contract (tournament rule: token authority is per-arm).
// E3 two-surface arms: asserts BOTH surfaces embed the IDENTICAL contract.
// The profile root is written RELATIVE TO THE PROFILE FILE's directory
// (static-gates resolves relative roots against the profile path), so the
// committed artifact never carries a machine-absolute path (E1 lesson).
// Usage: node make-arm-profile.mjs <arm-name> > profile-<arm>.json   (run from gates/)
import { readFileSync } from "node:fs";

const arm = process.argv[2];
if (!arm) { console.error("usage: node make-arm-profile.mjs <arm-name>"); process.exit(2); }
const grab = (file) => {
  const html = readFileSync(file, "utf8");
  const m = html.match(/<script type="application\/json" id="token-contract">([\s\S]*?)<\/script>/);
  if (!m) { console.error(`no #token-contract in ${file}`); process.exit(1); }
  return m[1].trim();
};
const a = grab(`../arms/${arm}/index.html`);
const b = grab(`../arms/${arm}/product.html`);
if (a !== b) { console.error(`token contracts differ between the two surfaces of ${arm}`); process.exit(1); }
const contract = JSON.parse(a);
const profile = {
  project: `e3-arm-${arm}`,
  root: `../arms/${arm}`,
  sourceDirs: ["."],
  sourceExts: [".html"],
  ignore: [],
  allowRawColorIn: ["index.html", "product.html"],
  _rawColorNote: "single-file surfaces: raw hex is legal only inside the token definition blocks; the walk is soft/advisory",
  tokens: { light: contract.light, dark: contract.dark },
  gatedPairs: contract.gatedPairs,
  bannedClusters: [
    { id: "ai-cyan", any: ["#16d5e6", "#00d4ff", "#22d3ee", "cyan-400", "cyan-500"] },
    { id: "ai-purple-grad", any: ["from-purple-500 to-pink-500", "from-violet-600 to-fuchsia", "linear-gradient(135deg, #667eea", "#764ba2"] },
    { id: "bootstrap-indigo-default", any: ["#6366f1", "#4f46e5", "indigo-500", "indigo-600", "#0d6efd"] },
    { id: "glass-everywhere", any: ["backdrop-blur", "bg-white/10", "bg-white/20"] }
  ],
  surfaceType: "commerce",
  _register: "warm, unhurried, knowledgeable neighbor; mechanics ruthlessly conventional."
};
console.log(JSON.stringify(profile, null, 2));
