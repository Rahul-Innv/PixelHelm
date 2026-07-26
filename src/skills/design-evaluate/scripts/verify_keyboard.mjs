#!/usr/bin/env node
// verify_keyboard.mjs — behavior-level validator: keyboard traversal capture with REAL key
// presses — a committable record of the actual Tab / Shift-Tab / Enter path.
//
// Usage:  node verify_keyboard.mjs <file.html|url> [--viewport 1280x800] [--max-stops 100]
//                                  [--enter <css-selector>] [--json] [--channel msedge|chrome|chromium]
//
// Presses Tab from the top of the document and records every focus stop IN ORDER: selector,
// role, accessible-name sketch, geometry, and — per stop — whether ANY visible style
// responded to focus (computed-style diff of the element and its ::before/::after between
// blurred and focused states; the browser's default focus ring shows up in this diff, so an
// unstyled page passes). Then presses Shift-Tab the same number of times and requires the
// exact reverse path. With --enter, each matching stop is activated with a real Enter press
// and the observable outcome recorded (URL change, dialog opened, aria-expanded toggle, DOM
// mutations, focus movement); navigation is recorded and the page reloaded to continue.
//
// FAILS (machine-certain only): a stop whose focus produces NO style response anywhere
// (WCAG 2.4.7 — for text-entry controls the caret is acknowledged: reported as a warn,
// "caret-only", for judgment, never silently passed); a focused stop that is invisible or
// outside the viewport; focus that gets STUCK (Tab does not move it); a Shift-Tab path
// that is not the exact reverse (WCAG 2.4.3). Positive tabindex and a tab order that
// re-enters at a non-first stop are reported as warns (real false-positive surface).
// A page with ZERO focus stops gets an explicit zero-measure record — never an implied
// keyboard-support conformance.
//
// Exit 1 iff a hard assertion fails. Exit 2 on runner error. 0 otherwise.
// Spec home: ../references/layer-1-gates.md ("Keyboard traversal capture").

import { loadPlaywright, launchBrowser, targetToUrl, splitFlags, pageReadiness, diffStyles } from "./verify_lib.mjs";

const { flags, targets } = splitFlags(process.argv.slice(2));
if (targets.length !== 1 || flags.help) {
  console.error("usage: node verify_keyboard.mjs <file.html|url> [--viewport 1280x800] [--max-stops 100] [--enter <css-selector>] [--json] [--channel msedge|chrome|chromium]");
  process.exit(2);
}
const target = targets[0];
const vpm = String(flags.viewport || "1280x800").match(/^(\d+)x(\d+)$/);
if (!vpm) { console.error(`verify_keyboard: bad --viewport "${flags.viewport}" (use WxH)`); process.exit(2); }
const viewport = { width: Number(vpm[1]), height: Number(vpm[2]) };
const maxStops = Number(flags["max-stops"] || 100);
if (!Number.isInteger(maxStops) || maxStops < 1) { console.error(`verify_keyboard: bad --max-stops "${flags["max-stops"]}"`); process.exit(2); }

const { chromium } = await loadPlaywright();
const browser = await launchBrowser(chromium, flags.channel);
const context = await browser.newContext({ viewport, deviceScaleFactor: 1 });
const page = await context.newPage();

// FIXED in-page step reader (self-contained). Captures the current focus stop, plus the
// blurred-state style snapshot via blur -> snapshot -> refocus (Chromium keeps
// :focus-visible on a script refocus that follows keyboard interaction).
const readStop = async () => {
  const raf = () => new Promise((r) => requestAnimationFrame(() => r()));
  const PROPS = ["outlineStyle", "outlineWidth", "outlineColor", "outlineOffset", "boxShadow", "backgroundColor", "color", "borderTopColor", "borderRightColor", "borderBottomColor", "borderLeftColor", "textDecorationLine", "filter", "transform"];
  const PSEUDO_PROPS = ["content", "boxShadow", "backgroundColor", "borderTopColor", "opacity", "outlineStyle"];
  const snap = (el) => {
    const out = {};
    const s = getComputedStyle(el);
    for (const p of PROPS) out[p] = s[p];
    for (const ps of ["::before", "::after"]) {
      const sp = getComputedStyle(el, ps);
      for (const p of PSEUDO_PROPS) out[ps + ":" + p] = sp[p];
    }
    return out;
  };
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
  window.__kb = window.__kb || { stops: [], seen: new Set() };
  const a = document.activeElement;
  if (!a || a === document.body || a === document.documentElement) return { end: "left-document" };
  if (window.__kb.seen.has(a)) return { end: a === window.__kb.stops[0] ? "cycled" : "re-entered", atSelector: sel(a) };
  const prev = window.__kb.stops[window.__kb.stops.length - 1];
  if (a === prev) return { end: "stuck", atSelector: sel(a) };
  window.__kb.stops.push(a);
  window.__kb.seen.add(a);
  const focused = snap(a);
  a.blur();
  await raf();
  const blurred = snap(a);
  a.focus({ preventScroll: true });
  await raf();
  const refocusOk = document.activeElement === a;
  const r = a.getBoundingClientRect();
  const cs = getComputedStyle(a);
  const name = (a.getAttribute("aria-label")
    || (a.getAttribute("aria-labelledby") || "").split(/\s+/).map((id) => { const ref = document.getElementById(id); return ref ? ref.textContent : ""; }).join(" ").trim()
    || a.title || (a.textContent || "").trim() || a.value || a.alt || "").slice(0, 60);
  const isTextEntry = (a.tagName === "TEXTAREA")
    || (a.tagName === "INPUT" && !["button", "checkbox", "radio", "submit", "reset", "range", "color", "file", "image"].includes((a.type || "text").toLowerCase()))
    || a.isContentEditable;
  return {
    selector: sel(a), tag: a.tagName.toLowerCase(), role: a.getAttribute("role") || null,
    tabindex: a.hasAttribute("tabindex") ? Number(a.getAttribute("tabindex")) : null,
    name,
    rect: { x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height) },
    visible: cs.display !== "none" && cs.visibility !== "hidden" && Number(cs.opacity) > 0.01 && r.width > 0 && r.height > 0,
    inViewport: r.bottom > 0 && r.right > 0 && r.top < window.innerHeight && r.left < window.innerWidth,
    isTextEntry, refocusOk, blurred, focused,
  };
};

const report = {
  validator: "verify_keyboard", generated: new Date().toISOString(), target, viewport,
  findings: [], stops: [], reverse: null, enterProbes: [], measured: 0, pass: true,
};
const add = (level, id, msg) => { report.findings.push({ level, id, msg }); if (level === "fail") report.pass = false; };

try { await page.goto(targetToUrl(target), { waitUntil: "networkidle", timeout: 30000 }); }
catch (e) { console.error(`verify_keyboard: cannot load ${target}: ${e.message.split("\n")[0]}`); process.exit(2); }
report.readiness = await pageReadiness(page, { animations: "killed" });

// ---- forward Tab traversal ----
await page.evaluate(() => document.activeElement && document.activeElement.blur());
let traversalEnd = "max-stops";
for (let i = 0; i < maxStops; i++) {
  await page.keyboard.press("Tab");
  await page.waitForTimeout(40);
  let stop;
  try { stop = await page.evaluate(readStop); }
  catch (e) { console.error(`verify_keyboard: stop reader failed: ${e.message.split("\n")[0]}`); process.exit(2); }
  if (stop.end) {
    traversalEnd = stop.end;
    if (stop.end === "stuck") add("fail", "focus-stuck", `Tab did not move focus off ${stop.atSelector} — keyboard trap outside any dialog`);
    if (stop.end === "re-entered") add("warn", "order-re-entry", `tab order re-entered at ${stop.atSelector}, which is not the first stop — order smell, judge the widget pattern`);
    break;
  }
  const changed = diffStyles(stop.blurred, stop.focused);
  const caretOnly = changed.length === 0 && stop.isTextEntry;
  const record = {
    index: report.stops.length, selector: stop.selector, tag: stop.tag, role: stop.role,
    tabindex: stop.tabindex, name: stop.name, rect: stop.rect,
    visible: stop.visible, inViewport: stop.inViewport,
    indicator: { present: changed.length > 0, changedProps: changed, caretOnly },
    refocusOk: stop.refocusOk,
  };
  report.stops.push(record);
  if (!record.indicator.present && !caretOnly) add("fail", "focus-visible", `stop ${record.index} (${record.selector}): NO visible style responded to focus — element, ::before and ::after all byte-identical blurred vs focused (WCAG 2.4.7)`);
  if (caretOnly) add("warn", "caret-only", `stop ${record.index} (${record.selector}): text-entry control with caret-only focus indication — verify visibility by judgment`);
  if (!stop.visible) add("fail", "focus-invisible", `stop ${record.index} (${record.selector}): focused element is not visible (display/visibility/opacity/zero-size)`);
  else if (!stop.inViewport) add("fail", "focus-offscreen", `stop ${record.index} (${record.selector}): focused element sits outside the viewport — a sighted keyboard user cannot see where focus went`);
  if (stop.tabindex !== null && stop.tabindex > 0) add("warn", "positive-tabindex", `stop ${record.index} (${record.selector}): tabindex=${stop.tabindex} — author-forced order, fragile (judge)`);
  if (!stop.refocusOk) add("warn", "refocus-probe", `stop ${record.index} (${record.selector}): could not restore focus after the blur probe — subsequent order capture may restart from the top`);
}
report.measured = report.stops.length;
report.traversalEnd = traversalEnd;
if (traversalEnd === "max-stops") add("warn", "traversal-capped", `traversal stopped at --max-stops ${maxStops} — the record is a prefix, not the full path`);

if (report.measured === 0) {
  add("info", "applicability", "no focusable elements — nothing to traverse (this is an explicit zero-measure, NOT a keyboard-support conformance claim)");
} else {
  // ---- Shift-Tab reverse pass: must be the exact reverse of the forward path ----
  await page.evaluate(() => document.activeElement && document.activeElement.blur());
  const reversePath = [];
  let mismatchAt = null;
  for (let i = 0; i < report.measured; i++) {
    await page.keyboard.press("Shift+Tab");
    await page.waitForTimeout(40);
    const hit = await page.evaluate((expectIdx) => {
      const a = document.activeElement;
      const expected = window.__kb.stops[expectIdx];
      const sel = (el) => {
        if (!el || el.nodeType !== 1) return "(none)";
        let p = el.tagName.toLowerCase();
        if (el.id) return `${p}#${el.id}`;
        const cls = [...el.classList].slice(0, 2).join(".");
        return cls ? `${p}.${cls}` : p;
      };
      return { match: a === expected, atSelector: sel(a) };
    }, report.measured - 1 - i);
    reversePath.push(hit.atSelector);
    if (!hit.match && mismatchAt === null) mismatchAt = i;
  }
  report.reverse = { match: mismatchAt === null, path: reversePath, mismatchAt };
  if (mismatchAt === null) add("pass", "reverse-order", `Shift-Tab retraced all ${report.measured} stop(s) in exact reverse`);
  else add("fail", "reverse-order", `Shift-Tab diverged at reverse step ${mismatchAt} (landed on ${reversePath[mismatchAt]}) — forward and reverse focus order disagree (WCAG 2.4.3)`);

  // ---- optional Enter activation probes ----
  if (flags.enter) {
    const enterSel = String(flags.enter);
    const matchIdx = await page.evaluate((sel) => window.__kb.stops.map((el, i) => (el.matches && el.matches(sel) ? i : -1)).filter((i) => i >= 0), enterSel).catch(() => []);
    if (!matchIdx.length) add("info", "enter-probe", `--enter "${enterSel}" matched no recorded stop — nothing activated`);
    for (const idx of matchIdx) {
      const stopRec = report.stops[idx];
      await page.evaluate((i) => {
        const el = window.__kb.stops[i];
        window.__kbMut = 0;
        window.__kbObs = new MutationObserver((m) => { window.__kbMut += m.length; });
        window.__kbObs.observe(document.body, { subtree: true, childList: true, attributes: true });
        window.__kbPre = { url: location.href, expanded: el.getAttribute("aria-expanded") };
        el.focus();
      }, idx);
      await page.keyboard.press("Enter");
      await page.waitForTimeout(400);
      let outcome;
      try {
        outcome = await page.evaluate((i) => {
          const el = window.__kb.stops[i];
          window.__kbObs.disconnect();
          const dialogOpened = [...document.querySelectorAll('dialog[open], [role="dialog"], [aria-modal="true"]')]
            .some((d) => { const s = getComputedStyle(d); return s.display !== "none" && s.visibility !== "hidden"; });
          const active = document.activeElement;
          return {
            urlChanged: location.href !== window.__kbPre.url,
            domMutations: window.__kbMut,
            ariaExpandedChanged: el.getAttribute("aria-expanded") !== window.__kbPre.expanded,
            dialogOpened,
            focusMovedTo: active === el ? null : (active && active.nodeType === 1 ? active.tagName.toLowerCase() : "(none)"),
          };
        }, idx);
      } catch {
        // Navigation destroyed the page context: record it, reload, rebuild stop refs
        // by replaying the forward traversal (element identity cannot survive a reload).
        outcome = { urlChanged: true, navigatedTo: page.url(), domMutations: null, ariaExpandedChanged: null, dialogOpened: null, focusMovedTo: null };
        await page.goto(targetToUrl(target), { waitUntil: "networkidle", timeout: 30000 });
        await pageReadiness(page, { animations: "killed" });
        await page.evaluate(() => { window.__kb = { stops: [], seen: new Set() }; document.activeElement && document.activeElement.blur(); });
        for (let i = 0; i < report.measured; i++) {
          await page.keyboard.press("Tab");
          await page.evaluate(() => { const a = document.activeElement; if (a && a !== document.body && a !== document.documentElement && !window.__kb.seen.has(a)) { window.__kb.stops.push(a); window.__kb.seen.add(a); } });
        }
      }
      report.enterProbes.push({ stop: idx, selector: stopRec.selector, ...outcome });
    }
  }
}
await browser.close();

if (flags.json) {
  console.log(JSON.stringify(report, null, 2));
} else {
  const L = [`design-evaluate · verify_keyboard (behavior floor) · ${target} @ ${viewport.width}x${viewport.height}`];
  L.push(`  forward path: ${report.measured} stop(s), ended: ${report.traversalEnd}`);
  for (const s of report.stops) {
    const ind = s.indicator.present ? `indicator: ${s.indicator.changedProps.slice(0, 4).join(", ")}${s.indicator.changedProps.length > 4 ? ", …" : ""}` : s.indicator.caretOnly ? "indicator: caret only (warn)" : "indicator: NONE";
    L.push(`    ${String(s.index).padStart(2)}. ${s.selector}${s.name ? ` — "${s.name}"` : ""} [${s.tag}${s.role ? `/${s.role}` : ""}] ${ind}${s.inViewport ? "" : " · OFFSCREEN"}`);
  }
  if (report.reverse) L.push(`  reverse path: ${report.reverse.match ? "exact reverse — PASS" : `diverged at step ${report.reverse.mismatchAt} — FAIL`}`);
  for (const p of report.enterProbes) L.push(`  enter @ ${p.selector}: url ${p.urlChanged ? "CHANGED" : "same"} · mutations ${p.domMutations ?? "n/a"} · dialog ${p.dialogOpened ?? "n/a"} · aria-expanded ${p.ariaExpandedChanged ?? "n/a"}`);
  for (const f of report.findings) L.push(`    [${{ pass: "PASS", warn: "warn", fail: "FAIL", info: "info" }[f.level]}] ${f.id}: ${f.msg}`);
  L.push(`  RESULT: ${report.measured === 0 ? "NO FOCUS STOPS — explicit zero-measure (not a conformance claim)" : report.pass ? "PASS — every stop shows a focus response; reverse order exact" : "FAIL — keyboard floor broken"}`);
  console.log(L.join("\n"));
}
process.exit(report.pass ? 0 : 1);
