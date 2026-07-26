#!/usr/bin/env node
// build.mjs — assemble the design-pixelhelm editions from the dev copy.
//
// Usage:  node build/build.mjs [--check]
//   --check: build into a temp dir and diff against the committed plugins/ — exit 1 on drift.
//
// Pipeline per edition: copy skill list -> FULL-ONLY marker pass -> LITE literal
// replacements (fail if a find-string is missing) -> LITE dropFiles -> overlays ->
// regenerate skills.json + llms.txt + plugin.json -> repo-root marketplace.json -> lint gate.
// Deterministic: sorted walks, LF-normalized writes. Zero dependencies.

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const repo = path.dirname(here);
const cfg = JSON.parse(fs.readFileSync(path.join(here, "build.config.json"), "utf8"));
cfg.devCopy = path.resolve(repo, cfg.devCopy);
const CHECK = process.argv.includes("--check");
const outRoot = CHECK ? fs.mkdtempSync(path.join(repo, ".build-check-")) : path.join(repo, "plugins");

const fail = (m) => { console.error(`BUILD FAIL: ${m}`); cleanup(); process.exit(1); };
const cleanup = () => { if (CHECK) { try { fs.rmSync(outRoot, { recursive: true, force: true }); } catch {} } };
const lf = (s) => s.replace(/\r\n/g, "\n");
const isText = (f) => /\.(md|mjs|js|json|css|html|txt|py|yml|yaml)$/i.test(f);

function walk(dir) {
  const out = [];
  for (const e of fs.readdirSync(dir, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name))) {
    const p = path.join(dir, e.name);
    if (cfg.excludeAlways.some((x) => e.name === x || e.name.startsWith(x))) continue;
    if (e.isDirectory()) out.push(...walk(p));
    else out.push(p);
  }
  return out;
}

function markerPass(text, strip, file) {
  const lines = text.split("\n");
  const out = [];
  let inFull = false, balance = 0;
  for (const line of lines) {
    if (line.includes("FULL-ONLY-START")) { inFull = true; balance++; continue; }
    if (line.includes("FULL-ONLY-END")) { inFull = false; balance--; continue; }
    const lite = line.match(/<!--\s*LITE-ONLY:\s*(.*?)\s*-->/);
    if (lite) { if (strip) out.push(lite[1]); continue; } // expand in LITE, drop in FULL
    if (inFull && strip) continue; // drop FULL-ONLY region content in LITE
    out.push(line);
  }
  if (balance !== 0) fail(`unbalanced FULL-ONLY markers in ${file}`);
  return out.join("\n");
}

// ---------- assemble each edition ----------
fs.mkdirSync(outRoot, { recursive: true });
const editions = Object.entries(cfg.editions);
for (const [name, ed] of editions) {
  const dst = path.join(outRoot, name);
  fs.rmSync(dst, { recursive: true, force: true });
  const dev = cfg.devCopy;

  // 1. copy: per-edition skills + root CLAUDE.md + shared scripts/seeds/profiles + skills/llms.txt
  const copyRel = (sourceRel, destRel = sourceRel, options = {}) => {
    const src = path.join(dev, sourceRel);
    if (!fs.existsSync(src)) return;
    const stat = fs.statSync(src);
    if (stat.isDirectory()) {
      for (const f of walk(src)) {
        const within = path.relative(src, f).replace(/\\/g, "/");
        if (options.skipSkillMd && within === "SKILL.md") continue;
        if (options.include && !options.include.includes(within)) continue;
        const to = path.join(dst, destRel, within);
        fs.mkdirSync(path.dirname(to), { recursive: true });
        if (isText(f)) fs.writeFileSync(to, lf(fs.readFileSync(f, "utf8")));
        else fs.copyFileSync(f, to);
      }
    } else {
      const to = path.join(dst, destRel);
      fs.mkdirSync(path.dirname(to), { recursive: true });
      if (isText(src)) fs.writeFileSync(to, lf(fs.readFileSync(src, "utf8")));
      else fs.copyFileSync(src, to);
    }
  };
  copyRel("CLAUDE.md");
  copyRel("scripts");
  copyRel("seeds");
  copyRel("profiles");
  copyRel("family.json");
  for (const s of ed.skills) {
    const spec = cfg.skillSources[s];
    if (spec) {
      const from = typeof spec === "string" ? spec : spec.from;
      const include = typeof spec === "object" ? spec.include : null;
      copyRel(path.join("skills", from), path.join("skills", s), {
        skipSkillMd: true,
        include,
      });
    }
    copyRel(path.join("skills", s));
  }
  copyRel(path.join("skills", "llms.txt"));

  // 1b. package-time provenance scrub of the engine mirror's docstrings: the LOCAL mirror
  // stays byte-verbatim with its upstream; the PUBLISHED copy neutralizes the upstream
  // project's internal codename (comments/prose only — the engine has no such identifiers).
  const engDir = path.join(dst, "skills", "pixelhelm-evidence-brief", "storm", "storm_engine");
  if (fs.existsSync(engDir)) {
    for (const f of walk(engDir).filter((f) => f.endsWith(".py"))) {
      const t = fs.readFileSync(f, "utf8");
      if (!/cohortwatch/i.test(t)) continue;
      fs.writeFileSync(f, t
        .replace(/CohortWatch's/g, "the upstream project's")
        .replace(/CohortWatch:/g, "upstream:")
        .replace(/cohortwatch/gi, "upstream-project"));
    }
  }

  // 2. marker pass on copied text resources
  for (const f of walk(dst).filter((f) => isText(f))) {
    const t = fs.readFileSync(f, "utf8");
    if (t.includes("FULL-ONLY") || t.includes("LITE-ONLY")) fs.writeFileSync(f, markerPass(t, ed.stripFullOnly, path.relative(dst, f)));
  }

  // 3. literal replacements (LITE) — a missing find-string means the dev copy drifted
  for (const r of ed.literalReplacements || []) {
    const f = path.join(dst, r.file);
    if (!fs.existsSync(f)) fail(`literalReplacements target missing: ${r.file}`);
    const t = fs.readFileSync(f, "utf8");
    if (!t.includes(r.find)) fail(`literal find-string not found in ${r.file}: "${r.find}"`);
    fs.writeFileSync(f, t.split(r.find).join(r.replace));
  }

  // 4. dropFiles (LITE)
  for (const rel of ed.dropFiles || []) {
    const f = path.join(dst, rel);
    if (fs.existsSync(f)) fs.rmSync(f);
  }

  // 5. overlays: shared, then per-edition
  const overlay = (dirName) => {
    const src = path.join(here, "overlays", dirName);
    if (!fs.existsSync(src)) return;
    for (const f of walk(src)) {
      const to = path.join(dst, path.relative(src, f));
      fs.mkdirSync(path.dirname(to), { recursive: true });
      fs.writeFileSync(to, lf(fs.readFileSync(f, "utf8")));
    }
  };
  overlay("shared");
  if (ed.stripFullOnly) overlay("lite");

  // Canonicalize copied skill resources and routing prose. Root scripts are
  // excluded because they implement explicit read-only legacy fallbacks.
  for (const f of walk(dst)) {
    if (!isText(f)) continue;
    const rel = path.relative(dst, f).replace(/\\/g, "/");
    if (!(rel.startsWith("skills/") || rel.startsWith("seeds/") || rel.startsWith("profiles/") || rel === "CLAUDE.md")) continue;
    let t = fs.readFileSync(f, "utf8");
    for (const [find, replace] of cfg.canonicalTextReplacements || []) {
      t = t.split(find).join(replace);
    }
    fs.writeFileSync(f, t);
  }

  // 6. regenerate skills.json from the dev registry, filtered to the edition
  const devReg = JSON.parse(fs.readFileSync(path.join(cfg.devCopy, "skills.json"), "utf8"));
  const keep = new Set(ed.skills);
  const reg = {
    _note: `Canonical atomic PixelHelm registry. ${ed.skills.length} skills (${name}).`,
    skills: devReg.skills.filter((s) => keep.has(s.id)).map((s) => ({
      ...s,
      invokes: (s.invokes || []).filter((i) => keep.has(i)),
    })),
  };
  fs.writeFileSync(path.join(dst, "skills.json"), JSON.stringify(reg, null, 2) + "\n");

  // 7. regenerate skills/llms.txt: keep only retained-skill bullets
  const llmsPath = path.join(dst, "skills", "llms.txt");
  if (fs.existsSync(llmsPath)) {
    const kept = fs.readFileSync(llmsPath, "utf8").split("\n").filter((line) => {
      const m = line.match(/^- \*\*([a-z-]+)\*\*/);
      return !m || keep.has(m[1]);
    });
    fs.writeFileSync(llmsPath, kept.join("\n"));
  }

  // 8. plugin.json
  fs.mkdirSync(path.join(dst, ".claude-plugin"), { recursive: true });
  fs.writeFileSync(path.join(dst, ".claude-plugin", "plugin.json"), JSON.stringify({
    name,
    description: ed.description,
    version: cfg.version,
    author: { name: cfg.marketplace.owner },
    ...(typeof cfg.marketplace.repoUrl === "string" && cfg.marketplace.repoUrl.trim()
      ? { homepage: cfg.marketplace.repoUrl }
      : {}),
    license: "MIT",
    keywords: ["pixelhelm", "frontend-design", "ui", "ux", "honesty", "register", "accessibility", "a11y", "design-tokens", "evaluation"],
  }, null, 2) + "\n");
}

// 9. repo-root marketplace.json
const mkt = {
  name: cfg.marketplace.name,
  owner: { name: cfg.marketplace.owner },
  description: cfg.marketplace.description,
  metadata: { pluginRoot: "./plugins" },
  plugins: editions.map(([name, ed]) => ({
    name,
    source: `./plugins/${name}`,
    displayName: ed.displayName,
    description: ed.description.split(". ")[0].replace(/\.+$/, "") + ".",
    version: cfg.version,
    license: "MIT",
    category: "design",
  })),
};
const mktDir = CHECK ? path.join(outRoot, ".claude-plugin") : path.join(repo, ".claude-plugin");
fs.mkdirSync(mktDir, { recursive: true });
fs.writeFileSync(path.join(mktDir, "marketplace.json"), JSON.stringify(mkt, null, 2) + "\n");

// ---------- lint gate ----------
// frontend-design-skill: only the PATH-ESCAPE form is banned — the existence-checked
// legacy dataDir fallback ("~/.claude/design/frontend-design-skill/ if it exists") is a
// legitimate migration shim and harmless for users who lack the dir. live-brief-* FILES
// are blocked by excludeAlways; the doc mention of the output filename is legitimate.
// The two backslash variants are constructed from parts so this file's own source
// never contains the banned byte sequences (the repo hygiene test scans this file).
const BANNED_ALL = [/C:\/Users/i, new RegExp("C:" + "\\\\" + "Users", "i"), new RegExp("C:" + "\\\\\\\\" + "Users", "i"), /\.\.\/\.\.\/design/, /design\/frontend-design-skill\/(storm|profiles|perspective-discovery|baselines|briefs|dogfood)/];
const BANNED_LITE = [/pixelhelm-evidence-brief/, /stormBrief/, /\bSTORM\b/, /deep-pass/, /deep pass/i, /dataviz-canon/, /\bC1\b[^0-9]/, /\bP56\b/, /\bP45\b/, /\bP25\b/];
// LITE allowlist: craft-skill soft mentions in retained reference files (documented in the README)
const LITE_ALLOW = [
  { file: /skills\/(pixelhelm-tokens|pixelhelm-generate|pixelhelm-repair|pixelhelm-record-lesson|pixelhelm|pixelhelm-ground|pixelhelm-evaluate|pixelhelm-judge|pixelhelm-render)\//, pattern: /pixelhelm-(color|typography|motion|dataviz|content|email|video-placement|reference|directions)/ },
];
const REQUIRED_LITE = [
  { file: "skills/pixelhelm-judge/references/lenses.md", pattern: /MULTI-JUROR MEDIAN/ },
  { file: "skills/pixelhelm-judge/references/lenses.md", pattern: /Compliance-honesty/ },
  { file: "skills/pixelhelm-judge/SKILL.md", pattern: /ABSTAIN-BLOCK/ },
];

let lintFails = 0;
for (const [name, ed] of editions) {
  const dst = path.join(outRoot, name);
  for (const f of walk(dst)) {
    if (!isText(f)) continue;
    if (/skills[\\/]pixelhelm-evidence-brief[\\/]storm[\\/]/.test(f)) continue; // engine mirror: full edition only, self-contained
    const rel = path.relative(dst, f).replace(/\\/g, "/");
    const t = fs.readFileSync(f, "utf8");
    for (const b of BANNED_ALL) if (b.test(t)) { console.error(`LINT [${name}] ${rel}: banned pattern ${b}`); lintFails++; }
    if (ed.stripFullOnly && rel.startsWith("skills/")) {
      for (const b of BANNED_LITE) {
        if (!b.test(t)) continue;
        const allowed = LITE_ALLOW.some((a) => a.file.test(rel) && a.pattern.test(t) && !/pixelhelm-evidence-brief|stormBrief|deep-pass|dataviz-canon/.test(t.match(b)?.[0] || ""));
        // precise re-check: find each banned match line for reporting
        const lines = t.split("\n").filter((l) => b.test(l));
        const reallyBad = lines.filter((l) => !LITE_ALLOW.some((a) => a.file.test(rel) && a.pattern.test(l) && !/(pixelhelm-evidence-brief|stormBrief|deep.?pass|dataviz-canon|\bP56\b|\bP45\b|\bP25\b|\bSTORM\b)/.test(l)));
        if (reallyBad.length) { console.error(`LINT [${name}] ${rel}: LITE banned ${b} ->\n    ${reallyBad[0].trim().slice(0, 140)}`); lintFails++; }
      }
    }
  }
  if (ed.stripFullOnly) {
    for (const r of REQUIRED_LITE) {
      const f = path.join(dst, r.file);
      if (!fs.existsSync(f) || !r.pattern.test(fs.readFileSync(f, "utf8"))) {
        console.error(`LINT [${name}] REQUIRED text missing: ${r.file} ~ ${r.pattern}`); lintFails++;
      }
    }
    // every skill mentioned in the LITE routing overlay must exist in the edition
    const routing = path.join(dst, "skills", "pixelhelm", "references", "routing.md");
    if (fs.existsSync(routing)) {
      const mentioned = [...fs.readFileSync(routing, "utf8").matchAll(/`(pixelhelm-[a-z-]+)`/g)].map((m) => m[1]);
      for (const s of new Set(mentioned)) {
        if (!ed.skills.includes(s)) { console.error(`LINT [${name}] routing.md names non-shipped skill: ${s}`); lintFails++; }
      }
    }
  }
}
if (lintFails) fail(`${lintFails} lint finding(s)`);

if (!CHECK) {
  for (const name of cfg.retiredGeneratedEditions || []) {
    fs.rmSync(path.join(repo, "plugins", name), { recursive: true, force: true });
  }
}

// ---------- --check: diff against committed ----------
if (CHECK) {
  const diff = [];
  const committed = path.join(repo, "plugins");
  const compare = (a, b, base) => {
    const fa = fs.existsSync(a) ? walk(a).map((f) => path.relative(a, f)) : [];
    const fb = fs.existsSync(b) ? walk(b).map((f) => path.relative(b, f)) : [];
    for (const f of new Set([...fa, ...fb])) {
      const pa = path.join(a, f), pb = path.join(b, f);
      if (!fs.existsSync(pa) || !fs.existsSync(pb)) { diff.push(`${base}/${f} (presence)`); continue; }
      const ta = fs.readFileSync(pa), tb = fs.readFileSync(pb);
      if (!ta.equals(tb)) diff.push(`${base}/${f}`);
    }
  };
  for (const [name] of editions) compare(path.join(outRoot, name), path.join(committed, name), name);
  for (const name of cfg.retiredGeneratedEditions || []) {
    if (fs.existsSync(path.join(committed, name))) diff.push(`${name} (retired edition still present)`);
  }
  compare(path.join(outRoot, ".claude-plugin"), path.join(repo, ".claude-plugin"), ".claude-plugin");
  cleanup();
  if (diff.length) { console.error(`DRIFT: committed plugins/ differ from a fresh build:\n  ${diff.slice(0, 20).join("\n  ")}`); process.exit(1); }
  console.log("check: committed editions match a fresh build");
  process.exit(0);
}

console.log(`built ${editions.map(([n]) => n).join(" + ")} -> ${outRoot}`);
