# E2 pre-registered divergence metrics (measured inside E1)

**Status: APPROVED & SEALED (owner, 2026-07-26 — approval recorded in the seal/amendment commit messages; status line flipped 2026-07-26 per Codex critique finding 5). Sealed by commit before ANY candidate
is generated — this experiment's integrity IS the pre-registration (critic-2 D7).**
Date drafted: 2026-07-26.

Applies to the three direction arms of the E1 tournament. **E2 is falsified if
any threshold below fails.** Scope honesty, carried verbatim from artifact 14:
passing shows *measured difference between arms* — necessary but not sufficient
for "meaningful creative divergence"; the stronger property is only probed by E5.

## (a) Palette distance

- **Color set per arm:** the **five most-used color tokens**, usage = count of
  references to the token name across the arm's committed stylesheets and
  markup, counted by a deterministic script committed with the run; ties broken
  by alphabetical token name.
- **Distance per arm pair:** CIEDE2000 (ΔE00) under D65/2°, computed over a
  **minimum-cost perfect matching** (optimal assignment) between the two
  five-color sets; pair score = mean ΔE00 of the five matched pairs. The
  computation script is committed with the run and cited by hash in the run
  record.
- **Threshold: every arm pair scores mean matched ΔE00 ≥ 10.0.** Rationale,
  fixed now: functional neutrals (text/background) legitimately recur across
  arms and the optimal matching will pair them near ΔE00 ≈ 0, so the accent and
  status colors must carry genuine separation for a pair to clear 10.
- **Secondary, recorded, no threshold:** the same matched-mean over chromatic
  tokens only (OKLCh chroma ≥ 0.04, same usage ranking) — descriptive context
  for the report, defined now so it cannot be shaped later.

## (b) Layout class

- **Fixed taxonomy (assignments must use exactly one):**
  1. *single-column stack* — one reading column end-to-end;
  2. *split-hero* — asymmetric two-zone opening dominating the first viewport;
  3. *grid-first* — card/tile matrix as the dominant scheme;
  4. *list-ledger* — table/row listing as the dominant scheme;
  5. *dashboard-dense* — multiple simultaneous panels, minimal scroll priority;
  6. *editorial-flow* — narrative prose-led sections.
- **Assignment rule:** each blind judge from (e) also assigns each arm one class
  from the desktop-light full-page render; an arm's class = majority vote across
  the 5 judges; **no majority = conservatively counts as shared** with every
  class that tied.
- **Threshold: no two arms share an assigned class.**

## (c) Motif overlap

- **Precommitted checklist (20 optional stylistic motifs).** Brief-mandated
  content is excluded by construction — per-trail status listing, the active
  alert, last-updated timestamps, the 7-day history, header/footer — presence of
  those counts for no pair. The checklist: (1) sticky header; (2) hero
  image/illustration; (3) status pill/badge chips; (4) card grid; (5) data
  table with ruled rows; (6) map or terrain graphic; (7) sparkline/mini-chart;
  (8) big-number stat row; (9) timeline/strip calendar; (10) tabbed sections;
  (11) accordion/disclosure; (12) filter or segment control; (13) legend block;
  (14) icon-led list rows; (15) full-bleed section color inversion; (16)
  gradient wash; (17) glass/blur panel; (18) oversized display typography;
  (19) duotone/monochrome photography treatment; (20) decorative texture or
  pattern field.
- **Presence:** greppable motifs decided mechanically from the committed code;
  visual-only motifs by majority of the 5 blind judges. Per arm: a binary
  20-vector.
- **Metric:** Jaccard similarity per arm pair, J = |A∩B| / |A∪B|; if
  |A∪B| = 0, J = 0.
- **Threshold: every arm pair J ≤ 0.40.**

## (d) Fingerprint test

- Each arm's committed code and rendered computed styles are grepped against
  every `any[]` signature of **active** entries in the fingerprint registry —
  the shipped seed at the sealed commit plus the live registry file, both cited
  by hash in the run record. Scope rule as registered: global entries plus
  entries scoped to this brief's register.
- **Threshold: zero arms match any banned-cluster entry** (RF-6 is against the
  *current* corpus; the registry hashes pin what "current" meant at run time).

## (e) Blind-intent protocol

- **Judges:** 5 (odd, ≥3 satisfied), fresh contexts, structurally blind: no
  PixelHelm docs, no gate outputs, no knowledge of any preference.
- **Inputs per judge:** the three one-sentence direction intents (written at the
  directions stage, before renders) and the three unlabeled desktop-light
  full-page renders; intents and renders independently shuffled per judge
  (seeds recorded).
- **Task:** forced one-to-one assignment of renders to intents.
- **Success threshold: at least 3 of 5 judges produce the fully correct
  assignment.** (Chance of a single judge succeeding by guessing is 1/6; three
  or more of five by chance ≈ 3.5%.) **Tie rule:** none needed — the per-judge
  outcome is binary and N is odd. All raw judge outputs are committed.

## Reporting rule

The E2 report states each metric's registered threshold next to its measured
value, pass or fail, with no reframing. A failed threshold is reported as "E2
falsified" — not as "partial divergence". No measured value, verdict, or
"anticipated" outcome may be written anywhere before the run produces it.
