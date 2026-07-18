# Trust & taste — the register matrix and the qualitative bar

Table of contents:
1. Why this is graded qualitatively (no numeric rubric)
2. The per-register trust matrix
3. The slop baseline (critique AGAINST this)
4. The taste questions the council asks
5. The downgrade ladder

## 1. Why this is graded qualitatively (no numeric rubric)

Whether a video belongs on a surface — and whether a given clip is good — is a taste
and trust judgement, not a measurable one. This skill does NOT invent a 0-10 rubric.
Correctness (lazy-load, captions, fallback, AI disclosure, server-side secrets,
teardown — the universal MUSTs in SKILL.md) is the **floor**, fail-closed, and
design-evaluate Layer-1 hard-gates the surrounding UI. Everything above that floor —
does the video earn its weight, does it fit the register, is the AI honest and calm —
is graded by `design-council` (the 7-seat panel) + the owner against the active project
register. Layer-2 advises and never blocks iteration — with one exception: on a
REDESIGN verdict the Register-fit gate is a pre-aggregation VETO (the incumbent guard).

This mirrors the plugin-wide rule: machine gates are hard, lens scores advise. Video
distinction comes from the brand (the real message, the real data, the register),
never from "add motion."

## 2. The per-register trust matrix

The register (from `${CLAUDE_PLUGIN_ROOT}/profiles/<project>.json` → `_register`)
gates the recipe before any build:

| Register | Recipe A (pre-rendered) | Recipe B (live avatar) | Programmatic |
|---|---|---|---|
| **A regulated trust portal** — serious-trust / fintech (Mercury/Vanta/Stripe) | YES, in-product OK; calm, restrained, captioned | **BANNED in-product; marketing-only and even there prefer A** — a face over data/compliance reads manipulative | YES — sober data motion, token-faithful |
| **An analyst data product** — analyst-terminal (Bloomberg×Wikipedia, no-red, sourced) | YES for a sober explainer; dense, credible | **NO live avatar anywhere in the terminal** | **YES — this is the upside.** Sourced, on-brand data animation IS the credible video move |
| **A warm consumer app** — warm-premium-fun-but-calm (Things 3 / Gentler Streak w/ Linear discipline) | YES; characterful but calm, captioned | **Defensible on marketing / onboarding welcome** — calm, click-to-start, escapable; never ambush | YES — playful-but-disciplined motion graphics |

Cross-register rule: a live avatar that delights on a warm consumer app's marketing is a liability
inside a regulated trust portal. **Never homogenize** — judge against THIS project's register, always.

## 3. The slop baseline (critique AGAINST this)

Hold every proposal against the generic AI-video default. If it is indistinguishable
from this list, it has not earned its place — redesign or drop it:

- An autoplaying muted hero loop that conveys nothing and just "adds motion."
- A chirpy AI avatar greeting that adds zero information over a line of text.
- A 60-90s talking head nobody watches past 5s (no hook, padded to length).
- Burned-in captions in the wrong language / fixed engine font that ignores the brand.
- The over-used generative-AI cyan/neon-teal or purple→pink gradient in the video
  itself (same banned clusters the token profile lists for the UI).
- A live avatar dropped in-product "because we have the API."
- A player that pops in and shoves the page down on load.

Distinction is positive, from the brand: the register's personality, the real data,
the actual message, token-faithful chrome — not a denylist of bans.

## 4. The taste questions the council asks

Run these as the qualitative read (the brainstorm → critique-vs-generic →
build → critique-again loop's final critique). They are questions, not a checklist to
recite:

- **Does it earn its weight?** Would a sentence of real text + a static diagram do
  this job as well or better? If yes, the win is dropping the video.
- **Does it fit the register?** Calm-serious for a trust portal, sourced-dense for
  an analyst terminal, warm-but-disciplined for a warm consumer app — judged against THIS profile.
- **Is the AI honest?** A synthetic/live presenter is visibly disclosed as AI and
  never disguised as human (Compliance-honesty lens). On a trust brand, is it even on
  a surface where an AI face is appropriate at all?
- **Is it calm, not coercive?** No ambush autostart, no fake urgency, no dark
  pattern pushing the user into a paid session.
- **Does it work degraded?** Muted, captioned, reduced-motion, blocked, on a 375px
  phone — does the message still land via the text fallback?
- **Is the motion brand-faithful?** Colors/type/easing from tokens; reduced-motion is
  a graceful variant (cross-fade to poster), not a hard kill.
- **Is the production method right?** One person explaining → Recipe A. Data/templated
  → programmatic. Conversational on a permitted marketing surface → maybe B.

A "no" on earn-its-weight, register-fit, AI-honesty, or works-degraded is a High
finding — describe the impact, don't prescribe pixels. Loop or downgrade.

## 5. The downgrade ladder

When the trust gate or the taste read says a recipe is too much, step DOWN, do not
abandon the goal:

```
Live avatar (B)  ->  Pre-rendered avatar/explainer (A)  ->  Programmatic data motion
                 ->  A static poster + real text        ->  No video (a sentence + a diagram)
```

Downgrading is the expected, correct outcome for most in-product asks. Surface it as a
User-Challenge when it contradicts what the user asked: name what they asked, what the
register implies, and the cost if wrong — then default to the safer rung. Restraint is
the brand-correct move, not a failure to deliver.
