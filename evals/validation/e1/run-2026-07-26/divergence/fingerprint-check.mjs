#!/usr/bin/env node
// fingerprint-check.mjs — E2 metric (d): each arm's committed code AND rendered
// computed styles grepped against every any[] signature of ACTIVE entries in
// the fingerprint registry (shipped seed + live registry when present), per
// PREREG-METRICS-divergence.md. Registry files are hashed into the output.
// Usage: node fingerprint-check.mjs --seed <fingerprints-seed.md> [--live <fingerprints.md>] <arm.html> [...]
import { readFileSync, existsSync } from "node:fs";
import { createHash } from "node:crypto";
import { basename, dirname, resolve } from "node:path";
import { createRequire } from "node:module";

const argv = process.argv.slice(2);
const flag = (n) => { const i = argv.indexOf(`--${n}`); return i >= 0 ? argv[i + 1] : null; };
const seedPath = flag("seed");
const livePath = flag("live");
const files = argv.filter((a, i) => !a.startsWith("--") && argv[i - 1] !== "--seed" && argv[i - 1] !== "--live");
if (!seedPath || files.length === 0) { console.error("usage: node fingerprint-check.mjs --seed <seed.md> [--live <live.md>] <arm.html> [...]"); process.exit(2); }

function parseRegistry(text) {
  const entries = [];
  for (const block of text.split(/\n- id: /).slice(1)) {
    const id = block.split("|")[0].trim();
    const status = (block.match(/status:\s*(\w+)/) || [])[1];
    const anyLine = block.match(/any:\s*(\[.*?\])/s);
    let any = [];
    if (anyLine) { try { any = JSON.parse(anyLine[1]); } catch { any = []; } }
    entries.push({ id, status, any });
  }
  return entries.filter((e) => e.status === "active");
}
const sha256 = (buf) => createHash("sha256").update(buf).digest("hex");
const seedText = readFileSync(seedPath, "utf8");
const registries = [{ role: "shipped-seed", path: seedPath, sha256: sha256(readFileSync(seedPath)) }];
let entries = parseRegistry(seedText);
if (livePath && existsSync(livePath)) {
  registries.push({ role: "live", path: livePath, sha256: sha256(readFileSync(livePath)) });
  entries = entries.concat(parseRegistry(readFileSync(livePath, "utf8")));
} else {
  registries.push({ role: "live", path: livePath || "~/.claude/pixelhelm/fingerprints.md", sha256: null, note: "live registry absent at run time - active registry is the seed alone" });
}

const hexToRgbStr = (hex) => {
  const h = hex.replace("#", "").trim();
  if (!/^[0-9a-f]{3,8}$/i.test(h) || (h.length !== 3 && h.length !== 6)) return null;
  const full = h.length === 3 ? h.split("").map((c) => c + c).join("") : h;
  const [r, g, b] = [0, 2, 4].map((i) => parseInt(full.slice(i, i + 2), 16));
  return `rgb(${r}, ${g}, ${b})`;
};

// computed-style harvest via the render skill's vendored playwright:
// pass --pw <dir-containing-node_modules> (e.g. the pixelhelm-render skill dir)
const pwDir = flag("pw");
let chromium;
try {
  const req = createRequire(resolve(pwDir ?? ".", "package.json"));
  const { pathToFileURL } = await import("node:url");
  ({ chromium } = await import(pathToFileURL(req.resolve("playwright")).href));
} catch (e) { console.error(`fingerprint-check: playwright unavailable (${e.message}) — pass --pw <render-skill-dir>`); process.exit(2); }

async function harvestComputed(file) {
  for (const channel of ["msedge", "chrome", undefined]) {
    try {
      const browser = await chromium.launch(channel ? { channel } : {});
      const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
      await page.goto("file:///" + resolve(file).replace(/\\/g, "/"));
      await page.waitForTimeout(250);
      const styles = await page.evaluate(() => {
        const props = ["color", "background-color", "background-image", "border-top-color", "border-bottom-color", "outline-color", "backdrop-filter", "box-shadow"];
        const seen = new Set();
        for (const el of document.querySelectorAll("*")) {
          const cs = getComputedStyle(el);
          for (const p of props) { const v = cs.getPropertyValue(p); if (v && v !== "none") seen.add(`${p}:${v}`); }
        }
        return [...seen].join("\n");
      });
      await browser.close();
      return styles;
    } catch { /* next channel */ }
  }
  throw new Error("no browser could be launched");
}

const results = [];
for (const file of files) {
  const code = readFileSync(file, "utf8");
  const computed = await harvestComputed(file);
  const matches = [];
  for (const e of entries) {
    for (const sig of e.any) {
      const inCode = code.toLowerCase().includes(sig.toLowerCase());
      const rgb = sig.startsWith("#") ? hexToRgbStr(sig) : null;
      const inComputed = computed.toLowerCase().includes(sig.toLowerCase()) || (rgb ? computed.includes(rgb) : false);
      if (inCode || inComputed) matches.push({ entry: e.id, signature: sig, inCode, inComputed });
    }
  }
  results.push({ arm: basename(dirname(file)), matches, clean: matches.length === 0 });
}
console.log(JSON.stringify({
  metric: "E2(d) fingerprint test", registries,
  activeEntries: entries.map((e) => ({ id: e.id, signatures: e.any.length })),
  results, zeroMatchesAllArms: results.every((r) => r.clean),
}, null, 2));
