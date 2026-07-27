#!/usr/bin/env node
// run-plant-battery.mjs — run the committed Layer-1 floor battery over one E4-R plant,
// exactly the battery that set's REAL arms faced, as-produced. Writes every gate output
// plus its stderr (path-redacted) under <set>/gates/, and a battery.json index carrying
// each gate's exit code.
//
// Usage: node run-plant-battery.mjs <e1-utility|e3-saas|e3-commerce|e3-editorial> <arm>
//
// Nothing here decides pass/fail: the gates do. This script only drives them with the
// same configs the judged runs used (--target overridden to the plant surface) and
// records what they said. Exit 0 always when every gate RAN; exit 2 if a gate could not
// run at all (a gate that did not run is never reported as a pass).
//
// Path hygiene: stderr captures are redacted (user home -> %USERPROFILE%, repo root ->
// <repo>) before they are written, per the E1 path-hygiene lesson.

import { spawnSync } from "node:child_process";
import { mkdirSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const PLANTS = dirname(HERE);
const RUN = dirname(PLANTS);
const VALIDATION = dirname(RUN);
const REPO = resolve(VALIDATION, "..", "..");
const EVAL_SCRIPTS = join(REPO, "plugins/pixelhelm-lite/skills/pixelhelm-evaluate/scripts");

const SETS = {
  "e1-utility": {
    project: "e1/run-2026-07-26/project",
    surfaces: [{ key: "", file: "index.html" }],
    claims: "honesty/claims-config.json",
    manifests: [{ key: "", file: "honesty/manifest.json" }],
  },
  "e3-saas": {
    project: "e3/run-2026-07-26-saas/project",
    surfaces: [{ key: "", file: "index.html" }],
    claims: "honesty/claims-config.json",
    manifests: [{ key: "", file: "honesty/manifest.json" }],
  },
  "e3-commerce": {
    project: "e3/run-2026-07-26/project",
    surfaces: [{ key: "catalog", file: "index.html" }, { key: "product", file: "product.html" }],
    claims: "honesty/claims-config.json",
    manifests: [{ key: "catalog", file: "honesty/manifest-catalog.json" }, { key: "product", file: "honesty/manifest-product.json" }],
  },
  "e3-editorial": {
    project: "e3/run-2026-07-26-editorial/project",
    surfaces: [{ key: "", file: "index.html" }],
    claims: "honesty/claims-config.json",
    manifests: [{ key: "", file: "honesty/manifest.json" }],
  },
};

const [set, arm] = process.argv.slice(2);
if (!set || !arm || !SETS[set]) {
  console.error("usage: node run-plant-battery.mjs <e1-utility|e3-saas|e3-commerce|e3-editorial> <arm>");
  process.exit(2);
}
const spec = SETS[set];
const armDir = join(PLANTS, set, "arms", arm);
const gatesDir = join(PLANTS, set, "gates");
mkdirSync(gatesDir, { recursive: true });

const HOME = homedir();
const redact = (s) =>
  String(s)
    .split(HOME).join("%USERPROFILE%")
    .split(HOME.replace(/\\/g, "/")).join("%USERPROFILE%")
    .split(HOME.replace(/\\/g, "\\\\")).join("%USERPROFILE%")
    .split(REPO).join("<repo>")
    .split(REPO.replace(/\\/g, "/")).join("<repo>")
    .split(REPO.replace(/\\/g, "\\\\")).join("<repo>");

const results = [];
let runnerError = false;

function run(name, argv, { stdoutTo }) {
  const r = spawnSync("node", argv, { cwd: REPO, encoding: "utf8", maxBuffer: 64 * 1024 * 1024 });
  if (r.error) { console.error(`battery: ${name} could not run: ${r.error.message}`); runnerError = true; return; }
  const out = redact(r.stdout || "");
  writeFileSync(join(gatesDir, stdoutTo), out.endsWith("\n") ? out : out + "\n");
  const err = redact(r.stderr || "");
  writeFileSync(join(gatesDir, `${stdoutTo.replace(/\.(json|txt)$/, "")}.stderr.txt`), err);
  if (r.status === 2) { console.error(`battery: ${name} exited 2 (runner error) — a gate that did not run is not a pass`); runnerError = true; }
  results.push({ gate: name, artifact: stdoutTo, exitCode: r.status });
  console.log(`${String(r.status).padStart(2)}  ${name} -> ${stdoutTo}`);
}

const armRel = (f) => relative(REPO, join(armDir, f)).replace(/\\/g, "/");
const projRel = (f) => relative(REPO, join(VALIDATION, spec.project, f)).replace(/\\/g, "/");
const gateScript = (f) => relative(REPO, join(EVAL_SCRIPTS, f)).replace(/\\/g, "/");
const allSurfaces = spec.surfaces.map((s) => armRel(s.file));
const suffix = (key) => (key ? `-${key}` : "");

// 1. static contrast gates (browser-free) over the plant's own profile
run("static-gates", [gateScript("static-gates.mjs"), relative(REPO, join(gatesDir, `profile-${arm}.json`)).replace(/\\/g, "/"), "--json"],
  { stdoutTo: "static-gates.json" });

// 2. candidate token-contract AA recompute
run("check-token-contracts", [gateScript("check-token-contracts.mjs"), ...allSurfaces], { stdoutTo: "token-contract.txt" });

// 3. structural output floor
run("output-floor-gate", [gateScript("output-floor-gate.mjs"), ...allSurfaces, "--json"], { stdoutTo: "output-floor.json" });

// 4. honesty gate A (derived claims), per surface
for (const s of spec.surfaces) {
  run(`derived-claims-gate${suffix(s.key)}`,
    [gateScript("derived-claims-gate.mjs"), "--config", projRel(spec.claims), "--target", armRel(s.file), "--json"],
    { stdoutTo: `gate-a${suffix(s.key) || "-derived-claims"}.json` });
}

// 5. honesty gate B (required-content manifest), per surface
for (const [i, m] of spec.manifests.entries()) {
  const s = spec.surfaces[i];
  run(`content-manifest-gate${suffix(m.key)}`,
    [gateScript("content-manifest-gate.mjs"), "--manifest", projRel(m.file), "--target", armRel(s.file), "--json"],
    { stdoutTo: `gate-b${suffix(m.key) || "-manifest"}.json` });
}

// 6. browser-dependent hard gates
run("verify_responsive", [gateScript("verify_responsive.mjs"), ...allSurfaces, "--json", "--channel", "msedge"], { stdoutTo: "verify_responsive.json" });
run("verify_states", [gateScript("verify_states.mjs"), ...allSurfaces, "--json", "--channel", "msedge"], { stdoutTo: "verify_states.json" });
run("verify_targetsize", [gateScript("verify_targetsize.mjs"), ...allSurfaces, "--json", "--channel", "msedge"], { stdoutTo: "verify_targetsize.json" });
for (const s of spec.surfaces) {
  const trigger = process.env[`FOCUSTRAP_TRIGGER${s.key ? "_" + s.key.toUpperCase() : ""}`];
  run(`verify_focustrap${suffix(s.key)}`,
    [gateScript("verify_focustrap.mjs"), armRel(s.file), ...(trigger ? ["--trigger", trigger] : []), "--json", "--channel", "msedge"],
    { stdoutTo: `verify_focustrap${suffix(s.key)}.json` });
}

const index = {
  _note: "E4-R plant floor battery — the committed gates this set's real arms faced, run as-produced. exitCode 0 = pass, 1 = HARD FAIL, 2 = runner error (never a pass).",
  set, arm,
  generated: new Date().toISOString(),
  hardFails: results.filter((r) => r.exitCode === 1).map((r) => r.gate),
  results,
};
writeFileSync(join(gatesDir, "battery.json"), JSON.stringify(index, null, 2) + "\n");
console.log(`battery: ${index.hardFails.length} hard fail(s): ${index.hardFails.join(", ") || "none"}`);
process.exit(runnerError ? 2 : 0);
