# Anti-slop — tells to detect and ban

A north-star or archetype must read as INTENTIONAL, not generated. Before proposing any reference or
emitting any archetype brief, screen it against these tells. If a candidate trips them, drop it (Mode
A) or override the offending value with the project's real token (Mode B). This is taste enforcement,
not a numeric gate — but the bans below are hard.

## The generative-AI fingerprint (hard bans)
- **Neon/electric cyan-teal** as the accent — the over-used generative-AI fingerprint (a
  trust-register profile bans `#16d5e6`, `#00d4ff`, `#0ff`).
- **The default purple→pink gradient** (`from-purple-500 to-pink-500`, `from-violet-600 to-fuchsia`)
  — and atmospheric gradients / spotlight cards generally.
- **Pure `#000000`** as canvas — premium darks use a near-black with a faint tint (Linear's canvas is
  `#010102`), not true black. Likewise avoid pure `#FFF` flat slabs with no surface ladder.
- **Inter as the "premium" headline** — Inter is the default; a distinctive brand picks a real
  display cut (Inter is fine as a documented *free substitute*, not as the chosen identity).
- **Outer-glow / neon `box-shadow`** used decoratively.

## Layout & content tells
- **Three equal cards in a row** as the default feature section.
- **Fabricated metric blocks** ("10x faster", "99.9%") with no source.
- **Emoji used as structural icons** — use an SVG set (Lucide/Heroicons), one consistent family.
- **Generic per-vertical palette with no real exemplar** — every "SaaS" rendered as the same
  `#2563EB` is slop by definition; always pair an archetype with a real north-star.
- **Homogenized register** — the same "clean modern" look regardless of project. Keep each project on
  its register (warm-fun / serious-trust / analyst-terminal).

## Craft minimums a strong reference exhibits (the positive side)
- One restrained accent (≤ ~80% saturation), used scarcely (brand mark, focus, primary CTA) — not
  decoratively. Linear uses lavender on exactly those, nowhere else.
- A surface/elevation ladder + hairline borders carrying depth, rather than heavy drop shadows.
- A real type scale with intentional negative tracking on display sizes; body measure ~65ch.
- 44px minimum touch targets; visible focus states; `min-h-[100dvh]`; `prefers-reduced-motion`
  respected; spring-ish motion (not linear).
- An honest **Known Gaps** note (a strong DESIGN.md admits what it doesn't cover, e.g. no light mode).

## How to apply
- **Mode A:** in "critique vs. generic", drop any candidate whose look is the vertical's default or
  that trips a hard ban. A north-star must be distinctive AND on-register.
- **Mode B:** after retrieval, diff the archetype palette against the project profile's
  `bannedClusters`; if it collides, replace with the project's locked token and note the override.
  Never emit a banned cluster.
- This screen is advisory taste, but the hard bans above are non-negotiable — `design-evaluate`
  Layer-1 will hard-gate the machine-checkable ones (contrast, banned hex, target size) downstream;
  catching them here keeps the brief clean from the start.
