# E1 DIRECTIONS — three arms, written BEFORE any render exists (2026-07-26)

Stage 2 of the admitted loop. Per the sealed pre-registration: each arm
carries a one-sentence intent (these three sentences feed the blind-intent
test verbatim and are frozen here) and, per Amendment A1, a declared-breaks
block — which conventions the direction deliberately breaks and why the break
serves its thesis. The machine floor is never breakable; an undeclared break
found in a candidate scores as a mistake. No candidate code, render, score,
or verdict exists at the time of this commit.

---

## Arm `trail-ledger`

**Intent (one sentence, frozen for the blind-intent test):**
"The ranger's morning logbook: every trail is one ruled ledger line with its
status stamped beside it, read top to bottom like the board at the trailhead
kiosk."

**Declared breaks (A1):**
1. **No card, panel, or button chrome anywhere** — the whole interface is
   typographic rules, margins, and a paper ground; it breaks the
   card-and-chip dashboard convention. Why it serves the thesis: a paper log
   carries trust through plainness — chrome would read as software, not as a
   ranger's record.
2. **Status is a letterpress-style stamp** (uppercase, outlined, faintly
   rotated) instead of a color pill — color demotes to secondary ink and is
   never the only signal. Why: a stamp reads as an act performed by a person;
   "someone verified this" is the outdoors-trust register made visible.

Planned layout class: list-ledger. Palette world: warm paper cream / ink /
forest / rust / amber (dark mode: lamp-lit dark paper). Motif budget: the
ruled data table only; no legend block, no sparkline, no sticky header.

---

## Arm `status-board`

**Intent (one sentence, frozen for the blind-intent test):**
"An alpine lift-status board: each trail is a bold tile whose color field you
can read from across the parking lot, five seconds to scan the whole wall."

**Declared breaks (A1):**
1. **The status color field dominates each tile** — the biggest visual
   element is the status itself, breaking the text-first restraint convention
   of utility pages. Why: at a trailhead you read color fields at distance
   first and details at arm's length second; the board metaphor IS the
   service promise.
2. **Status speaks glyph-first** — oversized geometric status marks (disc =
   open, triangle = caution, cross = closed, dashed ring = no report) carry
   the primary status language ahead of words, breaking the label-first
   convention. Why: lift boards world-wide train exactly this reading; the
   glyphs also make every status color-independent by shape.

Planned layout class: grid-first. Palette world: cool glacier — pale ice
ground, deep slate ink, glacier blue accent, cool-tuned status colors (dark
mode: night-slate board). Motif budget: card grid, sparkline for the 7-day
history, one legend block; nothing else from the checklist.

---

## Arm `first-light`

**Intent (one sentence, frozen for the blind-intent test):**
"One decisive opening: the whole network's answer in plain words on the left,
the two things that could change your plan on the right — everything else
waits below the fold."

**Declared breaks (A1):**
1. **The opening viewport spends its space on a single typographic verdict**
   (the injected open-count in plain words) instead of the trail list,
   breaking the list-first utility convention. Why: the visitor's question is
   "can I hike today" — the direction's thesis is that the answer, not the
   data, is the product; the list serves as evidence below.
2. **Two-ink monochrome plus one reserved safety orange** — near-black on
   white with orange spent ONLY on what demands attention (caution outline,
   closed fill), breaking the green/amber/red status-triad convention. Why:
   calm is the register; monochrome is calm made literal, and a single alarm
   color means an orange mark is never wallpaper — statuses stay
   distinguishable without color via labels and fill/outline/weight.

Planned layout class: split-hero. Palette world: white / warm near-black /
safety orange / two warm grays (dark mode: warm near-black ground, bone
text). Motif budget: big-number stat row (the verdict) and oversized display
typography; nothing else from the checklist.

---

## Shared discipline (all arms)

- Content: sealed data file only; derived counts only via the committed
  injector's constants. Unreported = unknown; null day = explicit gap;
  snowpack visibly "estimated"; alert with its effective window; data-age
  timestamps shown.
- Every arm embeds its own `#token-contract` (light+dark + gated pairs) and
  tags each trail block `data-model="T-01" … "T-09"` (exactly the sealed ids) for the honesty gates.
- The null history day renders one of the phrases "no data" / "no report" /
  "not recorded" (the content-manifest gate binds to these alternatives).
- Statuses render as case-sensitive uppercase words (OPEN / CAUTION / CLOSED /
  NO REPORT) so the false-verdict gate can bind to the standalone word "OPEN"
  without colliding with the network name "…Open Space".
- Machine floor per GROUND.md; motion at most subtle and purposeful, with
  `prefers-reduced-motion` parity; no fingerprint-registry match, including
  the two design-level entries.
- Divergence discipline: each arm keeps to its declared motif budget and
  avoids the other arms' motifs; palettes are three separated color worlds
  (measured after build by the registered ΔE00 script; arms may be tuned
  before candidate freeze only to satisfy the registered thresholds, never
  after scores exist).
