# E3 DIRECTIONS — three arms, written BEFORE any render exists (2026-07-26)

Stage 2 of the admitted loop. Per the sealed pre-registration: each arm
carries a one-sentence intent (frozen here) and, per Amendment A1, a
declared-breaks block — which conventions the direction deliberately breaks
and why the break serves its thesis. Archetype law (sealed brief, RF-7): the
wow budget lives in warmth of voice and botanical art direction; breaks are
NEVER in checkout-adjacent mechanics — in every arm, price placement, stock
language, and add-to-basket affordances work exactly as convention dictates.
The machine floor is never breakable; an undeclared break found in a
candidate scores as a mistake. No candidate code, render, score, or verdict
exists at the time of this commit.

Each arm ships BOTH surfaces (catalog + FF-011 product page) as one system:
same token contract, same voice, same art direction.

---

## Arm `seed-annual`

**Intent (one sentence, frozen):**
"A page from the shop's printed seed annual: every variety is one numbered
catalogue entry set in warm type, read by the fire the way gardeners have
always read winter seed lists."

**Declared breaks (A1):**
1. **No card, panel, or photo-tile chrome anywhere** — the catalog is set as
   a printed seed-annual list: numbered entries, rules, catalogue
   typography on a paper ground. Why it serves the thesis: a two-person
   heirloom shop's provenance love reads truest in the form gardeners
   already trust — the printed annual; card chrome would read as
   marketplace, not shop. (Within each entry the money path is untouched:
   price in the entry's price slot, stock line beside it, conventional
   basket affordance on the product page.)
2. **Botanical specimen labels** — each variety's botanical/type line is set
   as a letterspaced small-caps specimen caption, catalogue-plate style,
   as the art direction instead of imagery. Why: the specimen label carries
   botanical seriousness and provenance without borrowed boutique gloss.

Planned layout class: list-catalogue (numbered single-column entries).
Palette world: warm cream paper / deep garden-green ink / rust-marigold
accent (dark mode: lamplit evening paper). Motif budget: numbered entry list
+ ruled dividers only; no packet illustration, no shelf labels, no month-band
bars.

---

## Arm `packet-rack`

**Intent (one sentence, frozen):**
"The wooden seed rack by the shop door: each variety is its own illustrated
packet standing in the rack, browsed one at a time the way you'd turn a
packet over at the counter."

**Declared breaks (A1):**
1. **Each product renders as its physical seed packet front** — a
   CSS-illustrated packet (framed face, botanical vignette, variety name as
   packet lettering) instead of a standard photo-card. Why: in an heirloom
   seed shop the packet IS the product; the rack metaphor makes the
   two-person service culture visible. (Price, the stock line, and the
   product-page basket controls keep their exact conventional form and
   placement on and under each packet.)
2. **Season shelf rails** — the rack is grouped under shelf-edge labels by
   sowing season, styled as the wooden rack's shelf tags. Why: it is how a
   real counter rack is organized; grouping is brand-layer information
   architecture layered over a conventional filter control, not a mechanic.

Planned layout class: grid-rack (packet grid under shelf groups). Palette
world: warm shop-timber ground / linen packet faces / leaf green /
terracotta (dark mode: evening shop interior). Motif budget: packet cards +
shelf-edge labels; no numbered list, no dotted leaders, no month-band bars.

---

## Arm `sowing-almanac`

**Intent (one sentence, frozen):**
"An almanac opened on the potting bench: the year's sowing windows down one
edge and every variety shelved under the window it belongs to, so the
visitor finds their month before they find a packet."

**Declared breaks (A1):**
1. **The catalog's primary organization is the sowing calendar** — varieties
   are grouped under sowing-window headings, each entry carrying a
   month-band diagram of its window, breaking the flat storefront-grid
   convention. Why: the seed buyer's deciding question is "what can I sow in
   my month"; the almanac answers it structurally instead of leaving it to a
   filter alone. (The month filter itself stays a plain labeled control;
   within each entry price, stock, and basket mechanics are exactly
   conventional.)
2. **Almanac marginalia as the art direction** — month-band bars and small
   ruled marginal notes in the grower's voice. Why: the knowledgeable
   neighbor's voice already lives in the almanac margin; it is warmth
   without gloss.

Planned layout class: grouped-split (window rail + grouped entries; groups
stack on mobile). Palette world: unbleached linen / moss green / damson-plum
accent (dark mode: dusk linen). Motif budget: month-band bars + window group
headers + marginal notes; no packet illustration, no numbered-entry list.

---

## Shared discipline (all arms)

- Content: sealed `foxglove-catalog.json` only; derived counts and
  germination percentages only via the committed injector's constants. No
  date or "sow now" claim anywhere (the data carries no clock).
- Money path (dossier/Baymard law, every arm): price as `£N.NN` in the
  conventional price slot; stock as the literal words "In stock" /
  "Out of stock" (sentence case, in markup); FF-017 is honestly out of
  stock with no basket affordance; FF-021 shows "Price pending supplier
  confirmation" and no basket affordance; the product page's quantity +
  "Add to basket" control is plain and standard.
- The UK-only shipping note renders verbatim near the top of BOTH surfaces,
  before any basket affordance.
- Season access on the catalog in every arm: one conventional, labeled,
  keyboard-native "sowing month" `<select>` filter (16px+ input text), plus
  whatever brand-layer grouping the arm declares. Filtering hides entries;
  the default state shows all eight.
- Every product block is tagged `data-model="FF-###"` (exactly the sealed
  SKUs) on the catalog; the product page tags its main block `FF-011` and
  its two companion cards `FF-002` / `FF-014`. Companion cards link nowhere
  (only FF-011's product page exists in this experiment — scope note, not a
  break); the FF-011 catalog entry links to `product.html` and the product
  page links back to the catalog.
- Each catalog entry shows stock state, season window, price, and
  germination % (estimated values visibly flagged "estimated" — FF-008's
  trap). The product page shows the sowing calendar (indoors / plant out /
  flowers), difficulty, packet size, germination, grower notes, and the two
  companions, arranged so a first-time gardener can decide on the page
  (criterion 6).
- Every arm embeds the SAME `#token-contract` in both of its surfaces
  (light+dark + gated pairs); statuses and stock words are literal text in
  markup, never produced by CSS text-transform, so the honesty gates bind.
- Machine floor per GROUND.md; motion at most subtle and purposeful with
  `prefers-reduced-motion` parity; no fingerprint-registry match, including
  the two design-level entries.
- Divergence discipline (not measured in E3, kept as craft discipline): each
  arm keeps to its declared motif budget and avoids the other arms' motifs;
  palettes are three separated warm color worlds.
