# Seed fingerprints (shipped with the plugin — read-only)

The starting anti-cliche registry. On first REFRESH, pixelhelm-record-lesson copies these
into your durable store's `fingerprints.md` (which then becomes the live
registry this seed never overrides). Entry shape, scoping, evidence gate, and
the not-slop guard: `pixelhelm-record-lesson/references/fingerprint-registry.md`.

## Current entries

- id: ai-cyan | added: 2026-06-22 | status: active | scope: global
  any: ["#16d5e6", "#00d4ff", "#22d3ee", "cyan-400", "cyan-500"]
  describe: the saturated neon-teal/cyan accent that AI generators reach for by default, usually on dark canvases
  evidence: recurred across multiple AI-generated screen batches for two unrelated products (2026-06); pinned as a hard ban in a production trust-register profile
  note: reads as machine-generated because it is the generator default, not a brand decision; legitimate only when the register explicitly claims a neon/technical identity
  retires: none

- id: ai-purple-grad | added: 2026-06-22 | status: active | scope: global
  any: ["from-purple-500 to-pink-500", "from-violet-600 to-fuchsia", "linear-gradient(135deg, #667eea", "#764ba2"]
  describe: the purple-to-pink / violet-to-fuchsia gradient family on buttons, heroes, and cards
  evidence: the single most recurrent tell across AI-generated hero and dashboard batches (2026-06); banned in all three calibration profiles
  note: the canonical "AI made this" signature; legitimate only for a brand whose identity is genuinely built on it
  retires: none

- id: bootstrap-indigo-default | added: 2026-06-22 | status: active | scope: global
  any: ["#6366f1", "#4f46e5", "indigo-500", "indigo-600", "#0d6efd"]
  describe: framework-default indigo/blue used as the primary brand color without a stated decision
  evidence: default shadcn/Tailwind/Bootstrap primaries appearing verbatim in generated screens for products whose registers specified other palettes (2026-06)
  note: not ugly — just unchosen; flag only when the profile's tokens define a different primary
  retires: none

- id: glass-everywhere | added: 2026-06-22 | status: active | scope: global
  any: ["backdrop-blur", "bg-white/10", "bg-white/20"]
  describe: glassmorphism applied to every card/panel instead of one deliberate surface — frosted layers as texture, not hierarchy
  evidence: recurred in generated marketing/hero batches (2026-06); hero/campaign surface tell
  note: surface-typed — a single motivated glass surface is a decision; glass-as-default is the tell. Product-UI matches on `any[]` are usually motivated (sticky headers) — judge via `describe`, don't hard-flag
  retires: none

- id: centered-hero-blob | added: 2026-06-22 | status: active | scope: global
  any: []
  describe: oversized centered hero with a single CTA over a gradient-mesh or 3D blob; no focal object related to the actual product
  evidence: the dominant generated-landing-page layout reflex (2026-06); hero/campaign surface tell
  note: not greppable — Layer-2/lens judgment only; legitimate when the blob/mesh IS the brand asset
  retires: none

- id: monotone-metric-grid | added: 2026-06-27 | status: active | scope: global
  any: []
  describe: product-UI tell — every dashboard card an identical flat monotone metric box in a uniform grid; no hero metric, no hierarchy, gray-on-gray "surface-2" template smell
  evidence: recurring across generated admin/dashboard batches for two products (2026-06); the craft-council pass repeatedly traced "generic dashboard" verdicts to this
  note: product-UI surface tell; a deliberate dense uniform ledger (analyst registers) is a DECISION — check the register before flagging
  retires: none
