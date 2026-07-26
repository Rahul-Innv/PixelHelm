# E5 comparator construction rule — sealed BEFORE E3 begins (critic-2 D9)

**Status: APPROVED & SEALED (owner, 2026-07-26 — approval recorded in the seal/amendment commit messages; status line flipped 2026-07-26 per Codex critique finding 5).** Date drafted: 2026-07-26. E5 tests
the strongest E3 output against a comparator in a small human probe. To prevent
choosing a flattering comparator after seeing our output, the comparator's
construction rule is fixed now, and the concrete template picks are executed and
committed before any E3 generation exists.

## Selection procedure (deterministic, executed once per E3 archetype)

For each of the three E3 archetypes, before E3 generation begins:

1. **Search** GitHub for free templates in the archetype's category with these
   fixed queries (topic/readme search, executed on the recorded execution date):
   - SaaS marketing: `landing page template` filtered to topics
     `landing-page, template`;
   - commerce: `ecommerce template storefront` filtered to topics
     `ecommerce, template`;
   - editorial: `scrollytelling article template` (fallback if empty:
     `long-form article template`).
2. **Eligibility filter, in order:** OSI/CC free license in the repo; genuinely
   a usable page template (README presents it as a template; static HTML/CSS or
   a documented build); category match per its own README description; not a
   component library or framework starter without a complete page.
3. **Pick** the eligible repo with the most stars; tie-break by most recent
   default-branch commit. **Record** repo URL, commit hash, star count, license,
   and execution date in an addendum committed before E3 generation.
4. **Construction:** the SAME sealed data file populates the template with
   slot-filling edits only — no restyling, no layout surgery, template's own
   assets kept; every edit line-listed in the addendum. The comparator is
   rendered with the same matrix as our candidates.

## Protocol reminders bound from artifact 14 (unchanged)

Participants 8–12, owner-recruited against a stated profile, owner not a
participant; counterbalanced A/B order; blind to origin; 10 s fixed exposure +
task; delayed recall at ≥ 1 h; primary endpoint = delayed free recall of the
site's identity, trust/preference secondary; decision threshold written before
any data. Owner-gated: requires recruitment and consent. Falsified if the
comparator ties or wins the primary endpoint.
