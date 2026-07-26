# E6-A brief — "Vireo Fold" motion-storytelling launch page (Lane-A, original work)

**Status: DRAFT — PENDING OWNER APPROVAL. Sealed by commit before any
generation.** Date drafted: 2026-07-26, at the owner's direction ("video
storytelling and landing page" — the motion experiment, run as a marketing
launch page, the one archetype where cinematic motion is genre-legitimate,
RF-7).

## Position in the program

This is artifact 14's E6 Lane-A prototype in its original-work form: pure code,
free assets, built to the full gate discipline. Because everything is original,
E6's scroll-film provenance precondition is NOT triggered; if any technique
traceably derives from Jack Roberts' scroll-film-studio, it must be credited,
idea-level only (owner decision 2026-07-26), and vendoring stays blocked
pending a license (P3-6). Scope honesty carried from artifact 14: one build
judges THIS prototype under THIS pipeline — never the genre.

## The brief (verbatim input to GROUND)

> Build the launch page for the **Vireo Fold**, a fictional 9.8 kg folding
> touring kayak that packs to a carry-on-sized bag. The story IS the unfold:
> the page's motion narrative walks the visitor through bag → hull → water in
> the product's own three steps, so the demonstration is the pitch
> (proof-by-experience, W-02). Audience: commuters and small-flat dwellers who
> assumed kayaking wasn't for them. All visuals are authored in code (SVG/CSS/
> canvas) — no stock assets. Every claim traces to the sealed data file.
> Desktop + mobile, light + dark.

## Non-negotiable motion floor (RF-3 + Stage-7 gates; each is rubric-scored AND gate-checked)

1. **Full no-motion parity:** with `prefers-reduced-motion`, with JS disabled,
   and for a keyboard-only visitor, the COMPLETE story and every fact are
   available as a readable page — parity of content, not a stub.
2. **Scroll is never hijacked:** native scrolling, no wheel capture, no forced
   pacing; motion responds to the visitor, never the reverse.
3. **Second-visit bypass:** a visible skip control; a returning visitor reaches
   facts and price without re-watching anything.
4. **Pre-registered performance budgets (lab, fixed now):** initial payload
   ≤ 1.5 MB with JS ≤ 300 KB gzipped; LCP ≤ 2.5 s and CLS ≤ 0.10 on emulated
   mid-tier mobile; interaction-latency proxy ≤ 200 ms; frame time p95
   ≤ 16.7 ms desktop / ≤ 33 ms emulated mobile during the heaviest sequence.

## Sealed ground data

`data/vireo-fold.json` (committed alongside). Traps: the setup-time claim
carries its basis (owner-timed, n=14 — must appear with the number); pack
volume is `estimated: true`; the load rating has a certification pending flag —
unusable as certified.

## Comprehension check (artifact 14 E6, unchanged)

Motion-on vs motion-off, n = 6, owner-recruited, directional signal only —
owner-gated. A model-proxy comprehension pre-check may run first but is always
labeled proxy, never substituted for the human check.

## Execution preconditions (honest blockers)

1. E1 complete and reviewed (loop machinery proven).
2. **P1-5 measurement tooling** (frame-time percentiles, lab CWV capture) —
   *Amendment A2 (2026-07-26, owner-approved, still pre-generation):* the
   tooling LANDED (merge of `e01c84f`: verify_frametime / verify_cwv /
   verify_scrollcapture / verify_keyboard). This precondition is now satisfied;
   the budgets in §4 are measured by those validators, whose verdicts bind the
   producing run. E1 review (precondition 1) remains the only blocker. The
   original principle stands: no measurement, no run.

## Success / falsification

**Success:** THIS prototype clears the full floor in both modes (motion and
no-motion) within the pre-registered budgets, with no comprehension red flag.
**Falsified if:** it cannot — triggering diagnosis (implementation? content?
gates?), never a genre-level conclusion in either direction.
