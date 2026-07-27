#!/usr/bin/env node
// baseline.mjs — capture + comparison for the regression memory: pixelhelm/baseline@1
//
// Usage:
//   node baseline.mjs template [--out <file>]
//   node baseline.mjs validate <baseline.json> [...] [--json]
//   node baseline.mjs capture --project <dir> --key <merge-base> --screen <id> [inputs] [--rebaseline] [--json]
//   node baseline.mjs compare --project <dir> --key <merge-base> --screen <id> [inputs] [--json]
//
//   inputs (repeatable, shared by capture and compare):
//     --gate <gate-id>=<pass|fail|n/a|not-run>
//     --gate-artifact <path.json>            (reads {validator, pass, applicable})
//     --measure <id>=<value>:<lower|higher>[:<tolerance>]
//     --finding "<rule>|<severity>|<location>"
//     --screenshot <path.png>
//     --date <YYYY-MM-DD>                    (capture only; defaults to today)
//
// WHAT THIS IS FOR. Without regression memory the evaluator re-litigates everything
// every run and a redesign can only ASSERT that it did not make anything worse. This
// makes evaluation compound: capture the incumbent's gate results and key
// measurements at baseline time, then compare a candidate against them.
//
// THE RULE THIS ENFORCES (gates-and-loop.md section 4): a Layer-1 PASS that regresses
// against the baseline is a BLOCKER. A proven backslide is the worst class, and it
// outranks a clean machine pass on the candidate's own terms.
//
// THREE HONESTY RULES THAT SHAPE THE CODE:
//   1. Silence is never a pass. A gate present in the baseline but absent from the
//      candidate's inputs is `not-compared` and is listed by name — it is neither a
//      pass nor a regression, and it costs the run its no-regression proof.
//   2. Un-measuring is not passing. A gate that passed at baseline and is declared
//      `not-run` now is `lost-evidence` and is treated as a BLOCKER: the candidate
//      cannot prove it did not regress there. It is reported under its own name, not
//      as "Regressed" — an unprovable regression is not a proven one.
//   3. The baseline is never silently updated. `capture` refuses to overwrite an
//      existing screen or re-key an existing baseline; `--rebaseline` writes a
//      SEPARATE proposal file and prints the diff for a human to accept. Absorbing a
//      regression into the memory is the one thing this file must never do.
//
// NOT WIRED, said plainly: there is no antialias-tolerant pixel diff. `--screenshot`
// records the file's sha256 and comparison reports identical/changed only. A changed
// screenshot is NOT a finding and never blocks — it is a pointer for a human.
//
// Store: <project>/.pixelhelm/baseline.json (canonical), proposals to
// <project>/.pixelhelm/baseline.proposed.json.
//
// Dependency-free, network-free. Exit 0 clean · 1 regression found or write refused ·
// 2 runner error. Protocol: pixelhelm-evaluate's references/baseline.md.

import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { createHash } from "node:crypto";
import { resolve, join, relative, dirname } from "node:path";

const SCHEMA = "pixelhelm/baseline@1";
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const SHA256_RE = /^[0-9a-f]{64}$/;
const GATE_STATES = ["pass", "fail", "n/a", "not-run"];
const CLEAN_STATES = ["pass", "n/a"];
const DIRECTIONS = ["lower", "higher"];
const SEVERITIES = ["blocker", "high", "medium", "nit"];

const isStr = (v) => typeof v === "string";
const nonEmpty = (v) => isStr(v) && v.trim().length > 0;
const isObj = (v) => v !== null && typeof v === "object" && !Array.isArray(v);
const isNum = (v) => typeof v === "number" && Number.isFinite(v);
const sha256 = (buf) => createHash("sha256").update(buf).digest("hex");
const findingHash = (rule, location) => sha256(`${rule}\u0000${location}`).slice(0, 16);

// ---------- validator ----------
function validateBaseline(b) {
  const errors = [];
  if (!isObj(b)) return ["baseline must be a JSON object"];
  if (b.schema !== SCHEMA) errors.push(`schema must be "${SCHEMA}" (got ${JSON.stringify(b.schema)})`);
  if (!nonEmpty(b.key)) errors.push("key must be the merge-base identity this baseline is keyed to (mirroring git diff --merge-base)");
  if (!nonEmpty(b.captured) || !DATE_RE.test(b.captured)) errors.push("captured must be YYYY-MM-DD");
  if (!isObj(b.screens)) { errors.push("screens must be an object keyed by screen id"); return errors; }
  for (const [id, s] of Object.entries(b.screens)) {
    if (!isObj(s)) { errors.push(`screens.${id} must be an object`); continue; }
    if (!isObj(s.layer1)) errors.push(`screens.${id}.layer1 must be an object of gate id -> ${GATE_STATES.join(" | ")}`);
    else for (const [g, state] of Object.entries(s.layer1)) {
      if (!GATE_STATES.includes(state)) errors.push(`screens.${id}.layer1.${g} must be one of ${GATE_STATES.join(" | ")} ("not-run" is a real state — silence must never read as a pass)`);
    }
    if (!isObj(s.measurements)) errors.push(`screens.${id}.measurements must be an object of metric id -> { value, better, tolerance }`);
    else for (const [m, entry] of Object.entries(s.measurements)) {
      if (!isObj(entry)) { errors.push(`screens.${id}.measurements.${m} must be { value, better, tolerance }`); continue; }
      if (!isNum(entry.value)) errors.push(`screens.${id}.measurements.${m}.value must be a number`);
      if (!DIRECTIONS.includes(entry.better)) errors.push(`screens.${id}.measurements.${m}.better must be ${DIRECTIONS.join(" | ")} — which direction is BETTER, so a comparison can never guess it`);
      if (!isNum(entry.tolerance) || entry.tolerance < 0) errors.push(`screens.${id}.measurements.${m}.tolerance must be a number >= 0`);
    }
    if (!Array.isArray(s.findings)) errors.push(`screens.${id}.findings must be an array`);
    else for (const [i, f] of s.findings.entries()) {
      if (!isObj(f) || !nonEmpty(f.rule) || !nonEmpty(f.location)) { errors.push(`screens.${id}.findings[${i}] must be { rule, severity, location, hash }`); continue; }
      if (!SEVERITIES.includes(f.severity)) errors.push(`screens.${id}.findings[${i}].severity must be one of ${SEVERITIES.join(" | ")}`);
      const expected = findingHash(f.rule, f.location);
      if (f.hash !== expected) errors.push(`screens.${id}.findings[${i}].hash must be sha256(rule + NUL + location) truncated to 16 hex chars (${expected}); a finding's identity is rule + location, so the same issue in the same place matches across runs`);
    }
    if (s.screenshot !== null && s.screenshot !== undefined) {
      if (!isObj(s.screenshot) || !nonEmpty(s.screenshot.path) || !SHA256_RE.test(s.screenshot.sha256 || "")) {
        errors.push(`screens.${id}.screenshot must be null or { path, sha256 } (64 lowercase hex chars)`);
      }
    }
  }
  return errors;
}

const TEMPLATE = {
  schema: SCHEMA,
  key: "",
  captured: "",
  screens: {
    "<screen-id>": {
      layer1: { "<gate-id>": "pass" },
      measurements: { "<metric-id>": { value: 0, better: "lower", tolerance: 0 } },
      findings: [],
      screenshot: null,
    },
  },
};

// ---------- CLI plumbing ----------
const argv = process.argv.slice(2);
const cmd = argv[0];
const asJson = argv.includes("--json");
const die = (msg) => { console.error(`baseline: ${msg}`); process.exit(2); };
const usage = () => {
  console.error(`usage:
  node baseline.mjs template [--out <file>]
  node baseline.mjs validate <baseline.json> [...] [--json]
  node baseline.mjs capture --project <dir> --key <merge-base> --screen <id> [inputs] [--rebaseline] [--json]
  node baseline.mjs compare --project <dir> --key <merge-base> --screen <id> [inputs] [--json]

inputs (repeatable): --gate <id>=<pass|fail|n/a|not-run> · --gate-artifact <path.json>
                     --measure <id>=<value>:<lower|higher>[:<tolerance>]
                     --finding "<rule>|<severity>|<location>" · --screenshot <path>
                     --date <YYYY-MM-DD> (capture only)`);
  process.exit(2);
};
const flagValue = (name) => {
  const i = argv.indexOf(`--${name}`);
  return i >= 0 && argv[i + 1] !== undefined && !argv[i + 1].startsWith("--") ? argv[i + 1] : null;
};
const flagValues = (name) => {
  const out = [];
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === `--${name}` && argv[i + 1] !== undefined && !argv[i + 1].startsWith("--")) out.push(argv[i + 1]);
  }
  return out;
};

// ---------- building the candidate/incumbent snapshot from the inputs ----------
function readGateArtifact(path) {
  let doc;
  try { doc = JSON.parse(readFileSync(path, "utf8")); }
  catch (e) { die(`cannot read/parse gate artifact ${path}: ${e.message}`); }
  if (!isObj(doc) || !nonEmpty(doc.validator)) {
    die(`gate artifact ${path} has no "validator" field — pass an explicit --gate <id>=<state> instead of guessing`);
  }
  if (typeof doc.pass !== "boolean") die(`gate artifact ${path} has no boolean "pass" field — pass an explicit --gate <id>=<state> instead of guessing`);
  const state = doc.applicable === false ? "n/a" : (doc.pass ? "pass" : "fail");
  return [doc.validator, state];
}

function buildSnapshot() {
  const layer1 = {};
  for (const path of flagValues("gate-artifact")) {
    const [id, state] = readGateArtifact(path);
    layer1[id] = state;
  }
  for (const spec of flagValues("gate")) {
    const at = spec.lastIndexOf("=");
    if (at <= 0) die(`--gate expects <gate-id>=<${GATE_STATES.join("|")}>, got "${spec}"`);
    const id = spec.slice(0, at).trim();
    const state = spec.slice(at + 1).trim();
    if (!nonEmpty(id)) die(`--gate has an empty gate id: "${spec}"`);
    if (!GATE_STATES.includes(state)) die(`--gate state must be one of ${GATE_STATES.join(" | ")}, got "${state}"`);
    layer1[id] = state;
  }

  const measurements = {};
  for (const spec of flagValues("measure")) {
    const parts = spec.split(":");
    const head = parts[0] || "";
    const at = head.lastIndexOf("=");
    if (at <= 0 || parts.length < 2) die(`--measure expects <id>=<value>:<lower|higher>[:<tolerance>], got "${spec}"`);
    const id = head.slice(0, at).trim();
    const value = Number(head.slice(at + 1));
    const better = (parts[1] || "").trim();
    const tolerance = parts.length > 2 ? Number(parts[2]) : 0;
    if (!nonEmpty(id)) die(`--measure has an empty metric id: "${spec}"`);
    if (!isNum(value)) die(`--measure value must be a finite number, got "${spec}"`);
    if (!DIRECTIONS.includes(better)) die(`--measure direction must be ${DIRECTIONS.join(" | ")} (which way is BETTER), got "${spec}"`);
    if (!isNum(tolerance) || tolerance < 0) die(`--measure tolerance must be a number >= 0, got "${spec}"`);
    measurements[id] = { value, better, tolerance };
  }

  const findings = [];
  for (const spec of flagValues("finding")) {
    const parts = spec.split("|");
    if (parts.length < 3) die(`--finding expects "<rule>|<severity>|<location>", got "${spec}"`);
    const rule = parts[0].trim();
    const severity = parts[1].trim();
    const location = parts.slice(2).join("|").trim();
    if (!nonEmpty(rule) || !nonEmpty(location)) die(`--finding needs a non-empty rule and location: "${spec}"`);
    if (!SEVERITIES.includes(severity)) die(`--finding severity must be one of ${SEVERITIES.join(" | ")}, got "${severity}"`);
    findings.push({ rule, severity, location, hash: findingHash(rule, location) });
  }

  const shots = flagValues("screenshot");
  if (shots.length > 1) die("--screenshot may be given at most once per screen");
  let screenshot = null;
  if (shots.length === 1) {
    if (!existsSync(shots[0])) die(`--screenshot file not found: ${shots[0]}`);
    screenshot = { path: shots[0].replace(/\\/g, "/"), sha256: sha256(readFileSync(shots[0])) };
  }

  return { layer1, measurements, findings, screenshot };
}

const storePath = (projectDir) => join(projectDir, ".pixelhelm", "baseline.json");
const proposalPath = (projectDir) => join(projectDir, ".pixelhelm", "baseline.proposed.json");
const rel = (projectDir, p) => relative(projectDir, p).replace(/\\/g, "/");

function loadBaseline(projectDir) {
  const path = storePath(projectDir);
  if (!existsSync(path)) return null;
  let doc;
  try { doc = JSON.parse(readFileSync(path, "utf8")); }
  catch (e) { die(`cannot parse ${rel(projectDir, path)}: ${e.message}`); }
  const errors = validateBaseline(doc);
  if (errors.length) {
    console.error(`baseline: ${rel(projectDir, path)} does not validate; refusing to act on it.`);
    for (const e of errors) console.error(`  x ${e}`);
    process.exit(1);
  }
  return doc;
}

const sameScreen = (a, b) => JSON.stringify(a) === JSON.stringify(b);

function screenDiffLines(before, after) {
  const lines = [];
  const gates = new Set([...Object.keys(before.layer1 || {}), ...Object.keys(after.layer1 || {})]);
  for (const g of [...gates].sort()) {
    const x = before.layer1?.[g] ?? "(absent)";
    const y = after.layer1?.[g] ?? "(absent)";
    if (x !== y) lines.push(`  gate ${g}: ${x} -> ${y}`);
  }
  const metrics = new Set([...Object.keys(before.measurements || {}), ...Object.keys(after.measurements || {})]);
  for (const m of [...metrics].sort()) {
    const x = before.measurements?.[m];
    const y = after.measurements?.[m];
    if (JSON.stringify(x ?? null) !== JSON.stringify(y ?? null)) {
      lines.push(`  measure ${m}: ${x ? `${x.value} (${x.better}, tol ${x.tolerance})` : "(absent)"} -> ${y ? `${y.value} (${y.better}, tol ${y.tolerance})` : "(absent)"}`);
    }
  }
  const bh = new Map((before.findings || []).map((f) => [f.hash, f]));
  const ah = new Map((after.findings || []).map((f) => [f.hash, f]));
  for (const [h, f] of bh) if (!ah.has(h)) lines.push(`  finding gone: ${f.rule} @ ${f.location}`);
  for (const [h, f] of ah) if (!bh.has(h)) lines.push(`  finding new:  [${f.severity}] ${f.rule} @ ${f.location}`);
  const bs = before.screenshot?.sha256 ?? null;
  const as = after.screenshot?.sha256 ?? null;
  if (bs !== as) lines.push(`  screenshot: ${bs ? bs.slice(0, 12) : "(none)"} -> ${as ? as.slice(0, 12) : "(none)"}`);
  return lines;
}

// ---------- commands ----------
if (cmd === "template") {
  const body = JSON.stringify(TEMPLATE, null, 2) + "\n";
  const out = flagValue("out");
  if (out) { writeFileSync(out, body); console.log(`baseline: template ${SCHEMA} -> ${out}`); }
  else process.stdout.write(body);
  process.exit(0);
}

if (cmd === "validate") {
  const files = argv.slice(1).filter((a) => !a.startsWith("--"));
  if (!files.length) usage();
  const results = [];
  let anyInvalid = false;
  for (const f of files) {
    let doc;
    try { doc = JSON.parse(readFileSync(f, "utf8")); }
    catch (e) { die(`cannot read/parse ${f}: ${e.message}`); }
    const errors = validateBaseline(doc);
    if (errors.length) anyInvalid = true;
    results.push({ file: f, valid: errors.length === 0, errors });
  }
  if (asJson) console.log(JSON.stringify({ validator: "baseline", results }, null, 2));
  else for (const r of results) {
    console.log(`${r.valid ? "VALID  " : "INVALID"} ${r.file}`);
    for (const e of r.errors) console.log(`         x ${e}`);
  }
  process.exit(anyInvalid ? 1 : 0);
}

if (cmd === "capture" || cmd === "compare") {
  const projectArg = flagValue("project");
  const key = flagValue("key");
  const screen = flagValue("screen");
  if (!projectArg || !key || !screen) usage();
  const projectDir = resolve(projectArg);
  const snapshot = buildSnapshot();
  const existing = loadBaseline(projectDir);

  // ---------------- capture ----------------
  if (cmd === "capture") {
    const rebaseline = argv.includes("--rebaseline");
    const captured = flagValue("date") || new Date().toISOString().slice(0, 10);
    if (!DATE_RE.test(captured)) die(`--date must be YYYY-MM-DD, got "${captured}"`);

    const emit = (payload, human, code = 0) => {
      if (asJson) console.log(JSON.stringify(payload, null, 2));
      else human();
      process.exit(code);
    };

    // first capture — writing memory that does not exist yet is not a mutation
    if (!existing) {
      const doc = { schema: SCHEMA, key, captured, screens: { [screen]: snapshot } };
      const errors = validateBaseline(doc);
      if (errors.length) {
        if (asJson) console.log(JSON.stringify({ written: null, valid: false, errors }, null, 2));
        else { console.error("baseline: REFUSED — the captured baseline does not validate; nothing was written."); for (const e of errors) console.error(`  x ${e}`); }
        process.exit(1);
      }
      mkdirSync(dirname(storePath(projectDir)), { recursive: true });
      writeFileSync(storePath(projectDir), JSON.stringify(doc, null, 2) + "\n");
      emit({ written: rel(projectDir, storePath(projectDir)), action: "created", key, screen, valid: true, errors: [] },
        () => console.log(`baseline: created ${rel(projectDir, storePath(projectDir))} (key ${key}, screen "${screen}")`));
    }

    const keyMatches = existing.key === key;
    const known = existing.screens[screen];
    const identical = keyMatches && known && sameScreen(known, snapshot);

    if (identical) {
      emit({ written: null, action: "unchanged", key, screen, valid: true, errors: [], proposed: null, unchanged: true },
        () => console.log(`baseline: screen "${screen}" already captured at key ${key}, byte-identical — nothing to write`));
    }

    // additive: a NEW screen under the SAME key adds memory, it does not overwrite any
    if (keyMatches && !known && !rebaseline) {
      const doc = { ...existing, screens: { ...existing.screens, [screen]: snapshot } };
      const errors = validateBaseline(doc);
      if (errors.length) {
        if (asJson) console.log(JSON.stringify({ written: null, valid: false, errors }, null, 2));
        else { console.error("baseline: REFUSED — the captured screen does not validate; nothing was written."); for (const e of errors) console.error(`  x ${e}`); }
        process.exit(1);
      }
      writeFileSync(storePath(projectDir), JSON.stringify(doc, null, 2) + "\n");
      emit({ written: rel(projectDir, storePath(projectDir)), action: "screen-added", key, screen, valid: true, errors: [] },
        () => console.log(`baseline: added screen "${screen}" to ${rel(projectDir, storePath(projectDir))} (key ${key})`));
    }

    // everything else CHANGES existing memory -> proposal only, never in place
    const doc = { schema: SCHEMA, key, captured, screens: { ...(keyMatches ? existing.screens : {}), [screen]: snapshot } };
    const errors = validateBaseline(doc);
    if (errors.length) {
      if (asJson) console.log(JSON.stringify({ written: null, proposed: null, valid: false, errors }, null, 2));
      else { console.error("baseline: REFUSED — the proposed baseline does not validate; nothing was written."); for (const e of errors) console.error(`  x ${e}`); }
      process.exit(1);
    }
    const reason = keyMatches
      ? `screen "${screen}" already exists at key ${key} with different content`
      : `baseline is keyed to ${existing.key}; you passed ${key} (re-keying drops every screen captured at the old branch point)`;
    const diff = keyMatches && known ? screenDiffLines(known, snapshot) : [];

    if (!rebaseline) {
      const payload = { written: null, proposed: null, action: "refused", reason, diff, valid: true, errors: [] };
      if (asJson) console.log(JSON.stringify(payload, null, 2));
      else {
        console.error(`baseline: REFUSED — ${reason}.`);
        for (const line of diff) console.error(line);
        console.error("  The evaluator never silently absorbs a change into the baseline. Re-run with --rebaseline");
        console.error("  to write a reviewable proposal a human accepts; an intended change is a human's call.");
      }
      process.exit(1);
    }

    writeFileSync(proposalPath(projectDir), JSON.stringify(doc, null, 2) + "\n");
    const payload = { written: null, proposed: rel(projectDir, proposalPath(projectDir)), action: "proposed", reason, diff, valid: true, errors: [] };
    if (asJson) console.log(JSON.stringify(payload, null, 2));
    else {
      console.log(`baseline: PROPOSED ${rel(projectDir, proposalPath(projectDir))} — ${reason}.`);
      for (const line of diff) console.log(line);
      console.log(`  ${rel(projectDir, storePath(projectDir))} is UNCHANGED. A human accepts this by replacing the`);
      console.log("  baseline with the proposal; nothing here does that for them.");
    }
    process.exit(0);
  }

  // ---------------- compare ----------------
  if (!existing) {
    const payload = {
      comparison: "baseline", key, screen, baselineFound: false, provenNoRegression: false,
      why: "no baseline exists for this project — nothing to compare against, so this run cannot prove it did not regress",
      regressed: [], lostEvidence: [], newFail: [], fixed: [], persistentFail: [], persistentPass: [],
      measurements: [], findings: { new: [], persistent: [], fixed: [] }, screenshot: "not-compared",
      notCompared: { gates: [], measurements: [] }, blockers: [],
    };
    if (asJson) console.log(JSON.stringify(payload, null, 2));
    else console.log(`baseline: NO BASELINE at ${rel(projectDir, storePath(projectDir))} — cannot prove no regression for screen "${screen}". Capture one first.`);
    process.exit(0);
  }
  if (existing.key !== key) {
    console.error(`baseline: REFUSED — comparing against the wrong branch point: baseline key is ${existing.key}, you passed ${key}.`);
    console.error("  A comparison across branch points answers a different question than \"what did THIS branch change\".");
    process.exit(1);
  }
  const base = existing.screens[screen];
  if (!base) {
    const payload = {
      comparison: "baseline", key, screen, baselineFound: false, provenNoRegression: false,
      why: `the baseline holds no screen "${screen}" — this run cannot prove it did not regress there`,
      regressed: [], lostEvidence: [], newFail: [], fixed: [], persistentFail: [], persistentPass: [],
      measurements: [], findings: { new: [], persistent: [], fixed: [] }, screenshot: "not-compared",
      notCompared: { gates: [], measurements: [] }, blockers: [],
    };
    if (asJson) console.log(JSON.stringify(payload, null, 2));
    else console.log(`baseline: no baseline screen "${screen}" (known: ${Object.keys(existing.screens).join(", ") || "none"}) — cannot prove no regression.`);
    process.exit(0);
  }

  const regressed = [], lostEvidence = [], newFail = [], newPass = [], fixed = [], persistentFail = [], persistentPass = [];
  const notComparedGates = [], notComparedMeasurements = [];
  for (const [g, before] of Object.entries(base.layer1)) {
    const after = snapshot.layer1[g];
    if (after === undefined) { notComparedGates.push(g); continue; }
    const wasClean = CLEAN_STATES.includes(before);
    if (after === "not-run") { if (wasClean) lostEvidence.push({ gate: g, before }); else notComparedGates.push(g); continue; }
    const isClean = CLEAN_STATES.includes(after);
    if (wasClean && !isClean) regressed.push({ gate: g, before, after });
    else if (!wasClean && before !== "not-run" && isClean) fixed.push({ gate: g, before, after });
    else if (before === "not-run") (isClean ? newPass : newFail).push({ gate: g, after });
    else if (isClean) persistentPass.push({ gate: g });
    else persistentFail.push({ gate: g, after });
  }
  for (const [g, after] of Object.entries(snapshot.layer1)) {
    if (g in base.layer1) continue;
    if (after === "not-run") continue; // never measured here, never measured there: nothing to say
    (CLEAN_STATES.includes(after) ? newPass : newFail).push({ gate: g, after });
  }

  const measurements = [];
  for (const [m, before] of Object.entries(base.measurements)) {
    const after = snapshot.measurements[m];
    if (after === undefined) { notComparedMeasurements.push(m); continue; }
    if (after.better !== before.better) {
      console.error(`baseline: REFUSED — measurement "${m}" changed direction (${before.better} -> ${after.better}). That is a re-registration, not a comparison; propose it with capture --rebaseline.`);
      process.exit(1);
    }
    const delta = after.value - before.value;
    const worseBy = before.better === "lower" ? delta : -delta;
    const verdict = worseBy > before.tolerance ? "regressed" : (worseBy < 0 ? "improved" : "within-tolerance");
    measurements.push({ metric: m, before: before.value, after: after.value, better: before.better, tolerance: before.tolerance, worseBy: Math.round(worseBy * 1e6) / 1e6, verdict });
  }
  for (const m of Object.keys(snapshot.measurements)) if (!(m in base.measurements)) measurements.push({ metric: m, before: null, after: snapshot.measurements[m].value, better: snapshot.measurements[m].better, tolerance: snapshot.measurements[m].tolerance, worseBy: null, verdict: "new" });
  const regressedMeasurements = measurements.filter((m) => m.verdict === "regressed");

  const baseFindings = new Map(base.findings.map((f) => [f.hash, f]));
  const nowFindings = new Map(snapshot.findings.map((f) => [f.hash, f]));
  const findings = {
    new: [...nowFindings.values()].filter((f) => !baseFindings.has(f.hash)),
    persistent: [...nowFindings.values()].filter((f) => baseFindings.has(f.hash)),
    fixed: [...baseFindings.values()].filter((f) => !nowFindings.has(f.hash)),
  };

  let screenshot = "not-compared";
  if (base.screenshot && snapshot.screenshot) screenshot = base.screenshot.sha256 === snapshot.screenshot.sha256 ? "identical" : "changed";

  const blockers = [
    ...regressed.map((r) => `REGRESSED gate ${r.gate}: ${r.before} -> ${r.after}`),
    ...lostEvidence.map((r) => `LOST EVIDENCE on gate ${r.gate}: ${r.before} at baseline, declared not-run now`),
    ...regressedMeasurements.map((m) => `REGRESSED measurement ${m.metric}: ${m.before} -> ${m.after} (${m.better} is better, worse by ${m.worseBy} beyond tolerance ${m.tolerance})`),
  ];
  const unproven = notComparedGates.length + notComparedMeasurements.length;
  const provenNoRegression = blockers.length === 0 && unproven === 0;

  const payload = {
    comparison: "baseline", key, screen, baselineFound: true,
    provenNoRegression,
    why: provenNoRegression
      ? "every gate and measurement in the baseline was re-measured on the candidate and none went backwards"
      : (blockers.length ? "the candidate regressed against the baseline" : `${unproven} baseline item(s) were not re-measured on the candidate, so no-regression is unproven for them`),
    regressed, lostEvidence, newFail, newPass, fixed, persistentFail, persistentPass,
    measurements, findings, screenshot,
    notCompared: { gates: notComparedGates, measurements: notComparedMeasurements },
    blockers,
    screenshotNote: "byte identity only — antialias-tolerant pixel diffing is NOT wired; a changed screenshot is a pointer for a human, never a finding and never a blocker",
  };

  if (asJson) console.log(JSON.stringify(payload, null, 2));
  else {
    console.log(`baseline compare — screen "${screen}" @ key ${key}`);
    for (const b of blockers) console.log(`  [Blocker] ${b}`);
    if (newFail.length) console.log(`  new failures (not in the baseline): ${newFail.map((f) => f.gate).join(", ")}`);
    if (fixed.length) console.log(`  fixed: ${fixed.map((f) => f.gate).join(", ")}`);
    if (persistentFail.length) console.log(`  still failing (unescalated): ${persistentFail.map((f) => f.gate).join(", ")}`);
    if (notComparedGates.length) console.log(`  NOT COMPARED gates (absent from this run's inputs — not a pass): ${notComparedGates.join(", ")}`);
    if (notComparedMeasurements.length) console.log(`  NOT COMPARED measurements: ${notComparedMeasurements.join(", ")}`);
    for (const m of measurements) {
      if (m.verdict === "regressed" || m.verdict === "new") continue;
      console.log(`  measure ${m.metric}: ${m.before} -> ${m.after} (${m.verdict})`);
    }
    if (findings.new.length) console.log(`  new findings: ${findings.new.map((f) => `[${f.severity}] ${f.rule} @ ${f.location}`).join("; ")}`);
    if (findings.fixed.length) console.log(`  findings resolved: ${findings.fixed.map((f) => f.rule).join(", ")}`);
    console.log(`  screenshot: ${screenshot} (${payload.screenshotNote})`);
    console.log(`  proven no regression: ${provenNoRegression ? "YES" : "NO"} — ${payload.why}`);
  }
  process.exit(blockers.length ? 1 : 0);
}

usage();
