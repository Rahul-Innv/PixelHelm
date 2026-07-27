#!/usr/bin/env node
// measure-payload.mjs — the two pre-registered TRANSFER budgets, which no shipped
// validator covers (verify_cwv states outright that transfer weight "is a different
// tool's job"). Registered in the sealed brief §4:
//
//   initial payload <= 1.5 MB      JS <= 300 KB gzipped
//
// Method (measured, not asserted): load the arm in a real browser and record EVERY
// network request the page makes, so an accidental external asset would be counted
// rather than missed by a source read. Initial payload = the sum of all response
// bodies for the initial load. JS weight = the gzipped size of every executable
// <script> the document ships (the arms carry no external scripts; the script list
// is taken from the live DOM, so an injected one would still be counted).
//
// Page identity is asserted before any measurement (design KB L-081): a preview
// pane or stale tab can silently serve a sibling file and every number would then
// describe the wrong artifact.
//
// Exit 1 iff any arm exceeds a registered budget. Exit 2 on runner error.

import { createRequire } from "node:module";
import { readFileSync, writeFileSync } from "node:fs";
import { gzipSync } from "node:zlib";
import { dirname, resolve, join } from "node:path";
import { fileURLToPath } from "node:url";
import { pathToFileURL } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const PROJECT = resolve(HERE, "..");
const require = createRequire(import.meta.url);

const BUDGET_PAYLOAD_BYTES = 1.5 * 1024 * 1024;  // 1.5 MB
const BUDGET_JS_GZIP_BYTES = 300 * 1024;         // 300 KB gzipped

const ARMS = ["crease-line", "under-the-bed", "three-counts"];

function loadPlaywright() {
  const candidates = [
    process.env.PLAYWRIGHT_PKG,
    resolve(HERE, "../../../../../../plugins/pixelhelm-lite/skills/pixelhelm-render/package.json"),
  ].filter(Boolean);
  for (const c of candidates) {
    try { return createRequire(c)("playwright"); } catch { /* try next */ }
  }
  try { return require("playwright"); } catch (e) {
    console.error(`measure-payload: playwright not resolvable (${e.message.split("\n")[0]}) — this is a LOUD failure, never a silent skip`);
    process.exit(2);
  }
}

const { chromium } = loadPlaywright();
let browser;
for (const channel of ["msedge", "chrome", undefined]) {
  try { browser = await chromium.launch(channel ? { channel } : {}); break; } catch { /* next */ }
}
if (!browser) { console.error("measure-payload: no browser channel launched"); process.exit(2); }

const report = {
  tool: "measure-payload",
  generated: new Date().toISOString(),
  budgets: { initialPayloadBytes: BUDGET_PAYLOAD_BYTES, jsGzipBytes: BUDGET_JS_GZIP_BYTES },
  note: "LAB, file:// targets, single machine. Initial payload = sum of every response body on the initial load; JS weight = gzipped bytes of every executable <script> in the live DOM.",
  arms: [],
  pass: true,
};

for (const arm of ARMS) {
  const file = join(PROJECT, "arms", arm, "index.html");
  const url = pathToFileURL(file).href;
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();

  const requests = [];
  page.on("response", async (res) => {
    let size = null;
    try { size = (await res.body()).length; } catch { /* body unavailable */ }
    requests.push({ url: res.url().replace(/^file:\/\/\/.*\//, "./"), status: res.status(), bytes: size });
  });

  await page.goto(url, { waitUntil: "networkidle" });

  // L-081: assert page identity BEFORE reading any measurement off this page.
  const identity = await page.evaluate(() => ({
    title: document.title,
    hasMain: !!document.querySelector("main#main"),
    contract: !!document.getElementById("token-contract"),
  }));
  const expectTitle = readFileSync(file, "utf8").match(/<title>([^<]*)<\/title>/)[1];
  if (identity.title !== expectTitle || !identity.hasMain || !identity.contract) {
    console.error(`measure-payload: ${arm}: PAGE IDENTITY ASSERTION FAILED (title "${identity.title}" != "${expectTitle}") — refusing to measure the wrong artifact (L-081)`);
    process.exit(2);
  }

  // executable scripts, read from the LIVE DOM so an injected one is still counted
  const scripts = await page.evaluate(() =>
    [...document.querySelectorAll("script")]
      .filter((s) => !s.type || s.type === "text/javascript" || s.type === "module")
      .map((s) => ({ external: !!s.src, src: s.src || null, text: s.textContent || "" }))
  );
  const external = scripts.filter((s) => s.external);
  const jsSource = scripts.map((s) => s.text).join("\n");
  const jsRawBytes = Buffer.byteLength(jsSource, "utf8");
  const jsGzipBytes = gzipSync(Buffer.from(jsSource, "utf8")).length;

  const initialPayloadBytes = requests.reduce((n, r) => n + (r.bytes || 0), 0);
  const entry = {
    arm,
    requests: requests.length,
    externalScripts: external.length,
    externalScriptUrls: external.map((s) => s.src),
    initialPayloadBytes,
    initialPayloadKB: Math.round((initialPayloadBytes / 1024) * 10) / 10,
    jsRawBytes,
    jsGzipBytes,
    jsGzipKB: Math.round((jsGzipBytes / 1024) * 10) / 10,
    checks: [
      { id: "initial-payload", val: `${Math.round((initialPayloadBytes / 1024) * 10) / 10} KB`, budget: "<= 1536 KB (1.5 MB)", ok: initialPayloadBytes <= BUDGET_PAYLOAD_BYTES },
      { id: "js-gzipped", val: `${Math.round((jsGzipBytes / 1024) * 10) / 10} KB`, budget: "<= 300 KB gzipped", ok: jsGzipBytes <= BUDGET_JS_GZIP_BYTES },
    ],
    requestLog: requests,
  };
  entry.pass = entry.checks.every((c) => c.ok);
  if (!entry.pass) report.pass = false;
  report.arms.push(entry);
  await context.close();
}
await browser.close();

const outPath = join(PROJECT, "gates", "payload-budgets.json");
writeFileSync(outPath, JSON.stringify(report, null, 2) + "\n", "utf8");

const L = [`E6-A payload budgets (pre-registered, sealed brief §4) · initial payload <= 1.5 MB · JS <= 300 KB gzipped`];
for (const a of report.arms) {
  L.push(`  ${a.arm}`);
  L.push(`    requests: ${a.requests} · external scripts: ${a.externalScripts}`);
  for (const c of a.checks) L.push(`    [${c.ok ? "PASS" : "FAIL"}] ${c.id}: ${c.val}  (budget ${c.budget})`);
}
L.push(`  ${report.note}`);
L.push(`  RESULT: ${report.pass ? "PASS — both transfer budgets met on every arm" : "FAIL — a transfer budget was exceeded"}`);
console.log(L.join("\n"));
process.exit(report.pass ? 0 : 1);
