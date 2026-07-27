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
- [Rubric authoring — the in-use usability criterion](#rubric-authoring--the-in-use-usability-criterion-new-sheets-only)
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
1. **Floor-clean is a HARD PRECONDITION for esteem scoring (R1).** For each candidate,
   read its `pixelhelm-evaluate` Layer-1 artifacts. A candidate may be scored ONLY if
   (a) every SHIPPED HARD Layer-1 gate for its surface exited 0 and (b) those gate
   outputs exist as artifacts the panel can point at. A candidate that fails a hard
   gate, or whose gate outputs do not exist, is **UNSCORED** — recorded by that word,
   excluded from every ranking and from the winner tally, and **never "scored low"**.
   The seat has no standing to express an opinion about something the floor already
   ruled on or never measured. UNSCORED is not a taste verdict and carries no grafts.
   (See the gates path below; do not relitigate a Layer-1 pass.) *(Why: E4 falsified
   the render-only panel — a candidate carrying a real 3.12:1 AA contrast failure won
   its external set and no juror surfaced it; `evals/validation/e4-run-2026-07-26/REPORT.md`,
   repair `evals/validation/E4-JUDGING-SEAT-REPAIR-DECISION.md` R1.)*
2. **Confirm renders exist** for every surviving candidate at every viewport+mode. If
   missing → route to `pixelhelm-render`, then resume.
3. **Assemble each juror's input set: renders AND that candidate's gate outputs (R2).**
   Every juror input set carries, per candidate, the rendered PNGs *and* the Layer-1
   gate output artifacts that cleared it (`static-gates.json`, the token-contract
   recompute, the two honesty gates, the output floor, and every browser-dependent
   verifier that ran — plus, explicitly, the name of any gate that did NOT run). The
   juror record's `inputTranscriptSha256` covers the gate outputs, not just the
   renders. Rationale: R1 removes defective candidates; R2 removes the seat's
   ignorance of what was already measured, so praise cannot be spent on properties
   the machine has ruled on. A panel given renders alone is the E4 failure mode.
4. **Run Phase 1 (Council)** — the **six discipline lenses + the Register-fit gate seat = 7
   seats**, in parallel, each reads all PNGs (on a REDESIGN the set INCLUDES the incumbent
   render), runs the four exit tests, scores every candidate including the incumbent, picks a
   winner, lists keeps + cuts, applies the false-positive filter. **The Register-fit gate (7th
   seat) is run as a MULTI-JUROR MEDIAN panel** — an odd N=5 (min 3) independent jurors on
   mode-fair renders → the median per candidate (H1; `references/lenses.md` §7). The other six
   lenses stay single-juror. The incumbent is scored honestly on the same scale — it is the bar
   the new directions must clear, not a courtesy entry.
5. **Run the cross-run felt-variety check (ADVISORY)** — before synthesizing, compare
   this field against PRIOR runs' COMMITTED WINNERS for this project: the ledger
   lines, the archived verdict records, the baseline renders. Named artifacts, never a
   remembered impression. Look for recurring STRUCTURAL signatures (same spine, same
   hierarchy metaphor renamed, same signature element re-skinned, same section rhythm,
   same one-accent-on-neutral answer to every register), and cite evidence across at
   least two runs — the fingerprint registry's ADD/PROMOTE evidence gate applies
   verbatim, so an uncited tell is not a finding. Record the outcome in the verdict's
   `houseStyleCheck`; `not-run` is legitimate on a first run for a surface but must say
   why. **This never touches the winner** — a house-style tell is surfaced with its
   evidence and archived, it is not a veto, not a score, not an iteration. *(Why: E3
   2026-07-26 — dE00, layout class, motif Jaccard and blind-intent recovery ALL passed
   while the owner's verdict was "I see a theme - all of them are similar to each other
   and to the set-1 style". In-run metrics measure difference, not felt variety.)*
6. **Run Phase 2 (Synthesize) + apply the incumbent guard** — the chair tallies with
   Register-fit weighted as the gate seat, applies the incumbent guard on a redesign
   (a new direction wins only if it beats the incumbent overall AND scores at least
   the incumbent on register-fit; otherwise "current design wins — no change
   recommended"), names the winning frame + grafts, resolves conflicts
   register-fit-first, writes the unified brief + audit trail.
7. **Write the per-juror records, then the verdict record** (Phase 2.5, always).
   First, ONE `pixelhelm/juror-record@1` per juror per SCORED candidate (juror id,
   blind label, per-criterion integer scores keyed to the rubric sheet's numbers,
   max-2-sentence rationales, the sha256 of that juror's verbatim input transcript
   — which covers the gate outputs, R2 — and the shuffle seed) via
   `records.mjs write juror-record` — the aggregate is only as trustworthy as the
   per-juror evidence under it. UNSCORED candidates get no juror record; they are
   named in the verdict's `constraints` with the failing gate. Then the
   `pixelhelm/judge-verdict@1` JSON + a ledger line — shapes in the `pixelhelm` skill's
   `references/close-the-loop.md`, written THROUGH the loop skill's writer/validator
   (validate-then-write, append-only):
   `node "${CLAUDE_PLUGIN_ROOT}/skills/pixelhelm-loop/scripts/records.mjs" write judge-verdict --project <dir>`
   with the record on stdin. The verdict writer WARNS when no matching juror
   records exist (soft — archives predating the juror-record schema stay valid,
   but a new panel without them is a defective panel, per the sealed E4 sheet)
   and WARNS when a scored candidate references no floor evidence (soft, same
   reason — but a scored candidate with no floor evidence is an R1 violation),
   and WARNS when a multi-candidate verdict carries no `houseStyleCheck` (soft —
   the felt-variety check is advisory, but its absence is not silence).
   **A panel whose record does not validate did not happen** — report the
   refusal, never report the panel result.
8. **Stop at the verdict** unless the user asked to build (then Phase 3 → 4).

The distinctiveness defense lives in generate (competing intentional directions);
the council's job is to pick the most intentional, not to make them safer.

## Variant B — multi-lens review

A single built or mocked UI (no tournament). Same phases, with N=1:
- The R1 precondition still binds: a surface whose shipped HARD Layer-1 gates did not
  all exit 0, or whose gate outputs do not exist, is **UNSCORED** — report the floor
  failure and route to `pixelhelm-repair`; do not issue a taste critique of a broken surface.
  The R2 input set still applies: the lens reads the gate outputs with the renders.
- Each lens critiques the one design and names its strengths + its defects from that
  seat.
- The chair consolidates into a prioritized critique (not a winner): keeps, cuts, and
  the one or two changes that would most raise the design — described as impact
  ("the primary action is hard to find"), never as prescriptions ("make it blue").
- This is the Layer-2 advisory pass that `pixelhelm-evaluate` defers to. It never
  blocks — Layer-1 blocks; the council advises.


## Rubric authoring — the in-use usability criterion (NEW sheets only)

When a run seals a rubric sheet for its jurors, the sheet must carry an explicit
**in-use usability** criterion, worded to be judged on the RENDERED artifact rather
than on a description of it:

> *Does this surface give the visitor the affordances their actual task needs — the
> controls, states, entry points and next steps that task requires — present and
> reachable in the render? Name any affordance the task needs and the render does not
> provide.*

Score it on what the render shows. Copy that describes a capability is not the
capability, and "the page explains what you could do" is not the page letting you do
it. The judging-seat counterpart is the Spool lens's in-use clause
(`references/lenses.md` §4); the two must stay worded the same way.

**Scope: future sheets only.** No sealed rubric from a past experiment is edited,
re-scored, or reinterpreted against a criterion it never carried — those sheets are
the evidence of what was actually asked, and rewriting them would destroy the thing
they exist to prove.

*Source: the owner named in-use ease as the standing weak spot on two separate
surfaces — "there is still a lot of improvement with how easy it is for the user to
use" and "there is a lot of missing UI. Like, how is it easy for the user?" Both
verdicts landed on fields that had already passed their panels.*

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
  with their reason in the audit trail. A Mechanical call is never re-opened by a
  Taste argument: the chair may not restore an UNSCORED candidate because the lenses
  liked it, and may not lower a scored candidate for a defect the floor already
  measured and passed.

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

**The floor-evidence bundle (what R1 reads and R2 ships).** Per candidate, the
gate outputs the council consumes are the artifacts those scripts wrote — one
directory per candidate, committed with the run. The council does not re-derive
them and does not accept a prose summary of them: an assertion that "Layer-1
passed" with no artifact to point at is a MISSING floor bundle, which is
UNSCORED, not a pass. A gate that did not run is named as not-run; silence is
never read as a pass (`design/references/gates-and-loop.md` §2).

## Worked output skeleton

```
UNSCORED (floor precondition, R1 — not ranked, not "scored low"):
  Direction D  — verify_targetsize FAIL (7 controls < 24px), gates/d/verify_targetsize.json
  Direction E  — no floor bundle committed; nothing to point at

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
