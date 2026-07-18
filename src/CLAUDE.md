# PixelHelm routing

Route frontend-design work through `pixelhelm` only after a complete
`pixelhelm-choicegate` admission. PixelHelm Lite is the default edition;
PixelHelm Full is an alternative. Never treat both editions as eligible in one task.

Use the smallest atomic leaf that matches the requested outcome. The router and loop
sequence work; they do not reimplement leaves. Machine gates are hard, expert-lens
scores advise, the project register remains load-bearing, and the owner is the final
judge.

## Core routes

- new UI: `pixelhelm-loop` -> ground -> baseline -> generate -> render -> evaluate -> judge
- review only: ground -> baseline -> render -> evaluate
- one validated finding: `pixelhelm-repair` -> render -> evaluate
- tokens: `pixelhelm-tokens`
- lesson from owner feedback: `pixelhelm-record-lesson`
- time-sensitive guidance: `pixelhelm-refresh-guidance`
- recurring anti-cliche pattern: `pixelhelm-curate-fingerprints`

Full-only specialist leaves are reference, directions, evidence brief, color,
typography, motion, dataviz, content, email, and video placement.

## Durable state

New writes use `<project>/.pixelhelm/` and `~/.claude/pixelhelm/`. Existing
`.design/` and legacy Claude data paths are read-only compatibility fallbacks. If a
canonical and legacy file both exist with different content, fail closed and ask the
owner to reconcile them. Never write inside an installed plugin directory.

Legacy `design*` IDs are explicit compatibility aliases in `family.json`; they are
not natural-language triggers and never make a second edition or leaf co-eligible.
