#!/usr/bin/env node
// records.mjs — writer + validator for the close-the-loop record schemas:
//   pixelhelm/judge-verdict@1 · pixelhelm/signoff@1 · pixelhelm/run@1 · pixelhelm/juror-record@1
//
// Usage:
//   node records.mjs template <judge-verdict|signoff|run|juror-record> [--out <file>]
//   node records.mjs validate <file.json> [...] [--json]
//   node records.mjs write <judge-verdict|signoff|run|juror-record> --project <dir> [--json]   (record JSON on stdin)
//
// The enforcement this script exists for: A PANEL/RUN WITH NO VALIDATED RECORD DID NOT
// HAPPEN. `write` validates first and refuses invalid records outright; archives are
// append-only (an existing record file is never overwritten — that is the write policy
// in close-the-loop.md, "never edit an archive"). `write` also appends the judge
// ledger line so the next run's Phase 0 read finds it.
//
// Three SOFT integrity checks fire on a judge-verdict write (stderr, and a `warnings`
// array under --json) — warnings, never refusals, because records predating each rule
// stay valid: (1) no matching per-juror records (sealed E4 sheet), (2) a SCORED
// candidate with no referenced floor evidence (the R1 repair — floor-clean is a
// precondition for esteem scoring; a floor-failing or gate-less candidate belongs in
// `unscored`, never "scored low"), and (3) a multi-candidate verdict carrying no
// cross-run `houseStyleCheck` (the felt-variety check — ADVISORY by construction).
// See evals/validation/E4-JUDGING-SEAT-REPAIR-DECISION.md.
//
// ONE HARD write-time precondition, on `run` only: a run record must carry
// `intentElicitation` — the owner's own words about the intended feeling/register/
// reference points, captured BEFORE any direction intent was written, or an explicit
// owner waiver. `write run` REFUSES without it (exit 1, nothing written), and the loop
// treats a refused write as a blocking finding. `validate` stays permissive so archives
// written before this rule remain valid. Source: the 2026-07-26 E3 commerce sign-off —
// "the loop should ASK the owner what theme and feeling is wanted before generating."
//
// Store: writes go to <project>/.pixelhelm/ (canonical; legacy stores are read-only
// compatibility and are never written).
//
// Dependency-free, network-free. Exit 0 valid/written · 1 invalid or refused · 2 runner error.
// Schema shapes: the `design` skill's references/close-the-loop.md (the single home).

import { readFileSync, writeFileSync, mkdirSync, existsSync, appendFileSync, readdirSync } from "node:fs";
import { resolve, join, relative, dirname } from "node:path";

const SCHEMAS = {
  "judge-verdict": "pixelhelm/judge-verdict@1",
  signoff: "pixelhelm/signoff@1",
  run: "pixelhelm/run@1",
  "juror-record": "pixelhelm/juror-record@1",
};
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const SHA256_RE = /^[0-9a-f]{64}$/;
const CRITERION_RE = /^[1-9]\d*$/; // rubric-sheet criterion numbers ("1", "2", …)
const MODES = ["redesign-tournament", "incremental-polish", "review", "new-design"];
const PASSES = ["fast", "deep"];
const SEVERITIES = ["blocker", "major", "minor"];
const DECISIONS = ["approved", "rejected", "approved-with-changes"];
const CLARIFIES = ["register", "taste", "scope", "none"];
const FOLLOWUPS = ["lesson-proposed", "profile-taste-proposed", "none"];
const EDITIONS = ["full", "lite", "dev"];
const OUTCOMES = ["shipped", "current-design-wins", "needs-human-review", "report-only"];
const HOUSE_STYLE_VERDICTS = ["no-house-style-tell", "house-style-tell", "not-run"];

// ---------- validators ----------
const isStr = (v) => typeof v === "string";
const nonEmpty = (v) => isStr(v) && v.trim().length > 0;
const isObj = (v) => v !== null && typeof v === "object" && !Array.isArray(v);
const isInt = (v) => Number.isInteger(v);
const isNum = (v) => typeof v === "number" && Number.isFinite(v);
const median = (arr) => {
  const s = [...arr].sort((a, b) => a - b);
  const mid = Math.floor(s.length / 2);
  return s.length % 2 ? s[mid] : (s[mid - 1] + s[mid]) / 2;
};

function commonHeader(r, errors, schema) {
  if (r.schema !== schema) errors.push(`schema must be "${schema}" (got ${JSON.stringify(r.schema)})`);
  if (!nonEmpty(r.date) || !DATE_RE.test(r.date)) errors.push("date must be YYYY-MM-DD");
  if (!nonEmpty(r.project)) errors.push("project must be a non-empty string");
  if (!nonEmpty(r.surface)) errors.push("surface must be a non-empty string");
}

function validateJudgeVerdict(r) {
  const errors = [];
  commonHeader(r, errors, SCHEMAS["judge-verdict"]);
  if (!MODES.includes(r.mode)) errors.push(`mode must be one of ${MODES.join(" | ")}`);
  if (!PASSES.includes(r.pass)) errors.push(`pass must be one of ${PASSES.join(" | ")}`);
  const candidateIds = isObj(r.candidates) ? Object.keys(r.candidates) : [];
  if (!isObj(r.candidates) || candidateIds.length === 0) errors.push("candidates must be a non-empty object");
  else for (const [id, c] of Object.entries(r.candidates)) {
    if (!isObj(c)) { errors.push(`candidates.${id} must be an object`); continue; }
    if (!nonEmpty(c.label)) errors.push(`candidates.${id}.label must be non-empty`);
    if (!["incumbent", "challenger"].includes(c.kind)) errors.push(`candidates.${id}.kind must be incumbent | challenger`);
    if (!nonEmpty(c.render)) errors.push(`candidates.${id}.render must carry the render artifact path`);
    // R1/R2 floor bundle — OPTIONAL for compatibility (records predating the repair stay
    // valid); shape-checked when present. Absence is caught SOFTLY at write time instead.
    if (c.floorEvidence !== undefined) {
      const fe = c.floorEvidence;
      if (!isObj(fe)) errors.push(`candidates.${id}.floorEvidence must be an object { gateOutputs: [], notRun: [] }`);
      else {
        if (!Array.isArray(fe.gateOutputs) || !fe.gateOutputs.every(nonEmpty)) {
          errors.push(`candidates.${id}.floorEvidence.gateOutputs must be an array of gate ARTIFACT paths (a prose "Layer-1 passed" is not evidence)`);
        }
        if (fe.notRun !== undefined && (!Array.isArray(fe.notRun) || !fe.notRun.every(nonEmpty))) {
          errors.push(`candidates.${id}.floorEvidence.notRun must be an array of gate ids that did not run (silence must never read as a pass)`);
        }
      }
    }
  }
  // R1 — candidates the floor excluded. They are NOT in `candidates`, carry no scores and
  // no rank, and each names the failing or missing gate. Optional for compatibility.
  if (r.unscored !== undefined) {
    if (!Array.isArray(r.unscored)) errors.push("unscored must be an array of { candidate, gate, why } — the R1 eliminations");
    else for (const [i, u] of r.unscored.entries()) {
      if (!isObj(u) || !nonEmpty(u.candidate) || !nonEmpty(u.gate) || !nonEmpty(u.why)) {
        errors.push(`unscored[${i}] must be { candidate, gate, why } — name the failing or missing gate, never a comparative adjective`);
      } else if (candidateIds.includes(u.candidate)) {
        errors.push(`unscored[${i}].candidate "${u.candidate}" is also a scored candidate — UNSCORED means excluded from scoring, never "scored low"`);
      }
    }
  }
  // Felt variety across RUNS — the cross-run house-style check. ADVISORY by construction:
  // it is recorded and surfaced, it never blocks a winner. Optional for compatibility;
  // shape-checked when present, and absence is caught SOFTLY at write time.
  // (Why: E3 2026-07-26 — every registered divergence metric PASSED while the owner saw
  // "a theme, all of them are similar"; those metrics measure difference, not felt variety.)
  if (r.houseStyleCheck !== undefined) {
    const h = r.houseStyleCheck;
    if (!isObj(h)) errors.push("houseStyleCheck must be an object { comparedAgainst, recurringSignatures, verdict, why }");
    else {
      if (!Array.isArray(h.comparedAgainst) || !h.comparedAgainst.every(nonEmpty)) {
        errors.push("houseStyleCheck.comparedAgainst must be an array of PRIOR committed winner references (ledger lines, verdict records, or baseline renders) — a memory of past runs is not a comparison");
      }
      if (!Array.isArray(h.recurringSignatures)) {
        errors.push("houseStyleCheck.recurringSignatures must be an array of { signature, evidence, runs }");
      } else for (const [i, s] of h.recurringSignatures.entries()) {
        if (!isObj(s) || !nonEmpty(s.signature) || !nonEmpty(s.evidence)
            || !Array.isArray(s.runs) || s.runs.length < 2 || !s.runs.every(nonEmpty)) {
          errors.push(`houseStyleCheck.recurringSignatures[${i}] must be { signature, evidence, runs: [>= 2 run refs] } — the fingerprint ADD/PROMOTE evidence rule applies: an uncited tell is not a finding`);
        }
      }
      if (!HOUSE_STYLE_VERDICTS.includes(h.verdict)) {
        errors.push(`houseStyleCheck.verdict must be one of ${HOUSE_STYLE_VERDICTS.join(" | ")}`);
      }
      if (h.verdict === "house-style-tell" && Array.isArray(h.recurringSignatures) && h.recurringSignatures.length === 0) {
        errors.push('houseStyleCheck.verdict "house-style-tell" requires at least one cited recurringSignatures entry');
      }
      if (h.verdict === "not-run" && !nonEmpty(h.why)) {
        errors.push('houseStyleCheck.verdict "not-run" must say why in `why` (e.g. no prior committed winner for this surface) — silence must never read as "checked and clean"');
      }
      if (h.verdict !== "not-run" && Array.isArray(h.comparedAgainst) && h.comparedAgainst.length === 0) {
        errors.push('houseStyleCheck.comparedAgainst is empty — a verdict other than "not-run" claims a comparison happened, so it must name the prior committed winners it compared against');
      }
      if (!isStr(h.why)) errors.push("houseStyleCheck.why must be a string");
    }
  }
  const p = r.registerFitPanel;
  if (!isObj(p)) errors.push("registerFitPanel must be an object");
  else {
    if (!isInt(p.jurors) || p.jurors < 3 || p.jurors % 2 === 0) {
      errors.push("registerFitPanel.jurors must be an odd integer >= 3 (the median is what makes the veto trustworthy)");
    }
    if (!isObj(p.scores)) errors.push("registerFitPanel.scores must be an object");
    else {
      for (const id of candidateIds) if (!(id in p.scores)) errors.push(`registerFitPanel.scores is missing candidate "${id}" — every candidate is scored, including the incumbent`);
      for (const [id, arr] of Object.entries(p.scores)) {
        if (!candidateIds.includes(id)) { errors.push(`registerFitPanel.scores has unknown candidate "${id}"`); continue; }
        if (!Array.isArray(arr) || !arr.every(isNum)) { errors.push(`registerFitPanel.scores.${id} must be an array of numbers`); continue; }
        if (isInt(p.jurors) && arr.length !== p.jurors) errors.push(`registerFitPanel.scores.${id} has ${arr.length} score(s) for ${p.jurors} juror(s)`);
      }
    }
    if (!isObj(p.medians)) errors.push("registerFitPanel.medians must be an object");
    else if (isObj(p.scores)) {
      for (const [id, m] of Object.entries(p.medians)) {
        if (!isNum(m)) { errors.push(`registerFitPanel.medians.${id} must be a number`); continue; }
        const arr = p.scores[id];
        if (Array.isArray(arr) && arr.every(isNum) && arr.length && Math.abs(median(arr) - m) > 1e-9) {
          errors.push(`registerFitPanel.medians.${id} = ${m} does not equal the median of its scores (${median(arr)})`);
        }
      }
      for (const id of Object.keys(p.scores)) if (!(id in p.medians)) errors.push(`registerFitPanel.medians is missing "${id}"`);
    }
    if (typeof p.nonOverlapping !== "boolean") errors.push("registerFitPanel.nonOverlapping must be a boolean");
    if (!nonEmpty(p.modeFairness)) errors.push("registerFitPanel.modeFairness must be non-empty (both-modes | same-mode | <note>)");
  }
  if (!isObj(r.lensScores)) errors.push("lensScores must be an object");
  else for (const [lens, scores] of Object.entries(r.lensScores)) {
    if (!isObj(scores)) { errors.push(`lensScores.${lens} must be an object of candidate scores`); continue; }
    for (const id of Object.keys(scores)) {
      if (!candidateIds.includes(id)) errors.push(`lensScores.${lens} has unknown candidate "${id}"`);
      if (!isNum(scores[id])) errors.push(`lensScores.${lens}.${id} must be a number`);
    }
  }
  if (!Array.isArray(r.constraints)) errors.push("constraints must be an array");
  else for (const [i, c] of r.constraints.entries()) {
    if (!isObj(c) || !nonEmpty(c.seat) || !nonEmpty(c.finding) || !SEVERITIES.includes(c.severity)) {
      errors.push(`constraints[${i}] must be { seat, finding, severity: ${SEVERITIES.join(" | ")} }`);
    }
  }
  if (!isObj(r.aggregation)) errors.push("aggregation must be an object");
  else {
    if (!nonEmpty(r.aggregation.contract)) errors.push("aggregation.contract must name the contract doc + date used");
    if (!isObj(r.aggregation.weightedScores)) errors.push("aggregation.weightedScores must be an object");
    if (!isStr(r.aggregation.guardOutcome)) errors.push("aggregation.guardOutcome must be a string");
  }
  if (!nonEmpty(r.winner) || !(candidateIds.includes(r.winner) || r.winner === "incumbent")) {
    errors.push('winner must be a candidate id or "incumbent"');
  }
  for (const k of ["registerSafeGrafts", "rejectedGrafts"]) if (!Array.isArray(r[k])) errors.push(`${k} must be an array`);
  if (!Array.isArray(r.rejectedDirections)) errors.push("rejectedDirections must be an array");
  else for (const [i, d] of r.rejectedDirections.entries()) {
    if (!isObj(d) || !nonEmpty(d.direction) || !nonEmpty(d.why)) errors.push(`rejectedDirections[${i}] must be { direction, why }`);
  }
  if (r.ownerVerdict !== null && r.ownerVerdict !== undefined) {
    const o = r.ownerVerdict;
    if (!isObj(o) || !DECISIONS.includes(o.decision) || !nonEmpty(o.ownerWords)) {
      errors.push(`ownerVerdict must be null (pending) or { decision: ${DECISIONS.join(" | ")}, ownerWords: "<short verbatim quote>" }`);
    }
  }
  return errors;
}

function validateSignoff(r) {
  const errors = [];
  commonHeader(r, errors, SCHEMAS.signoff);
  if (!nonEmpty(r.artifact)) errors.push("artifact must reference the render path or council record");
  if (!DECISIONS.includes(r.decision)) errors.push(`decision must be one of ${DECISIONS.join(" | ")}`);
  if (!nonEmpty(r.ownerWords)) errors.push("ownerWords must carry a short verbatim quote");
  if (!CLARIFIES.includes(r.clarifies)) errors.push(`clarifies must be one of ${CLARIFIES.join(" | ")}`);
  if (!Array.isArray(r.followUp) || !r.followUp.length || !r.followUp.every((f) => FOLLOWUPS.includes(f))) {
    errors.push(`followUp must be a non-empty array drawn from ${FOLLOWUPS.join(" | ")}`);
  }
  return errors;
}

// The elicitation record: what the owner said the design should FEEL like, captured
// before any direction intent was written — or an explicit owner waiver, in the owner's
// words. Returns [] when the block is well-formed. Used twice: shape-checked here when
// the field is present (so old archives stay valid), and REQUIRED at `write run` time
// (`elicitationWriteErrors`), where its absence refuses the write.
function intentElicitationErrors(e) {
  if (!isObj(e)) return ["intentElicitation must be an object { asked, ownerWords, capturedInto, waived, waiverWords }"];
  const errors = [];
  if (typeof e.asked !== "boolean") errors.push("intentElicitation.asked must be a boolean");
  if (typeof e.waived !== "boolean") errors.push("intentElicitation.waived must be a boolean");
  if (e.asked === true && e.waived === true) errors.push("intentElicitation cannot be both asked and waived — record what actually happened");
  if (e.asked === false && e.waived === false) errors.push("intentElicitation must record either an asked-and-answered elicitation or an explicit owner waiver — a run that did neither is a process defect, not a valid record");
  if (e.asked === true) {
    if (!nonEmpty(e.ownerWords)) errors.push("intentElicitation.ownerWords must carry the owner's VERBATIM answer about the intended feeling / register / reference points — a paraphrase is not the answer");
    if (!nonEmpty(e.capturedInto)) errors.push("intentElicitation.capturedInto must name where the captured answer entered the ground context the directions had to serve");
  }
  if (e.waived === true && !nonEmpty(e.waiverWords)) {
    errors.push("intentElicitation.waiverWords must carry the owner's own words declining the question — a self-issued waiver is not a waiver");
  }
  for (const k of ["ownerWords", "capturedInto", "waiverWords"]) {
    if (e[k] !== undefined && !isStr(e[k])) errors.push(`intentElicitation.${k} must be a string`);
  }
  return errors;
}

function validateRun(r) {
  const errors = [];
  commonHeader(r, errors, SCHEMAS.run);
  if (!nonEmpty(r.intent)) errors.push("intent must be non-empty");
  // Optional HERE for compatibility (runs archived before this rule stay valid);
  // REQUIRED at write time — see elicitationWriteErrors.
  if (r.intentElicitation !== undefined) errors.push(...intentElicitationErrors(r.intentElicitation));
  if (!EDITIONS.includes(r.edition)) errors.push(`edition must be one of ${EDITIONS.join(" | ")}`);
  if (!isStr(r.workerModel)) errors.push("workerModel must be a string");
  for (const k of ["skillsFired", "engines"]) {
    if (!Array.isArray(r[k]) || !r[k].every(nonEmpty)) errors.push(`${k} must be an array of non-empty strings`);
  }
  if (!isObj(r.council) || !PASSES.includes(r.council.pass) || !isInt(r.council.seats) || r.council.seats < 0
      || !isInt(r.council.registerJurors) || r.council.registerJurors < 0) {
    errors.push("council must be { pass: fast | deep, seats: int >= 0, registerJurors: int >= 0 }");
  }
  if (!isInt(r.iterations) || r.iterations < 0) errors.push("iterations must be an integer >= 0");
  if (!isObj(r.renders) || !isInt(r.renders.items) || !isInt(r.renders.cells) || r.renders.items < 0 || r.renders.cells < 0) {
    errors.push("renders must be { items: int >= 0, cells: int >= 0 }");
  }
  if (!isObj(r.tokens) || !isNum(r.tokens.subagentsMeasured) || !isNum(r.tokens.workflowsMeasured) || !isStr(r.tokens.note)) {
    errors.push("tokens must be { subagentsMeasured, workflowsMeasured, note } — MEASURED numbers only, never estimates");
  }
  if (!isNum(r.wallClockMinutes) || r.wallClockMinutes < 0) errors.push("wallClockMinutes must be a number >= 0");
  if (!OUTCOMES.includes(r.outcome)) errors.push(`outcome must be one of ${OUTCOMES.join(" | ")}`);
  if (!isStr(r.notes)) errors.push("notes must be a string");
  return errors;
}

// Sentence count for juror rationales: terminator-count heuristic (runs of . ! ?
// followed by whitespace or end of text; an unterminated trailing chunk counts as
// one sentence). Deliberately strict — terse rationales are the point.
function sentenceCount(text) {
  const t = String(text).trim();
  if (!t) return 0;
  const terminated = (t.match(/[.!?]+(?=\s|$)/g) || []).length;
  return /[.!?]$/.test(t) ? terminated : terminated + 1;
}

// pixelhelm/juror-record@1 — ONE record per juror per candidate (E1 critique finding 1:
// a per-juror schema the panel machinery can enforce; required for all new panels per
// the sealed E4 sheet, evals/validation/PREREG-E4-CALIBRATION.md).
function validateJurorRecord(r) {
  const errors = [];
  commonHeader(r, errors, SCHEMAS["juror-record"]);
  if (!nonEmpty(r.jurorId)) errors.push("jurorId must be a non-empty string");
  if (!nonEmpty(r.blindLabel)) errors.push("blindLabel must carry the neutral label this candidate was presented under");
  if (!nonEmpty(r.rubric)) errors.push("rubric must name the sealed rubric sheet the criterion numbers key to");
  if (!isObj(r.scores) || Object.keys(r.scores).length === 0) {
    errors.push("scores must be a non-empty object keyed by rubric criterion number");
  } else for (const [k, v] of Object.entries(r.scores)) {
    if (!CRITERION_RE.test(k)) errors.push(`scores key "${k}" is not a rubric criterion number (positive integer, as printed on the sheet)`);
    if (!isInt(v) || v < 0 || v > 10) errors.push(`scores.${k} must be an integer 0..10 (the rubric scale)`);
  }
  if (!isObj(r.rationales)) errors.push("rationales must be an object keyed by rubric criterion number");
  else if (isObj(r.scores)) {
    for (const k of Object.keys(r.scores)) if (!(k in r.rationales)) errors.push(`rationales is missing criterion "${k}" — every scored criterion carries its rationale`);
    for (const [k, v] of Object.entries(r.rationales)) {
      if (!(k in r.scores)) { errors.push(`rationales has criterion "${k}" with no matching score`); continue; }
      if (!nonEmpty(v)) { errors.push(`rationales.${k} must be non-empty`); continue; }
      const n = sentenceCount(v);
      if (n > 2) errors.push(`rationales.${k} has ${n} sentences — max 2 per criterion (terminator-count heuristic)`);
    }
  }
  if (!isStr(r.inputTranscriptSha256) || !SHA256_RE.test(r.inputTranscriptSha256)) {
    errors.push("inputTranscriptSha256 must be the sha256 (64 lowercase hex chars) of this juror's verbatim input transcript");
  }
  if (!(isInt(r.shuffleSeed) || nonEmpty(r.shuffleSeed))) {
    errors.push("shuffleSeed must record this juror's candidate-presentation-order seed (integer or non-empty string)");
  }
  return errors;
}

const VALIDATORS = {
  [SCHEMAS["judge-verdict"]]: validateJudgeVerdict,
  [SCHEMAS.signoff]: validateSignoff,
  [SCHEMAS.run]: validateRun,
  [SCHEMAS["juror-record"]]: validateJurorRecord,
};

function validateRecord(r) {
  if (!isObj(r)) return ["record must be a JSON object"];
  const v = VALIDATORS[r.schema];
  if (!v) return [`unknown schema ${JSON.stringify(r.schema)} — expected one of: ${Object.values(SCHEMAS).join(" · ")}`];
  return v(r);
}

// ---------- templates ----------
const TEMPLATES = {
  "judge-verdict": {
    schema: SCHEMAS["judge-verdict"],
    date: "", project: "", surface: "",
    mode: "redesign-tournament", pass: "fast",
    candidates: { incumbent: { label: "", kind: "incumbent", render: "", floorEvidence: { gateOutputs: [], notRun: [] } } },
    unscored: [],
    houseStyleCheck: { comparedAgainst: [], recurringSignatures: [], verdict: "not-run", why: "" },
    registerFitPanel: { jurors: 5, scores: { incumbent: [] }, medians: { incumbent: 0 }, nonOverlapping: true, modeFairness: "both-modes" },
    lensScores: {},
    constraints: [],
    aggregation: { contract: "", weightedScores: {}, guardOutcome: "" },
    winner: "incumbent",
    registerSafeGrafts: [], rejectedGrafts: [], rejectedDirections: [],
    ownerVerdict: null,
  },
  signoff: {
    schema: SCHEMAS.signoff,
    date: "", project: "", surface: "",
    artifact: "", decision: "approved", ownerWords: "", clarifies: "none", followUp: ["none"],
  },
  run: {
    schema: SCHEMAS.run,
    date: "", project: "", surface: "", intent: "",
    intentElicitation: { asked: true, ownerWords: "", capturedInto: "", waived: false, waiverWords: "" },
    edition: "lite", workerModel: "",
    skillsFired: [], engines: [],
    council: { pass: "fast", seats: 0, registerJurors: 0 },
    iterations: 0, renders: { items: 0, cells: 0 },
    tokens: { subagentsMeasured: 0, workflowsMeasured: 0, note: "measured-only; main-context usage is not observable in-session" },
    wallClockMinutes: 0, outcome: "report-only", notes: "",
  },
  "juror-record": {
    schema: SCHEMAS["juror-record"],
    date: "", project: "", surface: "",
    jurorId: "", blindLabel: "", rubric: "",
    scores: {}, rationales: {},
    inputTranscriptSha256: "", shuffleSeed: "",
  },
};

// ---------- archive paths (canonical store; append-only) ----------
const slug = (s) => String(s).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
function archivePath(kind, r, projectDir) {
  const store = join(projectDir, ".pixelhelm");
  const name = `${r.date}--${slug(r.surface)}`;
  if (kind === "judge-verdict") return join(store, "council", `${name}--council.json`);
  if (kind === "signoff") return join(store, "signoffs", `${name}.json`);
  if (kind === "juror-record") return join(store, "jurors", `${name}--${slug(r.jurorId)}--${slug(r.blindLabel)}.json`);
  return join(store, "runs", `${name}--run.json`);
}

// Integrity check (SOFT on purpose): a judge-verdict written for a panel SHOULD have
// one pixelhelm/juror-record@1 per juror per candidate alongside it. Old records
// predate the schema (E1 critique finding 1), so absence is a WARNING, never a
// refusal — but new panels must have them per the sealed E4 sheet
// (evals/validation/PREREG-E4-CALIBRATION.md).
function jurorRecordWarning(record, projectDir) {
  const jurorsDir = join(projectDir, ".pixelhelm", "jurors");
  const prefix = `${record.date}--${slug(record.surface)}--`;
  const present = existsSync(jurorsDir) && readdirSync(jurorsDir).some((f) => f.startsWith(prefix) && f.endsWith(".json"));
  if (present) return null;
  return `no pixelhelm/juror-record@1 files found under .pixelhelm/jurors/ matching "${prefix}*" — new panels must write one juror-record per juror per candidate BEFORE the verdict (sealed E4 sheet); only records predating the schema may lack them`;
}

// Floor integrity (SOFT, same pattern as the juror-record warning above): appearing in
// `candidates` MEANS the candidate was scored, and R1 makes floor-clean a precondition
// for esteem scoring — so every scored candidate must reference its floor evidence.
// Records predating the R1 repair carry no floorEvidence, so absence is a WARNING, never
// a refusal (evals/validation/E4-JUDGING-SEAT-REPAIR-DECISION.md).
function floorEvidenceWarning(record) {
  const cands = isObj(record.candidates) ? record.candidates : {};
  const bare = Object.entries(cands)
    .filter(([, c]) => !isObj(c) || !isObj(c.floorEvidence) || !Array.isArray(c.floorEvidence.gateOutputs) || c.floorEvidence.gateOutputs.length === 0)
    .map(([id]) => id);
  if (!bare.length) return null;
  return `scored candidate(s) with no referenced floor evidence: ${bare.join(", ")} — R1 makes floor-clean a precondition for esteem scoring, so each scored candidate carries candidates.<id>.floorEvidence.gateOutputs (gate ARTIFACT paths). A candidate that fails or lacks its gates belongs in "unscored", never scored low; only records predating the R1 repair may omit this`;
}

// Felt-variety integrity (SOFT, same pattern as the two warnings above). A tournament
// judged only WITHIN one run cannot see a house style that repeats ACROSS runs — E3
// 2026-07-26: dE00, layout class, motif Jaccard and blind-intent all PASSED while the
// owner's verdict was "I see a theme - all of them are similar to each other and to the
// set-1 style". So a multi-candidate verdict records what it compared the field against.
// The check is ADVISORY: it never blocks a winner, and its absence never refuses a write
// (records predating this rule stay valid) — but silence is warned about, not accepted.
function houseStyleWarning(record) {
  const cands = isObj(record.candidates) ? record.candidates : {};
  if (Object.keys(cands).length < 2) return null;
  const h = record.houseStyleCheck;
  if (isObj(h) && HOUSE_STYLE_VERDICTS.includes(h.verdict)) return null;
  return `multi-candidate verdict with no houseStyleCheck — record what this field was compared against across PRIOR runs' committed winners, and cite the evidence for any recurring structural signature. ADVISORY: a house-style tell is recorded, never a veto. In-run divergence metrics measure difference, not felt variety (E3 2026-07-26 owner review)`;
}

function ledgerLine(r, fileName) {
  const medians = Object.entries(r.registerFitPanel?.medians || {}).map(([id, m]) => `${id} ${m}`).join(" / ") || "n/a";
  const rejected = (r.rejectedDirections || []).map((d) => slug(d.direction)).join(",") || "none";
  const owner = r.ownerVerdict ? r.ownerVerdict.decision : "pending";
  const grafts = (r.registerSafeGrafts || []).length;
  return `| ${r.date} | ${r.surface} | ${r.mode}/${r.pass} | winner: ${r.winner} | reg-fit medians: ${medians} | rejected: ${rejected} | grafts open: ${grafts} | owner: ${owner} | ${fileName} |`;
}

// ---------- CLI ----------
const argv = process.argv.slice(2);
const cmd = argv[0];
const asJson = argv.includes("--json");
const usage = () => {
  console.error(`usage:
  node records.mjs template <judge-verdict|signoff|run|juror-record> [--out <file>]
  node records.mjs validate <file.json> [...] [--json]
  node records.mjs write <judge-verdict|signoff|run|juror-record> --project <dir> [--json]   (record JSON on stdin)`);
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
  if (out) { writeFileSync(out, body); console.log(`records: template ${SCHEMAS[kind]} -> ${out}`); }
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
    catch (e) { console.error(`records: cannot read/parse ${f}: ${e.message}`); process.exit(2); }
    const errors = validateRecord(record);
    if (errors.length) anyInvalid = true;
    results.push({ file: f, schema: isObj(record) ? record.schema : null, valid: errors.length === 0, errors });
  }
  if (asJson) console.log(JSON.stringify({ validator: "records", results }, null, 2));
  else for (const r of results) {
    console.log(`${r.valid ? "VALID  " : "INVALID"} ${r.file} (${r.schema || "?"})`);
    for (const e of r.errors) console.log(`         x ${e}`);
  }
  process.exit(anyInvalid ? 1 : 0);
}

if (cmd === "write") {
  const kind = argv[1];
  if (!TEMPLATES[kind]) usage();
  const projectDir = flagValue("project");
  if (!projectDir) usage();
  let raw = "";
  try { raw = readFileSync(0, "utf8"); } catch { /* empty stdin */ }
  let record;
  try { record = JSON.parse(raw); }
  catch (e) { console.error(`records: stdin is not valid JSON: ${e.message}`); process.exit(2); }
  const errors = validateRecord(record);
  if (record?.schema !== SCHEMAS[kind]) errors.unshift(`record schema ${JSON.stringify(record?.schema)} does not match write kind "${kind}"`);
  // HARD write-time precondition (run only): the loop must have ASKED the owner what the
  // design should feel like before any direction intent was written, or hold an explicit
  // owner waiver. A run that did neither is a process defect; refusing the write makes it
  // a blocking finding rather than a missing paragraph. `validate` stays permissive so
  // archives written before this rule remain valid.
  if (kind === "run" && isObj(record) && record.intentElicitation === undefined) {
    errors.push('intentElicitation is REQUIRED on a new run record: capture the owner\'s own words on the intended feeling / register / reference points BEFORE any direction intent, or record an explicit owner waiver. Owner, 2026-07-26: "the loop should ASK the owner what theme and feeling is wanted before generating."');
  }
  if (errors.length) {
    if (asJson) console.log(JSON.stringify({ written: null, valid: false, errors }, null, 2));
    else { console.error(`records: REFUSED — the record does not validate; nothing was written. A panel/run with no valid record did not happen.`); for (const e of errors) console.error(`  x ${e}`); }
    process.exit(1);
  }
  const dest = archivePath(kind, record, resolve(projectDir));
  if (existsSync(dest)) {
    console.error(`records: REFUSED — archive already exists (append-only, never edit an archive): ${relative(resolve(projectDir), dest)}`);
    process.exit(1);
  }
  mkdirSync(dirname(dest), { recursive: true });
  writeFileSync(dest, JSON.stringify(record, null, 2) + "\n");
  const written = [relative(resolve(projectDir), dest).replace(/\\/g, "/")];
  const warnings = [];
  if (kind === "judge-verdict") {
    const ledger = join(dirname(dest), "ledger.md");
    if (!existsSync(ledger)) writeFileSync(ledger, "# Council ledger — one line per run (drill-down: the verdict JSONs)\n\n");
    appendFileSync(ledger, ledgerLine(record, dest.split(/[\\/]/).pop()) + "\n");
    written.push(relative(resolve(projectDir), ledger).replace(/\\/g, "/"));
    const warn = jurorRecordWarning(record, resolve(projectDir));
    if (warn) warnings.push(warn);
    const floorWarn = floorEvidenceWarning(record);
    if (floorWarn) warnings.push(floorWarn);
    const houseWarn = houseStyleWarning(record);
    if (houseWarn) warnings.push(houseWarn);
  }
  if (asJson) console.log(JSON.stringify({ written, valid: true, errors: [], warnings }, null, 2));
  else {
    console.log(`records: written ${written.join(" + ")}`);
    for (const w of warnings) console.error(`records: WARNING — ${w}`);
  }
  process.exit(0);
}

usage();
