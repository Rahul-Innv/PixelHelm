# Incremental polish — the good→great diff recipe (REDESIGN, high-headroom incumbent)

The second REDESIGN method. The tournament (`taste-engines.md`) explores FAR from
the incumbent — bold new directions, bad→good. That is the wrong instrument when the
incumbent is ALREADY good and on-register: a bold tournament tends to tear out exactly
what works (the miss on a warm consumer app, where a "Restraint" winner flattened the warmth that is
the whole product). Incremental polish exploits NEAR the incumbent — good→great — by
stacking small surgical wins on top of a design that already passes.

The incumbent guard (the `pixelhelm` skill's `references/gates-and-loop.md` §7) is SHARED by both methods. Polish does not
relax it; it just changes how candidates are produced — diffs off the incumbent instead
of fresh directions.

## When to use this (the router selects by headroom)

The router classifies a REDESIGN into {tournament | polish} by the incumbent's headroom,
not by preference:

- **Polish** when the incumbent's register-fit is already HIGH and the marginal room is
  SMALL — the design is on-register and good, and a wholesale reframe risks regression
  more than it promises lift (e.g. a warm consumer app's home screen). Exploit near.
- **Tournament** when register-fit is LOW or the headroom is LARGE — the design is off
  the mark or weak, so exploring far is worth the teardown risk (e.g. an analyst data
  product's early terminal).
  Explore far.

When in doubt between the two, ask the owner — but a high-register-fit incumbent
defaults to polish, never to a tournament that would put its best parts on trial.

## The recipe

1. **Start from the rendered incumbent as the fixed baseline.** The current/live design,
   rendered on the candidate matrix (same viewports + modes), is the anchor. It is not a
   deleted baseline and it is not on trial as a whole — it is the thing every diff is
   measured against.
2. **Generate a RANKED set of small, surgical diffs.** Each diff is ONE isolated change —
   a spacing-rhythm correction, a single type-step, one state, one motion beat, one
   token-discipline fix. Rank them by expected lift. Never a wholesale reframe, never two
   changes bundled into one diff (a bundle can't be A/B'd cleanly — see
   `edit-discipline.md`).
3. **Render each diff** on the same matrix as the incumbent (cost-aware: a single-element
   diff re-renders only the relevant viewport/mode — the `pixelhelm` skill's `references/gates-and-loop.md` §5).
4. **A/B each diff against the incumbent** — the incumbent is the comparison, every time,
   not the other diffs.
5. **Keep a diff ONLY if it clears the shared incumbent guard** — it improves the overall
   council score AND does not lower register-fit (the `pixelhelm` skill's `references/gates-and-loop.md` §7). A diff that is
   "cleaner" but reads colder/less-on-register fails clause 2 and is dropped, however tidy
   it looks in isolation.
6. **STACK the surviving diffs and re-render the combined result**, then re-check the guard
   on the STACK — diffs that each passed alone can interact (a spacing change plus a
   type-step can compound or cancel), so the stacked result must clear the guard as a whole,
   not just diff-by-diff.
7. **Nothing the register prizes is removed.** Warmth, color, character, the signature
   elements (for a warm consumer app: its signature ring + hand-drawn illustration, the
   color-coded metric cards) stay. Removing what the register prizes is a register-fit LOSS, not restraint —
   it fails clause 2 of the guard by definition. "Quiet" applies to competing focal points,
   never to the register's named qualities.

## Polish vs tournament (same guard, same gate)

- **Tournament = explore far** (bad→good). N bold directions + the incumbent → council →
  guard. Worth the teardown risk when headroom is large.
- **Polish = exploit near** (good→great). A ranked stack of surgical diffs off the
  incumbent, each A/B'd against it → guard per diff → guard on the stack. The right
  instrument when the incumbent is already on-register.

Both run the SAME incumbent guard and the SAME register-fit gate — register-fit is a
GATE, never averaged away, in either method. The only difference is the shape of the
candidate: a fresh direction vs an isolated diff.

## Output

- The **stacked diff set** (the surviving, ordered diffs applied together) plus a
  **per-diff guard verdict** — for each diff, whether it improved overall and whether it
  held register-fit, and whether it survived into the stack.
- If **NO diff clears the guard**, report verbatim: **"current design wins — no change
  recommended"** — same terminal verdict as the tournament's guard. The status quo is the
  winner; do not stack a least-bad diff to manufacture a change.
