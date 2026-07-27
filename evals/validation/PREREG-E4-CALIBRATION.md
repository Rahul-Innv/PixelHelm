# E4 pre-registered protocol — is the judging worth anything? (RF-4 closure)

**Status: DRAFT — PENDING OWNER APPROVAL. Sealed by commit before E4 runs.**
Date drafted: 2026-07-26. Runs after the E3 winners exist; re-judges the E1 +
E3 winners with a structurally external panel. E1's calibration finding (panel
≈1 point hot vs owner) is the first data point this experiment exists to
formalize.

## (a) External panel construction

- 5 jurors, fresh contexts, per judged set.
- **Inputs, exactly:** the Phase-1 dossier's tier definitions, the sealed
  archetype rubric sheet, and the renders — NOTHING else. No PixelHelm docs, no
  gate outputs, no knowledge of which candidate the system preferred, no
  internal scores. Candidates presented in per-juror shuffled order under
  neutral labels (seeds recorded).
- Task per juror: score each candidate on the rubric (same scale) AND produce a
  strict ranking of the candidates in each set.
- **Evidence requirements (from the E1 critique, findings 1 & 4):** each juror's
  FULL input transcript is committed verbatim (what the juror actually received,
  not a summary), each juror's output is written as a schema-valid
  `pixelhelm/juror-record@1` via the record machinery (building that schema is a
  precondition for running E4), and every computation script is cited by SHA-256
  in the run record. A panel failing any of these is not a panel.

## (b) Pre-registered statistics (fixed now)

- **Agreement:** Kendall's tau between the internal panel's candidate ranking
  and the external panel's aggregate ranking (aggregate = ranking of external
  per-candidate median overall scores), computed across all ranked pairs pooled
  over the four judged sets (E1 + three E3 runs; 3 candidates each → 12 ranked
  pairs). **Threshold: τ ≥ 0.5.**
- **Inflation:** mean(internal overall median − external overall median) per
  candidate, pooled. **Acceptable bound: |inflation| ≤ 1.5 points.** The E1
  owner-vs-panel offset (≈ +1.0) is the reference point; external-vs-internal
  inflation beyond 1.5 means the internal standard is not just warm but
  unmoored.
- Ties in rankings: handled by tau-b (the tie-aware variant). The computation
  script is committed with the run and cited by hash.

## (c) Adversarial seed (sealed-plant protocol)

- One deliberately flawed candidate per judged set: a planted floor defect
  (e.g., a real contrast failure or honesty violation) beneath an attractive
  surface.
- The plant's identity and its defect are written to a note whose SHA-256 hash
  is committed BEFORE any judging; the note itself is committed only after all
  verdicts are in (hash-commit sealing).
- **Threshold: every planted flaw is caught** — the plant may not win any set,
  and at least one juror (or the floor battery, which runs on plants too) must
  surface its defect class.

## Success / falsification (artifact 14, unchanged)

**Success:** τ ≥ 0.5, |inflation| ≤ 1.5, every plant caught.
**Falsified if:** τ below threshold, inflation beyond bound, or any planted
flaw wins — the internal judging seat is then demoted to advisory-only until
repaired, and no Tier-3 claim may rest on internal scores alone.

## Scope honesty (carried verbatim)

Agreement between two model-panel contexts sharing one constructed standard
measures *inter-context consistency of that standard*, NOT validity against
real audiences — only E5/Stage-12 data speak to that. Catching planted floor
defects validates the floor seat, not creative ranking. Both limits carry into
any report of E4 results.
