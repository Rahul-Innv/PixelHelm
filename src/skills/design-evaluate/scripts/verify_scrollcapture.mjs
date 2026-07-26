#!/usr/bin/env node
// verify_scrollcapture.mjs — behavior-level validator: DETERMINISTIC scroll-position capture
// under an explicit page-readiness contract, so captures reproduce.
//
// Usage:  node verify_scrollcapture.mjs <file.html|url> [...] [--positions 0,25,50,75,100]
//                                       [--viewport 1280x800] [--passes 2] [--animations killed|running]
//                                       [--out <dir>] [--json] [--channel msedge|chrome|chromium]
//
// The readiness contract (verify_lib pageReadiness, embedded in the report): readyState
// complete, fonts loaded, layout settled over consecutive rAF frames, animations at a
// DECLARED state (default: killed — the resting layout is what is captured). Each position
// (bare number = percent of max scroll; "NNNpx" = absolute CSS px) is visited `--passes`
// times (default 2) with instant scrolls; the achieved scrollY must match the request and
// must REPRODUCE across passes. With --out, a screenshot is written per position on every
// pass and the SHA-256 of the bytes must match across passes (same machine, same session —
// hashes are not comparable across machines/browsers and the report says so).
//
// FAILS on: readiness contract violation (layout never settles while animations are
// killed), an unreachable/clamped position, an unstable scroll offset (scroll-linked JS
// still moving it), a cross-pass scroll-position mismatch, or a cross-pass screenshot
// hash mismatch. Exit 1 on any FAIL. Exit 2 on runner error. 0 otherwise.
// Spec home: ../references/layer-1-gates.md ("Deterministic scroll capture").

import { createHash } from "node:crypto";
import { mkdirSync, writeFileSync } from "node:fs";
import { join, resolve, basename } from "node:path";
import { loadPlaywright, launchBrowser, targetToUrl, splitFlags, pageReadiness } from "./verify_lib.mjs";

const { flags, targets } = splitFlags(process.argv.slice(2));
if (!targets.length || flags.help) {
  console.error("usage: node verify_scrollcapture.mjs <file.html|url> [...] [--positions 0,25,50,75,100] [--viewport 1280x800] [--passes 2] [--animations killed|running] [--out <dir>] [--json] [--channel msedge|chrome|chromium]");
  process.exit(2);
}
const vpm = String(flags.viewport || "1280x800").match(/^(\d+)x(\d+)$/);
if (!vpm) { console.error(`verify_scrollcapture: bad --viewport "${flags.viewport}" (use WxH, e.g. 1280x800)`); process.exit(2); }
const viewport = { width: Number(vpm[1]), height: Number(vpm[2]) };
const positionTokens = String(flags.positions || "0,25,50,75,100").split(",").map((s) => s.trim()).filter(Boolean);
const positions = positionTokens.map((tok) => {
  const px = tok.match(/^(\d+(?:\.\d+)?)px$/);
  if (px) return { token: tok, kind: "px", value: Number(px[1]) };
  const pct = tok.match(/^(\d+(?:\.\d+)?)%?$/);
  if (pct && Number(pct[1]) <= 100) return { token: tok, kind: "percent", value: Number(pct[1]) };
  return null;
});
if (!positions.length || positions.some((p) => p === null)) {
  console.error(`verify_scrollcapture: bad --positions "${flags.positions}" (comma list of percents 0-100 or "NNNpx")`);
  process.exit(2);
}
const passes = Number(flags.passes || 2);
if (!Number.isInteger(passes) || passes < 1 || passes > 10) {
  console.error(`verify_scrollcapture: bad --passes "${flags.passes}" (integer 1-10)`);
  process.exit(2);
}
const animations = String(flags.animations || "killed");
if (!["killed", "running"].includes(animations)) {
  console.error(`verify_scrollcapture: bad --animations "${flags.animations}" (killed|running)`);
  process.exit(2);
}
const outDir = flags.out ? resolve(String(flags.out)) : null;
if (outDir) mkdirSync(outDir, { recursive: true });

const { chromium } = await loadPlaywright();
const browser = await launchBrowser(chromium, flags.channel);
const context = await browser.newContext({ viewport, deviceScaleFactor: 1 });
const page = await context.newPage();

// FIXED in-page scroll probe (self-contained): instant scroll, then prove the offset
// is stable across two further frames (a drifting offset is nondeterminism).
const scrollProbe = async (yPx) => {
  window.scrollTo({ top: yPx, left: 0, behavior: "instant" });
  const raf = () => new Promise((r) => requestAnimationFrame(() => r()));
  await raf(); await raf();
  const a = window.scrollY;
  await raf();
  const b = window.scrollY;
  return { achievedPx: Math.round(b * 100) / 100, stable: a === b };
};

const report = {
  validator: "verify_scrollcapture", generated: new Date().toISOString(),
  viewport, deviceScaleFactor: 1,
  contract: {
    positions: positionTokens, passes, animations,
    note: "screenshot hashes attest same-machine/same-session reproduction only; they are not comparable across machines or browser builds",
  },
  targets: [], pass: true,
};

for (const target of targets) {
  const entry = { target, captures: [], violations: [], pass: true };
  report.targets.push(entry);
  const failEntry = (msg) => { entry.violations.push(msg); entry.pass = false; report.pass = false; };
  try { await page.goto(targetToUrl(target), { waitUntil: "networkidle", timeout: 30000 }); }
  catch (e) { failEntry(`load error: ${e.message.split("\n")[0]}`); continue; }
  entry.readiness = await pageReadiness(page, { animations });
  if (animations === "killed" && !entry.readiness.layoutSettled) {
    failEntry("readiness contract violated: layout did not settle with animations killed");
  }
  const maxScroll = await page.evaluate(() => Math.max(0, document.documentElement.scrollHeight - window.innerHeight));
  entry.maxScrollPx = maxScroll;

  const perPosition = positions.map((p) => ({
    position: p.token,
    requestedPx: p.kind === "percent" ? Math.round(((p.value / 100) * maxScroll) * 100) / 100 : p.value,
    passes: [], screenshots: [],
  }));
  for (let n = 0; n < passes; n++) {
    // Every pass restarts from the top so each is the same journey, not a delta.
    await page.evaluate(() => window.scrollTo({ top: 0, left: 0, behavior: "instant" }));
    for (let i = 0; i < perPosition.length; i++) {
      const cap = perPosition[i];
      let probe;
      try { probe = await page.evaluate(scrollProbe, cap.requestedPx); }
      catch (e) { failEntry(`scroll probe failed at ${cap.position}: ${e.message.split("\n")[0]}`); break; }
      cap.passes.push(probe);
      if (outDir) {
        const file = `${basename(target).replace(/[^a-zA-Z0-9_.-]/g, "_")}__scroll-${cap.position.replace("%", "pct")}__pass${n + 1}.png`;
        const bytes = await page.screenshot({ fullPage: false });
        writeFileSync(join(outDir, file), bytes);
        cap.screenshots.push({ file, sha256: createHash("sha256").update(bytes).digest("hex") });
      }
    }
  }
  for (const cap of perPosition) {
    const achieved = cap.passes.map((p) => p.achievedPx);
    cap.achievedPx = achieved[0];
    cap.deltaPx = Math.round(Math.abs((achieved[0] ?? NaN) - cap.requestedPx) * 100) / 100;
    cap.reproduced = achieved.length === passes && achieved.every((a) => Math.abs(a - achieved[0]) <= 1);
    cap.stable = cap.passes.every((p) => p.stable);
    const hashes = cap.screenshots.map((s) => s.sha256);
    cap.pixelReproduced = hashes.length ? hashes.every((h) => h === hashes[0]) : null;
    if (Number.isNaN(cap.deltaPx) || cap.deltaPx > 1) failEntry(`${cap.position}: requested ${cap.requestedPx}px but achieved ${cap.achievedPx}px (unreachable or clamped)`);
    if (!cap.stable) failEntry(`${cap.position}: scroll offset kept moving after an instant scroll (scroll-linked JS) — capture is not deterministic`);
    if (!cap.reproduced) failEntry(`${cap.position}: achieved offsets differ across passes (${achieved.join(", ")})`);
    if (cap.pixelReproduced === false) failEntry(`${cap.position}: screenshot bytes differ across passes — pixels do not reproduce at an identical scroll offset`);
  }
  entry.captures = perPosition;
}
await browser.close();

if (flags.json) {
  console.log(JSON.stringify(report, null, 2));
} else {
  const L = [`design-evaluate · verify_scrollcapture (behavior floor) · ${positionTokens.join("/")} @ ${viewport.width}x${viewport.height}, ${passes} pass(es), animations ${animations}`];
  for (const t of report.targets) {
    L.push(`  ${t.target} (max scroll ${t.maxScrollPx}px)`);
    if (t.readiness) L.push(`    readiness: readyState=${t.readiness.readyState} fonts=${t.readiness.fontsLoaded ? "loaded" : "PENDING"} layoutSettled=${t.readiness.layoutSettled} (${t.readiness.settleFrames} frames, ${t.readiness.waitedMs}ms)`);
    for (const c of t.captures || []) {
      const px = c.pixelReproduced === null ? "" : `, pixels ${c.pixelReproduced ? "reproduced" : "DIFFER"}`;
      L.push(`    [${c.deltaPx <= 1 && c.stable && c.reproduced && c.pixelReproduced !== false ? "PASS" : "FAIL"}] ${c.position}: requested ${c.requestedPx}px, achieved ${c.achievedPx}px (stable ${c.stable}, reproduced ${c.reproduced}${px})`);
    }
    for (const v of t.violations) L.push(`    [FAIL] ${v}`);
  }
  L.push(`  RESULT: ${report.pass ? "PASS — every position reached, stable, and reproduced under the readiness contract" : "FAIL — capture determinism contract broken"}`);
  console.log(L.join("\n"));
}
process.exit(report.pass ? 0 : 1);
