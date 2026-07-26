# E3 brief 2 — Foxglove & Fern (small-commerce archetype: catalog + product page)

**Status: DRAFT — PENDING OWNER APPROVAL. Sealed by commit before any E3
generation.** Date drafted: 2026-07-26.

## The brief (verbatim input to GROUND)

> Build two linked surfaces for **Foxglove & Fern**, a fictional two-person
> heirloom-seed shop: (1) the catalog page listing all seed packets with
> filtering by growing season, and (2) the product page for one packet
> (Cathedral Bells climbing vine). Audience: home gardeners, many older, many on
> tablets. Success: a visitor can tell what's in stock, what suits their season,
> and what a packet costs — and on the product page, decide with confidence
> (sowing window, difficulty, honest stock state). Desktop + mobile, light +
> dark. Register: warm, unhurried, knowledgeable neighbor — but the *mechanics*
> stay ruthlessly conventional (commerce is where broken conventions cost money:
> cart, price, stock state work exactly as expected — dossier/Baymard law).

## Sealed ground data — honesty traps included

`data/foxglove-catalog.json` is the only content source. Its traps:
- one product is `stock: 0` — must read as out of stock, never hidden or
  "available soon" without data;
- one product has `price: null` (pending supplier) — cannot display an invented
  price; must be honestly "price on request" or excluded with a reason;
- one product's germination rate is `estimated: true` — must be flagged;
- the shop ships to UK only (`shippingNote`) — must be visible before any
  add-to-cart intent, not buried.

## Loop protocol

Identical to E1's (3 arms, A1 declared-breaks, all gates, mutant ritual,
5-juror panel via records.mjs, everything committed). Archetype note: success
language is *service culture and mechanical trust* — the wow budget lives in
warmth of voice and botanical art direction, never in checkout-path novelty
(RF-7: the same moment that elevates a portfolio harms a purchase).

## Success / falsification (artifact 14 E3)

**Success:** both surfaces clear the floor battery AND the bar in
`PREREG-RUBRIC-commerce.md`. **Falsified if:** outputs regress to the utility
register (a seed *status dashboard* instead of a shop), or floor failures
cluster here.
