# design-fix seams — handoffs to render, gate, baseline, and profile

design-fix is the mutation hinge of the loop. It consumes findings from the
graders, mutates, then hands the touched surface BACK to the existing render and
gate scripts to prove the fix. It must NOT re-author those scripts.

Contents:
- [Who feeds design-fix](#who-feeds-design-fix)
- [Scripts to invoke (never re-author)](#scripts-to-invoke-never-re-author)
- [The baseline regression check](#the-baseline-regression-check)
- [The profile inputs](#the-profile-inputs)
- [The full loop in seam terms](#the-full-loop-in-seam-terms)

---

## Who feeds design-fix

- **design-evaluate** — Layer-1 (machine gate, `static-gates.mjs`) findings name
  an exact failing assertion + element. Layer-2 (lens) findings DESCRIBE problem +
  impact, **with no prescribed CSS value** (the Problems-Over-Prescriptions
  contract, `OneRedOak design-review-agent.md` L68). design-fix is the skill that
  decides the value.
- **design-council** — consolidated multi-lens findings (deduped, severity-ranked,
  false-positive-filtered). Same shape; same contract.
- **The `design` router** — dispatches a FIX intent here with the findings set +
  the active profile path. design-fix does not route; it executes the loop.

Seam rule (from design-evaluate, honored here): **Layer-2 reasoning never
overrides a Layer-1 FAIL, and a Layer-1 PASS is never "design approved".** A fix
that clears a Layer-1 gate has cleared a *correctness* finding, not earned taste
approval.

## Scripts to invoke (never re-author)

These scripts live in their OWNING sibling skill's `scripts/` dir. Invoke
them by cross-skill path; do NOT reimplement render or the gates inside design-fix.

- **Re-render the touched surface** — design-render:
  `node "${CLAUDE_PLUGIN_ROOT}/skills/design-render/scripts/render.mjs" --target <t> --out <dir> ...`
  Renders the requested viewports + light/dark (and the reduced-motion variant when
  motion changed), emitting the PNG cells + the `render.json` manifest.
- **Re-evaluate only the violation + baseline** — design-evaluate Layer-1:
  `node "${CLAUDE_PLUGIN_ROOT}/skills/design-evaluate/scripts/static-gates.mjs" <target>`
  All-or-nothing machine gate (contrast light+dark, real-render hover/focus
  contrast, axe, focus-trap, responsive overflow, rauno micro-checks,
  token-conformance). Exit 0 = the targeted assertion now passes; exit 1 = still
  failing or regressed.

For Layer-2-described findings with no machine assertion, the "re-evaluate" step
is a re-judgment of the described problem on the freshly re-rendered DOM (does the
problem still read?), then a Layer-1 run to confirm nothing machine-checkable
regressed.

## The baseline regression check

`.design-baseline.json` (merge-base keyed) classifies every finding
**New / Persistent / Fixed / Regressed**. After a fix:
- The targeted finding should move to **Fixed**.
- **No finding may appear as New or Regressed** because of the edit (Regressed =
  auto-top-severity).
- If the edit introduced a New/Regressed finding, **REVERT it** (recipe.md
  revert-on-regression) — a fix that trades one finding for another is net zero
  and FAILS (P2 / F6).

Do not re-litigate Persistent findings that the run wasn't asked to fix; surface
only the targeted finding's transition + any New/Regressed the edit caused.

## The profile inputs

Read `${CLAUDE_PLUGIN_ROOT}/profiles/<project>.json` (or the path the router
passes). Fields design-fix relies on:

- **`tokenModule`** — the single token source of truth; every fixed
  color/size/space/duration resolves to a semantic name from here.
- **`allowRawColorIn`** — the only files allowed to carry raw hex (the token
  source + the generated token block). A literal anywhere else is FAIL F4.
- **`bannedClusters`** — values a fix must never introduce (e.g. AI-cyan
  `#16d5e6`, the default purple→pink gradient).
- **`_register`** — the project's design register (e.g. a regulated trust portal's
  serious-trust; a warm consumer app's warm-premium-fun-but-calm; an analyst data
  product's analyst-terminal). A fix that pulls the
  surface toward a global default violates P5 — never homogenize.

## The full loop in seam terms

```
findings (from evaluate/council, problems-described)
  → classify surgical|structural          [recipe.md]
  → guard: not-slop? structural?          [guards.md]
  → decide minimal token-true edit        [auto-rewrites.md + profile.tokenModule]
  → Edit tool: exact string replacement   [guards.md Guard 3]
  → render.mjs  (design-render)           [re-render touched surface]
  → static-gates.mjs (design-evaluate)    [targeted assertion PASS?]
  → diff .design-baseline.json            [zero New/Regressed?]
  → PASS → record Fixed | FAIL → revert + re-classify
  → next finding (blockers first)
```

Nothing in this loop re-implements rendering or the gates. design-fix owns only
the decision + the surgical edit; the existing scripts own the proof.
