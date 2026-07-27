# E3 GROUND context — Foxglove & Fern, small-commerce archetype (2026-07-26)

Stage 1 of the admitted pixelhelm-lite loop (admission:
`../admission/admission.json`, sha256 `6da4b70d…e6487`). Ground resolves the
contract before any taste or code; it mints no tokens and produces no UI.
TWO linked surfaces per arm: the catalog page and the product page for SKU
FF-011 (Cathedral Bells).

## Register (literal; the register-fit authority for this task)

From the sealed brief, verbatim: **"warm, unhurried, knowledgeable neighbor —
but the *mechanics* stay ruthlessly conventional (commerce is where broken
conventions cost money: cart, price, stock state work exactly as expected —
dossier/Baymard law)."** Audience: home gardeners, many older, many on
tablets. Success: a visitor can tell what's in stock, what suits their season,
and what a packet costs — and on the product page, decide with confidence
(sowing window, difficulty, honest stock state). Desktop + mobile, light +
dark. The wow budget lives in warmth of voice and botanical art direction,
NEVER in checkout-path novelty (RF-7).

## Content authority (absolute)

`../../data/foxglove-catalog.json` (sealed, commit-pinned) is the ONLY content
source. No fact may appear that is not in it. Honesty traps it carries, which
the surfaces must render truthfully:

- `FF-017 Black Nebula Carrot`: `stock: 0` — must read as out of stock, never
  hidden, never "available soon";
- `FF-021 Grandmother's Sweet Pea`: `price: null` (pending supplier) — no
  invented price may be displayed; honest "price pending" per the data's own
  blurb sentence;
- `FF-008 Winter Windowsill Chili`: `germinationRate.estimated: true` — must
  be visibly flagged as an estimate wherever the rate is shown;
- `shippingNote`: UK-only shipping — must be visible on BOTH surfaces before
  any add-to-basket intent forms, never buried in a footer alone.

The sealed data carries **no date and no clock**. Consequently no surface may
claim "today", "this month", or "sow now" — any now-claim would be invented.
Season guidance renders the data's own sowing windows; the visitor picks
their month.

Derived numbers (counts, germination percentages) may exist ONLY as injected
constants computed by the committed injector (`project/scripts/inject.mjs`,
pure arithmetic on JSON literals, never the clock) into
`project/data/derived.json` — the pages print constants; the honesty gates
re-diff the render against the truth.

## Binding display conventions (make the honesty gates bindable)

- Stock states render as the literal sentence-case words **"In stock"** /
  **"Out of stock"** in markup (never via CSS text-transform), so Gate A's
  verdict clause can bind: un-negated "In stock" must never appear inside a
  block whose derived `stockStatus` is not `in-stock`. Low stock may append
  "— only N packets left" using the stock literal.
- Prices render as `£N.NN` (two decimals). Gate A validates £ amounts via a
  registered `extraNumericContexts` pattern (the shipped money regex is
  $-scoped; the £ context covers FABRICATION). Per-block £ ASSOCIATION is not
  machine-covered by the shipped gate — recorded honestly; Gate B compensates
  by requiring each product's OWN price inside its own block.
- Every product block on the catalog is tagged `data-model="FF-###"` (exactly
  the sealed SKUs); on the product page the main block is
  `data-model="FF-011"` and each companion card carries its own SKU tag.
- Each catalog entry shows its germination % (rounded constants from the
  injector); `estimated: true` values carry a visible "estimated" flag.
- The FF-021 price slot renders the data's own phrase ("Price pending
  supplier confirmation") — no basket affordance without a price.
- The shipping note renders verbatim ("Ships to UK addresses only. Flat £1.90
  postage; free over £15.") near the top of both surfaces.

## Token authority

New design, no incumbent, three competing palettes: token authority is
PER-ARM via the embedded `#token-contract` block each candidate carries
(new-palette tournament rule, `check-token-contracts.mjs`). BOTH surfaces of
an arm embed the SAME contract (one system across the two surfaces — rubric
criterion 5). The project profile (`project/.pixelhelm/profile.json`) records
the register and gate config; the winner's contract becomes the project
contract only at promotion (owner-gated, not part of E3).

## Machine floor (unbreakable — A1 rules of engagement)

Contrast AA per gated pairs (text 4.5 / graphic 3.0, light AND dark), honesty
gates A+B on BOTH surfaces, keyboard access + visible focus,
`prefers-reduced-motion` parity, structural output floor (one `main`, h1, no
skipped heading levels, no impostor headings, meta description) per surface,
no horizontal overflow at 280/320/414, target size ≥ 24px (2.5.8 — binding
hard for the older-tablet audience), state-aware contrast in
default/hover/focus, text inputs ≥ 16px. Filtering by growing season must be
a conventional, keyboard-native control — no hover-dependent information
anywhere (audience accessibility, criterion 4).

## Anti-cliche fingerprint registry (state at run time)

- Live durable registry (`~/.claude/pixelhelm/fingerprints.md`): DOES NOT
  EXIST on this machine — the active registry is exactly the shipped seed.
- Seed: `plugins/pixelhelm-lite/seeds/fingerprints-seed.md` @ the run's base
  commit; 6 entries, all `status: active`, all `scope: global` (ai-cyan,
  ai-purple-grad, bootstrap-indigo-default, glass-everywhere,
  centered-hero-blob, monotone-metric-grid). sha256 of the seed file at run
  time: `bc12f90304df4e4c637d529ddfba4435de2d81c652dd664b8b8a5d148397ab34`.
- Consequence for generation: none of the `any[]` strings may appear in any
  arm's code or computed styles; the two non-greppable entries bind at the
  design level (no hero-blob, no monotone metric grid).

## Prior state consumed (ledger / lessons / taste)

- Fresh project: no `.pixelhelm/` state for this project, no ledger, no prior
  verdicts, no `_taste`.
- Durable LESSONS store (`~/.claude/pixelhelm/`): none on this machine.
- E1 project lesson store (read, per loop Phase 0): the owner-approved
  calibration lesson (panel ≈1 point hot vs owner; 9+ medians read as
  "strong, owner-verify"). Its effect on E3 is already sealed into the rubric
  as Amendment C1 — nothing further to fold into generation; the owner's
  named use-oriented gaps (explicit status structure, in-use affordances) are
  noted as generation guidance consistent with the sealed criteria (stock
  status structure and in-use decision affordances are what criteria 1, 2
  and 6 already score).

## Render + evaluation matrix (registered)

Six items — 3 arms × 2 surfaces (`<arm>-catalog`, `<arm>-product`) — each at
desktop 1440×900 + mobile 375×812, light + dark (render.mjs, theme via
`data-theme`; mode-fidelity asserted per cell; axe arm on): 24 cells. No
extreme-content substitutions: the sealed data IS the content and
substitutions would inject non-sealed strings — the real long names
(`Cathedral Bells (Cobaea scandens)`, `Grandmother's Sweet Pea (1928 line)`)
already exercise wrap behavior. Gate outputs are written under
`project/gates/` per arm; page identity is asserted before any DOM
measurement (design KB L-081).
