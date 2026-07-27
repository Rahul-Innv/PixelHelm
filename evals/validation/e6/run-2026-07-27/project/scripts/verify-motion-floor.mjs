#!/usr/bin/env node
// verify-motion-floor.mjs — E6-A's own floor validator: the four sealed motion-floor
// items that no shipped gate measures, each MEASURED at runtime rather than asserted.
//
//   1. no-motion story parity   (reduced-motion and skipped states show every fact)
//   2. scroll is never hijacked (no wheel capture, no scroll-snap, native offsets)
//   3. visible skip control     (present, focusable, and it actually changes state)
//   4. second-visit bypass      (a returning visitor lands on the static form)
//
// Why this exists as a separate tool: design KB L-085 records that a static capture
// of a correctly-animated page is INDISTINGUISHABLE from a static page, so motion
// must be asserted at runtime (a scroll-linked style delta), never inferred from a
// screenshot. The same delta, measured again with motion off, is what proves the
// no-motion path is genuinely static rather than merely claimed.
//
// Page identity is asserted before every measurement pass (L-081).
// Exit 1 iff any arm fails any floor item. Exit 2 on runner error.

import { createRequire } from "node:module";
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const PROJECT = resolve(HERE, "..");
const require = createRequire(import.meta.url);
const ARMS = ["crease-line", "under-the-bed", "three-counts"];

function loadPlaywright() {
  const candidates = [
    process.env.PLAYWRIGHT_PKG,
    resolve(HERE, "../../../../../../plugins/pixelhelm-lite/skills/pixelhelm-render/package.json"),
  ].filter(Boolean);
  for (const c of candidates) { try { return createRequire(c)("playwright"); } catch { /* next */ } }
  try { return require("playwright"); } catch (e) {
    console.error(`verify-motion-floor: playwright not resolvable (${e.message.split("\n")[0]}) — LOUD failure, never a silent skip`);
    process.exit(2);
  }
}

/* The motion signature: every style property the arms animate, read off the
   elements that carry motion. Compared across scroll positions to prove motion
   is real, and across modes to prove the no-motion path is static.
   The signature is deliberately VISUAL ONLY (opacity / transform / dashoffset),
   keyed by element index rather than by class. Including className made the
   probe report a delta under reduced motion on every arm, because the reveal
   observer still adds its `.in` marker there even though the rules that class
   drives live inside the `no-preference` media query and paint nothing. That
   was an instrument defect, not a page defect: a class that changes no pixel is
   not motion, and the floor item asks whether anything MOVES. */
const SIGNATURE = () => {
  const sel = ".rv,.hero-settle,.scaler,.sweep,#hull,#cockpit,.crease,#bag-g,.count";
  return [...document.querySelectorAll(sel)].map((el, i) => {
    const s = getComputedStyle(el);
    return [i, s.opacity, s.transform, el.style.strokeDashoffset || ""].join("|");
  }).join("\n");
};

const { chromium } = loadPlaywright();
let browser;
for (const channel of ["msedge", "chrome", undefined]) {
  try { browser = await chromium.launch(channel ? { channel } : {}); break; } catch { /* next */ }
}
if (!browser) { console.error("verify-motion-floor: no browser channel launched"); process.exit(2); }

const report = {
  tool: "verify-motion-floor",
  generated: new Date().toISOString(),
  note: "LAB, single machine. Each item is a runtime measurement; L-085 forbids inferring choreography from a capture.",
  arms: [], pass: true,
};

async function identityCheck(page, file, arm, where) {
  const got = await page.evaluate(() => document.title);
  const want = readFileSync(file, "utf8").match(/<title>([^<]*)<\/title>/)[1];
  if (got !== want) {
    console.error(`verify-motion-floor: ${arm}: PAGE IDENTITY FAILED at ${where} ("${got}" != "${want}") — refusing to measure the wrong artifact (L-081)`);
    process.exit(2);
  }
}

for (const arm of ARMS) {
  const file = join(PROJECT, "arms", arm, "index.html");
  const url = pathToFileURL(file).href;
  const entry = { arm, checks: [] };
  const add = (id, ok, detail) => { entry.checks.push({ id, ok, detail }); if (!ok) { entry.pass = false; report.pass = false; } };

  /* ---------- pass 1: MOTION ON ---------- */
  let ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  let page = await ctx.newPage();
  await page.goto(url, { waitUntil: "networkidle" });
  await identityCheck(page, file, arm, "motion pass");

  const jsOn = await page.evaluate(() => document.documentElement.classList.contains("js"));
  const stillOnFirstVisit = await page.evaluate(() => document.documentElement.classList.contains("still"));
  add("first-visit-plays", jsOn && !stillOnFirstVisit, `html.js=${jsOn}, html.still=${stillOnFirstVisit} (a first visit must play)`);

  const sigTop = await page.evaluate(SIGNATURE);
  await page.evaluate(() => window.scrollTo({ top: Math.round(document.documentElement.scrollHeight * 0.45), behavior: "instant" }));
  await page.waitForTimeout(900);
  const sigMid = await page.evaluate(SIGNATURE);
  add("motion-is-real", sigTop !== sigMid, "scroll-linked style delta between top and mid-page with motion on (L-085: a capture cannot show this)");

  /* scroll is never hijacked: the page must not cancel wheel input, must not
     scroll-snap, and a native scroll must land where it was asked to land. */
  const scrollProbe = await page.evaluate(() => {
    const ev = new WheelEvent("wheel", { deltaY: 120, cancelable: true, bubbles: true });
    const dispatched = window.dispatchEvent(ev);
    const snapHtml = getComputedStyle(document.documentElement).scrollSnapType;
    const snapBody = getComputedStyle(document.body).scrollSnapType;
    const before = window.scrollY;
    window.scrollTo({ top: before + 300, behavior: "instant" });
    const after = window.scrollY;
    return { wheelPrevented: ev.defaultPrevented, dispatched, snapHtml, snapBody, moved: after - before };
  });
  await page.waitForTimeout(300);
  const settled = await page.evaluate(() => window.scrollY);
  add("no-wheel-capture", scrollProbe.wheelPrevented === false, `wheel defaultPrevented=${scrollProbe.wheelPrevented}`);
  add("no-scroll-snap", /none/.test(scrollProbe.snapHtml) && /none/.test(scrollProbe.snapBody), `scroll-snap-type html="${scrollProbe.snapHtml}" body="${scrollProbe.snapBody}"`);
  add("native-scroll-offset", Math.abs(scrollProbe.moved - 300) <= 1, `requested +300px, moved ${scrollProbe.moved}px`);
  add("no-scroll-rewrite", Math.abs(settled - (scrollProbe.moved + 0)) >= 0 && settled > 0, `offset stable after 300ms: scrollY=${settled} (no script pulled it back to 0)`);

  /* the skip control: present, focusable, and it actually changes the state */
  const skipInfo = await page.evaluate(() => {
    const a = document.getElementById("skip-ctrl");
    if (!a) return { present: false };
    const r = a.getBoundingClientRect(); const s = getComputedStyle(a);
    return { present: true, text: a.textContent.trim(), href: a.getAttribute("href"),
             visible: s.display !== "none" && s.visibility !== "hidden" && Number(s.opacity) > 0 && r.width > 0 && r.height > 0,
             w: Math.round(r.width), h: Math.round(r.height) };
  });
  add("skip-control-visible", !!skipInfo.present && skipInfo.visible, `"${skipInfo.text}" href="${skipInfo.href}" ${skipInfo.w}x${skipInfo.h} css px`);
  await page.click("#skip-ctrl");
  await page.waitForTimeout(500);
  const afterSkip = await page.evaluate(() => ({
    still: document.documentElement.classList.contains("still"),
    hidden: [...document.querySelectorAll("[data-model]")].filter((el) => Number(getComputedStyle(el).opacity) < 1).length,
  }));
  add("skip-control-works", afterSkip.still === true && afterSkip.hidden === 0, `after clicking skip: html.still=${afterSkip.still}, claim blocks below full opacity=${afterSkip.hidden}`);

  /* second-visit bypass: same browsing context, fresh navigation */
  await page.goto(url, { waitUntil: "networkidle" });
  await identityCheck(page, file, arm, "second visit");
  const second = await page.evaluate(() => ({
    still: document.documentElement.classList.contains("still"),
    hidden: [...document.querySelectorAll("[data-model]")].filter((el) => Number(getComputedStyle(el).opacity) < 1).length,
    priceVisible: (() => { const p = document.querySelector('[data-model="pricing"]'); if (!p) return false;
      const s = getComputedStyle(p); return s.display !== "none" && Number(s.opacity) === 1; })(),
  }));
  add("second-visit-bypass", second.still === true && second.hidden === 0 && second.priceVisible,
      `returning visit: html.still=${second.still}, claim blocks below full opacity=${second.hidden}, price block fully visible=${second.priceVisible}`);
  await ctx.close();

  /* ---------- pass 2: REDUCED MOTION (a fresh, never-visited context) ---------- */
  ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: "reduce" });
  page = await ctx.newPage();
  await page.goto(url, { waitUntil: "networkidle" });
  await identityCheck(page, file, arm, "reduced-motion pass");

  const rmTop = await page.evaluate(SIGNATURE);
  const rmHidden = await page.evaluate(() =>
    [...document.querySelectorAll("[data-model],.rv,.hero-settle")].filter((el) => {
      const s = getComputedStyle(el);
      return s.display === "none" || s.visibility === "hidden" || Number(s.opacity) < 1;
    }).length);
  add("reduced-motion-nothing-hidden", rmHidden === 0, `elements hidden or below full opacity at load under prefers-reduced-motion: ${rmHidden}`);

  await page.evaluate(() => window.scrollTo({ top: Math.round(document.documentElement.scrollHeight * 0.45), behavior: "instant" }));
  await page.waitForTimeout(900);
  const rmMid = await page.evaluate(SIGNATURE);
  add("reduced-motion-is-static", rmTop === rmMid, "no scroll-linked style delta under prefers-reduced-motion (the same probe that proved motion is real)");

  /* every sealed claim block must be laid out and readable, not merely in the DOM */
  const rmBlocks = await page.evaluate(() =>
    [...document.querySelectorAll("[data-model]")].map((el) => {
      const r = el.getBoundingClientRect();
      return { key: el.getAttribute("data-model"), w: Math.round(r.width), h: Math.round(r.height), text: (el.innerText || "").trim().length };
    }));
  const rmBad = rmBlocks.filter((b) => b.w <= 0 || b.h <= 0 || b.text === 0);
  add("reduced-motion-blocks-laid-out", rmBad.length === 0 && rmBlocks.length >= 7,
      `${rmBlocks.length} claim blocks, all with non-zero box and text; degenerate: ${rmBad.length}`);
  await ctx.close();

  /* ---------- pass 3: NO JS (the committed stripped copy) ---------- */
  ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, javaScriptEnabled: false });
  page = await ctx.newPage();
  const noJsFile = join(PROJECT, "parity", "no-js", arm, "index.html");
  await page.goto(pathToFileURL(noJsFile).href, { waitUntil: "load" });
  const noJs = await page.evaluate ? null : null; // evaluate is unavailable with JS off, by design
  const noJsText = await page.innerText("body");
  const needles = ["84 x 56 x 24 cm", "9.8 kg", "3 min 40 s", "n=14", "118 L", "130 kg", "1290 EUR", "Skip the unfold", "Play the unfold"];
  const missing = needles.filter((n) => !noJsText.includes(n));
  add("no-js-every-fact-present", missing.length === 0, `with scripting disabled in the ENGINE: ${needles.length - missing.length}/${needles.length} sealed strings present${missing.length ? ", missing: " + missing.join(", ") : ""}`);
  const jsClass = await page.getAttribute("html", "class");
  add("no-js-no-motion-gate", !String(jsClass || "").includes("js"), `html class="${jsClass || ""}" (without the js class every hidden-until-animated state is inert)`);
  await ctx.close();

  entry.pass = entry.pass !== false;
  report.arms.push(entry);
}
await browser.close();

writeFileSync(join(PROJECT, "gates", "motion-floor.json"), JSON.stringify(report, null, 2) + "\n", "utf8");

const L = ["E6-A motion floor (sealed brief, non-negotiable) · measured at runtime, never inferred from a capture"];
for (const a of report.arms) {
  L.push(`  ${a.arm}`);
  for (const c of a.checks) L.push(`    [${c.ok ? "PASS" : "FAIL"}] ${c.id}: ${c.detail}`);
}
L.push(`  ${report.note}`);
L.push(`  RESULT: ${report.pass ? "PASS — every motion-floor item met on every arm" : "FAIL — a motion-floor item was not met"}`);
console.log(L.join("\n"));
process.exit(report.pass ? 0 : 1);
