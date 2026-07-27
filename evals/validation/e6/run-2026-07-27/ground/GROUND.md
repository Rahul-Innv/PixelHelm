# E6-A GROUND context — Vireo Fold motion-storytelling launch page (2026-07-27)

Stage 1 of the admitted pixelhelm-lite loop (admission:
`../admission/admission.json`, sha256 `b379f85e…6376ef`). Ground resolves the
contract before any taste or code; it mints no tokens and produces no UI.

## Register (literal; the register-fit authority for this task)

From the sealed brief, verbatim: the page is a **marketing launch page** whose
**"story IS the unfold"** — the motion narrative walks the visitor through
**bag -> hull -> water in the product's own three steps, so the demonstration
is the pitch (proof-by-experience, W-02)**. Audience, verbatim from the sealed
data: **"City commuters and small-flat dwellers who assumed kayaking wasn't
for them."** This is the one archetype where cinematic motion is
genre-legitimate (RF-7); wow is therefore archetype-permitted here, but it is
permitted only where it demonstrates the product, never as decoration.

## Content authority (absolute)

`../../data/vireo-fold.json` (sealed, commit-pinned) is the ONLY content
source. No fact may appear that is not in it. Honesty traps it carries, which
the surface must render truthfully:

- `specs.setupTime` — the claim "3 min 40 s median" MUST appear with its basis
  visible: **owner-submitted timings, n=14** (`verified: false`). The number
  n=14 must be on the page, not merely implied.
- `specs.packVolumeL` — `118 L` carries `estimated: true`; must be visibly
  flagged as estimated, never printed bare.
- `specs.loadRatingKg` — `130 kg` carries `certification: "pending"`; may NOT
  be presented as certified. The pending state must be visible wherever the
  number is.
- `pricing` — EUR 1290, what it includes, and the 30-day
  water-it-and-return trial stated plainly, not buried.
- `company.name` is literally "Vireo Boats (fictional)"; the fictional marker
  is part of the sealed string and is not to be dropped.

No derived arithmetic is required by this brief, so no injector is used and no
computed constant appears on any page: every number on every arm is a literal
transcription from the sealed file. Recorded here so the absent injector is an
explicit decision rather than a skipped step.

## Token authority

New design, no incumbent, three competing palettes: token authority is
PER-ARM via the embedded `#token-contract` block each candidate carries
(new-palette tournament rule, `check-token-contracts.mjs`). The project
profile records the register and gate config; the winner's contract becomes
the project contract at promotion (a separate owner-gated leaf, not part of
E6-A).

## Machine floor (unbreakable — A1 rules of engagement)

Contrast AA per gated pairs (text 4.5 / graphic 3.0, light AND dark), honesty
gates A+B, keyboard access + visible focus, structural output floor (one
`main`, h1, no skipped heading levels, no impostor headings, meta
description), no horizontal overflow at 280/320/414, target size >= 24px
(2.5.8), state-aware contrast in default/hover/focus.

**Plus the E6-A motion floor, which is the experiment itself** (sealed brief
§"Non-negotiable motion floor" — each item is measured, never asserted):

1. Full no-motion story parity under `prefers-reduced-motion`, with JS
   disabled, and for a keyboard-only visitor — the COMPLETE story and every
   fact, parity of content, not a stub.
2. Scroll is never hijacked: native scrolling, no wheel capture, no forced
   pacing.
3. Second-visit bypass: a visible skip control; a returning visitor reaches
   facts and price without re-watching anything.
4. Pre-registered performance budgets (lab, fixed at seal):
   payload <= 1.5 MB with JS <= 300 KB gzipped; LCP <= 2.5 s and CLS <= 0.10
   on emulated mid-tier mobile; interaction-latency proxy <= 200 ms; frame
   time p95 <= 16.7 ms desktop / <= 33 ms emulated mobile during the heaviest
   sequence.

## Motion architecture required of every arm (from the shipped lessons, not invented here)

These are floor-enabling construction rules, adopted before any arm exists so
that the parity floor is *verifiable* rather than merely claimed:

- **Static-first, JS-rebuilds** (design KB L-084): the complete story ships as
  static HTML; JS *rebuilds* it into the animated form. Consequence: a
  script-disabled render is a faithful no-JS proof. `<noscript>` fallbacks are
  forbidden in this run — L-084 records that a script-stripped copy cannot
  verify them, so they would be unverifiable by construction.
- **Every hidden-until-animated state gated on BOTH** a root `.js` class AND
  `prefers-reduced-motion` (L-084), so no fact is ever invisible to a
  reduced-motion or no-JS visitor.
- **A `?still` URL parameter** that forces the static form. Per L-084 this is
  simultaneously the user-facing skip control and the deterministic screenshot
  mode. It is a URL the visitor can reach, so the skip control is a real
  control and not a test hook.
- **Entrance motion driven by rAF, never `setTimeout`** (L-084): timer-gated
  content screenshots blank, and above-the-fold content must be
  visible-by-default regardless.
- **Assert page identity before any DOM measurement** (L-081): every
  measurement pass in this run asserts `document.title` or a unique marker
  first; a measurement taken without that assertion does not count.

## Known judging limitation, recorded BEFORE the panel runs (L-085)

A static-capture blind panel **cannot see motion**. L-085 records this
directly: a static capture of a correctly-animated page is indistinguishable
from a static page, and in the source tournament the viewport-sequenced arm
scored lowest-but-one partly from frozen-frame dead space. Two consequences
adopted here in advance:

- Motion is verified **at runtime by machine** (frame-time capture over a
  scripted scroll pass, plus a scroll-linked style-delta / `getAnimations()`
  assertion), never inferred from a screenshot.
- The panel's inability to see choreography is carried into the report as a
  standing caveat on criterion 7, alongside the standing advisory-only
  demotion. This is a limitation of the seat, declared before scores exist.

## Judging seat status (standing, binding on this run)

The model judging seat is **advisory-only** under the demotion recorded in
`evals/validation/E4-JUDGING-SEAT-REPAIR-DECISION.md`. E4 was falsified on its
plant criterion; the demotion is not lifted by implementation or
self-assessment, only by a passing E4-R, which does not exist. Therefore **no
quality claim in this run may rest on panel scores alone.** The repair
decision's two rules bind this run's panel:

- **R1** — floor-clean is a hard precondition for esteem scoring. An arm whose
  shipped HARD gates did not all exit 0 is `UNSCORED`, never "scored low".
- **R2** — panels receive the floor outputs with the renders, and the juror
  record's `inputTranscriptSha256` covers them.

## Anti-cliche fingerprint registry (state at run time)

- Live durable registry (`~/.claude/pixelhelm/fingerprints.md`): **DOES NOT
  EXIST on this machine** — the active registry is exactly the shipped seed.
- Seed: `plugins/pixelhelm-lite/seeds/fingerprints-seed.md` @ the run's base
  commit; sha256 `bc12f90304df4e4c637d529ddfba4435de2d81c652dd664b8b8a5d148397ab34`
  (same seed hash E1 recorded, re-measured here rather than copied).
- Consequence for generation: none of the `any[]` strings may appear in any
  arm's code or computed styles; the non-greppable entries bind at the design
  level (no centered-hero-blob, no monotone metric grid). For a launch page
  the hero-blob entry is the live risk and is called out to each arm.

## Prior state consumed (ledger / lessons / taste)

Fresh project: no `.pixelhelm/` state for E6, no ledger, no prior verdicts, no
`_taste`. Durable LESSONS store on this machine: the design KB
(`~/.claude/design/LESSONS.md`) is present and was read; L-081, L-083, L-084,
L-085 and L-086 are load-bearing for this run and are cited where they bind.
Recorded here so the read is explicit rather than skipped.

## Provenance precondition (sealed brief §"Position in the program")

E6-A is original-work Lane-A: pure code, free assets, no vendored anything, so
the scroll-film provenance precondition is NOT triggered. Standing obligation
kept live: if any technique in any arm traceably derives from Jack Roberts'
scroll-film-studio it must be credited, **idea-level only**, with vendoring
blocked pending a license (P3-6). Each arm's provenance is stated in
DIRECTIONS.md before it is built, and the run's provenance finding is recorded
in the report.

## Render + evaluation matrix (registered)

Desktop 1440x900 + mobile 375x812, light + dark — **and, per the sealed
evaluator rule, in BOTH motion modes**: a MOTION render set and a NO-MOTION
parity render set (`--reduced-motion`, separate out dir) for every arm. That
is 8 cells per arm, 24 cells total. Mode-fidelity asserted per cell; axe run
on the rendered cells. No extreme-content substitutions: the sealed data IS
the content and substitutions would inject non-sealed strings.

Gate outputs are written under `project/gates/` per arm, and — per R2 — travel
with the renders into the juror input set.

## Scope honesty (carried verbatim from the sealed brief)

One build judges THIS prototype under THIS pipeline, never the genre. The
human comprehension check (n=6) is owner-gated and is NOT part of this run; a
model-proxy pre-check may run but is labeled proxy everywhere it appears.
