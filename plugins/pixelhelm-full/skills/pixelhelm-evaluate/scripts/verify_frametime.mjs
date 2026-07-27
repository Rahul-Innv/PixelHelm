#!/usr/bin/env node
// verify_frametime.mjs — behavior-level validator: percentile frame-time budget (p50/p95/max)
// over a SCRIPTED scroll/interaction pass.
//
// Usage:  node verify_frametime.mjs <file.html|url> [...] [--mobile] [--budget-p95 <ms>]
//                                   [--cpu-throttle <rate>] [--duration 8000] [--viewport WxH]
//                                   [--interact <css-selector>] [--json] [--channel msedge|chrome|chromium]
//
// Records requestAnimationFrame deltas while a scripted wheel scroll walks the page top to
// bottom (plus optional hovers over --interact matches), then computes nearest-rank
// p50/p95/max node-side. Animations are left RUNNING — their frame cost is the thing
// measured — so the readiness contract here is fonts+readyState (layout settle is recorded
// but a moving page is not a violation). Profiles:
//   desktop (default): 1280x800 @ DPR 1, no CPU throttle,   budget p95 <= 16.7 ms
//   --mobile:          375x812  @ DPR 2, 4x CPU throttle,   budget p95 <= 33 ms
// (the pre-registered budget shapes; override with --budget-p95 / --cpu-throttle).
//
// PASS rule: p95 <= budget + 1.0 ms fixed jitter allowance. The allowance absorbs vsync
// scheduler noise around the nominal frame interval (an idle 60 Hz page reports ~16.7 ms
// deltas with sub-ms jitter); it is a CONSTANT in this file, never a flag — budgets are
// changed by changing the budget, never by widening the allowance. A vsync base estimate
// (median idle delta) and the dropped-frame share (> 1.5x base) are reported as evidence.
//
// Emulated-mobile scheduling-stall exclusion (re-registered 2026-07-26): per scripted
// wheel step, the single largest frame gap inside that step's window is excluded from
// the sample set BEFORE percentile math — mobile profile only, budgets unchanged, every
// excluded gap counted and reported. See MOBILE_WHEEL_STALL_EXCLUSIONS_PER_STEP below.
//
// LAB, single machine, single run: the verdict binds the run that produced it; it is
// directional across machines and never a field/RUM claim.
// Exit 1 iff any target exceeds its budget. Exit 2 on runner error. 0 otherwise.
// Spec home: ../references/layer-1-gates.md ("Frame-time budget").

import { loadPlaywright, launchBrowser, targetToUrl, splitFlags, pageReadiness, percentile } from "./verify_lib.mjs";

const JITTER_ALLOWANCE_MS = 1.0; // constant on purpose — see header

// Scheduling-stall exclusion — EMULATED-MOBILE PROFILE ONLY. Re-registered 2026-07-26
// (owner-approved gate-design change; diagnosis pre-registered and committed at
// examples/harborline/repairs/2026-07-26/REPAIR.md). Headless emulated-mobile capture
// stalls frame production once per scripted wheel step: one multi-vsync gap, quantized
// to whole frame periods, throttle-invariant, absent at DPR 1, present on a plain-text
// control page, with tracing showing every process idle during the gap. That is harness
// scheduling cost, not page-authored cost, so per scripted wheel step the single
// largest frame gap inside that step's window is excluded from the sample set BEFORE
// percentile math. The registered budgets are UNCHANGED (16.7 ms desktop / 33 ms
// mobile); the JSON report counts every excluded gap and its size — nothing is silently
// dropped. A CONSTANT on purpose, never a flag — like the jitter allowance, gate design
// changes only by re-registration.
const MOBILE_WHEEL_STALL_EXCLUSIONS_PER_STEP = 1;
const { flags, targets } = splitFlags(process.argv.slice(2));
if (!targets.length || flags.help) {
  console.error("usage: node verify_frametime.mjs <file.html|url> [...] [--mobile] [--budget-p95 <ms>] [--cpu-throttle <rate>] [--duration 8000] [--viewport WxH] [--interact <css-selector>] [--json] [--channel msedge|chrome|chromium]");
  process.exit(2);
}
const mobile = !!flags.mobile;
const vpDefault = mobile ? "375x812" : "1280x800";
const vpm = String(flags.viewport || vpDefault).match(/^(\d+)x(\d+)$/);
if (!vpm) { console.error(`verify_frametime: bad --viewport "${flags.viewport}" (use WxH)`); process.exit(2); }
const viewport = { width: Number(vpm[1]), height: Number(vpm[2]) };
const budgetP95 = Number(flags["budget-p95"] ?? (mobile ? 33 : 16.7));
if (!Number.isFinite(budgetP95) || budgetP95 <= 0) { console.error(`verify_frametime: bad --budget-p95 "${flags["budget-p95"]}"`); process.exit(2); }
const cpuThrottleRate = Number(flags["cpu-throttle"] ?? (mobile ? 4 : 1));
if (!Number.isFinite(cpuThrottleRate) || cpuThrottleRate < 1) { console.error(`verify_frametime: bad --cpu-throttle "${flags["cpu-throttle"]}"`); process.exit(2); }
const maxDurationMs = Number(flags.duration || 8000);
if (!Number.isFinite(maxDurationMs) || maxDurationMs < 500) { console.error(`verify_frametime: bad --duration "${flags.duration}"`); process.exit(2); }

const { chromium } = await loadPlaywright();
const browser = await launchBrowser(chromium, flags.channel);
const context = await browser.newContext({
  viewport,
  deviceScaleFactor: mobile ? 2 : 1,
  ...(mobile ? { isMobile: true, hasTouch: true } : {}),
});
const page = await context.newPage();
if (cpuThrottleRate > 1) {
  try {
    const cdp = await context.newCDPSession(page);
    await cdp.send("Emulation.setCPUThrottlingRate", { rate: cpuThrottleRate });
  } catch (e) {
    console.error(`verify_frametime: could not apply CPU throttle x${cpuThrottleRate}: ${e.message.split("\n")[0]}`);
    process.exit(2);
  }
}

const round1 = (n) => Math.round(n * 10) / 10;
const report = {
  validator: "verify_frametime", generated: new Date().toISOString(),
  profile: { name: mobile ? "emulated-mobile" : "desktop", viewport, deviceScaleFactor: mobile ? 2 : 1, cpuThrottleRate },
  budget: { p95Ms: budgetP95, jitterAllowanceMs: JITTER_ALLOWANCE_MS },
  note: "LAB, single machine, single scripted pass — the verdict binds this run; directional across machines, never RUM.",
  targets: [], pass: true,
};

for (const target of targets) {
  const entry = { target };
  report.targets.push(entry);
  try { await page.goto(targetToUrl(target), { waitUntil: "networkidle", timeout: 45000 }); }
  catch (e) { entry.error = e.message.split("\n")[0]; report.pass = false; continue; }
  entry.readiness = await pageReadiness(page, { animations: "running" });

  // Collector: rAF frame samples (timestamp + delta), self-contained in-page. The
  // timestamp lets the mobile stall exclusion attribute each gap to its wheel step.
  await page.evaluate(() => {
    window.__ft = { frames: [], last: null, on: true };
    const loop = (ts) => {
      const f = window.__ft;
      if (!f.on) return;
      if (f.last != null) f.frames.push({ t: ts, d: ts - f.last });
      f.last = ts;
      requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);
  });

  // 1) Idle calibration window: the median idle delta estimates the vsync base.
  await page.waitForTimeout(600);
  const calibration = await page.evaluate(() => { const d = window.__ft.frames.map((f) => f.d); window.__ft.frames = []; window.__ft.last = null; return d; });
  const vsyncBaseMs = percentile(calibration.slice(2), 50);

  // 2) Scripted scroll pass: wheel steps top -> bottom while the collector runs.
  // Each step's in-page start time is recorded so the stall exclusion can window
  // frame samples per wheel step.
  const maxScroll = await page.evaluate(() => Math.max(0, document.documentElement.scrollHeight - window.innerHeight));
  entry.scrollable = maxScroll > 0;
  const stepPx = Math.max(120, Math.round(viewport.height * 0.6));
  const wheelStepStartsMs = [];
  const t0 = Date.now();
  if (maxScroll > 0) {
    await page.evaluate(() => window.scrollTo({ top: 0, left: 0, behavior: "instant" }));
    let lastY = -1, stuck = 0;
    while (Date.now() - t0 < maxDurationMs) {
      wheelStepStartsMs.push(await page.evaluate(() => performance.now()));
      await page.mouse.wheel(0, stepPx);
      await page.waitForTimeout(40);
      const y = await page.evaluate(() => window.scrollY);
      if (y >= maxScroll - 1) break;
      if (y === lastY) { if (++stuck > 3) break; } else stuck = 0;
      lastY = y;
    }
  }
  const scrollPassEndMs = await page.evaluate(() => performance.now());
  if (flags.interact) {
    const handles = await page.$$(String(flags.interact));
    for (const h of handles.slice(0, 10)) {
      try { await h.hover({ timeout: 1000 }); } catch { /* unhoverable — skip */ }
      await page.waitForTimeout(150);
    }
    entry.interactedWith = Math.min(handles.length, 10);
  }
  await page.waitForTimeout(200);
  const frames = (await page.evaluate(() => { window.__ft.on = false; return window.__ft.frames; })).slice(3); // drop warm-up frames

  // Emulated-mobile scheduling-stall exclusion (see the constant's comment): within
  // each wheel step's window [step start, next step start | scroll-pass end), drop
  // the single largest frame gap. Interaction/idle frames are never excluded.
  let samples = frames;
  if (mobile && wheelStepStartsMs.length) {
    const keep = frames.slice();
    const excluded = [];
    for (let i = 0; i < wheelStepStartsMs.length; i++) {
      const start = wheelStepStartsMs[i];
      const end = i + 1 < wheelStepStartsMs.length ? wheelStepStartsMs[i + 1] : scrollPassEndMs;
      for (let k = 0; k < MOBILE_WHEEL_STALL_EXCLUSIONS_PER_STEP; k++) {
        let worst = -1;
        for (let j = 0; j < keep.length; j++) {
          if (!keep[j] || keep[j].t < start || keep[j].t >= end) continue;
          if (worst < 0 || keep[j].d > keep[worst].d) worst = j;
        }
        if (worst < 0) break;
        excluded.push({ wheelStep: i + 1, gapMs: round1(keep[worst].d) });
        keep[worst] = null;
      }
    }
    samples = keep.filter(Boolean);
    entry.schedulingStallExclusion = {
      rule: `emulated-mobile only: the ${MOBILE_WHEEL_STALL_EXCLUSIONS_PER_STEP} largest frame gap(s) per scripted wheel step excluded before percentile math (source constant; diagnosed headless scheduling stall — budgets unchanged)`,
      wheelSteps: wheelStepStartsMs.length,
      excludedCount: excluded.length,
      excludedGapsMs: excluded.map((e) => e.gapMs),
      excludedPerStep: excluded,
    };
  }
  const deltas = samples.map((f) => f.d);

  entry.scrolledPx = maxScroll;
  entry.samples = deltas.length;
  if (entry.schedulingStallExclusion) entry.samplesBeforeExclusion = frames.length;
  entry.vsyncBaseMs = vsyncBaseMs === null ? null : round1(vsyncBaseMs);
  if (!deltas.length) {
    entry.error = "no frame samples collected — page produced no animation frames during the scripted pass";
    report.pass = false;
    continue;
  }
  entry.frameMs = { p50: round1(percentile(deltas, 50)), p95: round1(percentile(deltas, 95)), max: round1(percentile(deltas, 100)) };
  entry.droppedFramePct = vsyncBaseMs ? Math.round((deltas.filter((d) => d > 1.5 * vsyncBaseMs).length / deltas.length) * 1000) / 10 : null;
  if (!entry.scrollable) entry.notScrollableNote = "page has no scroll range at this viewport — the pass measured idle/interaction frames only, which is not a heavy-sequence claim";
  entry.pass = entry.frameMs.p95 <= budgetP95 + JITTER_ALLOWANCE_MS;
  if (!entry.pass) report.pass = false;
}
await browser.close();

if (flags.json) {
  console.log(JSON.stringify(report, null, 2));
} else {
  const p = report.profile;
  const L = [`pixelhelm-evaluate · verify_frametime (behavior floor) · ${p.name} ${p.viewport.width}x${p.viewport.height} @ DPR ${p.deviceScaleFactor}, CPU x${p.cpuThrottleRate} · budget p95 <= ${budgetP95} ms (+${JITTER_ALLOWANCE_MS} ms fixed jitter allowance)`];
  for (const t of report.targets) {
    L.push(`  ${t.target}`);
    if (t.error) { L.push(`    ERROR: ${t.error}`); continue; }
    L.push(`    scripted pass: scrolled ${t.scrolledPx}px${t.interactedWith ? `, hovered ${t.interactedWith} element(s)` : ""} · ${t.samples} frame samples · vsync base ~${t.vsyncBaseMs} ms`);
    if (t.schedulingStallExclusion) {
      const x = t.schedulingStallExclusion;
      L.push(`    stall exclusion (emulated-mobile, re-registered 2026-07-26): ${x.excludedCount} gap(s) over ${x.wheelSteps} wheel step(s) excluded [${x.excludedGapsMs.join(", ")} ms] — budgets unchanged`);
    }
    L.push(`    [${t.pass ? "PASS" : "FAIL"}] frame time p50 ${t.frameMs.p50} ms · p95 ${t.frameMs.p95} ms · max ${t.frameMs.max} ms · dropped ${t.droppedFramePct}%`);
    if (t.notScrollableNote) L.push(`    [info] ${t.notScrollableNote}`);
  }
  L.push(`  ${report.note}`);
  L.push(`  RESULT: ${report.pass ? "PASS — p95 within budget" : "FAIL — frame-time budget exceeded"}`);
  console.log(L.join("\n"));
}
process.exit(report.pass ? 0 : 1);
