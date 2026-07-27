# PixelHelm Lite routing

Lite is the default complete core outcome set. Route one primary intent and read the
named skill from disk.

| Intent | Atomic route |
|---|---|
| broad frontend design request | `pixelhelm` |
| verify ChoiceGate continuation | `pixelhelm-choicegate` |
| end-to-end bounded design pass | `pixelhelm-loop` |
| resolve register, tokens, guidance, lessons | `pixelhelm-ground` |
| capture the incumbent | `pixelhelm-baseline` |
| create grounded candidates | `pixelhelm-generate` |
| capture browser pixels | `pixelhelm-render` |
| run machine gates | `pixelhelm-evaluate` |
| compare candidates through lenses | `pixelhelm-judge` |
| fix one validated finding | `pixelhelm-repair` |
| maintain the token contract | `pixelhelm-tokens` |
| apply the approved passing delta | `pixelhelm-promote-design` |
| record one owner-derived lesson | `pixelhelm-record-lesson` |
| refresh stale local guidance | `pixelhelm-refresh-guidance` |
| curate an evidenced recurring pattern | `pixelhelm-curate-fingerprints` |

## Elicitation gate (REQUIRED before any direction intent)

Any route that produces a NEW look — a bounded design pass, or candidate creation
that is not already inside an owner-mandated direction — asks the owner what the
surface should FEEL like BEFORE the first direction intent is written: the wanted
register in their own words, what is explicitly not wanted, and the reference points
they already like. Capture the answer VERBATIM into the ground context every direction
must serve, or record an explicit owner waiver in the owner's own words.

A run that did neither is a process defect, surfaced like any other blocking finding.
It is enforced, not advised: the pass's run record carries `intentElicitation` and
`records.mjs write run` refuses the record without it, so the pass cannot close.
Full rule: `pixelhelm-loop` references, gates-and-loop.md section 0.

Near misses: backend work, general product strategy, brand strategy without UI,
unadmitted tasks, and a named Full-only specialist outcome do not route to a second
Lite leaf. A Full-only request returns to ChoiceGate; it never activates Full beside
Lite.
