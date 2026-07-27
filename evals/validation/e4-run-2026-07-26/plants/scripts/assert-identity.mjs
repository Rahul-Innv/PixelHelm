#!/usr/bin/env node
// assert-identity.mjs — L-081 page-identity assertion for the four E4 plants,
// run BEFORE any render or DOM measurement: loads each plant surface by explicit
// file:// URL in a fresh context and asserts document.title contains the set's
// identity token AND html[data-arm] equals the expected plant id. A mismatch
// means measurements would validate the wrong artifact; exit 1, measure nothing.
//
// Usage: node assert-identity.mjs   (writes ../identity.json)
import { createRequire } from "node:module";
import { writeFileSync } from "node:fs";
import { fileURLToPath, pathToFileURL } from "node:url";
import { dirname, join, resolve } from "node:path";

const require = createRequire(import.meta.url);
const HERE = dirname(fileURLToPath(import.meta.url));
const PLANTS = dirname(HERE);
const TARGETS = [
  { set: "e1-utility", arm: "switchback", file: "e1-utility/arms/switchback/index.html", titleToken: "Kestrel Ridge" },
  { set: "e3-saas", arm: "day-rate", file: "e3-saas/arms/day-rate/index.html", titleToken: "Ledgerline" },
  { set: "e3-commerce", arm: "potting-bench", file: "e3-commerce/arms/potting-bench/index.html", titleToken: "Foxglove" },
  { set: "e3-commerce", arm: "potting-bench", file: "e3-commerce/arms/potting-bench/product.html", titleToken: "Foxglove" },
  { set: "e3-editorial", arm: "high-water", file: "e3-editorial/arms/high-water/index.html", titleToken: "Ashcombe" },
];

function requireChromium() {
  const candidates = [
    process.env.PLAYWRIGHT_PKG,
    resolve(HERE, "../../../../..", "plugins/pixelhelm-lite/skills/pixelhelm-render/package.json"),
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
for (const t of TARGETS) {
  const file = join(PLANTS, t.file);
  const page = await browser.newPage();
  await page.goto(pathToFileURL(file).href, { waitUntil: "load" });
  const seen = await page.evaluate(() => ({
    title: document.title,
    dataArm: document.documentElement.getAttribute("data-arm"),
  }));
  const pass = seen.title.includes(t.titleToken) && seen.dataArm === t.arm;
  if (!pass) ok = false;
  results.push({ set: t.set, file: t.file, expectedDataArm: t.arm, expectedTitleToken: t.titleToken, seenTitle: seen.title, seenDataArm: seen.dataArm, pass });
  await page.close();
}
await browser.close();

const out = {
  _note: "L-081 page-identity assertions for the E4 plants, taken by explicit file:// URL in fresh contexts before any render or measurement.",
  pass: ok,
  results,
};
writeFileSync(join(PLANTS, "identity.json"), JSON.stringify(out, null, 2) + "\n");
console.log(ok ? "IDENTITY OK" : "IDENTITY MISMATCH", JSON.stringify(results.map((r) => r.pass)));
process.exit(ok ? 0 : 1);
