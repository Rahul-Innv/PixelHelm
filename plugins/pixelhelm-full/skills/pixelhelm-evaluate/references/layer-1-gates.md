# Layer-1 — machine-certain HARD gates

> ToC: [Orchestrator contract](#orchestrator-contract) · [Gate catalog](#gate-catalog) ·
> [Contrast: REQUIRED vs ADVISORY](#contrast-required-vs-advisory) · [Real-render state contrast](#real-render-state-aware-contrast)
> · [axe-core](#axe-core-a11y) · [Focus trap](#focus-trap) · [Responsive overflow](#responsive-overflow)
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
findings are always REPORTED but never change the exit code. Principles it encodes:

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

## Not yet wired (designed, honest status)

These are part of the intended machine floor but have NO shipped validator in this skill — when
one of them matters for a verdict, run it via the project's own harness or say plainly it was not
machine-checked. Do NOT present them as gated:

- **Real-render state contrast** (default/hover/focus, post-alpha-composite) — needs a browser pass.
- **Whole-APP axe sweeps** (every screen/route, interactive states) — the render `--axe` arm (now
  shipped, see the catalog above) covers the RENDERED surfaces it is pointed at; sweeping a whole
  app across navigation still belongs to the project's e2e harness (the L-011 pattern).
- **Focus trap · responsive overflow (280/320/414) · target size (WCAG 2.2 2.5.8)** — browser checks.
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

### Metric ruling (build-spec C1)
APCA is the AUTHORITY for the "readable" judgment (Lc 60 step-11 text, Lc 90 step-12); WCAG2
(4.5/3/7) is the REQUIRED legal/a11y floor that gates the build. Carry BOTH (a WCAG-passing pair
can still be unreadable — WebAIM admits this). If a teal hue can't pass both at small L-deltas,
APCA wins the judgment and WCAG2 is reported.

## Real-render state-aware contrast

**SPEC — `verify_states.mjs` does not ship yet** (listed in "Not yet wired" above; keep this
section's behavior contract for whoever wires it). The intended validator walks `button, a[href], input, select, textarea, [role=button], [role=switch]`
and measures computed `color` vs the effective (non-transparent, ancestor-resolved) background in
default / hover / focus. Catches the failure static lint can't: a secondary button that picks up
the primary fill on hover via CSS specificity. Thresholds: 3:1 for large text (≥24px, or ≥18.66px
bold) and graphical/icon-only controls (WCAG 1.4.11); 4.5:1 otherwise. Disabled and native toggle
controls (checkbox/radio/switch render via accent-color) are EXEMPT (WCAG 1.4.3/1.4.11). Animations
are killed (`transition:none`) so the measured state is the settled one.

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

**SPEC — `verify_focustrap.mjs` does not ship yet** (listed in "Not yet wired" above). The
intended validator opens the dialog via a trigger selector and proves, with real keyboard
presses, three things (WCAG 2.1.2 No Keyboard Trap + 2.4.3 Focus Order): (1) `role="dialog"` +
`aria-modal="true"` + an accessible name; (2) Tab cycles only inside the dialog (Tab more times
than there are focusables — focus must never escape); (3) Escape closes AND returns focus to the
trigger. Any leak, missing semantics, or lost focus fails.

## Responsive overflow

**SPEC — `verify_responsive.mjs` does not ship yet** (listed in "Not yet wired" above). The
intended validator loads each harness at 280/320/414px and fails if
`scrollWidth - clientWidth > 1` (a sideways scrollbar). On fail it names the widest culprit
element. Common causes caught: fixed px widths, unreset `<ul>/<ol>` padding, non-wrapping flex
rows, `grid minmax(Npx,1fr)` minimums larger than the viewport.

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
