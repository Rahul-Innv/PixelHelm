#!/usr/bin/env node
// content-manifest-gate.mjs — the config-driven required-content manifest gate (Gate B).
//
// Usage:  node content-manifest-gate.mjs --manifest <manifest.json> --target <html> [--json]
//
// The ANTI-DELETION floor: a page must not be able to pass the honesty gates by DELETING
// the failing element. Every item declared in the manifest must be PRESENT in BOTH color
// modes; a missing item = FAIL. Renders the target in a REAL browser (Playwright, channel
// fallback) in each mode, reducedMotion=reduce, then checks each required item.
//
// MANIFEST SCHEMA (same shape as the proven gate; see references/honesty-gates.md):
//   {
//     "meta": {                         // optional machine config (docs may live under "_meta")
//       "themeKey": "lw-theme",         // localStorage key the app reads for its theme (optional)
//       "darkAttr": "data-theme",       // <html> attribute set per mode (optional)
//       "modelBlockAttr": "data-model", // attribute that tags a scoped block (default "data-model")
//       "modes": ["dark", "light"]      // color modes to require presence in (default both)
//     },
//     "required": [
//       { "id","description","scope","type","match","minCount"? }, ...
//     ]
//   }
//   scope : "global" (whole page innerText) | "model:<key>" (concatenated innerText of
//           every [modelBlockAttr="<key>"] block)
//   type  : "text"      -> case-insensitive regex (source string) OR array of literal
//                          alternatives, tested against the scoped innerText; honors minCount
//           "href"      -> substring at least one <a href> must contain
//           "dataModel" -> array of block keys, each must have >= 1 element in the DOM
//
// Exit 0 = clean, 1 = any missing item, 2 = runner/config error. --json emits machine-readable.
//
// Dependency-free except Playwright, which is resolved standalone via a multi-path
// createRequire fallback (env override -> sibling pixelhelm-render skill that vendors it
// per plugin version -> plain resolution). Node ESM (top-level await).

import { createRequire } from "node:module";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve, isAbsolute } from "node:path";

const require = createRequire(import.meta.url);
const HERE = dirname(fileURLToPath(import.meta.url));

/* ---------- CLI ---------- */
const argv = process.argv.slice(2);
const JSON_OUT = argv.includes("--json");
function argVal(name) {
  const i = argv.indexOf(name);
  return i >= 0 && i + 1 < argv.length ? argv[i + 1] : null;
}
const die = (m) => { console.error(`content-manifest-gate: ${m}`); process.exit(2); };

const manifestArg = argVal("--manifest");
if (!manifestArg) die("--manifest <manifest.json> is required (see references/honesty-gates.md)");
const manifestPath = isAbsolute(manifestArg) ? manifestArg : resolve(process.cwd(), manifestArg);
let manifest;
try { manifest = JSON.parse(readFileSync(manifestPath, "utf8")); }
catch (e) { die(`cannot read manifest ${manifestPath}: ${e.message}`); }

const meta = manifest.meta || {};
const targetArg = argVal("--target") || meta.target;
if (!targetArg) die("no target: pass --target <html> or set meta.target in the manifest");
const targetPath = isAbsolute(targetArg) ? targetArg : resolve(process.cwd(), targetArg);
const url = "file:///" + targetPath.replace(/\\/g, "/");

const modelBlockAttr = meta.modelBlockAttr || "data-model";
const themeKey = meta.themeKey || null;
const darkAttr = meta.darkAttr || null;
const MODES = meta.modes || ["dark", "light"];

/* ---------- Playwright resolution (standalone, multi-path fallback, no absolute user paths) ---------- */
function requireChromium() {
  const candidates = [
    process.env.PLAYWRIGHT_PKG,
    resolve(HERE, "..", "..", "pixelhelm-render", "package.json"),
    resolve(HERE, "..", "..", "pixelhelm-render", "node_modules", "playwright", "package.json"),
  ].filter(Boolean);
  for (const p of candidates) {
    try { const pw = createRequire(p)("playwright"); if (pw && pw.chromium) return pw.chromium; } catch { /* next */ }
  }
  try { const pw = require("playwright"); if (pw && pw.chromium) return pw.chromium; } catch { /* fall through */ }
  die("Playwright not found. Run `npm i` in the pixelhelm-render skill dir (it vendors playwright per plugin version), or set PLAYWRIGHT_PKG to a package.json that can resolve 'playwright'.");
}
const chromium = requireChromium();

/* ---------- item matching (ported from the proven Gate B) ---------- */
const escLit = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
function itemRegex(match) {
  const src = Array.isArray(match) ? match.map(escLit).join("|") : match;
  return new RegExp(src, "i");
}
function scopeText(cap, scope) {
  if (!scope || scope === "global") return cap.bodyText;
  const key = scope.split(":")[1];
  return cap.blocks.filter((b) => b.key === key).map((b) => b.text).join("\n");
}
function itemPresent(item, cap) {
  const type = item.type || "text";
  if (type === "href") return (cap.hrefs || []).some((h) => h && h.includes(item.match));
  if (type === "dataModel") {
    const keys = Array.isArray(item.match) ? item.match : [item.match];
    const missing = keys.filter((k) => !cap.blockKeys.includes(k));
    return { ok: missing.length === 0, missing };
  }
  const re = itemRegex(item.match);
  const text = scopeText(cap, item.scope);
  const count = (text.match(new RegExp(re.source, "ig")) || []).length;
  const ok = item.minCount ? count >= item.minCount : re.test(text);
  return ok;
}

/* ---------- render one color mode ---------- */
async function capture(browser, mode) {
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 1,
    colorScheme: mode,
    reducedMotion: "reduce",
  });
  const page = await context.newPage();
  if (themeKey) await page.addInitScript(([k, m]) => { try { localStorage.setItem(k, m); } catch (e) {} }, [themeKey, mode]);
  await page.goto(url, { waitUntil: "networkidle" });
  if (darkAttr) await page.evaluate(([attr, m]) => document.documentElement.setAttribute(attr, m), [darkAttr, mode]);
  try { await page.evaluate(() => (document.fonts ? document.fonts.ready : null)); } catch {}
  await page.waitForTimeout(500);
  const cap = await page.evaluate((attr) => ({
    bodyText: document.body.innerText,
    blocks: Array.from(document.querySelectorAll(`[${attr}]`)).map((el) => ({ key: el.getAttribute(attr), text: el.innerText })),
    blockKeys: Array.from(document.querySelectorAll(`[${attr}]`)).map((el) => el.getAttribute(attr)),
    hrefs: Array.from(document.querySelectorAll("a[href]")).map((a) => a.getAttribute("href")),
  }), modelBlockAttr);
  await context.close();
  return cap;
}

/* ---------- run ---------- */
async function launch() {
  const channels = [...new Set([meta.browserChannel, "msedge", "chrome", undefined])];
  for (const channel of channels) {
    try { return await chromium.launch(channel ? { channel } : {}); }
    catch (e) { console.error(`content-manifest-gate: launch ${channel || "bundled chromium"} failed: ${e.message.split("\n")[0]}`); }
  }
  die("could not launch any browser (install Edge/Chrome, or run: npx playwright install chromium)");
}

const browser = await launch();
let caps;
try {
  caps = {};
  for (const mode of MODES) caps[mode] = await capture(browser, mode);
} finally {
  await browser.close();
}

/* ---------- check the manifest in every mode ---------- */
const violations = [];
for (const item of (manifest.required || [])) {
  for (const mode of MODES) {
    const res = itemPresent(item, caps[mode]);
    const ok = typeof res === "object" ? res.ok : res;
    if (!ok) {
      const extra = typeof res === "object" && res.missing ? ` (missing keys: ${res.missing.join(", ")})` : "";
      violations.push({ severity: "HIGH", kind: "MISSING", mode, id: item.id, message: `required "${item.id}" missing in ${mode}: ${item.description}${extra}`, sig: `${item.id}` });
    }
  }
}

/* dedupe identical missing items across modes -> one line listing the modes */
const bySig = new Map();
for (const x of violations) {
  const cur = bySig.get(x.sig);
  if (cur) cur.modes.add(x.mode);
  else bySig.set(x.sig, { ...x, modes: new Set([x.mode]) });
}
const findings = [...bySig.values()];
const fail = findings.length > 0;
const total = (manifest.required || []).length;

/* ---------- report ---------- */
if (JSON_OUT) {
  console.log(JSON.stringify({
    gate: "content-manifest",
    target: targetPath,
    pass: !fail,
    required: total,
    modes: MODES,
    findings: findings.map((f) => ({ severity: f.severity, kind: f.kind, id: f.id, modes: [...f.modes], message: f.message })),
  }, null, 2));
} else {
  const line = (f) => `  [${f.severity}] ${f.kind} {${[...f.modes].join("+")}} — ${f.message}`;
  console.log(`\n=== CONTENT-MANIFEST GATE (Gate B, both modes) — target: ${targetPath} ===`);
  console.log(`  required items: ${total} · modes: ${MODES.join("+")}`);
  console.log(`\nREQUIRED-CONTENT (anti-deletion): ${findings.length ? findings.length + " missing" : "PASS"}`);
  findings.forEach((f) => console.log(line(f)));
  console.log(`\nRESULT: ${fail ? "FAIL" : "PASS (clean)"}  —  ${findings.length} finding(s)\n`);
}

process.exit(fail ? 1 : 0);
