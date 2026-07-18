# design-direction — the taste canon (anti-slop, brief-wins, the exit tests)

> Read this when distilling/critiquing directions. It is the qualitative grading material for a
> SUBJECTIVE skill — there is NO numeric rubric; taste is judged by these checks and by the owner.
> Sources cited inline: Anthropic's frontend-design skill, the Dammyjay93 interface-design
> guide, the Superdesign agent prompt, the v0 system prompt, build-spec C6/C9.

## Contents
- [The three AI-default clusters (avoid unless the brief asks)](#the-three-ai-default-clusters)
- [The brief always wins](#the-brief-always-wins)
- [Spend your boldness in one place](#spend-your-boldness-in-one-place)
- [The four exit tests (makes "distinctive" checkable)](#the-four-exit-tests)
- [Surface-branched tell-sets (product UI vs marketing)](#surface-branched-tell-sets)
- [What is NOT slop (the guard)](#what-is-not-slop-the-guard)
- [Design-system maturity signal](#design-system-maturity-signal)

## The three AI-default clusters

AI-generated design currently clusters around three looks (`anthropics frontend-design` L31).
They are *defaults, not choices* — they appear regardless of subject. Where the brief leaves an
axis free, do NOT spend that freedom on one of these:
1. Warm cream background (~#F4F1EA) + high-contrast serif display + a terracotta accent.
2. Near-black background + a single bright acid-green or vermilion accent.
3. Broadsheet layout: hairline rules, zero border-radius, dense newspaper columns.

Plus the floor denylist (FLOOR checks, never the aesthetic — `v0 Prompt.txt` L419-447, L497;
`superdesign customAgentService.ts` L231,236): never bootstrap-blue / indigo unless specified; no
purple/violet prominently; no default purple->pink gradient; <=5 colors; <=2 fonts (+ a mono);
no decorative gradients; no raw `text-white`/`bg-white`/`bg-black`/hex (everything via tokens).
These prevent the shadcn-default cluster; they do not make a design good.

## The brief always wins

Even if the brief asks for a default look — including one of the three clusters above — **the
brief's own words win** (`anthropics frontend-design` L31). If the brief pins a visual direction,
follow it exactly. The anti-slop rules apply only to the axes the brief left FREE. Never override a
stated owner intent in the name of distinctiveness.

## Spend your boldness in one place

`anthropics frontend-design` L43. Let the **signature element** be the one memorable thing; keep
everything around it quiet and disciplined; cut any decoration that does not serve the brief.
Maximalist directions need elaborate execution; minimal directions need precision in spacing,
type, and detail — elegance is executing the chosen vision well, not adding. Chanel's mirror:
before you ship, remove one accessory. Not taking a risk is itself a risk — take ONE real,
justifiable aesthetic risk, in the signature.

## The four exit tests

Every direction must clear these (build-spec §2; `Dammyjay93` L294-298). They turn "distinctive"
from an adjective into a check the owner and `design-council` can apply to the rendered mockup:

- **Swap** — mentally swap the typeface and layout for framework defaults. If nothing meaningful
  changes, the direction *defaulted* — it has no thesis.
- **Squint** — blur the screenshot. Does the hierarchy survive? If everything reads at one weight
  (card-sea / monotone grid), there is no hero.
- **Signature** — point to 5 concrete elements that express THIS subject specifically. Fewer than
  5 means the subject's world isn't on the page.
- **Token** — read the CSS variable names. `--ink` / `--canvas` evoke a world; `--gray-700` /
  `--surface-2` evoke a template. Names encode intent.

A direction that fails Swap or Squint is not a direction — fix it before rendering.

## Surface-branched tell-sets

Anti-slop is ONE engine, branched by surface type (build-spec C6). The brief/router sets the
surface; apply the matching tell-set. **"Hero is a thesis" is marketing-shaped — do NOT apply
hero-page logic to dense product UI** (build-spec §6).

**Product-UI tells** (dense tools, dashboards, forms — `Dammyjay93` scope, product-UI only):
- monotone card grids — every card the same size/weight (squint fails)
- flat metric boxes — a big number + tiny label + gradient accent repeated N times
- hierarchy by size alone — use the three levers (size + weight + color), never size only
- no committed depth strategy — pick ONE (shadow OR border OR surface-advance), don't mix randomly
- ad-hoc spacing — no rhythm; whitespace beats borders for grouping (space-around-group >
  space-within-group)

**Marketing / hero / campaign tells** (landing pages — `anthropics` scope):
- the named cliche clusters above used as THE look
- generic numbered markers (01 / 02 / 03) when the content is not actually a sequence — structural
  devices must encode something TRUE about the content, not decorate (`anthropics` L21)
- a big-number-with-small-label hero + supporting stats + gradient accent as the default opener
  (`anthropics` L17) — only use if it is genuinely the best answer
- scattered animation that signals "AI-generated" — an orchestrated single moment lands harder

## What is NOT slop (the guard)

Before flagging a bold choice, apply the guard (the same rule `design-evaluate`'s
false-positive filter and `design-council`'s `references/false-positive-filter.md` encode).
A motivated bold choice — a saturated palette, dramatic type scale, a
loud signature — is a **SUCCESS, not a violation.** Never flatten intentional boldness in the name
of deslop. When unsure whether something is a defect or a decision, treat it as a decision. This
guard protects the high-variance / bold direction (the optional 4th) from being normalized away.

## Design-system maturity signal

When a Figma source or existing system is available, its maturity (named-style count, has-variables,
component count — `GLips Figma-Context-MCP/get-figma-data-metrics.ts` L5-49) tells how much
structure already exists. A mature system constrains how far a direction can stray (reuse its
token system); a thin/empty system gives directions more freedom. Use it to calibrate ambition,
not as a rule.
