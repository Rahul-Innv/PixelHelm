# E1 pass 2 — owner-directed repair of the winner (`trail-ledger`)

Documented `pixelhelm-repair` pass (route: one validated finding → repair →
render → evaluate), run after the owner's APPROVED-WITH-CHANGES verdict on the
E1 winner. This directory is APPEND-ONLY evidence for the pass; nothing in the
original run trail (`../project/`, `../REPORT.md`, sealed sheets) is edited.

## Findings under repair (restated, with evidence)

1. **Missing explicit status structure / color association** (owner-directed).
   Evidence: `../project/.pixelhelm/signoffs/2026-07-26--trail-conditions.json`
   + `ownerVerdict` in the council record — "the actual structure of, like,
   the open, caution, closed, no report was very useful … a similar thing with
   the first one would have elevated it even further."
2. **Missing in-use usability affordances** (owner-directed). Evidence: same
   records — "There's a lot of, like, missing UI. Like, how is it easy for the
   user?"
3. **Data-age framing tension** (recorded panel advisory, minor). Evidence:
   `constraints[0]` of `../project/.pixelhelm/council/2026-07-26--trail-conditions--council.json`
   — 6:00 PM-generated data framed as "Morning log / open this morning."

## Owned path

`pass2-owner-changes/arm/trail-ledger/index.html` — a revised copy of the
winning arm. The original candidate at `../project/arms/trail-ledger/index.html`
is a tournament archive and stays byte-identical.

## Planned changes (smallest bounded set)

- Split the single ledger list into four explicitly headed status groups —
  OPEN / CAUTION / CLOSED / NO REPORT, each header carrying its trail count in
  the status color (the status-board graft, executed in ledger idiom: stamps
  and ruled lines, no tiles, no card chrome).
- Add a stamped status-count strip at the top ("Jump to: 3 OPEN · 2 CAUTION ·
  2 CLOSED · 2 NO REPORT") whose stamps are anchor links to the group headers
  — structure, color association, and one-tap navigation in one element.
- Make the closure notice's trail names inline anchor links to their ledger
  entries; add a back-to-top link after the log. Smooth scrolling only under
  `prefers-reduced-motion: no-preference`.
- Reframe "Morning log" → "Daily log" and "open this morning" → "open today"
  (title/meta/summary), resolving finding 3 without any time-of-day claim the
  data does not carry.

## What is preserved (the repair contract)

- **Register**: "calm, factual, outdoors-trust; zero marketing voice" — no new
  voice, no spectacle.
- **Token authority**: the arm's embedded `#token-contract` is byte-identical —
  no new colors, no new gated pairs; every new element uses already-gated pairs
  (status colors as text on paper; ink on paper).
- **Declared breaks (A1)** stay in force: still no card/panel/button chrome
  (the count strip and headers are stamps and type, the arm's own idiom);
  status is still stamped words — color is never the only signal.
- **Content authority**: sealed `data/trail-status.json` + the committed
  injector's constants only. New visible numbers are exactly the injected
  counts {3, 2, 9}; no new facts.

## Execution decisions (documented, not improvised)

- The frozen DIRECTIONS motif budget for this arm said "no legend block". The
  owner's verdict explicitly directs grafting the status-board's explicit
  status structure; the owner is the final judge, so the status-count strip is
  authorized for this pass and recorded here as an owner-directed deviation
  from the tournament-stage budget. The sealed sheets themselves are untouched.
- Panel re-judge: NOT run. A single-pass owner-targeted repair is evidenced by
  gate proof + before/after renders (coordinator instruction); per the E1
  calibration lesson, no self-graded scores are claimed anywhere in this pass.
- Heavy browser work (render + browser validators) is scheduled after the
  three E3 sessions release the machine.

## Pass condition (what "done" means)

ALL shipped HARD gates green on the revised candidate, evidenced under
`gates/`: token-contract AA recompute, static gates (contrast), structural
output floor, `verify_responsive` (280/320/414), `verify_states` (light+dark),
`verify_targetsize` (375×812), `verify_focustrap` (not-applicable pass unless a
dialog exists), honesty Gate A (derived claims, both modes) and Gate B
(content manifest, both modes), plus axe 0 serious / 0 critical on all four
render cells. Before renders: `../project/renders/trail-ledger__*.png`; after
renders: `renders/`. Close by writing a `pixelhelm/run@1` record for the pass
via `records.mjs write run --project ../project` (surface
`trail-conditions-pass2`; append-only store). `signoff@1` for this pass is
deliberately deferred to the owner.
