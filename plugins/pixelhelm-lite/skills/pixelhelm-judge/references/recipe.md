# The full council recipe

The thin-orchestrator run: Council → Synthesize → Build → Verify. The council reads
lens definitions and runs them at full depth; it does not inline-duplicate them and
does not own rendering, generation, or the machine gates (those are sibling skills).

Pattern source: gstack `autoplan` (read named sub-skills from disk, run at full
depth, auto-decide intermediate choices with explicit principles, log a Decision
Audit Trail, stop at one approval gate). Consolidation source: gnurio
`meta-refactor-ui` (collect → group by severity → dedupe → prioritize → report).

## Table of contents
- [Variant A — tournament judge (default)](#variant-a--tournament-judge-default)
- [Variant B — multi-lens review](#variant-b--multi-lens-review)
- [The consolidation algorithm](#the-consolidation-algorithm)
- [Auto-decision principles (the chair)](#auto-decision-principles-the-chair)
- [Rendering & gates — do not reimplement](#rendering--gates--do-not-reimplement)
- [Worked output skeleton](#worked-output-skeleton)

---

## Variant A — tournament judge (default)

`pixelhelm-generate` produced N directions from different taste engines. The council
picks the winner and the grafts.

0. **Read the ledger first.** `<project>/.pixelhelm/council/ledger.md` + the latest
   verdict for this surface: never re-propose an owner-rejected direction; surface
   open grafts; the recorded winner is the incumbent source (Phase 0 rule 0 in
   SKILL.md).
1. **Eliminate floor failures first.** For each candidate, confirm `pixelhelm-evaluate`
   Layer-1 passed (contrast / token-drift / a11y / states). Any candidate that fails
   the machine floor is OUT before taste judgment — a model cannot argue past a
   measured failure. (See the gates path below; do not relitigate a Layer-1 pass.)
2. **Confirm renders exist** for every surviving candidate at every viewport+mode. If
   missing → route to `pixelhelm-render`, then resume.
3. **Run Phase 1 (Council)** — the **six discipline lenses + the Register-fit gate seat = 7
   seats**, in parallel, each reads all PNGs (on a REDESIGN the set INCLUDES the incumbent
   render), runs the four exit tests, scores every candidate including the incumbent, picks a
   winner, lists keeps + cuts, applies the false-positive filter. **The Register-fit gate (7th
   seat) is run as a MULTI-JUROR MEDIAN panel** — an odd N=5 (min 3) independent jurors on
   mode-fair renders → the median per candidate (H1; `references/lenses.md` §7). The other six
   lenses stay single-juror. The incumbent is scored honestly on the same scale — it is the bar
   the new directions must clear, not a courtesy entry.
4. **Run Phase 2 (Synthesize) + apply the incumbent guard** — the chair tallies with
   Register-fit weighted as the gate seat, applies the incumbent guard on a redesign
   (a new direction wins only if it beats the incumbent overall AND scores at least
   the incumbent on register-fit; otherwise "current design wins — no change
   recommended"), names the winning frame + grafts, resolves conflicts
   register-fit-first, writes the unified brief + audit trail.
5. **Write the per-juror records, then the verdict record** (Phase 2.5, always).
   First, ONE `pixelhelm/juror-record@1` per juror per candidate (juror id, blind
   label, per-criterion integer scores keyed to the rubric sheet's numbers, max-2-
   sentence rationales, the sha256 of that juror's verbatim input transcript, and
   the shuffle seed) via `records.mjs write juror-record` — the aggregate is only
   as trustworthy as the per-juror evidence under it. Then the `pixelhelm/judge-verdict@1`
   JSON + a ledger line — shapes in the `pixelhelm` skill's `references/close-the-loop.md`,
   written THROUGH the loop skill's writer/validator (validate-then-write, append-only):
   `node "${CLAUDE_PLUGIN_ROOT}/skills/pixelhelm-loop/scripts/records.mjs" write judge-verdict --project <dir>`
   with the record on stdin. The verdict writer WARNS when no matching juror
   records exist (soft — archives predating the juror-record schema stay valid,
   but a new panel without them is a defective panel, per the sealed E4 sheet).
   **A panel whose record does not validate did not happen** — report the
   refusal, never report the panel result.
6. **Stop at the verdict** unless the user asked to build (then Phase 3 → 4).

The distinctiveness defense lives in generate (competing intentional directions);
the council's job is to pick the most intentional, not to make them safer.

## Variant B — multi-lens review

A single built or mocked UI (no tournament). Same phases, with N=1:
- Each lens critiques the one design and names its strengths + its defects from that
  seat.
- The chair consolidates into a prioritized critique (not a winner): keeps, cuts, and
  the one or two changes that would most raise the design — described as impact
  ("the primary action is hard to find"), never as prescriptions ("make it blue").
- This is the Layer-2 advisory pass that `pixelhelm-evaluate` defers to. It never
  blocks — Layer-1 blocks; the council advises.


## The consolidation algorithm

The chair runs this over the **seated** lenses' raw findings (the 7 seats):

1. **Collect** every finding from every lens (keep its source lens).
2. **Group by theme** (hierarchy, color, copy, states, honesty, motion, …), not by
   lens — the same defect seen by three lenses is ONE finding.
3. **Dedupe across lenses.** Merge restatements; a finding raised by multiple lenses
   is stronger (note the count), not three separate items.
4. **Apply the false-positive filter** to the merged set — drop anything that is a
   motivated decision rather than a defect.
5. **Prioritize** by impact on the page's single job, then resolve any lens conflicts
   toward the register (cite it).
6. **Emit** the consolidated verdict — one ranked list, deduped, register-aware.


## Auto-decision principles (the chair)

The chair will face intermediate choices (which graft, how to weight a tie). Decide
with these, classify each as Mechanical vs Taste, and log the call:

- **Subject first** — the choice that best serves the page's actual job and the
  subject's world wins.
- **Register over global ideal** — resolve toward the active profile's feeling.
- **Discipline is a constraint; register is a gate** (never trade one for the other).
  Declutter/restraint/recede-chrome (the diagnosis) are levers every candidate must
  PASS, not levers that earn extra score. Register-fit (warmth/play/color/voice for
  the profile) is a GATE the winner must hold at least the incumbent. Never let a
  discipline win (cleaner, calmer, fewer elements) compensate for a register loss
  (colder, greyer, less characterful) — different axes, and the register axis is
  decisive on a redesign.
- **Boldness in one place, but never quiet the register away** — keep one signature;
  quiet the rest; reject grafts that add a second competing focal point. "Quiet"
  applies to competing focal points, NOT to the register's named warmth/color/
  character — quieting those is a register-fit loss, not restraint.
- **Distinctive ≠ defect** — never resolve a conflict by defaulting harder.
- **Honesty is non-negotiable** — a Compliance-honesty defect outranks an aesthetic
  win every time.
- **Mechanical vs Taste** — Mechanical calls (which candidate passed Layer-1) are
  settled by evidence; Taste calls are settled by the lenses + register and LOGGED
  with their reason in the audit trail.

## Rendering & gates — do not reimplement

The council orchestrates; it never owns these scripts. Call the siblings' relocated
scripts:
- Render PNGs: `${CLAUDE_PLUGIN_ROOT}/skills/pixelhelm-render/scripts/render.mjs`
  (Edge/Chrome headless; the owner cannot read HTML or open `file://` links from
  chat — renders MUST be PNGs, and launched on screen when showing the owner).
- Machine floor: `${CLAUDE_PLUGIN_ROOT}/skills/pixelhelm-evaluate/scripts/static-gates.mjs`
  (contrast / token-drift / a11y; PASS/FAIL with no model in the loop).

These scripts live in their OWNING sibling skill's `scripts/`; reference them by
cross-skill `${CLAUDE_PLUGIN_ROOT}` path, never copy their logic here.

## Worked output skeleton

```
WINNER: Direction B — strongest single thesis (Jobs) that still reads calm (Norman);
        survives Squint and Signature where A goes flat.

PER-LENS:
  Jobs            → B  (one conviction, said loudly; A hedges with 3 equal CTAs)
  Norman          → B  (next action pre-attentive; C hides the primary action)
  Hall            → B  (AA designed-in, on-brand teal; C uses a banned AI-cyan)
  Spool           → A  (most scannable header, but loses overall on task routing)
  Compliance-hon. → B  (honest empty state; A's sample data isn't labeled — defect)
  Craft           → B  (tightest spacing rhythm; C has a monotone card grid)

GRAFTS (best-of-each to merge into B):
  - A's two-second-scannable section header
  - C's empty-state illustration (re-colored to the brand token)

CUTS (all directions):
  - drop the gradient accent (Signature-test fail; reads generic)

CONFLICTS RESOLVED:
  - Jobs(louder hero) vs Norman(calmer) → register=serious-trust favors Norman;
    keep B's frame, graft A's headline at reduced scale.

DECISION AUDIT TRAIL:
  - chosen B frame  — most-favored + best exit-test survival (Taste)
  - rejected C      — banned AI-cyan, Layer-1-adjacent brand defect (Mechanical)
  - grafted A header — scannability win with no cost to B's thesis (Taste)
```
