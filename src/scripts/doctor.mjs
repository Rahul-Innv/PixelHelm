#!/usr/bin/env node
// Dependency-free PixelHelm install and project-state preflight.
import { existsSync, readFileSync } from "node:fs";
import { resolve, dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";
import os from "node:os";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const args = process.argv.slice(2);
const ix = args.indexOf("--project");
const project = resolve(ix >= 0 && args[ix + 1] ? args[ix + 1] : process.cwd());
let hard = 0;
const ok = (m) => console.log(`  [ok]   ${m}`);
const warn = (m, fix) => { console.log(`  [warn] ${m}`); if (fix) console.log(`         fix: ${fix}`); };
const fail = (m, fix) => { hard += 1; console.log(`  [FAIL] ${m}`); if (fix) console.log(`         fix: ${fix}`); };

console.log(`pixelhelm doctor - plugin: ${root}`);
console.log(`                   project: ${project}\n`);

const major = Number(process.versions.node.split(".")[0]);
if (major >= 18) ok(`node ${process.versions.node}`);
else fail(`node ${process.versions.node} is too old`, "install Node 18+");

const renderDir = join(root, "skills", "pixelhelm-render");
if (!existsSync(renderDir)) warn("pixelhelm-render is absent in this edition");
else if (existsSync(join(renderDir, "node_modules", "playwright"))) ok("render dependencies installed");
else fail("render dependencies are not installed for this plugin version", `in ${renderDir}, run npm install with PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1`);

const canonicalProfile = join(project, ".pixelhelm", "profile.json");
const legacyProfile = join(project, ".design", "profile.json");
if (existsSync(canonicalProfile) && existsSync(legacyProfile) && !readFileSync(canonicalProfile).equals(readFileSync(legacyProfile))) {
  fail("canonical and legacy profiles conflict", `reconcile ${canonicalProfile} and ${legacyProfile}; never write legacy state`);
}
const profilePath = existsSync(canonicalProfile) ? canonicalProfile : (existsSync(legacyProfile) ? legacyProfile : null);
const canonicalData = join(os.homedir(), ".claude", "pixelhelm");
const legacyData = [join(os.homedir(), ".claude", "design", "frontend-design-skill"), join(os.homedir(), ".claude", "design-pixelhelm")].find(existsSync);
const dataDir = process.env.CLAUDE_PLUGIN_DATA || (existsSync(canonicalData) ? canonicalData : legacyData || canonicalData);
if (!profilePath) warn("no project profile found", `create ${canonicalProfile} from profiles/examples/example.json and write _register`);
else {
  try {
    const profile = JSON.parse(readFileSync(profilePath, "utf8"));
    if (typeof profile._register === "string" && profile._register.trim() && !/REPLACE ME/i.test(profile._register)) ok(`profile has a register (${profilePath})`);
    else warn("profile register is missing or placeholder", "write the intended product feeling in the owner's words");
    if (profile.tokenModule || profile.tokens) ok("profile carries a token contract");
    else warn("profile has no token contract", "point tokenModule to the canonical module or define inline tokens");
  } catch (error) { fail(`profile is unreadable: ${error.message}`, "repair strict JSON before design work"); }
}
ok(`durable data path resolves to ${dataDir}`);

// FULL-ONLY-START
if (existsSync(join(root, "skills", "pixelhelm-evidence-brief"))) {
  const probe = ["python", "python3"].map((cmd) => spawnSync(cmd, ["--version"], { encoding: "utf8" })).find((result) => result.status === 0);
  if (probe) ok("python available for the evidence brief engine");
  else warn("python is unavailable; evidence-brief live runs cannot execute", "install Python 3.12+ and the already-qualified local engine dependencies");
}
// FULL-ONLY-END

console.log(hard ? `\ndoctor: ${hard} hard failure(s).` : "\ndoctor: ready.");
process.exit(hard ? 1 : 0);
