# The craft numeric rubric — proportion graded against a SYSTEM, not vibes

Proportion/spacing/alignment/icon craft ships broken SILENTLY: a brand council and an
AA/honesty QA can both pass a design that is still proportionally broken, because none of
those lenses grade px rhythm (KB **L-014**, proven on a real portal: ~2/3 of spacing off-grid,
six card radii, ten icon sizes — invisible to every taste lens, instantly visible to the
owner). The Craft seat grades against THIS numeric contract; `design-fix` snaps values to it
as the minimal edit.

## The contract

1. **4px spacing grid, exactly FOUR spacing roles** — one card-gap, one shared card inset,
   one section step, one element/icon gap. Every gap on the surface is one of the four (or a
   documented multiple). Off-grid one-off constants are the defect.
2. **Radius ladder `{2, 6, 8}`, one value per nesting depth** — badges/chips 2, slabs/buttons
   6, cards 8. Retire 5/7/9/10/11/13/14/18 and the consumer-soft 14/16/18 cluster — unless the
   register MOTIVATES exactly one soft value, in which case it replaces a rung, never joins it.
3. **Locked type scale** — hero > title > body strictly ordered; nothing functional below
   12px; no off-scale strays (15/17/19/27/33). The scale itself is `design-typography`'s
   contract; this rubric only checks adherence.
4. **Icons: 3–4 sizes at ONE stroke weight, baseline-aligned to their text.** Ten icon sizes
   and four strokes is the classic tell.
5. **Key:value rails aligned** — labels and values each on one vertical rail per column.

**The loudest broken-proportion tell:** a confetti of corner radii plus off-grid gaps down a
single column. Snapping radii + grid FIRST makes the whole spine read as one family — do those
two before arguing about anything subtler.

## How the seats use it

- **Craft lens (council + evaluate Layer-2):** grade each candidate against the five items
  above by measurement words ("radius 14 on a nested chip — off-ladder"), not adjectives.
  When the ground context's `referenceSources` include the fluid type/space DERIVATION
  method (Utopia-class), the seat may cite that method to ground a type/space-scale
  judgment ("the space palette has no derivation step between 8 and 24") — a citation
  grounds the finding, it never raises its rank (the lenses.md citation clause).
- **design-fix:** an off-ladder/off-grid finding's minimal fix is a SNAP to the nearest
  contract value — never a redesign.
- **Register subordination (L-012):** the rubric constrains EXECUTION, not personality. A warm
  register keeps its warmth at radius 8; discipline is the constraint, never the register.

## Machine arm — honest status

The greppable subset (off-ladder radius literals, off-grid px constants in the styled source)
is a static-gates CANDIDATE, **not yet wired** — today this rubric is judgment applied by the
Craft seat. When it matters for a verdict and wasn't machine-checked, say so.
