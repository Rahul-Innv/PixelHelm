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

## The house style ACROSS runs (the axis in-run metrics cannot see)

Everything above fights homogeneity WITHIN a field. It does not touch the failure the
owner actually reported: a field that is internally distinct and still reads as the
same studio's work every time.

Measured, not supposed. On E3 (2026-07-26) every registered divergence metric passed on
every arm — dE00 distance, layout class, motif Jaccard, blind-intent recovery — and the
owner's verdict was *"I see a theme - all of them are similar to each other and to the
set-1 style I called merely easier on the eyes"*, across three arms AND across
archetypes. Pairwise difference is not felt variety.

So before the tournament is judged, compare THIS field against PRIOR runs' COMMITTED
WINNERS — the ledger lines, the archived verdicts, the baseline renders. Named
artifacts, never a remembered impression. Recurring STRUCTURAL signatures are the tell,
not shared palettes:

- the same spine every time (hero → three-up → ledger → quiet footer note);
- the same hierarchy metaphor reused under a new direction name;
- the same signature element re-skinned (the rail, the plate, the ledger row);
- the same section/paragraph rhythm, whatever the subject;
- one accent on a quiet neutral as the answer to every register.

Evidence rules are the anti-cliche registry's ADD/PROMOTE rules verbatim: a tell needs
a cited example across at least two runs. An uncited tell is not a finding.

**This check is ADVISORY.** A recurring signature is recorded with its evidence and
surfaced to the owner in the verdict's `houseStyleCheck`
(the loop leaf's `close-the-loop.md`). It does not block a winner, veto a direction,
or cost an iteration. What is enforced is only that the comparison happened and that
its result — including an honest `not-run` with a reason — is on the record.

The generation-side response, when a tell IS cited: give one arm an explicit mandate to
break the recurring signature, the same way `divergence axes` are assigned within a
run. Do not correct it by making every arm avoid the signature — that trades one house
style for another.

## Copy tells (words carry the fingerprint too)

The floor is not only visual. The same defaults show up in generated prose and the
owner reads them instantly:

- **Em dashes in body copy.** Owner, on the E3 editorial arms where they appeared in
  ALL THREE: *"em dashes present in all arms - not supposed to be there."* Use a
  period, a comma, a colon, or restructure the sentence. This is registered as the
  `ai-em-dash-copy` fingerprint and the Layer-1 anti-cliche grep can match it directly
  (SOFT — reported, never a hard fail).
- **Uniform paragraph rhythm** — every paragraph the same two-to-three sentences, every
  section the same length. Real writing varies; the metronome is the tell.
- **The symmetric three-card row** as the default answer to "several things go here"
  (already a named layout tell, above) — its copy twin is three headings of the same
  length with three bodies of the same length.

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
