#!/usr/bin/env node
// make-plant-profile.mjs — emit a static-gates profile for an E4 plant from the
// plant's embedded #token-contract, carrying over the corresponding judged run's
// committed bannedClusters / surfaceType / _register so the plant faces the SAME
// battery its set's real arms faced. Root is emitted relative to the profile's
// own directory (repo-portable; no user-absolute path, E1 path-hygiene lesson).
//
// Usage: node make-plant-profile.mjs <set> <arm>   > <set>/gates/profile-<arm>.json
//   <set>: e1-utility | e3-saas | e3-commerce | e3-editorial
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const PLANTS = dirname(HERE);
const VALIDATION = join(PLANTS, "..", "..");
const RUN_PROFILE = {
  "e1-utility": "e1/run-2026-07-26/project/gates/profile-trail-ledger.json",
  "e3-saas": "e3/run-2026-07-26-saas/project/gates/profile-worked-invoice.json",
  "e3-commerce": "e3/run-2026-07-26/project/gates/profile-packet-rack.json",
  "e3-editorial": "e3/run-2026-07-26-editorial/project/gates/profile-weir-plates.json",
};

const [set, arm] = process.argv.slice(2);
if (!set || !arm || !RUN_PROFILE[set]) { console.error("usage: node make-plant-profile.mjs <set> <arm>"); process.exit(2); }
const html = readFileSync(join(PLANTS, set, "arms", arm, "index.html"), "utf8");
const m = html.match(/<script type="application\/json" id="token-contract">([\s\S]*?)<\/script>/);
if (!m) { console.error("no #token-contract"); process.exit(1); }
const contract = JSON.parse(m[1]);
const runProfile = JSON.parse(readFileSync(join(VALIDATION, RUN_PROFILE[set]), "utf8"));
const sourceFiles = set === "e3-commerce" ? ["index.html", "product.html"] : ["index.html"];
const profile = {
  project: `e4-plant-${arm}`,
  root: `../arms/${arm}`,
  _rootNote: "relative to this profile's directory (repo-portable; no user-absolute path)",
  sourceDirs: ["."],
  sourceExts: [".html"],
  ignore: [],
  allowRawColorIn: sourceFiles,
  _rawColorNote: "single-file plant: raw hex is legal only inside the token definition blocks; the walk is soft/advisory",
  tokens: { light: contract.light, dark: contract.dark },
  gatedPairs: contract.gatedPairs,
  bannedClusters: runProfile.bannedClusters,
  surfaceType: runProfile.surfaceType,
  _register: runProfile._register,
};
process.stdout.write(JSON.stringify(profile, null, 2) + "\n");
