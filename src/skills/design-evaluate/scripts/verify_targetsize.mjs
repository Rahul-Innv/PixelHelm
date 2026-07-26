#!/usr/bin/env node
// verify_targetsize.mjs — Layer-1 HARD gate: WCAG 2.2 2.5.8 Target Size (Minimum), beyond axe's rule.
//
// Usage:  node verify_targetsize.mjs <file.html|url> [...] [--viewport 375x812] [--exempt <css-selector>]
//                                    [--json] [--channel msedge|chrome|chromium]
//
// Measures every interactive target's rendered bounding box at a MOBILE viewport (the
// binding case) and fails any target under 24x24 CSS px unless a 2.5.8 exception holds:
//   - inline: the target sits in a sentence (rendered inline with adjacent non-target text);
//   - spacing: a 24px-diameter circle centered on the target's box intersects neither
//     another target nor another undersized target's circle (measured geometry, not a
//     heuristic — this is the part axe leaves to "needs review").
// The "equivalent control elsewhere" exception is NOT machine-decidable; declare it
// explicitly with --exempt <selector> and defend the exemption in the verdict.
//
// Exit 1 iff any unexempted target fails. Exit 2 on runner error. 0 otherwise.
// Spec home: ../references/layer-1-gates.md ("Target size").

import { loadPlaywright, launchBrowser, targetToUrl, splitFlags, spacingExceptionHolds } from "./verify_lib.mjs";

const MIN = 24;
const { flags, targets } = splitFlags(process.argv.slice(2));
if (!targets.length || flags.help) {
  console.error("usage: node verify_targetsize.mjs <file.html|url> [...] [--viewport 375x812] [--exempt <css-selector>] [--json] [--channel msedge|chrome|chromium]");
  process.exit(2);
}
const vpm = String(flags.viewport || "375x812").match(/^(\d+)x(\d+)$/);
if (!vpm) { console.error(`verify_targetsize: bad --viewport "${flags.viewport}" (use WxH, e.g. 375x812)`); process.exit(2); }
const viewport = { width: Number(vpm[1]), height: Number(vpm[2]) };

const { chromium } = await loadPlaywright();
const browser = await launchBrowser(chromium, flags.channel);
const context = await browser.newContext({ viewport });
const page = await context.newPage();
const KILL_MOTION = "*, *::before, *::after { transition: none !important; animation: none !important; }";

// FIXED in-page audit (self-contained). Collects every visible interactive target's
// geometry + the facts the exceptions need; the verdict math runs node-side.
const audit = (exemptSelector) => {
  const SEL = 'a[href], button, input, select, textarea, [role="button"], [role="link"], [role="switch"], [role="checkbox"], [role="radio"], [role="tab"], [role="menuitem"]';
  const sel = (el) => {
    const parts = [];
    let n = el;
    while (n && n.nodeType === 1 && parts.length < 4 && n.tagName !== "HTML") {
      let p = n.tagName.toLowerCase();
      if (n.id) { parts.unshift(`${p}#${n.id}`); break; }
      const cls = [...n.classList].slice(0, 2).join(".");
      if (cls) p += `.${cls}`;
      parts.unshift(p);
      n = n.parentElement;
    }
    return parts.join(" > ");
  };
  const out = [];
  for (const el of document.querySelectorAll(SEL)) {
    const s = getComputedStyle(el);
    if (s.display === "none" || s.visibility === "hidden") continue;
    const r = el.getBoundingClientRect();
    if (r.width <= 0 || r.height <= 0) continue;
    let inline = false;
    if (s.display === "inline" && el.parentElement) {
      for (const n of el.parentElement.childNodes) {
        if (n.nodeType === 3 && n.textContent.trim()) { inline = true; break; }
      }
    }
    out.push({
      selector: sel(el),
      rect: { x: Math.round(r.x * 100) / 100, y: Math.round(r.y * 100) / 100, w: Math.round(r.width * 100) / 100, h: Math.round(r.height * 100) / 100 },
      inline,
      exempt: !!(exemptSelector && el.matches(exemptSelector)),
    });
  }
  return out;
};

const report = { validator: "verify_targetsize", generated: new Date().toISOString(), viewport, minPx: MIN, targets: [], pass: true };
for (const target of targets) {
  const entry = { target, measured: 0, violations: [], excepted: [] };
  report.targets.push(entry);
  try { await page.goto(targetToUrl(target), { waitUntil: "networkidle", timeout: 30000 }); }
  catch (e) { entry.error = e.message.split("\n")[0]; report.pass = false; continue; }
  try { await page.evaluate(() => (document.fonts ? document.fonts.ready : null)); } catch {}
  try { await page.addStyleTag({ content: KILL_MOTION }); } catch {}
  await page.waitForTimeout(150);
  let items;
  try { items = await page.evaluate(audit, flags.exempt || null); }
  catch (e) { entry.error = `audit failed: ${e.message.split("\n")[0]}`; report.pass = false; continue; }
  entry.measured = items.length;
  const rects = items.map((i) => i.rect);
  const undersizedIdx = new Set(items.map((i, idx) => (i.rect.w < MIN || i.rect.h < MIN ? idx : -1)).filter((i) => i >= 0));
  for (const idx of undersizedIdx) {
    const item = items[idx];
    const size = `${item.rect.w}x${item.rect.h}px`;
    if (item.exempt) { entry.excepted.push({ selector: item.selector, size, exception: "declared-equivalent (--exempt)" }); continue; }
    if (item.inline) { entry.excepted.push({ selector: item.selector, size, exception: "inline (in a sentence)" }); continue; }
    if (spacingExceptionHolds(idx, rects, undersizedIdx)) {
      entry.excepted.push({ selector: item.selector, size, exception: "spacing (24px circle clear of other targets)" });
      continue;
    }
    entry.violations.push({ selector: item.selector, size });
    report.pass = false;
  }
}
await browser.close();

if (flags.json) {
  console.log(JSON.stringify(report, null, 2));
} else {
  const L = [`design-evaluate · verify_targetsize (HARD) · WCAG 2.2 2.5.8, min ${MIN}x${MIN}px @ ${viewport.width}x${viewport.height}`];
  for (const t of report.targets) {
    L.push(`  ${t.target}`);
    if (t.error) { L.push(`    ERROR: ${t.error}`); continue; }
    L.push(`    measured ${t.measured} interactive target(s)`);
    for (const v of t.violations) L.push(`    [FAIL] ${v.selector} — ${v.size} < ${MIN}x${MIN} and no 2.5.8 exception applies`);
    for (const x of t.excepted) L.push(`    [pass] ${x.selector} — ${x.size}, exception: ${x.exception}`);
    if (!t.violations.length && !t.excepted.length && t.measured) L.push(`    [PASS] all ${t.measured} target(s) >= ${MIN}x${MIN}px`);
    if (!t.measured) L.push(`    [info] no interactive targets found — nothing to measure (not a conformance claim for pages that add controls later)`);
  }
  L.push(`  RESULT: ${report.pass ? "PASS" : "FAIL — undersized targets without a 2.5.8 exception"}`);
  console.log(L.join("\n"));
}
process.exit(report.pass ? 0 : 1);
