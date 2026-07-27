# Changelog

## [Unreleased]

Harborline repair pass (2026-07-26):

- Cleared two of the worked example's three honestly-committed gate FAILs through
  the documented repair loop (ChoiceGate-admitted `pixelhelm-repair` pass, surgical
  edits only — `examples/harborline/repairs/2026-07-26/REPAIR.md`): the structural
  output floor (real `header/main/footer` landmarks, real `<h2>` section headings,
  honest meta description) and the 280/320 px overflow (the stations table got its
  own `overflow-x` container). All ten committed gate records and the render matrix
  regenerated against the repaired page; the offline suite's Harborline assertions
  updated to the new truth (the output-floor gate must now pass live and committed).
- The third FAIL stands honestly with its cause now diagnosed under a
  pre-registered protocol: the emulated-mobile frame-time p95 (49.9 ms vs the 33 ms
  budget) is a throttle-invariant headless frame-scheduling stall — one multi-vsync
  gap per scripted wheel step, absent at DPR 1 and absent for a plain-text control
  page, with tracing showing all processes idle during the stall. Harness/
  environment characteristic, not page-authored cost; the page was deliberately not
  edited to game the budget.

Validation program (2026-07-26, from the external capability assessment):

- Ran and committed the program's first full loop run (E1/E2) on a sealed
  synthetic utility brief: three arms, all shipped HARD gates green, 4/4 mutant
  ritual, validated aggregate records, divergence thresholds met as measured,
  owner-signed approved-with-changes. Full trail:
  `evals/validation/e1/run-2026-07-26/`. Recorded calibration finding: the
  blind panel scored ≈1 point above the owner (9+ medians now read as "strong,
  owner-verify" — Amendment C1 in the E3 rubric sheets).
- Commissioned and committed an independent adversarial critique of that run
  (two-critic pattern): grade adjusted to *completed and arithmetically
  reproducible with material pre-registration defects* — per-juror record
  machinery gap, an in-loop-feedback caveat on the palette divergence result,
  and approval status lines that had never been flipped from DRAFT (now
  corrected). Critique + finding-by-finding response live in the run directory.
- Sealed pre-registrations for the E3 transfer briefs (SaaS / commerce /
  editorial), the E5 comparator rule with pinned template picks, and the E6-A
  motion-launch experiment.
- Owner-authorized ChoiceGate v0.2.1 re-acceptance after the pinned private
  checkout was lost to a public-history rewrite
  (`evals/validation/reacceptance-2026-07-26/`).
- Hygiene: the repo test and packaging lint now also catch JSON-escaped
  user-path leaks; committed E1 artifacts were redacted accordingly.

Deferred P0 floor mechanisms from the 2026-07-26 external capability assessment
(backlog items P0-4 / P0-5 / P0-6), building on the truth-reconciliation pass:

- Shipped the four browser-arm floor validators that `layer-1-gates.md` previously
  carried as SPEC: `verify_responsive.mjs` (280/320/414 px overflow, culprit named),
  `verify_states.mjs` (state-aware contrast in default/hover/focus, both modes),
  `verify_focustrap.mjs` (dialog keyboard-trap semantics with real key presses), and
  `verify_targetsize.mjs` (WCAG 2.2 2.5.8 with measured spacing/inline exceptions,
  beyond axe's rule). Both editions; Playwright resolved from the render skill's
  install; loud exit 2 when missing, never a silent skip.
- Shipped `output-floor-gate.mjs`, a static HARD gate for the structural output
  floor: main landmark, heading presence/order, styled-div heading impostors, meta
  description (the Harborline gap class, encoded as a gate rather than advice).
- Shipped `records.mjs` (pixelhelm-loop) — writer + validator for
  `pixelhelm/judge-verdict@1`, `pixelhelm/signoff@1`, `pixelhelm/run@1`:
  validate-then-write, append-only archives, ledger append, and integrity checks
  (odd juror count, per-juror score arity, recomputed medians, real winner ids). No
  future panel can be reported without leaving a validating artifact.
- Committed the first gate-run artifacts: `examples/harborline/gates/` holds every
  floor validator's run against the worked example, including two honest FAILs (the
  output floor's three documented gaps; a 280/320 px table overflow newly caught).
- `layer-1-gates.md` / `gates-and-loop.md` SPEC labels flipped to shipped-hard for
  the landed validators; the offline suite grew from 19 to 26 tests and now
  exercises the offline gate scripts directly.

Behavior-level verification (backlog item P1-5, designed from the requirements —
no external tool's implementation was consulted or reused):

- Shipped four behavior-level validators in the evaluate script family (both
  editions, same exit contract, Playwright resolved from the render skill's
  install, loud exit 2 when missing): `verify_scrollcapture.mjs` (deterministic
  scroll-position capture under an explicit page-readiness contract — readyState /
  fonts / layout-settle / declared animation state — with cross-pass offset and
  screenshot-hash reproduction), `verify_frametime.mjs` (nearest-rank p50/p95/max
  rAF frame times over a scripted wheel-scroll pass; pre-registered budget shapes
  p95 ≤ 16.7 ms desktop / ≤ 33 ms emulated mobile at 4× CPU throttle; a 1.0 ms
  fixed jitter allowance that is a source constant, never a flag),
  `verify_cwv.mjs` (lab LCP / CLS / INP-proxy under scripted interaction with
  default navigation suppressed, desktop + emulated mid-tier mobile, configurable
  budgets, explicit zero-measure when a page has nothing to interact with), and
  `verify_keyboard.mjs` (a committable record of the real Tab / Shift-Tab / Enter
  path: order, per-stop focus-indicator evidence from a blurred-vs-focused
  computed-style diff including pseudo-elements, exact-reverse requirement, and
  optional Enter activation probes).
- Committed their Harborline runs under `examples/harborline/gates/`, including a
  new honest FAIL: frame-time p95 83.2 ms against the 33 ms emulated-mobile budget
  (the page is untouched — the failing run is the to-do, per the method law). The
  keyboard and INP-proxy records are explicit zero-measures on this zero-control
  page, never implied conformance.
- `verify_lib.mjs` gained the shared page-readiness contract, nearest-rank
  percentile math, and the style-diff helper; the offline suite grew from 26 to 30
  tests (validator contracts + committed-artifact shapes + exact pure-math checks).

## [0.1.2] - 2026-07-19

Patch release of the standalone Python distribution only; the plugin family stays at
`2.0.0`.

- Added Repository, Issues, and Changelog links to the Python package metadata.
- Corrected the first-use prerequisite to Python 3.12+ and pinned it to package metadata
  with an offline regression.
- Reconciled current-facing public-state and test-count surfaces with the public GitLab
  project, PyPI 0.1.1 baseline, and the 19-test suite without inventing source provenance
  for the existing artifact.
- Bound generated family/plugin metadata to the confirmed public GitLab project URL.

No version compare link is recorded for 0.1.2 because no matching 0.1.1 source tag exists.
The later tag, tag push, GitLab Release, and PyPI publication remain separate owner actions.

## pixelhelm (PyPI) 0.1.1 — 2026-07-18

Patch release of the standalone Python distribution only; the plugin family stays at
`2.0.0`.

- Fixed the `0.1.0` packaging issue: the wheel installed three top-level packages
  (`pixelhelm`, `storm_engine`, `design_adapter`), the latter two generic names that
  could shadow or collide with other distributions. The wheel now installs exactly one
  top-level package: the engine ships as `pixelhelm.storm_engine` (still byte-verbatim
  from the generated Full edition) and the adapter as `pixelhelm.design_adapter` (a
  packaging mirror with only its engine imports relativized).
- Breaking for direct importers of the old top-level names: `import storm_engine` /
  `import design_adapter` become `from pixelhelm import storm_engine` /
  `from pixelhelm import design_adapter`. The `pixelhelm` top-level re-exports are
  unchanged. No compatibility shims are installed — reintroducing the generic names
  would defeat the fix.
- The standalone storm trees in the repository (`src/skills/design-storm/storm/`,
  `plugins/*/skills/pixelhelm-evidence-brief/storm/`) are untouched and still run
  from their own directories with local top-level imports.

## [2.0.0] — 2026-07-16

Private pre-public release candidate for the PixelHelm family migration.

- Replaced the former product and skill IDs with the atomic `pixelhelm-*` family while
  retaining 19 explicit, non-coeligible compatibility aliases.
- Added the thin, fail-closed ChoiceGate admission boundary and pinned the accepted
  ChoiceGate and capability inventory authorities used by the candidate.
- Split the product into mutually exclusive Lite (default) and Full editions with 15
  and 25 atomic skills respectively.
- Moved new durable writes to `.pixelhelm/` and retained legacy state only as a
  read-only fallback that fails closed on byte conflicts.
- Added private-pre-public governance, proof-led documentation, release preparation,
  and offline validation without creating a tag or performing an outward action.
- Selected `2.0.0` because the canonical plugin and skill identities changed. The
  canonical GitLab URL remains owner-required, so compare links are intentionally
  omitted until that identity is confirmed.

Honesty-gate promotion — two battle-tested project-local gates generalized into
`design-evaluate` as edition-agnostic, config-driven honesty machinery (no version cut).

- **Derived-claims gate (Gate A, both editions):** `design-evaluate/scripts/derived-claims-gate.mjs`
  — a config-driven port of the proven derived-claims diff for data-bearing UI. Renders the target in
  a real browser BOTH modes and diffs every numeric claim in the rendered `innerText` against the
  project's data + injected constants: catches fabrication (invented numbers), derivation drift (a
  hand-rounded constant), association (a real figure under the wrong block), and a false verdict (an
  un-negated `BUY` in a non-buy block). Config declares `dataFiles[]`, optional `derivedFile`,
  `modelBlockAttr`, `perBlockMoneyScopes`, `globalAllow[]`, `verdictWord` + `negationWindow`, and
  `extraNumericContexts`. Hard-gate (exit 1).
- **Content-manifest gate (Gate B, both editions):** `design-evaluate/scripts/content-manifest-gate.mjs`
  — the anti-deletion floor. A page must not pass Gate A by DELETING the failing element; every required
  manifest item (id/description/scope/type/match/minCount) must be present in BOTH modes. Hard-gate (exit 1).
- **Reference (both editions):** `design-evaluate/references/honesty-gates.md` — the four failure classes
  + deletion, the injector pattern (script computes, build injects, no model arithmetic, never
  clock-derived), the full config + manifest schemas, the non-vacuity mutant ritual (a gate that cannot
  fire is rejected), the live dogfood record, and the gate lifecycle rule (project-local dogfood before
  shared-infra promotion — retro-corpus proves recall, live-dogfood proves precision).
- **Render feel hygiene:** `design-render/scripts/render.mjs` gains `--feel` (drive the page with
  motion ON and capture scroll-depth frames, deleting every stale `feel-*.png` first so a fixed bug
  can never resurface from an old frame) and an `--outdir` alias for `--out`.
- Both honesty gates run standalone with `node` and resolve Playwright via a multi-path `createRequire`
  fallback (env override → sibling `design-render` install → plain resolution), so no absolute path is
  embedded. Wired into `design-evaluate` SKILL.md as surface-triggered (data-bearing UI) Layer-1 gates.

## 1.3.0 — 2026-07-06

External-design absorption (scope A) + the scope-B marketing lenses, un-parked and
first-proven on a real marketing site (CohortWatch), plus the L-045 Tailwind-collision
baking. The reusable substance from Jack Roberts' "Every Level of Claude Websites" video
(a 7-levels grounding method) + his `power-design` skill (numeric thresholds), reconciled
without diluting the moat (honesty gate, register-fit + incumbent guard, blind median
tournament, learn-loop).

- **Design-extraction method (both editions):** a new first-class `design-ground`
  method (`design-ground/references/design-extraction.md`) — point at a reference
  site, READ it (rendered page or owner-supplied screenshot, never an image-blind
  fetch), extract its full design DNA as SYSTEM QUALITIES only (ramp shape / scale
  ratio / space rhythm / composition / motion / a11y — never hex, pixels, shots, or
  copy), and ground exactly ONE tournament arm to match its altitude and BEAT it. It
  is L-037 (external best-in-class altitude) made repeatable; the ground context emits
  `extractionBrief`, consumed by design-generate's E3 north-star arm. Grounds ONE arm
  only (L-040 anti-homogenization); register-fit stays the gate.
- **Grounding-completeness self-check (both editions):** design-ground's emit step now
  reports `groundingCompleteness` — which grounding legs a pass used (profile+register ·
  token contract · reference sources · real data · extraction/brief) and an
  UNDER-GROUNDED flag when an altitude-mandate redesign reaches for an absolute bar with
  none of them — a cheap gate that catches a Level-1 ungrounded run before it wastes a
  tournament.
- **Galleries reconciled into a human-supplied-screenshot tier:** Godly/Awwwards/
  Land-book/Mobbin/Magic-UI are NOT dead — they fail AGENT fetch (so are correctly not
  ground-time fetch entries) but are valid VISUAL references when a human supplies the
  screenshot (or the real page is rendered / extracted). Updated the reference-sources
  seam, the local registry note, and the L-042 lesson (a dated refinement).
- **Web-craft rulebook (both editions):** `design-evaluate/references/web-craft-rulebook.md`
  — the universal numeric craft floor (measure ≤75ch, line-height/tracking, tap-target
  ≥44×44, 5-states + focus-ring, one-`<h1>`, no-justified, OKLCH consideration), each
  threshold tagged machine-checked / axe-covered / Layer-2 lens-Q. Marketing-page
  concerns (performance budget/CWV, SEO/share-meta, asset generation) are PARKED as
  surface-triggered lenses (scope B, not built).
- **New `webCraft` Layer-1 machine gate:** `static-gates.mjs` now soft-reports the two
  statically-decidable rulebook thresholds — a TEXT color at reduced opacity (which
  ESCAPES a full-opacity token-contrast lockstep and can ship sub-AA invisibly) and
  justified body text. SOFT (never changes the exit code); a false positive can't block
  a build. Proven on the Lentova `est.` caption (`text-…/70` → 3.99:1); captured as
  lesson L-048.
- **Scope-B marketing lenses (full edition; un-parked):** two surface-triggered,
  machine-certain, advisory lenses that fire ONLY when `profile.surfaceType ===
  "marketing"` and NEVER touch the contrast hard-gate. **SEO / share-meta**
  (`design-evaluate/scripts/seo-meta.mjs`, dependency-free) — title ≤60, description
  ≤155, canonical, OG + 1200×630 dims, twitter:card, JSON-LD parse, one-`<h1>`.
  **Performance / CWV budget** (`design-render/scripts/perf-budget.mjs`, Playwright lab
  load, co-located with the browser) — LCP<2.5s, CLS<0.1, JS≤300KB WIRE bytes,
  hero≤200KB, ≤2 font families, 0 undimensioned images; measures encoded transfer
  (`request().sizes()`) against a PRODUCTION build, excludes `next/font` fallback +
  dev-overlay faces, and honestly omits INP (not measurable on a cold load). Spec +
  citations: `design-evaluate/references/scope-b-marketing-lenses.md`. New profile
  field `surfaceType` (`marketing`|`app`|`data`|`email`). LITE drops both scripts +
  the reference (scope-B is a full-edition capability). First-proven on the CohortWatch
  marketing site (9 real SEO FAILs caught → 0; all CWV budgets pass on the prod build);
  captured as lesson L-049.
- **L-045 Tailwind-collision baked (both editions):** `design-generate/references/
  token-law.md` now carries the utility-name-collision rule — never name a hand-written
  semantic hook with a bare utility shape (`m-*`, `p-*`, `text-*`…); the framework mints
  that exact utility and its declaration stacks onto your rule, shipping past AA/axe/
  token gates because none parse layout. Prevent by prefixing every hook; diagnose via
  the `getBoundingClientRect` vs `getComputedStyle` mismatch heuristic. Lesson L-045
  now verified AND baked. Also: L-037 (external-best-in-class altitude / design-
  extraction) flipped `proposed → verified` on the CohortWatch Phase-1 win.

## 1.2.0 — 2026-07-05

Wave-2: the reference-source registry, owner-involvement modes, and the round-2
flagship harness lessons baked in.

- **Reference-source registry seam (both editions):** design-ground gains a
  structured FETCH RITUAL over a curated registry of external design sources
  (`design-ground/references/reference-sources.md`) — every entry carries a
  VERIFIED fetch entry-point + date, type, what-to-take / what-never-to-take,
  licensing tier (code-liftable / system-qualities-only / paraphrase-only),
  version pin, and staleness window. The ground context now emits
  `referenceSources`; the registry itself is owner data (project `.design/` or
  the durable data dir), never shipped in the plugin.
- **Per-arm divergence axes (both editions):** design-generate's tournament arms
  each get a DIFFERENT registry subset appended to their persona (taste-engines
  §divergence-axes) — a shared brief with persona-only variation is a proven
  homogenization attractor. The a11y canon (W3C ARIA APG) is every arm's FLOOR,
  never an axis. Plus: per-arm register-adjective emphasis, an optional
  serialized motif-ban chain, and a pre-render convergence check by the chair.
  The E5 external-engine adapter prompt may carry an axis too (full).
- **Council citations (both editions):** lens/craft seats may cite CONSULTED
  registry canon (APG for interaction contracts, design-system canons for system
  claims, judging-principle sources paraphrase-only) — a citation grounds a
  finding, never raises its rank; the register-fit gate is untouched.
- **Owner-involvement modes (both editions):** new profile field
  `ownerInvolvement: "hands-on" | "autonomous"`. Autonomous stays the unchanged
  default (ONE final approval gate). Hands-on adds cheap early checkpoints
  before the expensive stages: ground-confirm, a direction pick on throwaway
  mockups (full edition; mandatory pre-tournament), and a post-council
  "does ANY reach your bar?" check. Unset → the router asks once and offers to
  record the answer.
- **Harness bakes from the round-2 flagship:** render.mjs injects a FIXED
  transitions/animations-off style tag before the luminance probe (kills the
  mode-fidelity false-warn on theme-transition pages; shots read end-states);
  the extreme-content substitution contract now REQUIRES swapping derived
  strings (totals, after-tax, %-offs) so extreme renders are never
  self-contradictory; NEW-PALETTE tournament candidates embed a machine-checked
  `#token-contract` block, gated by the promoted
  `design-evaluate/scripts/check-token-contracts.mjs` (AA recomputed per
  candidate palette, both modes; meaning-bearing pairs only).

## 1.1.0 — 2026-07-02

Wave-1 hardening: the practiced-but-unbaked methods move into the loop, and the
install experience gets a preflight.

- **External-generator seam (full):** a generator-agnostic adapter contract
  (`design-generate/references/external-engines.md`) — grounded prompt + design
  system in → standalone HTML out → MANDATORY fabrication re-verify + token-conform
  → competes as a labeled `E5-external:<engine>` tournament arm. Engines ship as
  adapters: **Stitch** (reference implementation, MCP) and **Claude Design**
  (official MCP, probe-then-adopt); v0 documented, flagged off. Fail-soft: no
  engine attached ⇒ the internal E1–E4 engines run, nothing breaks.
- **Persona bench (full):** C8 — two diverse think-aloud persona subagents on
  consumer-facing surfaces; convergence = constraint-grade finding
  (`design-council/references/persona-bench.md`; also pre-build on direction
  mockups). Register-subordinate by construction.
- **Craft numeric rubric (both editions):** the Craft seat now grades proportion
  against a numeric contract — 4px grid, radius ladder, type-scale adherence,
  icon size-set, key:value rails (`design-council/references/craft-rubric.md`).
- **`--axe` render arm (both editions):** design-render vendors axe-core and can
  run it per rendered cell, both modes; per-cell serious/critical land in
  `render.json` and design-evaluate Layer-1 hard-gates on them when run.
- **`scripts/doctor.mjs` (both editions):** one-shot preflight — node, per-version
  render deps, browser, profile + `_register`, token contract, data dir,
  python-for-STORM — one fix line per failure.
- **`design/run@1` run record:** the router's Close-the-loop step now archives
  per-run instrumentation (edition, skills, engines, council shape, iterations,
  MEASURED tokens, wall clock, outcome) so cost comparisons accrue from real runs.
- render.mjs missing-dependency error now prints the exact per-OS fix; README
  gained a PowerShell setup variant, a required-vs-optional table, and a
  zero-config first run on the shipped example.

## 1.0.0 — 2026-07-02

Initial public release: two editions of the honesty + register floor for
AI-generated UI.

- **design-pixelhelm** (full): 19 skills — the ground → generate → render →
  judge → fix → learn loop, two-tier council (fast 7-seat pass + surface-
  triggered deep composite bench), the STORM verified-brief research engine,
  and the craft suite (color, typography, motion, dataviz, content, email,
  video).
- **design-pixelhelm-lite**: the 9-skill core loop with the FAST 7-seat
  council (register-fit 5-juror median gate + honesty lens included). No
  python, no deep bench.
- Durable learn loop: lessons/verdicts/sign-offs live outside the plugin
  (survive updates); one shared reader with per-skill tags.
- Worked example: the Harborline status-page demo (labeled-synthetic fixture
  with honesty bait) + the model-dependence experiment that validated the
  floor.
