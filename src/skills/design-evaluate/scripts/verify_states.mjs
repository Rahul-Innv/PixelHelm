#!/usr/bin/env node
// verify_states.mjs — Layer-1 HARD gate: real-render state-aware contrast (default/hover/focus).
//
// Usage:  node verify_states.mjs <file.html|url> [...] [--modes light,dark] [--dark-attr data-theme]
//                                [--max-controls 120] [--json] [--channel msedge|chrome|chromium]
//
// Walks button, a[href], input, select, textarea, [role=button], [role=switch] and measures
// the COMPUTED text color against the effective (non-transparent, ancestor-resolved,
// alpha-composited) background in default / hover / focus — in BOTH modes. Catches the
// failure static lint can't: a secondary button that picks up the primary fill on hover
// via CSS specificity. Thresholds: 3:1 for large text (>=24px, or >=18.66px bold) and
// icon-only controls (WCAG 1.4.11); 4.5:1 otherwise. Disabled controls and native toggles
// (checkbox/radio — rendered via accent-color) are EXEMPT (WCAG 1.4.3 / 1.4.11).
// Transitions/animations are killed so the measured state is the settled one.
// A control over a background-image/gradient is NOT machine-certain: reported as
// needs-review, never silently passed and never a hard fail.
//
// Exit 1 iff any measured state pair is below its threshold. Exit 2 on runner error.
// Spec home: ../references/layer-1-gates.md ("Real-render state-aware contrast").

import { loadPlaywright, launchBrowser, targetToUrl, splitFlags, compositeStack, contrastRatio, isLargeText } from "./verify_lib.mjs";

const { flags, targets } = splitFlags(process.argv.slice(2));
if (!targets.length || flags.help) {
  console.error("usage: node verify_states.mjs <file.html|url> [...] [--modes light,dark] [--dark-attr data-theme] [--max-controls 120] [--json] [--channel msedge|chrome|chromium]");
  process.exit(2);
}
const modes = String(flags.modes || "light,dark").split(",").map((s) => s.trim()).filter(Boolean);
const darkAttr = flags["dark-attr"] || "data-theme";
const maxControls = Number(flags["max-controls"] || 120);

const { chromium } = await loadPlaywright();
const browser = await launchBrowser(chromium, flags.channel);
const context = await browser.newContext();
const page = await context.newPage();
const KILL_MOTION = "*, *::before, *::after { transition: none !important; animation: none !important; }";
const CONTROL_SEL = 'button, a[href], input, select, textarea, [role="button"], [role="switch"]';

// FIXED in-page reader (self-contained): computed text color + the background stack
// from the element up to the first opaque ancestor layer.
const readColors = (el) => {
  const sel = (node) => {
    const parts = [];
    let n = node;
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
  const cs = getComputedStyle(el);
  const bgStack = [];
  let bgImage = false;
  let opaque = false;
  let node = el;
  while (node && node.nodeType === 1) {
    const s = getComputedStyle(node);
    if (s.backgroundImage && s.backgroundImage !== "none") bgImage = true;
    const bc = s.backgroundColor;
    if (bc && bc !== "transparent") {
      const m = bc.match(/[\d.]+/g);
      const a = m && m.length >= 4 ? Number(m[3]) : 1;
      if (a > 0) {
        bgStack.push(bc);
        if (a >= 1) { opaque = true; break; }
      }
    }
    node = node.parentElement;
  }
  const text = (el.textContent || "").trim();
  const hasSvg = !!el.querySelector("svg");
  return {
    selector: sel(el),
    color: cs.color,
    fontSize: parseFloat(cs.fontSize) || 16,
    fontWeight: cs.fontWeight,
    bgStack, bgImage, opaque,
    disabled: el.disabled === true || el.getAttribute("aria-disabled") === "true",
    nativeToggle: el.tagName === "INPUT" && /^(checkbox|radio)$/i.test(el.type || ""),
    iconOnly: !text && hasSvg,
    empty: !text && !hasSvg && !/^(input|select|textarea)$/i.test(el.tagName),
  };
};

const report = {
  validator: "verify_states", generated: new Date().toISOString(),
  modes, thresholds: { normalText: 4.5, largeTextOrIcon: 3 }, targets: [], pass: true,
};
for (const target of targets) {
  const entry = { target, modes: [] };
  report.targets.push(entry);
  for (const mode of modes) {
    const dark = mode === "dark";
    const modeEntry = { mode, controls: 0, checked: 0, failures: [], needsReview: [], exempt: 0 };
    entry.modes.push(modeEntry);
    try { await page.goto(targetToUrl(target), { waitUntil: "networkidle", timeout: 30000 }); }
    catch (e) { modeEntry.error = e.message.split("\n")[0]; report.pass = false; continue; }
    try { await page.evaluate(() => (document.fonts ? document.fonts.ready : null)); } catch {}
    await page.emulateMedia({ colorScheme: dark ? "dark" : "light" });
    // Set the theme attr EXPLICITLY for BOTH modes (same rule as render.mjs: merely
    // removing the attr can leave a default-dark :root dark in "light").
    await page.evaluate(({ attr, dark }) => {
      const el = document.documentElement;
      el.setAttribute(attr, dark ? "dark" : "light");
      el.classList.toggle("dark", dark);
      el.classList.toggle("light", !dark);
    }, { attr: darkAttr, dark });
    try { await page.addStyleTag({ content: KILL_MOTION }); } catch {}
    await page.waitForTimeout(100);

    const handles = await page.$$(CONTROL_SEL);
    modeEntry.controls = handles.length;
    for (const handle of handles.slice(0, maxControls)) {
      let base;
      try { base = await handle.evaluate(readColors); } catch { continue; }
      if (base.disabled || base.nativeToggle) { modeEntry.exempt++; continue; }
      if (base.empty) continue;
      const box = await handle.boundingBox();
      if (!box || box.width <= 0 || box.height <= 0) continue;
      modeEntry.checked++;
      const threshold = base.iconOnly || isLargeText(base.fontSize, base.fontWeight) ? 3 : 4.5;
      const states = { default: base };
      try { await handle.hover({ timeout: 2000 }); await page.waitForTimeout(60); states.hover = await handle.evaluate(readColors); } catch {}
      try { await handle.evaluate((el) => el.focus()); await page.waitForTimeout(60); states.focus = await handle.evaluate(readColors); } catch {}
      try { await handle.evaluate((el) => el.blur()); await page.mouse.move(0, 0); } catch {}
      for (const [state, m] of Object.entries(states)) {
        if (!m) continue;
        if (m.bgImage || !m.opaque) {
          modeEntry.needsReview.push({ selector: m.selector, state, why: m.bgImage ? "background-image/gradient behind control" : "no opaque background layer resolved" });
          continue;
        }
        let ratio;
        try { ratio = contrastRatio(m.color, compositeStack(m.bgStack)); }
        catch { modeEntry.needsReview.push({ selector: m.selector, state, why: "unparseable computed color" }); continue; }
        if (ratio < threshold) {
          modeEntry.failures.push({ selector: m.selector, state, ratio, threshold, color: m.color, bg: m.bgStack[m.bgStack.length - 1] });
          report.pass = false;
        }
      }
    }
  }
}
await browser.close();

if (flags.json) {
  console.log(JSON.stringify(report, null, 2));
} else {
  const L = [`design-evaluate · verify_states (HARD) · state-aware contrast, modes ${modes.join("+")}`];
  for (const t of report.targets) {
    L.push(`  ${t.target}`);
    for (const m of t.modes) {
      if (m.error) { L.push(`    [${m.mode}] ERROR: ${m.error}`); continue; }
      L.push(`    [${m.mode}] ${m.controls} control(s), ${m.checked} measured, ${m.exempt} exempt (disabled/native-toggle) — ${m.failures.length} FAIL, ${m.needsReview.length} needs-review`);
      for (const f of m.failures) L.push(`           x ${f.selector} [${f.state}] ${f.ratio}:1 < ${f.threshold}:1 (${f.color} on ${f.bg})`);
      for (const r of m.needsReview.slice(0, 10)) L.push(`           ? ${r.selector} [${r.state}] — ${r.why} (route to Layer-2, not machine-certain)`);
      if (!m.controls) L.push(`           (no interactive controls found — nothing to measure)`);
    }
  }
  L.push(`  RESULT: ${report.pass ? "PASS — every measured state pair meets its threshold" : "FAIL — state contrast below threshold"}`);
  console.log(L.join("\n"));
}
process.exit(report.pass ? 0 : 1);
