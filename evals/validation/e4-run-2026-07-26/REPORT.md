# E4 run report — external calibration of the internal judging seat (RF-4 closure)

Run date: 2026-07-26 (panels executed in the early hours of 2026-07-27 local;
artifacts carry the run date). Sealed protocol:
`evals/validation/PREREG-E4-CALIBRATION.md` (owner-approved, sealed before this
run). Evidence bar: E1 critique findings 1 and 4
(`evals/validation/e1/run-2026-07-26/CRITIQUE-RESPONSE.md`), first run under
the `pixelhelm/juror-record@1` machinery.

## Verdict against the registered thresholds (no reframing)

| Registered threshold (verbatim from the sealed sheet) | Measured value | Verdict |
|---|---|---|
| Agreement: Kendall's tau between the internal panel's candidate ranking and the external panel's aggregate ranking, pooled over the four judged sets (12 ranked pairs, real candidates only, tau-b for ties). **Threshold: τ ≥ 0.5.** | **τ-b = 0.632** (C=4, D=0, n0=12, tied-internal n1=8, tied-external n2=2; (C−D)/√((n0−n1)(n0−n2)) = 4/√40) | **PASS** |
| Inflation: mean(internal overall median − external overall median) per candidate, pooled. **Acceptable bound: \|inflation\| ≤ 1.5 points.** | **+0.625** (12 real candidates; every non-zero term is internal-hotter) | **PASS** |
| Adversarial seed: **every planted flaw is caught** — the plant may not win any set, and at least one juror (or the floor battery, which runs on plants too) must surface its defect class. | Defect class surfaced: **4 of 4** (floor battery caught all four; jurors additionally surfaced 3 of 4). Plant may not win any set: **VIOLATED** — the e1 plant **won its set** on the external aggregate (9.0 vs 8.5); the commerce plant tied for top (8.0, three-way). | **FAIL** |

**Success/falsification clause, applied verbatim:** "Falsified if: τ below
threshold, inflation beyond bound, or any planted flaw wins — the internal
judging seat is then demoted to advisory-only until repaired, and no Tier-3
claim may rest on internal scores alone."

**E4 outcome: FALSIFIED on the plant criterion.** A planted flaw won a set.
Per the sealed consequence, the internal judging seat is demoted to
advisory-only until repaired, and no Tier-3 claim may rest on internal scores
alone. The two agreement metrics passing does not soften this: the sealed
clause is disjunctive.

What the falsification actually shows, stated precisely: five independent
render-only jurors rated a candidate carrying a real WCAG AA text-contrast
failure (3.12:1 muted metadata ink, light mode) at the top of the E1 set, and
no juror surfaced the contrast defect. The committed floor battery caught it
three ways (token-contract AA recompute FAIL, static-gates hard contrast FAIL,
axe 2 serious). The render-judged panel seat and the machine floor seat are
therefore NOT redundant: juror esteem, internal or external, does not police
the floor. The floor battery held; the judging seat (in both contexts) did
not.

## The four sets: internal vs external

External aggregation used the same registered rule as the internal panels
(per-criterion median of 5 jurors; overall = median of the 10 criterion
medians; no means, no weights). Internal values are the committed
`panel-results.json` of each judged run; external values are this run's
`jurors/<set>/panel-results.json`. Plants are excluded from τ and inflation by
the sealed sheet.

### Set 1 — e1/run-2026-07-26 (utility, plant: switchback)

| Candidate | Internal overall | External overall | External rank |
|---|---|---|---|
| **switchback (PLANT)** | — | **9.0** | **1 (won the set)** |
| trail-ledger (internal winner) | 9.0 | 8.5 | 2 |
| first-light | 9.0 | 8.0 | 3 |
| status-board | 8.0 | 7.0 | 4 |

Plant defect: real AA contrast failure. Caught by the floor battery
(`plants/e1-utility/gates/`); surfaced by **no juror** (the two automated scan
hits in `stats/stats-results.json` are keyword false positives on inspection:
"a faint stray rule artifact" and "expresses it far more faintly" are not
contrast findings). Per-juror strict rankings placed the plant FIRST for
three of five jurors, second for one, third for one — the plant's external
win is a genuine majority preference, not a median artifact.

### Set 2 — e3/run-2026-07-26-saas (SaaS marketing, plant: day-rate)

| Candidate | Internal overall | External overall | External rank |
|---|---|---|---|
| worked-invoice (internal winner) | 9.0 | 9.0 | 1 |
| fair-quote | 9.0 | 8.5 | 2 |
| driveway-to-paid | 8.0 | 8.0 | 3 (tied medians with plant) |
| **day-rate (PLANT)** | — | **8.0** | 3 (tied medians; strict rankings: third for three jurors, last for two) |

Plant defect: invented statistic ("98% of invoices ... paid within 7 days",
not in the sealed data). Caught by gate-a FABRICATION
(`plants/e3-saas/gates/gate-a-derived-claims.json`, both modes) AND surfaced
by all five jurors by direct reading of the committed rationales (criterion 2
or 6: "presented flat with no basis shown", "a bare fact with no stated
basis", "no stated basis beside it", "carries no stated basis", "presented
bare with no visible source or qualifier"). Notably, no juror could check the
number against the sealed data (they did not have it); they flagged the
missing basis, not the fabrication itself — the fabrication check remains
machine-only evidence.

### Set 3 — e3/run-2026-07-26 (commerce, both surfaces, plant: potting-bench)

| Candidate | Internal overall | External overall | External rank |
|---|---|---|---|
| packet-rack (internal winner) | 9.0 | 8.0 | 1 (three-way tie) |
| sowing-almanac | 9.0 | 8.0 | 1 (three-way tie) |
| **potting-bench (PLANT)** | — | **8.0** | **1 (three-way tie for top)** |
| seed-annual | 9.0 | 7.5 | 4 |

Plant defect: WCAG 2.2 2.5.8 target-size floor failure (18px stepper cluster,
2px gaps, both surfaces). Caught by verify_targetsize
(`plants/e3-commerce/gates/verify_targetsize.json`: 6 catalog + 1 product
violations) AND surfaced by all five jurors ("the minus, plus, and add
controls are small targets", "tiny minus, plus, and Add targets fall below
comfortable tablet sizes for older readers", etc.). The plant did not strictly
win, and no juror ranked it first (strict rankings: third for three jurors,
fourth for two), but it tied the top median; the sealed falsifier speaks of a plant that
"wins", which this run reads as strictly-top — the tie is reported here
unreframed so the coordinator can apply the stricter reading if intended.
Jurors also found a real mobile-reflow defect in the plant (one-word-per-line
wrapping on two catalog rows) that the shipped verify_responsive gate (which
tests overflow, not wrap quality) did not flag: an unplanted defect honestly
found by the panel and missed by the battery.

### Set 4 — e3/run-2026-07-26-editorial (editorial, plant: high-water)

| Candidate | Internal overall | External overall | External rank |
|---|---|---|---|
| almanac-rail | 9.0 | 9.0 | 1 |
| weir-plates (internal winner) | 9.0 | 8.5 | 2 (tied) |
| two-inks | 9.0 | 8.5 | 2 (tied) |
| **high-water (PLANT)** | — | **7.0** | **4 (last)** |

Plant defect: the sealed data's unverified 2019 outlier presented as verified
(VERIFIED stamp, suppressed label). Caught by gate-a VERDICT and gate-b
MISSING (`plants/e3-editorial/gates/`) AND surfaced by all five jurors, most
with direct criterion-3 scores of 1–2 ("stamps the 2019 reading VERIFIED ...
inverting the unverified status the record assigns it"). This is the panel
seat working exactly as intended — because the rubric sheet names the trap,
jurors could see the inversion in the renders.

## Inflation detail (pooled mean +0.625)

Per-candidate terms (internal − external): trail-ledger +0.5, status-board
+1.0, first-light +1.0, worked-invoice 0, driveway-to-paid 0, fair-quote
+0.5, seed-annual +1.5, packet-rack +1.0, sowing-almanac +1.0, weir-plates
+0.5, two-inks +0.5, almanac-rail 0. Every non-zero term is internal-hotter;
none crosses the 1.5 bound individually (seed-annual sits exactly at it). The
E1 owner-vs-panel offset (≈ +1.0) was the registered reference point; the
external panel lands between the internal panel and the owner, consistent
with the C1 calibration finding.

## Owner-calibration context (context ONLY — input to no juror, no statistic)

The owner's own scores for these four sets were approximately 8.5 (E1 pass2)
/ 6 (saas, rejected) / 6 (commerce, rejected) / 7 (editorial,
approved-with-changes) against internal medians of ~9 across the board. This
external panel (8.0–9.0 per-set winners) sits closer to the internal panel
than to the owner. Two model-panel contexts agreeing with each other while
both sitting well above the owner is exactly the pattern the scope-honesty
clause warns about; it is recorded here as context and used in no
computation.

## Scope honesty (carried verbatim from the sealed sheet)

> Agreement between two model-panel contexts sharing one constructed standard
> measures *inter-context consistency of that standard*, NOT validity against
> real audiences — only E5/Stage-12 data speak to that. Catching planted floor
> defects validates the floor seat, not creative ranking. Both limits carry
> into any report of E4 results.

Applied to this run: the passing τ and inflation numbers say the constructed
standard travels across contexts; they say nothing about real audiences. The
plant result validates (and was only saved by) the floor seat; it says
nothing good or bad about creative ranking except that render-judged panels
do not police the floor.

## Method (what each juror actually received, and how it is evidenced)

- Inputs per juror, exactly (sealed sheet (a)): the Phase-1 dossier's tier
  definitions, copied verbatim with provenance
  (`jurors/TIER-DEFINITIONS-VERBATIM.md`, section 2 of
  "05-WHAT-MAKES-A-WEBSITE-EXCEPTIONAL-DOSSIER.md",
  portfolio-capability-research outputs, 2026-07-26); the set's sealed rubric
  sheet verbatim; the renders of 4 candidates (3 real + 1 plant) under
  neutral shuffled labels. No PixelHelm docs, no gate outputs, no internal
  scores, no sealed data files.
- Blindness: fresh-context subagents, one per juror, no sight of each other.
  Per-juror Fisher-Yates shuffles (mulberry32), seeds recorded in
  `jurors/<set>/blind-map.json` (202607611–645, disjoint from all prior
  committed ranges).
- Verbatim-input evidence (finding 4 closure): each juror's full input
  transcript is committed (`jurors/<set>/juror-N-transcript.md`) and its
  sha256 is carried inside every one of that juror's records. Delivery
  mechanism: a fixed bootstrap prompt (committed verbatim,
  `jurors/BOOTSTRAP-PROMPT.txt`) pointed the juror at its transcript file;
  the juror's complete input = bootstrap + transcript + the listed render
  files. The neutral-named render copies themselves are byte-identical
  duplicates of committed renders, bound file-by-file by sha256 in
  `jurors/<set>/blind-manifest.json`; the duplicates lived untracked at the
  repo root during judging and were deleted after (committing 5 copies of
  every render would have added ~160 MB of duplicated binaries).
- Per-juror records (finding 1 closure): 80 schema-valid
  `pixelhelm/juror-record@1` files (one per juror per candidate) written via
  `src/skills/pixelhelm-loop/scripts/records.mjs` into `.pixelhelm/jurors/`;
  the writer validated all 80 with zero refusals.
- Raw outputs: each juror's final message is committed verbatim under
  `jurors/<set>/raw/` (one juror prefixed a prose line before its JSON; the
  file keeps it, parsers tolerate it).
- Aggregation: the registered internal rule applied unchanged to the
  external panel. Internal rankings for τ are the committed internal overall
  medians with ties intact (the sealed sheet's tau-b clause is what handles
  ties); the E1/E3 winner tie-breaks decided verdict crowns, not rankings,
  and are not used here.
- Plants: authored first; sealed note's sha256 committed before any judging
  (commit ce88c8d); note text committed only after all verdicts
  (`plants/SEALED-PLANT-NOTE.md`, hash re-verified at commit time). Page
  identity asserted before any render or measurement (L-081,
  `plants/identity.json`). Floor battery = the same committed gates and
  honesty configs the sets' real arms faced, run as-produced; all outputs
  committed under `plants/<set>/gates/`, path-redacted.
- Statistics: `stats/compute-e4-stats.mjs`, committed and cited by sha256 in
  the run record (`.pixelhelm/runs/2026-07-26--e4-external-calibration--run.json`),
  results in `stats/stats-results.json`.

## Deviations and honest notes (complete list)

1. **Pre-judging plant repairs (before any render reached a juror).**
   (a) saas `day-rate`: a markup bug made the BETA label fail its word
   boundary ("BETAstill"), and one phrase ("not counted in the price") was
   not data-backed; both fixed, re-rendered, battery re-run. (b) commerce
   `potting-bench`: at the authored 4px gaps the shipped target-size gate's
   spacing exception legitimately held, meaning the plant carried NO real
   floor defect; the gap was tightened to 2px so the registered defect
   mechanism ("the tight cluster defeats the spacing exception") is true
   under the shipped gate, and an accidental hover-contrast failure was
   repaired. The sealed plant note (hash-committed before these repairs)
   says "4px gaps"; the shipped plant uses 2px. The note's defect class and
   mechanism are unchanged; the numeric detail diverges and is disclosed
   here rather than by editing the sealed note.
2. **Sealed-note staging slip.** The plant-note file was accidentally staged
   into the renders commit and removed by amending that unpushed commit
   minutes later, before any judging; the hash commit (ce88c8d) was never
   touched. Final state matches the protocol: hash before judging, note text
   after all verdicts.
3. **Automated defect-surfacing scan is noisy.** The keyword hits recorded in
   `stats-results.json` include false positives (e.g. "metaphor" contains
   "tap"; "faint" matched non-contrast remarks). The per-set surfacing
   verdicts in this report are by direct reading of the committed rationales;
   the e1 contrast defect was surfaced by NO juror despite the scan's 2 hits.
4. **Commerce plant tie-for-top.** Reported under the strictly-wins reading
   of the falsifier; the tie itself is stated so the stricter reading can be
   applied by the coordinator. E4 is falsified either way via the e1 plant.
5. **Wall-clock crossing midnight.** Panels ran after local midnight into
   2026-07-27; artifacts carry the run date 2026-07-26. The run record's
   measured wall-clock covers first-commit-to-record only.
6. **Rubric text seen by jurors includes internal references.** The sealed
   sheets themselves mention internal machinery (e.g. gate outputs, records);
   the sealed E4 input list includes the sheets verbatim, so they were given
   unedited, with a neutral instruction that materials the rubric references
   beyond the three inputs are intentionally absent. That instruction is part
   of every committed transcript.
7. **Unplanted defect found by the panel.** The commerce plant's mobile
   catalog has a real one-word-per-line wrap defect on two rows that the
   shipped battery does not test for; jurors found it. Recorded as honest
   evidence about both seats, and as a candidate gate gap (wrap-quality is
   not overflow).

## Program consequences (per the sealed sheet, not new policy)

- The internal judging seat is demoted to advisory-only until repaired; no
  Tier-3 claim may rest on internal scores alone. The demotion binds the
  EXTERNAL render-judged panel seat identically in spirit: the failure mode
  demonstrated (esteem does not police the floor) is a property of
  render-judged model panels, not of the internal context specifically.
- The floor battery's standing is strengthened: it caught all four planted
  defects deterministically, including two (contrast, fabrication) that no
  juror or almost no juror could see.
- Candidate repair directions for the judging seat (advisory, for the owner):
  give panels the floor-battery outputs (the E1-internal design did this; the
  E4-external design deliberately did not), or make floor-clean status a
  hard precondition for esteem scoring rather than a parallel seat.

## Artifact index

- Sealed protocol: `../PREREG-E4-CALIBRATION.md` (untouched)
- Plants + battery: `plants/` (5 pages, 20 render cells, full gate outputs,
  `identity.json`, `SEALED-PLANT-NOTE.md` + pre-judging `.sha256`)
- Panels: `jurors/` (20 verbatim transcripts, bootstrap prompt, tier
  definitions verbatim, 4 blind maps with seeds, 4 sha256 blind manifests,
  20 verbatim raw outputs, 4 external panel-results)
- Records: `.pixelhelm/jurors/` (80 juror-records), `.pixelhelm/runs/` (run@1)
- Statistics: `stats/compute-e4-stats.mjs` + `stats/stats-results.json`
