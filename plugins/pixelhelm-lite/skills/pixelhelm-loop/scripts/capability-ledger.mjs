#!/usr/bin/env node
// capability-ledger.mjs — writer + validator for the capability ledger:
//   pixelhelm/capability-entry@1 · pixelhelm/capability-escape@1
//
// Usage:
//   node capability-ledger.mjs template <entry|escape> [--out <file>]
//   node capability-ledger.mjs validate <file.json> [...] [--json]
//   node capability-ledger.mjs write <entry|escape> --project <dir> [--json]   (record JSON on stdin)
//   node capability-ledger.mjs summary --project <dir> [--json]
//   node capability-ledger.mjs check --project <dir> [--json]
//
// WHAT THIS IS FOR. "Consistently exceptional" is a claim about REPETITION, and a
// system can only evidence repetition if it keeps a record of what it actually did.
// This ledger is that record, per archetype: run counts and dates, which floor gates
// fired, what the panel scored, what the OWNER said, the owner-vs-panel delta, and
// the defects that got past a stage and were found later. It is append-only and it
// RECORDS history — it never rewrites it. A defect discovered after a run closed is a
// NEW escape record pointing at that run's id; the run's own entry is never edited.
//
// THE ANTI-FABRICATION RULES (validation is not shape box-ticking):
//   - Every entry cites at least one artifact path. A line with nothing to point at
//     is refused outright.
//   - Anything not measured is the literal string "unknown". A field may not be
//     omitted to imply absence, and it may not be reconstructed to look complete.
//   - `ownerVsPanel` is RECOMPUTED: it must equal owner.band - panel.winnerMedian
//     when both are numbers, and must be "unknown" when either is. You cannot record
//     a calibration delta you did not measure.
//   - `panel.winnerMedian` must equal `panel.medians[panel.winner]` when both exist.
//   - A numeric owner band carries its BASIS (stated | approximate | upper-bound), so
//     "the owner said maximum 6" never hardens into "the owner scored 6".
//
// Store: writes go to <project>/.pixelhelm/capability/ (canonical). Entries and
// escapes are archives — never edited, never overwritten (a write against an
// existing path is REFUSED). Each write also appends one LEDGER.md line, which is
// what a reader scans first; the JSONs are drill-down.
//
// The ledger does NOT define the archetype taxonomy (that is backlog item P2-1). It
// records the archetype slug the run declared and groups by it.
//
// Dependency-free, network-free. Exit 0 valid/written/clean · 1 invalid, refused, or
// unledgered runs found · 2 runner error.
// Schema shapes: the `pixelhelm` skill's references/close-the-loop.md (the single home).

import { readFileSync, writeFileSync, mkdirSync, existsSync, appendFileSync, readdirSync } from "node:fs";
import { resolve, join, relative, dirname } from "node:path";

const SCHEMAS = {
  entry: "pixelhelm/capability-entry@1",
  escape: "pixelhelm/capability-escape@1",
};
const RUN_SCHEMA = "pixelhelm/run@1";
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const UNKNOWN = "unknown";
const KINDS = ["design-run", "calibration-experiment"];
const FLOOR_OUTCOMES = ["pass", "fail", UNKNOWN];
const STANDINGS = ["binding", "advisory-only", UNKNOWN];
const DECISIONS = ["approved", "rejected", "approved-with-changes", "pending", UNKNOWN];
const BAND_BASES = ["stated", "approximate", "upper-bound", UNKNOWN];
const ESCAPED_PAST = ["floor", "panel", "owner", "shipped-artifact", UNKNOWN];
const WHEN_FOUND = ["in-loop", "post-hoc", UNKNOWN];

// ---------- shared predicates ----------
const isStr = (v) => typeof v === "string";
const nonEmpty = (v) => isStr(v) && v.trim().length > 0;
const isObj = (v) => v !== null && typeof v === "object" && !Array.isArray(v);
const isInt = (v) => Number.isInteger(v);
const isNum = (v) => typeof v === "number" && Number.isFinite(v);
const isUnknown = (v) => v === UNKNOWN;
const strArray = (v) => Array.isArray(v) && v.every(nonEmpty);
const slug = (s) => String(s).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");

function commonHeader(r, errors, schema) {
  if (r.schema !== schema) errors.push(`schema must be "${schema}" (got ${JSON.stringify(r.schema)})`);
  if (!nonEmpty(r.date) || !DATE_RE.test(r.date)) errors.push("date must be YYYY-MM-DD");
  if (!nonEmpty(r.runId) || !SLUG_RE.test(r.runId)) {
    errors.push('runId must be a lowercase-kebab slug identifying the run (it is what an escape record points back at)');
  }
  if (!nonEmpty(r.archetype) || !SLUG_RE.test(r.archetype)) {
    errors.push("archetype must be a lowercase-kebab slug (the ledger records the slug the run declared; it does not define the taxonomy)");
  }
  if (!strArray(r.artifacts) || r.artifacts.length === 0) {
    errors.push("artifacts must be a non-empty array of paths — every ledger record cites the artifact it was read from; a line with nothing to point at did not happen");
  }
  if (!isStr(r.notes)) errors.push("notes must be a string (use it for the qualifiers a field cannot carry, never to replace a field)");
}

// ---------- pixelhelm/capability-entry@1 ----------
function validateEntry(r) {
  const errors = [];
  commonHeader(r, errors, SCHEMAS.entry);
  if (!KINDS.includes(r.kind)) errors.push(`kind must be one of ${KINDS.join(" | ")}`);
  if (!nonEmpty(r.project)) errors.push("project must be a non-empty string");
  if (!nonEmpty(r.surface)) errors.push("surface must be a non-empty string");
  if (!nonEmpty(r.runRecord)) errors.push(`runRecord must be the ${RUN_SCHEMA} archive path this line summarizes, or "${UNKNOWN}"`);

  const f = r.floor;
  if (!isObj(f)) errors.push("floor must be an object { outcome, firedInLoop, failedAtClose, notRun, evidence }");
  else {
    if (!FLOOR_OUTCOMES.includes(f.outcome)) errors.push(`floor.outcome must be one of ${FLOOR_OUTCOMES.join(" | ")}`);
    for (const k of ["firedInLoop", "failedAtClose", "notRun"]) {
      if (!strArray(f[k])) errors.push(`floor.${k} must be an array of gate ids (empty is allowed; "${UNKNOWN}" as an element is allowed when the run did not record which)`);
    }
    if (!strArray(f.evidence)) {
      errors.push("floor.evidence must be an array of gate-output artifact paths (a prose \"gates were green\" is not evidence)");
    }
    if (f.outcome === "pass" && Array.isArray(f.failedAtClose) && f.failedAtClose.length) {
      errors.push("floor.outcome is \"pass\" but floor.failedAtClose names gates — a pass with a failing gate is a contradiction");
    }
    if (f.outcome === "fail" && Array.isArray(f.failedAtClose) && f.failedAtClose.length === 0) {
      errors.push("floor.outcome is \"fail\" but floor.failedAtClose is empty — a floor failure must name its gate");
    }
    if (f.outcome === "pass" && Array.isArray(f.evidence) && f.evidence.length === 0) {
      errors.push("floor.outcome is \"pass\" with no floor.evidence — a claimed pass carries its gate artifacts");
    }
  }

  const p = r.panel;
  if (!isObj(p)) errors.push("panel must be an object { standing, jurors, medians, winner, winnerMedian }");
  else {
    if (!STANDINGS.includes(p.standing)) {
      errors.push(`panel.standing must be one of ${STANDINGS.join(" | ")} — "${UNKNOWN}" when the run's own report does not state the seat's standing (do not reconstruct it from dates)`);
    }
    if (!(isUnknown(p.jurors) || (isInt(p.jurors) && p.jurors > 0))) errors.push(`panel.jurors must be a positive integer or "${UNKNOWN}"`);
    if (!(isUnknown(p.medians) || isObj(p.medians))) errors.push(`panel.medians must be an object of candidate -> OVERALL panel median, or "${UNKNOWN}"`);
    else if (isObj(p.medians)) {
      if (Object.keys(p.medians).length === 0) errors.push(`panel.medians is an empty object — use "${UNKNOWN}" when no panel ran`);
      for (const [id, m] of Object.entries(p.medians)) if (!isNum(m)) errors.push(`panel.medians.${id} must be a number`);
    }
    if (!(isUnknown(p.winner) || nonEmpty(p.winner))) errors.push(`panel.winner must be a candidate id or "${UNKNOWN}"`);
    if (!(isUnknown(p.winnerMedian) || isNum(p.winnerMedian))) errors.push(`panel.winnerMedian must be a number or "${UNKNOWN}"`);
    // recompute: the recorded winner median must BE the winner's median
    if (isObj(p.medians) && nonEmpty(p.winner) && !isUnknown(p.winner) && p.winner in p.medians) {
      const expected = p.medians[p.winner];
      if (isNum(expected) && isNum(p.winnerMedian) && Math.abs(expected - p.winnerMedian) > 1e-9) {
        errors.push(`panel.winnerMedian = ${p.winnerMedian} does not equal panel.medians.${p.winner} (${expected})`);
      }
      if (isNum(expected) && isUnknown(p.winnerMedian)) {
        errors.push(`panel.winnerMedian is "${UNKNOWN}" but panel.medians.${p.winner} = ${expected} is recorded`);
      }
    }
    if (isObj(p.medians) && nonEmpty(p.winner) && !isUnknown(p.winner) && !(p.winner in p.medians)) {
      errors.push(`panel.winner "${p.winner}" is not a key of panel.medians`);
    }
  }

  const o = r.owner;
  if (!isObj(o)) errors.push("owner must be an object { decision, band, bandBasis, ownerWords, record }");
  else {
    if (!DECISIONS.includes(o.decision)) errors.push(`owner.decision must be one of ${DECISIONS.join(" | ")}`);
    if (!(isUnknown(o.band) || isNum(o.band))) errors.push(`owner.band must be a number or "${UNKNOWN}"`);
    if (!BAND_BASES.includes(o.bandBasis)) errors.push(`owner.bandBasis must be one of ${BAND_BASES.join(" | ")}`);
    if (isNum(o.band) && isUnknown(o.bandBasis)) {
      errors.push('owner.band is a number but owner.bandBasis is "unknown" — a recorded band states how the owner expressed it (stated | approximate | upper-bound), so "maximum 6" never hardens into "scored 6"');
    }
    if (isUnknown(o.band) && !isUnknown(o.bandBasis)) errors.push(`owner.bandBasis must be "${UNKNOWN}" when owner.band is "${UNKNOWN}"`);
    if (!(isUnknown(o.ownerWords) || nonEmpty(o.ownerWords))) errors.push(`owner.ownerWords must be a short verbatim quote or "${UNKNOWN}"`);
    if (!(isUnknown(o.record) || nonEmpty(o.record))) errors.push(`owner.record must be the signoff@1 archive path or "${UNKNOWN}"`);
    if (isNum(o.band) && isUnknown(o.ownerWords)) {
      errors.push("owner.band is a number with no owner.ownerWords — a band the owner did not say in words is a reconstruction");
    }
  }

  // recompute: the calibration delta is DERIVED, never asserted
  const band = isObj(o) ? o.band : undefined;
  const winnerMedian = isObj(p) ? p.winnerMedian : undefined;
  const bothKnown = isNum(band) && isNum(winnerMedian);
  if (!(isUnknown(r.ownerVsPanel) || isNum(r.ownerVsPanel))) errors.push(`ownerVsPanel must be a number or "${UNKNOWN}"`);
  else if (bothKnown) {
    const expected = band - winnerMedian;
    if (!isNum(r.ownerVsPanel) || Math.abs(r.ownerVsPanel - expected) > 1e-9) {
      errors.push(`ownerVsPanel must equal owner.band - panel.winnerMedian (${band} - ${winnerMedian} = ${expected}); got ${JSON.stringify(r.ownerVsPanel)}`);
    }
  } else if (!isUnknown(r.ownerVsPanel)) {
    errors.push(`ownerVsPanel must be "${UNKNOWN}" unless BOTH owner.band and panel.winnerMedian are numbers — a delta against an unmeasured side is invented`);
  }

  const pl = r.plants;
  if (!(isUnknown(pl) || isObj(pl))) errors.push(`plants must be { planted, caught } or "${UNKNOWN}"`);
  else if (isObj(pl)) {
    if (!isInt(pl.planted) || pl.planted < 0) errors.push("plants.planted must be an integer >= 0");
    if (!isInt(pl.caught) || pl.caught < 0) errors.push("plants.caught must be an integer >= 0");
    if (isInt(pl.planted) && isInt(pl.caught) && pl.caught > pl.planted) errors.push("plants.caught cannot exceed plants.planted");
  }
  return errors;
}

// ---------- pixelhelm/capability-escape@1 ----------
function validateEscape(r) {
  const errors = [];
  commonHeader(r, errors, SCHEMAS.escape);
  if (!nonEmpty(r.defect)) errors.push("defect must name the defect in one phrase");
  if (!nonEmpty(r.defectClass)) errors.push("defectClass must be a short class slug (structure, reflow, contrast, target-size, ...)");
  if (!ESCAPED_PAST.includes(r.escapedPast)) errors.push(`escapedPast must be one of ${ESCAPED_PAST.join(" | ")} — the last stage the defect got past before it was caught`);
  if (!nonEmpty(r.caughtBy)) errors.push('caughtBy must name what caught it (a gate id, "panel", "owner", "external-critic", ...)');
  if (!WHEN_FOUND.includes(r.whenFound)) errors.push(`whenFound must be one of ${WHEN_FOUND.join(" | ")}`);
  const c = r.cleared;
  if (!isObj(c)) errors.push('cleared must be { date: "YYYY-MM-DD" | "open", how, artifact }');
  else {
    const open = c.date === "open";
    if (!(open || (nonEmpty(c.date) && DATE_RE.test(c.date)))) errors.push('cleared.date must be YYYY-MM-DD or "open"');
    if (!isStr(c.how)) errors.push("cleared.how must be a string");
    if (!isStr(c.artifact)) errors.push("cleared.artifact must be a string");
    if (!open) {
      if (!nonEmpty(c.how)) errors.push("cleared.how must be non-empty once cleared.date is set — say what cleared it");
      if (!nonEmpty(c.artifact)) errors.push("cleared.artifact must cite the artifact that proves the clear (a regenerated gate record, a repair report)");
    }
  }
  return errors;
}

const VALIDATORS = {
  [SCHEMAS.entry]: validateEntry,
  [SCHEMAS.escape]: validateEscape,
};

function validateRecord(r) {
  if (!isObj(r)) return ["record must be a JSON object"];
  const v = VALIDATORS[r.schema];
  if (!v) return [`unknown schema ${JSON.stringify(r.schema)} — expected one of: ${Object.values(SCHEMAS).join(" · ")}`];
  return v(r);
}

// ---------- templates ----------
const TEMPLATES = {
  entry: {
    schema: SCHEMAS.entry,
    date: "", runId: "", archetype: "", kind: "design-run",
    project: "", surface: "",
    runRecord: UNKNOWN,
    artifacts: [],
    floor: { outcome: UNKNOWN, firedInLoop: [], failedAtClose: [], notRun: [], evidence: [] },
    panel: { standing: UNKNOWN, jurors: UNKNOWN, medians: UNKNOWN, winner: UNKNOWN, winnerMedian: UNKNOWN },
    owner: { decision: UNKNOWN, band: UNKNOWN, bandBasis: UNKNOWN, ownerWords: UNKNOWN, record: UNKNOWN },
    ownerVsPanel: UNKNOWN,
    plants: UNKNOWN,
    notes: "",
  },
  escape: {
    schema: SCHEMAS.escape,
    date: "", runId: "", archetype: "",
    defect: "", defectClass: "",
    escapedPast: UNKNOWN, caughtBy: "", whenFound: UNKNOWN,
    cleared: { date: "open", how: "", artifact: "" },
    artifacts: [],
    notes: "",
  },
};

// ---------- archive paths (canonical store; append-only) ----------
const storeDir = (projectDir) => join(projectDir, ".pixelhelm", "capability");
function archivePath(kind, r, projectDir) {
  const store = storeDir(projectDir);
  if (kind === "entry") return join(store, "entries", `${r.date}--${slug(r.archetype)}--${slug(r.runId)}.json`);
  return join(store, "escapes", `${r.date}--${slug(r.runId)}--${slug(r.defect).slice(0, 60)}.json`);
}

const rel = (projectDir, p) => relative(projectDir, p).replace(/\\/g, "/");
const show = (v) => (isUnknown(v) ? UNKNOWN : String(v));
const list = (a) => (Array.isArray(a) && a.length ? a.join(",") : "-");

function entryLine(r, fileName) {
  const band = isNum(r.owner.band) ? `${r.owner.band} (${r.owner.bandBasis})` : UNKNOWN;
  return `| ${r.date} | ${r.archetype} | ${r.kind} | run: ${r.runId} | floor: ${r.floor.outcome} (fired: ${list(r.floor.firedInLoop)}; failed: ${list(r.floor.failedAtClose)}; not-run: ${list(r.floor.notRun)}) | panel: ${show(r.panel.winner)} ${show(r.panel.winnerMedian)} (${r.panel.standing}) | owner: ${r.owner.decision} ${band} | delta: ${show(r.ownerVsPanel)} | ${fileName} |`;
}

function escapeLine(r, fileName) {
  const cleared = r.cleared.date === "open" ? "OPEN" : r.cleared.date;
  return `| ${r.date} | ${r.archetype} | escape on run: ${r.runId} | ${r.defect} (${r.defectClass}) | past: ${r.escapedPast} | caught by: ${r.caughtBy} (${r.whenFound}) | cleared: ${cleared} | ${fileName} |`;
}

const LEDGER_HEADER =
  "# Capability ledger — one line per recorded run and per escape found later\n" +
  "\n" +
  "Append-only. This file RECORDS history and never rewrites it: a defect found after a\n" +
  "run closed is a new escape line naming that run's id, not an edit to the run's line.\n" +
  "Drill-down: the JSONs under `entries/` and `escapes/`. Derived view:\n" +
  "`capability-ledger.mjs summary --project <dir>`.\n" +
  "\n";

// ---------- reading the store ----------
function readAll(dir) {
  if (!existsSync(dir)) return [];
  return readdirSync(dir)
    .filter((f) => f.endsWith(".json"))
    .sort()
    .map((f) => {
      const path = join(dir, f);
      try { return { file: f, path, record: JSON.parse(readFileSync(path, "utf8")) }; }
      catch (e) { return { file: f, path, record: null, error: e.message }; }
    });
}

const readEntries = (projectDir) => readAll(join(storeDir(projectDir), "entries"));
const readEscapes = (projectDir) => readAll(join(storeDir(projectDir), "escapes"));

// Which pixelhelm/run@1 archives in this project store have no ledger entry?
// A run is covered when an entry's runRecord names its file, or when the entry's
// date+surface match the run record's. This is the mechanical wire behind
// close-the-loop's "closing a loop appends its ledger line".
function unledgeredRuns(projectDir) {
  const runsDir = join(projectDir, ".pixelhelm", "runs");
  const runs = readAll(runsDir).filter((r) => isObj(r.record) && r.record.schema === RUN_SCHEMA);
  const entries = readEntries(projectDir).map((e) => e.record).filter(isObj);
  const missing = [];
  for (const run of runs) {
    const covered = entries.some((e) => {
      const named = nonEmpty(e.runRecord) && !isUnknown(e.runRecord)
        && (e.runRecord === run.file || e.runRecord.replace(/\\/g, "/").endsWith(`/${run.file}`));
      const keyed = e.date === run.record.date && e.surface === run.record.surface;
      return named || keyed;
    });
    if (!covered) missing.push(rel(projectDir, run.path));
  }
  return missing;
}

// ---------- summary (DERIVED, never stored as truth) ----------
function summarise(projectDir) {
  const entryRows = readEntries(projectDir);
  const escapeRows = readEscapes(projectDir);
  // A record that no longer validates is NOT silently folded into the aggregates —
  // it is named. Deriving a capability number from a record the validator rejects
  // would be exactly the fabrication this file exists to prevent.
  const usable = (r) => isObj(r.record) && validateRecord(r.record).length === 0;
  const unreadable = [...entryRows, ...escapeRows].filter((r) => !usable(r)).map((r) => r.file);
  const entries = entryRows.filter(usable).map((r) => r.record);
  const escapes = escapeRows.filter(usable).map((r) => r.record);

  const byArchetype = {};
  const bucket = (a) => (byArchetype[a] ??= {
    archetype: a, runs: 0, byKind: {}, dates: [],
    floor: { pass: 0, fail: 0, unknown: 0, firedInLoop: 0 },
    panelWinnerMedians: [], ownerDecisions: {}, ownerVsPanel: [],
    plants: { planted: 0, caught: 0, recordedOn: 0 },
    escapes: { total: 0, open: 0, cleared: 0 },
    unknownFields: 0,
  });

  const UNKNOWN_PROBES = (e) => [
    e.runRecord, e.floor.outcome, e.panel.standing, e.panel.jurors, e.panel.medians,
    e.panel.winner, e.panel.winnerMedian, e.owner.decision, e.owner.band,
    e.owner.bandBasis, e.owner.ownerWords, e.owner.record, e.ownerVsPanel, e.plants,
  ];

  for (const e of entries) {
    const b = bucket(e.archetype);
    b.runs += 1;
    b.byKind[e.kind] = (b.byKind[e.kind] || 0) + 1;
    b.dates.push(e.date);
    if (FLOOR_OUTCOMES.includes(e.floor.outcome)) b.floor[e.floor.outcome] += 1;
    if (e.floor.firedInLoop.length) b.floor.firedInLoop += 1;
    if (isNum(e.panel.winnerMedian)) b.panelWinnerMedians.push(e.panel.winnerMedian);
    b.ownerDecisions[e.owner.decision] = (b.ownerDecisions[e.owner.decision] || 0) + 1;
    if (isNum(e.ownerVsPanel)) b.ownerVsPanel.push(e.ownerVsPanel);
    if (isObj(e.plants)) { b.plants.planted += e.plants.planted; b.plants.caught += e.plants.caught; b.plants.recordedOn += 1; }
    b.unknownFields += UNKNOWN_PROBES(e).filter(isUnknown).length;
  }
  for (const x of escapes) {
    const b = bucket(x.archetype);
    b.escapes.total += 1;
    if (x.cleared.date === "open") b.escapes.open += 1; else b.escapes.cleared += 1;
  }

  const mean = (a) => (a.length ? Math.round((a.reduce((s, v) => s + v, 0) / a.length) * 1000) / 1000 : null);
  const med = (a) => {
    if (!a.length) return null;
    const s = [...a].sort((x, y) => x - y);
    const mid = Math.floor(s.length / 2);
    return s.length % 2 ? s[mid] : (s[mid - 1] + s[mid]) / 2;
  };

  const archetypes = Object.keys(byArchetype).sort().map((a) => {
    const b = byArchetype[a];
    b.dates = [...new Set(b.dates)].sort();
    b.firstRun = b.dates[0] ?? null;
    b.lastRun = b.dates[b.dates.length - 1] ?? null;
    b.medianOfPanelWinnerMedians = med(b.panelWinnerMedians);
    b.meanOwnerVsPanel = mean(b.ownerVsPanel);
    b.ownerVsPanelMeasuredOn = b.ownerVsPanel.length;
    return b;
  });

  return {
    generator: "capability-ledger summary (DERIVED from the entries; never stored as truth)",
    project: projectDir.replace(/\\/g, "/"),
    entries: entries.length,
    escapes: escapes.length,
    unreadable,
    archetypes,
  };
}

function printSummary(s) {
  console.log(`capability ledger — ${s.entries} entr${s.entries === 1 ? "y" : "ies"} · ${s.escapes} escape(s)`);
  if (s.unreadable.length) console.log(`  ! unreadable records: ${s.unreadable.join(", ")}`);
  for (const a of s.archetypes) {
    const kinds = Object.entries(a.byKind).map(([k, n]) => `${k} ${n}`).join(", ") || "-";
    console.log(`\n${a.archetype} — ${a.runs} run(s) [${kinds}] · ${a.firstRun} .. ${a.lastRun}`);
    console.log(`  floor: ${a.floor.pass} pass / ${a.floor.fail} fail / ${a.floor.unknown} unknown · gates fired mid-loop on ${a.floor.firedInLoop} run(s)`);
    console.log(`  panel winner medians: ${a.panelWinnerMedians.length ? a.panelWinnerMedians.join(", ") : "none recorded"}${a.medianOfPanelWinnerMedians === null ? "" : ` (median ${a.medianOfPanelWinnerMedians})`}`);
    console.log(`  owner: ${Object.entries(a.ownerDecisions).map(([d, n]) => `${d} ${n}`).join(", ")}`);
    console.log(`  owner-vs-panel: ${a.ownerVsPanelMeasuredOn ? `${a.ownerVsPanel.join(", ")} (mean ${a.meanOwnerVsPanel}, measured on ${a.ownerVsPanelMeasuredOn} of ${a.runs})` : `not measurable on any of ${a.runs} run(s)`}`);
    console.log(`  planted defects: ${a.plants.recordedOn ? `${a.plants.caught}/${a.plants.planted} caught (recorded on ${a.plants.recordedOn} run(s))` : "none recorded"}`);
    console.log(`  escapes: ${a.escapes.total} (${a.escapes.cleared} cleared / ${a.escapes.open} open)`);
    console.log(`  unknown fields across entries: ${a.unknownFields} — the ledger's own honesty count`);
  }
}

// ---------- CLI ----------
const argv = process.argv.slice(2);
const cmd = argv[0];
const asJson = argv.includes("--json");
const usage = () => {
  console.error(`usage:
  node capability-ledger.mjs template <entry|escape> [--out <file>]
  node capability-ledger.mjs validate <file.json> [...] [--json]
  node capability-ledger.mjs write <entry|escape> --project <dir> [--json]   (record JSON on stdin)
  node capability-ledger.mjs summary --project <dir> [--json]
  node capability-ledger.mjs check --project <dir> [--json]`);
  process.exit(2);
};
const flagValue = (name) => {
  const i = argv.indexOf(`--${name}`);
  return i >= 0 && argv[i + 1] && !argv[i + 1].startsWith("--") ? argv[i + 1] : null;
};

if (cmd === "template") {
  const kind = argv[1];
  if (!TEMPLATES[kind]) usage();
  const body = JSON.stringify(TEMPLATES[kind], null, 2) + "\n";
  const out = flagValue("out");
  if (out) { writeFileSync(out, body); console.log(`capability-ledger: template ${SCHEMAS[kind]} -> ${out}`); }
  else process.stdout.write(body);
  process.exit(0);
}

if (cmd === "validate") {
  const files = argv.slice(1).filter((a) => !a.startsWith("--"));
  if (!files.length) usage();
  const results = [];
  let anyInvalid = false;
  for (const f of files) {
    let record;
    try { record = JSON.parse(readFileSync(f, "utf8")); }
    catch (e) { console.error(`capability-ledger: cannot read/parse ${f}: ${e.message}`); process.exit(2); }
    const errors = validateRecord(record);
    if (errors.length) anyInvalid = true;
    results.push({ file: f, schema: isObj(record) ? record.schema : null, valid: errors.length === 0, errors });
  }
  if (asJson) console.log(JSON.stringify({ validator: "capability-ledger", results }, null, 2));
  else for (const r of results) {
    console.log(`${r.valid ? "VALID  " : "INVALID"} ${r.file} (${r.schema || "?"})`);
    for (const e of r.errors) console.log(`         x ${e}`);
  }
  process.exit(anyInvalid ? 1 : 0);
}

if (cmd === "write") {
  const kind = argv[1];
  if (!TEMPLATES[kind]) usage();
  const projectArg = flagValue("project");
  if (!projectArg) usage();
  const projectDir = resolve(projectArg);
  let raw = "";
  try { raw = readFileSync(0, "utf8"); } catch { /* empty stdin */ }
  let record;
  try { record = JSON.parse(raw); }
  catch (e) { console.error(`capability-ledger: stdin is not valid JSON: ${e.message}`); process.exit(2); }
  const errors = validateRecord(record);
  if (record?.schema !== SCHEMAS[kind]) errors.unshift(`record schema ${JSON.stringify(record?.schema)} does not match write kind "${kind}"`);
  if (errors.length) {
    if (asJson) console.log(JSON.stringify({ written: null, valid: false, errors }, null, 2));
    else { console.error("capability-ledger: REFUSED — the record does not validate; nothing was written. A run with no valid ledger record is not evidence of repetition."); for (const e of errors) console.error(`  x ${e}`); }
    process.exit(1);
  }
  const dest = archivePath(kind, record, projectDir);
  if (existsSync(dest)) {
    console.error(`capability-ledger: REFUSED — record already exists (append-only; the ledger records history, it never rewrites it): ${rel(projectDir, dest)}`);
    console.error("  A correction or a later finding is a NEW escape record pointing at the same runId.");
    process.exit(1);
  }
  mkdirSync(dirname(dest), { recursive: true });
  writeFileSync(dest, JSON.stringify(record, null, 2) + "\n");
  const ledger = join(storeDir(projectDir), "LEDGER.md");
  if (!existsSync(ledger)) writeFileSync(ledger, LEDGER_HEADER);
  const fileName = dest.split(/[\\/]/).pop();
  appendFileSync(ledger, (kind === "entry" ? entryLine(record, fileName) : escapeLine(record, fileName)) + "\n");
  const written = [rel(projectDir, dest), rel(projectDir, ledger)];

  // SOFT integrity checks (warnings, never refusals — the same pattern records.mjs
  // uses: a rule that post-dates a record must not invalidate the record).
  const warnings = [];
  if (kind === "entry") {
    if (isUnknown(record.runRecord)) {
      warnings.push(`runRecord is "${UNKNOWN}" — a closed loop writes its ${RUN_SCHEMA} archive through records.mjs first, and the ledger line cites it. Only runs that predate the record machinery may leave this unknown`);
    } else {
      const named = join(projectDir, record.runRecord);
      if (!existsSync(named) && !existsSync(resolve(record.runRecord))) {
        warnings.push(`runRecord "${record.runRecord}" does not resolve to a file from this project dir or the cwd — the citation cannot be followed`);
      }
    }
    if (record.floor.outcome === UNKNOWN) warnings.push('floor.outcome is "unknown" — the floor is the part of this system with the strongest evidence; a run that recorded no floor outcome weakens every aggregate this ledger reports');
  } else {
    const known = readEntries(projectDir).some((e) => isObj(e.record) && e.record.runId === record.runId);
    if (!known) warnings.push(`no capability-entry with runId "${record.runId}" exists in this store — an escape points back at a recorded run; write the run's entry first, or check the id`);
  }
  if (asJson) console.log(JSON.stringify({ written, valid: true, errors: [], warnings }, null, 2));
  else {
    console.log(`capability-ledger: written ${written.join(" + ")}`);
    for (const w of warnings) console.error(`capability-ledger: WARNING — ${w}`);
  }
  process.exit(0);
}

if (cmd === "summary") {
  const projectArg = flagValue("project");
  if (!projectArg) usage();
  const s = summarise(resolve(projectArg));
  if (asJson) console.log(JSON.stringify(s, null, 2));
  else printSummary(s);
  process.exit(0);
}

if (cmd === "check") {
  const projectArg = flagValue("project");
  if (!projectArg) usage();
  const projectDir = resolve(projectArg);
  const missing = unledgeredRuns(projectDir);
  const payload = { check: "unledgered-runs", project: projectDir.replace(/\\/g, "/"), missing, clean: missing.length === 0 };
  if (asJson) console.log(JSON.stringify(payload, null, 2));
  else if (missing.length) {
    console.error(`capability-ledger: ${missing.length} run record(s) with no ledger entry — closing a loop appends its ledger line:`);
    for (const m of missing) console.error(`  x ${m}`);
  } else {
    console.log("capability-ledger: every run record in this store has a ledger entry");
  }
  process.exit(missing.length ? 1 : 0);
}

usage();
