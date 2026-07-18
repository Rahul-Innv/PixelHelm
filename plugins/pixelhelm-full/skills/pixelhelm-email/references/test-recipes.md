# Email test recipes — assertions on MEANING, not markup

Source: `design/email-client-constraints.md` (test recipes + final acceptance).
Write tests against the BUILT HTML string. The builder is pure:
`build(data) -> {subject, html, text}`. Assert MEANING, not structure — the
production recipes below survived two complete visual reworks with ZERO edits,
because they test what must stay true, not how it is marked up.

## Contents
- [The recipes](#the-recipes)
- [The non-vacuity pattern (MUST)](#the-non-vacuity-pattern-must)
- [Final acceptance](#final-acceptance)

## The recipes

- **Copy guards.** The hedge/trust lines render verbatim. Assert the exact
  protective strings appear (e.g. "unverified estimate — never a BUY"-class
  copy). Copy is design material; if a trust line silently drops, the email lies.

- **Link order / presence.** The preferred link comes FIRST (direct -> search ->
  fallback), checked by POSITION in the HTML string (index of A before index of
  B). Order is a UX promise, not decoration.

- **Escaping.** Feed a hostile model-authored string (`<img onerror=…>`) through
  `build()` and assert it comes out entity-escaped in the HTML. Every
  model/user-provided string is escaped; every `href` scheme is validated.

- **Token-sourced style guards.** Import the SAME token module the builder uses
  and assert the chip recipe against token VALUES, e.g.
  `assert.match(html, new RegExp(\`color:${fg};border:1px dashed ${border}\`, 'i'))`,
  so palette changes flow through without editing tests. Also assert the
  no-background rule:
  `assert.doesNotMatch(html, new RegExp(\`background:${POSITIVE.bg}\`, 'i'))`.

- **Send-gate proof.** If sending is env-gated (`SEND_EMAIL=1`-style), a test MUST
  prove the DEFAULT path writes a preview and sends NOTHING.

## The non-vacuity pattern (MUST)

A negative assertion can be vacuously true. "The positive-verdict color NEVER
appears on an unverified row" is green by default if that color never renders at
ALL. Always ship the negative WITH its companion-positive:

- NEGATIVE: the positive-verdict color does NOT appear on an unverified row.
- COMPANION-POSITIVE: the positive-verdict color DOES appear on a verified row.

Ship the pair, always. The same applies to the no-background chip guard: pair
"no `background:` on the chip span" with a positive asserting the outline recipe
("text color + border IS present"), so you are proving the survivor recipe
rendered — not just that one bad pattern is absent.

## Final acceptance

A real inbox, not a screenshot. Send via the real draft/send flow — THAT is what
triggers compose normalization (the killer for MUST 2: Gmail strips `background`
from spans only in compose-normalized flows like draft-then-send and forwards).
Then eyeball dark + light × phone + desktop. Automated checks gate the merge; the
inbox gates the ship.
