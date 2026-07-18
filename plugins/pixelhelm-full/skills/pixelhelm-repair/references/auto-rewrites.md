# pixelhelm-repair auto-rewrite catalog

Deterministic finding → minimal edit → token-target mappings. Use these for
Layer-1 (machine) findings, which name an exact assertion. Each rewrite is the
SMALLEST change that clears the assertion; it does NOT redesign. Resolve every
value to a **semantic token name** from the profile's `tokenModule` — never a raw
literal (outside `allowRawColorIn`), never a `bannedClusters` value, never a
weakened threshold.

Provenance: motion rewrites ← `pixelhelm-motion` validator (build-spec §1) +
`motion.dev` cheapest-property allow-list; token-swap ← v0 token-law + the
`tokens-and-aa-enforcement.md` lockstep; a11y micro-checks ← `interfaces.rauno.me`
promoted greppable subset (build-spec §3 Layer-1 row).

## Motion (the heaviest auto-rewrite cluster)

| Finding (assertion) | Minimal edit | Notes |
|---|---|---|
| Animates a layout property (`width`/`height`/`top`/`left`/`margin`/`padding`/`border`) | Rewrite to animate `transform` and/or `opacity` only | Layout props cost "upwards of 100ms"; transform/opacity are the cheapest layer. If the effect can't be expressed in transform/opacity, it is structural — escalate. |
| Missing `prefers-reduced-motion` counterpart | Add a `@media (prefers-reduced-motion: reduce)` block | DEGRADE, never kill: drop transform/parallax, KEEP opacity/color cross-fades. Not `display:none`. |
| Raw `ms` / `cubic-bezier` / hex literal in component CSS | Swap for the `--motion-duration-*` / `--motion-ease-*` / color token | Tokens are the source of truth; literals drift. |
| Symmetric ease + equal duration for enter and exit | Enter = decelerate `--motion-ease-decelerate`; exit = accelerate `--motion-ease-accelerate`, SHORTER | The asymmetry headline (M-design). |
| Animation on a keyboard-repeated action | Remove the animation on that action | Repeated keypress + animation = jank tell. |
| `transition: all` | Name the exact properties (`transition: transform …, opacity …`) | `all` animates layout props by accident. |

## Tokens & color

| Finding | Minimal edit | Notes |
|---|---|---|
| Raw literal (`#fff`, `bg-white`, `border-gray-200`, `p-[16px]`) where the system has a token | Replace with the semantic token / class (`bg-card`, `border-border`, `p-4`) | Never add a new literal. If no token exists for the role, that's a pixelhelm-tokens gap — escalate, don't invent. |
| Text/border contrast below AA on its surface | Re-point to the system role that IS compliant on that surface (often a darker text role or a quieter border) | Do NOT mint a new hex and do NOT lower the threshold (FAIL F1). The token test is the computer. |
| `bannedClusters` value present (AI-cyan, default purple→pink gradient) | Replace with the project's intentional accent token | Read `bannedClusters` from the profile. |
| Generic token name (`--gray-700`, `--surface-2`) used directly in a component | Re-point to the semantic alias (`--text-secondary`, `--surface-card`) | Names that evoke a world, not a template. |
| Competing accents (several saturated colors) | Demote all but the one intentional accent to structural neutrals | Only when the evaluate finding flags it AND it's not a ratified bold choice. |

## Typography

| Finding | Minimal edit | Notes |
|---|---|---|
| Size-only hierarchy (no weight/color tier) | Add the weight + color-ramp token to the tier; keep size | Three-lever hierarchy, not size alone. |
| Updating/dynamic numbers not `tabular-nums` | Add `font-variant-numeric: tabular-nums` (or the token) | Stops digit jitter. |
| Slack tracking on a large heading | Tighten to the display tracking token | Default tracking reads as a document. |
| Off-scale font-size | Snap to the nearest type-scale step token | Don't hand-pick a size. |

## Spacing & structure

| Finding | Minimal edit | Notes |
|---|---|---|
| Off-grid value (17px, 23px on a 4/8 base) | Snap to the nearest grid token | |
| Unmotivated asymmetric padding | Make symmetrical via the spacing token | Only if not motivated by content. |
| Mixed `gap` + `space-*` / `p-[..]` + margin | Use `gap-*` / `p-*` consistently | v0 spacing law. |
| Nested parent/child share the same radius | Concentric: child = `outer − padding` (or parent = `inner + padding`) | |

## Accessibility micro-checks (rauno promoted subset)

| Finding | Minimal edit | Notes |
|---|---|---|
| `outline:none` without a focus indicator | Add a `:focus-visible` box-shadow ring token | box-shadow respects border-radius (C2 ruling). |
| Input `font-size` < 16px | Raise to the 16px token | Prevents iOS zoom-on-focus. |
| Icon-only control with no accessible name | Add `aria-label` (or visually-hidden text) | |
| Disabled control carrying a tooltip | Remove the tooltip from the disabled control | Disabled = no hover affordance. |
| `font-weight` changes on `:hover` (layout shift) | Remove the weight change; use color/bg for hover | Weight change reflows text. |
| Hit area < 44×44px (40 min) | Extend padding / min-size to the token floor | WCAG target size. |

## When NOT to auto-rewrite

- The pattern is inside a file the project ratifies (`system.md`) or inside
  `allowRawColorIn` — it's a decision, not a defect.
- The "fix" would flatten a motivated bold choice (see `guards.md`).
- No token exists for the needed role — that's a pixelhelm-tokens gap; surface it,
  do not invent a literal.
- The finding is structural (no focal point / flat hierarchy / absent state) —
  these are NOT in this catalog by design; escalate per `recipe.md`.
