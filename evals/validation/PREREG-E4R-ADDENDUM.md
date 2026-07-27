# E4-R pre-registration addendum — re-validating the judging seat after the R1+R2 repair

**Status: SEALED by this commit, BEFORE any E4-R plant is authored, rendered, or
measured, and before any juror is contacted.** Date: 2026-07-27.

This is an ADDENDUM to `PREREG-E4-CALIBRATION.md`, which is **untouched and remains
sealed**. E4-R re-runs that protocol with the owner-decided repair applied
(`E4-JUDGING-SEAT-REPAIR-DECISION.md`, R1 + R2, both required) and a FRESH plant set.

**Nothing in the statistics or the thresholds changes.** Section (b) of the sealed
sheet and its success/falsification clause are carried verbatim below and bind E4-R
exactly as written. This addendum registers only (1) which plants are planted and how
they are sealed, (2) how the repaired precondition is applied and recorded, and (3)
the juror input set the repair requires. If any part of this addendum ever appeared to
loosen a sealed threshold, the sealed sheet wins.

## Why E4-R exists

E4 was FALSIFIED on its plant criterion (`e4-run-2026-07-26/REPORT.md`): a planted
candidate carrying a real 3.12:1 AA contrast failure WON its external set, and no
juror surfaced the defect, while the machine floor caught 4 of 4 plants
deterministically. The consequence in the sealed sheet fired: the model judging seat
is demoted to advisory-only, and no Tier-3 claim may rest on internal scores alone.
The demotion is liftable ONLY by this re-run meeting the same unchanged thresholds.
Lifting it is the coordinator's / owner's decision, not the run's.

## (a) Panel construction — carried from the sealed sheet, with the R2 change

Unchanged: 5 jurors, fresh contexts, per judged set; the same four judged sets (e1 +
the three E3 runs); candidates presented in per-juror shuffled order under neutral
labels with the seeds recorded; each juror's FULL input transcript committed verbatim;
each juror output written as a schema-valid `pixelhelm/juror-record@1` via the record
machinery; every computation script cited by SHA-256 in the run record. A panel
failing any of these is not a panel.

**Changed by R2 — the one input-set change this addendum registers.** The sealed
sheet's input list said "the Phase-1 dossier's tier definitions, the sealed archetype
rubric sheet, and the renders — NOTHING else … no gate outputs". R2 reverses exactly
that clause and nothing else: **each candidate's Layer-1 floor outputs travel with its
renders in every juror input set**, and the juror record's `inputTranscriptSha256`
covers them. Everything else the sealed sheet excluded stays excluded: no PixelHelm
docs, no knowledge of which candidate the system preferred, no internal scores, no
sealed data files. The floor outputs are committed artifacts, quoted into the
transcript verbatim (verdict lines and findings), including the explicit names of any
gates that did not run — silence must never read as a pass.

Structural externality is unchanged from E4: fresh-context subagent jurors, one per
juror, with no sight of each other and no sight of this addendum, the plant note, or
any PixelHelm machinery.

**Juror seeds:** the E4-R shuffle seeds are drawn from `202607711`–`202607730`
(20 jurors), disjoint from every previously committed seed range including E4's
`202607611`–`202607645`.

## (b) Statistics — CARRIED VERBATIM FROM THE SEALED SHEET, UNCHANGED

> - **Agreement:** Kendall's tau between the internal panel's candidate ranking
>   and the external panel's aggregate ranking (aggregate = ranking of external
>   per-candidate median overall scores), computed across all ranked pairs pooled
>   over the four judged sets (E1 + three E3 runs; 3 candidates each → 12 ranked
>   pairs). **Threshold: τ ≥ 0.5.**
> - **Inflation:** mean(internal overall median − external overall median) per
>   candidate, pooled. **Acceptable bound: |inflation| ≤ 1.5 points.** The E1
>   owner-vs-panel offset (≈ +1.0) is the reference point; external-vs-internal
>   inflation beyond 1.5 means the internal standard is not just warm but
>   unmoored.
> - Ties in rankings: handled by tau-b (the tie-aware variant). The computation
>   script is committed with the run and cited by hash.

Applied exactly as in E4: aggregation is the registered rule (per-criterion median of
5 jurors; overall = median of the 10 criterion medians; no means, no weights);
internal values are the committed `panel-results.json` of each judged run; **plants
are excluded from τ and inflation**, which pool over the 12 real candidates only.

## (c) The E4-R plant set — fresh, and registered before authorship

One deliberately flawed candidate per judged set, attractive surface, exactly ONE
planted floor defect, as in the sealed sheet. Two constraints this addendum adds:

**1. New defect classes.** E4's four classes were: static AA text contrast; fabricated
statistic; target size; unverified value presented as verified. **None of the four may
be reused.** The E4-R classes, registered here before any plant is authored, are:

| Set | Registered defect class | Gate that must catch it | WCAG / rule |
|---|---|---|---|
| e1 (utility) | Reflow: page-level horizontal overflow at narrow width | `verify_responsive.mjs` | WCAG 2.2 1.4.10 |
| e3-saas (SaaS marketing) | Structural output floor: no `main` landmark, heading-order skip, styled heading impostor | `output-floor-gate.mjs` | landmarks / heading hierarchy |
| e3-commerce (commerce) | Keyboard trap: a modal dialog that Escape does not close and that does not restore focus to its trigger | `verify_focustrap.mjs` | WCAG 2.1.2 (+ 2.4.3) |
| e3-editorial (editorial) | Real-render interactive STATE contrast: a control state (hover and/or focus) below threshold | `verify_states.mjs` | WCAG 1.4.3 / 1.4.11 in-state |

Every gate named above is already in the committed battery the sets' real arms faced,
so no gate is added for the plants alone. Honest note on adjacency, recorded now
rather than argued later: the editorial class is contrast-family, like E4's e1 plant,
but it is a different gate, a different success criterion, a different measurement
(computed state colors on the real render, not declared token pairs), and it has a
property E4's did not — a hover-state failure **cannot appear in any static render at
all**, which makes it the sharpest available test of R2. It is one of four classes,
never the only one; the "bare contrast failure" of E4 is not reused.

**2. Hash-commit sealing, as in the sealed sheet.** Each plant's identity and its
defect are written to `e4r-run-<date>/plants/SEALED-PLANT-NOTE.md`; that note's SHA-256
is committed BEFORE any judging; the note TEXT is committed only after all verdicts
are in. Page identity is asserted by explicit `file://` URL in a fresh context before
any render or measurement (L-081). Plant pages carry no em dashes in authored copy.

**Threshold — carried verbatim, unchanged:**

> **Threshold: every planted flaw is caught** — the plant may not win any set, and
> at least one juror (or the floor battery, which runs on plants too) must surface
> its defect class.

## (d) How R1 is applied and recorded (the repair under test)

R1: floor-clean is a hard precondition for esteem scoring. A candidate whose shipped
HARD Layer-1 gates did not all exit 0, or whose gate outputs do not exist as
artifacts, is **UNSCORED** — never scored low.

Registered application for E4-R:

1. The committed floor battery runs on all four candidates in each set (3 real + 1
   plant), as-produced, exactly as the set's real arms faced it. Outputs are committed
   under `e4r-run-<date>/plants/<set>/gates/`, path-redacted.
2. A candidate whose battery shows a HARD FAIL is **UNSCORED**: no rubric scores, no
   rank, no juror record, and it is **excluded from the aggregate ranking** and from τ
   and inflation. It is recorded with the word UNSCORED and the failing gate named,
   never with a comparative adjective and never with a low score.
3. **A plant the floor eliminates is CAUGHT by definition, and is recorded that way
   honestly** — the sealed threshold's own disjunction says "at least one juror **or
   the floor battery**". The report will state plainly that the criterion was met by
   the floor seat, and will not represent floor elimination as juror perceptiveness.
4. **The plant is nevertheless placed in the juror input set, carrying its failing
   gate outputs**, and each juror is instructed to return `"unscored": true` with the
   failing gate named, for any candidate whose floor outputs show a HARD FAIL. This
   is the direct test of whether the repaired seat HONORS the precondition when handed
   the evidence — the E4 failure mode was a seat that could not see a measured defect.
   Registered now so it cannot be read as a post-hoc addition: a juror that scores a
   floor-failing candidate anyway is a reportable finding about the seat. It does not
   change the plant verdict, because the plant's exclusion from the aggregate ranking
   is mechanical, applied by the committed computation script from the gate outputs,
   not by juror discretion.
5. Registered as a possible outcome, so it cannot be reframed later: if the floor
   battery does NOT fail a plant as designed, that plant is scored like any real
   candidate and the plant criterion is judged on the sealed wording alone (it must
   not win, and its defect class must be surfaced by a juror). No plant is repaired
   after any juror has seen it.

## Success / falsification (artifact 14, unchanged)

> **Success:** τ ≥ 0.5, |inflation| ≤ 1.5, every plant caught.
> **Falsified if:** τ below threshold, inflation beyond bound, or any planted
> flaw wins — the internal judging seat is then demoted to advisory-only until
> repaired, and no Tier-3 claim may rest on internal scores alone.

E4-R reports every registered threshold beside its measured value verbatim, pass or
fail, with no reframing. **A passing E4-R does not itself lift the standing
advisory-only demotion**: lifting it is the coordinator's / owner's decision, taken on
these artifacts. A failing E4-R is reported as the result; the protocol is not tuned
to pass.

## Scope honesty (carried verbatim from the sealed sheet)

> Agreement between two model-panel contexts sharing one constructed standard
> measures *inter-context consistency of that standard*, NOT validity against
> real audiences — only E5/Stage-12 data speak to that. Catching planted floor
> defects validates the floor seat, not creative ranking. Both limits carry into
> any report of E4 results.

Two limits this addendum adds, in the same spirit: (1) R1+R2 repair the seat's
blindness to *measured* defects only — they do nothing for defects no gate measures
(taste, register fit, content quality), which remain owner-judged; (2) with R1 in
force, a plant that the floor catches never reaches the ranking, so the plant
criterion in E4-R tests the precondition's enforcement, not juror perceptiveness. Both
carry into any report of E4-R results.
