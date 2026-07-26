# E1 GROUND context — Kestrel Ridge trail conditions (2026-07-26)

Stage 1 of the admitted pixelhelm-lite loop (admission:
`../admission/admission.json`, sha256 `5afa59d7…c10226`). Ground resolves the
contract before any taste or code; it mints no tokens and produces no UI.

## Register (literal; the register-fit authority for this task)

From the sealed brief, verbatim: **"calm, factual, outdoors-trust; zero
marketing voice."** Audience: hikers and trail runners deciding — today, often
on a phone at the trailhead parking lot — whether and where to go. Success:
within ~30 seconds, know which trails are open, what needs caution, and when
the information was last updated.

## Content authority (absolute)

`../../data/trail-status.json` (sealed, commit-pinned) is the ONLY content
source. No fact may appear that is not in it. Honesty traps it carries, which
the surface must render truthfully:

- `T-07 Hollow Pine Traverse` and `T-09 North Fence Line`: `status:
  "unreported"`, `lastReport: null` — must read as unknown, never as
  open/closed, never silently omitted;
- `history7d[2026-07-22]`: all-null day — must render as an explicit gap;
- `snowpack`: `depthCm: 0` with `estimated: true` and an offline-sensor note —
  must be visibly flagged as estimated;
- alert `A-114` (controlled burn): active closure with an effective window
  covering today.

Derived numbers (counts, totals) may exist ONLY as injected constants computed
by the committed injector (`project/scripts/inject.mjs`, pure arithmetic on
JSON literals, never the clock) into `project/data/derived.json` — the pages
print constants; the honesty gates re-diff the render against the truth.

## Token authority

New design, no incumbent, three competing palettes: token authority is
PER-ARM via the embedded `#token-contract` block each candidate carries
(new-palette tournament rule, `check-token-contracts.mjs`). The project
profile (`project/.pixelhelm/profile.json`) records the register and gate
config; the winner's contract becomes the project contract at promotion (a
separate owner-gated leaf, not part of E1).

## Machine floor (unbreakable — A1 rules of engagement)

Contrast AA per gated pairs (text 4.5 / graphic 3.0, light AND dark), honesty
gates A+B, keyboard access + visible focus, `prefers-reduced-motion` parity
(any motion must have purpose and a reduced path), structural output floor
(one `main`, h1, no skipped heading levels, no impostor headings, meta
description), no horizontal overflow at 280/320/414, target size ≥ 24px
(2.5.8), state-aware contrast in default/hover/focus. Wow is archetype-gated
(RF-7): utility register — second-visit glance value outranks spectacle.

## Anti-cliche fingerprint registry (state at run time)

- Live durable registry (`~/.claude/pixelhelm/fingerprints.md`): DOES NOT
  EXIST on this machine — the active registry is exactly the shipped seed.
- Seed: `plugins/pixelhelm-lite/seeds/fingerprints-seed.md` @ the run's base
  commit; 6 entries, all `status: active`, all `scope: global`
  (ai-cyan, ai-purple-grad, bootstrap-indigo-default, glass-everywhere,
  centered-hero-blob, monotone-metric-grid). sha256 of the seed file is
  recorded in `../divergence/registry-hashes.json` at measurement time.
- Consequence for generation: none of the `any[]` strings may appear in any
  arm's code or computed styles; the two non-greppable entries bind at the
  design level (no hero-blob, no monotone metric grid).

## Prior state consumed (ledger / lessons / taste)

Fresh project: no `.pixelhelm/` state, no ledger, no prior verdicts, no
`_taste`. Durable LESSONS store: none on this machine; shipped seed lessons
are generic craft guidance. Nothing to fold in — recorded here so the empty
read is explicit rather than skipped.

## Render + evaluation matrix (registered)

Desktop 1440×900 + mobile 375×812, light + dark (render.mjs, theme set via
`data-theme` attribute; mode-fidelity asserted per cell). No extreme-content
substitutions: the sealed data IS the content and substitutions would inject
non-sealed strings — the real long names (`Millbrook Creek Path`,
`Larkspur Meadow Loop`, `Hollow Pine Traverse`) already exercise wrap
behavior. Gate outputs are written under `project/gates/` per arm.
