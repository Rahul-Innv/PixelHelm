# North-stars (DESIGN.md) + per-project register

A north-star is a real brand's design system captured as a `DESIGN.md` — the unit a generator
imitates so output is grounded, not generic. We vendor the MIT-licensed VoltAgent corpus (73 brands)
verbatim and add our own retrieval index.

## Contents
- [The DESIGN.md schema](#the-designmd-schema)
- [Token-reference syntax + resolution](#token-reference-syntax--resolution)
- [The 73-brand index (vertical / style tags)](#the-73-brand-index-vertical--style-tags)
- [License posture](#license-posture)
- [Per-project register + profiles](#per-project-register--profiles)

## The DESIGN.md schema

`DESIGN.md` is the Google Stitch format: a plain-markdown design system an AI agent reads to generate
consistent UI. Each file = YAML front-matter (the token system) + prose sections. Imitate the
*structure and intent*, never the brand's literal hex.

YAML front-matter (real example: Linear):
- `version`, `name`, `description` — the description is a dense prose summary of the whole look.
- `colors:` — 24+ NAMED roles: `primary`, `on-primary`, `primary-hover`, ink ladder
  (`ink`/`ink-muted`/`ink-subtle`/`ink-tertiary`), canvas, a surface ladder
  (`surface-1..4`), hairline ladder, semantic (`semantic-success`).
- `typography:` — a full scale, each token an object: `fontFamily, fontSize, fontWeight, lineHeight,
  letterSpacing` (e.g. `display-xl` 80px / weight 600 / -3.0px tracking down to `caption` 12px).
- `spacing:` (4px base → `section` 96px), `rounded:` (`xs`/`md`/`lg`/`xl`/`pill`).
- `components:` — ~25 components defined by **token reference**, e.g.:
  ```yaml
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.on-primary}"
    typography: "{typography.button}"
    rounded: "{rounded.md}"
  ```

Prose sections (after the YAML `---`): **Overview** (+ Key Characteristics), **Colors** (with
per-color provenance: "Source pages: linear.app/home, /pricing…"), **Typography** (incl. the
free-font **substitute**, e.g. "closest free substitute is Inter 500/600/700; Geist Sans also
viable"), **Elevation** (a depth table), **Components**, **Do's and Don'ts**, and an honest **Known
Gaps** section (e.g. "Light mode is not documented because the marketing site ships no light theme").

Keep these disciplines when authoring/extracting a north-star (from Stitch's extract-design-md):
capture **intent over raw values** (`#294056` → "Deep Muted Teal-Navy — Primary CTA"), dedupe
near-duplicate colors, treat the theme file / Tailwind config as the design system, and the YAML
front-matter is mandatory.

## Token-reference syntax + resolution

Components reference tokens as `{colors.primary}` / `{typography.button}` / `{rounded.md}`. These are
NOT CSS — they must be resolved against the YAML before reaching output. **Never let an unresolved
`{...}` string leak into generated CSS.** If no resolver is wired, resolve by hand from the YAML map
before handing the brief to `design-tokens` / `design-generate`.

## The 73-brand index (vertical / style tags)

VoltAgent ships a FLAT folder of 73 `design-md/<brand>/DESIGN.md` files with NO index — unretrievable
by project type on its own. We author `north-stars-index.csv` (`slug, vertical_tags, style_tags,
mood, light_dark, primary_hex, font_substitute, license, source`) so Mode B can return "for a fintech
dashboard, imitate <brand>". The 73 vendored brands, grouped (use these for tag authoring):

- **AI / LLM / dev-tools:** claude, cohere, mistral.ai, minimax, x.ai, together.ai, ollama,
  replicate, runwayml, elevenlabs, nvidia, cursor, lovable, opencode.ai, warp, raycast, expo,
  composio, voltagent.
- **Dev infra / data / SaaS:** vercel, supabase, mongodb, clickhouse, hashicorp, sentry, posthog,
  sanity, mintlify, framer, webflow, zapier, intercom, cal, resend, miro, airtable, notion, figma,
  linear.app, superhuman, ibm, hp, dell-1996.
- **Fintech / payments / crypto:** stripe, revolut, wise, mercury (via research), coinbase, binance,
  kraken, mastercard, mongodb-adjacent. (For fintech-calm, prefer the research-mode set in
  `research-recipe.md` — VoltAgent's fintech depth is thinner.)
- **Consumer / commerce / media:** airbnb, uber, shopify, starbucks, nike, pinterest, spotify,
  meta, theverge, wired, vodafone.
- **Automotive / hardware / gaming:** tesla, spacex, bmw, bmw-m, ferrari, lamborghini, bugatti,
  renault, playstation, nintendo-2001.

Many of our ~160 verticals will have NO exact brand match. Fallback: return the nearest by
style_tags + mood, and clearly label it "nearest analog, not a vertical match" — and lean on Mode A
research for that project.

## License posture

The VoltAgent corpus is **MIT** (LICENSE: "Copyright (c) 2026 VoltAgent") → safe to vendor the 73
`DESIGN.md` files verbatim into the plugin. Keep the LICENSE file alongside `north-stars/`. Other
knowledge sources are NOT redistributable verbatim — paraphrase + attribute (Laws-of-UX is
BY-NC-ND; Mobbin is proprietary/403). See `sources.md`.

## Per-project register + profiles

Never homogenize. Pull the register from the project profile BEFORE researching or retrieving:

| Project archetype | Register | Hard constraints (from profile) |
|---|---|---|
| **A warm consumer app** | warm, premium, fun | — |
| **A regulated trust portal** | serious, trust, regulated-calm | single locked teal palette; override role = NEUTRAL (never amber); operator app on a disciplined operator register, end-user portal CALM; banned clusters: AI-cyan, AI purple→pink gradient |
| **An analyst data product** | analyst / terminal density | — |

A profile (`profiles/<project>.json`) carries `tokenModule`, `sourceDirs`, `allowRawColorIn`,
`bannedClusters` (id + offending hex/classes + note), and a `_register` string. Read `_register` and
`bannedClusters` first — they bound which references are even admissible (a warm-fun candidate is
wrong for a serious-trust register; an AI-cyan palette is banned outright). The per-project pre-researched briefs live
at `references/<project>-references.md` and already encode the owner's reactions — read the matching
one before re-researching.
