# Anti-patterns — the evaluation avoid-list

The consolidated do-not-do list for `design-evaluate` (build-spec §6). Each is a real failure mode
from a shipped tool. Violating any invalidates the verdict.

## Seam violations (worst)
- Letting Layer-2 reasoning OVERRIDE or downgrade a Layer-1 FAIL. The machine floor is final.
- Reporting a Layer-1 PASS as "design approved" / "ships" / "looks great" — PASS certifies
  correctness, never taste. Always print the honest banner.
- Running Layer-2 at all when Layer-1 failed (a long taste list buries the proven Blocker).
- Skipping the honest banner.

## Layer-1 (machine) anti-patterns
- Loosening a contrast threshold to ship a color — the threshold IS the contract.
- Treating axe (or any single validator) as sufficient — axe catches ~⅓ of WCAG. Route the
  needs-review bucket to Layer-2; never report axe-clean as "accessible."
- axe via CDN as the ONLY path → silent SKIP on no-network. Vendor locally; fail loudly if absent.
- Hard-coding the gate count (gnurio `01..10` brittleness) — iterate the registry.
- Passing model-authored JS into `browser_evaluate` — arbitrary-code hole. Inject only FIXED audit
  functions.
- Running two browser engines — pick one (`playwright-core`).
- `type-ratio < 2.0` as a hard HIGH; crude/dead taste-lint bits shipped as build-fail (plugin87's
  mistake) — keep machine gates machine-certain; taste is Layer-2.
- Validating the DESIGN.md spec and CALLING it conformance — conformance is the rendered-DOM
  assertion (computed === resolved token).

## Layer-2 (judgment) anti-patterns
- Outputting prescriptions (a CSS value) in a finding — describe problem + impact; let `design-fix`
  patch.
- Skipping the MANDATORY false-positive filter — a wishlist of taste isn't a review.
- Flagging a motivated bold choice as a defect (the "What is NOT slop" guard) — distinctive ≠ wrong.
- Homogenizing toward one house style / ignoring the project register.
- Single-viewport review — always desktop AND mobile, light AND dark.
- "Hero is a thesis" applied to dense product UI — that rule is marketing-shaped; branch deslop by
  surface type.
- A score with no critique field — a number alone can't drive a fix.

## Loop / eval anti-patterns
- Self-review left to model discretion with no objective halt — Layer-1 is the objective halt.
- Brittle plaintext sentinels as the only halt — require the structured verdict field.
- Human 1–4 eyeballing as the sole eval — not CI-gateable; Layer-1 is.
- Re-litigating what already passed every run — use the baseline; surface only New/Regressed.
- Unfalsifiable "97% agreement" with no committed eval set.

## Baseline anti-patterns
- Flagging an INTENDED change as a bug (reg-suit's failure) — pixel tolerance + human re-baseline.
- Silently absorbing a regression into the baseline — re-baselining is a reviewable human diff.
- Letting a 1px antialias shift fail the run — set `thresholdPixel` + `enableAntialias`.
