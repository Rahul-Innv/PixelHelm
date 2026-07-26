#!/usr/bin/env node
// assert-identity.mjs — L-081 page-identity assertion, run BEFORE any DOM/browser
// measurement: loads each arm by explicit file:// URL in a fresh context and asserts
// document.title contains "Ledgerline" AND html[data-arm] equals the expected arm id.
// A mismatch means measurements would validate the wrong artifact; exit 1, measure nothing.
//
// Usage: node assert-identity.mjs   (writes ../gates/identity.json)
import { createRequire } from "node:module";
import { writeFileSync } from "node:fs";
import { fileURLToPath, pathToFileURL } from "node:url";
import { dirname, join, resolve } from "node:path";

const require = createRequire(import.meta.url);
const HERE = dirname(fileURLToPath(import.meta.url));
const PROJECT = dirname(HERE);
const ARMS = ["worked-invoice", "driveway-to-paid", "fair-quote"];

function requireChromium() {
  const candidates = [
    process.env.PLAYWRIGHT_PKG,
    resolve(HERE, "../../../../../..", "plugins/pixelhelm-lite/skills/pixelhelm-render/package.json"),
  ].filter(Boolean);
  for (const p of candidates) {
    try { const pw = createRequire(p)("playwright"); if (pw && pw.chromium) return pw.chromium; } catch { /* next */ }
  }
  const pw = require("playwright");
  return pw.chromium;
}

const chromium = requireChromium();
let browser;
for (const channel of ["msedge", "chrome", undefined]) {
  try { browser = await chromium.launch(channel ? { channel } : {}); break; } catch { /* next */ }
}
if (!browser) { console.error("assert-identity: no browser"); process.exit(2); }

const results = [];
let ok = true;
for (const arm of ARMS) {
  const file = join(PROJECT, "arms", arm, "index.html");
  const page = await browser.newPage();
  await page.goto(pathToFileURL(file).href, { waitUntil: "load" });
  const seen = await page.evaluate(() => ({
    title: document.title,
    dataArm: document.documentElement.getAttribute("data-arm"),
  }));
  const pass = seen.title.includes("Ledgerline") && seen.dataArm === arm;
  if (!pass) ok = false;
  results.push({ arm, expectedDataArm: arm, seenTitle: seen.title, seenDataArm: seen.dataArm, pass });
  await page.close();
}
await browser.close();

const out = {
  _note: "L-081 page-identity assertions, taken by explicit file:// URL in fresh contexts before any measurement.",
  pass: ok,
  results,
};
writeFileSync(join(PROJECT, "gates", "identity.json"), JSON.stringify(out, null, 2) + "\n");
console.log(ok ? "IDENTITY OK" : "IDENTITY MISMATCH", JSON.stringify(results));
process.exit(ok ? 0 : 1);
