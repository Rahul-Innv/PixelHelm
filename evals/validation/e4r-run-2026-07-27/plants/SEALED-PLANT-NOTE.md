# E4-R sealed plant note — written before any judging (hash-committed; text committed only after all verdicts)

Date written: 2026-07-27, after plant authorship, page-identity assertion,
render, and floor battery, and before any juror is contacted. Per the sealed E4
sheet (c) and `PREREG-E4R-ADDENDUM.md` (c): one deliberately flawed candidate
per judged set, each with an attractive surface and ONE planted floor defect,
in a defect class distinct from every class used in the E4 run. This note names
every plant and its defect. It contains no predictions about who will catch
what and no anticipated verdicts (method law).

## Set 1 — e1/run-2026-07-26 (utility, Kestrel Ridge)

- Plant: `stone-steps` (`plants/e1-utility/arms/stone-steps/index.html`)
- Planted defect: REFLOW OVERFLOW. The seven-day weather table carries
  `min-width: 20rem` with no overflow container, so the document scrolls
  sideways at narrow widths: 56px of overflow at 280px and 16px at 320px. At
  414px and at both rendered viewports (1440px desktop, 375px mobile) there is
  no overflow at all, so the defect does not appear in any committed render.
- Defect class: floor / WCAG 2.2 1.4.10 reflow, caught by `verify_responsive`.
- Registered E4-R class for this set, unchanged from the addendum.

## Set 2 — e3/run-2026-07-26-saas (SaaS marketing, Ledgerline)

- Plant: `job-sheet` (`plants/e3-saas/arms/job-sheet/index.html`)
- Planted defect: STRUCTURAL OUTPUT FLOOR. The page has no `main` landmark; its
  heading order skips from `h1` straight to `h3`; and its five section titles
  are `div class="section-title"` heading impostors rather than heading markup.
  The meta description is present and correct, so the failure is landmarks and
  hierarchy only. Every one of these is invisible in a render: the page reads
  as a normally structured document to the eye.
- Defect class: floor / structural output floor (landmarks, heading hierarchy,
  heading impostors), caught by `output-floor-gate`.
- Registered E4-R class for this set, unchanged from the addendum.

## Set 3 — e3/run-2026-07-26 (commerce, Foxglove & Fern, both surfaces)

- Plant: `glass-house` (`plants/e3-commerce/arms/glass-house/index.html` +
  `product.html`; the defect is on the catalog surface)
- Planted defect: KEYBOARD TRAP. The "Sowing guide" modal dialog carries correct
  dialog semantics and correctly confines Tab, but it has no keyboard exit:
  Escape is not handled, no focusable control inside it closes it, and the only
  dismissal is a pointer click on the backdrop. A keyboard user who opens the
  guide cannot leave it and focus is never returned to the trigger. The dialog
  is closed on load, so it is absent from every committed render.
- Defect class: floor / WCAG 2.1.2 no keyboard trap (with 2.4.3 focus order),
  caught by `verify_focustrap`.
- Registered E4-R class for this set, unchanged from the addendum.

## Set 4 — e3/run-2026-07-26-editorial (editorial, Ashcombe Valley Observer)

- Plant: `gauge-house` (`plants/e3-editorial/arms/gauge-house/index.html`)
- Planted defect: INTERACTIVE STATE CONTRAST. The jump-navigation links change
  to `#9db4c0` on hover, measured at 1.91:1 against the light-mode paper
  `#f4f1e9`, against a 4.5:1 threshold; the same colour is carried into the
  focus state, so a keyboard user gets the same unreadable link. The default
  state is on-token and passes, and dark mode passes, so the failure exists
  only in a state no static render can show.
- Defect class: floor / WCAG 1.4.3 and 1.4.11 contrast measured in the hover
  and focus states on the real render, caught by `verify_states`. This is the
  class the addendum recorded as contrast-adjacent to E4's e1 plant and
  distinct from it in gate, success criterion, measurement, and
  render-visibility.
- Registered E4-R class for this set, unchanged from the addendum.

## Construction rules applied to all four

- Attractive surface: each plant is a newly authored page for E4-R, written to
  compete seriously in its archetype (register-true voice, coherent palette and
  type system, honest handling of every OTHER trap in its brief).
- Exactly one planted defect per plant. Each plant's committed battery shows
  exactly one hard-failing gate and that gate is the registered one; every
  other number, label, status word, and required content item clears the set's
  committed floor battery and manifests as-produced.
- Each plant reuses its set's proven-clean token contract (E1/E3 winner palette
  for e1-utility, e3-commerce and e3-editorial; the E4 saas plant's contract,
  which was AA-clean, for e3-saas) so that the only floor defect on the page is
  the registered one and no second gate fires by accident.
- None of the four E4 defect classes is reused: no static AA text contrast, no
  fabricated statistic, no target-size failure, no unverified-as-verified
  inversion.
- No em dashes in plant copy.
