# The prompt STACK — composable blocks, never a monolith

Contents: [Why a stack](#why-a-stack) · [Block order](#block-order) · [The
DESIGN-SYSTEM block](#the-design-system-block-the-seam) · [Construction-strategy
router](#construction-strategy-router) · [Prompt-enhancer meta-step](#prompt-enhancer-meta-step)
· [Versioned prompt library](#versioned-swappable-prompt-library) · [Worked
assembly](#worked-assembly)

Source channeled: `abi/screenshot-to-code` (`backend/prompts/plan.py`,
`design_system.py`, `pipeline.py`, `policies.py`) + bolt.diy (`api.enhancer.ts`,
`prompt-library.ts`) + v0/Lovable.

## Why a stack

A monolithic prompt is unmaintainable and un-A/B-able. Assemble each engine's
prompt from ORDERED, SWAPPABLE blocks. Every engine in the tournament shares
every block EXCEPT the SYSTEM persona — that single swap is what makes the
directions diverge while keeping the floor identical.

## Block order

Concatenate in this exact order (screenshot-to-code's `build_prompt_messages`
pattern):

```
1. SYSTEM        — the engine persona (E1/E2/E3/E4). The ONLY block that differs
                   between tournament contenders. See taste-engines.md.
2. POLICIES      — token law (no raw color), the anti-homogeneity FLOOR, the
                   quality floor (responsive/focus/reduced-motion/grayscale),
                   image/asset policy (real media or https://placehold.co — never
                   call image-gen unless enabled). These are constant per project.
3. DESIGN-SYSTEM — the token module, verbatim, wrapped per below. The seam.
4. PLAN/TASK     — the brief + the picked thesis + REAL content + the surface type
                   + the chosen construction strategy's instruction.
```

POLICIES sits ABOVE the design system but the design-system block carries the
final tie-breaker ("prioritize the design system") so token correctness can never
be argued away by a policy.

## The DESIGN-SYSTEM block (the seam)

Prepend the project's token module wrapped exactly like screenshot-to-code's
`build_design_system_prompt_block` — the priority sentence is load-bearing:

```
## Design system

If the design system conflicts with other instructions, prioritize the design system.

<design_system>
{ the token module / DESIGN.md, verbatim }
</design_system>
```

The token module comes from `design-tokens` (the single source of truth). Never
paraphrase it, never invent a parallel palette, never loosen a threshold to fit a
color — change the hex, never the threshold.

## Construction-strategy router

Pick the strategy with a ROUTER, not an if-soup (s2c
`derive_prompt_construction_plan`). Derive from four facts: new-vs-update, history
present, file snapshot present, modality. Output exactly ONE:

| Strategy | When | TASK-block instruction |
|---|---|---|
| `create_from_brief` | new build, text/brief modality | "Build the surface from this brief + real content." |
| `create_from_image` | new build, a reference image/screenshot provided | "Replicate the reference at its own dimensions, then elevate; treat red marks as annotations, not UI." |
| `update_from_history` | update, prior turns present | "History is the source of truth over any screenshot. Apply only the new change; preserve all working functionality." |
| `update_from_file_snapshot` | update, a current file snapshot present | "The file content is the source of truth. Make surgical edits; do NOT regenerate the whole file." |

The update strategies pair with `edit-discipline.md` (exact string replacement).

## Prompt-enhancer meta-step

Before assembling, normalize a raw/loose ask with a meta-prompt (bolt.diy
`api.enhancer.ts`): *"Act as a professional prompt engineer — make the request
explicit, add the missing constraints, name the surface type and the real content
needed."* This turns "make a dashboard" into a brief with a subject, audience, the
page's single job, the surface type, and the data shape — so every engine starts
from the same precise TASK block. Do this once, up front, shared by all engines.

## Versioned, swappable prompt library

Keep prompt blocks as named, versioned variants (bolt `prompt-library.ts`:
default vs optimized) so blocks are A/B-able and a regression can be rolled back
to a known-good block. The SYSTEM personas in `taste-engines.md` are the canonical
default set; treat any tuned variant as an additive entry, never a silent edit of
the default.

## Worked assembly (E2, a new build)

```
[SYSTEM]  E2 persona (registry-grounded/production — see taste-engines.md)

[POLICIES]
- Token law: no raw text-white/bg-white/bg-black/hex; p-4 not p-[16px]; gap-* not space-*.
- Floor: ≤5 colors, ≤2 fonts(+mono), no bootstrap-blue/indigo/purple unless briefed,
  no decorative gradients.
- Quality floor: responsive to mobile, visible :focus-visible ring, reduced-motion
  respected, every tier legible in grayscale.
- Assets: real media or https://placehold.co; do not call image generation.

[DESIGN-SYSTEM]
## Design system
If the design system conflicts with other instructions, prioritize the design system.
<design_system> …project tokens.mjs / DESIGN.md verbatim… </design_system>

[PLAN/TASK]  (strategy = create_from_brief)
Subject: …  Audience: …  The page's single job: …
Surface type: product-UI | marketing/landing
Real content: …actual rows/copy/numbers…
Build the surface from this brief + real content, reusing components/ui/* where they exist.
```

Repeat with the E1, E3, E4 personas swapped into [SYSTEM]; everything else
identical. That is the tournament.
