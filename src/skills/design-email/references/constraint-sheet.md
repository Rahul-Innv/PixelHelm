# Email constraint sheet — each rule is a CLIENT LIMITATION, not a style choice

Source: `design/email-client-constraints.md` (a price-tracker email product's D-031, 11-agent
verified). Web-page HTML rules do NOT transfer; treat email as a hostile
rendering target. Read the two MUSTs in SKILL.md first — they are the two rules
that were violated in production. This file is the full 9-rule subset + the lint
checks + the cross-surface scaling rule.

## Contents
- [The 9 rules](#the-9-rules)
- [Cross-surface scaling rule](#cross-surface-scaling-rule)
- [Mechanical lint checks](#mechanical-lint-checks)

## The 9 rules

1. **600px single-column nested-table canvas** (MUST 1). Outer 100% table ->
   inner table with `width="600"` ATTRIBUTE + `style="width:100%;max-width:600px"`.
   ≤ 3–4 nesting levels; ALL CSS inline; total HTML < 80KB (Gmail clips ~102KB).

2. **Card-stack rows, never multi-column data tables.** Columns break at 375px.
   One nested table per item; spacing via `td` padding (12–16px horizontal /
   8–12px vertical); 1px light divider + ~16px padding between items.

3. **Type ladder by ratio, weights 400/700 ONLY.** System Arial/Helvetica ship no
   500/600/800; Outlook collapses 600+ to bold. Header ≈ 22–24px/700, item title
   ≈ 17–18px/700, price/value hero ≈ 22–28px/700, body 14–16px/400, caption 12px.

4. **NO inline SVG.** Outlook retired SVG in 2025; Gmail strips its attributes.
   Trend/charts = a text indicator ("↓ $150 since last check") or nothing.

5. **Verdict badge:** uppercase 12–14px/700, 4–8px padding — built per MUST 2
   (text color + border only). Dark-mode reality: Gmail auto-transforms colors,
   IGNORES `color-scheme`, and `@media (prefers-color-scheme)` is unreliable there.
   So inline ONE (light) value set and make every element inversion-tolerant:
   SATURATED colors survive inversion; pale tints turn murky.

6. **Price/value pattern:** old value 14px gray strikethrough using BOTH the `<s>`
   tag AND `text-decoration:line-through` (client fallback); new value larger/700
   in a semantic color from the token module.

7. **Links / CTAs:** bulletproof inline-block (`display:inline-block` + padding +
   `text-decoration:none`), ≥ 44px tap target for primary CTAs, 16–18px text.

8. **Single accent + grays; no pure white-on-black; whitespace (padding) is the
   separator, never `<br>`.**

9. **Mobile:** `@media (max-width:600px)` stack + `width:100%!important` IS
   supported in Gmail — but the layout MUST already read single-column WITHOUT it
   (other apps drop `<style>` entirely). The query is an enhancement, never the
   correctness floor.

## Cross-surface scaling rule

**Surface anatomy scales with canvas.** A card/band anatomy that wins on a wide
dashboard reads CRAMPED at email widths — re-judge the chosen direction per
surface. At 600px, flat divider rows + one chip line beat band-cards. This exact
swap happened in production: the dashboard kept band-cards, the email went flat
rows. Never port a wide-canvas direction straight down to email.

## Mechanical lint checks

Lint these on the RENDERED output (gate the merge):

- inner table `width` attribute == 600
- no `<svg`
- no `background:` / `background-color:` inside chip/badge spans
- `font-weight` values ∈ {400, 700, bold, normal}
- total bytes < 80KB
- every model/user-provided string HTML-escaped; every href scheme-validated

Where the email-safe CSS subset overlaps `design-evaluate` Layer-1 (contrast on
inline color pairs), REUSE that gate — do not re-author contrast math. Email has
no `:root`, so only inline color pairs are checkable; `var(--…)` does not resolve
in Gmail.
