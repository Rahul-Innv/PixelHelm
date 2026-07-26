#!/usr/bin/env node
// verify_cwv.mjs — behavior-level validator: LAB Core-Web-Vitals capture (LCP / CLS / INP-proxy)
// against configurable budgets, desktop + emulated mid-tier mobile.
//
// Usage:  node verify_cwv.mjs <file.html|url> [...] [--profile desktop|mobile|both]
//                             [--budget-lcp 2500] [--budget-cls 0.1] [--budget-inp 200]
//                             [--max-interactions 8] [--json] [--channel msedge|chrome|chromium]
//
// Profiles (both by default):
//   desktop:  1280x800 @ DPR 1, no CPU throttle
//   mobile:   375x812  @ DPR 2, 4x CPU throttle (emulated mid-tier device)
// Metrics per profile, one cold load each:
//   LCP  — buffered largest-contentful-paint observer (budget default 2500 ms);
//   CLS  — buffered layout-shift sum excluding recent-input shifts (budget default 0.1);
//   INP-proxy — a SCRIPTED interaction pass (clicks on up to --max-interactions visible
//     interactive elements with default-navigation suppressed so the page survives, plus
//     Tab presses) observed through the event-timing API; the proxy value is the WORST
//     observed event duration (input delay reported alongside). Budget default 200 ms.
//     This is a lab proxy for INP, not INP (which is a field p98 over a real visit).
//     No event-timing entry over the API's 16 ms delivery floor means every scripted
//     interaction ran under 16 ms — reported as such, never as an absent measurement.
// A page with ZERO interactive elements gets an explicit zero-measure record — the
// INP-proxy budget is then not-applicable, never an implied conformance.
//
// LAB, single machine, no network throttling (file:// targets pay no network cost —
// transfer budgets are a different tool's job). Directional across machines, never RUM.
// Exit 1 iff any MEASURED budget fails in any profile. Exit 2 on runner error. 0 otherwise.
// Spec home: ../references/layer-1-gates.md ("Lab CWV capture").

import { loadPlaywright, launchBrowser, targetToUrl, splitFlags, pageReadiness } from "./verify_lib.mjs";

const { flags, targets } = splitFlags(process.argv.slice(2));
if (!targets.length || flags.help) {
  console.error("usage: node verify_cwv.mjs <file.html|url> [...] [--profile desktop|mobile|both] [--budget-lcp 2500] [--budget-cls 0.1] [--budget-inp 200] [--max-interactions 8] [--json] [--channel msedge|chrome|chromium]");
  process.exit(2);
}
const profileArg = String(flags.profile || "both");
if (!["desktop", "mobile", "both"].includes(profileArg)) { console.error(`verify_cwv: bad --profile "${flags.profile}" (desktop|mobile|both)`); process.exit(2); }
const budgets = {
  lcpMs: Number(flags["budget-lcp"] ?? 2500),
  cls: Number(flags["budget-cls"] ?? 0.1),
  inpProxyMs: Number(flags["budget-inp"] ?? 200),
};
if (Object.values(budgets).some((v) => !Number.isFinite(v) || v <= 0)) {
  console.error(`verify_cwv: bad budget flag (--budget-lcp/--budget-cls/--budget-inp must be positive numbers)`);
  process.exit(2);
}
const maxInteractions = Number(flags["max-interactions"] ?? 8);
if (!Number.isInteger(maxInteractions) || maxInteractions < 0) { console.error(`verify_cwv: bad --max-interactions "${flags["max-interactions"]}"`); process.exit(2); }

const PROFILES = {
  desktop: { name: "desktop", viewport: { width: 1280, height: 800 }, deviceScaleFactor: 1, cpuThrottleRate: 1 },
  mobile: { name: "emulated-mobile", viewport: { width: 375, height: 812 }, deviceScaleFactor: 2, cpuThrottleRate: 4 },
};
const runProfiles = profileArg === "both" ? [PROFILES.desktop, PROFILES.mobile] : [PROFILES[profileArg]];
const CONTROL_SEL = 'a[href], button, input, select, textarea, [role="button"], [role="link"], [role="switch"], [role="checkbox"], [role="radio"], [role="tab"], [role="menuitem"]';

const { chromium } = await loadPlaywright();
const browser = await launchBrowser(chromium, flags.channel);

const report = {
  validator: "verify_cwv", generated: new Date().toISOString(),
  budgets,
  note: "LAB, single machine, one cold load per profile, no network throttling — directional, never RUM. INP-proxy is a scripted-interaction lab proxy, not field INP.",
  profiles: [], pass: true,
};

for (const profile of runProfiles) {
  const profileEntry = { ...profile, targets: [] };
  report.profiles.push(profileEntry);
  const context = await browser.newContext({
    viewport: profile.viewport,
    deviceScaleFactor: profile.deviceScaleFactor,
    ...(profile.cpuThrottleRate > 1 ? { isMobile: true, hasTouch: true } : {}),
  });
  await context.addInitScript(() => {
    window.__cwv = { lcp: 0, cls: 0, events: [], firstInputDelayMs: null };
    try {
      new PerformanceObserver((l) => { for (const e of l.getEntries()) window.__cwv.lcp = e.startTime; })
        .observe({ type: "largest-contentful-paint", buffered: true });
      new PerformanceObserver((l) => { for (const e of l.getEntries()) if (!e.hadRecentInput) window.__cwv.cls += e.value; })
        .observe({ type: "layout-shift", buffered: true });
      new PerformanceObserver((l) => {
        for (const e of l.getEntries()) window.__cwv.events.push({ type: e.name, durationMs: Math.round(e.duration), inputDelayMs: Math.max(0, Math.round(e.processingStart - e.startTime)) });
      }).observe({ type: "event", durationThreshold: 16, buffered: true });
      new PerformanceObserver((l) => {
        for (const e of l.getEntries()) window.__cwv.firstInputDelayMs = Math.max(0, Math.round(e.processingStart - e.startTime));
      }).observe({ type: "first-input", buffered: true });
    } catch { /* observer unsupported — fields stay at initial values and the report shows it */ }
  });

  for (const target of targets) {
    const entry = { target };
    profileEntry.targets.push(entry);
    const page = await context.newPage();
    if (profile.cpuThrottleRate > 1) {
      try {
        const cdp = await context.newCDPSession(page);
        await cdp.send("Emulation.setCPUThrottlingRate", { rate: profile.cpuThrottleRate });
      } catch (e) { console.error(`verify_cwv: could not apply CPU throttle: ${e.message.split("\n")[0]}`); process.exit(2); }
    }
    try { await page.goto(targetToUrl(target), { waitUntil: "load", timeout: 45000 }); }
    catch (e) { entry.error = e.message.split("\n")[0]; report.pass = false; await page.close(); continue; }
    await page.waitForLoadState("networkidle").catch(() => {});
    entry.readiness = await pageReadiness(page, { animations: "running" });
    await page.waitForTimeout(400); // let a trailing layout-shift/LCP settle

    // Scripted interaction pass. Default navigation is suppressed (capture-phase
    // preventDefault) so the page survives; page handlers still run and are measured.
    let clicks = 0, tabPresses = 0, candidates = 0;
    if (maxInteractions > 0) {
      await page.evaluate(() => {
        window.__cwvGuard = (e) => e.preventDefault();
        document.addEventListener("click", window.__cwvGuard, { capture: true });
        document.addEventListener("submit", window.__cwvGuard, { capture: true });
      });
      const handles = await page.$$(CONTROL_SEL);
      for (const h of handles) {
        const visible = await h.evaluate((el) => {
          const s = getComputedStyle(el);
          const r = el.getBoundingClientRect();
          return s.display !== "none" && s.visibility !== "hidden" && r.width > 0 && r.height > 0;
        }).catch(() => false);
        if (!visible) continue;
        candidates++;
        if (clicks >= maxInteractions) continue;
        try { await h.click({ timeout: 1500 }); clicks++; } catch { /* covered/unclickable — skip, count stays honest */ }
        await page.waitForTimeout(80);
      }
      for (let i = 0; i < Math.min(3, candidates); i++) { await page.keyboard.press("Tab"); tabPresses++; await page.waitForTimeout(60); }
      await page.waitForTimeout(300);
    }

    const raw = await page.evaluate(() => window.__cwv);
    const worst = raw.events.length ? Math.max(...raw.events.map((e) => e.durationMs)) : null;
    entry.metrics = {
      lcpMs: Math.round(raw.lcp),
      cls: Math.round(raw.cls * 1000) / 1000,
      inpProxy: {
        interactiveElements: candidates, clicks, tabPresses,
        worstMs: worst,
        firstInputDelayMs: raw.firstInputDelayMs,
        entriesOver16Ms: raw.events,
        note: candidates === 0
          ? "zero interactive elements on this page — nothing to interact with; this is an explicit zero-measure, not an implied responsiveness conformance"
          : worst === null
            ? `every scripted interaction ran under the event-timing API's 16 ms delivery floor (${clicks} click(s), ${tabPresses} Tab press(es))`
            : undefined,
      },
    };
    const interacted = clicks + tabPresses > 0;
    entry.checks = [
      { id: "LCP", val: `${entry.metrics.lcpMs} ms`, budget: `<= ${budgets.lcpMs} ms`, na: entry.metrics.lcpMs === 0, ok: entry.metrics.lcpMs > 0 && entry.metrics.lcpMs <= budgets.lcpMs },
      { id: "CLS", val: `${entry.metrics.cls}`, budget: `<= ${budgets.cls}`, na: false, ok: entry.metrics.cls <= budgets.cls },
      { id: "INP-proxy", val: worst === null ? (interacted ? "< 16 ms" : "n/a") : `${worst} ms`, budget: `<= ${budgets.inpProxyMs} ms`, na: !interacted, ok: !interacted || worst === null || worst <= budgets.inpProxyMs },
    ];
    entry.pass = entry.checks.every((c) => c.na || c.ok);
    if (!entry.pass) report.pass = false;
    await page.close();
  }
  await context.close();
}
await browser.close();

if (flags.json) {
  console.log(JSON.stringify(report, null, 2));
} else {
  const L = [`design-evaluate · verify_cwv (behavior floor) · budgets LCP <= ${budgets.lcpMs} ms · CLS <= ${budgets.cls} · INP-proxy <= ${budgets.inpProxyMs} ms`];
  for (const p of report.profiles) {
    L.push(`  profile ${p.name}: ${p.viewport.width}x${p.viewport.height} @ DPR ${p.deviceScaleFactor}, CPU x${p.cpuThrottleRate}`);
    for (const t of p.targets) {
      L.push(`    ${t.target}`);
      if (t.error) { L.push(`      ERROR: ${t.error}`); continue; }
      for (const c of t.checks) L.push(`      [${c.na ? "n/a " : c.ok ? "PASS" : "FAIL"}] ${c.id}: ${c.val}  (budget ${c.budget})`);
      if (t.metrics.inpProxy.note) L.push(`      [info] ${t.metrics.inpProxy.note}`);
    }
  }
  L.push(`  ${report.note}`);
  L.push(`  RESULT: ${report.pass ? "PASS — every measured budget met" : "FAIL — a measured CWV budget was exceeded"}`);
  console.log(L.join("\n"));
}
process.exit(report.pass ? 0 : 1);
