# The taste-engine roster — design-generate's run-time tournament

Contents: [The principle](#the-principle) · [The falsifiable bar](#the-falsifiable-bar)
· [Per-arm divergence axes](#per-arm-divergence-axes-the-anti-homogenization-assignment)
· [E1 Intentional/Restraint](#e1--intentional--restraint) · [E2 Registry-grounded](#e2--registry-grounded--production)
· [E3 North-star match](#e3--north-star-match) · [E4 Justified risk](#e4--justified-risk-optional-4th)
· [How the council judges](#how-the-council-judges) · [Choosing how many engines](#choosing-how-many-engines)

## The principle

Run-time generation is a **tournament of 3-4 distinct taste engines**. Each gets
the SAME brief + the SAME DESIGN-SYSTEM (token) block, but a DIFFERENT
system-prompt persona. Each produces ONE direction; `design-render` renders all;
`design-council` judges; the winner advances to the self-correct loop.

This beats single-pass generation (every competitor's default — v0/Lovable/Bolt
fight *ugly*; make-real fights *not-impressive*; none fights *generic*) because no
single prompt produces 3-4 genuinely different intentional directions, and it
makes "distinctive" MEASURABLE via the swap/squint/signature/token gate rather
than an adjective. Distinctiveness comes from *competing intentional directions*,
not one prompt told to "be beautiful".

## The falsifiable bar

Every engine must clear this, or it has failed:

> **"If another AI, given a similar prompt, would produce substantially the same
> output, you have failed."**

Distinctiveness is derived from the SUBJECT'S OWN WORLD — its materials,
instruments, artifacts, vocabulary — never from a preset theme menu. (Shipping a
catalogue of named looks like "neo-brutalism / modern-dark" manufactures the
homogeneity this whole skill fights — ruling C9. Reject it.)

## Per-arm divergence axes (the anti-homogenization assignment)

A shared brief + shared token block + persona-only variation is a HOMOGENIZATION
ATTRACTOR (KB L-040: an entire round-1 field converged and the owner rejected the
lot). Personas alone do not buy divergence — the INPUTS must diverge. When the
ground context carries `referenceSources` (design-ground's fetch ritual), give each
arm a DIFFERENT registry subset as its divergence axis, appended to its persona
block — the axis grounds the arm's system-shape choices; the register still wins
every conflict, and NOTHING here overrides the token contract:

| Arm | Divergence axis (registry subset) |
|---|---|
| **E1 — Restraint** | GOV.UK-class content-first canon (evidence-based "when NOT to use") + M3-class color-ROLE architecture |
| **E2 — Registry-grounded** | shadcn-class component anatomy + 21st.dev-class variant space (use per-component registry-JSON artifacts; check the per-component license at take-time) |
| **E3 — North-star** | the owner's north stars (via `design-reference`) + getdesign.md-class register exemplars — FORMAT + reasoning only, NEVER a brand payload |
| **E4 — Justified risk** | Dribbble/CodePen-class trend VOCABULARY (words, never shots) + motion-canon timing (one signature moment) |

**The a11y canon (W3C ARIA APG keyboard/role/focus contracts) is the FLOOR for
EVERY arm — never a divergence axis.** An arm cannot be "the accessible one";
they all are. Every take respects its registry entry's licensing tier and
WHAT-NEVER-TO-TAKE line (the registry law).

L-040 countermeasures alongside the axes:

- **Per-arm register-adjective emphasis**: give each arm a different SUBSET of the
  register's named qualities to lead with (all arms still honor the whole register —
  emphasis diverges, compliance doesn't).
- **Optional serialized motif-ban chain**: on a re-run after a converged field,
  generate arms in sequence and hand each the previous arms' signature motifs as
  BANNED (spends parallelism to buy divergence — use when convergence already bit).
- **The chair checks convergence PRE-render**: if two arms' plans read as the same
  design, cheaply re-roll ONE of them with an explicit divergence mandate BEFORE
  paying for renders and a council.

---

## E1 — Intentional / Restraint

**Source channeled:** Anthropic `frontend-design/SKILL.md`.
**Optimizes for:** one signature concept; restraint; the look that could not be
mistaken for anyone else's.

**Distinct levers:**
- *Spend your boldness in ONE place.* Let the signature element be the one
  memorable thing; keep everything around it quiet and disciplined; cut decoration
  that doesn't serve the brief. Chanel's mirror: remove one accessory.
- *The hero is a thesis* (for marketing/landing surfaces — NOT dense product UI):
  open with the most characteristic thing in the subject's world. A big number +
  small label + gradient accent is the TEMPLATE answer — use only if truly best.
- *Structure is information.* Numbering (01/02/03), eyebrows, dividers encode
  something TRUE about the content, never decorate. Question numbered markers
  before using them — only if the content is actually a sequence.
- *Type carries the personality.* Pair display + body deliberately, not the
  families reached for on every project; make the type treatment itself memorable.

**Mandatory:** E1 runs the **two-pass plan → critique-vs-generic** inside itself
before emitting any code (see SKILL.md Step 2). "Work through a similar prompt to
see if you arrive somewhere similar; revise anything generic and say what changed."

---

## E2 — Registry-grounded / Production

**Source channeled:** v0 system prompt + Lovable.
**Optimizes for:** token-law correctness; ships-clean; the "safe but correct"
baseline that always passes the floor.

**Distinct levers:**
- ≤5 colors, ≤2 fonts (+mono), strict semantic tokens, an 8pt grid, atomic
  components.
- Reuse existing `components/ui/*` rather than reinventing primitives.
- No raw `text-white`/`bg-white`/`bg-black`/hex — everything themed via tokens.
  Tailwind: `p-4` not `p-[16px]`; `gap-*` not `space-*`; never mix padding/margin
  with gap. (Full law: `token-law.md`.)
- Edit discipline first-class: surgical search-replace over rewrites.

E2 is the contender that almost always clears Layer-1 cleanly. Its risk is being
*generic* — the council's swap test is what keeps it honest.

---

## E3 — North-star match

**Source channeled:** `design-reference` north-star corpus (the VoltAgent
token-resolved DESIGN.md set — Linear/Stripe/Vercel-shaped real systems).
**Optimizes for:** brand-grounded distinctiveness — a real exemplar's *discipline*,
not a generic palette.

**Distinct levers:**
- Call `design-reference` to pull the 1-2 closest real exemplars by the surface's
  vertical + style tags.
- Imitate the exemplar's TOKEN SYSTEM — its canvas/surface lightness ladder, its
  letter-tracking scale, its elevation strategy, its radius rhythm — **never its
  hex.** The hex stays the project's own (from `design-tokens`).
- This is how to be distinctive WITHOUT inventing taste from nothing: borrow a
  proven *system shape*, dress it in the project's real palette.
- **When the ground context carries an `extractionBrief`** (design-ground's
  design-extraction method — the owner named an absolute bar or pointed at a
  specific reference site), THAT is E3's system-shape source, at higher fidelity
  than the corpus: the extracted DNA (ramp shape / scale ratio / space rhythm /
  composition / motion / a11y — read off a render, never lifted as values) IS the
  altitude this arm must match and then BEAT. It grounds E3 ONLY — never every arm
  (that is the L-040 homogenization failure) — and the hex/values still come from
  `design-tokens`. See `design-ground/references/design-extraction.md`.

Pairing a generic-per-vertical palette as brand truth is an anti-pattern (C3) —
E3 always pairs with a real north-star, never a vertical stereotype.

---

## E4 — Justified risk (optional 4th)

**Source channeled:** superdesign anti-default moves, inverted toward boldness.
**Optimizes for:** the boldness CEILING — finding the high-variance direction the
safe engines won't reach.

**Distinct levers:**
- A saturated, *motivated* palette (motivated by the subject, not loud for its own
  sake), a dramatic type scale, ONE signature motion moment.
- Explicitly ALLOWED to be loud. The council's "what is NOT slop" / false-positive
  filter protects a motivated bold choice from being flattened by the deslop pass.

E4 still respects the token contract and the quality floor — risk lives in the
aesthetic, never in broken contrast or fabricated data. Ship E4 when the register
permits boldness (a warm consumer register) and skip it when it doesn't (a serious-trust register) —
that is an owner/register call, not a default-on.

---

## How the council judges (the seam — do not re-implement here)

1. Every direction is rendered desktop+mobile, light/dark (+ reduced-motion) via
   `design-render`.
2. **Layer-1 machine gates run on every candidate FIRST** (`design-evaluate`'s
   `static-gates.mjs`) — any candidate failing contrast / token-drift / a11y is
   eliminated before taste judgment. A model can't argue past a measured failure.
3. Each candidate runs the **four exit tests** (Swap / Squint / Signature / Token —
   defined authoritatively in `design-council`'s `references/four-exit-tests.md`).
4. The named lenses score each survivor; findings are consolidated → grouped by
   severity → deduped across lenses → run through the false-positive filter (a
   motivated bold choice is a SUCCESS, never auto-flagged).
<!-- FULL-ONLY-START -->
   On a deep pass any
   surface-triggered composites join as CONSTRAINTS — never ranking inputs
   (the aggregation contract).
<!-- FULL-ONLY-END -->
5. **Winner = the direction the panel favors among Layer-1-passing candidates,
   under the incumbent guard**: on a REDESIGN the incumbent competes on the same
   scale, and a challenger is crowned ONLY if it beats the incumbent overall AND
   holds register-fit ≥ the incumbent — "current design wins — no change
   recommended" is a legal outcome. The losing directions' best ideas are named
   as grafts for the audit trail.

`design-generate` does NOT declare the winner itself — it hands the renders to
`design-council`. This skill's job ends when it has produced N gate-passing,
self-checked, rendered candidates.

## Choosing how many engines

- **Default = 3** (E1, E2, E3). Always at least 3 — fewer is not a tournament.
- **Add E4** when the register permits boldness and the owner wants the ceiling
  explored.
- For a tiny update (one component, history present), a 2-engine run (E1 + E2) is
  acceptable — but state that the tournament was reduced and why in the audit trail.
