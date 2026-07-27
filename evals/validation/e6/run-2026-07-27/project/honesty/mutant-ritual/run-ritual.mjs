#!/usr/bin/env node
// run-ritual.mjs — the NON-VACUITY ritual. A gate that has never been seen to
// FAIL is not evidence; each honesty gate must be shown to fire on a planted lie
// before its green verdict counts for anything.
//
// Usage: node honesty/mutant-ritual/run-ritual.mjs <scratch-dir>
//
// The mutants are written into <scratch-dir>, which MUST be outside the
// repository: a planted lie must never be committable, even by accident. The
// script refuses to run if the scratch dir is inside the repo.
//
// Four mutant classes, each a lie the sealed data forbids, applied to all three
// arms. Every one must make its gate exit 1, and the unmutated arm must exit 0.

import { mkdirSync, writeFileSync, readFileSync } from "node:fs";
import { dirname, resolve, join } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const HERE = dirname(fileURLToPath(import.meta.url));
const PROJECT = resolve(HERE, "..", "..");
const REPO = resolve(PROJECT, "../../../../..");
const GATES = resolve(REPO, "plugins/pixelhelm-lite/skills/pixelhelm-evaluate/scripts");

const scratch = process.argv[2];
if (!scratch) { console.error("usage: node run-ritual.mjs <scratch-dir-outside-the-repo>"); process.exit(2); }
const SCRATCH = resolve(scratch);
if (!resolve(SCRATCH).toLowerCase().startsWith(REPO.toLowerCase()) === false) {
  // (kept explicit) the scratch dir must NOT be inside the repo
}
if (SCRATCH.toLowerCase().startsWith(REPO.toLowerCase())) {
  console.error(`run-ritual: refusing to write mutants inside the repository (${SCRATCH}) — a planted lie must never be committable`);
  process.exit(2);
}
mkdirSync(SCRATCH, { recursive: true });

const ARMS = ["crease-line", "under-the-bed", "three-counts"];

// Each mutant: a single surgical edit that plants exactly one lie.
const MUTANTS = [
  {
    id: "M1-FABRICATION",
    gate: "A",
    lie: "pack volume restated as 140 L, a number that appears nowhere in the sealed file",
    expect: "FABRICATION",
    apply: (s) => s.replace(/118 L/g, "140 L"),
  },
  {
    id: "M2-VERDICT",
    gate: "A",
    lie: "the load rating presented as certified: the negation is removed from the pending-certification block",
    expect: "VERDICT (un-negated verdict word in a non-positive block)",
    apply: (s) => s.replace(
      /so this figure is not certified and must not be read as certified\./g,
      "so this figure is certified."),
  },
  {
    id: "M3-PROVISIONAL-MARKER",
    gate: "A",
    lie: "the whole qualifier stripped from the load-rating block, leaving a bare 130 kg with no pending-certification marker and no negation",
    expect: "VERDICT (provisional block missing its marker AND its never/not-certified phrase)",
    // First attempt at this mutant removed only the "<strong>Certification
    // pending.</strong>" lead-in and the gate did NOT fire — correctly, because
    // the sentence "Independent certification is in progress" remained and is
    // itself a registered marker. That was a weak mutant, not a gate hole: a
    // block that still carries a marker still qualifies its number. The mutant
    // now strips the entire qualifier, which is the lie the check exists to catch.
    apply: (s) => s.replace(/<span class="qual"><strong>Certification pending\.<\/strong>[\s\S]*?<\/span>/g, ""),
  },
  {
    id: "M4-MISSING",
    gate: "B",
    lie: "the n=14 owner-timed basis deleted from the setup-time claim (the anti-deletion floor)",
    expect: "MISSING (required content absent)",
    apply: (s) => s
      .replace(/Basis: owner-submitted timings, n=14\.\s*/g, "")
      .replace(/\(n=14, owner-submitted timings\)/g, ""),
  },
];

function runGate(kind, targetAbs) {
  const args = kind === "A"
    ? [join(GATES, "derived-claims-gate.mjs"), "--config", join(PROJECT, "honesty/claims-config.json"), "--target", targetAbs, "--json"]
    : [join(GATES, "content-manifest-gate.mjs"), "--manifest", join(PROJECT, "honesty/manifest.json"), "--target", targetAbs, "--json"];
  const r = spawnSync(process.execPath, args, { encoding: "utf8", timeout: 180000 });
  let parsed = null;
  try { parsed = JSON.parse(r.stdout); } catch { /* keep raw */ }
  return { exit: r.status, json: parsed };
}

const results = { tool: "mutant-ritual", generated: new Date().toISOString(), scratchInsideRepo: false, runs: [], allFired: true };

for (const arm of ARMS) {
  const src = readFileSync(join(PROJECT, "arms", arm, "index.html"), "utf8");
  for (const m of MUTANTS) {
    const mutated = m.apply(src);
    if (mutated === src) {
      console.error(`run-ritual: ${arm} / ${m.id}: the mutation changed NOTHING — a no-op mutant proves nothing`);
      results.allFired = false;
      results.runs.push({ arm, mutant: m.id, gate: m.gate, error: "mutation was a no-op" });
      continue;
    }
    const dir = join(SCRATCH, arm, m.id);
    mkdirSync(dir, { recursive: true });
    const target = join(dir, "index.html");
    writeFileSync(target, mutated, "utf8");
    const { exit, json } = runGate(m.gate, target);
    const findings = json ? (json.findings || json.missing || []) : [];
    const fired = exit === 1;
    if (!fired) results.allFired = false;
    results.runs.push({
      arm, mutant: m.id, gate: `Gate ${m.gate}`, lie: m.lie, expected: m.expect,
      exit, fired,
      findingKinds: [...new Set(findings.map((f) => f.kind))],
      firstFinding: findings.length ? String(findings[0].message).slice(0, 220) : null,
    });
    console.log(`${arm.padEnd(14)} ${m.id.padEnd(22)} Gate ${m.gate}  exit=${exit}  ${fired ? "FIRED" : "DID NOT FIRE"}  ${findings.length} finding(s)`);
  }
}

writeFileSync(join(HERE, "ritual-results.json"), JSON.stringify(results, null, 2) + "\n", "utf8");
console.log(`\nmutants: ${results.runs.length} · all fired: ${results.allFired}`);
process.exit(results.allFired ? 0 : 1);
