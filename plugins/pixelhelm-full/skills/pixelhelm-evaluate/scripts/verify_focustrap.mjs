#!/usr/bin/env node
// verify_focustrap.mjs — Layer-1 HARD gate: dialog keyboard trap semantics, proven with real key presses.
//
// Usage:  node verify_focustrap.mjs <file.html|url> [--trigger <css-selector>] [--dialog <css-selector>]
//                                   [--json] [--channel msedge|chrome|chromium]
//
// Opens the dialog via the trigger selector and proves three things with real keyboard
// presses (WCAG 2.1.2 No Keyboard Trap + 2.4.3 Focus Order):
//   1. role="dialog" (or native <dialog>) + aria-modal="true" (or :modal) + an accessible name;
//   2. Tab cycles ONLY inside the dialog — pressed more times than there are focusables,
//      focus must never escape;
//   3. Escape closes the dialog AND returns focus to the trigger.
// Any leak, missing semantics, or lost focus fails.
//
// Applicability is explicit, never silent: a page with NO dialog exits 0 with
// "not-applicable" (that is NOT a trap-semantics pass); a page WITH a dialog but no
// --trigger exits 2 — the trigger is part of the contract.
//
// Exit 1 iff a trap assertion fails. Exit 2 on runner error / missing trigger. 0 otherwise.
// Spec home: ../references/layer-1-gates.md ("Focus trap").

import { loadPlaywright, launchBrowser, targetToUrl, splitFlags } from "./verify_lib.mjs";

const { flags, targets } = splitFlags(process.argv.slice(2));
if (targets.length !== 1 || flags.help) {
  console.error("usage: node verify_focustrap.mjs <file.html|url> [--trigger <css-selector>] [--dialog <css-selector>] [--json] [--channel msedge|chrome|chromium]");
  process.exit(2);
}
const target = targets[0];

const { chromium } = await loadPlaywright();
const browser = await launchBrowser(chromium, flags.channel);
const context = await browser.newContext();
const page = await context.newPage();

const report = { validator: "verify_focustrap", generated: new Date().toISOString(), target, findings: [], pass: true, applicable: true };
const add = (level, id, msg) => { report.findings.push({ level, id, msg }); if (level === "fail") report.pass = false; };
const finish = async (exitCode) => {
  await browser.close();
  if (flags.json) console.log(JSON.stringify(report, null, 2));
  else {
    const L = [`pixelhelm-evaluate · verify_focustrap (HARD) · ${target}`];
    for (const f of report.findings) L.push(`    [${{ pass: "PASS", warn: "warn", fail: "FAIL", info: "info" }[f.level]}] ${f.id}: ${f.msg}`);
    L.push(`  RESULT: ${!report.applicable ? "NOT APPLICABLE — no dialog on this page (this is not a trap-semantics pass)" : report.pass ? "PASS — dialog traps, cycles, and restores focus" : "FAIL — keyboard trap contract broken"}`);
    console.log(L.join("\n"));
  }
  process.exit(exitCode);
};

try { await page.goto(targetToUrl(target), { waitUntil: "networkidle", timeout: 30000 }); }
catch (e) { console.error(`verify_focustrap: cannot load ${target}: ${e.message.split("\n")[0]}`); process.exit(2); }
try { await page.evaluate(() => (document.fonts ? document.fonts.ready : null)); } catch {}
try { await page.addStyleTag({ content: "*, *::before, *::after { transition: none !important; animation: none !important; }" }); } catch {}

// Probe for dialogs when no trigger is given: applicability must be decided honestly.
if (!flags.trigger) {
  const dialogCount = await page.evaluate(() => document.querySelectorAll('dialog, [role="dialog"], [aria-modal="true"]').length);
  if (dialogCount === 0) {
    report.applicable = false;
    report.findings.push({ level: "info", id: "applicability", msg: "no dialog / [role=dialog] / [aria-modal] element on this page — nothing to verify" });
    await finish(0);
  }
  console.error(`verify_focustrap: page has ${dialogCount} dialog element(s) but no --trigger was given — the trigger selector is part of the contract (Escape must return focus to it).`);
  await browser.close();
  process.exit(2);
}

const trigger = page.locator(String(flags.trigger)).first();
if (!(await trigger.count())) { console.error(`verify_focustrap: trigger selector matched nothing: ${flags.trigger}`); await browser.close(); process.exit(2); }
const triggerHandle = await trigger.elementHandle();
try { await trigger.click({ timeout: 5000 }); }
catch (e) { console.error(`verify_focustrap: could not click trigger: ${e.message.split("\n")[0]}`); await browser.close(); process.exit(2); }
await page.waitForTimeout(300);

// Locate the opened dialog.
const dialogSel = String(flags.dialog || 'dialog[open], [role="dialog"], [aria-modal="true"]');
const dialogHandle = await page.evaluateHandle((sel) => {
  for (const el of document.querySelectorAll(sel)) {
    const s = getComputedStyle(el);
    if (s.display !== "none" && s.visibility !== "hidden") return el;
  }
  return null;
}, dialogSel);
if (!(await dialogHandle.evaluate((el) => !!el))) {
  add("fail", "opens", `no visible dialog matched "${dialogSel}" after clicking the trigger`);
  await finish(1);
}

// 1) Semantics: role + modality + accessible name.
const sem = await dialogHandle.evaluate((el) => {
  const native = el.tagName === "DIALOG";
  const isModal = el.getAttribute("aria-modal") === "true" || (native && el.matches(":modal"));
  let name = el.getAttribute("aria-label") || "";
  const refIds = (el.getAttribute("aria-labelledby") || "").split(/\s+/).filter(Boolean);
  for (const id of refIds) { const ref = document.getElementById(id); if (ref) name += " " + (ref.textContent || ""); }
  return {
    role: native ? "dialog (native)" : el.getAttribute("role") || "(none)",
    hasDialogRole: native || el.getAttribute("role") === "dialog" || el.getAttribute("role") === "alertdialog",
    isModal,
    name: name.trim(),
  };
});
if (sem.hasDialogRole) add("pass", "role", `role is ${sem.role}`);
else add("fail", "role", `element is not role="dialog"/"alertdialog" or native <dialog> (got ${sem.role})`);
if (sem.isModal) add("pass", "aria-modal", "aria-modal semantics present");
else add("fail", "aria-modal", 'no aria-modal="true" (and not a native :modal dialog) — assistive tech will not treat it as modal');
if (sem.name) add("pass", "accessible-name", `accessible name: "${sem.name.slice(0, 60)}"`);
else add("fail", "accessible-name", "no accessible name (aria-label / aria-labelledby)");

// 2) Tab cycles only inside: press Tab more times than there are focusables.
const focusables = await dialogHandle.evaluate((el) => {
  const list = el.querySelectorAll('a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])');
  let visible = 0;
  for (const f of list) { const s = getComputedStyle(f); if (s.display !== "none" && s.visibility !== "hidden") visible++; }
  return visible;
});
if (focusables === 0) {
  add("fail", "tab-cycle", "dialog contains no focusable elements — keyboard users cannot operate or leave it intentionally");
} else {
  // An escape is a FAIL only when focus lands on PAGE CONTENT outside the dialog.
  // activeElement === body/html means focus moved into browser chrome (Tab past the
  // last control) — allowed by WCAG 2.1.2 and normal for native modal dialogs.
  let escaped = null;
  let leftToChrome = 0;
  const presses = focusables + 2;
  for (let i = 0; i < presses; i++) {
    await page.keyboard.press("Tab");
    await page.waitForTimeout(30);
    const where = await dialogHandle.evaluate((el) => {
      const a = document.activeElement;
      if (a === el || el.contains(a)) return { inside: true };
      if (!a || a === document.body || a === document.documentElement) return { inside: false, chrome: true };
      return { inside: false, chrome: false, sel: a.tagName.toLowerCase() + (a.id ? `#${a.id}` : a.className ? `.${String(a.className).split(/\s+/)[0]}` : "") };
    });
    if (where.inside) continue;
    if (where.chrome) { leftToChrome++; continue; }
    escaped = where.sel;
    break;
  }
  if (escaped !== null) add("fail", "tab-cycle", `focus ESCAPED the dialog to page content: ${escaped} — no trap`);
  else add("pass", "tab-cycle", `focus never reached page content outside the dialog through ${presses} Tab presses (${focusables} focusable(s)${leftToChrome ? `; ${leftToChrome} press(es) went to browser chrome, which WCAG permits` : ""})`);
}

// 3) Escape closes and returns focus to the trigger.
await page.keyboard.press("Escape");
await page.waitForTimeout(200);
const closed = await dialogHandle.evaluate((el) => {
  if (!el.isConnected) return true;
  if (el.tagName === "DIALOG" && !el.open) return true;
  const s = getComputedStyle(el);
  return s.display === "none" || s.visibility === "hidden";
});
if (closed) add("pass", "escape-closes", "Escape closed the dialog");
else add("fail", "escape-closes", "Escape did not close the dialog");
const focusReturned = await page.evaluate((trig) => document.activeElement === trig, triggerHandle);
if (focusReturned) add("pass", "focus-return", "focus returned to the trigger");
else add("fail", "focus-return", "focus did NOT return to the trigger after Escape");

await finish(report.pass ? 0 : 1);
