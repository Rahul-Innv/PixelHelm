# E1 pre-registered brief — Kestrel Ridge trail conditions (utility archetype)

**Status: DRAFT — PENDING OWNER APPROVAL. Sealed by commit before any generation.**
Date drafted: 2026-07-26.

## Why this brief

E1 needs one small, representative **utility** brief (home turf), explicitly not
the owner's portfolio and not a rerun of the shipped Harborline example (a fresh
brief avoids incumbent-guard contamination; re-running Harborline with records is
a separate, worthwhile follow-up for the README's attested-history claims).

## The brief (verbatim input to the loop's GROUND stage)

> Build a trail-conditions status page for **Kestrel Ridge Open Space**, a
> fictional regional trail network. Audience: hikers and trail runners deciding
> — today, often on a phone at the trailhead parking lot — whether and where to
> go. Success for a visitor: within ~30 seconds, know which trails are open,
> what needs caution, and when the information was last updated. The page must
> work desktop + mobile, light + dark. Register: calm, factual, outdoors-trust;
> zero marketing voice. All content comes from the sealed data file below;
> nothing downstream may invent facts not in it.

## Sealed ground data

`data/trail-status.json` is the ONLY content source. It deliberately carries the
honesty traps the system claims to handle:

- two trails with **no telemetry** (`status: "unreported"`) — must render as
  unknown, never as open/closed by default;
- one **null day** in the 7-day history — must render as an explicit gap;
- one **estimated** value (snowpack) — must be visibly flagged as estimated;
- one active closure alert with an effective window.

## Loop protocol (the system under test, run as documented — no improvisation)

Full pipeline per artifact 14 E1: ground → directions → tournament (**3 arms**)
→ render (desktop/mobile × light/dark) → gates → judge panel → repair → verdict.

- Each direction arm carries a **one-sentence intent** written at the directions
  stage (these intents feed the blind-intent test in
  `PREREG-METRICS-divergence.md`).
- The 4-mutant non-vacuity ritual (`design-evaluate/references/honesty-gates.md`)
  is planted and its firing recorded — a gate that cannot fire is rejected.
- Every artifact is committed: all three arms' candidates (losers included),
  per-juror verdict JSONs, gate outputs, renders, and the run record
  (`design/run@1`, `design/signoff@1` per `close-the-loop.md`).
- Any motion used must carry `prefers-reduced-motion` parity and purpose (RF-3);
  wow is archetype-gated (RF-7) — for a utility register, second-visit glance
  value outranks spectacle.

## Success / falsification (from artifact 14, restated unchanged)

**Success:** the complete artifact trail exists; gates fire correctly (mutant
ritual recorded); the panel produces a verdict with recorded per-juror scores.
**Falsified if:** the loop cannot complete without improvisation outside the
documented process, or artifacts cannot be produced as schema'd.

## Execution precondition

BLOCKED until P0-4 (floor gates), P0-5 (judge-record writers), and P0-6
(landmark/heading/SEO output gate) merge to main — juror JSONs and committable
gate outputs are success criteria and need that machinery.
