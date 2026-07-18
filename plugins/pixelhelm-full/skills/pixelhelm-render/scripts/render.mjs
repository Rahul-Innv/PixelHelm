#!/usr/bin/env node
// render.mjs — capture design screenshots (baselines or candidates) for the front-end-design loop.
//
// Usage (config file):   node render.mjs <targets.json>
// Usage (flags):         node render.mjs --target <file.html|url> [--out <dir>] [--name <item-name>]
//                                        [--viewports 1440x900,375x812] [--modes light,dark|asis]
//                                        [--channel msedge|chrome|chromium]
//                        node render.mjs --help
// Renders each item at every viewport x every mode to PNG under outDir, and writes a render.json
// manifest there. Browser channel fallback: configured channel -> system Edge -> system Chrome ->
// bundled chromium (cross-platform; no Playwright browser download needed when a system browser exists).
//
// targets.json shape:
// {
//   "browserChannel": "msedge",                 // optional; fallback chain still applies
//   "outDir": "renders/my-surface",             // resolved relative to the targets.json
//   "viewports": [{ "name": "desktop", "width": 1440, "height": 900 }],
//   "modes": ["light", "dark"],                 // or ["asis"] to render the page untouched
//   "darkAttr": "data-theme",                   // attribute set on <html> per mode
//   "items": [
//     { "name": "screen-x", "file": "relative/or/abs/path.html" },   // or { "name", "url" }
//     { "name": "screen-x-extreme", "file": "path.html",             // P56 extreme-content re-render:
//       "substitutions": [ { "find": "Acme", "replace": "A 53-character-long organization name for wrap testing" } ] }
//   ]
// }
// `substitutions` (file items only) swaps demo strings for real-extreme content before rendering —
// the machine arm of the P56 Content-Robustness composite (see references/recipes.md).

import { readFileSync, writeFileSync, mkdirSync, readdirSync, unlinkSync } from "node:fs";
import { resolve, dirname, join } from "node:path";
import { pathToFileURL, fileURLToPath } from "node:url";

const HELP = `render.mjs — screenshot capture for the design loop
  node render.mjs <targets.json>
  node render.mjs --target <file.html|url> [--out|--outdir <dir>] [--name <item-name>]
                  [--viewports 1440,768,375 | 1440x900,375x812] [--modes light,dark|asis]
                  [--channel msedge|chrome|chromium] [--reduced-motion] [--feel] [--open] [--axe]
Outputs: <name>__<viewport>__<mode>.png per cell + render.json manifest in the out dir.
--open shows the PNGs to the owner (opens files if <=4, else the folder). --reduced-motion
renders with prefers-reduced-motion:reduce emulated (use a separate --out). --feel drives the
page with MOTION ON and captures scroll-depth frames (feel-*.png) so the owner sees the real
FEEL, not a reduced-motion still; every stale feel-*.png in the out dir is deleted first so a
fixed bug can never resurface from an old frame. --axe runs the vendored axe-core suite per cell
and writes serious/critical violations into render.json (pixelhelm-evaluate Layer-1 treats them as
FAIL; render only reports).`;

function parseArgs(argv) {
  if (!argv.length || argv.includes("--help") || argv.includes("-h")) { console.log(HELP); process.exit(argv.length ? 0 : 2); }
  if (!argv[0].startsWith("--")) return { cfgPath: argv[0] };
  const flags = {};
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (!a.startsWith("--")) continue;
    flags[a.slice(2)] = argv[i + 1] && !argv[i + 1].startsWith("--") ? argv[++i] : true;
  }
  if (!flags.target) { console.error("render: --target <file.html|url> is required in flag mode\n" + HELP); process.exit(2); }
  const isUrl = /^https?:\/\//i.test(flags.target);
  const name = flags.name || (isUrl ? "page" : String(flags.target).replace(/\\/g, "/").split("/").pop().replace(/\.[^.]*$/, ""));
  const viewports = flags.viewports
    ? String(flags.viewports).split(",").map((s) => {
        const m = s.trim().match(/^(\d+)(?:x(\d+))?$/);
        if (!m) { console.error(`render: bad viewport "${s}" (use W or WxH, e.g. 1440 or 1440x900)`); process.exit(2); }
        return { name: `${m[1]}w`, width: Number(m[1]), height: Number(m[2] || 900) };
      })
    : undefined;
  return {
    cfg: {
      browserChannel: flags.channel,
      outDir: flags.out || flags.outdir || "renders",
      viewports,
      modes: flags.modes ? String(flags.modes).split(",").map((s) => s.trim()) : undefined,
      reducedMotion: !!flags["reduced-motion"],
      feel: !!flags.feel,
      open: !!flags.open,
      axe: !!flags.axe,
      items: [isUrl ? { name, url: flags.target } : { name, file: flags.target }],
    },
    baseDir: process.cwd(),
  };
}

const parsed = parseArgs(process.argv.slice(2));
let cfg, baseDir;
if (parsed.cfgPath) {
  try { cfg = JSON.parse(readFileSync(parsed.cfgPath, "utf8")); }
  catch (e) { console.error(`render: cannot read ${parsed.cfgPath}: ${e.message}`); process.exit(2); }
  baseDir = dirname(resolve(parsed.cfgPath));
} else { cfg = parsed.cfg; baseDir = parsed.baseDir; }

let chromium;
try { ({ chromium } = await import("playwright"));
} catch {
  const skillDir = resolve(dirname(fileURLToPath(import.meta.url)), "..");
  console.error(`render: playwright is not installed for THIS plugin version (the install dir is per-version — re-run after every plugin update).
Fix — run in ${skillDir}:
  bash:        PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1 npm i
  PowerShell:  $env:PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD='1'; npm i
(uses your system Edge/Chrome — no browser download; without one, drop the env var or run: npx playwright install chromium)`);
  process.exit(2);
}

// --axe: the vendored axe-core source (a FIXED third snippet — never model-authored JS).
let axeSource = null;
if (cfg.axe) {
  try { axeSource = readFileSync(resolve(dirname(fileURLToPath(import.meta.url)), "..", "node_modules", "axe-core", "axe.min.js"), "utf8"); }
  catch {
    console.error("render: --axe needs axe-core for this plugin version. Fix: npm i in the pixelhelm-render skill dir (axe-core is in its package.json).");
    process.exit(2);
  }
}

const outDir = resolve(baseDir, cfg.outDir || ".");
mkdirSync(outDir, { recursive: true });
const viewports = cfg.viewports || [{ name: "desktop", width: 1440, height: 900 }];
const modes = cfg.modes || ["light"];
const darkAttr = cfg.darkAttr || "data-theme";

async function launch() {
  // Fallback chain: configured channel -> Edge -> Chrome -> bundled chromium (dedup, keep order).
  const channels = [...new Set([cfg.browserChannel, "msedge", "chrome", undefined].filter((c, i, a) => a.indexOf(c) === i))];
  for (const channel of channels) {
    try { return await chromium.launch(channel ? { channel } : {}); }
    catch (e) { console.error(`render: launch ${channel || "bundled chromium"} failed: ${e.message.split("\n")[0]}`); }
  }
  console.error("render: could not launch any browser (install Edge/Chrome, or run: npx playwright install chromium)");
  process.exit(2);
}

const browser = await launch();
const context = await browser.newContext({ deviceScaleFactor: 2 });
const page = await context.newPage();

let shots = 0;
let failures = 0;
const manifest = [];
const axeTotals = { serious: 0, critical: 0, cellsRun: 0 };
for (const item of cfg.items || []) {
  let target;
  if (item.url) {
    target = item.url;
    if (item.substitutions) console.error(`render: [warn] ${item.name}: substitutions are file-only (url items render as-is)`);
  } else {
    let file = resolve(baseDir, item.file);
    if (Array.isArray(item.substitutions) && item.substitutions.length) {
      // P56 extreme-content arm: swap demo strings for real-extreme content, render the variant.
      let html = readFileSync(file, "utf8");
      for (const s of item.substitutions) {
        if (!html.includes(s.find)) console.error(`render: [warn] ${item.name}: substitution find-string not present: "${s.find}"`);
        html = html.split(s.find).join(s.replace);
      }
      const tmpDir = join(outDir, "_extreme");
      mkdirSync(tmpDir, { recursive: true });
      file = join(tmpDir, `${item.name}.html`);
      writeFileSync(file, html);
    }
    target = pathToFileURL(file).href;
  }
  let loaded = true;
  try { await page.goto(target, { waitUntil: "networkidle", timeout: 30000 }); }
  catch (e) { console.error(`render: [skip] ${item.name}: ${e.message}`); loaded = false; failures++; }
  if (!loaded) continue;
  // let webfonts settle so we don't capture a system-fallback render (KB L-006)
  try { await page.evaluate(() => (document.fonts ? document.fonts.ready : null)); } catch {}
  if (axeSource) {
    try { await page.addScriptTag({ content: axeSource }); }
    catch (e) { console.error(`render: [warn] ${item.name}: axe inject failed (${e.message.split("\n")[0]}) — cells will carry no axe data`); }
  }
  // Kill CSS transitions/animations for the whole capture (wave-2 C.1): a body
  // `transition: background-color .2s` made the luminance probe below read a MID-BLEND color
  // 50ms after theme-set → a spurious mode-fidelity "warn" on a correct render. End-states are
  // identical, so this is screenshot-safe (and makes captures deterministic); no page may DEPEND
  // on an animation to reach its resting state (that would also break under reduced-motion).
  try { await page.addStyleTag({ content: "*, *::before, *::after { transition: none !important; animation: none !important; }" }); }
  catch (e) { console.error(`render: [warn] ${item.name}: transition-off inject failed (${e.message.split("\n")[0]}) — mode-fidelity may mis-warn on theme-transition pages`); }
  for (const mode of modes) {
    const asis = mode === "asis";
    const dark = mode === "dark";
    let modeFidelity = "n/a";
    const media = cfg.reducedMotion ? { reducedMotion: "reduce" } : {};
    if (asis) {
      if (cfg.reducedMotion) await page.emulateMedia(media);
    } else {
      await page.emulateMedia({ ...media, colorScheme: dark ? "dark" : "light" });
      // Set the theme attr EXPLICITLY for BOTH modes (KB L-028 H2 / LESSON 3.6): merely REMOVING the
      // attr for "light" leaves a default-dark :root dark, so the "light" render is silently a dark
      // clone. Setting data-theme="light" flips a [data-theme="light"] override, and is harmless for a
      // default-light stylesheet (no such override -> falls back to :root light).
      await page.evaluate(({ attr, dark }) => {
        const el = document.documentElement;
        el.setAttribute(attr, dark ? "dark" : "light");
        el.classList.toggle("dark", dark);
        el.classList.toggle("light", !dark);
      }, { attr: darkAttr, dark });
      await page.waitForTimeout(50);
      // Mode-fidelity assertion (KB L-028 H2): confirm the RENDERED background matches the mode. A
      // "light" render with a dark background (or vice-versa) is the render.mjs mode bug — warn LOUDLY
      // so a register-fit judge never scores a mode clause (e.g. "dark-first") off a capture artifact.
      try {
        const lum = await page.evaluate(() => {
          const read = (el) => {
            const bg = getComputedStyle(el).backgroundColor || "";
            if (!bg || bg === "transparent") return null;
            const m = bg.match(/[\d.]+/g);
            if (!m || m.length < 3) return null;
            if (m.length >= 4 && Number(m[3]) === 0) return null; // fully transparent
            const [r, g, b] = m.map(Number);
            return (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255; // 0=black .. 1=white
          };
          return read(document.body) ?? read(document.documentElement);
        });
        modeFidelity = "ok";
        if (lum != null && (lum < 0.5) !== dark) {
          modeFidelity = "warn";
          console.error(`render: [WARN] ${item.name} "${mode}" render looks ${lum < 0.5 ? "DARK" : "LIGHT"} (body bg luminance ${lum.toFixed(2)}) — the "${mode}" theme may not have applied (KB L-028 H2). Do NOT judge a register mode clause off this render.`);
        }
      } catch {}
    }
    for (const vp of viewports) {
      await page.setViewportSize({ width: vp.width, height: vp.height });
      await page.waitForTimeout(150);
      const fname = `${item.name}__${vp.name}__${mode}.png`;
      const path = resolve(outDir, fname);
      try {
        await page.screenshot({ path, fullPage: true });
        shots++;
        let axe;
        if (axeSource) {
          // FIXED snippet #3: run the vendored axe-core suite on the rendered cell (report-only —
          // pixelhelm-evaluate Layer-1 owns the FAIL; serious/critical are what it gates on).
          try {
            const res = await page.evaluate(async () => await window.axe.run(document, { resultTypes: ["violations"] }));
            const bad = res.violations.filter((v) => v.impact === "serious" || v.impact === "critical");
            axe = {
              serious: bad.filter((v) => v.impact === "serious").length,
              critical: bad.filter((v) => v.impact === "critical").length,
              violations: bad.slice(0, 10).map((v) => ({ id: v.id, impact: v.impact, nodes: v.nodes.length, sample: v.nodes[0]?.target?.[0] || "" })),
            };
            axeTotals.serious += axe.serious; axeTotals.critical += axe.critical; axeTotals.cellsRun++;
            if (bad.length) console.error(`render: [axe] ${fname}: ${bad.map((v) => `${v.id}(${v.impact} x${v.nodes.length})`).join(", ")}`);
          } catch (e) { console.error(`render: [warn] axe run failed on ${fname}: ${e.message.split("\n")[0]}`); }
        }
        manifest.push({ file: fname, item: item.name, viewport: vp.name, mode, modeFidelity, extreme: !!item.substitutions, ...(axe ? { axe } : {}) });
      } catch (e) { console.error(`render: [fail] ${fname}: ${e.message}`); failures++; }
    }
  }
  console.error(`render: captured ${item.name}`);
}

// --feel: DRIVE the page with motion ON and capture scroll-depth frames (feel-*.png). Stale feel
// frames have resurfaced already-fixed bugs before — so wipe EVERY existing feel-*.png in the out
// dir BEFORE capturing the new set. Reduced-motion stills reveal what is VISIBLE; the feel pass
// reveals what MOVES. It never touches the matrix PNGs and is not part of the render.json contract.
if (cfg.feel) {
  for (const f of readdirSync(outDir)) {
    if (/^feel-.*\.png$/.test(f)) { try { unlinkSync(resolve(outDir, f)); } catch {} }
  }
  const feelCtx = await browser.newContext({ deviceScaleFactor: 2, colorScheme: (modes.includes("dark") ? "dark" : "light") });
  const feelPage = await feelCtx.newPage();
  await feelPage.setViewportSize({ width: 1440, height: 900 });
  const depths = [0, 0.28, 0.5, 0.72, 0.95];
  let feelShots = 0;
  for (const item of cfg.items || []) {
    const feelTarget = item.url ? item.url : pathToFileURL(resolve(baseDir, item.file)).href;
    try { await feelPage.goto(feelTarget, { waitUntil: "networkidle", timeout: 30000 }); }
    catch (e) { console.error(`render: [feel-skip] ${item.name}: ${e.message.split("\n")[0]}`); continue; }
    try { await feelPage.evaluate(() => (document.fonts ? document.fonts.ready : null)); } catch {}
    for (let i = 0; i < depths.length; i++) {
      await feelPage.evaluate((d) => window.scrollTo(0, document.body.scrollHeight * d), depths[i]);
      await feelPage.waitForTimeout(900);
      try { await feelPage.screenshot({ path: resolve(outDir, `feel-${item.name}-${i}-${Math.round(depths[i] * 100)}.png`) }); feelShots++; }
      catch (e) { console.error(`render: [feel-warn] ${item.name} depth ${depths[i]}: ${e.message.split("\n")[0]}`); }
    }
  }
  await feelCtx.close();
  console.log(`render: feel: ${feelShots} scroll-depth frame(s) captured (motion ON) -> ${outDir}`);
}

await browser.close();
try {
  writeFileSync(join(outDir, "render.json"), JSON.stringify({
    generated: new Date().toISOString(),
    viewports, modes, darkAttr,
    ...(cfg.axe ? { axe: axeTotals } : {}),
    shots: manifest,
  }, null, 2));
} catch (e) { console.error(`render: [warn] could not write render.json: ${e.message}`); }
console.log(`render: ${shots} screenshot(s) -> ${outDir}`);
for (const m of manifest) console.log(`  ${m.file}${m.modeFidelity === "warn" ? "   [MODE-FIDELITY WARN]" : ""}${m.axe && (m.axe.serious + m.axe.critical) ? `   [AXE ${m.axe.critical} critical / ${m.axe.serious} serious]` : ""}`);
if (cfg.axe) console.log(!axeTotals.cellsRun
  ? `render: axe: NOT RUN (no cell carried axe data — injection failed?). Do not report this as clean.`
  : axeTotals.serious + axeTotals.critical
  ? `render: axe: ${axeTotals.critical} critical + ${axeTotals.serious} serious across ${axeTotals.cellsRun} cell(s) — pixelhelm-evaluate Layer-1 treats these as FAIL`
  : `render: axe: clean (0 serious/critical across ${axeTotals.cellsRun} cell(s))`);

if (cfg.open && manifest.length) {
  // L-013: the owner judges pixels ON SCREEN — open the PNGs (or the folder for big matrices).
  const { exec } = await import("node:child_process");
  const opener = process.platform === "win32" ? (p) => `start "" "${p}"`
    : process.platform === "darwin" ? (p) => `open "${p}"`
    : (p) => `xdg-open "${p}"`;
  const targets = manifest.length <= 4 ? manifest.map((m) => resolve(outDir, m.file)) : [outDir];
  for (const t of targets) {
    exec(process.platform === "win32" ? `cmd /c ${opener(t)}` : opener(t), (e) => {
      if (e) console.error(`render: [warn] could not open ${t}: ${e.message}`);
    });
  }
}

// A partial matrix must never read as done (SKILL.md Decision Criteria).
if (failures) { console.error(`render: ${failures} cell(s)/item(s) FAILED — do not present this as a complete matrix`); process.exitCode = 1; }
