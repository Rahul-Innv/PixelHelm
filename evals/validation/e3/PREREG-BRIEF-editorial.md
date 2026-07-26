# E3 brief 3 — "The Season That Moved" (editorial data-narrative archetype)

**Status: DRAFT — PENDING OWNER APPROVAL. Sealed by commit before any E3
generation.** Date drafted: 2026-07-26.

## The brief (verbatim input to GROUND)

> Build a single-page data-narrative for the fictional **Ashcombe Valley
> Observer**: "The Season That Moved" — how the valley's rainy season has
> shifted over 34 years of records from the town weir. Audience: general
> readers; assume no chart literacy. Success: a reader scrolling naturally
> understands the story (the wet season starts later and lands harder), and a
> reader who cannot or will not engage charts gets the SAME story from
> text. Desktop + mobile, light + dark. Register: patient local-paper
> journalism — concrete, unsensational, place-loving; the data is the story,
> never decoration.

## The accessibility bar (from artifact 14 E3, binding and rubric-scored)

- Every chart is a **named, described element** (accessible name + a text
  description conveying the chart's actual finding, not "a chart of rainfall");
- a **scannable no-scroll alternative** exists: a reader landing on the page
  gets the full story's conclusion in plain text without scroll-driven
  interaction — scrollytelling, if used at all, must be enhancement, not the
  only path (and carries reduced-motion parity, RF-3);
- keyboard-only traversal reaches everything interactive.

## Sealed ground data — honesty traps included

`data/ashcombe-rainfall.json` is the only content source. Its traps:
- three years are `null` (gauge failure 1998; funding gap 2003–2004) — every
  chart and statistic must show/state the gaps, and no trend claim may
  silently interpolate them;
- the 1990–1996 readings carry `method: "manual gauge"` vs the automated weir
  from 1997 — any comparison across that boundary must disclose the method
  change;
- one extreme (2019) is flagged `reviewStatus: "unverified outlier"` — usable
  only with that label;
- the data supports "wet season onset shifted later and intensity rose" ONLY as
  a description of THIS valley's record — no climate attribution claims exist
  in the data, so none may appear on the page.

## Loop protocol

Identical to E1's (3 arms, A1 declared-breaks, all gates, mutant ritual,
5-juror panel via records.mjs, everything committed). Archetype note: this is
the anti-Snow-Fall-imitation test — scroll effects detached from the reporting
are the documented failure mode; the data IS the story.

## Success / falsification (artifact 14 E3)

**Success:** output clears the floor battery (including the accessibility bar
above) AND the bar in `PREREG-RUBRIC-editorial.md`. **Falsified if:** the
output regresses to the utility register (a rainfall dashboard instead of a
story), or floor failures cluster here.
