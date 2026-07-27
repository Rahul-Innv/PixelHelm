# The council's seats — six lenses + the Register-fit gate

Each lens is a juror with ONE strong point of view. A juror does not try to be
balanced — it judges hard from its seat and trusts the chair to synthesize. Apply
each at FULL depth: read the render, run the four exit tests, pick a winner, name
keeps and cuts. Five lenses are stable; lens 5 (Compliance-honesty) is the one
product-specific seat — swap it per profile but always keep an honesty lens. A
seventh, chair-weighted GATE lens — Register-fit — is always present and scored
strictly against the active profile `_register` (see lens 7 below); it is NOT
averaged equally, it can veto a winner that drifts off-register.

Provenance: lenses 1–4 are the named authors of the design principles in real
project DESIGN docs; lens 5 is product-specific (legal-trust shaped here); lens 6
is the micro-craft floor synthesized from the anti-slop roster (Dammyjay93
interface-design + rauno + Anthropic frontend-design).
A STORM perspective-discovery
pass (archived under `perspective-discovery/`) independently **rediscovered all seven**
lenses from real canon and validated the aggregation below; it also derived a
**DEEP-pass bench** of surface-triggered composite lenses (data-viz honesty, dense-table
operability, trust/auth, semantic-honesty copy, content-robustness) that EXTEND these
seven without displacing them — see `references/deep-pass-composites.md`. Those composites
are register-subordinate; lens 7 stays the gate.

## Table of contents
- [1. Jobs — conviction](#1-jobs--conviction)
- [2. Norman — calm & affordance](#2-norman--calm--affordance)
- [3. Hall — brand honesty & AA-as-brief](#3-hall--brand-honesty--aa-as-brief)
- [4. Spool — findability, task success & in-use usability](#4-spool--findability--task-success)
- [5. Compliance-honesty — anti-dark-pattern](#5-compliance-honesty--anti-dark-pattern)
- [6. Craft — the micro-craft floor](#6-craft--the-micro-craft-floor)
- [7. Register-fit — the profile `_register`, the gate seat](#7-register-fit--the-profile-_register-the-gate-seat)
- [How a lens reads a render](#how-a-lens-reads-a-render)

---

## 1. Jobs — conviction

**Judges for:** conviction over configuration. A single opinionated point of view,
held with confidence. The design should feel "a generation ahead", never toy-like,
never a settings panel of equally-weighted options.

- **Winner heuristic:** which direction has the strongest single idea, executed
  without apology? Which one would survive being shown to a skeptical room?
- **Failure tells:** everything weighted equally; a feature list dressed as a page;
  hedging (three CTAs of equal size); a look that could belong to any product in
  the category; "we support X, Y, and Z" instead of one thesis.
- **Reads the render asking:** "What is the one thing this page believes? Is it
  said loudly enough, or buried under options?"
- **The boldness rule:** spend boldness in ONE place — the signature element is the
  one memorable thing; everything around it should be quiet and disciplined. A
  design that is bold everywhere is as undifferentiated as one that is bold nowhere.

## 2. Norman — calm & affordance

**Judges for:** cognitive ease. Calm is load-bearing, not decoration. There is one
obvious next action. Signifiers match affordances (things that look clickable are;
things that are clickable look it). Modes are visible and consistent.

- **Winner heuristic:** which direction lets a first-time user know what to do
  without thinking? Where is the next step pre-attentively obvious?
- **Failure tells:** ambiguous primary action; clickable things that look inert (or
  vice-versa); hidden modes; a wait/loading/empty state that creates anxiety
  instead of calm; visual noise competing with the task.
- **Reads the render asking:** "Where does my eye go first, and is that where the
  task starts? Could I be confused about what is interactive?"
- **Note:** Norman often pulls AGAINST Jobs. That tension is healthy — surface it
  for the chair, do not pre-resolve it.

## 3. Hall — brand honesty & AA-as-brief

**Judges for:** brand honesty and accessibility treated as part of the brief, not a
retrofit. Fintech-grade rigor delivered at a welcoming threshold. Identity stays
separated (tenant/brand boundaries honored). The palette tells the truth about what
the product is — never borrowed spectacle (e.g. no soft "money-green" on something
that is not actually about money).

- **Winner heuristic:** which direction would a discerning client recognize as
  THEIRS, and which one passes AA as a designed-in property rather than a patch?
- **Failure tells:** contrast that only barely passes (or fails) and reads as
  fragile; a borrowed look that flatters the wrong category; brand elements bleeding
  across an identity boundary; "trust" signaled by cliché (badges, stock locks).
- **Reads the render asking:** "Is the AA real and intentional? Does this look like
  it was made FOR this brand, or borrowed from a template?"
- **AA is judged, not measured here:** the measured pass/fail is `pixelhelm-evaluate`
  Layer-1's; Hall judges whether AA was DESIGNED IN (comfortable, not knife-edge).

## 4. Spool — findability & task success

**Judges for:** can a real user find what they need and complete the task?
Scannability first: "what is this / what do I do" answered in a single glance.

- **Winner heuristic:** which direction is most scannable and gets the user to task
  success with the fewest dead ends? Squint and see if the structure still guides.
- **Failure tells:** wall-of-text with no scan anchors; the primary task buried;
  labels named by system internals not user goals; a layout that looks organized but
  doesn't actually route attention to the next step.
- **Reads the render asking:** "In two seconds, do I know what this is and what I'm
  meant to do? Can I find the one thing I came for?"
- **Copy is design material:** Spool weighs labels and microcopy as heavily as
  layout — a label that names the system ("webhook config") instead of the user's
  goal ("notifications") is a findability defect.
- **First-run / empty sub-states (the folded C3 check):** an empty or thin
  section must still answer "what is this / what do I do" — it carries
  forward-scent (what will appear here and how to make it appear) and a
  populate-threshold (when this section becomes useful). A blank region or a
  lorem placeholder is a findability defect. When the WHOLE surface is a
  first-run/zero-data screen, judge it as the primary task, not an edge case.
- **IN-USE USABILITY — the affordance census (load-bearing).** Findability asks
  *can I find it*; this asks *can I DO it here*. Name the visitor's actual task
  on this surface, list the affordances that task needs — the controls, inputs,
  filters, sort, comparison, state feedback, entry points, and the next step
  after the primary action — then check each one against the RENDERED ARTIFACT.
  Judge only what is present and reachable in the render. A description of a
  capability, a label implying one, or a plan to add it later is not the
  affordance; **absent UI is the finding**, and it is stated as the specific
  missing affordance and the task it blocks ("no way to compare two rows", "the
  filter has no clear-all", "no path from the alert to the thing it is about"),
  never as a general "could be easier to use".
  - **Reads the render asking:** "If I actually had to do this here, what would I
    reach for that isn't on the screen?"
  - **Failure tells:** a surface that reads well and does nothing; a primary
    action with no visible result state; a list with no way to act on an item; a
    dense table with no sort/filter the task obviously needs; a recommendation
    with no route to the thing recommended; controls implied by copy but absent
    from the render.
  - **The false-positive guard still applies both ways:** a deliberately
    read-only surface is not missing controls, and scope the census to THIS
    surface's task — a missing feature that belongs on another screen is not a
    finding here. But do not let "out of scope" absorb an affordance the stated
    task cannot complete without.
  - *Why this is its own clause: across E1 and E3 the owner named in-use ease as
    the one weakness present in every run — "there is still a lot of improvement
    with how easy it is for the user to use", and, on a panel-approved field,
    "there is a lot of missing UI. Like, how is it easy for the user?" The
    existing scannability reading passed those surfaces; nothing took a census of
    what the visitor could actually do.*

## 5. Compliance-honesty — anti-dark-pattern

**The product-specific seat.** Defined here for trust/legal/finance products. Swap
it per profile when the product is a different shape — but ALWAYS keep an honesty
lens; it is the one that protects the user from the design.

**Judges for:** the absence of dark patterns and the presence of honest states.

- Uncoerced consent: nothing pre-checked; a truly-disabled button looks disabled; no
  early-action nudge that rushes the user.
- Protective framing uses the protective color, never an alarm/urgency color (e.g. a
  cooling-off period reads cool/neutral, never amber/red urgency).
- Honest data: sample/synthetic data is LABELED as such; nothing fabricated is
  presented as real (the L-004 rule).
- Honest empty/error states: explain what happened and how to fix it; an error does
  not apologize or go vague; an empty screen is an invitation to act.
- Empty/thin states name the SPECIFIC cause (the folded C3 check): data scarcity
  vs staleness vs not-yet-run are different truths — a vague "no data" that hides
  which one is a small dishonesty; say which, and what would change it.
- Clear scope limits (e.g. "this is not legal advice" stated plainly where it
  applies); audit-grade precision in anything that will be relied upon.

- **Winner heuristic:** which direction treats the user as someone to protect, not
  to convert? Which one would survive a hostile read for dark patterns?
- **Reads the render asking:** "Is any of this nudging, rushing, or pretending?"

## 6. Craft — the micro-craft floor

**Judges for:** the micro-craft that separates premium from competent. This is the
lens that catches AI-slop at the detail level. Grade PROPORTION against the numeric
contract in `references/craft-rubric.md` (4px grid · radius ladder · type-scale
adherence · icon size-set · key:value rails) — measurement words, never adjectives;
a taste council structurally misses px rhythm without it (KB L-014).

- **Spacing & rhythm:** consistent spacing scale; whitespace doing the work that
  borders shouldn't; no padding/margin selectors cancelling each other.
- **Hierarchy:** a real type scale (steps clearly distinct); the eye is led, not
  left to wander; one focal point per view.
- **Typographic detail:** deliberate display/body pairing (not the same families
  every project reaches for); weights ≥400; weight does not change on hover (layout
  shift); tabular-nums in data tables.
- **State coverage:** default / hover / focus / active / disabled / loading all
  present and designed; empty and error states designed, not afterthoughts; visible
  keyboard focus.
- **Motion restraint:** interaction durations feel immediate (~≤200ms); no animation
  on frequent low-novelty actions; no transition on theme switch; reduced-motion is
  a cross-fade variant, not a kill. Extra animation reads as AI-generated.
- **Premium polish:** the overall finish — does it feel made, or generated?

- **Winner heuristic:** which direction has the fewest "tells" and the most evidence
  of a human-level eye for detail?
- **Failure tells (the slop cluster):** no focal point > flat hierarchy > monotone
  card grid > timid single-accent color smeared everywhere > borders doing the work
  of space > default Inter at one weight. Rank tells by "how much it gives the game
  away."

## 7. Register-fit — the profile `_register`, the gate seat

**Judges for:** fidelity to the ACTIVE profile's stated register and NOTHING else.
It reads `_register` verbatim and asks "does this candidate FEEL like the product
the profile describes?" For a warm consumer register: warm, playful, fun, colorful,
characterful — Things 3 / Gentler Streak personality executed WITH Linear-grade
DISCIPLINE, where discipline is the CONSTRAINT, never the personality. For a regulated
trust portal: serious-trust; for an analyst data product: analyst-terminal. The same
render is a win in one register and a defect in another.

- **Winner heuristic:** which candidate would the profile owner recognize as THEIRS
  on feeling alone, before any craft analysis? Which spends its character budget on
  the register's named qualities (warmth/play/color/voice for a warm consumer register), not on
  looking safe?
- **Failure tells (off-register):** the design optimizes the DIAGNOSIS (declutter,
  restraint, recede chrome) at the COST of the register's named feeling —
  cold/sterile where the register asks warm; grey/monochrome where it asks colorful;
  flattened-but-lifeless where it asks characterful. Discipline that has BECOME the
  personality instead of serving it is the cardinal failure. Discarding the warmest
  signature element (e.g. a dual-arc ring + hand-drawn sprout) for a neutral tube is
  a register-fit FAIL even if "cleaner".
- **Reads the render asking:** "Strip the craft scorecard — does this look and feel
  like the register's own words? Is the warmth/play/color present or sacrificed?"
- **The gate rule (load-bearing):** Register-fit is not one vote among equals. The
  chair treats it as a GATE: a candidate scoring BELOW the incumbent on register-fit
  may NOT be crowned, no matter how high its other lenses. Off-register-but-
  disciplined must never beat on-register-but-imperfect.
- **The gate is a MULTI-JUROR MEDIAN, not one read (load-bearing — H1).** Because the
  gate is the single most decisive seat, staff it with an ODD panel of **N independent
  jurors** (default **N=5**, minimum 3), each scoring the same renders blind against the
  literal `_register`. The gate value per candidate is the **MEDIAN** of its N scores. A
  redesign clears the gate only if (a) its median register-fit ≥ the incumbent's median
  **AND** (b) the panel is **CONFIDENT** — the candidate score distributions are
  effectively **non-overlapping** (the challenger's max ≤ the incumbent's min, i.e. a
  supermajority). If the panels **OVERLAP** (a coin-flip), the gate is not confident
  enough to unseat the incumbent → **the incumbent wins ("no confident change")**. The
  other six lenses stay single-juror — they are constraints excluded from the ranking
  mean, so their noise doesn't decide the winner; only the gate (and the conviction
  tie-breaker) earn the panel. *Why: on a blind re-run a SINGLE-juror gate flipped and
  would have crowned an owner-rejected cold variant; a 5-juror median was unanimous and
  non-overlapping. Archived proof: `perspective-discovery/TASK1-oracle-validation-findings.md`.*
- **Judge on MODE-FAIR renders (load-bearing — H2).** Score register-fit only on renders
  where every candidate — **including the incumbent** — is captured in the SAME color
  mode(s), ideally BOTH themes. NEVER score a register's mode clause (e.g. "dark-first")
  off a screenshot whose mode is a capture artifact: `render.mjs`'s light path is
  unreliable for default-dark HTML (LESSON 3.6), so a light incumbent screenshot vs dark
  challengers will make a faithful juror wrongly dock the incumbent for "light-first."
  Until the harness sets `data-theme` explicitly and asserts the rendered background,
  carry the **symmetric mode-fairness note** (a render's mode is a harness artifact, not
  a design choice — do not credit or penalize the mode clause on any candidate).
- **Binds to the literal `_register` string (load-bearing):** score against the
  profile's exact stated register words, not a paraphrase or a remembered vibe. If the
  active profile carries **no `_register` string, the gate ABSTAIN-BLOCKs** the whole
  verdict (never guess a register).
  The gate is **exempt from the evidence-provenance
  discount** (P45) — a register call is never down-weighted for being "heuristic".
  And
  the incumbent MUST be present as a labeled competitor (no incumbent → cannot detect a
  regression → STOP): register-fit is meaningless without the bar it must clear.
- **The false-positive guard cuts both ways:** do not reward a candidate for
  restraint the register did not ask for. "Calmer/cleaner" is a win only if the
  register prizes calm; for a warm-fun register, character REMOVED is character LOST.
- **Ground the critique when a `stormBrief` is present:** if the ground context carries a
  verified STORM brief, cite its SUPPORTED `visual_brand`/register findings to justify an
  off-register call ("drifts from the register per <cited principle>") instead of vibing. But
  the brief only GROUNDS the verdict — it never sets it: a STORM discipline/declutter finding
  is a constraint, never a register mandate, and `flagged`/`abstained` findings are not
  evidence. The gate stays judged against `_register` (the L-012 invariant).
- **Cite registry canon for grounded pattern claims:** when the ground context carries
  `referenceSources` (pixelhelm-ground's fetch ritual), any lens/craft seat may cite a
  CONSULTED canon source to ground a pattern claim instead of vibing — the a11y canon
  (W3C ARIA APG) for interaction/keyboard/focus contracts, a design-system canon
  (M3 / GOV.UK-class) for system-level claims, Laws of UX for behavioral principles
  (**paraphrase-only with attribution — its licence forbids verbatim reuse**). Cite only
  sources the ritual actually fetched (never from memory stamped as fetched). A citation
  GROUNDS a finding — it never raises its rank: cited or not, findings obey the same
  aggregation contract, and the register-fit gate stays judged against `_register` alone.

---

## How a lens reads a render

1. Look at the PNG before reading any code. First impression is data — capture it.
2. Run the four exit tests from this lens's angle (`four-exit-tests.md`).
3. Compare candidates side by side at the SAME viewport+mode; judge relative, not
   absolute (models rank far more reliably than they score).
4. Apply the false-positive filter (`false-positive-filter.md`) before flagging:
   a motivated bold choice is a success, not a defect.
5. Pick ONE winner from this lens and justify it in two sentences; then list the
   best-of-EACH-candidate to keep and the weaknesses to cut.
