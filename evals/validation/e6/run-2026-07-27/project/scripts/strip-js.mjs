#!/usr/bin/env node
// strip-js.mjs — build the NO-JS parity copies used to prove the third limb of
// the motion floor by MEASUREMENT rather than by assertion.
//
// Usage: node scripts/strip-js.mjs   (run from the project dir)
//
// Why a stripped COPY and not a <noscript> block: design KB L-084 records that a
// script-stripped copy CANNOT verify a <noscript> fallback (noscript renders only
// when the ENGINE disables scripting, so the check silently under-reports), and
// that Edge headless refused to write screenshots at all with scripting disabled
// via --blink-settings. The arms therefore ship the complete story as static HTML
// and let JS REBUILD it into the animated form, which makes a stripped copy a
// FAITHFUL no-JS proof: whatever survives here is exactly what a visitor with JS
// off receives. No <noscript> appears in any arm.
//
// The copies are committed as evidence and the honesty/manifest gate is run
// against them, so "no-JS parity" is a gate verdict, not a claim.

import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const PROJECT = join(HERE, "..");
const ARMS = ["crease-line", "under-the-bed", "three-counts"];

// Remove every <script> element (the arms carry no external scripts, so this is
// the whole JS surface). The token-contract block is application/json, NOT
// executable, and is preserved so the copy stays gate-profilable.
const SCRIPT_RE = /<script\b(?![^>]*type="application\/json")[^>]*>[\s\S]*?<\/script>\s*/gi;

let wrote = 0;
for (const arm of ARMS) {
  const src = readFileSync(join(PROJECT, "arms", arm, "index.html"), "utf8");
  const out = src.replace(SCRIPT_RE, "");
  if (/<script\b(?![^>]*type="application\/json")/i.test(out)) {
    console.error(`strip-js: ${arm}: an executable <script> survived the strip`);
    process.exit(1);
  }
  if (/<noscript\b/i.test(src)) {
    console.error(`strip-js: ${arm}: <noscript> is forbidden in this run (L-084: unverifiable by this method)`);
    process.exit(1);
  }
  const dir = join(PROJECT, "parity", "no-js", arm);
  mkdirSync(dir, { recursive: true });
  writeFileSync(join(dir, "index.html"), out, "utf8");
  wrote++;
  console.log(`strip-js: wrote parity/no-js/${arm}/index.html  (${src.length} -> ${out.length} bytes)`);
}
console.log(`strip-js: ${wrote} no-JS parity copies written`);
