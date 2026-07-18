---
name: design-email
description: >-
  Build or restyle HTML email to survive real inbox rendering (Gmail reality),
  not web-page HTML rules. Use whenever the user mentions "HTML email", "email
  template", "email design", a digest / alert / transactional / newsletter
  email, "this email looks broken in Gmail / Outlook / dark mode / on my phone",
  "the badge / chip / button disappeared in my inbox", "email is too wide /
  squeezed on mobile", "copy is getting cut off", an email "verdict pill", or an
  email "render gate / email test". Enforces the two production-learned MUSTs
  (600px width ATTRIBUTE canvas; chips that never depend on background:), the
  email-safe CSS subset, and importing the project token module as a key-set
  drift guard. NOT for web/app UI (use design-generate / design-evaluate), NOT
  for picking the palette (design-color), and NOT for the token contract itself
  (design-tokens) — this skill consumes that contract for the email surface.
shell: bash
---

# design-email — the existing-base-grounded email surface

!`node "${CLAUDE_PLUGIN_ROOT}/scripts/read-lessons.mjs" design-email 2>/dev/null`

Build email that renders correctly in a REAL inbox. Email clients are a hostile
rendering target: web-page HTML rules do NOT transfer. The two MUSTs below were
each violated once in production and cost a same-day revert — they are
load-bearing, not taste. Reached standalone or dispatched by the `design` router
(EMAIL intent).

## Purpose

Produce HTML email that survives compose normalization, dark-mode auto-inversion,
and 375px phones — and PROVE it with tests on the built HTML, not screenshots.
Three things make this skill: (a) the two production MUSTs, fail-closed; (b) the
email-safe CSS subset (9 client-limitation rules + mechanical lint checks); (c)
the project token module imported DIRECTLY as a `key-set` drift guard so palette
changes flow through and the email can never silently drift from the tokens.

## The seams (honor them; do not collapse them)

- **Routing is owned by the `design` router.** Do not re-implement it. This skill
  runs when the work is the email surface itself. The router's EMAIL intent is:
  `design-ground -> design-email (email-safe subset; reuse evaluate's contrast gate)`.
- **`design-tokens` is the single token source of truth.** Email does NOT mint
  colors. It imports the project token module and mirrors it as a `key-set`
  surface (NOT `css-root` — email has no `:root`). The lockstep test in
  `design-tokens` makes that mirror honest. See `references/token-key-set.md`.
- **Reuse `design-evaluate` Layer-1 contrast where clients permit.** The contrast
  math is the same gate, constrained to the email-safe CSS subset (inline color
  pairs only; no `:root` vars resolve in Gmail). Do not re-author contrast logic.
- **The per-project REGISTER differs — never homogenize.** A serious-trust digest
  and a warm-fun newsletter make different copy/visual choices. Load the active
  profile (`${CLAUDE_PLUGIN_ROOT}/profiles/<project>.json`) and judge against THAT
  register. Surface anatomy also scales DOWN: a band-card that wins on a wide
  dashboard reads cramped at 600px — re-judge per surface (flat divider rows + one
  chip line beat band-cards at email widths).

## The TWO MUSTs (each violated once in production — never again)

**MUST 1 — the canvas is 600px via the `width` ATTRIBUTE, and it is load-bearing.**
Structure: outer 100% table -> inner table with BOTH the `width="600"` ATTRIBUTE
and `style="width:100%;max-width:600px"`. Gmail apps honor the `width` attribute
OVER CSS `max-width` — a 720px "use the desktop space" experiment rendered desktop
fine and SQUEEZED every phone render until reverted the same day. Desktop reads a
centered 600px column; the wide-canvas surface is the app/web UI, never email.

**MUST 2 — chips / badges / verdict pills NEVER depend on `background:`.**
Gmail strips `background` styles from spans in compose-normalized flows
(draft-then-send, forwards). A filled "positive verdict" pill with white text went
INVISIBLE white-on-white in a real inbox. Survivor recipe: **text color + border
only.** Loudest tier = saturated-color text + 2px solid outline pill (loud via
saturation + double border weight + its icon); other tiers 1px outline; dashed =
the unverified shape cue (`border-style` IS honored in Gmail). Values come from
the token module, never literals:

```html
<span style="color:#15803d;border:2px solid #15803d;padding:2px 10px;border-radius:999px;font-size:12px;font-weight:700;white-space:nowrap">&#10003; BUY</span>
```

(An app dashboard MAY keep filled pills — rendering is fully controlled there. The
no-background rule is an EMAIL constraint, not a global one.)

## Procedure

1. **Ground first.** Confirm `design-ground` ran (router does this): the active
   profile + register + the project token module path are resolved. If reached
   standalone, read the profile yourself.
2. **Pick the email anatomy for THIS register at 600px.** Single-column nested
   tables; card-stack divider rows, never multi-column data tables (columns break
   at 375px). Re-judge any dashboard direction — do not port a band-card down.
3. **Build to the email-safe subset.** Apply all 9 rules in
   `references/constraint-sheet.md` (canvas, card rows, type ladder 400/700 only,
   no inline SVG, verdict badge, price pattern, bulletproof CTAs, single accent,
   mobile). Inline ALL CSS. Import token values; never hardcode hex.
4. **Wire the token key-set guard.** Import the project token module into the
   builder AND the test; assert chip/price/CTA recipes against token values so a
   palette change flows through without editing email code. See
   `references/token-key-set.md`.
5. **Write meaning-level tests on the BUILT HTML** (the builder is pure:
   `build(data) -> {subject, html, text}`). Assert MEANING, not markup — copy
   guards, link order, escaping, the negative+companion-positive pair, token-sourced
   style guards, and the send-gate proof. Recipes: `references/test-recipes.md`.
6. **Run the mechanical lint checks** on the rendered output (list in
   `references/constraint-sheet.md` and as a self-check below).
7. **Final acceptance is a real inbox, not a screenshot.** Send via the real
   draft/send flow (that triggers the compose normalization MUST 2 punishes), then
   eyeball dark + light x phone + desktop. Automated checks gate the merge; the
   inbox gates the ship.

## Decision Criteria (PASS / FAIL — a schema gate + LLM judge grades these)

An email this skill produces is **PASS** only if ALL hold; any single miss is
**FAIL**.

- **PASS** the inner content table carries the `width="600"` ATTRIBUTE plus
  `style="width:100%;max-width:600px"`, nested under a 100% outer table, single
  column. **FAIL** width set by CSS only, width != 600, or any multi-column data
  table for content rows (breaks at 375px).
- **PASS** every chip / badge / verdict pill uses text color + border ONLY (no
  `background`/`background-color` on the span); the positive tier is 2px solid,
  unverified is dashed; meaning is also carried by icon + label + shape, never
  color alone. **FAIL** any chip with a `background:` style, or meaning carried by
  fill alone (vanishes after compose normalization / dark-mode inversion).
- **PASS** all CSS is inline; `font-weight` ∈ {400, 700, normal, bold} only; NO
  `<svg`; total HTML < 80KB (Gmail clips ~102KB); nesting ≤ 3–4 levels. **FAIL**
  a `<style>`-only rule relied on, a 500/600/800 weight, an inline SVG, or > 80KB.
- **PASS** every color / type / spacing value resolves from the project token
  module imported by the builder; the email is registered as a `key-set` surface
  and the `design-tokens` lockstep test is green. **FAIL** a literal hex/size in
  the markup, or an email surface with no `key-set` lockstep entry (silent drift).
- **PASS** every model/user-provided string is HTML-escaped and every `href`
  scheme-validated in the built output. **FAIL** a hostile string (`<img onerror=…>`)
  reaches the inbox unescaped, or a `javascript:`/unvetted scheme survives.
- **PASS** tests assert MEANING on the built HTML and ship the negative WITH its
  companion-positive (the positive-verdict color appears on a verified row AND
  never on an unverified row — a lone negative is vacuously green). **FAIL**
  structure-only tests, or a negative assertion with no positive twin.
- **PASS** if sending is env-gated, a test proves the default path writes a preview
  and sends NOTHING. **FAIL** the default code path can send mail.
- **PASS** the layout reads single-column WITHOUT the `@media` query (other apps
  drop `<style>` entirely); the dark-mode-safe path inlines ONE light value set of
  inversion-tolerant (saturated, not pale) colors. **FAIL** correctness depends on
  `@media`/`color-scheme`, or pale tints relied on through Gmail's auto-inversion.

Always print the honest banner with a PASS: *these checks prove the email survives
the known client limitations — they do not prove taste; the inbox gates the ship.*

## Mechanical self-check (lint the rendered output)

- inner table `width` attribute == 600
- no `<svg`
- no `background:` / `background-color:` inside chip/badge spans
- `font-weight` values ∈ {400, 700, bold, normal}
- total bytes < 80KB
- every model/user-provided string HTML-escaped; every href scheme-validated

## Resources

- `references/constraint-sheet.md` — the 9 client-limitation rules (canvas, card
  rows, type ladder, no-SVG, verdict badge, price pattern, CTAs, accent, mobile),
  the cross-surface scaling rule, and the mechanical lint list with rationale.
- `references/token-key-set.md` — why email is a `key-set` (not `css-root`)
  surface, how the builder imports the token module, and how the lockstep keeps the
  mirror honest. Defers the contract itself to `design-tokens`.
- `references/test-recipes.md` — meaning-level test recipes on the built HTML:
  copy guards, link order, escaping, the negative+companion-positive non-vacuity
  pair, token-sourced style guards, the send-gate proof, and final acceptance.

## Anti-patterns (reject)

- Setting email width by CSS `max-width` alone (Gmail honors the `width` attribute
  over it — phones squeeze).
- A filled-background chip/badge/pill in email (vanishes after compose
  normalization; goes murky under dark-mode inversion).
- Hardcoding hex/sizes in the markup instead of importing the token module (the
  email drifts from the palette silently — no `key-set` lockstep catches it).
- Multi-column data tables, `<br>` as a separator, inline SVG, or 500/600/800 font
  weights.
- A lone negative assertion ("positive color never on unverified") with no
  companion-positive — vacuously green if the color never renders at all.
- Testing markup structure instead of meaning, or "approving" from a screenshot
  without the real draft/send round-trip.
