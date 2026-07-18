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

Near misses: backend work, general product strategy, brand strategy without UI,
unadmitted tasks, and a named Full-only specialist outcome do not route to a second
Lite leaf. A Full-only request returns to ChoiceGate; it never activates Full beside
Lite.
