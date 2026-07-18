# Token law — no raw color, every value from a token

Source channeled: v0 system prompt (token rules) + screenshot-to-code
(design-system priority). The token module itself is owned by `design-tokens`;
this file is the GENERATION-time discipline for consuming it.

## The one rule

**The design system wins every conflict.** The DESIGN-SYSTEM block carries the
sentence *"If the design system conflicts with other instructions, prioritize the
design system."* Every color, type, spacing, radius, elevation and motion value in
generated output resolves from a token — never a literal.

## YES / NO patterns (Tailwind + CSS)

| NO (rejected — escapes the lockstep) | YES (token-resolved) |
|---|---|
| `text-white`, `bg-white`, `bg-black` | `text-foreground`, `bg-background`, `bg-card` (semantic token classes) |
| `#0f172a`, `rgb(15 23 42)` inline | `var(--ink)`, the role token |
| `p-[16px]`, `mx-[8px]`, `py-[24px]` | `p-4`, `mx-2`, `py-6` (the spacing scale) |
| `space-x-4`, `space-y-6` for layout gaps | `gap-4`, `gap-x-2`, `gap-y-6` |
| mixing `padding`/`margin` WITH `gap` on the same axis | pick one spacing mechanism per axis |
| `transition: all` / raw `200ms` / raw `cubic-bezier(...)` | `var(--motion-duration-*)`, `var(--motion-ease-*)` |
| a one-off new primitive | reuse existing `components/ui/*` |

Use semantic design tokens whenever possible (`bg-background`, `text-foreground`,
`border-border`). New tokens MAY be added when the brief genuinely needs one — but
add them to the token MODULE (so the lockstep test covers them), never as a
component literal.

## Why (so the rule isn't cargo-culted)

- A literal in a component cannot be re-themed, cannot be dark-mode-flipped, and
  is invisible to the AA lockstep test — it silently drifts. The token module is
  the only place a value is *tested*.
- `p-[16px]` defeats the spacing scale's rhythm and the 25%-min spacing-jump law.
- `space-*` breaks with flex-wrap and RTL where `gap` does not.
- Raw colors are exactly the AI-slop fingerprint (bootstrap-blue + flat gray) the
  anti-homogeneity floor bans.

## Component reuse

Before authoring a primitive (button, input, card, dialog), reuse the project's
existing `components/ui/*`. Reinventing primitives produces drift and inconsistent
state coverage. Reuse first; extend the existing component if it lacks a variant.

## The CSS-specificity trap (carry into generation)

When emitting CSS, structure selector specificities so classes don't cancel each
other out — especially a type-based selector (`.section`) fighting an
element-/role-based one (`.cta`) over padding/margin between sections. This is a
common self-inflicted bug; keep spacing ownership unambiguous (one selector owns
the gap). More in `edit-discipline.md`.

### The utility-name collision (L-045 — Tailwind & any utility framework)

NEVER name a hand-written semantic hook with a **bare utility shape** — `m-*`,
`p-*`, `w-*`, `h-*`, `gap-*`, `text-*`, `top-*`, `left-*`, etc. In a codebase with
Tailwind (or any utility framework) present, the framework MINTS those exact names
as utilities and their declarations silently **stack** onto your hand-written rule.
The classic failure: a meter tick labelled `m-7`/`m-12` ("mark, day 7") picks up
Tailwind's `margin: 1.75rem/3rem` and the absolutely-positioned label jumps 28–48px
in every mode and viewport. This ships straight through an AA-green, axe-green,
token-pure gate — **none of those layers parse layout**, so only a RENDER catches
it (and a blind register juror will read it as a trust-breaking defect).

- **Prevent:** prefix every semantic hook (`cp-*`, `op-*`, `mk-*`, `ledger-*`…). A
  namespaced hook can never collide with the utility grammar.
- **Diagnose (design-fix):** a "mystery offset" where `getComputedStyle` looks
  right (`top: 0`) but `getBoundingClientRect` disagrees means ANOTHER matching
  rule is in play — dump `margin`/inset and grep the class name against the utility
  grammar BEFORE touching the intended rule.

## What this file does NOT own

The token VALUES, the AA computation, the role map, dark-mode plumbing,
white-label theming, and conformance all belong to `design-tokens`. This file only
governs how generated code *consumes* that contract. If a needed color can't pass
AA, that is a `design-color` / `design-tokens` problem — never loosen the threshold
to ship it here.
