# Validation program report — what it earned, exactly

**Date:** 2026-07-27. Written from the committed artifacts only. This is the
source of truth for what may be said about PixelHelm anywhere: README, public
docs, or the owner's own site. Nothing here may be upgraded by enthusiasm.

## Status of every experiment

| Experiment | Result | Where |
|---|---|---|
| E0 truth reconciliation | CLOSED (docs equal code) | `README.md` §evidence, verification record in this directory |
| E1 evidenced loop (utility) | RUN + owner-signed; graded by in-tree adversarial critique as *completed, owner-reviewed, arithmetically reproducible, with material pre-registration defects* | `e1/run-2026-07-26/` + `CODEX-CRITIQUE` + `CRITIQUE-RESPONSE` |
| E2 divergence (inside E1) | Thresholds met as measured; palette limb carries an in-loop-feedback caveat | `e1/run-2026-07-26/REPORT.md` §E2 |
| E3 transfer (SaaS, commerce, editorial) | Loop transferred to three unfamiliar archetypes with complete artifact trails; **all three owner-rejected or downgraded on quality** | `e3/` + signoffs |
| E4 judging calibration | **FALSIFIED** (planted contrast failure won its external set) | `e4-run-2026-07-26/` |
| E4-R after repair | **FALSIFIED** on agreement (tau-b 0.378); zero discordant pairs; instrument-resolution finding | `e4r-run-2026-07-27/` |
| E6-A motion prototype | NOT FALSIFIED on every measured limb (motion floor 14/14 x 3 arms; all budgets met) | `e6/run-*/REPORT.md` |
| E5 human probe | NOT RUN (requires recruited participants) | sealed protocol only |

## What may now be claimed

1. **The loop is real and produces evidence.** A documented design pipeline runs
   end to end on a sealed brief and leaves a complete committed trail: losing
   candidates, renders, gate outputs, validated records. Demonstrated on four
   archetypes (utility, SaaS-marketing, small-commerce, editorial data-narrative).
2. **The machine floor works, and it is the system's strongest part.** Across E4
   and E4-R, 8 of 8 deliberately planted defects in 8 distinct classes were
   caught deterministically by the gates. In E4-R all four were eliminated
   before any esteem score existed.
3. **Motion can clear the floor.** E6-A's three arms met every pre-registered
   performance budget with wide margin and passed 14 of 14 motion-floor items,
   including reduced-motion, JS-disabled and keyboard parity verified rather
   than asserted.
4. **The system's own claims are adversarially checked.** An independent critic
   audited the first run and its confirmed defects were accepted and published,
   not argued away.

## What may NOT be claimed, and why

1. **No quality claim may rest on model panel scores.** The judging seat is
   ADVISORY-ONLY (E4 falsified; E4-R did not lift it). Panels rewarded a
   candidate carrying a real 3.12:1 contrast failure when shown renders alone.
2. **The panel does not discriminate at the top.** It scored nearly everything
   at overall median 9.0, which tied 8 of 12 pairs in E4-R and left the
   agreement statistic almost nothing to measure. A 9 from this seat is not
   evidence of excellence; it is the seat's default.
3. **Owner-verified quality is materially lower than panel-reported quality.**
   On the same artifacts the owner scored 6, 6, 7 and 8.5 where the panel
   scored 9, 9, 9 and green. The capability ledger records the deltas as -1,
   -3, -3 and -2 against panel winner medians of 9.0: **every measurable
   owner-vs-panel delta is negative, on every archetype measured.** Two of the
   owner's bands were stated as upper bounds ("a maximum 6", "none above 6"),
   so the -3s are floors on the gap, not measurements of it — the true gap may
   be larger and is not known. Recorded owner findings: outputs did not read as
   their archetype ("this is not SaaS design"), a house style repeated across
   arms and archetypes despite divergence metrics passing, in-use usability was
   consistently weak, and copy carried AI voice tells.
4. **No user-outcome or audience claim exists.** E5 has not run. Nothing in this
   repository measures what real visitors do, understand, or remember.
5. **No claim of general capability.** Two archetypes (portfolio, product
   application) remain untested; hybrids are untested entirely.

## The honest one-paragraph summary

PixelHelm demonstrably runs an evidenced design loop with a deterministic
quality floor that catches real defects, across four archetypes, with its own
claims adversarially audited and its failures published. Its model judging layer
is not trustworthy for quality and is labelled advisory. Its outputs clear the
floor reliably but did not satisfy the owner's taste bar on unfamiliar
archetypes without direct iteration. That is the state of the evidence as of
2026-07-27: a strong floor, an honest process, and a ceiling that still depends
on human judgment.

## Open work (not claims)

- E5, the only remaining experiment, requires recruited participants.
- E4-R2 is **permanently deferred** by owner decision, 2026-07-27
  (`E4-R2-PERMANENT-DEFERRAL.md`): there is no ground truth to validate a panel
  against, the available fix could manufacture a pass on noise, and the standard
  is owner-relative rather than universal. The advisory-only status of the model
  judging seat is therefore permanent unless real-audience evidence arrives.
  Per-owner calibration accrues instead, automatically, in the capability
  ledger.
- The owner-taste findings above are being encoded into the system as
  machinery; until that lands they are lessons, not gates.
  **Update, same day (2026-07-27):** the encoding pass landed and its ledger is
  `OWNER-FINDINGS-ENCODING-2026-07-27.md`. Read it before repeating the sentence
  above: exactly ONE of the five is a gate (the elicitation step — a run record
  with no `intentElicitation` is refused, so a run that never asked cannot close
  its loop). Two are advisory machinery that records and warns without blocking
  (the cross-run house-style check; the em-dash fingerprint firing through the
  SOFT anti-cliche grep). Two remain guidance with no mechanical check behind
  them (the in-use usability lens item plus rubric-authoring guidance for future
  sheets; the lead-with-the-answer register rule). Nothing in the "What may NOT
  be claimed" list above is weakened by this: the owner-vs-panel quality gap and
  the house-style finding are recorded facts about runs that happened, and no
  encoding changes them.
