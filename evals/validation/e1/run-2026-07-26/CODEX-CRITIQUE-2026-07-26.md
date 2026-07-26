# Codex adversarial critique of the E1 run — 2026-07-26

Independent critic (codex-cli 0.144.5, read-only sandbox), the two-critic
pattern (P3-5) applied to the program's first run. Commissioned by the
coordinating session AFTER the run and its owner sign-off; the critic saw the
repository only. Findings below verbatim EXCEPT absolute file-link prefixes redacted to repo-relative (hygiene test; no wording changed); the coordinator's response is in
CRITIQUE-RESPONSE.md alongside. Full session log retained locally (not
committed; ~490KB tool stream).

---

No. The run is artifact-rich and its arithmetic is largely correct, but it did not satisfy its sealed evidentiary contract.

1. **BLOCKER — The preregistered juror record artifacts were never produced.**

   Files: [PREREG-RUBRIC-utility.md](<evals/validation/e1/PREREG-RUBRIC-utility.md:64>), [PREREG-BRIEF.md](<evals/validation/e1/PREREG-BRIEF.md:45>), and all five `jurors/raw/juror-{1..5}.json`.

   Attack: I counted the required records, inspected their schemas, and passed them through `records.mjs`. The rubric requires one JSON per juror per arm, written via the judge-record machinery: 15 schema-valid records. The run has five custom bundled JSONs, none with a schema; `records.mjs` rejects them with `unknown schema undefined`. The later aggregate council record validates, but it is not a substitute for the preregistered per-juror/per-arm records. The brief additionally names `design/run@1` and `design/signoff@1`; the run silently uses `pixelhelm/run@1` and `pixelhelm/signoff@1`.

   **Verdict: CONFIRMED-DEFECT.**

2. **MAJOR — E2 palette divergence was fitted after observing a registered-threshold failure.**

   Files: [DIRECTIONS.md](<evals/validation/e1/run-2026-07-26/directions/DIRECTIONS.md:105>), [REPORT.md](<evals/validation/e1/run-2026-07-26/REPORT.md:20>), and the `trail-ledger`/`first-light` candidate HTML files.

   Attack: I followed the history from script commit `7be3705`, through all three candidate commits, to tuning commit `ef6b151`. That commit explicitly says the registered metric was run, produced `7.02 < 10.0`, and the candidates were then changed “to satisfy registered thresholds.” The permission to do that appeared in `DIRECTIONS.md`, after the sealed preregistration, not in a sealed amendment. The failed measurement’s full output was never committed.

   The final candidates do pass, but this establishes optimization against the test, not an uncontaminated divergence measurement.

   **Verdict: CONFIRMED-DEFECT.**

3. **MAJOR — The fingerprint evidence was generated with a post-hoc-repaired script, and required hashes are absent from the run record.**

   Files: [PREREG-METRICS-divergence.md](<evals/validation/e1/PREREG-METRICS-divergence.md:18>), [fingerprint-check.mjs](<evals/validation/e1/run-2026-07-26/divergence/fingerprint-check.mjs:12>), [fingerprint-check.result.json](<evals/validation/e1/run-2026-07-26/divergence/fingerprint-check.result.json:1>), and [run.json](<evals/validation/e1/run-2026-07-26/project/.pixelhelm/runs/2026-07-26--trail-conditions--run.json:1>).

   Attack: I executed the exact script blob from the claimed pre-measurement commit. It fails by treating the `--pw` directory as a candidate file (`EISDIR`). The script was then changed in result commit `a0654c3` to fix argument filtering, Playwright loading, and launch diagnostics. That repair is absent from the report’s “complete list” of deviations.

   The preregistration also requires the palette script hash and fingerprint registry hashes in the run record. The run JSON contains none.

   **Verdict: CONFIRMED-DEFECT.**

4. **MAJOR — “Five blind jurors, fresh contexts, exact inputs” is not independently evidenced.**

   Files: [juror-1-inputs.md](<evals/validation/e1/run-2026-07-26/jurors/juror-1-inputs.md:1>), all `jurors/raw/*.json`, all `divergence/blind-judges/*.json`, and [blind-map.json](<evals/validation/e1/run-2026-07-26/divergence/blind-map.json:1>).

   Attack: I inspected every stored input and output. There are no per-juror model identifiers, context identifiers, prompt transcripts, or independent-context attestations. The input Markdown contains candidate summaries, declared breaks, and summarized gate outcomes—not the actual rubric, brief, data, and render matrix claimed as exact inputs. The raw rationales suggest those materials were seen, but the committed trail cannot establish what each juror received or whether contexts were independent.

   **Verdict: SUSPICION-UNRESOLVED.**

5. **MAJOR — The controlling approval state contradicts the “sealed” claim.**

   Files: [PREREG-BRIEF.md](<evals/validation/e1/PREREG-BRIEF.md:3>), [PREREG-RUBRIC-utility.md](<evals/validation/e1/PREREG-RUBRIC-utility.md:3>), [PREREG-METRICS-divergence.md](<evals/validation/e1/PREREG-METRICS-divergence.md:3>), and [validation README](<evals/validation/README.md:1>).

   Attack: all four controlling files still say `DRAFT — PENDING OWNER APPROVAL`; the program README says nothing licenses generation until approval. Commit `ca91ad4`, authored by Rahul, says “owner-approved” and Amendment A1 is likewise owner-attributed, so approval probably occurred. But the fail-closed source documents were never moved out of pending status.

   **Verdict: CONFIRMED-DEFECT.**

6. **MINOR — REPORT.md contains a false E2 number.**

   Files: [REPORT.md](<evals/validation/e1/run-2026-07-26/REPORT.md:73>) and [palette-de00.result.json](<evals/validation/e1/run-2026-07-26/divergence/palette-de00.result.json:108>).

   Attack: I reran the committed palette script and obtained semantic equality with the committed result. The secondary chromatic-only values are `20.540 / 11.454 / 18.864`; the report says `10.903 / 11.454 / 18.864`. This does not change a threshold verdict because the secondary metric has no threshold.

   **Verdict: CONFIRMED-DEFECT.**

7. **MAJOR — Claim voice labels evidence grades correctly but overclaims procedural completion.**

   Files: [REPORT.md](<evals/validation/e1/run-2026-07-26/REPORT.md:3>), [README.md](<README.md:185>), and [validation README](<evals/validation/README.md:37>).

   Attack: I checked the relevant sentences against the artifacts. The system-esteem/owner-esteem/user-outcome boundaries are handled honestly; I found no user-outcome inflation. But “zero improvisation,” “complete list,” “E1’s own success criterion is met,” and “first complete evidenced loop” do not survive Findings 1–5.

   **Verdict: CONFIRMED-DEFECT.**

8. **MINOR — Post-run redaction changed evidential metadata and three gate-input profiles.**

   Files: the 12 gate A/B JSON/stderr files under all three arms, `profile-{first-light,status-board,trail-ledger}.json`, and the eight mutant JSON/stderr files—23 artifacts total.

   Attack: I diffed commit `236ac06` against its parent. Pass/fail values, findings, scores, and verdicts did not change. However, three profile `root` fields—the actual executed gate inputs—were replaced with repo-relative paths, and 20 output paths were redacted. Thus the current files are not the exact executed bytes; originals remain recoverable at commit `53e4311`.

   **Verdict: CONFIRMED-DEFECT.**

9. **NOTE — The record arithmetic and most final E2 computations survive.**

   Files: [panel-results.json](<evals/validation/e1/run-2026-07-26/jurors/panel-results.json:1>), [council JSON](<evals/validation/e1/run-2026-07-26/project/.pixelhelm/council/2026-07-26--trail-conditions--council.json:1>), [signoff JSON](<evals/validation/e1/run-2026-07-26/project/.pixelhelm/signoffs/2026-07-26--trail-conditions.json:1>), and [TIEBREAK.md](<evals/validation/e1/run-2026-07-26/jurors/TIEBREAK.md:1>).

   Attack: all three final records validate. Independent recomputation produced zero discrepancies across criterion medians, overall medians, council lens scores, per-juror medians, and the 2–1 tie-break. Palette, motif, layout, and blind-intent scripts reproduced the committed results exactly. A live computed-style fingerprint rerun was blocked by the read-only sandbox’s Playwright temporary-directory restriction, so that particular zero-match result was not independently rerun here.

   **Verdict: REFUTATION-FAILED-CLAIM-STANDS.**

10. **NOTE — The mid-run ChoiceGate re-acceptance chain itself survives.**

   Files: [RECORD.md](<evals/validation/reacceptance-2026-07-26/RECORD.md:3>) and [admission.json](<evals/validation/e1/run-2026-07-26/admission/admission.json:1>).

   Attack: I verified commit order, inspected both accepted roots, confirmed they are clean and pinned at ChoiceGate `7d95e96`/tag `v0.2.1` and inventory `354046f`/tag `accepted-inventory-354046f`, recomputed the admission and receipt hashes, and reproduced the inventory manifest fingerprint with no component mismatches. Re-acceptance landed before the fresh admission and before any candidate generation.

   **Verdict: REFUTATION-FAILED-CLAIM-STANDS.**

**Overall verdict:** E1 may not honestly be called **complete-and-evidenced** under its sealed contract. The defensible description is: **a completed, owner-reviewed run with committed candidates, renders, gate outputs, and arithmetically reproducible aggregate results, but with material preregistration and provenance defects.**
