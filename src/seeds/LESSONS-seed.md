# Seed lessons (shipped with the plugin — read-only)

These are field-verified lessons from the projects this plugin was built and
calibrated on, with project specifics generalized. They ship as the base layer
of the lesson store: entries with the same `id:` in your durable store or a
project's `.design/LESSONS.md` SHADOW these; this file is never edited at
runtime and is exempt from the 100-line cap that applies to living stores.
Source archetypes: "a warm consumer nutrition PWA", "a regulated
trust/compliance portal", "an analyst data product", "a price-tracker email
product" — four real production projects.

## Current entries

- id: L-001 | date: 2026-06-10 | status: promoted | confidence: high
  skills: design-email
  rule: Email canvas stays 600px via the width ATTRIBUTE — Gmail apps can honor it over CSS max-width; wider canvases squeeze phone renders.
  when: any HTML email layout work
  source: a price-tracker email product — a 720px desktop experiment broke the phone render, reverted same day.
  supersedes: none

- id: L-002 | date: 2026-06-10 | status: promoted | confidence: high
  skills: design-email
  rule: Email chips/badges never depend on background: — Gmail strips span backgrounds in compose-normalized flows; use text color + border only, and enforce with a test that rejects background: in chips.
  when: any badge/chip/pill in HTML email
  source: a price-tracker email product — a filled pill rendered invisible white-on-white in a real inbox.
  supersedes: none

- id: L-003 | date: 2026-06-11 | status: verified | confidence: high
  skills: design-render, design-evaluate, design-generate
  rule: Never put sentence-length microcopy in a white-space:nowrap container inside an overflow:hidden card — it clips silently AND pushes flex siblings out of view. Give flex text containers min-width:0, let sentences wrap, keep nowrap only on short data spans. Screenshot reviews must include the LONGEST real copy per state.
  when: card/list footers mixing data spans with sentence notes; any overflow:hidden surface
  source: a price-tracker email product — the owner caught a clipped footer note + a missing link on the LIVE dashboard; one nowrap rule caused both.
  supersedes: none

- id: L-004 | date: 2026-06-18 | status: verified | confidence: high
  skills: design-generate, design-council, design-content
  rule: AI screen-generators FABRICATE data when drawing mockups — inventing companies, dollar amounts, even licenses. Constrain generation to REAL sample fixtures, review every generated screen for fabricated facts before using it even as a reference, and never let generated copy reach the build.
  when: generating UI mockups/screens with an AI tool, especially for a data product whose pitch is auditability/honesty
  source: an analyst data product — a generator invented two companies, a "$3.2M led by [CONFIDENTIAL]" round, and asserted the wrong OSS license. Re-confirmed twice since (see L-030).
  supersedes: none

- id: L-005 | date: 2026-06-18 | status: verified | confidence: high
  skills: design-tokens, design-evaluate
  rule: A design system that CLAIMS WCAG AA is routinely wrong until a test computes it — ship the token module + a lockstep test that recomputes contrast for every gated pair in both modes BEFORE trusting any "AA-checked" comment.
  when: any multi-surface/multi-mode design system that asserts AA
  source: an analyst data product — its own comments claimed AA; the lockstep test found real failures (a 3.39:1 primary button, ~1.2–1.7:1 control borders).
  supersedes: none

- id: L-006 | date: 2026-06-18 | status: verified | confidence: high
  skills: design-render, design-direction
  rule: Never show a font-dependent design to the owner before its font files actually load — @font-face pointing at missing files silently falls back to system-ui and the owner judges the fallback as "cheap/bland". If the fonts are OSS, fetch them yourself. Corollary: "calm/minimal" ≠ "empty" — keep the core data always-visible; tabs hold only secondary detail.
  when: first owner review of any font-dependent or intentionally-minimal data UI
  source: an analyst data product — first owner look rendered in Segoe UI with the signal breakdown hidden behind a tab; verdict "too plain" until fonts + an always-visible breakdown fixed it.
  supersedes: none

- id: L-008 | date: 2026-06-19 | status: verified | confidence: high
  skills: design-tokens, design-evaluate
  rule: An AA-locked token system does NOT guarantee AA in the UI — the lockstep gates token PAIRS, but a component can pick the WRONG token and silently fail in one mode. Add a class-usage guard (lint banning fg/bg combos that aren't gated pairs, or per-component visual regression in both modes).
  when: any tokenized design system whose AA is enforced only by a token-pair test, once real components exist
  source: a regulated trust/compliance portal — a Button used `bg-primary text-white`; white-on-primary ≈ 2:1 in dark mode; that pair was never gated.
  supersedes: none

- id: L-010 | date: 2026-06-26 | status: verified | confidence: high
  skills: design-evaluate, design-council, design-render
  rule: SPACING/PROPORTION ships broken silently — review it as explicitly as color/AA. Recurring footguns: shared card primitives whose padding comes only from a className prop (give them a default); centered sub-page titles over absolute-positioned links (use a 3-zone grid); mockups reviewed at a guessed width instead of the app's REAL content width. Screenshot the LONGEST real copy per state at representative width, both modes.
  when: any form/card layout work; any review of an AI or hand-built mockup
  source: a warm consumer nutrition PWA — three "looks-fine" misses in one owner pass: padding-less card, title overlapping Back, and a false wrap alarm from a too-narrow mockup.
  supersedes: none

- id: L-011 | date: 2026-06-28 | status: verified | confidence: high
  skills: design-evaluate, design-tokens
  rule: A token-PAIR lockstep can't catch a component using a graphic-gated role as TEXT, or a role on a surface it was never gated against. The operative guard is a DOM-aware axe gate (WCAG 2.2 AA) visiting EVERY screen in BOTH themes, and it must BLOCK. Recurring fixes: aria-disabled on genuinely-inactive controls; per-theme choices for brand color on translucent chips; page-level chrome on the bare canvas needs the darker hover/muted role.
  when: any tokenized AA-locked design system once real components + screens exist; both themes always
  source: a regulated trust/compliance portal — the both-theme axe sweep caught five contrast violations the token lockstep never saw; independently re-confirmed on a second surface.
  supersedes: none

- id: L-012 | date: 2026-06-28 | status: promoted | confidence: high
  skills: design, design-council, design-generate, design-evaluate
  rule: A redesign tournament/council with NO incumbent in the candidate set and register-fit averaged into a flat mean can crown a winner WORSE than the current design: discipline lenses out-vote the register, so "cold-but-disciplined" beats "warm-but-characterful". Fixes (all baked into this plugin): (1) enter the current design as a labeled incumbent competitor; (2) register-fit is a GATE judged against the profile's stated register, not a scored taste; (3) a redesign wins ONLY if it beats the incumbent overall AND ≥ it on register-fit — else "current design wins — no change recommended"; (4) the brief's diagnosis is CONSTRAINTS, not scored taste; (5) match method to headroom — bold tournament for bad→good, incremental diff-polish for good→great.
  when: any AI redesign loop judging directions for an already-decent, on-register surface
  source: a warm consumer nutrition PWA — the council crowned a cold "Restraint" redesign the owner rejected as worse; recalibration verified by a blind cross-model oracle re-run.
  supersedes: none

- id: L-013 | date: 2026-06-27 | status: verified | confidence: high
  skills: design-render, design-direction
  rule: An owner cannot judge a design from HTML source, a file:// link, or an image only you viewed — RENDER to PNG and LAUNCH it on their machine (open/Start-Process both the PNG and the HTML), then ask. Render headless at deviceScaleFactor 2 after document.fonts.ready; ALWAYS assert the PNG exists and is non-empty before opening or trusting it (headless screenshot flags are browser-version-flaky — try the alternate flag on silent no-op).
  when: any owner review of a static mockup — direction picks, before/after, proportion passes
  source: a regulated trust/compliance portal — file:// links and chat-embedded images failed twice ("I can't see this"); only launching the rendered PNG worked. Cost three round-trips.
  supersedes: none

- id: L-014 | date: 2026-06-27 | status: verified | confidence: high
  skills: design-council, design-evaluate
  rule: Proportion/spacing/alignment/icon CRAFT needs its OWN review pass with a NUMERIC rubric — brand/direction lenses and honesty/AA QA all pass designs that are proportionally broken. Grade against an explicit system: a 4px spacing grid, one radius ladder (one radius per nesting depth), a locked type scale (nothing functional <12px, no off-scale sizes), a 3–4 step icon set at one stroke, a key:value rail contract. The loudest tell is a confetti of corner radii + off-grid gaps down one column.
  when: after a direction is chosen, before implementing; any owner feedback like "the proportions feel off"
  source: a regulated trust/compliance portal — a craft pass found ~2/3 of spacing off-grid, six card radii, and ten icon sizes that five brand lenses + an honesty QA had all passed.
  supersedes: none

- id: L-016 | date: 2026-06-29 | status: verified | confidence: med
  skills: design-generate, design-fix
  rule: For "did my action register?" feedback, the documented best practice is a SINGLE button that morphs — idle → pending (disabled, descriptive label, aria-busy) → a TRANSIENT inline success flash (~1.5s, icon + label + colour) — NOT a toast. Reuse the system's existing positive token for success (no new colour → the AA lockstep needs no change); respect the project's stated loading convention; give each independent save its OWN state instance.
  when: standardizing button/save feedback; anywhere tempted to add a toast or spinner for action-confirmation
  source: a warm consumer nutrition PWA — a pure state-machine + hook + presentational split fixed "one save disables the other" and retrofitted graceful failure/retry.
  supersedes: none

- id: L-017 | date: 2026-06-30 | status: verified | confidence: high
  skills: design-council, design-direction
  rule: Before building a screen a NON-TECHNICAL user will use, run persona agents (e.g. a 72-yr-old non-tech reader AND a time-pressed skimmer) that think aloud through the exact rendered mockup and list every confusion, misread, and wrong-data risk. Run TWO diverse personas and trust their CONVERGENCE — they surface clarity bugs that expert design lenses structurally miss.
  when: any consumer-facing UI where a non-expert reads or enters data, before locking structure + copy
  source: two projects independently — persona audits found the top clarity bugs (a total misread as per-serving; a protective waiting period misread as a signing deadline) that a 5-lens council AND a craft council had both missed.
  supersedes: none

- id: L-020 | date: 2026-06-30 | status: verified | confidence: high
  skills: design-tokens, design-evaluate
  rule: Extend "no raw color outside the token block" to the APP's hand-authored CSS register layers: slice the stylesheet from the end of the generated token block to EOF, strip comments, assert ZERO #hex/rgb()/rgba() literals. It is the static partner to the DOM-aware axe sweep — purity keeps the layer var()-only; axe catches a var used as the wrong role.
  when: any tokenized app whose global stylesheet carries hand-authored register layers below a generated token block
  source: a regulated trust/compliance portal — one cheap test now mechanically guards every current and future register layer.
  supersedes: none

- id: L-021 | date: 2026-06-30 | status: verified | confidence: high
  skills: design-content
  rule: An overloaded ACTION WORD reads as incoherence even when each use is individually clear — if one verb labels two different actions on a surface, the user can't predict a button. Give each action a distinct verb chosen to dodge EVERY competing overload; re-audit the WHOLE verb set across surfaces after any copy fix; collapse duplicate entry points for the same action to one.
  when: any app where one verb (log/add/accept/save) labels 2+ actions; owner says "this isn't coherent"
  source: a warm consumer nutrition PWA — "Add" meant both accept-planned and add-extra; unifying the verb set and removing duplicate doorways fixed the felt incoherence.
  supersedes: none

- id: L-022 | date: 2026-06-30 | status: verified | confidence: high
  skills: design-render, design-direction, design-generate
  rule: An owner reads a mockup as a SPEC — abbreviating repeated elements or freezing an inconsistent transient state triggers false alarms that burn a review round-trip. Render the REAL element set at REAL count and in a SELF-CONSISTENT state. When a finding is a mockup artifact, fix the mockup and say plainly which findings were artifacts vs real.
  when: any static mockup shown for a verdict, especially lists or transient states
  source: a warm consumer nutrition PWA — 2-of-4 items and a frozen "Added ✓" beside an empty list both read as bugs; both were mockup omissions.
  supersedes: none

- id: L-024 | date: 2026-07-01 | status: verified | confidence: high
  skills: design-evaluate, design-fix
  rule: Mockup-first + persona review is BLIND to (1) screen-reader semantics (roles/focus/text-equivalents don't exist in a static mockup) and (2) whole-page interaction coherence (two similar controls that stack on the real screen). After shipping any new interactive component, run a post-build multi-angle review (correctness + a11y + coherence) against the real code.
  when: after building a new interactive component on a screen that already has a similar control, or any icon-only state
  source: a warm consumer nutrition PWA — pre-build passes were clean; the post-build review found a wrong listbox role, unnamed icon states, and two look-alike search pills stacked.
  supersedes: none

- id: L-025 | date: 2026-07-01 | status: verified | confidence: med
  skills: design-generate, design-fix
  rule: Optimistic UI has three recurring traps beyond the happy path: gate any NAVIGATION the optimistic state exposes on the CONFIRMED write; report REFUSED (guard no-op — roll back, non-retryable) distinctly from FAILED (thrown — retryable); and announce results from an ALWAYS-MOUNTED sr-only live region. Mount-guard refs must be set true ON MOUNT (StrictMode double-invoke) and debounce keys cleared on settle.
  when: making any tap/action optimistic, especially one that links to where the result lands
  source: a warm consumer nutrition PWA — a post-build review caught the StrictMode ref bug and the debounce-eats-retry before ship; the live link during the write was the one new bug optimism introduced.
  supersedes: none

- id: L-026 | date: 2026-07-01 | status: verified | confidence: high
  skills: design-content, design-council, design-generate
  rule: For a new honesty/abstain display state ("claimed; not independently verified"), REUSE the product's existing low-confidence hedge grammar so honesty surfaces read as one system. Grant the claimed level and only LOWER confidence; carry meaning by shape+icon+text not color; never dim the label; REJECT hover-only/tooltip for the qualifier (hiding the one low-trust fact behind hover is an anti-honesty dark pattern); lock the invariant with a render-side contract test mirroring the backend's honesty assertions.
  when: adding an unverified/abstain state; any surface that over-asserts data the backend honestly hedges
  source: an analyst data product — a badge asserted confidence over hundreds of unverified claims; a 6-lens council converged unanimously on dashed-chip + separate qualifier line, zero new AA pairs.
  supersedes: none

<!-- FULL-ONLY-START -->
- id: L-027 | date: 2026-07-01 | status: promoted | confidence: high
  skills: design-council, design-evaluate
  rule: To derive or expand a council's lens set, a perspective-discovery pass (many expert-tradition agents → de-dup → adversarial refute → grounded synthesis) both validates a good hand-picked set and surfaces real gaps — but wire extra coverage as a surface-TRIGGERED deep-pass bench (composites seated only by the triggering artifact, cap ~12–13), NOT a flat standing panel: a flat 30+ panel is ~8× cost and maximally dilutes the register-fit gate. Keep machine-certain a11y on the machine gate, and enforce the aggregation contract: register-fit = pre-aggregation veto bound to the literal `_register` string; constraints excluded from the ranking mean; incumbent as competitor; count ≠ weight.
  when: expanding any council/evaluator's critique dimensions
  source: this plugin — two discovery workflows independently re-derived the L-012 recalibration; the composite bench then earned its seats on a real surface (an exact-percentile honesty blocker its base lenses missed).
  supersedes: none
<!-- FULL-ONLY-END -->

- id: L-028 | date: 2026-07-01 | status: promoted | confidence: high
  skills: design-council, design-evaluate, design-render
  rule: The register-fit GATE must be scored by a MULTI-JUROR MEDIAN on MODE-FAIR renders — never a single juror on whatever screenshot exists. A lone juror is noisy (flips on a blind re-run) and confounded by render mode (docking a light screenshot against dark challengers on a dark-first register). Staff an odd panel (5, min 3), take the median, unseat the incumbent only on a NON-OVERLAPPING supermajority; render every candidate including the incumbent in the same mode(s). Other lenses stay single-juror (they're constraints — their noise doesn't decide).
  when: running the register-fit gate in any council or evaluator redesign judgment
  source: this plugin's oracle validation — run 1's single juror crowned an owner-rejected variant via a light/dark confound; run 2's 5-juror median restored the correct verdict unanimously.
  supersedes: none

- id: L-030 | date: 2026-07-01 | status: verified | confidence: high
  skills: design-generate, design-council
  rule: Wrapping an external AI screen-generator as the beauty engine has two operational realities. (1) TOOLING: client "operation timed out" is often NON-signal — the job succeeds server-side minutes later; poll patiently, don't re-fire or escalate. A created design-system asset may need an explicit attach/update call before generation honors it. Sequential single generations beat parallel submissions. (2) HONESTY: given the same faithful data, one variant will still fabricate (an invented funding round, invented counts) — the honesty lenses must gate every batch, and for a data product OVER-SPECIFY the real values in the prompt; a tighter prompt gives the model room to invent. The generator raises the CEILING; the council's honesty floor + register gate keep its beauty truthful.
  when: integrating any external AI UI-generator behind the council; any honesty-first data product a model renders
  source: an analyst data product — same data, two variants: one faithful (won register 8.5), one fabricated a funding round and was disqualified by the honesty gate.
  supersedes: none

- id: L-031 | date: 2026-07-01 | status: verified | confidence: high
  skills: design, design-ground, design-direction
  rule: For a data product whose pipeline is still being built, the last mile from ~7.5 to great is NOT visual craft — it is information architecture + information quality, and it is blocked on the real data shape. Lock the register/visual system early (data-independent), DEFER the ordering/how-much/accuracy pass until the pipeline stabilizes, and tell the owner to expect re-iteration. Pre-empt three recurring owner asks: a dark-first register still needs a working light toggle; a text-dense view needs honest data-viz on real values; make drill-down explicit (each row expands to its evidence).
  when: designing any data product mid-pipeline; owner says "design is good but not great / not detailed enough"
  source: an analyst data product — the visual loop plateaued at "much better, ~7.5–8" and that was the right place to pause; the remaining gap was data+IA, not pixels.
  supersedes: none
