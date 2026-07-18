#!/usr/bin/env node
// perf-budget.mjs — scope-B Performance / Core-Web-Vitals budget lens (MARKETING SURFACES ONLY).
//
// Usage:  node perf-budget.mjs <url> [<url> ...] [--json] [--strict] [--channel msedge|chrome|chromium]
//
// SURFACE-TRIGGERED: run this ONLY for a real marketing web page (profile.surfaceType === "marketing").
// It is meaningless (and misleading) for an in-shell app screen, a data view, or an email.
//
// Drives a real browser (Playwright — same channel-fallback chain as render.mjs) and reports LAB
// Core Web Vitals + a transfer budget. Machine-certain metrics, no model juror (matches the plugin's
// surface-triggered-bench pattern). Budgets (power-design web-rule #16/#17; web.dev CWV):
//   - LCP  < 2500 ms  (lab, single cold load)
//   - CLS  < 0.1      (lab, excludes recent-input shifts)
//   - JS transfer  <= 300 KB
//   - LCP image (hero) transfer <= 200 KB
//   - font families <= 2
//   - images without intrinsic width/height/aspect-ratio = 0 (CLS risk)
//
// LAB, not field: one cold headless load on this machine — directional, not a substitute for RUM.
// Exit 0 by default (advisory); --strict exits 1 on any budget FAIL. Never gates the Layer-1 contrast gate.

import { createRequire } from "node:module";
const require = createRequire(import.meta.url);

const args = process.argv.slice(2);
const asJson = args.includes("--json");
const strict = args.includes("--strict");
const chIdx = args.indexOf("--channel");
const channelPref = chIdx >= 0 ? args[chIdx + 1] : null;
const targets = args.filter((a, i) => !a.startsWith("--") && !(chIdx >= 0 && i === chIdx + 1));

if (!targets.length) {
  console.error("usage: node perf-budget.mjs <url> [...] [--json] [--strict] [--channel ...]");
  process.exit(2);
}

let chromium;
try { ({ chromium } = require("playwright")); }
catch { console.error("perf-budget: needs Playwright (run `npm i` in the pixelhelm-render skill dir)."); process.exit(2); }

const BUDGET = { lcpMs: 2500, cls: 0.1, jsKB: 300, heroKB: 200, fonts: 2, undimImgs: 0 };

async function launch() {
  const chain = [channelPref, "msedge", "chrome", "chromium"].filter(Boolean);
  let lastErr;
  for (const channel of chain) {
    try {
      return channel === "chromium"
        ? await chromium.launch({ headless: true })
        : await chromium.launch({ headless: true, channel });
    } catch (e) { lastErr = e; }
  }
  throw lastErr ?? new Error("no browser channel available");
}

async function measure(browser, url) {
  const context = await browser.newContext();
  const page = await context.newPage();

  // Account transferred WIRE bytes by resource type. Prefer request().sizes().responseBodySize
  // (the ENCODED/on-the-wire body — what a transfer budget actually cares about); a gzipped bundle
  // is a fraction of its decompressed size, so measuring res.body().length would over-report badly.
  const bytes = { script: 0, font: 0, image: 0, stylesheet: 0, document: 0, other: 0 };
  const byUrl = new Map();
  const pending = [];
  page.on("response", (res) => {
    const p = (async () => {
      try {
        const type = res.request().resourceType();
        let n = 0;
        try { const s = await res.request().sizes(); n = s.responseBodySize || 0; } catch { /* sizes unavailable */ }
        if (!n) n = Number(res.headers()["content-length"] || 0);
        const bucket = type in bytes ? type : "other";
        bytes[bucket] += n;
        byUrl.set(res.url(), n);
      } catch { /* redirect/preflight — skip */ }
    })();
    pending.push(p);
  });

  // Observe LCP + CLS in-page.
  await page.addInitScript(() => {
    window.__lcp = 0; window.__cls = 0; window.__lcpUrl = null;
    try {
      new PerformanceObserver((l) => {
        for (const e of l.getEntries()) { window.__lcp = e.startTime; window.__lcpUrl = e.url || (e.element && e.element.currentSrc) || null; }
      }).observe({ type: "largest-contentful-paint", buffered: true });
      new PerformanceObserver((l) => {
        for (const e of l.getEntries()) if (!e.hadRecentInput) window.__cls += e.value;
      }).observe({ type: "layout-shift", buffered: true });
    } catch { /* observer unsupported */ }
  });

  await page.goto(url, { waitUntil: "load", timeout: 45000 });
  await page.waitForLoadState("networkidle").catch(() => {});
  await page.waitForTimeout(400); // let a trailing layout-shift/LCP settle

  const dom = await page.evaluate(() => {
    const fonts = new Set();
    // Count only DOWNLOADED webfont families. Exclude next/font's local size-adjust "Fallback"
    // faces (no network cost) and framework dev-overlay fonts (__nextjs-*, dev only) — both appear
    // in document.fonts but are not downloaded families the budget cares about.
    document.fonts.forEach((f) => {
      const fam = f.family.replace(/["']/g, "");
      if (/fallback$/i.test(fam) || /^__nextjs/i.test(fam)) return;
      fonts.add(fam);
    });
    // images lacking intrinsic sizing → CLS risk
    let undim = 0;
    for (const img of document.querySelectorAll("img")) {
      const hasAttr = img.getAttribute("width") && img.getAttribute("height");
      const cs = getComputedStyle(img);
      const hasAR = cs.aspectRatio && cs.aspectRatio !== "auto";
      if (!hasAttr && !hasAR) undim++;
    }
    return { fonts: [...fonts], fontCount: fonts.size, undimImgs: undim, lcp: window.__lcp || 0, cls: window.__cls || 0, lcpUrl: window.__lcpUrl };
  });

  await Promise.allSettled(pending); // let every response's size() settle before we total
  const heroBytes = dom.lcpUrl ? (byUrl.get(dom.lcpUrl) || 0) : 0;
  await context.close();

  const kb = (n) => Math.round((n / 1024) * 10) / 10;
  const metrics = {
    lcpMs: Math.round(dom.lcp),
    cls: Math.round(dom.cls * 1000) / 1000,
    jsKB: kb(bytes.script),
    heroKB: kb(heroBytes),
    fonts: dom.fontCount,
    fontFamilies: dom.fonts,
    undimImgs: dom.undimImgs,
    transferKB: { js: kb(bytes.script), css: kb(bytes.stylesheet), img: kb(bytes.image), font: kb(bytes.font), doc: kb(bytes.document) },
  };

  const checks = [
    { id: "LCP", val: `${metrics.lcpMs} ms`, ok: metrics.lcpMs > 0 && metrics.lcpMs < BUDGET.lcpMs, budget: `< ${BUDGET.lcpMs} ms`, na: metrics.lcpMs === 0 },
    { id: "CLS", val: `${metrics.cls}`, ok: metrics.cls < BUDGET.cls, budget: `< ${BUDGET.cls}` },
    { id: "JS", val: `${metrics.jsKB} KB`, ok: metrics.jsKB <= BUDGET.jsKB, budget: `<= ${BUDGET.jsKB} KB` },
    { id: "hero", val: `${metrics.heroKB} KB`, ok: metrics.heroKB <= BUDGET.heroKB, budget: `<= ${BUDGET.heroKB} KB (LCP image)` },
    { id: "fonts", val: `${metrics.fonts}`, ok: metrics.fonts <= BUDGET.fonts, budget: `<= ${BUDGET.fonts} families` },
    { id: "img-dims", val: `${metrics.undimImgs} undimensioned`, ok: metrics.undimImgs <= BUDGET.undimImgs, budget: "0 (CLS risk)" },
  ];
  return { metrics, checks };
}

const browser = await launch();
const report = [];
let anyFail = false;
for (const url of targets) {
  try {
    const r = await measure(browser, url);
    if (r.checks.some((c) => !c.ok && !c.na)) anyFail = true;
    report.push({ target: url, ...r });
  } catch (e) {
    anyFail = true;
    report.push({ target: url, error: e.message });
  }
}
await browser.close();

if (asJson) {
  console.log(JSON.stringify({ lens: "perf-budget", note: "LAB metrics, single cold headless load — directional, not RUM.", strict, targets: report }, null, 2));
} else {
  console.log("pixelhelm-render · scope-B performance / CWV budget lens (marketing surfaces only)");
  console.log("  LAB: single cold headless load — directional, not field RUM. Measure JS/transfer against a");
  console.log("  PRODUCTION build (next start / a real deploy); dev servers ship unminified bundles + HMR.");
  for (const r of report) {
    console.log(`\n  ${r.target}`);
    if (r.error) { console.log(`    ERROR: ${r.error}`); continue; }
    for (const c of r.checks) console.log(`    [${c.na ? "n/a " : c.ok ? "PASS" : "FAIL"}] ${c.id}: ${c.val}  (budget ${c.budget})`);
    console.log(`         transfer — js ${r.metrics.transferKB.js} · css ${r.metrics.transferKB.css} · img ${r.metrics.transferKB.img} · font ${r.metrics.transferKB.font} KB · fonts: ${r.metrics.fontFamilies.join(", ") || "none"}`);
  }
  const fails = report.flatMap((r) => (r.checks || []).filter((c) => !c.ok && !c.na)).length;
  console.log(`\n  RESULT: ${fails} budget FAIL across ${targets.length} target(s)${strict ? (anyFail ? " — STRICT: exit 1" : "") : " (advisory)"}`);
}

process.exit(strict && anyFail ? 1 : 0);
