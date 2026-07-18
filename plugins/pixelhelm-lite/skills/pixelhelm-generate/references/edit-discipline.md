# Edit discipline — surgical, edit-survivable output

Source channeled: screenshot-to-code `edit_file` (old_text/new_text/count) +
Lovable (search-replace preferred over write) + Anthropic `frontend-design` (CSS
specificity warning).

The winner is self-corrected via the council's keeps/cuts and grafts. Those edits
must be SURGICAL — the difference between a maintainable build and a fragile one.

## Exact string replacement, not regeneration

- **Do NOT regenerate the entire file** to make a change. Replace the exact
  old_text with new_text (and a count where the tool supports it).
- Prefer search-replace over a full rewrite even for multi-spot changes — it keeps
  the diff reviewable and avoids re-introducing already-fixed issues.
- On an `update_from_history` / `update_from_file_snapshot` run, the existing code
  is the source of truth (it outranks any screenshot). Preserve all working
  functionality; only modify what the change indicates; don't break existing features.

## Edit-survivable structure

Generate code so that the NEXT surgical edit is safe:
- Keep token references centralized (a value lives once, in the token module) so a
  re-theme is one edit, not a sweep.
- Give components stable, semantic class/structure so a search-replace can target
  precisely.
- Avoid duplicated style blocks that must be kept in sync by hand.

## The CSS-specificity cancellation trap

It is easy to generate CSS classes that cancel each other out — especially a
type-based selector (`.section`) and an element-/role-based selector (`.cta`)
fighting over padding/margin between sections. Symptoms: a spacing edit "does
nothing" because a more-specific rule overrides it.

Guard against it:
- Let ONE selector own the spacing on a given axis between two elements (don't set
  the gap from both `.section` and `.cta`).
- Prefer `gap` on the container over per-child margins for inter-element spacing
  (one owner, no collapse, no specificity war).
- Keep specificity flat where possible; avoid deep descendant chains that a later
  edit can't easily out-specify.

## What NOT to do

- Regenerating the whole file on every council note (re-introduces fixed bugs,
  unreviewable diff).
- Patching a symptom in a component when the fix belongs in the token module
  (the literal will drift again).
- Leaving a "metric-matched fallback" or alternate value defined but unwired
  (silently dead — the lockstep can't see it).

## Handoff to pixelhelm-repair

`pixelhelm-generate` self-corrects the WINNER against the council's verdict. If the
user then wants the broader `pixelhelm-evaluate` findings turned into mutations, hand
off to `pixelhelm-repair` — it owns the post-audit patch loop (rebuild-from-the-decision,
not a pile of patches). Generate builds and self-corrects the tournament winner;
it does not own the ongoing fix cycle.
