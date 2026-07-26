# E5 comparator selection — execution record + Amendment A1-E5

**Executed 2026-07-26, before any E3 generation exists.** Anonymous GitHub API,
stars-descending, per the sealed procedure. Every query's results were recorded;
nothing below was chosen after seeing any PixelHelm E3 output (none exist).

## Registered-query results, verbatim rulings

**SaaS (`landing page template topic:landing-page topic:template`)** — top 5:
ant-design/ant-design-landing (6516★, MIT) — INELIGIBLE: a section
library/builder, not a complete page template; cruip/open-react-template
(4682★) — INELIGIBLE: no detected free license; **Blazity/next-saas-starter
(1682★, MIT) — ELIGIBLE, top pick**; issaafalkattan/React-Landing-Page-Template
(1653★, MIT) — eligible, fewer stars; tailwindtoolbox/Landing-Page (1449★, MIT)
— eligible, fewer stars.

**Commerce (`ecommerce template storefront topic:ecommerce topic:template`)** —
DEGENERATE: top result 17★ unlicensed; no result over 17★; best-licensed
eligible candidate had 1★. A 1-star comparator would flatter the system —
against the rule's intent (a STRONG baseline).

**Editorial (`scrollytelling article template`)** — zero results. Sealed
fallback (`long-form article template`) — DEGENERATE: top 17★, rest 0★.
Also tested for the amendment: `topic:scrollytelling` — libraries/platforms
only (codehike, basementstudio/scrollytelling, pageflow), all INELIGIBLE as
page templates.

## Amendment A1-E5 (pre-generation; OWNER-APPROVED 2026-07-26, sealed in commit 4033148)

The two degenerate queries are replaced — moving strictly toward STRONGER
comparators, with eligibility rules unchanged:
- commerce → `topic:ecommerce topic:template` (topic-only);
- editorial → `blog starter template topic:blog` (blog/article starters are
  where complete long-form article page templates actually live on GitHub).

## Picks (all FINAL as of the 2026-07-26 approval)

| Archetype | Comparator | Stars | License | Head commit (2026-07-26) | Status |
|---|---|---|---|---|---|
| SaaS marketing | github.com/Blazity/next-saas-starter | 1682 | MIT | `502d8f519dc1f55486cfe942026cd06d4ae2ad3e` | FINAL (registered query) |
| Commerce | github.com/reliverse/relivator | 1558 | MIT | `a1871b006ab09df647b99fc71d3c080acd797e24` | FINAL (A1-E5 approved) |
| Editorial | github.com/arthelokyo/astrowind | 5835 | MIT | `5cea946d2d244ba97b5e84f9509ca9dcdeb9a41b` | FINAL (A1-E5 approved) |

Construction stays as sealed: same data file, slot-filling edits only, every
edit line-listed, same render matrix as our candidates.
