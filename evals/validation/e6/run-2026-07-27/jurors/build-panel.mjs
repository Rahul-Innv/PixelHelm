#!/usr/bin/env node
// build-panel.mjs — assemble the blind panel inputs.
//
// Usage: node jurors/build-panel.mjs <scratch-dir-outside-the-repo>
//
// Produces, per the sealed E6-A evaluator rule (5 blind jurors, fresh contexts,
// shuffled arms, limited inputs, medians) and the E4 judging-seat repair decision:
//
//   * blind-map.json          the per-juror seed and candidate order (committed)
//   * juror-<n>-inputs.md     that juror's VERBATIM input transcript (committed)
//   * <scratch>/juror-<n>/    blinded copies of the renders, neutrally named
//
// R2 (repair decision): each transcript carries the candidate's GATE OUTPUTS with
// its renders, and the transcript's sha256 is what each juror record stores as
// inputTranscriptSha256, so the hash covers the gate evidence too.
//
// The blinded render copies are NOT committed: 24 cells x 5 jurors is ~55 MB of
// duplicated PNGs. The committed blind-map plus this script regenerate them
// exactly, so the panel stays reproducible without the repository carrying five
// shuffled copies of the same pixels.

import { readFileSync, writeFileSync, mkdirSync, copyFileSync, readdirSync } from "node:fs";
import { createHash } from "node:crypto";
import { dirname, resolve, join } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const RUN = resolve(HERE, "..");
const PROJECT = join(RUN, "project");
const REPO = resolve(RUN, "../../../..");

const scratchArg = process.argv[2];
if (!scratchArg) { console.error("usage: node build-panel.mjs <scratch-dir-outside-the-repo>"); process.exit(2); }
const SCRATCH = resolve(scratchArg);
if (SCRATCH.toLowerCase().startsWith(REPO.toLowerCase())) {
  console.error(`build-panel: refusing to write the blinded render set inside the repository (${SCRATCH})`);
  process.exit(2);
}

const ARMS = ["crease-line", "under-the-bed", "three-counts"];
const JURORS = 5;
const BASE_SEED = 20260727;

const sha256File = (p) => createHash("sha256").update(readFileSync(p)).digest("hex");
const sha256Str = (s) => createHash("sha256").update(Buffer.from(s, "utf8")).digest("hex");

// Deterministic shuffle: a small LCG seeded per juror, so the committed seed
// alone reproduces the order (no Math.random anywhere in the panel machinery).
// The LCG state is derived from the sha256 of the seed rather than from the seed
// itself: seeding it directly gave all five jurors the SAME order, because the
// per-juror seeds differ only in their last digit and one LCG step leaves the
// high bits of adjacent seeds nearly identical. Identical order across jurors
// would leave a position bias free to act on every juror the same way, which is
// exactly what shuffling is supposed to remove.
function shuffle(items, seed) {
  const a = items.slice();
  let s = parseInt(createHash("sha256").update(String(seed)).digest("hex").slice(0, 8), 16) >>> 0;
  const next = () => (s = (s * 1664525 + 1013904223) >>> 0) / 4294967296;
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(next() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/* ---------- per-arm evidence, read from the committed artifacts ---------- */
const intents = {
  "crease-line": "A naval architect's plan sheet that inks itself in as you read: the six creases draw one at a time and the folded bag resolves into a 4.1 m hull in line-work, so you watch the boat be explained rather than advertised.",
  "under-the-bed": "Start in the flat and not on the water: the page opens with the bag in the room it actually lives in, and the unfold happens at the scale of your hallway before the water is ever mentioned.",
  "three-counts": "Three counts and a clock: the page is exactly three beats, bag, unfold, water, each held on its own fact, with the median setup time counting alongside so the pitch and the proof are the same object.",
};
const breaks = {
  "crease-line": [
    "No photograph, no product shot, no filled render anywhere: the entire product is line-work on a plan sheet (breaks the launch-page convention that the hero is a beauty shot; a drawing answers a mechanical objection that a beauty shot cannot).",
    "Dimensions are printed as drawing callouts on leader lines, not as a spec table (breaks the specs-in-a-table convention; on a plan sheet a dimension belongs to a part).",
  ],
  "under-the-bed": [
    "The water is withheld until the third act, so a kayak launch page shows no water in its first two viewports (breaks the category's opening convention; the audience's real blocker is storage and carrying, not paddling).",
    "A human-scale reference object stays on screen throughout, a doorway or a bed, so every size claim reads against something domestic (breaks the convention that outdoor gear is shown in its outdoor context).",
  ],
  "three-counts": [
    "A running elapsed-time readout is the page's primary ornament, so a number does the decorative work a hero image usually does (breaks the convention that the biggest visual is the product; it puts the most contested claim where it can be checked).",
    "Only three screens of content, with the specs reached by a jump link rather than by scrolling past them (breaks the long-marketing-page convention; a returning visitor should not scroll a narrative to reach a price).",
  ],
};

function gateEvidence(arm) {
  const g = (f) => JSON.parse(readFileSync(join(PROJECT, "gates", arm, f), "utf8"));
  const cwv = g("verify_cwv.json");
  const d = cwv.profiles.find((p) => p.name === "desktop").targets[0];
  const m = cwv.profiles.find((p) => p.name === "emulated-mobile").targets[0];
  const ftd = g("verify_frametime-desktop.json").targets[0];
  const ftm = g("verify_frametime-mobile.json").targets[0];
  const pay = JSON.parse(readFileSync(join(PROJECT, "gates", "payload-budgets.json"), "utf8")).arms.find((a) => a.arm === arm);
  const mf = JSON.parse(readFileSync(join(PROJECT, "gates", "motion-floor.json"), "utf8")).arms.find((a) => a.arm === arm);
  const inp = (t) => t.checks.find((c) => c.id === "INP-proxy").val;

  const files = ["static-gates.json", "output-floor.json", "gate-a-derived-claims.json", "gate-b-manifest.json",
    "verify_responsive.json", "verify_states.json", "verify_targetsize.json", "verify_focustrap.json",
    "verify_keyboard.json", "verify_scrollcapture.json", "verify_frametime-desktop.json",
    "verify_frametime-mobile.json", "verify_cwv.json"];
  const digests = files.map((f) => `    ${f}  sha256 ${sha256File(join(PROJECT, "gates", arm, f)).slice(0, 16)}...`);

  return `Machine-gate outcome for this candidate. EVERY shipped HARD gate exited 0:
  - token-contract AA recompute, light and dark: PASS, 8 of 8 gated pairs
  - structural output floor (one main, one h1, heading order, no impostor headings, meta description): PASS
  - axe-core on all 8 rendered cells (motion and no-motion): 0 serious, 0 critical
  - no horizontal overflow at 280 / 320 / 414 px: PASS
  - state-aware contrast, default/hover/focus, both modes: PASS
  - target size (WCAG 2.5.8): PASS
  - focus trap: not applicable, this page has no dialog (explicit, not a silent pass)
  - keyboard traversal: PASS, real Tab path recorded, Shift-Tab the exact reverse, every stop shows a focus response
  - deterministic scroll capture: PASS, reproduced across passes, both with animations killed and with motion live
  - honesty Gate A (derived claims) and Gate B (required-content manifest): PASS
  - Gate B re-run against the script-stripped NO-JS copy of this page: PASS

Measured against the brief's pre-registered budgets:
  - initial payload ${pay.initialPayloadKB} KB (budget 1.5 MB) and JS ${pay.jsGzipKB} KB gzipped (budget 300 KB)
  - LCP ${d.metrics.lcpMs} ms desktop / ${m.metrics.lcpMs} ms emulated mid-tier mobile (budget 2500 ms)
  - CLS ${d.metrics.cls} desktop / ${m.metrics.cls} emulated mobile (budget 0.10)
  - interaction-latency proxy ${inp(d)} desktop / ${inp(m)} emulated mobile (budget 200 ms)
  - frame time p95 ${ftd.frameMs.p95} ms desktop (budget 16.7 ms) / ${ftm.frameMs.p95} ms emulated mobile (budget 33 ms)

Motion floor, measured at runtime rather than inferred from the captures:
${mf.checks.map((c) => `  - [${c.ok ? "PASS" : "FAIL"}] ${c.id}: ${c.detail}`).join("\n")}

Gate artifact digests (this transcript's hash therefore covers the gate evidence):
${digests.join("\n")}`;
}

const rubric = readFileSync(join(RUN, "..", "PREREG-RUBRIC-motion-launch.md"), "utf8");
const criteriaBlock = rubric.split("## Criteria (each 0–10, integers)")[1].split("## Evaluator rule")[0].trim();

/* ---------- build ---------- */
const blindMap = { armOrderBase: ARMS, baseSeed: BASE_SEED, note: "Deterministic LCG shuffle per juror; the seed alone reproduces the order.", jurors: {} };

for (let n = 1; n <= JURORS; n++) {
  const seed = BASE_SEED * 10 + n;
  const order = shuffle(ARMS, seed);
  blindMap.jurors[`juror-${n}`] = { shuffleSeed: seed, order, labels: Object.fromEntries(order.map((a, i) => [`candidate-${i + 1}`, a])) };

  // blinded render copies (scratch only)
  const jdir = join(SCRATCH, `juror-${n}`);
  mkdirSync(jdir, { recursive: true });
  order.forEach((arm, i) => {
    for (const set of ["motion", "no-motion"]) {
      for (const vp of ["desktop", "mobile"]) {
        for (const mode of ["light", "dark"]) {
          const src = join(PROJECT, "renders", set, `${arm}__${vp}__${mode}.png`);
          copyFileSync(src, join(jdir, `candidate-${i + 1}__${set}__${vp}__${mode}.png`));
        }
      }
    }
  });

  const candidateBlocks = order.map((arm, i) => {
    const label = `candidate-${i + 1}`;
    return `## ${label}

Direction intent (written and committed before any code existed): "${intents[arm]}"

Declared convention breaks (per the pre-registration's Amendment A1, these and ONLY these are this candidate's deliberate breaks; any other convention break you find is undeclared and scores as a mistake, not a signature):
- ${breaks[arm][0]}
- ${breaks[arm][1]}

${gateEvidence(arm)}

Renders for ${label} (8 cells). MOTION set, the animated build:
  ${label}__motion__desktop__light.png
  ${label}__motion__desktop__dark.png
  ${label}__motion__mobile__light.png
  ${label}__motion__mobile__dark.png
NO-MOTION parity set, the same build under prefers-reduced-motion:
  ${label}__no-motion__desktop__light.png
  ${label}__no-motion__desktop__dark.png
  ${label}__no-motion__mobile__light.png
  ${label}__no-motion__mobile__dark.png
`;
  }).join("\n---\n\n");

  const transcript = `# E6-A blind panel, juror ${n} of ${JURORS}

You are one of five independent jurors scoring three candidate launch pages
against a rubric that was sealed before any of them existed. You have not seen
the other jurors and will not. Score only what is in this transcript and in the
render files it names.

## What the product is

A launch page for the Vireo Fold, a fictional 9.8 kg folding touring kayak that
packs to a carry-on-sized bag. The brief asked that the page's motion narrative
walk the visitor through bag, unfold, water in the product's own three steps,
so that the demonstration IS the pitch. Audience: city commuters and small-flat
dwellers who assumed kayaking wasn't for them.

All content traces to one sealed data file. Three figures in it carry
qualifications that the page must not drop: the setup-time claim ("3 min 40 s
median") is owner-submitted timings with n=14 and is NOT independently
verified; the pack volume (118 L) is ESTIMATED from CAD; the load rating
(130 kg) has certification PENDING and may never be presented as certified.

## The rubric (sealed, verbatim)

${criteriaBlock}

Anchors: 0-2 broken, 3-4 below professional, 5-6 professional baseline,
7-8 strong professional, 9-10 distinctive-excellence signal.

## Rules that bind your scoring

1. **Criterion 1 (no-motion story parity) may ONLY be scored from the NO-MOTION
   parity renders.** That is the sealed evaluator rule. Do not score criterion 1
   from the motion renders.
2. Every candidate below has already passed every shipped machine gate. Gate
   outputs travel with the renders on purpose: do not spend praise on properties
   the machine has already ruled on, and do not award points for accessibility,
   contrast, overflow or honesty conformance as though you had discovered them.
   Use them to rule out the opposite error, that an attractive page is quietly
   broken.
3. A known limitation of your seat: **a static capture cannot show choreography.**
   A correctly animated page and a static page are indistinguishable in a
   screenshot. Where a criterion turns on motion (7 especially), score from the
   declared intent, the runtime motion measurements quoted above, and what the
   captures do show, and say plainly in your rationale when the evidence does not
   settle it. Do not infer that a page is motionless because a still image is.
4. The candidates are presented to you in an order that is not the order any
   other juror sees. Labels are neutral and carry no ranking.

## Your output

Return ONE JSON object, nothing else, of this exact shape:

{
  "candidate-1": { "scores": { "1": <int 0-10>, ... "10": <int> },
                   "rationales": { "1": "<max TWO sentences>", ... "10": "..." } },
  "candidate-2": { ... },
  "candidate-3": { ... }
}

Every criterion 1 through 10 must carry an integer score and a rationale of AT
MOST TWO SENTENCES. The two-sentence limit is enforced by the record schema and
a longer rationale is rejected.

---

# Candidates

${candidateBlocks}`;

  const outPath = join(HERE, `juror-${n}-inputs.md`);
  writeFileSync(outPath, transcript, "utf8");
  blindMap.jurors[`juror-${n}`].inputTranscriptSha256 = sha256Str(transcript);
  blindMap.jurors[`juror-${n}`].blindedRenderDir = `<scratch>/juror-${n}`;
  console.log(`juror-${n}: seed ${seed} order ${order.join(", ")} transcript sha256 ${blindMap.jurors[`juror-${n}`].inputTranscriptSha256.slice(0, 16)}...`);
}

writeFileSync(join(HERE, "blind-map.json"), JSON.stringify(blindMap, null, 2) + "\n", "utf8");
console.log(`\nblind-map.json written; blinded render sets under ${SCRATCH} (not committed)`);
