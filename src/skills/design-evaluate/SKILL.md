---
name: design-evaluate
description: This skill should be used to AUDIT or REVIEW already-built UI for correctness and quality — when the user asks to "review this design", "do a design review", "audit the UI/accessibility", "check contrast / WCAG / a11y", "is this AA compliant", "find design problems", "evaluate this screen", "QA the front-end", "did this regress", or "is this approved to ship". Runs a two-layer evaluation: Layer-1 machine-certain HARD gates (token-contrast both modes hard-gates; raw-color/anti-cliche/type-scale reported; browser checks like axe run via the render --axe arm or the project's harness — PASS/FAIL, no model) then Layer-2 a problem-framed, severity-triaged lens audit (advisory). Emits one merged confidence-labeled findings list. NOT for generating new UI (use design-generate) and NOT for applying fixes (use design-fix); this skill judges, it does not mutate.
shell: bash
---

# design-evaluate — the two-layer evaluator

!`node "${CLAUDE_PLUGIN_ROOT}/scripts/read-lessons.mjs" design-evaluate 2>/dev/null`

Audit a built UI by running TWO layers in order, then emit ONE merged, confidence-labeled
findings list. This skill JUDGES; it never mutates (that is `design-fix`) and never generates
(that is `design-generate`). Reached standalone or dispatched by the `design` router.

## Purpose

Fuse machine-certain deterministic gates with model judgment so a verdict is both DEFENSIBLE
(Layer-1 proves token/contrast/a11y/no-drift correctness) and HONEST about its limits (Layer-1
PASS is never "design approved"; Layer-2 advises on taste/hierarchy but can NEVER overturn a
Layer-1 FAIL). A baseline between the layers makes evaluation COMPOUND — never re-litigate what
already passed; only surface New/Regressed.

## The two layers (run in order)

1. **Layer-1 — machine gates** (`scripts/static-gates.mjs`). No model in the loop; profile-driven
   (`node static-gates.mjs <profile.json> [--json]`). Contrast is the HARD gate (exit 1);
   raw-color / anti-cliché / **web-craft** (opacity-composited text that dodges the token lockstep;
   justified body text) / type-scale findings are reported for judgment. The universal numeric
   craft floor (measure, line-height, tap-target, states, one-`<h1>`, no-justified, OKLCH) is the
   Layer-1.5 reference `references/web-craft-rulebook.md` — mechanical ones machine-checked here,
   judgemental ones stay Layer-2 lens Qs. What ships vs what is designed-but-not-wired:
   `references/layer-1-gates.md`.
2. **Baseline** (`pixelhelm-baseline/scripts/baseline.mjs compare`). Diff this run vs the merge-base
   baseline; classify each gate/measurement/finding New / Persistent / Fixed / **Regressed** /
   **lost-evidence** / not-compared. Exit 1 = the candidate regressed. See `references/baseline.md`.
3. **Layer-2 — lens audit** (model judgment, runs only AFTER Layer-1 is green). Live-browser,
   7-phase, problem-framed, severity-triaged, false-positive-filtered. See `references/layer-2-lens-audit.md`.
<!-- FULL-ONLY-START -->
   On a **DEEP audit** (redesign-to-ship / high-stakes / trigger-artifact surface), Layer-2 also seats the
   **surface-triggered deep-pass composites** (C1–C8, P56, P45, P25 — the STORM-derived bench, mirrored from
   `design-council`; machine-certain a11y stays on Layer-1). See `references/layer-2-deep-pass-composites.md`.
1b. **Scope-B marketing lenses** (surface-triggered, machine-certain, advisory). When — and ONLY when — the
   surface is a real marketing web page (`profile.surfaceType === "marketing"`), also run the two scope-B
   lenses next to Layer-1: **SEO / share-meta** (`scripts/seo-meta.mjs` — title/desc length, canonical,
   OG + dims, twitter:card, JSON-LD parse, one-`<h1>`) and **Performance / CWV budget**
   (`design-render/scripts/perf-budget.mjs` — lab LCP/CLS + JS/hero/font/CLS-risk budgets). Both are
   `machine-certain` and advisory (exit 0 unless `--strict`); a FAIL folds in at `[Medium]` (or
   `[High-Priority]` only if the project declared a ship-blocking perf/SEO budget) and NEVER changes the
   contrast hard-gate's exit. NEVER fire these on `app` / `data` / `email` surfaces. Full spec + thresholds +
   citations: `references/scope-b-marketing-lenses.md`.
<!-- FULL-ONLY-END -->

**Seam rule (MUST, both directions):** Layer-2 reasoning NEVER overrides a Layer-1 FAIL. A
Layer-1 PASS is NEVER reported as "design approved." Always print the honest banner verbatim:

> These gates prove tokens/contrast/a11y/no-drift correctness. They do not prove taste.

## How to run an evaluation

1. **Resolve inputs.** Identify the target screen(s) and the rendered artifacts. If no
   render exists, obtain one via `design-render` (PNG cells + the `render.json` manifest,
   incl. mode-fidelity) — do NOT re-implement rendering here.
2. **Load the project profile.** Resolution order: `<project>/.design/profile.json` →
   `<dataDir>/profiles/<project>.json` (store map: the `design` skill's
   `references/close-the-loop.md`). It
   names the token module, banned color clusters, and the REGISTER. The
   register is NEVER homogenized — a serious-trust register and a warm-fun register fail different
   things. See `references/register-profiles.md`.
3. **Run Layer-1.** Execute `static-gates.mjs` against the PROJECT PROFILE (it walks the source
   + token contract from there; it iterates the gate registry, never hard-codes a count). If the
   renders were captured with `design-render --axe`, ALSO read `render.json`'s per-cell `axe`
   field — any serious/critical there is a Layer-1 FAIL (an absent field means axe did not run:
   report not-machine-checked, never clean). When the evaluated candidates embed a
   `#token-contract` block (design-generate's NEW-PALETTE tournament contract), ALSO run
   `scripts/check-token-contracts.mjs` on them — it recomputes AA on each candidate's own
   proposed palette (text ≥ 4.5, graphic ≥ 3.0, both modes); its exit 1 is a Layer-1 FAIL. When the
   surface is **data-bearing UI** (it renders numbers from a data source — a dashboard, price/status
   board, report), ALSO run the two honesty gates: `scripts/derived-claims-gate.mjs` (Gate A —
   fabrication/derivation/association/false-verdict) and `scripts/content-manifest-gate.mjs` (Gate B —
   anti-deletion), each rendered both modes; either's exit 1 is a Layer-1 FAIL. Run the non-vacuity
   mutant ritual (`references/honesty-gates.md`) once per project before trusting them. On any
   FAIL: STOP. Report the failures as `[Blocker]`
   with confidence `machine-certain`; do NOT run Layer-2 (a model cannot argue past a proven fail).
4. **Run the baseline diff** — `baseline.mjs compare --project <dir> --key <merge-base> --screen <id>`
   with the same `--gate-artifact` / `--measure` / `--finding` inputs the incumbent was captured
   with (`references/baseline.md`). A previously-passing gate that now fails is **Regressed →
   auto-top-severity**; a previously-passing gate declared `not-run` is **lost evidence** and blocks
   too. Surface only New/Regressed; suppress Persistent passes. A baseline gate absent from the
   inputs is reported `not-compared` — never a pass, and it costs the run its no-regression proof.
5. **Run Layer-2** only when Layer-1 is green. Drive the real browser through the 7 phases, assign
   the 4-rung severity, then apply the MANDATORY false-positive filter before emitting anything.
6. **Merge + emit** the single JSON verdict (`references/output-contract.md`), print the honest
   banner, and STOP. Hand findings to `design-fix` only if the user asks to fix them.

## Decision Criteria

The OVERALL verdict is one of `PASS` | `NEEDS_WORK` | `FAIL`, computed deterministically:

### FAIL — when ANY of:
- Any Layer-1 gate fails: the shipped contrast gate (any REQUIRED token pair below threshold in
  either mode), an axe-core serious|critical from `design-render --axe`'s per-cell `render.json`
  data, or — when run via the project's own harness — a browser check (real-render state
  contrast, whole-app axe sweeps, focus-trap leak, horizontal overflow at 280/320/414,
  target-size < 24×24 CSS px). A browser check that was NOT run is reported "not machine-checked",
  never silently passed.
- Any **Regressed** finding exists (a gate or lens item that passed at the baseline now fails).
- Any Layer-2 `[Blocker]` survives the false-positive filter.

### NEEDS_WORK — when Layer-1 PASSES and no Blocker/Regression, but:
- One or more Layer-2 `[High-Priority]` findings survive the filter.

### PASS — when:
- Every Layer-1 gate passes (`N/N = 100%`), AND
- No Regressed findings, AND
- No surviving `[Blocker]` or `[High-Priority]` Layer-2 findings (`[Medium]`/`Nit` may remain).
- PASS still prints the banner; it certifies CORRECTNESS, never taste.

### Hard invariants (a result that violates any of these is INVALID):
- Layer-2 did NOT run, or ran but is reported, when Layer-1 had a FAIL → invalid (Layer-1 fail must short-circuit).
- A Layer-2 finding overrode/downgraded a Layer-1 FAIL → invalid.
- A Layer-1 PASS was reported as "approved"/"ships"/"looks great" without the banner → invalid.
- A Layer-2 finding prescribes a CSS value (e.g. "set margin:16px") instead of describing the
  problem + impact → invalid (prescriptions belong to `design-fix`).
- `axe` clean reported as "accessible" (axe covers ~⅓ of WCAG) → invalid; the axe needs-review
  bucket routes to Layer-2, never silently passes.
- Every emitted finding MUST carry a confidence label: `machine-certain` (Layer-1) or `advisory`
  (Layer-2). An unlabeled finding → invalid.

## Coherence with sibling skills

- `design` (router) dispatches audit/review/contrast/a11y/QA requests here — do not re-implement routing.
- `design-tokens` is the single token source of truth; this skill ASSERTS against it
  (Layer-1 token-contrast; rendered-DOM computed-style conformance is designed but not yet
  wired), never redefines tokens.
- `design-render` owns rendering via `render.mjs`; depend on its contract, never reimplement it.
- `design-generate`'s tournament reuses Layer-1 gates to eliminate failing candidates before
  `design-council` judges taste — same machine floor, different caller.
- `design-fix` consumes this skill's findings; Layer-2 describes problems, design-fix decides CSS.

## Scripts

- **`scripts/static-gates.mjs`** — Layer-1 orchestrator (registry-driven; contrast hard-gates,
  exit 1). Lives in THIS skill; other skills reference it by cross-skill path. Invoke:
  `node "${CLAUDE_PLUGIN_ROOT}/skills/design-evaluate/scripts/static-gates.mjs" <profile.json> [--json]`
- **`scripts/check-token-contracts.mjs`** — Layer-1 gate for candidates that PROPOSE a palette:
  parses each candidate's embedded `#token-contract` (light/dark values + `gatedPairs`),
  recomputes WCAG AA (text ≥ 4.5 / graphic ≥ 3.0, both modes), exit 1 on any fail or
  unresolvable name. Invoke:
  `node "${CLAUDE_PLUGIN_ROOT}/skills/design-evaluate/scripts/check-token-contracts.mjs" <file.html|dir> [...]`
- **`scripts/derived-claims-gate.mjs`** — HONESTY gate (Gate A) for **data-bearing UI** (dashboards,
  price/status boards, anything that renders numbers from a data source). Renders the target in a real
  browser BOTH modes and diffs every numeric CLAIM in the rendered `innerText` against the project's
  data + injected constants: catches **fabrication** (invented numbers), **derivation drift** (a
  hand-rounded constant), **association** (a real figure under the wrong block), and a **false verdict**
  (an un-negated `BUY` in a non-buy block). Config-driven; hard-gate (exit 1). Invoke:
  `node "${CLAUDE_PLUGIN_ROOT}/skills/design-evaluate/scripts/derived-claims-gate.mjs" --config <project-claims.json> [--target <html>] [--json]`
- **`scripts/content-manifest-gate.mjs`** — HONESTY gate (Gate B): the anti-deletion floor. A page must
  not pass Gate A by DELETING the failing element — every required item in the manifest must be present
  in BOTH modes. Same manifest schema (id/description/scope/type/match/minCount). Hard-gate (exit 1). Invoke:
  `node "${CLAUDE_PLUGIN_ROOT}/skills/design-evaluate/scripts/content-manifest-gate.mjs" --manifest <manifest.json> --target <html> [--json]`
  Both honesty gates are surface-triggered (run them only on data-bearing UI), edition-agnostic, and
  resolve Playwright standalone via the sibling `design-render` install. Full config/manifest schemas,
  the injector pattern, the non-vacuity mutant ritual, and the dogfood record: `references/honesty-gates.md`.
<!-- FULL-ONLY-START -->
- **`scripts/seo-meta.mjs`** — scope-B SEO / share-meta lens (marketing surfaces only; dependency-free;
  parses a URL or HTML file). Advisory. Invoke:
  `node "${CLAUDE_PLUGIN_ROOT}/skills/design-evaluate/scripts/seo-meta.mjs" <url|file> [...] [--json] [--strict]`
- **`design-render/scripts/perf-budget.mjs`** — scope-B Performance/CWV budget lens (marketing surfaces
  only; Playwright lab load; lives in `design-render` next to the browser). Advisory. Invoke:
  `node "${CLAUDE_PLUGIN_ROOT}/skills/design-render/scripts/perf-budget.mjs" <url> [...] [--json] [--strict]`
<!-- FULL-ONLY-END -->
- **`${CLAUDE_PLUGIN_ROOT}/scripts/read-lessons.mjs`** — the plugin-shared lesson reader (injected above with this skill's id).

## References

- `references/layer-1-gates.md` — every machine gate, its validator source, and PASS/FAIL rule.
- `references/web-craft-rulebook.md` — the universal numeric craft thresholds (Layer-1.5): measure
  ≤75ch, line-height/tracking, tap-target ≥44×44, 5-states + focus-ring, one-`<h1>`, no-justified,
  OKLCH consideration — each tagged machine-checked / axe-covered / lens-Q.
- `references/honesty-gates.md` — the two data-bearing-UI honesty gates (derived-claims Gate A +
  content-manifest Gate B): the four failure classes (fabrication / derivation / association / false
  verdict) + deletion, the injector pattern (script computes, build injects, no model arithmetic, never
  clock-derived), the full config + manifest schemas incl. `perBlockMoneyScopes`, the non-vacuity mutant
  ritual (a gate that cannot fire is rejected), the live dogfood record, and the gate lifecycle rule.
<!-- FULL-ONLY-START -->
- `references/scope-b-marketing-lenses.md` — the two surface-triggered marketing lenses (SEO/share-meta
  + Performance/CWV budget), thresholds, citations, and the `surfaceType === "marketing"` trigger rule.
  Un-parked from scope A and first proven on the CohortWatch marketing site.
<!-- FULL-ONLY-END -->
- `references/baseline.md` — the SHIPPED regression memory: `baseline.mjs` capture/compare, the
  file shape, merge-base keying, the New / Regressed / lost-evidence / not-compared classification,
  measurement direction + tolerance, the refuse-then-propose re-baselining rule, and the honest
  statement that tolerant pixel diffing is not wired.
- `references/layer-2-lens-audit.md` — the 7-phase live audit, severity matrix, per-lens criteria, false-positive filter.
<!-- FULL-ONLY-START -->
- `references/layer-2-deep-pass-composites.md` — the eval-side mirror of the council's deep-pass bench (STORM use-case #2): surface-triggered composites (C1–C8, P56, P45, P25), composite→severity mapping, the audit-mode aggregation analog, the Layer-1 boundary, and the register-fit median gate (H1/H2). References the council's canonical definitions (one source of truth).
<!-- FULL-ONLY-END -->
- `references/output-contract.md` — the merged JSON verdict shape + the honest banner.
- `references/register-profiles.md` — how the per-project register changes what fails; do not homogenize.
- `references/anti-patterns.md` — the consolidated avoid-list for evaluation.
