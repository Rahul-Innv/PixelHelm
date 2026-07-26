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
