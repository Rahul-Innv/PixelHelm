#!/usr/bin/env node
// static-gates.mjs — browser-free Layer-1 design gates for the front-end-design skill suite.
//
// Usage:  node static-gates.mjs <profile.json> [--json]
// Exit 1  iff a HARD gate fails (contrast). Exit 2 on runner error. 0 otherwise.
// Findings from soft gates are ALWAYS reported but never change the exit code (v1).
//
// Philosophy (see references/layer-1-gates.md): only CERTAIN, fully-computable checks hard-gate.
// Contrast is hard (we recompute WCAG 2.x exactly, reusing the project's own gated
// contract when it exports one). Raw-color conformance, anti-cliché, and type-scale are
// reported for human judgement — they have real false-positive surface.
//
// Dependency-free, network-free. Node ESM (top-level await for the dynamic import).

import { readFileSync, readdirSync, statSync } from "node:fs";
import { resolve, join, relative, extname, isAbsolute } from "node:path";
import { pathToFileURL } from "node:url";

const profilePath = process.argv[2];
const asJson = process.argv.includes("--json");
if (!profilePath) {
  console.error("usage: node static-gates.mjs <profile.json> [--json]");
  process.exit(2);
}
const die = (m) => { console.error(`static-gates: ${m}`); process.exit(2); };

let profile;
try { profile = JSON.parse(readFileSync(profilePath, "utf8")); }
catch (e) { die(`cannot read profile ${profilePath}: ${e.message}`); }

const root = isAbsolute(profile.root) ? profile.root : resolve(profilePath, "..", profile.root);

// ---- bundled WCAG 2.x engine (fallback when the project module exports none) ----
function parseColor(value) {
  const v = String(value).trim();
  const hex = v.match(/^#([0-9a-fA-F]{6})$/);
  if (hex) { const n = parseInt(hex[1], 16); return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255, a: 1 }; }
  const rgba = v.match(/^rgba?\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)\s*(?:,\s*([\d.]+)\s*)?\)$/);
  if (rgba) return { r: +rgba[1], g: +rgba[2], b: +rgba[3], a: rgba[4] === undefined ? 1 : +rgba[4] };
  throw new Error(`Unparseable color: ${value}`);
}
function composite(value, backdrop) {
  const f = parseColor(value);
  if (f.a >= 1) return { r: f.r, g: f.g, b: f.b };
  const b = parseColor(backdrop);
  const mix = (c, d) => Math.round(c * f.a + d * (1 - f.a));
  return { r: mix(f.r, b.r), g: mix(f.g, b.g), b: mix(f.b, b.b) };
}
const chan = (c) => { const cs = c / 255; return cs <= 0.04045 ? cs / 12.92 : Math.pow((cs + 0.055) / 1.055, 2.4); };
const lum = ({ r, g, b }) => 0.2126 * chan(r) + 0.7152 * chan(g) + 0.0722 * chan(b);
function contrastRatio(fg, bg, backdrop = "#FFFFFF") {
  const L1 = lum(composite(fg, backdrop)), L2 = lum(composite(bg, backdrop));
  const [hi, lo] = L1 >= L2 ? [L1, L2] : [L2, L1];
  return (hi + 0.05) / (lo + 0.05);
}

// ---- load the project token module (preferred: it carries the real AA contract) ----
let mod = null;
if (profile.tokenModule) {
  const abs = resolve(root, profile.tokenModule);
  try { mod = await import(pathToFileURL(abs).href); }
  catch (e) { die(`cannot import tokenModule ${abs}: ${e.message}`); }
}

// ---- GATE: contrast (HARD) ----
const contrast = { hard: true, ran: false, pass: true, total: 0, failures: [] };
function recordContrast(results) {
  contrast.ran = true;
  contrast.total = results.length;
  contrast.failures = results.filter((r) => !r.pass)
    .map((r) => ({ mode: r.mode, fg: r.fg, bg: r.bg, kind: r.kind, ratio: r.ratio, threshold: r.threshold }));
  contrast.pass = contrast.failures.length === 0;
}
if (mod && typeof mod.evaluateGatedPairs === "function") {
  recordContrast(mod.evaluateGatedPairs());                       // reuse the project's real contract
} else if (profile.tokens && profile.gatedPairs) {
  const TH = { text: 4.5, graphic: 3 };
  const results = [];
  for (const m of Object.keys(profile.tokens)) {
    const backdrop = profile.tokens[m].surface || "#FFFFFF";
    for (const p of profile.gatedPairs) for (const on of p.on) {
      const fg = profile.tokens[m][p.fg], bg = profile.tokens[m][on];
      if (fg === undefined || bg === undefined) continue;
      const ratio = Math.round(contrastRatio(fg, bg, backdrop) * 100) / 100;
      results.push({ mode: m, fg: p.fg, bg: on, kind: p.kind, threshold: TH[p.kind], ratio, pass: ratio >= TH[p.kind] });
    }
  }
  recordContrast(results);
}

// ---- file walk (for raw-color + anti-cliché) ----
const exts = new Set(profile.sourceExts || [".ts", ".tsx", ".js", ".jsx", ".css"]);
const ignore = (profile.ignore || ["node_modules", ".next", ".git", "dist", "build", "coverage"]).map((s) => s.replace(/\\/g, "/"));
const allow = new Set((profile.allowRawColorIn || []).map((s) => s.replace(/\\/g, "/")));
const files = [];
function walk(dir) {
  let ents; try { ents = readdirSync(dir); } catch { return; }
  for (const name of ents) {
    const abs = join(dir, name);
    const rel = relative(root, abs).replace(/\\/g, "/");
    if (ignore.some((ig) => rel === ig || rel.startsWith(ig + "/") || rel.includes("/" + ig + "/") || rel.endsWith("/" + ig))) continue;
    let st; try { st = statSync(abs); } catch { continue; }
    if (st.isDirectory()) walk(abs);
    else if (exts.has(extname(name))) files.push(rel);
  }
}
for (const d of (profile.sourceDirs || ["src"])) walk(resolve(root, d));

// color-shaped hex only (3/4/6/8 digits) to cut false positives
const HEX = /#(?:[0-9a-fA-F]{8}|[0-9a-fA-F]{6}|[0-9a-fA-F]{4}|[0-9a-fA-F]{3})\b/g;
const FUNC = /\b(?:rgb|rgba|hsl|hsla)\(/;
const CAP = 50;
// web-craft mechanical signals (SOFT — reported for judgement, never a hard gate):
//  (a) a TEXT color at reduced opacity — an inline opacity ESCAPES the token-contrast lockstep
//      (which gates full-opacity pairs only), so a sub-AA composite can ship invisibly to the gate
//      (proven on Lentova 2026-07-06: text-on-surface-variant/70 -> 3.99:1). Matches the Tailwind
//      text-color opacity modifier + an alpha/8-digit-hex CSS `color:`.
//  (b) justified body text — the web has no hyphenation engine, so justify opens rivers.
// Both are advisory: composite the alpha and re-check AA / confirm the align is intentional.
// TW: the text-COLOR opacity modifier (text-<token>/NN). The negative lookahead excludes the
// font-size/line-height shorthand (text-sm/6, text-base/7, text-lg/8); the [a-z] first char
// already excludes 2xl..9xl. bg-*/NN and border-*/NN are not `text-`, so they never match.
const TEXT_OPACITY_TW = /\btext-(?!(?:xs|sm|base|lg|xl)\/\d)[a-z][a-z0-9-]+\/\d{1,3}\b/g;
// CSS: an alpha/8-digit-hex on the TEXT `color:` property only — the lookbehind excludes
// background-color / border-color / *-color and --custom-props (a translucent scrim/border is not
// the text-contrast dodge this flags).
const TEXT_OPACITY_CSS = /(?<![-a-z])color\s*:\s*(?:#[0-9a-fA-F]{8}\b|rgba\([^)]*,\s*0?\.\d+\s*\)|hsla\([^)]*,\s*0?\.\d+\s*\)|(?:rgb|hsl)\([^)]*\/\s*(?:0?\.\d+|\d{1,3}%)\s*\))/gi;
const JUSTIFY = /\btext-justify\b|text-align\s*:\s*justify/gi;
const rawColor = { hard: false, ran: true, pass: true, count: 0, findings: [] };
const antiCliche = { hard: false, ran: true, pass: true, count: 0, findings: [] };
const webCraft = { hard: false, ran: true, pass: true, count: 0, findings: [] };
const clusters = profile.bannedClusters || [];
for (const rel of files) {
  const isAllowed = allow.has(rel);
  let text; try { text = readFileSync(resolve(root, rel), "utf8"); } catch { continue; }
  const lines = text.split(/\r?\n/);
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (!isAllowed) {
      let m; HEX.lastIndex = 0;
      while ((m = HEX.exec(line))) { rawColor.count++; if (rawColor.findings.length < CAP) rawColor.findings.push({ file: rel, line: i + 1, match: m[0] }); }
      if (FUNC.test(line)) { rawColor.count++; if (rawColor.findings.length < CAP) rawColor.findings.push({ file: rel, line: i + 1, match: line.trim().slice(0, 80) }); }
    }
    for (const c of clusters) for (const needle of (c.any || [])) {
      if (line.toLowerCase().includes(String(needle).toLowerCase())) { antiCliche.count++; if (antiCliche.findings.length < CAP) antiCliche.findings.push({ cluster: c.id, file: rel, line: i + 1, match: needle }); }
    }
    // web-craft mechanical signals (applies to ALL files — not gated by the raw-color allow-list)
    let wm;
    TEXT_OPACITY_TW.lastIndex = 0;
    while ((wm = TEXT_OPACITY_TW.exec(line))) { webCraft.count++; if (webCraft.findings.length < CAP) webCraft.findings.push({ kind: "text-opacity", file: rel, line: i + 1, match: wm[0] }); }
    TEXT_OPACITY_CSS.lastIndex = 0;
    while ((wm = TEXT_OPACITY_CSS.exec(line))) { webCraft.count++; if (webCraft.findings.length < CAP) webCraft.findings.push({ kind: "text-opacity", file: rel, line: i + 1, match: wm[0].trim().slice(0, 60) }); }
    JUSTIFY.lastIndex = 0;
    while ((wm = JUSTIFY.exec(line))) { webCraft.count++; if (webCraft.findings.length < CAP) webCraft.findings.push({ kind: "justified", file: rel, line: i + 1, match: wm[0] }); }
  }
}
rawColor.pass = rawColor.count === 0;
antiCliche.pass = antiCliche.count === 0;
webCraft.pass = webCraft.count === 0;

// ---- type-scale ratios (ADVISORY — report, never gate) ----
const typeScale = { hard: false, ran: false, ratios: [] };
const ts = (mod && mod.scales && mod.scales.type) || profile.typeScale;
if (ts) {
  typeScale.ran = true;
  const steps = Object.entries(ts)
    .map(([k, v]) => [k, v && typeof v === "object" ? v.size : v])
    .filter(([, s]) => typeof s === "number")
    .sort((a, b) => b[1] - a[1]);
  for (let i = 0; i < steps.length - 1; i++) {
    const ratio = Math.round((steps[i][1] / steps[i + 1][1]) * 1000) / 1000;
    typeScale.ratios.push({ from: steps[i][0], to: steps[i + 1][0], ratio, belowAdvisory: ratio < 1.2 });
  }
}

const report = {
  project: profile.project || "(unnamed)",
  filesScanned: files.length,
  gates: { contrast, rawColor, antiCliche, webCraft, typeScale },
  hardGatesPassed: contrast.ran ? contrast.pass : true,
};

if (asJson) {
  console.log(JSON.stringify(report, null, 2));
} else {
  const ok = (b) => (b ? "PASS" : "FAIL");
  const L = [];
  L.push(`pixelhelm-evaluate · static Layer-1 gates · ${report.project}`);
  L.push(`  files scanned: ${files.length}`);
  if (contrast.ran) {
    L.push(`  [HARD] contrast (WCAG 2.2, both modes): ${ok(contrast.pass)} — ${contrast.total - contrast.failures.length}/${contrast.total} gated pairs`);
    for (const f of contrast.failures) L.push(`         x [${f.mode}] ${f.fg} on ${f.bg} (${f.kind}) ${f.ratio}:1 < ${f.threshold}:1`);
  } else {
    L.push(`  [HARD] contrast: SKIPPED (profile has no evaluateGatedPairs export and no tokens+gatedPairs)`);
  }
  L.push(`  [soft] token-conformance (raw color outside allow-list): ${rawColor.count === 0 ? "clean" : rawColor.count + " found"}`);
  for (const f of rawColor.findings.slice(0, 15)) L.push(`         - ${f.file}:${f.line}  ${f.match}`);
  if (rawColor.findings.length < rawColor.count) L.push(`         ...and ${rawColor.count - rawColor.findings.length} more`);
  L.push(`  [soft] anti-cliche: ${antiCliche.count === 0 ? "clean" : antiCliche.count + " found"}`);
  for (const f of antiCliche.findings.slice(0, 15)) L.push(`         - [${f.cluster}] ${f.file}:${f.line}  ${f.match}`);
  L.push(`  [soft] web-craft (opacity-composited text / justified text — see references/web-craft-rulebook.md): ${webCraft.count === 0 ? "clean" : webCraft.count + " found"}`);
  for (const f of webCraft.findings.slice(0, 15)) L.push(`         - [${f.kind}] ${f.file}:${f.line}  ${f.match}`);
  if (webCraft.findings.length < webCraft.count) L.push(`         ...and ${webCraft.count - webCraft.findings.length} more`);
  if (typeScale.ran) {
    const flagged = typeScale.ratios.filter((r) => r.belowAdvisory);
    L.push(`  [info] type-scale: ${typeScale.ratios.length} steps (${flagged.length} below the 1.2x advisory — review, not a fail)`);
    for (const r of flagged) L.push(`         . ${r.from}->${r.to} = ${r.ratio}x`);
  }
  L.push(`  RESULT: hard gates ${report.hardGatesPassed ? "PASSED" : "FAILED"}`);
  console.log(L.join("\n"));
}
process.exit(report.hardGatesPassed ? 0 : 1);
