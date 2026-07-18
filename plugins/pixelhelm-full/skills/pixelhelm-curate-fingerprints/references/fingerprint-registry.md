# Anti-cliche fingerprint registry

The self-updating dictionary of overused, AI-generated-looking visual tells the
plugin actively bans. AI-slop DRIFTS — today's overused cream/glass/neon-teal is
last year's, and shadcn-default reads as generic now where it didn't before — so
the registry is refreshed from EVIDENCE on the REFRESH leg, never from vibes, and
each entry is SCOPED because a tell for one register can be a signature for
another. Consumed by `pixelhelm-evaluate` Layer-1 and the per-project profile's
`bannedClusters`; keep all three in lockstep.

## Contents
- [Where the registry lives](#where-the-registry-lives)
- [What a fingerprint is](#what-a-fingerprint-is)
- [Entry shape](#entry-shape)
- [Per-register scoping (never homogenize)](#per-register-scoping-never-homogenize)
- [ADD / PROMOTE / RETIRE rules (the evidence gate)](#add--promote--retire-rules-the-evidence-gate)
- [Surface-typed tell-sets](#surface-typed-tell-sets)
- [Wiring into evaluate + the profile](#wiring-into-evaluate--the-profile)
- [What is NOT slop (the guard)](#what-is-not-slop-the-guard)

## Where the registry lives

The LIVE registry file is `<dataDir>/fingerprints.md`, seeded on first use from
the shipped `<plugin>/seeds/fingerprints-seed.md`. Nothing is ever written inside
the plugin directory (installed plugins are replaced on update). `<dataDir>` =
`$CLAUDE_PLUGIN_DATA`, else `~/.claude/pixelhelm/` if it
exists, else `~/.claude/pixelhelm/`.

## What a fingerprint is

A fingerprint is a greppable or describable TELL that makes UI read as
machine-generated/generic — a color cluster, a gradient, a layout reflex, a font
default. Examples already pinned in a real trust-register profile: `ai-cyan`
(`#16d5e6`/`#00d4ff`/neon-teal) and `ai-purple-grad` (`from-purple-500
to-pink-500`, `from-violet-600 to-fuchsia`). The plugin's floor checks also ban
bootstrap/indigo-blue defaults, prominent purple/violet, decorative gradients, and
raw `text-white`/`bg-white` UNLESS the register motivates them.

A fingerprint is a FLOOR check, never the aesthetic. Passing it does not make a
design good; failing it makes a design generic.

## Entry shape

```
- id: <slug, e.g. ai-cyan> | added: YYYY-MM-DD | status: candidate|active|retired | scope: <register or "global">
  any: ["<hex / class / token>", ...]      # greppable signatures (match = flag)
  describe: <the non-greppable version, for the lens/Layer-2 to judge>
  evidence: <cited example + where it was seen + date>
  note: <why it reads as a tell; when it would be legitimate>
  retires: <id | none>
```

`any[]` feeds the deterministic grep (Layer-1); `describe` feeds the model lens
(Layer-2) for tells that can't be grepped (e.g. "every card is a flat monotone
metric box," "centered hero + gradient blob," "no focal point"). Carry both when
possible.

## Per-register scoping (never homogenize)

Registers differ — e.g. a warm consumer app = warm-premium-fun-but-calm; a regulated
trust portal = serious-trust; an analyst data product = analyst-terminal. A cluster
banned for one can be a SIGNATURE for
another (a saturated neon is slop in a trust register, but could be intentional in
a different brand). So:
- `scope: global` — a tell across all registers (e.g. raw AI-purple→pink gradient).
- `scope: <register>` — pinned to one register/profile only.
- NEVER widen a register-scoped tell to global, or drop a project-pinned cluster,
  without owner sign-off. Profiles own their `bannedClusters`; the registry is the
  shared library they draw from.

## ADD / PROMOTE / RETIRE rules (the evidence gate)

Only on the REFRESH leg, only as a reviewable diff, and only with cited evidence:

- **ADD (`status: candidate`)** — a new tell is observed and CITED (a real example
  + date, ideally from a feed or a flagged generation). Starts as `candidate`
  (lens-only, advisory) until confirmed in a second instance.
- **PROMOTE (`candidate → active`)** — the tell recurred / the owner confirmed it.
  Now it can drive a Layer-1 grep (if it has `any[]` signatures) or a hard profile
  ban. Promotion needs the same bar as a lesson: re-confirmed, not just believed.
- **RETIRE (`active → retired`)** — the tell is no longer a reliable signal (the
  aesthetic moved on, or it caused false-positives on motivated designs). Move it
  to a retired block; name it in the replacement's `retires:` if superseded. Do NOT
  delete (history is the audit trail).

A registry edit with no cited evidence is a FAIL. Vibes don't move the dictionary.

## Surface-typed tell-sets

Product-UI and marketing/hero surfaces have DIFFERENT slop signatures (the
plugin's C6 ruling: one engine, deslop rules branched by surface). Tag tells so the
right set applies:
- **product-UI tells** — monotone card grids, flat metric boxes, every layout a
  centered flex container, gray-on-gray "surface-2" template smell.
- **hero/campaign tells** — the named cliche clusters: gradient mesh blobs,
  glassmorphism-everywhere, oversized centered hero + single CTA, stock-3D-blob.

`pixelhelm-directions` sets the surface; the matching tell-set applies. A
product-UI tell shouldn't fire on a marketing hero and vice-versa.

## Wiring into evaluate + the profile

Keep these three in lockstep — the registry is the source, the others consume:
1. **The registry** (the live `<dataDir>/fingerprints.md`, seeded from
   `<plugin>/seeds/fingerprints-seed.md`) is the shared, dated, scoped library of tells.
2. **The per-project profile** (`profiles/<project>.json` `bannedClusters`) pins the
   `active` tells that apply to THAT register, in the profile's `{id, any[], note}`
   shape. pixelhelm-record-lesson proposes the diff to add/remove a cluster there.
3. **`pixelhelm-evaluate` Layer-1** greps the `bannedClusters` `any[]` against source
   (respecting `allowRawColorIn`); Layer-2 judges the `describe` tells. A new
   `active` fingerprint must be reflected in both, or it doesn't actually gate.

Never edit the profile or evaluate's gate from this skill directly — propose the
diff; the owner saves it. Never mint a token here (that is `pixelhelm-tokens`).

## What is NOT slop (the guard)

Mandatory before flagging anything: a MOTIVATED bold choice is a SUCCESS, never a
defect. Do not let the registry flatten intent. When unsure whether a saturated
color / dramatic type / signature motion is a tell or a decision, treat it as a
DECISION and do not flag it — the burden is on the registry to prove a tell with
evidence, not on the design to defend a choice. This mirrors the pixelhelm-judge /
pixelhelm-evaluate false-positive filter: taste ≠ defect; a bold choice ratified by
the register is intended; out-of-scope items are not findings.
