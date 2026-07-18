# design-fix guards — intent protection, scope discipline, edit mechanics

Three guards that keep a fix from doing harm. Read before mutating.

Contents:
- [Guard 1 — "What is NOT slop"](#guard-1--what-is-not-slop)
- [Guard 2 — surgical vs structural (rebuild from the decision)](#guard-2--surgical-vs-structural-rebuild-from-the-decision)
- [Guard 3 — exact-string-replacement edit discipline](#guard-3--exact-string-replacement-edit-discipline)

---

## Guard 1 — "What is NOT slop"

Source: `Dammyjay93 design-deslop.md` L44-54 ("the filter is half the skill").

The point is to remove the *generic*, not to flatten every choice into a default.
**A cleanup that strips intent is worse than the slop.** Generated UI looks
generated because it *defaulted*; it does not become good by defaulting harder.

Do NOT touch these — and **if unsure whether something is a tell or a decision,
treat it as a decision and leave it:**

- **A bold/unusual choice that's clearly motivated** — a saturated palette, a
  dramatic type scale, an asymmetric layout. Distinctive is the *goal*. Only flag
  it if it's incoherent with the stated intent, not merely uncommon.
- **An intentional deviation with a reason** — a one-off radius, a deliberately
  heavier border on a focal card, asymmetric padding where content demands it.
- **Anything ratified by the project's `system.md` / DESIGN.md / brief.** If the
  design system already decided it, it is a decision, not a defect.
- **Anything outside the finding's scope** — pre-existing patterns on lines the
  finding didn't name. Stay in the lines the finding points at.
- **Anything a linter/formatter owns** — quote style, import order, trailing
  commas. Not a design fix.
- **Anything inside `allowRawColorIn`** — the token source + the generated token
  block legitimately carry hex.

When the guard catches a "finding", close it as a **non-finding** with the reason
("motivated bold choice, coherent with the serious-trust register — kept"). That
is a successful outcome, not a skipped fix.

## Guard 2 — surgical vs structural (rebuild from the decision)

Source: `Dammyjay93 interface-design/design-review.md` L130-132.

design-fix mutates only what a **value/name/missing-piece** edit can clear. When
the finding is that a *decision was never made* — no focal point, flat hierarchy,
monotone layout, an absent empty/loading/error state, a hand-rolled inaccessible
control — the correct fix is to **rebuild from the decision, not patch over the
defaults**: re-derive the focal point, the type hierarchy, the surface system.

That re-derivation is NOT design-fix's job. design-fix would only be able to nudge
values, which defaults harder (FAIL F3). **Escalate** instead:

- Name the finding and the **decision that needs making** ("focal point was never
  chosen — which metric is the hero?").
- Route it to design-generate (rebuild from the chosen thesis) or a gated
  redesign.
- Leave it as a clearly-named follow-up. Do NOT half-do a structural rebuild with
  value tweaks.

The boundary test: *Can one exact-string replacement, scoped to the finding's
location, clear it without re-deriving a design decision?* Yes → surgical, fix
here. No → structural, escalate.

## Guard 3 — exact-string-replacement edit discipline

Source: `abi__screenshot-to-code` `edit_file` (old_text/new_text/count) + Lovable
search-replace-over-write.

Every mutation is an **exact string replacement**, never a regeneration:

- Use the **Edit tool**: a unique `old_string` → `new_string`, scoped to the
  finding's `location`. The `old_string` must match the file exactly and uniquely.
- **Do NOT regenerate the entire file**, the whole component, or any untouched
  lines. "Do not regenerate the entire file" is the literal contract of the
  source `edit_file` tool.
- **One finding = one tight diff.** No batching, no "while I'm here", no
  opportunistic refactor (that is FAIL F2, scope creep).
- Match the surrounding code's conventions (Tailwind vs CSS-var, naming) — fix
  *toward* the local style, since slop is partly inconsistency with what's already
  there.
- If the edit cannot be expressed as a tight, unique replacement, the fix is
  structural — go back to Guard 2 and escalate. Do not reach for a rewrite.

After the edit: re-render + re-evaluate (`seams.md`). An unverified replacement is
not a fix.
