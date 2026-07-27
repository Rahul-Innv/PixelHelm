# Owner taste findings — encoded into the system (2026-07-27)

The five owner findings recorded across the E1 and E3 sign-offs existed only as
sign-off prose and design lessons. Nothing in the loop prevented the next run from
repeating them. This record states exactly what was encoded, at what enforcement
level, and what could not be encoded mechanically.

Source evidence, all committed and unmodified by this pass:

- `e1/run-2026-07-26/project/.pixelhelm/signoffs/2026-07-26--trail-conditions.json`
- `e1/run-2026-07-26/project/.pixelhelm/signoffs/2026-07-26--trail-conditions-page-owner-directed-revision-2.json`
- `e3/run-2026-07-26/project/.pixelhelm/signoffs/2026-07-26--catalog-product-page-three-arms.json`
- `e3/run-2026-07-26-editorial/project/.pixelhelm/signoffs/2026-07-26--data-narrative-single-page-three-arms.json`
- `e3/run-2026-07-26-saas/project/.pixelhelm/signoffs/2026-07-26--marketing-landing-page-three-arms.json`
- design lessons L-082, L-083, L-086 (`~/.claude/design/LESSONS.md`)
- `PROGRAM-REPORT-2026-07-27.md` §"What may NOT be claimed", items 2 and 3

No sealed PREREG sheet, no e1/e3/e4/e6 run archive, and no ChoiceGate admission code
was touched.

## The word "enforced" is used strictly here

**ENFORCED** = shipped code refuses or blocks. **ADVISORY** = shipped code fires,
records or warns, and never blocks. **DOCUMENTED** = guidance text a run is expected
to follow, with no mechanical check behind it. A line that is documented is not
described anywhere as enforced.

## 1. The loop never asked what the design should FEEL like — ENFORCED

> "Stop reusing the same design language; the loop should ASK the owner what theme and
> feeling is wanted before generating." — owner, E3 commerce sign-off, 2026-07-26

| Level | What ships |
|---|---|
| ENFORCED | `pixelhelm/run@1` gains a required `intentElicitation` block. `records.mjs write run` REFUSES a record without it (exit 1, nothing written). The loop already treats a refused record write as a blocking finding, so a run that never asked cannot be reported complete. `validate` stays permissive, so run archives written before this rule remain valid. |
| ENFORCED | Shape rules inside the block: exactly one of `asked` / `waived`; an asked elicitation carries the owner's VERBATIM words plus where they entered the ground context; a waiver carries the owner's own words. Neither-true is rejected with the words "a run that did neither is a process defect". A self-issued waiver is refused. |
| DOCUMENTED | The gate itself — the three questions, when it runs (before the first direction name or thesis), and that the captured answer becomes ground context the directions must serve without displacing the profile `_register`. Lives in `gates-and-loop.md` §0, the routing sequences (both editions), the directions recipe step 0, and the generate prompt stack's TASK block. |

What is NOT enforced: that the captured answer actually shaped the candidates. The
record proves the question was asked and the answer was captured; no machine reads a
render and decides whether it serves the answer. That judgment stays with the owner.

Offline coverage: `test_intent_elicitation_is_required_on_new_run_records`.

## 2. House-style sameness across arms and archetypes — ADVISORY

> "I see a theme - all of them are similar to each other and to the set-1 style I
> called merely easier on the eyes." — owner, E3 commerce sign-off, 2026-07-26

Every registered in-run divergence metric PASSED on that field — dE00 distance, layout
class, motif Jaccard, blind-intent recovery. Those metrics measure difference between
arms; the owner was reading sameness across RUNS. A tournament cannot see it.

| Level | What ships |
|---|---|
| ADVISORY | `pixelhelm/judge-verdict@1` gains `houseStyleCheck`: what the field was compared against across prior runs' committed winners, any recurring structural signature with cited evidence spanning ≥ 2 runs, and a verdict of `no-house-style-tell` / `house-style-tell` / `not-run`. Writing a MULTI-CANDIDATE verdict without it WARNS on stderr; it is never a refusal. |
| ENFORCED (shape only) | When the block IS present it is validated: an uncited signature is rejected (the fingerprint registry's ADD/PROMOTE evidence gate, applied verbatim), a one-run signature is rejected, a `not-run` verdict with no reason is rejected, and a non-`not-run` verdict with nothing in `comparedAgainst` is rejected. The evidence discipline is enforced; the finding is not. |
| DOCUMENTED | What to compare and what counts as a structural signature: `gates-and-loop.md` §8, the council recipe step 5, and the generate anti-homogeneity reference. |

**A house-style tell never blocks.** It does not veto a winner, does not score a
candidate, does not cost an iteration, and is not a Layer-1 finding. It is recorded
with its evidence and surfaced to the owner. Making it a gate would put a taste
judgment on renders back in the seat that E4 and E4-R falsified.

Offline coverage: `test_house_style_check_is_advisory_and_recorded` (including that a
recorded `house-style-tell` leaves the winner unchanged).

## 3. In-use usability is the standing weak spot — DOCUMENTED

> "there is still a lot of improvement with how easy it is for the user to use"
> "there is a lot of missing UI. Like, how is it easy for the user?" — owner, E1

| Level | What ships |
|---|---|
| DOCUMENTED | A judging-seat lens item: the Spool seat's in-use affordance census (`lenses.md` §4) — name the visitor's task, list the affordances it needs, check each against the RENDERED artifact, and state absent UI as the specific missing affordance and the task it blocks. Mirrored in the judge SKILL.md (both editions) and in the Layer-2 lens audit's interaction phase. |
| DOCUMENTED | Rubric authoring guidance for FUTURE sheets: every new sealed rubric carries an explicit in-use usability criterion, worded the same way as the lens (`design-council/references/recipe.md`, "Rubric authoring"; also in `close-the-loop.md` under the juror record). |

**No sealed rubric was created, edited, re-scored, or reinterpreted.** Past sheets are
the evidence of what was actually asked; this governs sheets authored from now on.

This one is DOCUMENTED and not ENFORCED on purpose. A machine cannot decide from a
PNG whether a missing control blocks a task — that is exactly the judgment E4 showed
the model seat cannot be trusted with, and inventing a gate for it would repeat the
error in the opposite direction (L-087: the seat also invents defects).

Offline coverage: `test_owner_findings_are_encoded_into_both_editions` asserts the
text ships in both editions. That is a presence check, not a behavioral one, and it is
not claimed as more.

## 4. AI voice tells in copy — ADVISORY (one greppable), DOCUMENTED (two)

> "em dashes present in all arms - not supposed to be there." — owner, E3 editorial
> sign-off, 2026-07-26

| Fingerprint | Status | Level |
|---|---|---|
| `ai-em-dash-copy` | active, scope global, greppable (`—`, `&mdash;`, `&#8212;`) | ADVISORY — wired into the shipped example profile's `bannedClusters`, so the existing Layer-1 anti-cliche grep fires on it. That gate is SOFT by contract: matches are reported, the exit code stays 0. |
| `uniform-paragraph-rhythm` | candidate, scope global, describe-only | DOCUMENTED — Layer-2 judgment; no greppable signature exists. |
| `symmetric-three-card` | candidate, scope global, describe-only | DOCUMENTED — Layer-2 judgment; the layout tell already named in the anti-slop research roster, now registered so one registry carries the family. |

The two candidate entries are `candidate`, not `active`, because neither has a second
cited instance in this tree. That is the registry's own ADD/PROMOTE rule, not a
hedge.

A conflict was resolved rather than left standing: `design-typography` previously
instructed the loop to convert `--` into `—` in prose, which is the opposite of the
owner's ban. It now reads as hygiene for a dash that is already there, never a licence
to introduce one, and the Layer-2 typography PASS criterion no longer lists em dashes
as a quality signal.

The worked example demonstrates the gate firing on real committed output: 12 matches,
of which 5 are CSS/HTML comments, 6 are the table's data-absent glyph, and 1 is a
genuine page-copy tell. That 1-in-12 ratio is why the gate is soft and human-read, and
it is written down in `examples/harborline/README.md` rather than tuned away. The one
real finding is left standing on the record — editing the heading would desync the
committed render matrix from its HTML with no browser pass to regenerate it.

Offline coverage: `test_em_dash_fingerprint_fires_through_the_anticliche_grep` —
fires on the tell, silent on clean copy, exit 0 either way, and non-vacuous (drop the
cluster and the same file reports clean).

## 5. Lead with the actionable answer — DOCUMENTED

> "lead with the recommendation - 'recommended trail' at the top, then go to the
> closures." — owner, E1 pass-2 sign-off
> "open with an executive brief of the finding, then the detail." — owner, E3
> editorial sign-off

| Level | What ships |
|---|---|
| DOCUMENTED | Register guidance by archetype in the generate prompt stack (both editions) — utility/status surfaces open with the resolved recommendation, then the exceptions; long-form data narratives open with an executive brief of the finding, then the detail. Carried into the TASK block as a structure instruction. |
| DOCUMENTED | The verbal twin in `design-content/references/registers.md` (Full edition), including the honesty carve-out: when the data cannot support a confident recommendation, the hedge goes at the top WITH it, never further down. |

## What could not be encoded mechanically, and why

- **Whether the elicited feeling was actually served.** Enforceable: that the question
  was asked and the answer captured. Not enforceable: that the candidates express it.
  That requires reading a render against an adjective, which is the owner's call.
- **Felt variety itself.** A cross-run structural comparison can be recorded and
  evidenced; whether a field FEELS various is the judgment the owner made and the
  panel did not. The check is advisory for that reason, not for lack of effort.
- **In-use usability as a gate.** No shipped validator can decide from a render
  whether an absent control blocks a task. E4 showed the model seat misses measured
  defects; L-087 showed it invents unmeasured ones. Encoding this as a machine gate
  would be a claim the evidence does not support.
- **The two describe-only fingerprints.** No greppable signature exists for paragraph
  rhythm or card symmetry. They are registered as lens material, which is what the
  registry schema already provides for.
- **Retro-fitting past runs.** Deliberately out of scope: no sealed rubric, run
  archive, or committed record was altered. Every change here governs future runs.
