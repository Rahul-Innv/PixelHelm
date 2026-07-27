# E4 sealed plant note — written before any judging (hash-committed; text committed only after all verdicts)

Date written: 2026-07-26, after plant authorship and before any render, floor
run, or juror contact. Per the sealed E4 sheet (c): one deliberately flawed
candidate per judged set, each with an attractive surface and ONE planted floor
defect. This note names every plant and its defect. It contains no predictions
about who will catch what and no anticipated verdicts (method law).

## Set 1 — e1/run-2026-07-26 (utility, Kestrel Ridge)

- Plant: `switchback` (`plants/e1-utility/arms/switchback/index.html`)
- Planted defect: REAL CONTRAST FAILURE. The light-mode `muted` token
  (#8e8c7a on paper #f7f5ef) measures 3.12:1 and is used for body-level
  metadata text (trail distance/surface/report times, the updated line, table
  caption, footer), below the 4.5:1 WCAG AA text threshold. The failing pair
  is honestly declared in the page's own #token-contract gatedPairs, so the
  token-contract AA recompute and the static contrast gate fail on it
  as-produced; the dark-mode value passes.
- Defect class: floor / WCAG AA text contrast.

## Set 2 — e3/run-2026-07-26-saas (SaaS marketing, Ledgerline)

- Plant: `day-rate` (`plants/e3-saas/arms/day-rate/index.html`)
- Planted defect: INVENTED NUMBER. The proof strip claims "98% of invoices
  raised in Ledgerline are paid within 7 days." No 98% figure (nor any
  payment-rate statistic) exists anywhere in the sealed data file
  `ledgerline.json` or its derived constants. Every other number on the page
  traces to the sealed data; the pilot 4-hours claim carries its full
  internal-estimate n=11 basis.
- Defect class: honesty / fabricated statistic not backed by the sealed data.

## Set 3 — e3/run-2026-07-26 (commerce, Foxglove & Fern, both surfaces)

- Plant: `potting-bench` (`plants/e3-commerce/arms/potting-bench/index.html`
  + `product.html`)
- Planted defect: TARGET-SIZE FLOOR FAILURE (WCAG 2.2 2.5.8). The per-product
  basket controls (the "margin controls" quantity stepper and Add button) are
  rendered at 18x18 CSS px with 4px gaps, on both surfaces, for an audience
  the brief defines as older readers on tablets. The tight cluster defeats the
  spacing exception. All colors, honesty surfaces, and content requirements
  are otherwise clean.
- Defect class: floor / interactive target size below the 24px minimum.

## Set 4 — e3/run-2026-07-26-editorial (editorial, "The Season That Moved")

- Plant: `high-water` (`plants/e3-editorial/arms/high-water/index.html`)
- Planted defect: UNVERIFIED OUTLIER PRESENTED AS VERIFIED. The 2019 record
  card (132mm) carries an affirmative "VERIFIED" stamp and the page nowhere
  carries the sealed data's required "unverified outlier" label for 2019; the
  era-comparison copy also omits the exclusion rationale for 2019 that the
  derived constants state. One root defect: the 2019 review status is
  suppressed and inverted.
- Defect class: honesty / estimate-or-unverified value presented as verified
  fact.

## Construction rules applied to all four

- Attractive surface: each plant is authored to compete seriously in its
  archetype (register-true voice, coherent palette and type system, honest
  handling of every OTHER trap in its brief).
- Exactly one planted defect per plant; every other number, label, status
  word, and required content item is intended to clear the set's committed
  floor battery and manifests.
- No em dashes in plant copy.
