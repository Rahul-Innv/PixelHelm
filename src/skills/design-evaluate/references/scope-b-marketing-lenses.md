# Scope-B marketing lenses — Performance/CWV + SEO/share-meta (surface-triggered)

> **Surface trigger (MUST).** These two lenses fire **only** when the evaluated surface is a real
> **marketing web page** — `profile.surfaceType === "marketing"`. They are meaningless, and can be
> actively misleading, for an in-shell app screen, a data view, or an email. Never run them on
> `app` / `data` / `email` surfaces. This matches the plugin's existing surface-triggered-bench
> pattern (a lens fires for the surface it was built for, never universally).
>
> Both are **machine-certain** (no model juror) and **advisory by default** (exit 0; `--strict`
> exits 1 on a FAIL). Neither ever changes the exit of the Layer-1 contrast **hard** gate — they are
> reported *alongside* it. They were un-parked from the 2026-07-06 scope-A absorption and first
> proven on the CohortWatch marketing site (Phase 2).

## Why these were parked, and why they are marketing-only

Perf budgets and SEO/OG belong to the premium-marketing-site world (power-design web-rules #16/#17/#20).
The plugin's home surfaces are data products, apps, and email, where they matter less — so scope A
absorbed only the *universal* craft thresholds and parked these two as surface-triggered lenses. A
marketing-site run (CohortWatch → Verando) is the surface that legitimately activates them.

## Lens 1 — SEO / share-meta  (`design-evaluate/scripts/seo-meta.mjs`)

Pure Node, dependency-free. Parses the head of a rendered page (URL or HTML file).

```
node "${CLAUDE_PLUGIN_ROOT}/skills/design-evaluate/scripts/seo-meta.mjs" <url|file> [...] [--json] [--strict]
```

Checks + thresholds (each cited to a public authority — restate, never copy prose):

| Check | Threshold | Source |
|---|---|---|
| `<title>` present | ≤ 60 chars (Google truncates ~60) | Google Search Central |
| `<meta name=description>` present | ≤ 155 ideal, > 160 = FAIL | Google Search Central |
| `<link rel=canonical>` | present, absolute preferred | RFC 6596 / Google |
| Open Graph | og:title + og:description + og:image present | ogp.me |
| OG image dims | 1200×630 recommended | ogp.me / platform cards |
| twitter:card | present | Twitter/X cards |
| JSON-LD | present AND every block parses | schema.org |
| `<h1>` | exactly one | WCAG 2.2 1.3.1 + SEO |

Next.js note: file-based `opengraph-image.tsx` emits `og:image` + explicit `og:image:width/height` on
the generated tag, so a Next marketing page usually passes og-dims; a hand-rolled URL-only `og:image`
often omits them (→ a `warn`, not a fail).

## Lens 2 — Performance / CWV budget  (`design-render/scripts/perf-budget.mjs`)

Drives a real browser (Playwright — same channel-fallback chain as `render.mjs`; it lives in
`design-render` because that is where Playwright is resolved, mirroring the `--axe` arm). Reports
**lab** Core Web Vitals + a transfer budget.

```
node "${CLAUDE_PLUGIN_ROOT}/skills/design-render/scripts/perf-budget.mjs" <url> [...] [--json] [--strict] [--channel ...]
```

| Metric | Budget | Source |
|---|---|---|
| LCP (lab) | < 2500 ms | web.dev CWV |
| CLS (lab) | < 0.1 | web.dev CWV |
| JS transfer | ≤ 300 KB | power-design #17 |
| LCP image (hero) transfer | ≤ 200 KB | power-design #17 |
| Font families | ≤ 2 | power-design #17 |
| Images without intrinsic width/height/aspect-ratio | 0 (CLS risk) | web.dev #16 |

**Lab, not field.** One cold headless load on the build machine — directional, and it catches gross
regressions (a 2 MB hero, a runaway bundle, a fifth font, undimensioned images), but it is not a
substitute for real-user (field) RUM. Do not report a lab pass as a field guarantee. INP is
interaction-driven and is **not** measured by a single cold load — it is deliberately omitted rather
than faked.

## Where these sit in the evaluation

- Both are **Layer-1-adjacent** machine lenses: run them after `static-gates.mjs` on a marketing
  surface, and fold their findings into the merged verdict with confidence `machine-certain`.
- A FAIL here is **advisory** unless the run opts into `--strict`; the register-fit gate and the
  contrast hard-gate remain the deciders. Report perf/SEO FAILs at `[Medium]` unless the project
  declares a perf/SEO budget as ship-blocking (then `[High-Priority]`).
- Keep them OFF the critical path for non-marketing surfaces — a data app that ships a big client
  bundle by design must never be dinged by a marketing perf budget.
