#!/usr/bin/env node
// Read layered PixelHelm lessons. Legacy paths and tags are read-only fallbacks.
import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import { fileURLToPath } from "node:url";

const aliases = {
  pixelhelm: ["design"],
  "pixelhelm-ground": ["design-ground"],
  "pixelhelm-evidence-brief": ["design-storm"],
  "pixelhelm-reference": ["design-reference"],
  "pixelhelm-directions": ["design-direction"],
  "pixelhelm-generate": ["design-generate"],
  "pixelhelm-render": ["design-render"],
  "pixelhelm-evaluate": ["design-evaluate"],
  "pixelhelm-judge": ["design-council"],
  "pixelhelm-repair": ["design-fix"],
  "pixelhelm-tokens": ["design-tokens"],
  "pixelhelm-color": ["design-color"],
  "pixelhelm-typography": ["design-typography"],
  "pixelhelm-motion": ["design-motion"],
  "pixelhelm-dataviz": ["design-dataviz"],
  "pixelhelm-content": ["design-content"],
  "pixelhelm-email": ["design-email"],
  "pixelhelm-video-placement": ["design-video"],
  "pixelhelm-record-lesson": ["design-learn"],
  "pixelhelm-refresh-guidance": ["design-learn"],
  "pixelhelm-curate-fingerprints": ["design-learn"],
};

const same = (a, b) => !fs.existsSync(a) || !fs.existsSync(b) || fs.readFileSync(a).equals(fs.readFileSync(b));
const choose = (canonical, legacy) => {
  if (!same(canonical, legacy)) throw new Error(`state conflict: ${canonical} differs from ${legacy}`);
  return fs.existsSync(canonical) ? canonical : legacy;
};

function parse(file) {
  if (!file || !fs.existsSync(file)) return [];
  const text = fs.readFileSync(file, "utf8");
  const match = text.match(/^## Current (entries|method)\s*$/m);
  let body = text;
  if (match) {
    const rest = text.slice(match.index + match[0].length);
    const end = rest.search(/^## |^<details>/m);
    body = end < 0 ? rest : rest.slice(0, end);
  }
  const entries = [];
  let current = null;
  for (const line of body.split(/\r?\n/)) {
    const id = line.match(/^- id:\s*([A-Za-z0-9-]+)\s*\|/);
    if (id) { if (current) entries.push(current); current = { id: id[1], lines: [line] }; }
    else if (current && /^\S/.test(line) && line.trim()) { entries.push(current); current = null; }
    else if (current) current.lines.push(line);
  }
  if (current) entries.push(current);
  return entries.map((entry) => {
    const text = entry.lines.join("\n").replace(/\s+$/, "");
    const field = (name) => text.match(new RegExp(`(?:^|\\|)\\s*${name}:\\s*([^|\\n]+)`, "m"))?.[1].trim() || null;
    return { ...entry, text, status: field("status"), skills: field("skills"), expires: field("expires"), supersedes: field("supersedes") };
  });
}

try {
  const skill = (process.argv[2] || "").trim();
  if (!skill) process.exit(0);
  const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
  const home = os.homedir();
  const project = process.env.CLAUDE_PROJECT_DIR || process.cwd();
  const canonicalData = process.env.CLAUDE_PLUGIN_DATA || path.join(home, ".claude", "pixelhelm");
  const legacyDataDirs = [path.join(home, ".claude", "design", "frontend-design-skill"), path.join(home, ".claude", "design-pixelhelm")];
  const legacyData = legacyDataDirs.find((dir) => fs.existsSync(path.join(dir, "LESSONS.md")));
  const layers = [
    path.join(root, "seeds", "LESSONS-seed.md"),
    choose(path.join(home, ".claude", "pixelhelm", "LESSONS.md"), path.join(home, ".claude", "design", "LESSONS.md")),
    choose(path.join(canonicalData, "LESSONS.md"), legacyData ? path.join(legacyData, "LESSONS.md") : ""),
    choose(path.join(project, ".pixelhelm", "LESSONS.md"), path.join(project, ".design", "LESSONS.md")),
  ];
  const byId = new Map();
  for (const file of layers) for (const entry of parse(file)) byId.set(entry.id, entry);
  const superseded = new Set();
  for (const entry of byId.values()) if (entry.supersedes && entry.supersedes !== "none") for (const id of entry.supersedes.split(",")) superseded.add(id.trim());
  const tagsWanted = new Set([skill, ...(aliases[skill] || []), "all"]);
  const untagged = skill === "pixelhelm" || skill === "pixelhelm-ground";
  const today = new Date().toISOString().slice(0, 10);
  const out = [];
  for (const entry of byId.values()) {
    if (entry.status === "superseded" || superseded.has(entry.id)) continue;
    const tags = entry.skills ? entry.skills.split(",").map((tag) => tag.trim()) : null;
    if (!(tags ? tags.some((tag) => tagsWanted.has(tag)) : untagged)) continue;
    out.push(entry.expires && entry.expires < today ? entry.text.replace(/^- id:/, "- [EXPIRED - re-verify before relying] id:") : entry.text);
  }
  if (out.length) process.stdout.write(`Lessons for ${skill}:\n\n${out.join("\n\n")}\n`);
  process.exit(0);
} catch (error) {
  process.stderr.write(`PIXELHELM_LESSON_STATE_CONFLICT: ${error.message}\n`);
  process.exit(2);
}
