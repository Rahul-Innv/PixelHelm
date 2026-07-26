#!/usr/bin/env node
// verify_responsive.mjs — Layer-1 HARD gate: reflow / horizontal overflow at narrow widths.
//
// Usage:  node verify_responsive.mjs <file.html|url> [...] [--widths 280,320,414] [--json] [--channel msedge|chrome|chromium]
//
// Loads each target at every width (default 280 / 320 / 414 px — WCAG 1.4.10 reflow plus
// the two mobile widths the render matrix cares about) and FAILS if
// documentElement.scrollWidth - clientWidth > 1 (a sideways scrollbar). On fail it names
// the widest culprit elements. Common causes caught: fixed px widths, unreset <ul>/<ol>
// padding, non-wrapping flex rows, grid minmax(Npx,1fr) minimums larger than the viewport.
//
// Exit 1 iff any target overflows at any width. Exit 2 on runner error. 0 otherwise.
// Spec home: ../references/layer-1-gates.md ("Responsive overflow").

import { loadPlaywright, launchBrowser, targetToUrl, splitFlags } from "./verify_lib.mjs";

const { flags, targets } = splitFlags(process.argv.slice(2));
if (!targets.length || flags.help) {
  console.error("usage: node verify_responsive.mjs <file.html|url> [...] [--widths 280,320,414] [--json] [--channel msedge|chrome|chromium]");
  process.exit(2);
}
const widths = String(flags.widths || "280,320,414").split(",").map((s) => Number(s.trim())).filter(Boolean);
if (!widths.length || widths.some((w) => !Number.isInteger(w) || w < 100)) {
  console.error(`verify_responsive: bad --widths "${flags.widths}" (comma-separated integers >= 100)`);
  process.exit(2);
}

const { chromium } = await loadPlaywright();
const browser = await launchBrowser(chromium, flags.channel);
const context = await browser.newContext();
const page = await context.newPage();
// Settle captures: no page may DEPEND on an animation to reach its resting layout.
const KILL_MOTION = "*, *::before, *::after { transition: none !important; animation: none !important; }";

// FIXED in-page audit (self-contained — never model-authored at run time).
const audit = () => {
  const doc = document.documentElement;
  const cw = doc.clientWidth;
  const overflow = doc.scrollWidth - cw;
  const culprits = [];
  if (overflow > 1) {
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
    for (const el of document.querySelectorAll("body, body *")) {
      const r = el.getBoundingClientRect();
      if (r.width <= 0) continue;
      const overshoot = Math.max(r.right - cw, 0) + Math.max(0 - r.left, 0);
      if (overshoot > 1) culprits.push({ selector: sel(el), width: Math.round(r.width), overshootPx: Math.round(overshoot) });
    }
    culprits.sort((a, b) => b.overshootPx - a.overshootPx || b.width - a.width);
  }
  return { scrollWidth: doc.scrollWidth, clientWidth: cw, overflowPx: overflow, culprits: culprits.slice(0, 5) };
};

const report = { validator: "verify_responsive", generated: new Date().toISOString(), widths, targets: [], pass: true };
for (const target of targets) {
  const entry = { target, cells: [] };
  report.targets.push(entry);
  let loaded = true;
  try { await page.goto(targetToUrl(target), { waitUntil: "networkidle", timeout: 30000 }); }
  catch (e) { entry.error = e.message.split("\n")[0]; report.pass = false; loaded = false; }
  if (!loaded) continue;
  try { await page.evaluate(() => (document.fonts ? document.fonts.ready : null)); } catch {}
  try { await page.addStyleTag({ content: KILL_MOTION }); } catch {}
  for (const width of widths) {
    await page.setViewportSize({ width, height: 900 });
    await page.waitForTimeout(150);
    const cell = await page.evaluate(audit);
    const pass = cell.overflowPx <= 1;
    if (!pass) report.pass = false;
    entry.cells.push({ width, pass, ...cell });
  }
}
await browser.close();

if (flags.json) {
  console.log(JSON.stringify(report, null, 2));
} else {
  const L = [`design-evaluate · verify_responsive (HARD) · widths ${widths.join("/")}px`];
  for (const t of report.targets) {
    L.push(`  ${t.target}`);
    if (t.error) { L.push(`    ERROR: ${t.error}`); continue; }
    for (const c of t.cells) {
      L.push(`    [${c.pass ? "PASS" : "FAIL"}] ${c.width}px: scrollWidth ${c.scrollWidth} vs clientWidth ${c.clientWidth} (overflow ${c.overflowPx}px)`);
      for (const cu of c.culprits) L.push(`           x ${cu.selector} — ${cu.width}px wide, overshoots by ${cu.overshootPx}px`);
    }
  }
  L.push(`  RESULT: ${report.pass ? "PASS — no sideways scroll at any width" : "FAIL — horizontal overflow present"}`);
  console.log(L.join("\n"));
}
process.exit(report.pass ? 0 : 1);
