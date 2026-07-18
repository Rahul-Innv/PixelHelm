#!/usr/bin/env node
// derived-claims-gate.mjs — the config-driven derived-claims honesty gate (Gate A).
//
// Usage:  node derived-claims-gate.mjs --config <project-claims.json> [--target <html>] [--json]
//
// Renders the target in a REAL browser (Playwright, channel fallback) in BOTH color
// modes, reducedMotion=reduce, waits for load + settle, reads the rendered innerText,
// then runs the derived-claims diff:
//
//   a. FABRICATION (whole body): every numeric CLAIM token in the rendered body
//      ($ amounts, %, "N of M", day counts, + any extraNumericContexts) must be a
//      member of the ALLOWED NUMBER SET = numbers that legitimately appear in the
//      project's data JSON truth sources UNION the injected derivedFile constants
//      UNION config.globalAllow. A number NOT in the set = invented.
//   b. ASSOCIATION (per tagged block): inside each [modelBlockAttr] block, every $
//      amount must belong to THAT block's own allowed money set (its per-block money
//      set UNION the global money allow-list). A foreign block's figure = association.
//   c. VERDICT NEGATION (honesty): the standalone verdict word (default "BUY",
//      case-sensitive) must not appear UN-negated inside a block whose status is not
//      the positive-verdict status. A provisional block (optional) must additionally
//      carry a provisional marker AND a never/not-a-verdict phrase.
//
// PRINCIPLE (ported from the proven injector pipeline): the gate does arithmetic ONLY
// on literal fields the data already carries. Prefer a derivedFile whose constants were
// COMPUTED ONCE by a build-time injector script and INJECTED — no model, weak or strong,
// is ever asked to do the arithmetic. The gate never reads the clock.
//
// Exit 0 = clean, 1 = any violation, 2 = runner/config error. Human-readable report
// grouped by check + severity; --json emits machine-readable results. See
// references/honesty-gates.md for the config schema, the perBlockMoneyScopes convention,
// and the non-vacuity mutant ritual.
//
// Dependency-free except Playwright, which is resolved standalone via a multi-path
// createRequire fallback (env override -> sibling pixelhelm-render skill that vendors it
// per plugin version -> plain resolution). Node ESM (top-level await).

import { createRequire } from "node:module";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve, isAbsolute, join } from "node:path";

const require = createRequire(import.meta.url);
const HERE = dirname(fileURLToPath(import.meta.url));

/* ---------- CLI ---------- */
const argv = process.argv.slice(2);
const JSON_OUT = argv.includes("--json");
function argVal(name) {
  const i = argv.indexOf(name);
  return i >= 0 && i + 1 < argv.length ? argv[i + 1] : null;
}
const die = (m) => { console.error(`derived-claims-gate: ${m}`); process.exit(2); };

const configArg = argVal("--config");
if (!configArg) die("--config <project-claims.json> is required (see references/honesty-gates.md)");
const configPath = isAbsolute(configArg) ? configArg : resolve(process.cwd(), configArg);
let config;
try { config = JSON.parse(readFileSync(configPath, "utf8")); }
catch (e) { die(`cannot read config ${configPath}: ${e.message}`); }

// paths in the config resolve relative to config.root (default: the config file's dir)
const configDir = dirname(configPath);
const rootDir = config.root
  ? (isAbsolute(config.root) ? config.root : resolve(configDir, config.root))
  : configDir;
const rel = (p) => (isAbsolute(p) ? p : resolve(rootDir, p));

// --target overrides config.target; default is config.target
const targetArg = argVal("--target") || config.target;
if (!targetArg) die("no target: pass --target <html> or set \"target\" in the config");
const targetPath = isAbsolute(targetArg) ? targetArg : resolve(process.cwd(), targetArg);
const url = "file:///" + targetPath.replace(/\\/g, "/");

const modelBlockAttr = config.modelBlockAttr || "data-model";

/* ---------- Playwright resolution (standalone, multi-path fallback, no absolute user paths) ---------- */
function requireChromium() {
  const candidates = [
    process.env.PLAYWRIGHT_PKG,                                                       // explicit override
    resolve(HERE, "..", "..", "pixelhelm-render", "package.json"),                       // sibling skill vendors PW per plugin version
    resolve(HERE, "..", "..", "pixelhelm-render", "node_modules", "playwright", "package.json"),
  ].filter(Boolean);
  for (const p of candidates) {
    try { const pw = createRequire(p)("playwright"); if (pw && pw.chromium) return pw.chromium; } catch { /* next */ }
  }
  try { const pw = require("playwright"); if (pw && pw.chromium) return pw.chromium; } catch { /* fall through */ }
  die("Playwright not found. Run `npm i` in the pixelhelm-render skill dir (it vendors playwright per plugin version), or set PLAYWRIGHT_PKG to a package.json that can resolve 'playwright'.");
}
const chromium = requireChromium();

/* ---------- load truth: data JSON sources + optional injected derived constants ---------- */
const dataFiles = (config.dataFiles || []).map(rel);
const dataObjs = [];
for (const f of dataFiles) {
  try { dataObjs.push(JSON.parse(readFileSync(f, "utf8"))); }
  catch (e) { die(`cannot read dataFile ${f}: ${e.message}`); }
}
let derived = null;
if (config.derivedFile) {
  try { derived = JSON.parse(readFileSync(rel(config.derivedFile), "utf8")); }
  catch (e) { die(`cannot read derivedFile ${config.derivedFile}: ${e.message}`); }
}

/* ---------- allowed-number set (fabrication allow-list) ---------- */
// Ported from the proven gate: number-typed leaves are always allowed. Numbers embedded
// in STRING leaves are also allowed when extractNumbersFromStrings is on (default true) —
// this mirrors the injector's numericTokens extraction (e.g. "RTX 5060, 32GB" -> 5060, 32)
// while EXCLUDING url-bearing fields so tracking ids / skus never pollute the allow-list.
const EXTRACT_STRINGS = config.extractNumbersFromStrings !== false;
const keyOf = (v) => Number(v).toFixed(2);          // formatting-variant tolerant (2231 == 2231.00)
const allowedKeys = new Set();
function addNum(v) { if (typeof v === "number" && isFinite(v)) allowedKeys.add(keyOf(v)); }
function collectNumbers(node, key) {
  if (node === null || node === undefined) return;
  if (typeof node === "number") { addNum(node); return; }
  if (typeof node === "string") {
    if (!EXTRACT_STRINGS) return;
    const m = node.match(/\d[\d,]*(?:\.\d+)?/g);      // comma-aware grouping ("$1,999" -> 1999)
    if (m) m.forEach((s) => { const n = Number(s.replace(/,/g, "")); if (isFinite(n)) allowedKeys.add(keyOf(n)); });
    return;
  }
  if (Array.isArray(node)) { node.forEach((v) => collectNumbers(v, key)); return; }
  if (typeof node === "object") {
    for (const [k, v] of Object.entries(node)) {
      if (/url$/i.test(k)) continue;                 // url, sourceUrl, fallbackUrl, searchUrl
      collectNumbers(v, k);
    }
  }
}
for (const d of dataObjs) collectNumbers(d, "");
if (derived) collectNumbers(derived, "");            // constants, moneySets, pageClaims, numericTokens
(config.globalAllow || []).forEach(addNum);
const isAllowed = (v) => allowedKeys.has(keyOf(v));

/* ---------- per-block money sets + global money allow-list + status map ---------- */
// resolve a dotted path against an object
function atPath(obj, path) {
  if (!path) return obj;
  return path.split(".").reduce((o, k) => (o == null ? o : o[k]), obj);
}
// merge all data objects shallowly so a modelsPath resolves whether it lives in data or derived
function firstAtPath(objs, path) {
  for (const o of objs) { const v = atPath(o, path); if (v !== undefined && v !== null) return v; }
  return undefined;
}

const scopes = config.perBlockMoneyScopes || {};
const globalMoney = new Set();
(config.globalAllow || []).forEach((v) => { if (typeof v === "number") globalMoney.add(keyOf(v)); });
// global money allow can also be pulled from the derivedFile by key name
if (scopes.globalAllowPath && derived) {
  const g = atPath(derived, scopes.globalAllowPath);
  if (Array.isArray(g)) g.forEach((v) => { if (typeof v === "number") globalMoney.add(keyOf(v)); });
}

// Build each block's allowed money set. Source order: the derivedFile's precomputed
// per-block money set (preferred — computed once by the injector), else collect the
// configured money fields straight off the data.
const modelMoney = {};   // blockKey -> Set of allowed money keys (includes global)
const statusOf = {};     // blockKey -> status string
function blockEntries() {
  // returns [ [key, obj], ... ] for the per-model collection (object-keyed OR array)
  const searchObjs = derived ? [derived, ...dataObjs] : dataObjs;
  const coll = scopes.modelsPath ? firstAtPath(searchObjs, scopes.modelsPath) : null;
  if (!coll) return [];
  if (Array.isArray(coll)) {
    const kf = scopes.keyField || "key";
    return coll.filter(Boolean).map((m) => [String(m[kf]), m]);
  }
  return Object.entries(coll);   // object keyed by block key
}
function moneySetFor(obj) {
  const s = new Set();
  const add = (v) => { if (typeof v === "number" && isFinite(v)) s.add(keyOf(v)); };
  // preferred: a precomputed money-set field on the (derived) object
  if (scopes.moneySetField && Array.isArray(obj[scopes.moneySetField])) {
    obj[scopes.moneySetField].forEach(add);
  }
  // fallback / additive: scalar money fields
  for (const f of (scopes.moneyFields || [])) add(obj[f]);
  // fallback / additive: nested arrays of money-bearing objects
  for (const spec of (scopes.moneyArrayFields || [])) {
    const arr = atPath(obj, spec.at);
    if (!Array.isArray(arr)) continue;
    const fields = Array.isArray(spec.fields) ? spec.fields : [spec.fields];
    for (const el of arr) { if (el && typeof el === "object") for (const f of fields) add(el[f]); else add(el); }
  }
  return s;
}
for (const [key, obj] of blockEntries()) {
  const s = new Set(globalMoney);
  for (const k of moneySetFor(obj)) s.add(k);
  modelMoney[key] = s;
  const statusField = (config.verdict && config.verdict.statusField) || "status";
  if (obj && typeof obj === "object" && obj[statusField] != null) statusOf[key] = String(obj[statusField]);
}

/* ---------- verdict-negation config ---------- */
const verdict = config.verdict || {};
const VERDICT_WORD = config.verdictWord || verdict.word || "BUY";
const NEG_WINDOW = Number(config.negationWindow != null ? config.negationWindow : (verdict.negationWindow != null ? verdict.negationWindow : 30));
const NEGATORS = verdict.negators || ["never", "not", "false", "no"];
const POSITIVE_STATUS = verdict.positiveStatus || VERDICT_WORD;   // blocks with this status may carry the word un-negated
const prov = verdict.provisional || null;                          // { status, markerPattern, negationPattern } (optional)
const negatorRe = new RegExp(`\\b(${NEGATORS.map((n) => n.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|")})\\b`, "i");
const verdictRe = new RegExp(`\\b${VERDICT_WORD.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "g");

/* ---------- claim extraction (ported verbatim, plus extraNumericContexts) ---------- */
const MONEY_RE = /[~≈]?\s?[+\-−]?\s?\$\s?\d[\d,]*(?:\.\d{1,2})?/g;
const PCT_RE   = /\d+(?:\.\d+)?\s?%/g;
const NOFM_RE  = /\b(\d+)\s+of\s+(\d+)\b/g;
const DAYS_RE  = /\b(\d+)\s?(?:days?|d)\b/gi;
const parseMoney = (raw) => Number(raw.replace(/[~≈+\-−$,\s]/g, ""));
const ctx = (text, idx, len) =>
  text.slice(Math.max(0, idx - 30), idx + len + 30).replace(/\s+/g, " ").trim();

const wantCtx = config.numericContexts || {};      // { money, percent, count, days } booleans (default all on)
const on = (name) => wantCtx[name] !== false;
// extraNumericContexts: [ { kind, pattern, flags?, group? } ] — each match's captured number
// (group N, default 0) is validated against the allow-list like the built-in kinds.
const extraContexts = (config.extraNumericContexts || []).map((c) => ({
  kind: c.kind || "extra",
  re: new RegExp(c.pattern, c.flags && c.flags.includes("g") ? c.flags : (c.flags || "") + "g"),
  group: c.group || 0,
}));
const cleanNum = (s) => Number(String(s).replace(/[,\s$]/g, ""));

function extractClaims(text) {
  const out = [];
  let mm;
  if (on("money")) { MONEY_RE.lastIndex = 0; while ((mm = MONEY_RE.exec(text))) out.push({ kind: "money", raw: mm[0].trim(), value: parseMoney(mm[0]), index: mm.index }); }
  if (on("percent")) { PCT_RE.lastIndex = 0; while ((mm = PCT_RE.exec(text))) out.push({ kind: "percent", raw: mm[0].trim(), value: parseFloat(mm[0]), index: mm.index }); }
  if (on("count")) {
    NOFM_RE.lastIndex = 0;
    while ((mm = NOFM_RE.exec(text))) {
      out.push({ kind: "count", raw: mm[0], value: Number(mm[1]), index: mm.index });
      out.push({ kind: "count", raw: mm[0], value: Number(mm[2]), index: mm.index });
    }
  }
  if (on("days")) { DAYS_RE.lastIndex = 0; while ((mm = DAYS_RE.exec(text))) out.push({ kind: "days", raw: mm[0], value: Number(mm[1]), index: mm.index }); }
  for (const c of extraContexts) {
    c.re.lastIndex = 0;
    while ((mm = c.re.exec(text))) {
      const raw = mm[c.group] != null ? mm[c.group] : mm[0];
      const value = cleanNum(raw);
      if (isFinite(value)) out.push({ kind: c.kind, raw: String(mm[0]).trim(), value, index: mm.index });
    }
  }
  return out;
}
function extractMoney(text) {
  const out = [];
  let mm; MONEY_RE.lastIndex = 0;
  while ((mm = MONEY_RE.exec(text))) out.push({ raw: mm[0].trim(), value: parseMoney(mm[0]), index: mm.index });
  return out;
}

/* ---------- render one color mode ---------- */
const themeKey = config.themeKey || (config.theme && config.theme.key) || null;   // optional localStorage theme key
const darkAttr = config.darkAttr || null;                                          // optional <html> attribute
const MODES = config.modes || ["dark", "light"];
async function capture(browser, mode) {
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 1,
    colorScheme: mode,                 // mechanism 1: media
    reducedMotion: "reduce",
  });
  const page = await context.newPage();
  if (themeKey) await page.addInitScript(([k, m]) => { try { localStorage.setItem(k, m); } catch (e) {} }, [themeKey, mode]); // mechanism 2: app theme key
  await page.goto(url, { waitUntil: "networkidle" });
  if (darkAttr) await page.evaluate(([attr, m]) => document.documentElement.setAttribute(attr, m), [darkAttr, mode]);
  try { await page.evaluate(() => (document.fonts ? document.fonts.ready : null)); } catch {}
  await page.waitForTimeout(500);
  const cap = await page.evaluate((attr) => ({
    bodyText: document.body.innerText,
    blocks: Array.from(document.querySelectorAll(`[${attr}]`)).map((el) => ({
      key: el.getAttribute(attr),
      text: el.innerText,
    })),
    blockKeys: Array.from(document.querySelectorAll(`[${attr}]`)).map((el) => el.getAttribute(attr)),
  }), modelBlockAttr);
  await context.close();
  return cap;
}

/* ---------- the derived-claims diff for one mode ---------- */
function checkMode(cap, mode) {
  const v = [];

  // a. FABRICATION (whole body)
  for (const c of extractClaims(cap.bodyText)) {
    if (!isAllowed(c.value)) {
      v.push({
        severity: "HIGH", kind: "FABRICATION", mode,
        message: `invented ${c.kind} "${c.raw}" (=${c.value}) not in data or derived constants — …${ctx(cap.bodyText, c.index, c.raw.length)}…`,
        sig: `FAB|${c.value}|${c.raw}`,
      });
    }
  }

  // b. ASSOCIATION (per tagged block)
  for (const b of cap.blocks) {
    const allow = modelMoney[b.key];
    if (!allow) continue;   // an unknown block key is the manifest gate's concern
    for (const money of extractMoney(b.text)) {
      if (!allow.has(keyOf(money.value))) {
        v.push({
          severity: "HIGH", kind: "ASSOCIATION", mode,
          message: `money "${money.raw}" (=${money.value}) inside [${modelBlockAttr}="${b.key}"] is not that block's figure — …${ctx(b.text, money.index, money.raw.length)}…`,
          sig: `ASSOC|${b.key}|${money.value}`,
        });
      }
    }
  }

  // c. VERDICT NEGATION — un-negated standalone verdict word in a non-positive block
  for (const b of cap.blocks) {
    if (statusOf[b.key] === POSITIVE_STATUS) continue;
    let mm; verdictRe.lastIndex = 0;
    while ((mm = verdictRe.exec(b.text))) {
      const before = b.text.slice(Math.max(0, mm.index - NEG_WINDOW), mm.index);
      if (!negatorRe.test(before)) {
        v.push({
          severity: "CRITICAL", kind: "VERDICT", mode,
          message: `un-negated "${VERDICT_WORD}" inside non-${POSITIVE_STATUS} block [${modelBlockAttr}="${b.key}"] — …${ctx(b.text, mm.index, VERDICT_WORD.length)}…`,
          sig: `VERDICT|${b.key}|${mm.index}`,
        });
      }
    }
  }

  // c. VERDICT NEGATION — provisional block must carry a marker AND a never/not-a-verdict phrase
  if (prov) {
    const provStatus = prov.status || "PROVISIONAL";
    const markerRE = prov.markerPattern ? new RegExp(prov.markerPattern, "i") : /provisional|unverified|estimate|≈/i;
    const negRE = prov.negationPattern ? new RegExp(prov.negationPattern, "i")
      : new RegExp(`never a ${VERDICT_WORD}|not a ${VERDICT_WORD}|false ${VERDICT_WORD}|no ${VERDICT_WORD}|never[\\s\\S]{0,20}${VERDICT_WORD}|not[\\s\\S]{0,20}${VERDICT_WORD}`, "i");
    const provKeys = Object.keys(statusOf).filter((k) => statusOf[k] === provStatus);
    for (const key of provKeys) {
      const text = cap.blocks.filter((b) => b.key === key).map((b) => b.text).join("\n");
      if (!markerRE.test(text)) v.push({ severity: "CRITICAL", kind: "VERDICT", mode, message: `provisional block [${modelBlockAttr}="${key}"] is missing a provisional/unverified marker`, sig: `PROVMARK|${key}` });
      if (!negRE.test(text)) v.push({ severity: "CRITICAL", kind: "VERDICT", mode, message: `provisional block [${modelBlockAttr}="${key}"] is missing a never/not-a-${VERDICT_WORD} phrase`, sig: `PROVNEG|${key}` });
    }
  }

  return v;
}

/* ---------- run ---------- */
async function launch() {
  const channels = [...new Set([config.browserChannel, "msedge", "chrome", undefined])];
  for (const channel of channels) {
    try { return await chromium.launch(channel ? { channel } : {}); }
    catch (e) { console.error(`derived-claims-gate: launch ${channel || "bundled chromium"} failed: ${e.message.split("\n")[0]}`); }
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

let violations = [];
for (const mode of MODES) violations = violations.concat(checkMode(caps[mode], mode));

/* dedupe identical findings across modes -> one line listing the modes */
const bySig = new Map();
for (const x of violations) {
  const cur = bySig.get(x.sig);
  if (cur) cur.modes.add(x.mode);
  else bySig.set(x.sig, { ...x, modes: new Set([x.mode]) });
}
const findings = [...bySig.values()];
const fail = findings.length > 0;

/* ---------- report ---------- */
if (JSON_OUT) {
  console.log(JSON.stringify({
    gate: "derived-claims",
    target: targetPath,
    pass: !fail,
    allowedNumbers: allowedKeys.size,
    blocks: Object.keys(modelMoney).length,
    findings: findings.map((f) => ({ severity: f.severity, kind: f.kind, modes: [...f.modes], message: f.message })),
  }, null, 2));
} else {
  const sevRank = { CRITICAL: 0, HIGH: 1, MEDIUM: 2 };
  const line = (f) => `  [${f.severity}] ${f.kind} {${[...f.modes].join("+")}} — ${f.message}`;
  console.log(`\n=== DERIVED-CLAIMS GATE (Gate A) — target: ${targetPath} ===`);
  console.log(`  allowed numbers: ${allowedKeys.size} · tagged blocks: ${Object.keys(modelMoney).length} · modes: ${MODES.join("+")}`);
  console.log(`\nFABRICATION / ASSOCIATION / VERDICT: ${findings.length ? findings.length + " violation(s)" : "PASS"}`);
  findings.sort((a, b) => sevRank[a.severity] - sevRank[b.severity]).forEach((f) => console.log(line(f)));
  console.log(`\nRESULT: ${fail ? "FAIL" : "PASS (clean)"}  —  ${findings.length} finding(s)\n`);
}

process.exit(fail ? 1 : 0);
