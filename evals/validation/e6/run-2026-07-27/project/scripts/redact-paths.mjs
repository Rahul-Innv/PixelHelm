#!/usr/bin/env node
// redact-paths.mjs — path hygiene for the committed gate outputs.
//
// The validators print the ABSOLUTE path of whatever they measured, and the
// Playwright channel fallback prints an absolute browser path into stderr. Both
// carry the operator's home directory, which must never enter the repository.
// This rewrites, in place, across every committed run artifact:
//
//   <repo root>/<path>       ->  <path>          (repo-relative)
//   <user home>/<path>       ->  %USERPROFILE%/<path>
//
// in BOTH plain and JSON-escaped (\\) forms, and for forward- and back-slash
// spellings. VERDICTS ARE NEVER TOUCHED: only path strings are rewritten, so a
// redacted artifact reports exactly the result the tool produced.
//
// Idempotent, so it is safe to re-run after any gate re-run.
// Exit 1 if any user-absolute path survives. Exit 2 on runner error.

import { readdirSync, readFileSync, writeFileSync, statSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { homedir } from "node:os";

const HERE = dirname(fileURLToPath(import.meta.url));
const RUN_DIR = resolve(HERE, "..", "..");            // evals/validation/e6/run-<date>
const REPO = resolve(HERE, "../../../../../..");
const HOME = homedir();

const TEXT_EXT = /\.(json|txt|md|mjs|js|html)$/i;

function variants(p) {
  const fwd = p.replace(/\\/g, "/");
  const back = p.replace(/\//g, "\\");
  return [
    p, fwd, back,
    back.replace(/\\/g, "\\\\"),      // JSON-escaped Windows path
    fwd.replace(/^([A-Za-z]):/, "$1:"),
  ];
}

function walk(dir, out = []) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) walk(p, out);
    else if (TEXT_EXT.test(name)) out.push(p);
  }
  return out;
}

let changed = 0;
const files = walk(RUN_DIR);
for (const f of files) {
  const before = readFileSync(f, "utf8");
  let s = before;
  // repo root first (it is the longer, more specific prefix), then the home dir
  for (const v of variants(REPO + "/")) if (v) s = s.split(v).join("");
  for (const v of variants(REPO)) if (v) s = s.split(v).join(".");
  for (const v of variants(HOME + "/")) if (v) s = s.split(v).join("%USERPROFILE%/");
  for (const v of variants(HOME)) if (v) s = s.split(v).join("%USERPROFILE%");
  if (s !== before) { writeFileSync(f, s, "utf8"); changed++; }
}

// verify nothing user-absolute survived
const homeLeaf = HOME.split(/[\\/]/).filter(Boolean).pop();
const offenders = [];
for (const f of walk(RUN_DIR)) {
  const s = readFileSync(f, "utf8");
  if (s.includes(homeLeaf) || /[A-Za-z]:[\\/]{1,2}Users/i.test(s)) offenders.push(f.replace(REPO, "."));
}

console.log(`redact-paths: scanned ${files.length} file(s), rewrote ${changed}`);
if (offenders.length) {
  console.error(`redact-paths: user-absolute path SURVIVED in ${offenders.length} file(s):`);
  for (const o of offenders) console.error("  " + o);
  process.exit(1);
}
console.log("redact-paths: clean — no user-absolute path remains in the run artifacts");
