// verify_lib.mjs — shared plumbing for the browser-arm Layer-1 floor validators
// (verify_responsive / verify_states / verify_focustrap / verify_targetsize) and the
// behavior-level validators (verify_scrollcapture / verify_frametime / verify_cwv /
// verify_keyboard).
//
// Node-side only. In-page audit functions stay self-contained inside each validator
// (they are serialized into the page; they may not close over imports). The one
// exception is pageReadiness() below: it is shared ORCHESTRATION whose serialized
// in-page function is fully self-contained inside this file. Pure math lives here so
// the offline eval suite can exercise it without a browser.

import { resolve, dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { createRequire } from "node:module";

// ---- playwright resolution ----
// Playwright is installed per plugin version in the SIBLING render skill (its
// package.json owns the dependency — one engine for the whole plugin, never two).
// Resolution order: normal import (works when the evaluate skill dir has its own
// install) -> the render skill's install. Missing dep = loud exit 2, never a
// silent skip (layer-1-gates.md run profile).
export async function loadPlaywright() {
  // CJS interop: a direct file-URL import of playwright's entry surfaces the exports on
  // `default` — normalize so callers always destructure { chromium } from the result.
  const norm = (mod) => (mod && mod.chromium ? mod : mod && mod.default && mod.default.chromium ? mod.default : null);
  try { const m = norm(await import("playwright")); if (m) return m; } catch {}
  const here = dirname(fileURLToPath(import.meta.url));
  const renderSkill = resolve(here, "..", "..", "design-render");
  try {
    const req = createRequire(join(renderSkill, "scripts", "render.mjs"));
    const m = norm(await import(pathToFileURL(req.resolve("playwright")).href));
    if (m) return m;
  } catch {}
  console.error(`verify: playwright is not installed for THIS plugin version (the install dir is per-version — re-run after every plugin update).
Fix — run in ${renderSkill}:
  bash:        PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1 npm i
  PowerShell:  $env:PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD='1'; npm i
(uses your system Edge/Chrome — no browser download; without one, drop the env var or run: npx playwright install chromium)`);
  process.exit(2);
}

// Fallback chain: configured channel -> Edge -> Chrome -> bundled chromium
// (same chain as the render skill's render.mjs; dedup, keep order).
export async function launchBrowser(chromium, channel) {
  const channels = [...new Set([channel, "msedge", "chrome", undefined].filter((c, i, a) => a.indexOf(c) === i))];
  for (const ch of channels) {
    try { return await chromium.launch(ch ? { channel: ch } : {}); }
    catch (e) { console.error(`verify: launch ${ch || "bundled chromium"} failed: ${e.message.split("\n")[0]}`); }
  }
  console.error("verify: could not launch any browser (install Edge/Chrome, or run: npx playwright install chromium)");
  process.exit(2);
}

// Resolve a positional target (file path or http[s] URL) to a navigable URL.
export function targetToUrl(target, baseDir = process.cwd()) {
  if (/^https?:\/\//i.test(target)) return target;
  return pathToFileURL(resolve(baseDir, target)).href;
}

// ---- WCAG 2.x contrast math (same engine as static-gates.mjs) ----
export function parseColor(value) {
  const v = String(value).trim();
  const hex6 = v.match(/^#([0-9a-fA-F]{6})$/);
  if (hex6) { const n = parseInt(hex6[1], 16); return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255, a: 1 }; }
  const hex8 = v.match(/^#([0-9a-fA-F]{8})$/);
  if (hex8) { const n = parseInt(hex8[1].slice(0, 6), 16); return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255, a: parseInt(hex8[1].slice(6), 16) / 255 }; }
  const rgba = v.match(/^rgba?\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)\s*(?:,\s*([\d.]+)\s*)?\)$/);
  if (rgba) return { r: +rgba[1], g: +rgba[2], b: +rgba[3], a: rgba[4] === undefined ? 1 : +rgba[4] };
  throw new Error(`Unparseable color: ${value}`);
}

// Composite a foreground color over a backdrop stack (nearest layer first, the
// LAST entry must be opaque — the caller marks the stack indeterminate otherwise).
export function compositeStack(stack) {
  let acc = null;
  for (let i = stack.length - 1; i >= 0; i--) {
    const c = parseColor(stack[i]);
    if (acc === null) { acc = { r: c.r, g: c.g, b: c.b }; continue; }
    const mix = (f, b) => Math.round(f * c.a + b * (1 - c.a));
    acc = { r: mix(c.r, acc.r), g: mix(c.g, acc.g), b: mix(c.b, acc.b) };
  }
  return acc;
}

const chan = (c) => { const cs = c / 255; return cs <= 0.04045 ? cs / 12.92 : Math.pow((cs + 0.055) / 1.055, 2.4); };
export const luminance = ({ r, g, b }) => 0.2126 * chan(r) + 0.7152 * chan(g) + 0.0722 * chan(b);

// fg may carry alpha: it is composited over the resolved background first.
export function contrastRatio(fgValue, bgRgb) {
  const f = parseColor(fgValue);
  const mix = (c, b) => Math.round(c * f.a + b * (1 - f.a));
  const fgRgb = f.a >= 1 ? f : { r: mix(f.r, bgRgb.r), g: mix(f.g, bgRgb.g), b: mix(f.b, bgRgb.b) };
  const L1 = luminance(fgRgb), L2 = luminance(bgRgb);
  const [hi, lo] = L1 >= L2 ? [L1, L2] : [L2, L1];
  return Math.round(((hi + 0.05) / (lo + 0.05)) * 100) / 100;
}

// WCAG 2.2 large-text rule: >= 24px, or >= 18.66px at bold weight.
export function isLargeText(fontSizePx, fontWeight) {
  return fontSizePx >= 24 || (fontSizePx >= 18.66 && Number(fontWeight) >= 700);
}

// ---- WCAG 2.2 target-size (2.5.8) spacing-exception geometry ----
// An undersized target still conforms if a 24px-diameter circle centered on its
// bounding box intersects neither another target nor another undersized target's
// circle. rects: {x, y, w, h}.
export const rectCenter = (r) => ({ x: r.x + r.w / 2, y: r.y + r.h / 2 });

export function circleIntersectsRect(cx, cy, radius, rect) {
  const nx = Math.max(rect.x, Math.min(cx, rect.x + rect.w));
  const ny = Math.max(rect.y, Math.min(cy, rect.y + rect.h));
  const dx = cx - nx, dy = cy - ny;
  return dx * dx + dy * dy < radius * radius;
}

export function circleIntersectsCircle(c1, c2, radius) {
  const dx = c1.x - c2.x, dy = c1.y - c2.y;
  return dx * dx + dy * dy < (radius * 2) * (radius * 2);
}

// True iff the spacing exception saves the undersized target at index i.
export function spacingExceptionHolds(i, rects, undersizedIdx, radius = 12) {
  const c = rectCenter(rects[i]);
  for (let j = 0; j < rects.length; j++) {
    if (j === i) continue;
    if (circleIntersectsRect(c.x, c.y, radius, rects[j])) return false;
    if (undersizedIdx.has(j) && circleIntersectsCircle(c, rectCenter(rects[j]), radius)) return false;
  }
  return true;
}

// ---- page-readiness contract (behavior-level validators) ----
// A capture is trustworthy only when the page has DECLARED and REACHED a ready
// state. The contract, embedded verbatim in every report that uses it:
//   1. document.readyState === "complete";
//   2. document.fonts.ready has resolved (no font-swap reflow pending);
//   3. layout settled: `samples` consecutive rAF frames with identical document
//      scrollWidth x scrollHeight;
//   4. animations at a DECLARED state — "killed" (CSS animations/transitions/
//      smooth-scroll disabled; the settled layout is the resting layout) or
//      "running" (left alive on purpose, e.g. to measure their frame cost; a
//      page whose LAYOUT never settles then reports layoutSettled:false and the
//      caller decides whether that violates its contract).
// Returns the evidence object. Callers treat layoutSettled:false as a contract
// violation unless animations are deliberately "running".
export const KILL_MOTION_CSS =
  "*, *::before, *::after { transition: none !important; animation: none !important; scroll-behavior: auto !important; }";

export async function pageReadiness(page, { animations = "killed", samples = 3, timeoutMs = 5000 } = {}) {
  if (animations === "killed") {
    try { await page.addStyleTag({ content: KILL_MOTION_CSS }); } catch {}
  }
  // Self-contained in-page probe (serialized — may not close over anything here).
  const evidence = await page.evaluate(async ({ samples, timeoutMs }) => {
    const t0 = performance.now();
    if (document.fonts && document.fonts.ready) { try { await document.fonts.ready; } catch {} }
    const raf = () => new Promise((r) => requestAnimationFrame(() => r()));
    let stable = 0, frames = 0, last = null;
    while (stable < samples && performance.now() - t0 < timeoutMs) {
      await raf(); frames++;
      const d = document.documentElement;
      const now = `${d.scrollWidth}x${d.scrollHeight}`;
      stable = now === last ? stable + 1 : 0;
      last = now;
    }
    return {
      readyState: document.readyState,
      fontsLoaded: !document.fonts || document.fonts.status === "loaded",
      layoutSettled: stable >= samples,
      settleFrames: frames,
      documentGeometry: last,
      waitedMs: Math.round(performance.now() - t0),
    };
  }, { samples, timeoutMs });
  return { animations, samples, timeoutMs, ...evidence };
}

// ---- percentile math (frame-time / latency budgets) ----
// Nearest-rank percentile, deterministic and interpolation-free: the value at
// ceil(p/100 * n) of the ascending-sorted samples (p in (0, 100]). p=100 = max.
export function percentile(values, p) {
  if (!Array.isArray(values) || values.length === 0) return null;
  const sorted = [...values].sort((a, b) => a - b);
  const rank = Math.max(1, Math.min(sorted.length, Math.ceil((p / 100) * sorted.length)));
  return sorted[rank - 1];
}

// ---- computed-style diff (focus-indicator evidence) ----
// Pure diff of two style snapshots (plain string->string objects): the sorted list
// of keys whose values differ. Empty result = NOTHING visually responded.
export function diffStyles(before, after) {
  const keys = new Set([...Object.keys(before || {}), ...Object.keys(after || {})]);
  const changed = [];
  for (const k of keys) if ((before?.[k] ?? "") !== (after?.[k] ?? "")) changed.push(k);
  return changed.sort();
}

// ---- shared CLI helpers ----
export function splitFlags(argv) {
  const flags = {};
  const targets = [];
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a.startsWith("--")) {
      const next = argv[i + 1];
      flags[a.slice(2)] = next !== undefined && !next.startsWith("--") ? argv[++i] : true;
    } else targets.push(a);
  }
  return { flags, targets };
}

export function printFindings(lines, findings, indent = "    ") {
  const MARK = { pass: "PASS", warn: "warn", fail: "FAIL", info: "info" };
  for (const f of findings) lines.push(`${indent}[${MARK[f.level] || f.level}] ${f.id}: ${f.msg}`);
}
