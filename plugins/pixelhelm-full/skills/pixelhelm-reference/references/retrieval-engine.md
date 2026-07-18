# Mode B — The offline retrieval engine (contract)

Mode B maps a project type to a design archetype + a real north-star, **deterministically and
offline**. No LLM sits in the retrieval path — the model only consumes the assembled brief. The
contract below is ported from the proven ui-ux-pro-max engine (`core.py` BM25 + `design_system.py`
JOIN), re-derived into our schema with two fixes: an **aliases** column for synonym robustness and an
**authority** column so rules are citable.

## Contents
- [Data files](#data-files)
- [The retrieval algorithm](#the-retrieval-algorithm)
- [BM25 (verbatim)](#bm25-verbatim)
- [Query pre-processing](#query-pre-processing)
- [The JOIN + select_best_match](#the-join--select_best_match)
- [Output: the DESIGN.md brief + persistence](#output-the-designmd-brief--persistence)
- [Failure modes to avoid](#failure-modes-to-avoid)

## Data files

`scripts/reference.mjs` reads versioned CSV/JSON data files. Schema (re-derived from ui-ux-pro-max's
`colors.csv` / `ui-reasoning.csv` etc., with the two added columns):

| File | Key columns |
|---|---|
| `verticals.csv` | `vertical, aliases, keywords, recommended_pattern, style_priority, color_archetype_id, type_pairing_id, anti_patterns, decision_rules(JSON), severity` |
| `palettes.csv` | full semantic shadcn token row per archetype: `Primary, On Primary, Secondary, Accent, Background, Foreground, Muted, Border, Destructive, Ring, Notes` — KEEP the WCAG-adjustment `Notes` string verbatim |
| `type-pairings.csv` | `heading, body, google_fonts_url, css_import, tailwind` |
| `styles.csv` | `style, ai_prompt_keywords, impl_checklist, ds_variables` |
| `ux-rules.csv` | the rule corpus + an `authority` column (WCAG SC+level / Apple HIG / Material / Laws-of-UX, paraphrased) |
| `patterns.csv` | UI-Patterns 6+persuasive taxonomy + a Mobbin-canonical `component_name` |
| `north-stars-index.csv` | `slug, vertical_tags, style_tags, mood, light_dark, primary_hex, font_substitute, license, source` (see `north-stars.md`) |

`aliases` is the brittleness fix: `fintech` row carries `neobank|payments|crypto|wallet` so those
queries resolve. The `Notes` audit string in `palettes.csv` (e.g. `Trust blue + orange CTA contrast
[Accent adjusted from #F97316 for WCAG 3:1]`) is part of the data and MUST surface in the brief.

## The retrieval algorithm

1. **Pre-process the query** (below) — expand through `aliases` + the vague→precise map, THEN
   tokenize.
2. **Resolve the vertical**: BM25 over `verticals.csv` search columns → top vertical (n=1).
3. **Apply its reasoning rule**: read `recommended_pattern`, `style_priority`, `anti_patterns`,
   `decision_rules` (parse the embedded JSON, e.g. `{"if_data_heavy":"increase-density"}`),
   `severity`.
4. **Multi-domain search** with style-priority hints: style n=3, color n=2, type n=2 (mirrors
   `SEARCH_CONFIG` in `design_system.py`). For the style domain, append the top 1–2
   `style_priority` keywords to the query before searching.
5. **`select_best_match`** per domain by style priority (below); color/type take the top hit.
6. **North-star lookup**: query `north-stars-index.csv` by the resolved vertical_tags + style_tags;
   return top 1–2 exemplars.
7. **Emit** the DESIGN.md brief (below).

## BM25 (verbatim)

Use the proven parameters — do not retune. `k1=1.5`, `b=0.75`. Tokenize = lowercase, strip
punctuation to spaces, split, **drop tokens of length ≤ 2**. IDF = `log((N - df + 0.5)/(df + 0.5) +
1)`. Score the standard BM25 sum over query tokens present in the doc. Build the document for a row
by joining its search columns with spaces. Return only hits with **score > 0**.

This is dependency-free and offline by design — the auditability mandate forbids swapping in an
embedding model (it adds nondeterminism + a model dependency). Synonyms are handled by the `aliases`
column, not by embeddings.

## Query pre-processing

Two expansions before tokenizing (the front-door fix for BM25's lexical brittleness):

1. **Alias expansion** — if any query word matches a value in some vertical's `aliases`, append that
   vertical's canonical name + keywords to the query string.
2. **Vague→precise map** (from the Stitch design-mappings tables) — rewrite loose words into strong
   design keywords, e.g. `big photo` → `high-impact full-width hero`, `luxury` → `serif headers,
   fine lines, high-fidelity photography`, `rounded` → `pillow-like soft radius`. Keep the map small
   and in the data, not the code.

## The JOIN + select_best_match

Mirrors `design_system.py`:
- First search `product`/`vertical` (n=1) to get the category, THEN apply its reasoning rule, THEN
  multi-domain search using `style_priority` as hints — this ordering matters; the rule steers the
  style search.
- `select_best_match(results, priority_keywords)`:
  1. exact style-name match against a priority keyword wins;
  2. else score each result (style-name hit +10, keyword-field hit +3, any-field hit +1) and take
     the top **only if its score > 0**;
  3. **if the top score is 0, return "no confident match"** — do NOT silently fall back to
     `results[0]` (that is the wrong-but-confident bug; surface uncertainty instead).
- Keep the multi-domain `n > 1` for style/color/type — collapsing to n=1 loses the cross-check.

## Output: the DESIGN.md brief + persistence

Emit the brief in the canonical `DESIGN.md` schema (YAML colors/typography/spacing +
components-as-`{token}`-refs, then prose sections — see `north-stars.md`). The brief MUST contain:

- the chosen **palette** with its `Notes` WCAG-audit string verbatim;
- the **type pairing** (+ google_fonts_url / css_import);
- the **style** + its impl checklist + anti-patterns + the parsed `decision_rules`;
- the **cited UX rules** each with its `authority`;
- `north-star to imitate: <brand> (see north-stars/<slug>/DESIGN.md)`.

For cross-session retrieval, persist (ui-ux-pro-max's Master+Overrides pattern):
- `design-system/<project>/MASTER.md` — the global brief;
- `design-system/<project>/pages/<page>.md` — page-specific deviations that **override** MASTER.
Reading order when building a page: check `pages/<page>.md` first; if absent, use MASTER.

> This brief is RAW MATERIAL. `pixelhelm-tokens` is the single source of truth — it ratifies the
> palette/type pairing into the actual token set. Do not emit final tokens here.

## Failure modes to avoid
- Lexical-only retrieval without `aliases` → silently misses `neobank`→`fintech`.
- Treating a generic per-vertical palette as brand truth (every "SaaS" = `#2563EB`) → always pair
  with a real north-star.
- `select_best_match` falling back to `results[0]` on a zero-score query → return "no confident
  match".
- An LLM in the retrieval path → breaks determinism/auditability.
- Unresolved `{colors.primary}` `{token}` strings leaking into CSS → resolve before output.
- Collapsing multi-domain `n` to 1 → loses the cross-check.
