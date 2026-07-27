# Juror input transcript — external panel, e1-utility, juror-4

You are one independent juror on a blind design panel. You will score FOUR
website candidates. Your ONLY inputs are the four kinds of material in this
document: (1) the tier definitions, (2) the scoring rubric, (3) for each
candidate, its rendered screenshots AND its machine floor-gate outputs, and
nothing else. Read only the files listed in section 3; do not open, search, or
read any other file, directory, or document, and do not use any outside
knowledge of these candidates.

Where the rubric's evaluator rule mentions materials that are not part of this
document (a brief, a data file, other jurors), they are intentionally not among
your inputs: score what is observable in the renders and in the floor outputs
quoted here, on the rubric's criteria and scale, as this panel's single
independent juror.

THE FLOOR PRECONDITION (read this before you score anything). Every candidate
below carries the output of the machine floor gates that were run on it. Those
gates are measurements, not opinions, and they are not yours to relitigate.

- If a candidate's floor outputs show that EVERY hard gate that ran exited
  clean, score that candidate normally on the rubric. Do not award it extra
  credit for passing the floor, and do not spend praise on a property the
  gates already measured.
- If a candidate's floor outputs show ANY hard gate FAILED, that candidate is
  UNSCORED. Do not give it rubric scores. Do not rank it. Do not call it the
  worst, or weakest, or last: you are simply silent on its taste, because the
  floor has already ruled and you have no standing to hold an opinion about it.
  Mark it in your output with "unscored": true and name the failing gate.
- An UNSCORED candidate is left out of your ranking entirely. Rank only the
  candidates you scored.

## Section 1 — Tier definitions (verbatim)

<!-- PROVENANCE: copied VERBATIM from section 2 ("The four tiers") of the Phase-1 dossier
     "05-WHAT-MAKES-A-WEBSITE-EXCEPTIONAL-DOSSIER.md", portfolio-capability-research
     outputs dated 2026-07-26 (owner research archive, outside this repo). Lines below are
     the exact section text, unedited. Required juror input per the sealed E4 sheet (a). -->

## 2. The four tiers

### Tier 1 — Non-negotiable quality floor (this program's normative floor POLICY)

Framing per critic-1 defect 10: the items below are grounded in testable external standards (WCAG, CWV) and evidence-backed fundamentals, and this program adopts them as a hard floor by policy. The empirical claim "no site can be excellent for its audience without every item" is NOT established — e.g., corpus award winners violate the resilience item while achieving juried esteem. The floor is what this program will refuse to trade away, stated as policy with reasons, not as a law of nature.

*Fundamentals (owner-directed first-class layer):*
- Communicate what the site is within seconds — value proposition inside the ~10 s window [FD-02]
- Written for scanners: front-loaded, subheaded, concise, objective; ~20% of words get read [FD-01, FD-03]
- Conventional mechanics: navigation, links, forms, and feedback follow platform conventions (Jakob's Law; heuristic #4); novelty lives in the brand layer, not the mechanics layer [FD-04]
- Legible body text: ~15–25 px, 120–145% leading, ~45–90 characters/line (convention ranges; the peer-reviewed line-length literature is mixed — comprehension favored ~55 cpl in one study while another found 95 cpl fastest with no comprehension penalty) [FD-06, refuter D12]
- Task-based navigation with working search; answer the user's actual questions, including pricing [L2-02, FB-5a]
- Forms: minimum fields, specific field-level errors, input never lost [FD-07]
- Mobile content parity — the mobile version is the site [FD-08]
- Trust basics: real organization, easy contact, evident freshness, zero sloppy errors [FD-09]
- Fast: the one fundamental with repeated quasi-causal outcome evidence [FD-13]

*Standards (external, testable):*
- WCAG 2.2 AA as the hard conformance bar — contrast 4.5:1, reflow at 320 px, visible unobscured focus, 24×24 px targets, pause/stop/hide for >5 s motion, no 3-flashes [BF-06, ST]
- `prefers-reduced-motion` honored even though 2.3.3 is AAA — the harms (nausea, migraines, bed rest) are severe relative to a one-media-query cost [L4-05]
- Core Web Vitals good at p75: LCP ≤ 2.5 s, INP ≤ 200 ms, CLS ≤ 0.1 [BF-07]
- Semantics/SEO floor: unique titles/descriptions, real headings, alt text, descriptive URLs/anchors, indexability, HTTPS [ST-S8]
- Resilience: meaningful content without JavaScript; the corpus's award-winning WebGL sites fail this outright [L6-02]

Reality check: GOV.UK itself self-declares only partial WCAG 2.2 AA with ~20 known issues [L6-03] — one prominent instance showing the floor is a direction of rigor rather than a solved problem, and that documenting gaps is itself a trust practice. (No survey of top-site conformance was conducted; the earlier "rare even at the top" generalization is retracted.)

### Tier 2 — Strong professional execution (clears the floor, earns trust, converts)

- A coherent design system: consistent components, spacing scale, type hierarchy (~3 sizes), limited palette with stable color-meaning [FD-10, VP]
- Visual hierarchy expressing information priority, not drama [VP-1]
- Content architecture matched to the audience's mental model; plain language even for expert readers [L2-02]
- Credibility engineering: verifiable claims, restrained promotion (objective copy measurably outperformed promotional "marketese" in the 1997 study — direction only, per FD-03's never-quote-the-magnitude rule; the earlier "−27%" figure was a sign-flipped derivation and is retracted, refuter-2 F8), visible expertise [FD-03, FD-09]
- Conversion paths that respect the user: clear CTAs, transparent pricing, low-friction booking/contact [L5-03]
- Iteration against evidence — analytics, benchmarks, or tests — rather than taste alone [L5-02]
- Craft in the details: alignment, spacing rhythm, polish (VisAWI craftsmanship; "nothing arbitrary") [L3-01, FD-12]
This tier is where most good professional sites live. It is fully achievable by discipline alone; nothing here requires creative brilliance. It earns quiet trust — but not "wow," and not memory.

### Tier 3 — Distinctive excellence (memorable, archetype-true, still floor-clean)

- **A one-sentence signature idea** that all four layers (content, visuals, interaction, engineering) reinforce — this program's design heuristic, constructible for every corpus exemplar, though unfalsifiable as a universal law [L1-01: unclear as universal; supported as analysis]
- **Congruence:** the signature is earned by and true of the organization — imitated signatures fail ("the magic evaporates"); trend adoption (Linear-Look, Stripe-alikes) yields polished genericness [L1-04, RF-06]
- **Archetype truth** (design hypothesis — L8-04 is `unclear`; transplant failures were argued, not tested): the signature speaks the archetype's success language — service culture for commerce (Nordstrom), triage for health (NHS), disappearing interface for government (GOV.UK), method-as-manifesto for pro tools (Linear)
- **Voice:** writing that no competitor could publish unchanged
- **Deliberate convention-breaking:** at most one or two conventions broken, deliberately, in the brand layer, with the mechanics layer left conventional [FD-04 nuance, RF-02]
- Craft detail sufficient that professionals notice (this is what award juries actually certify [L5-01])

### Tier 4 — The defensible "wow" ceiling

This program's chosen wow target — a **normative design heuristic, not the one established form of wow** [W-02; rivals held open in §1a] — is **a signature moment that demonstrates the site's thesis: proof-by-experience**. Corpus readings consistent with it:
- Bruno Simon: driving the car IS the WebGL credential.
- Stripe: the gradient + micro-interaction rigor IS the "we sweat details with your money" argument.
- The Pudding: scroll-paced data-as-biography IS the journalism.
- Stripe Docs: your own API key in the copy-paste sample IS the developer empathy.
- GOV.UK: the interface disappearing IS the institutional promise ("do the hard work to make it simple").
- Apple: capability demonstrated (zoom photos, 3D viewers), not listed — though its genre carries a documented scrolljacking record as the cost of pacing control [HU-4].

Conditions that keep the ceiling defensible (each is a supported constraint):
1. The wow moment sits **after** the floor: reduced-motion parity, pause/stop/hide, JS-fallback content, CWV budget held [L4-05, L6-01/02/04]
2. The wow moment is **the argument**, not an interruption of it [W-02]
3. It's **archetype-gated**: the same moment that elevates a portfolio harms a utility [RF-07]
4. It **survives the second visit**: returning users can bypass it (a mandatory playful loader is friction on visit two [corpus: Don't Board Me])
5. Its **cost is measured**: motion and 3D are performance debt and vestibular risk until proven otherwise [RF-03]

What produces *fake, fragile, or counterproductive* wow (all evidenced): spectacle detached from thesis (Snow Fall imitators — effects without the reporting); trend imitation (polished genericness); scrolljacking and auto-motion (disorientation, ad-blindness, exclusion of motion-sensitive users); splash-style delay that spends the 10-second window before communicating value; awards-bait optimizing a juror's 30-second visit over a user's task [RF-01..RF-07, L4-01..03, FD-02].

## Section 2 — The sealed scoring rubric (verbatim: evals/validation/e1/PREREG-RUBRIC-utility.md)

# E1 pre-registered rubric — utility archetype

**Status: APPROVED & SEALED (owner, 2026-07-26 — approval recorded in the seal/amendment commit messages; status line flipped 2026-07-26 per Codex critique finding 5). Sealed by commit before any generation.**
Date drafted: 2026-07-26. Required by artifact 14 (E3 precondition, applied to
E1's utility brief; RF-8: rubrics are archetype-specific).

**Evidence label (RF-1/RF-4, non-negotiable):** every score produced under this
sheet is *system-esteem* — conformance to this constructed standard, judged by
model jurors. It is not user-outcome evidence and never ground truth; external
calibration is E4's job, behavioral signal E5's.

## What gets scored

The rubric is applied to **all three arms' final candidates** (winner and
losers, for the record). The PASS bar below applies to the **winner**.
Precondition to scoring at all: every shipped HARD Layer-1 gate green and the
4-mutant ritual recorded (a machine FAIL cannot be argued past — gates-and-loop
seam rule).

## Criteria (each scored 0–10, integers)

Section A — fundamentals (weighted equal to distinction on purpose: fundamentals
before spectacle):

1. **Task speed / glanceability.** A first-time phone visitor can answer "can I
   hike today, and where" without interaction beyond scrolling; overall network
   state and the active alert are visible in the first viewport on mobile.
2. **Status legibility & color-meaning stability.** open / caution / closed /
   unreported are distinguishable without relying on color alone; each status
   keeps one stable meaning and rendering everywhere it appears.
3. **Data honesty surface.** Unreported trails read as unknown (never as open or
   silently omitted); the null history day is an explicit gap; the estimated
   snowpack value is visibly flagged; timestamps show data age.
4. **Information architecture & language.** Grouping and order match a hiker's
   decision (what's open → what changed → details); plain language; no jargon,
   no marketese (objective-copy rule, Tier-2).
5. **Craft discipline.** Consistent spacing rhythm, alignment, type hierarchy
   (~3 sizes), limited palette; nothing arbitrary.
6. **Resilience of the layout to the data.** Long trail names, the closed/burn
   cluster, and both unreported rows sit in the layout without breakage or
   awkward emphasis; light and dark modes both fully resolved.

Section B — archetype-true distinction (Tier-3 probes, utility-gated):

7. **Signature idea.** A one-sentence signature that content, visuals, and
   interaction all reinforce, and that is true of a trail-conditions service —
   not a transplanted trend (RF-6).
8. **Novelty budget.** Mechanics stay conventional; at most 1–2 deliberate
   convention breaks, in the brand layer only (RF-2).
9. **Voice.** Microcopy a competitor's page could not publish unchanged, while
   staying calm and factual.
10. **Second-visit value.** The page rewards the habitual daily glance; nothing
    mandatory-playful, no friction a returning user cannot bypass (RF-7 —
    utility register: glance value outranks spectacle).

Score anchors: 0–2 broken · 3–4 below professional · 5–6 professional baseline
· 7–8 strong professional (Tier-2) · 9–10 distinctive-excellence signal
(system-esteem only).

## Evaluator rule

- **Panel:** 5 model jurors, fresh contexts, no discussion round, no sight of
  each other's scores.
- **Juror inputs, exactly:** this rubric sheet; the sealed brief + data file;
  the full render matrix per arm (desktop/mobile × light/dark); Layer-1 gate
  outputs. Nothing else — no PixelHelm docs, no knowledge of which arm the
  system prefers, arms presented in per-juror shuffled order under neutral
  labels (order seeds recorded).
- **Output:** one JSON per juror per arm — each criterion's integer score plus a
  rationale of at most two sentences — written via the judge-record machinery
  (P0-5) and committed.
- **Aggregation:** per-criterion score = median of the 5 jurors; overall =
  median of the 10 criterion medians. No means, no weights.

## PASS bar (owner-set 2026-07-26, superseding the 5/7 draft; fixed now)

The winner PASSES iff all three hold:

1. every shipped HARD Layer-1 gate green + mutant ritual recorded (precondition);
2. **no criterion median below 6**;
3. **overall median ≥ 8**.

Owner intent recorded with the bar: the fundamentals are the BASE, not the
target — clause 2 applying to Section B makes distinction mandatory (a
bland-but-solid output cannot pass), and clause 3 sits at the top of the
strong-professional band. Consequence accepted in advance: a FAIL verdict
against this bar is reported as FAIL, and it does not void E1 itself — E1's own
success criterion is the complete evidenced loop, while this bar governs what
may be *claimed* about the output's quality.

A criterion median of 9+ is recorded as a Tier-3 signal, claimable only as
system-esteem. The rubric only MEASURES creativity — the machinery that pushes
for it lives upstream (the three-arm tournament, the direction intents, and the
pre-registered divergence thresholds in `PREREG-METRICS-divergence.md`) and in
the fingerprint registry that bans generic tells. Jurors score 9–10 whenever
earned; the anchors do not treat the top of the scale as unreachable. No juror rationale, score, or verdict may be drafted, predicted,
or "anticipated" anywhere before the panel actually runs (method law; the
refuter-anchoring lesson).

## Section 3 — The four candidates (neutral labels; order fixed for you)

Each candidate is one design, rendered at desktop (1440px) and mobile (375px)
widths in both light and dark modes. View EVERY listed file of a candidate
before scoring it, then read the floor outputs printed beneath its files. File
paths are relative to your working directory.

### candidate-1

- jurors-blind/e1-utility/juror-4/candidate-1__desktop__light.png
- jurors-blind/e1-utility/juror-4/candidate-1__desktop__dark.png
- jurors-blind/e1-utility/juror-4/candidate-1__mobile__light.png
- jurors-blind/e1-utility/juror-4/candidate-1__mobile__dark.png

```
FLOOR OUTPUTS for this candidate — the machine gate records themselves, quoted.

- static-gates — declared token pairs recomputed for WCAG AA contrast, light and dark
  file: static-gates.json
  hardGatesPassed: true
  contrast: hard=true ran=true pass=true over 12 pair(s)
  rawColor: hard=false ran=true pass=true
  antiCliche: hard=false ran=true pass=true
  webCraft: hard=false ran=true pass=true
  typeScale: hard=false ran=false (did not run; not a pass)

- check-token-contracts — the page's own embedded token contract recomputed for AA
  file: token-contract.txt
  (path withheld for blinding): PASS — 12 pass / 0 fail / 0 unresolvable (pairs×modes)

- output-floor-gate — structural floor: landmarks, heading hierarchy, meta description
  file: output-floor.json
  pass: true
  [warn] landmark-aux: no header/nav landmark(s) — confirm the page genuinely has no banner/navigation/footer content

- derived-claims-gate — honesty A: every number on the rendered page traces to the sealed data
  file: gate-a-derived-claims.json
  pass: true

- content-manifest-gate — honesty B: every required content item is present in both modes
  file: gate-b-manifest.json
  pass: true

- verify_responsive — reflow: horizontal overflow at 280 / 320 / 414 px
  file: verify_responsive.json
  pass: true

- verify_states — real-render contrast in default / hover / focus, both modes
  file: verify_states.json
  pass: true

- verify_targetsize — interactive target size, WCAG 2.5.8
  file: verify_targetsize.json
  pass: true

- verify_focustrap — dialog keyboard trap: semantics, Tab confinement, Escape release
  file: verify_focustrap.json
  applicable: false (this is not a pass; the check did not apply to this page)
  pass: true
  [info] applicability: no dialog / [role=dialog] / [aria-modal] element on this page — nothing to verify

- Gates that did NOT run for this candidate (named so that silence is not read as a pass):
  verify_keyboard (keyboard traversal capture)
  verify_scrollcapture (deterministic scroll-position capture)
  verify_frametime (frame-time percentiles against a lab budget)
  verify_cwv (lab LCP / CLS / INP-proxy capture)

SUMMARY: every hard gate that ran exited clean for this candidate.
```

### candidate-2

- jurors-blind/e1-utility/juror-4/candidate-2__desktop__light.png
- jurors-blind/e1-utility/juror-4/candidate-2__desktop__dark.png
- jurors-blind/e1-utility/juror-4/candidate-2__mobile__light.png
- jurors-blind/e1-utility/juror-4/candidate-2__mobile__dark.png

```
FLOOR OUTPUTS for this candidate — the machine gate records themselves, quoted.

- static-gates — declared token pairs recomputed for WCAG AA contrast, light and dark
  file: static-gates.json
  hardGatesPassed: true
  contrast: hard=true ran=true pass=true over 42 pair(s)
  rawColor: hard=false ran=true pass=true
  antiCliche: hard=false ran=true pass=true
  webCraft: hard=false ran=true pass=true
  typeScale: hard=false ran=false (did not run; not a pass)

- check-token-contracts — the page's own embedded token contract recomputed for AA
  file: token-contract.txt
  (path withheld for blinding): PASS — 42 pass / 0 fail / 0 unresolvable (pairs×modes)

- output-floor-gate — structural floor: landmarks, heading hierarchy, meta description
  file: output-floor.json
  pass: true
  [warn] landmark-aux: no nav landmark(s) — confirm the page genuinely has no banner/navigation/footer content

- derived-claims-gate — honesty A: every number on the rendered page traces to the sealed data
  file: gate-a-derived-claims.json
  pass: true

- content-manifest-gate — honesty B: every required content item is present in both modes
  file: gate-b-manifest.json
  pass: true

- verify_responsive — reflow: horizontal overflow at 280 / 320 / 414 px
  file: verify_responsive.json
  pass: true

- verify_states — real-render contrast in default / hover / focus, both modes
  file: verify_states.json
  pass: true

- verify_targetsize — interactive target size, WCAG 2.5.8
  file: verify_targetsize.json
  pass: true

- verify_focustrap — dialog keyboard trap: semantics, Tab confinement, Escape release
  file: verify_focustrap.json
  applicable: false (this is not a pass; the check did not apply to this page)
  pass: true
  [info] applicability: no dialog / [role=dialog] / [aria-modal] element on this page — nothing to verify

- Gates that did NOT run for this candidate (named so that silence is not read as a pass):
  verify_keyboard (keyboard traversal capture)
  verify_scrollcapture (deterministic scroll-position capture)
  verify_frametime (frame-time percentiles against a lab budget)
  verify_cwv (lab LCP / CLS / INP-proxy capture)

SUMMARY: every hard gate that ran exited clean for this candidate.
```

### candidate-3

- jurors-blind/e1-utility/juror-4/candidate-3__desktop__light.png
- jurors-blind/e1-utility/juror-4/candidate-3__desktop__dark.png
- jurors-blind/e1-utility/juror-4/candidate-3__mobile__light.png
- jurors-blind/e1-utility/juror-4/candidate-3__mobile__dark.png

```
FLOOR OUTPUTS for this candidate — the machine gate records themselves, quoted.

- static-gates — declared token pairs recomputed for WCAG AA contrast, light and dark
  file: static-gates.json
  hardGatesPassed: true
  contrast: hard=true ran=true pass=true over 14 pair(s)
  rawColor: hard=false ran=true pass=true
  antiCliche: hard=false ran=true pass=true
  webCraft: hard=false ran=true pass=true
  typeScale: hard=false ran=false (did not run; not a pass)

- check-token-contracts — the page's own embedded token contract recomputed for AA
  file: token-contract.txt
  (path withheld for blinding): PASS — 14 pass / 0 fail / 0 unresolvable (pairs×modes)

- output-floor-gate — structural floor: landmarks, heading hierarchy, meta description
  file: output-floor.json
  pass: true
  [warn] landmark-aux: no nav landmark(s) — confirm the page genuinely has no banner/navigation/footer content

- derived-claims-gate — honesty A: every number on the rendered page traces to the sealed data
  file: gate-a-derived-claims.json
  pass: true

- content-manifest-gate — honesty B: every required content item is present in both modes
  file: gate-b-manifest.json
  pass: true

- verify_responsive — reflow: horizontal overflow at 280 / 320 / 414 px
  file: verify_responsive.json
  pass: true

- verify_states — real-render contrast in default / hover / focus, both modes
  file: verify_states.json
  pass: true

- verify_targetsize — interactive target size, WCAG 2.5.8
  file: verify_targetsize.json
  pass: true

- verify_focustrap — dialog keyboard trap: semantics, Tab confinement, Escape release
  file: verify_focustrap.json
  applicable: false (this is not a pass; the check did not apply to this page)
  pass: true
  [info] applicability: no dialog / [role=dialog] / [aria-modal] element on this page — nothing to verify

- Gates that did NOT run for this candidate (named so that silence is not read as a pass):
  verify_keyboard (keyboard traversal capture)
  verify_scrollcapture (deterministic scroll-position capture)
  verify_frametime (frame-time percentiles against a lab budget)
  verify_cwv (lab LCP / CLS / INP-proxy capture)

SUMMARY: every hard gate that ran exited clean for this candidate.
```

### candidate-4

- jurors-blind/e1-utility/juror-4/candidate-4__desktop__light.png
- jurors-blind/e1-utility/juror-4/candidate-4__desktop__dark.png
- jurors-blind/e1-utility/juror-4/candidate-4__mobile__light.png
- jurors-blind/e1-utility/juror-4/candidate-4__mobile__dark.png

```
FLOOR OUTPUTS for this candidate — the machine gate records themselves, quoted.

- static-gates — declared token pairs recomputed for WCAG AA contrast, light and dark
  file: static-gates.json
  hardGatesPassed: true
  contrast: hard=true ran=true pass=true over 14 pair(s)
  rawColor: hard=false ran=true pass=true
  antiCliche: hard=false ran=true pass=true
  webCraft: hard=false ran=true pass=true
  typeScale: hard=false ran=false (did not run; not a pass)

- check-token-contracts — the page's own embedded token contract recomputed for AA
  file: token-contract.txt
  (path withheld for blinding): PASS — 14 pass / 0 fail / 0 unresolvable (pairs×modes)

- output-floor-gate — structural floor: landmarks, heading hierarchy, meta description
  file: output-floor.json
  pass: true
  [warn] landmark-aux: no nav landmark(s) — confirm the page genuinely has no banner/navigation/footer content

- derived-claims-gate — honesty A: every number on the rendered page traces to the sealed data
  file: gate-a-derived-claims.json
  pass: true

- content-manifest-gate — honesty B: every required content item is present in both modes
  file: gate-b-manifest.json
  pass: true

- verify_responsive — reflow: horizontal overflow at 280 / 320 / 414 px
  file: verify_responsive.json
  pass: false
  [fail] 280px: overflow 56px
  [fail] 320px: overflow 16px

- verify_states — real-render contrast in default / hover / focus, both modes
  file: verify_states.json
  pass: true

- verify_targetsize — interactive target size, WCAG 2.5.8
  file: verify_targetsize.json
  pass: true

- verify_focustrap — dialog keyboard trap: semantics, Tab confinement, Escape release
  file: verify_focustrap.json
  applicable: false (this is not a pass; the check did not apply to this page)
  pass: true
  [info] applicability: no dialog / [role=dialog] / [aria-modal] element on this page — nothing to verify

- Gates that did NOT run for this candidate (named so that silence is not read as a pass):
  verify_keyboard (keyboard traversal capture)
  verify_scrollcapture (deterministic scroll-position capture)
  verify_frametime (frame-time percentiles against a lab budget)
  verify_cwv (lab LCP / CLS / INP-proxy capture)

SUMMARY: at least one HARD gate FAILED for this candidate.
```

## Section 4 — Your output (return EXACTLY this JSON, nothing else)

For every candidate whose floor outputs are clean, score every rubric criterion
(integers 0-10, the rubric's anchors) with a rationale of AT MOST TWO sentences
each (one is preferred; never more than two; avoid abbreviations that end in a
period), and set "unscored": false and "failingGate": null.

For every candidate whose floor outputs show a hard gate FAILURE, set
"unscored": true, set "failingGate" to that gate's name, leave "scores" and
"rationales" as empty objects, and leave that candidate out of "ranking".

Then give a STRICT ranking, best first, no ties, of the SCORED candidates only.
Return ONLY this JSON object as your final message, no markdown fences. The
shape below shows all four candidates scored; adjust it to what you actually
found.

```json
{
  "juror": "juror-4",
  "set": "e1-utility",
  "candidates": {
    "candidate-1": {
      "unscored": false,
      "failingGate": null,
      "scores": {
        "1": 0,
        "2": 0,
        "3": 0,
        "4": 0,
        "5": 0,
        "6": 0,
        "7": 0,
        "8": 0,
        "9": 0,
        "10": 0
      },
      "rationales": {
        "1": "…",
        "2": "…",
        "3": "…",
        "4": "…",
        "5": "…",
        "6": "…",
        "7": "…",
        "8": "…",
        "9": "…",
        "10": "…"
      }
    },
    "candidate-2": {
      "unscored": false,
      "failingGate": null,
      "scores": {
        "1": 0,
        "2": 0,
        "3": 0,
        "4": 0,
        "5": 0,
        "6": 0,
        "7": 0,
        "8": 0,
        "9": 0,
        "10": 0
      },
      "rationales": {
        "1": "…",
        "2": "…",
        "3": "…",
        "4": "…",
        "5": "…",
        "6": "…",
        "7": "…",
        "8": "…",
        "9": "…",
        "10": "…"
      }
    },
    "candidate-3": {
      "unscored": false,
      "failingGate": null,
      "scores": {
        "1": 0,
        "2": 0,
        "3": 0,
        "4": 0,
        "5": 0,
        "6": 0,
        "7": 0,
        "8": 0,
        "9": 0,
        "10": 0
      },
      "rationales": {
        "1": "…",
        "2": "…",
        "3": "…",
        "4": "…",
        "5": "…",
        "6": "…",
        "7": "…",
        "8": "…",
        "9": "…",
        "10": "…"
      }
    },
    "candidate-4": {
      "unscored": false,
      "failingGate": null,
      "scores": {
        "1": 0,
        "2": 0,
        "3": 0,
        "4": 0,
        "5": 0,
        "6": 0,
        "7": 0,
        "8": 0,
        "9": 0,
        "10": 0
      },
      "rationales": {
        "1": "…",
        "2": "…",
        "3": "…",
        "4": "…",
        "5": "…",
        "6": "…",
        "7": "…",
        "8": "…",
        "9": "…",
        "10": "…"
      }
    }
  },
  "ranking": [
    "candidate-1",
    "candidate-2",
    "candidate-3"
  ]
}
```

