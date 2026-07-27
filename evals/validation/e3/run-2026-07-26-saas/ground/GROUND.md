# E3(saas) GROUND context — Ledgerline marketing page (2026-07-26)

Stage 1 of the admitted pixelhelm-lite loop (admission:
`../admission/admission.json`, sha256 `53b006a5…f7c1`). Ground resolves the
contract before any taste or code; it mints no tokens and produces no UI.

## Register (literal; the register-fit authority for this task)

From the sealed brief, verbatim: **"plain-spoken, tradesperson-respecting,
zero startup hype; every claim on the page must trace to the sealed data
file."** Audience: a sole-trader tradesperson (plumber, electrician,
carpenter) who invoices from a phone between jobs, has never used invoicing
software, and distrusts subscriptions. Success for a visitor: within one
screenful they know what it is and who it's for; within the page they can
judge whether it's worth the price; the trial CTA is unmistakable but never
nagging. Archetype note (sealed): this archetype's success language is
*credibility engineering* — restrained, verifiable, conversion-respecting.

## Content authority (absolute)

`../../data/ledgerline.json` (sealed, commit-pinned) is the ONLY content
source. No fact may appear that is not in it. Honesty traps it carries, which
every surface must render truthfully:

- the time-saved claim (`4 hours per week`) is `basis: "internal estimate,
  n=11 pilot users"`, `verified: false` — usable ONLY with that basis
  visible; no naked "save 4 hours a week";
- testimonial 2 (`"Cut my unpaid invoices to zero…"`, anonymous) is
  `verified: false` — unusable, or usable only explicitly labeled unverified;
  the honest move (taken by all arms, declared in DIRECTIONS) is to omit it;
- `QuickBooks export` is `status: "beta"` — never presentable as shipped;
- pricing carries the mandatory VAT-exclusive note (`"All prices exclude
  VAT."`) which must appear wherever a price does.

Derived numbers (counts) may exist ONLY as injected constants computed by the
committed injector (`project/scripts/inject.mjs`, pure arithmetic on JSON
literals, never the clock) into `project/data/derived.json` — pages print
constants; the honesty gates re-diff the render against the truth.

**Recorded reading (pre-render):** the parentheticals `(fictional)` /
`(fictional persona)` in the sealed data are dataset-synthetic metadata
(restating the file's own `sealedNote`), not page copy — pages print the
attribution and location without the marker. Logged as an execution reading
in the run report.

## Content contract — tagged blocks (binds Gate A/B and the manifest)

Every arm renders the full honest content set, each unit inside its own
`data-model` block (ids frozen here): `feat-invoice`, `feat-reminders`,
`feat-markup`, `feat-taxpot`, `int-stripe`, `int-openbanking`,
`int-quickbooks`, `tier-solo`, `tier-crew`, `pricing` (section wrapper),
`trial`, `claim-pilot`, `claim-textlink`, `quote-okafor`. Discipline:

- prices (`£9`, `£19`) appear only inside pricing blocks, with the VAT note
  inside the `pricing` block (and wherever any price is repeated);
- integration status renders as a case-sensitive uppercase word — **LIVE**
  (shipped) / **BETA** — so the false-verdict gate can bind to the standalone
  word `LIVE` without colliding with prose;
- the pilot claim block carries its basis label verbatim-traceable
  ("internal estimate", "n=11 pilot users") — Gate A's provisional binding
  enforces this in both modes;
- the unverified anonymous testimonial appears in NO arm.

## Token authority

New design, no incumbent, three competing palettes: token authority is
PER-ARM via the embedded `#token-contract` block each candidate carries
(new-palette tournament rule, `check-token-contracts.mjs`). The project
profile (`project/.pixelhelm/profile.json`) records the register and gate
config; the winner's contract becomes the project contract at promotion (a
separate owner-gated leaf, not part of E3).

## Machine floor (unbreakable — A1 rules of engagement)

Contrast AA per gated pairs (text 4.5 / graphic 3.0, light AND dark), honesty
gates A+B (Gate A: fabrication over money/percent/count/days + registered
extra contexts `£`, `hours`, `clock-time`, `seconds`; association per tagged
block; verdict word `LIVE` with positive status `shipped`; provisional status
`estimate` requiring the basis marker), keyboard access + visible focus,
`prefers-reduced-motion` parity, structural output floor (one `main`, h1, no
skipped heading levels, no impostor headings, meta description), no
horizontal overflow at 280/320/414, target size ≥ 24px (2.5.8), state-aware
contrast in default/hover/focus. Wow is archetype-gated (RF-7):
product-marketing register — credibility and glanceable decision-making
outrank spectacle; restraint reads as confidence.

## Anti-cliche fingerprint registry (state at run time)

- Live durable registry (`~/.claude/pixelhelm/fingerprints.md`): DOES NOT
  EXIST on this machine — the active registry is exactly the shipped seed.
- Seed: `plugins/pixelhelm-lite/seeds/fingerprints-seed.md` @ the run's base
  commit; 6 entries, all `status: active`, all `scope: global` (ai-cyan,
  ai-purple-grad, bootstrap-indigo-default, glass-everywhere,
  centered-hero-blob, monotone-metric-grid). sha256
  `bc12f90304df4e4c637d529ddfba4435de2d81c652dd664b8b8a5d148397ab34`.
- Consequence for generation: none of the `any[]` strings may appear in any
  arm's code or computed styles; the two design-level entries bind at the
  design level — **centered-hero-blob bites hardest on this archetype**
  (the default SaaS landing shape is exactly the banned cliche), and no
  monotone metric grid.

## Prior state consumed (ledger / lessons / taste)

Fresh project: no `.pixelhelm/` state, no ledger, no prior verdicts, no
`_taste`. Durable LESSONS store (`~/.claude/pixelhelm/`): none on this
machine. E1's project lesson store carries the owner-approved calibration
lesson (panel ≈1 point hot vs owner; 9+ = "strong, owner-verify") — already
binding here via the sealed rubric's Amendment C1, and consumed as the
reading rule for all panel medians. Design KB (`~/.claude/design/INDEX.md`)
routing consumed; L-081 binds: before ANY DOM/browser measurement, assert
page identity first (document.title + per-arm `data-arm` marker on `<html>`).

## Render + evaluation matrix (registered)

Desktop 1440×900 + mobile 375×812, light + dark (render.mjs, theme set via
`data-theme` attribute; mode-fidelity asserted per cell; axe per cell). No
extreme-content substitutions: the sealed data IS the content and
substitutions would inject non-sealed strings — the real strings
(`Chase-for-you reminders`, `Open Banking feed`, `QuickBooks export`) already
exercise wrap behavior. Page identity asserted per arm before any
measurement (L-081). Gate outputs are written under `project/gates/` per arm.
