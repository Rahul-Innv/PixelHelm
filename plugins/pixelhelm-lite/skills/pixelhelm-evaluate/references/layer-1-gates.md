# Layer-1 — machine-certain HARD gates

> ToC: [Orchestrator contract](#orchestrator-contract) · [Gate catalog](#gate-catalog) ·
> [Contrast: REQUIRED vs ADVISORY](#contrast-required-vs-advisory) · [Real-render state contrast](#real-render-state-aware-contrast)
> · [axe-core](#axe-core-a11y) · [Focus trap](#focus-trap) · [Responsive overflow](#responsive-overflow)
> · [Target size](#target-size-wcag-22-258) · [Output floor](#output-floor-landmarks--headings--meta-description)
> · [Promoted micro-checks](#promoted-interface-quality-micro-checks) · [Conformance](#conformance-the-moat)
> · [Run profile](#run-profile)

Layer-1 is the machine floor: PASS/FAIL with **no model in the loop**. A FAIL here cannot be
argued past by Layer-2. The orchestrator is `scripts/static-gates.mjs`; this file documents what
it runs and the exact pass rule of each gate so a reviewer can verify the script's behavior.

## Orchestrator contract

The shipped orchestrator is `scripts/static-gates.mjs` — dependency-free, browser-free, driven by
the PROJECT PROFILE:

```
node "${CLAUDE_PLUGIN_ROOT}/skills/pixelhelm-evaluate/scripts/static-gates.mjs" <profile.json> [--json]
```

Exit **1** iff a HARD gate fails (contrast); exit **2** on runner error; **0** otherwise. Soft-gate
findings are always REPORTED but never change the exit code.

The BROWSER-ARM floor validators (`verify_responsive.mjs`, `verify_states.mjs`,
`verify_focustrap.mjs`, `verify_targetsize.mjs`) and the static `output-floor-gate.mjs` are
separate commands with the same exit contract (0 pass · 1 HARD fail · 2 runner error, `--json`
for machine-readable output); the browser ones resolve Playwright from the sibling
`pixelhelm-render` skill's per-version install and fail LOUDLY (exit 2) when it is missing —
never a silent skip. Principles every gate encodes:

- **Only CERTAIN, fully-computable checks hard-gate**; checks with a real false-positive surface
  report for human judgment instead of failing the build.
- **Iterate the gate registry; do NOT hard-code the count** — the count grows as gates are added.
- A check whose input is genuinely absent may print `SKIPPED` — never silently pass a check whose
  tool failed to load.

## Gate catalog — what SHIPS today

| Gate | Kind | PASS rule |
|---|---|---|
| Token contrast, light + dark | **HARD** (exit 1) | Every gated pair ≥ its WCAG 2.x threshold in BOTH modes. Uses the project's own `tokenModule` (`evaluateGatedPairs()` / `TOKENS`+`GATED_PAIRS`) when it exports one, else the profile's inlined `tokens`+`gatedPairs` through the bundled engine. "Change the hex, never the threshold." |
| Raw-color walk | soft (reported) | No `#hex`/`rgb()` literals in source outside the profile's `allowRawColorIn` files. |
| Anti-cliché grep | soft (reported) | No profile `bannedClusters` signature appears in source. |
| Type-scale check | soft (reported) | Font sizes conform to the project scale (off-scale values reported). |
| Web-craft signals | soft (reported) | Source scan for the two mechanical `web-craft-rulebook.md` thresholds that are statically decidable: (a) a TEXT color at reduced opacity (`text-<token>/NN`, alpha/8-digit-hex `color:`) — it ESCAPES the token-contrast lockstep (full-opacity pairs only), so composite the alpha and re-check AA (proven on Lentova 2026-07-06: `text-…/70` → 3.99:1); (b) justified body text (`text-justify` / `text-align:justify`). Reported, not a hard gate (real FP surface — an intentional dim on a large-text/graphic element can still pass). |
| axe-core on rendered cells (opt-in) | **HARD when run** | Run `pixelhelm-render`'s `--axe` arm (vendored axe-core, per rendered cell, both modes); `render.json` carries per-cell serious/critical. ANY serious/critical violation = Layer-1 FAIL. Not run ⇒ say so in the banner — never imply it passed. Covers rulebook #11 (`page-has-heading-one`/`heading-order`) and #7 (`target-size`, 24px). |
| Output floor: landmarks / heading hierarchy / meta description | **HARD** (exit 1) | `output-floor-gate.mjs <file.html>` — static, dependency-free: exactly one `<main>` landmark; an `<h1>`; no skipped heading level; no styled-div section titles (a non-heading tag whose class NAMES it `section-title` is a self-declared heading that is not markup); `<meta name="description">` present and non-empty. |
| Responsive overflow at 280/320/414 | **HARD when run** (browser) | `verify_responsive.mjs <file.html\|url>` — at each width, `documentElement.scrollWidth - clientWidth <= 1`; on fail it names the widest culprit elements. |
| State-aware contrast (default/hover/focus) | **HARD when run** (browser) | `verify_states.mjs <file.html\|url>` — computed text color vs the ancestor-resolved, alpha-composited background per state, BOTH modes; 4.5:1 (3:1 large text / icon-only); disabled + native toggles exempt; background-image behind a control ⇒ needs-review, never silently passed. |
| Focus trap (dialogs) | **HARD when run** (browser) | `verify_focustrap.mjs <file.html\|url> --trigger <sel>` — role/aria-modal/accessible name; Tab pressed more times than there are focusables never escapes; Escape closes AND returns focus to the trigger. No dialog on the page ⇒ explicit not-applicable, never a silent pass. |
| Target size (WCAG 2.2 2.5.8) | **HARD when run** (browser) | `verify_targetsize.mjs <file.html\|url>` — every interactive target ≥ 24×24 CSS px at a mobile viewport, with the inline and MEASURED spacing-circle exceptions implemented (beyond axe's rule, which leaves spacing to "needs review"); equivalent-control exemptions must be DECLARED via `--exempt` and defended in the verdict. |

## Not yet wired (designed, honest status)

These are part of the intended machine floor but have NO shipped validator in this skill — when
one of them matters for a verdict, run it via the project's own harness or say plainly it was not
machine-checked. Do NOT present them as gated:

- **Whole-APP axe sweeps** (every screen/route, interactive states) — the render `--axe` arm (now
  shipped, see the catalog above) covers the RENDERED surfaces it is pointed at; sweeping a whole
  app across navigation still belongs to the project's e2e harness (the L-011 pattern).
- **States-present** (a control DEFINES distinct hover/focus styles at all) — `verify_states.mjs`
  measures the contrast of the states a control HAS; it does not fail a control whose focus style
  is merely identical to default (that family lives in the promoted micro-checks below).
- **Promoted micro-checks** (input 16px; `outline:none` ⇒ `:focus-visible`; icon-only ⇒ aria-label;
  no `font-weight` hover shift; `tabular-nums` on dynamic numbers) — greppable subset, not yet in
  the registry.
- **Computed-style conformance** (`getComputedStyle` === resolved token, sRGB epsilon) — designed
  (see pixelhelm-tokens `references/conformance.md`), no harvester ships.

## Contrast: REQUIRED vs ADVISORY

**SPEC — no `validate_contrast.py` ships in this skill** (the shipped contrast gate is
`static-gates.mjs` on the token contract; this section specifies the fuller split a future
validator should implement). The split matters because de-emphasized text is a DECISION, not a defect.

- **REQUIRED (fail build):** body text on page/card, secondary text, link, text-on-primary-action
  (all 4.5:1), essential control border (3:1, WCAG 1.4.11). Checked in LIGHT and DARK.
- **ADVISORY (reported, never fails):** tertiary/incidental text, decorative default border.
- The **threshold is a constant, never a negotiation** — "change the hex, never the threshold"
  (`tokens-and-aa-enforcement.md`). Loosening a threshold to ship a color is the #1 pitfall.
- The token module is the source: reuse the project's real AA contract (the profile's
  `tokenModule` exports `evaluateGatedPairs` + scales — call THAT, do not re-derive pairs).

### Metric ruling
APCA is the AUTHORITY for the "readable" judgment (Lc 60 step-11 text, Lc 90 step-12); WCAG2
(4.5/3/7) is the REQUIRED legal/a11y floor that gates the build. Carry BOTH (a WCAG-passing pair
can still be unreadable — WebAIM admits this). If a teal hue can't pass both at small L-deltas,
APCA wins the judgment and WCAG2 is reported.

## Real-render state-aware contrast

**SHIPPED, hard when run — `scripts/verify_states.mjs`:**

```
node "${CLAUDE_PLUGIN_ROOT}/skills/pixelhelm-evaluate/scripts/verify_states.mjs" <file.html|url> \
     [--modes light,dark] [--dark-attr data-theme] [--json]
```

Walks `button, a[href], input, select, textarea, [role=button], [role=switch]`
and measures computed `color` vs the effective (non-transparent, ancestor-resolved,
alpha-composited) background in default / hover / focus — real hover and real focus, per mode.
Catches the failure static lint can't: a secondary button that picks up
the primary fill on hover via CSS specificity. Thresholds: 3:1 for large text (≥24px, or ≥18.66px
bold) and graphical/icon-only controls (WCAG 1.4.11); 4.5:1 otherwise. Disabled and native toggle
controls (checkbox/radio render via accent-color) are EXEMPT (WCAG 1.4.3/1.4.11). Animations
are killed (`transition:none`) so the measured state is the settled one. A control over a
`background-image`/gradient is NOT machine-certain: reported as needs-review for Layer-2, never
silently passed and never hard-failed.

## axe-core a11y

The SHIPPED runner is `pixelhelm-render`'s `--axe` arm: it injects the VENDORED axe-core (from the
render skill's own node_modules — never a network fetch; missing dep = loud exit 2, not a silent
skip) into every rendered cell, both modes, and writes per-cell serious/critical (Deque impact
taxonomy) into `render.json`. The evaluator reads that field; any serious|critical = Layer-1 FAIL;
an ABSENT field means axe did not run — report not-machine-checked, never clean.
**axe covers ~⅓ of WCAG** — it is necessary, NOT sufficient. The "needs review / incomplete"
bucket routes explicitly to Layer-2; never report axe-clean as "accessible." Whole-APP sweeps
(every route, interactive states, post-navigation) remain the project harness's job.

## Focus trap

**SHIPPED, hard when run — `scripts/verify_focustrap.mjs`:**

```
node "${CLAUDE_PLUGIN_ROOT}/skills/pixelhelm-evaluate/scripts/verify_focustrap.mjs" <file.html|url> \
     --trigger <css-selector> [--dialog <css-selector>] [--json]
```

Opens the dialog via the trigger selector and proves, with real keyboard
presses, three things (WCAG 2.1.2 No Keyboard Trap + 2.4.3 Focus Order): (1) `role="dialog"` +
`aria-modal="true"` (or a native `:modal` `<dialog>`) + an accessible name; (2) Tab — pressed more
times than there are focusables — never reaches page content OUTSIDE the dialog (focus passing
through browser chrome is permitted; that is how a user reaches the address bar); (3) Escape
closes AND returns focus to the
trigger. Any leak, missing semantics, or lost focus fails. Applicability is explicit: a page with
no dialog exits 0 as NOT APPLICABLE (which is not a trap-semantics pass); a page with a dialog
but no `--trigger` is a runner error — the trigger is part of the contract.

## Responsive overflow

**SHIPPED, hard when run — `scripts/verify_responsive.mjs`:**

```
node "${CLAUDE_PLUGIN_ROOT}/skills/pixelhelm-evaluate/scripts/verify_responsive.mjs" <file.html|url> \
     [--widths 280,320,414] [--json]
```

Loads each target at 280/320/414px (WCAG 1.4.10 reflow plus the render matrix's mobile widths)
and fails if
`scrollWidth - clientWidth > 1` (a sideways scrollbar). On fail it names the widest culprit
elements. Common causes caught: fixed px widths, unreset `<ul>/<ol>` padding, non-wrapping flex
rows, `grid minmax(Npx,1fr)` minimums larger than the viewport.

## Target size (WCAG 2.2 2.5.8)

**SHIPPED, hard when run — `scripts/verify_targetsize.mjs`:**

```
node "${CLAUDE_PLUGIN_ROOT}/skills/pixelhelm-evaluate/scripts/verify_targetsize.mjs" <file.html|url> \
     [--viewport 375x812] [--exempt <css-selector>] [--json]
```

Measures every visible interactive target's rendered bounding box at a MOBILE viewport (the
binding case) and fails any target under 24×24 CSS px unless a 2.5.8 exception holds. This goes
beyond axe's `target-size` rule in two ways: the SPACING exception is computed as real geometry
(a 24px-diameter circle centered on the target's box must intersect neither another target nor
another undersized target's circle — axe routes this to "needs review"), and the INLINE exception
(target rendered inline in a sentence) is detected from the layout. The "equivalent control
elsewhere" exception is not machine-decidable: declare it with `--exempt <selector>` and defend
the exemption in the verdict — an undeclared undersized target FAILS.

## Output floor (landmarks · headings · meta description)

**SHIPPED, HARD — `scripts/output-floor-gate.mjs`** (static, dependency-free, runs everywhere the
contrast gate runs):

```
node "${CLAUDE_PLUGIN_ROOT}/skills/pixelhelm-evaluate/scripts/output-floor-gate.mjs" <file.html> [--json]
```

Born from a real escape: the Harborline worked example shipped with no landmarks, styled-div
section titles, and no meta description — documented as gaps, but nothing blocked them. Hard
rules: exactly one `<main>` (or `role="main"`); an `<h1>`; no skipped heading level in document
order; no heading impostors (a `div`/`span`/`p` whose class names it a `section-title`/
`section-heading` self-declares a heading and must be heading markup — WCAG 1.3.1); a non-empty
`<meta name="description">`. Missing header/nav/footer landmarks, extra `<h1>`s, and the broader
`*-title` class family are REPORTED for judgment (real false-positive surface). Description
LENGTH rules stay with the `seo-meta.mjs` lens on marketing surfaces; this gate owns presence.

## Promoted interface-quality micro-checks

The greppable / statically-decidable subset of interfaces.rauno.me, promoted to HARD gates because
they are machine-certain (the NON-greppable rauno heuristics — ≤200ms latency, optimistic UI —
live in Layer-2):

- Text `<input>` font-size ≥ 16px (prevents iOS zoom-on-focus).
- `outline: none` requires a `:focus-visible` style (never remove focus indication).
- Icon-only control (no text node, only `<svg>`) requires `aria-label` / `aria-labelledby`.
- A `disabled` control has no `title`/tooltip (unreachable by keyboard/touch).
- No `font-weight` change on hover (causes layout shift).
- `font-variant-numeric: tabular-nums` on dynamic/monetary number columns.

Focus-indicator ruling (C2): `box-shadow` ring (respects border-radius), not `outline`;
`outline:none` without `:focus-visible` is a Layer-1 FAIL.

## Conformance (the moat)

Validating the DESIGN.md spec is NOT conformance. After render, read `getComputedStyle` on
token-bound elements and assert the computed value EQUALS the resolved token value (sRGB rounding
epsilon, owner-set). This proves the browser actually rendered the tokens — the gap every token
tool (design.md, Terrazzo, Style Dictionary, VoltAgent) leaves open. The render harvest must come
from a FIXED audit function injected via `browser_evaluate` — NEVER model-authored JS (arbitrary
code hole).

## Run profile

Run Layer-1 on the static per-screen harness HTML where possible — reserve the live browser for
Layer-2. Do NOT require a 40-tool Playwright MCP for the CERTAIN checks; the render-based gates use
`playwright-core` (ONE engine — never run puppeteer + playwright both) and degrade to SKIP when the
browser is genuinely unavailable (except axe-missing, which is loud).
