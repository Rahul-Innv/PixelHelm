# E3 DIRECTIONS — three arms, written BEFORE any render exists (2026-07-26)

Stage 2 of the admitted loop. Per the sealed pre-registration: each arm
carries a one-sentence intent and, per Amendment A1, a declared-breaks block —
which conventions the direction deliberately breaks and why the break serves
its thesis. The machine floor (including the brief's accessibility bar) is
never breakable; an undeclared break found in a candidate scores as a mistake.
No candidate code, render, score, or verdict exists at the time of this
commit.

---

## Arm `almanac-rail`

**Intent (one sentence, frozen):**
"A parish almanac read top to bottom: every year since 1990 is one ruled line
whose rain marks sit on a fixed September-to-October shelf, so the eye watches
the wet season walk later down the page while the entries grow heavier."

**Declared breaks (A1):**
1. **The year-list IS the only chart** — there is no separate hero graphic;
   the almanac rail (34 ruled year-rows, each carrying its onset mark on a
   shared calendar shelf and its rainfall figures in a fixed margin) carries
   the entire quantitative story. Why it serves the thesis: in an almanac the
   record itself is the reading matter; splitting "chart" from "table" would
   make the data decoration, and here the data is the story.
2. **Editorial interjections interrupt the record** — the rail is broken at
   the decade turns (and at the gaps, the method change, and 2019) by short
   prose asides set in the narrative voice, so caveats and story live inside
   the record, not in footnotes. Why: the local paper's patience is the
   register; the almanac that pauses to explain itself is that patience made
   visible.

Planned layout class: annotated-ledger-rail. Palette world: cool green-gray
almanac — unbleached gray-green paper, deep green-black ink, fern accent,
madder red reserved for the heaviest-day marks (dark mode: lamp-lit dark
green-gray). Motif budget: the ruled year rail + decade interjections only;
no cards, no sparklines, no stat tiles, no separate charts.

---

## Arm `weir-plates`

**Intent (one sentence, frozen):**
"Three patient broadsheet plates — when the rain comes, how much falls, how
hard the worst day hits — each annotated in the reporter's own words, with the
prose walking the reader from plate to plate."

**Declared breaks (A1):**
1. **The journalism is written on the plates** — annotations (the method
   change, the gaps, the 2019 flag, the era means) are set directly inside
   each chart plate instead of a separate caption column. Why: the
   anti-Snow-Fall thesis inverted — if every device must trace to the
   reporting, the strongest form is reporting inked onto the graphic itself.
2. **The grid is suppressed except where the story points** — each plate
   draws only the reference lines its annotations name (the era means, the
   calendar shelf, the gap markers), not a full axis lattice. Why: a patient
   local paper prints nothing it does not need; every line on the plate is a
   line of reporting.

Planned layout class: plate-sequence broadsheet. Palette world: river slate —
bone paper, deep slate ink, weir-water blue accent, a cold storm gray for the
outlier flag (dark mode: night-river slate). Motif budget: three annotated
SVG plates + prose passages + the full-record table as an appendix; no stat
tiles, no per-year rail-as-chart, no sparklines.

---

## Arm `two-inks`

**Intent (one sentence, frozen):**
"Two inks for two instruments: the manual-gauge years print in umber, the
weir years in river blue, and the whole story — later, harder — is read by
watching where the blue marks drift away from the umber ones."

**Declared breaks (A1):**
1. **The method-change disclosure is promoted to the page's color system** —
   every data mark, figure, and era label is inked by instrument (umber =
   manual gauge 1990–1996, blue = automated weir 1997–2023), so the
   1996/1997 boundary is disclosed by construction everywhere the record
   appears, and never only by color: era names are written out at every
   crossing. Why: the data-integrity caveat other pages bury in fine print
   becomes the brand layer — honesty as the signature.
2. **The finding leads; the record follows** — the page opens with a facing
   then/now diptych (the early manual-gauge era beside the recent verified
   weir years) before any time series, breaking the chronological-first
   convention of data narratives. Why: the reader's question is "what moved?"
   — the patient answer comes first, and the 34-year evidence is laid out
   underneath for checking.

Planned layout class: split-era-diptych. Palette world: two-ink duotone —
warm white ground, near-black text, gauge umber + weir blue as the only two
data inks, one quiet warm gray (dark mode: warm charcoal ground, lifted
umber/blue). Motif budget: the era diptych + one combined drift chart + the
full-record table; no other charts, no cards, no stat-tile rows.

---

## Shared discipline (all arms)

- **Content:** sealed data file only; derived numbers only via the committed
  injector's constants (`project/scripts/inject.mjs` → `data/derived.json`):
  era means (onset day / total / heaviest day, first five recorded years
  1990–1994 vs last five verified years 2018 + 2020–2023), the onset shift in
  days and approximate weeks, calendar-date equivalents, rises in mm and the
  one registered percentage, counts (34 years, 31 recorded, 3 missing), and
  the axis tick scales. No other number may appear that is not a sealed-data
  literal.
- **Accessibility bar (floor):** the story's conclusion in plain text in the
  opening viewport (the scannable no-scroll alternative); every chart a
  named, described element whose description states the actual finding;
  keyboard traversal reaches everything interactive; no scrolljack, no
  scroll-driven storytelling as the only path; `prefers-reduced-motion`
  parity for any motion.
- **Honesty binding (from GROUND):** every year 1990–2023 renders exactly one
  `data-model="<year>"` block (the per-year record row); null years render
  "no record"/"not recorded"/"no data" plus their sealed gap reasons; the
  2019 row and every 2019 mark carry "unverified"; no arm prints the
  standalone uppercase word "VERIFIED"; the phrases "manual gauge" and
  "automated weir" appear at every era crossing; every arm carries a scope
  sentence stating the page describes the shift, **not its cause**; the
  fictional human-context fragments may be quoted verbatim with their sealed
  attributions, only where they serve the data's story.
- Every arm embeds its own `#token-contract` (light+dark + gated pairs).
- Machine floor per GROUND.md; motion at most subtle and purposeful; no
  fingerprint-registry match, including the two design-level entries.
- Divergence discipline: each arm keeps to its declared motif budget and
  avoids the other arms' motifs; palettes are three separated color worlds.
  Arms may be tuned before candidate freeze only to satisfy the machine floor
  (AA recompute, mode fidelity); never after renders or scores exist.
