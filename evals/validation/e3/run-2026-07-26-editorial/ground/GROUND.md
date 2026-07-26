# E3 GROUND context — "The Season That Moved" (editorial data-narrative, 2026-07-26)

Stage 1 of the admitted pixelhelm-lite loop (admission:
`../admission/admission.json`, sha256 `094c6c9d…9ce54`). Ground resolves the
contract before any taste or code; it mints no tokens and produces no UI.

## Register (literal; the register-fit authority for this task)

From the sealed brief, verbatim: **"patient local-paper journalism — concrete,
unsensational, place-loving; the data is the story, never decoration."**
Audience: general readers of the fictional *Ashcombe Valley Observer*; assume
no chart literacy. Success: a reader scrolling naturally understands the story
(the wet season starts later and lands harder), and a reader who cannot or
will not engage charts gets the SAME story from text. Desktop + mobile,
light + dark.

## The accessibility bar (binding floor, from the sealed brief)

- Every chart is a **named, described element**: accessible name + a text
  description conveying the chart's actual finding (never "a chart of
  rainfall").
- A **scannable no-scroll alternative**: the full story's conclusion in plain
  text in the opening viewport, reachable without scroll-driven interaction.
  Scrollytelling, if used at all, is enhancement only, with reduced-motion
  parity (RF-3).
- Keyboard-only traversal reaches everything interactive.

## Content authority (absolute)

`../../data/ashcombe-rainfall.json` (sealed, sha256 `68f8c940…386a44`; copied
byte-identical into `project/data/` for the gates) is the ONLY content source.
No fact may appear that is not in it. Honesty traps it carries, which every
surface must render truthfully:

- **Three null years** — 1998 (gauge failure; station offline all season),
  2003–2004 (monitoring funding lapsed): every chart and statistic shows the
  gaps as gaps; no trend claim silently interpolates them.
- **Method change at 1996/1997** — 1990–1996 manual gauge (read twice daily),
  1997 onward automated weir. Any comparison across that boundary discloses
  the method change, everywhere the boundary is crossed.
- **2019 is flagged** `reviewStatus: "unverified outlier"` (sensor spike
  during the Oct 12 storm, not corroborated by neighboring stations) — usable
  only with that label.
- **No cause attribution.** The record supports "wet season onset shifted
  later and intensity rose" ONLY as a description of this valley's record; the
  sealed scope note licenses describing the shift, never its cause.

Derived numbers (era means, the shift in days, axis tick scales) exist ONLY as
injected constants computed by the committed injector
(`project/scripts/inject.mjs`, pure arithmetic on the sealed JSON literals,
never the clock) into `project/data/derived.json` — the pages print constants;
the honesty gates re-diff the render against the truth.

## Token authority

New design, no incumbent, three competing palettes: token authority is PER-ARM
via the embedded `#token-contract` block each candidate carries (new-palette
tournament rule, `check-token-contracts.mjs`). The project profile
(`project/.pixelhelm/profile.json`) records the register and gate config; the
winner's contract becomes the project contract only at promotion (a separate
owner-gated leaf, not part of E3).

## Machine floor (unbreakable — A1 rules of engagement)

Contrast AA per gated pairs (text 4.5 / graphic 3.0, light AND dark), honesty
gates A+B, keyboard access + visible focus, `prefers-reduced-motion` parity
(any motion must have purpose and a reduced path), structural output floor
(one `main`, h1, no skipped heading levels, no impostor headings, meta
description), no horizontal overflow at 280/320/414, target size ≥ 24px
(2.5.8), state-aware contrast in default/hover/focus — plus the brief's
accessibility bar above, which the rubric precondition makes floor, not style.
Archetype gate (RF-7): editorial register — the anti-Snow-Fall test; scroll
effects detached from the reporting are the documented failure mode; the data
IS the story.

## Anti-cliche fingerprint registry (state at run time)

- Live durable registry (`~/.claude/pixelhelm/fingerprints.md`): DOES NOT
  EXIST on this machine — the active registry is exactly the shipped seed.
- Seed: `plugins/pixelhelm-lite/seeds/fingerprints-seed.md` @ the run's base
  commit; 6 entries, all `status: active`, all `scope: global` (ai-cyan,
  ai-purple-grad, bootstrap-indigo-default, glass-everywhere,
  centered-hero-blob, monotone-metric-grid). Seed sha256
  `bc12f903…97ab34` (unchanged from E1's recorded hash).
- Consequence for generation: none of the `any[]` strings may appear in any
  arm's code or computed styles; the two non-greppable entries bind at the
  design level (no hero-blob, no monotone metric grid).

## Prior state consumed (ledger / lessons / taste)

Fresh project: no `.pixelhelm/` state, no ledger, no prior verdicts, no
`_taste`. Durable LESSONS store: none on this machine; shipped seed lessons
are generic craft guidance. Carried from the program record (binding on this
run): the E1 calibration lesson (Amendment C1 — 9+ medians read as "strong,
owner-verify"), L-080 (no anticipated verdicts anywhere, mechanism-evidence ≠
output-evidence), L-081 (assert page identity before any DOM measurement),
and E1's render-environment lesson (Playwright vendored per plugin version,
system-browser channel, no browser download).

## Render + evaluation matrix (registered)

Desktop 1440×900 + mobile 375×812, light + dark (render.mjs, theme set via
`data-theme` attribute; mode-fidelity asserted per cell; axe per cell). No
extreme-content substitutions: the sealed data IS the content and
substitutions would inject non-sealed strings — the 34-year series, the
three-clause gap reasons, and the 2019 review note already exercise wrap
behavior. Gate outputs are written under `project/gates/` per arm.

## Honesty-gate binding (fixed before any candidate exists)

- Every year 1990–2023 renders exactly one `data-model="<year>"` block per
  page (an accessible per-year data row carrying that year's values, gap
  reason, method, and flags); charts reference the same years but the tagged
  block is the gate anchor. `dataModel` anti-deletion binds all 34 ids.
- The 2019 flag renders with the word "unverified" (any case); no arm ever
  prints the standalone uppercase word "VERIFIED" (the false-verdict gate
  binds to it: config word "VERIFIED", statusField `reviewStatus`,
  positiveStatus `verified` — which no year carries, so an un-negated
  uppercase "VERIFIED" in any year block is a violation by construction).
- The null years render one of the phrases "no record" / "not recorded" /
  "no data" plus their sealed gap reasons ("gauge failure…", "monitoring
  funding lapsed") — the content manifest binds to these.
- The method-change disclosure phrases "manual gauge" and "automated weir"
  appear wherever an era comparison is made; the manifest requires both
  globally, and the arms' shared discipline places the disclosure at every
  crossing.
- A scope sentence containing "not its cause" (describing the shift, never
  attributing it) appears on every arm; the manifest binds to it.
