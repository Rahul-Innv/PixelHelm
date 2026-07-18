# Anti-homogeneity — the FLOOR, never the aesthetic

Source channeled: v0 (color/font floor), superdesign `customAgentService.ts`
(banned defaults), Anthropic `frontend-design` (the three AI clusters),
`Dammyjay93 interface-design` (surface-branched tells).

These are FLOOR checks — they eliminate the slop cluster, they do not make a
design good. Distinctiveness still comes from the subject (see `taste-engines.md`).
**The brief's own words always win:** if the brief pins a look — even a banned one
— follow it exactly.

## The banned default cluster (unless the brief specifies it)

- **No bootstrap-blue (`#3b82f6`), no indigo, no purple/violet prominently** as
  the primary. These are the generative-AI fingerprint.
- **≤5 colors. ≤2 font families (+ optional mono).**
- **No decorative gradients** (the purple→pink / violet→fuchsia AI gradient is the
  worst offender — see the per-project banned clusters in the profile).
- **No raw `text-white`/`bg-white`/`bg-black`/hex** (see `token-law.md`).
- **No "modern aesthetic" autopilot** — safe palette + soft-shadow + centered flex
  container IS the shadcn-default cluster, not a choice. Floor only.
- Check the active profile's `bannedClusters` (e.g. a trust-register profile bans the AI cyan
  `#16d5e6`/`#00d4ff` and the purple→pink gradient) and never emit those values.

## The three AI-default LOOKS (defaults, not choices)

AI-generated design currently clusters around three looks. All are legitimate for
*some* briefs but appear regardless of subject — so don't spend a free axis on one:

1. Warm cream background (~`#F4F1EA`) + high-contrast serif display + terracotta accent.
2. Near-black background + a single bright acid-green or vermilion accent.
3. Broadsheet layout — hairline rules, zero border-radius, dense newspaper columns.

Where the brief pins one of these, it wins. Where the brief leaves the axis free,
don't default to one.

## Surface-branched tell-sets (ruling C6)

Deslop rules branch by surface type — the `pixelhelm-directions`/router sets the
surface; apply the matching set. Do NOT apply hero/marketing rules to dense
product UI.

**Product-UI tells** (when generating dashboards, tables, app screens):
- Monotone card grids where every card is the same weight (no hierarchy).
- Flat metric boxes — a big number + tiny label + accent, repeated, with no thesis.
- Meaning carried by color alone (fails grayscale / WCAG 1.4.1) — pair with icon +
  label + shape.
- Equal emphasis everywhere (no three-lever hierarchy: size + weight + color, never
  size alone).

**Hero / campaign tells** (when generating marketing/landing surfaces):
- The "hero is a thesis" applies HERE — but the big-number-+-gradient hero is the
  template answer; use only if truly best.
- Numbered markers (01/02/03) that aren't a real sequence.
- Decorative numbering/eyebrows/dividers that encode nothing true about content.

## The motivated-boldness exception (do not over-correct)

The deslop pass must NEVER flatten a *motivated* bold choice. A saturated palette
that the subject justifies, a dramatic type scale that the register permits, a
signature motion moment — these are SUCCESSES. The floor bans the unmotivated
default cluster, not boldness. When unsure whether something is a tell or a
decision, treat it as a decision (the council's false-positive filter is the
authority). E4 (justified risk) exists precisely to find the bold direction the
floor would otherwise scare the safe engines away from.

## Reject named theme presets (ruling C9)

Do not ship or pick from a catalogue of recognizable named looks
("neo-brutalism", "modern-dark", "glassmorphism"). A preset menu manufactures the
exact homogeneity this skill fights. Distinctiveness is subject-derived (the
tournament + north-star), never preset-picked.
