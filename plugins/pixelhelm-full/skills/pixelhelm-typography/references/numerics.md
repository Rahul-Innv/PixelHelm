# Typographic numerics — the machine-checkable craft floor

Table of contents:
- [Principle](#principle)
- [The rules (lint constants)](#the-rules-lint-constants)
- [Quote and dash substitutions](#quote-and-dash-substitutions)
- [Tabular vs proportional figures](#tabular-vs-proportional-figures)
- [Token-shape precondition](#token-shape-precondition)
- [Structured-report shape](#structured-report-shape)
- [Scope and ignores](#scope-and-ignores)

Source: Butterick's *Practical Typography* "Summary of key rules" (translated, not
transcribed — its print-rooted "avoid system fonts" Rule 6 is REJECTED for a
CLS-first plugin). The report shape mirrors Terrazzo's `valid-typography` lint rule
(`messageId`/`node`/`data` structured findings). Run via
`scripts/lint-typography.mjs`; `pixelhelm-evaluate` Layer-1 enforces the same constants.

## Principle
Typography craft is mostly a small set of numeric ranges and character-correctness
checks that map almost 1:1 onto regex/AST assertions. Encode them as VALUE ranges so
they are gateable — Terrazzo only validates token SHAPE (keys present), which is not
enough; assert the values too.

## The rules (lint constants)
| Rule | Constant | Pass / Fail |
|---|---|---|
| Measure (line length) | 45–90 ch, target ~66 | set `max-width: 65ch` on prose; FAIL rendered line > 90ch or < 45ch |
| Leading (body) | unitless 1.2–1.45 | FAIL body `line-height` outside [1.2, 1.45] |
| Leading (display, step ≥ 2) | unitless 1.0–1.15 allowed | tighter leading OK only on large display steps |
| Body size | 15–25px at anchor | step-0 ≥ 16px recommended; FAIL outside [15, 25] |
| Caps tracking | letter-spacing 0.05em–0.12em | all-caps / small-caps runs MUST carry 5–12% tracking AND be < 1 line |
| Sentence spacing | one space | FAIL two+ spaces or runs of whitespace between sentences |
| Underline | only on `<a>` | WARN `text-decoration: underline` elsewhere |
| Bold+italic | not simultaneously | WARN bold and italic on the same run |
| Quotes | curly only | see substitutions below |
| Dashes | em/en correct | see substitutions below |
| Figures on data | tabular-nums | see tabular section below |

Notes:
- Measure is best checked on the RENDERED DOM (computed width ÷ glyph advance), but
  the cheap static check is "does every prose container cap width near 65ch?"
- Display steps legitimately go tighter than body — gate leading by step, not globally.

## Quote and dash substitutions
Enforce on prose text (JSX/MD/visible copy), with an ignore mechanism for code:

| Wrong | Right | Meaning |
|---|---|---|
| `'` straight apostrophe | `’` (U+2019) | apostrophe / right single quote |
| `'…'` straight single quotes | `‘…’` (U+2018 / U+2019) | single quotes |
| `"…"` straight double quotes | `“…”` (U+201C / U+201D) | double quotes |
| `--` or `—` typed as two hyphens | `—` (U+2014) | em dash (breaks in thought) |
| ` - ` hyphen used as a dash | `–` (U+2013) for ranges, `—` for breaks | en dash for `2020–2024`, em for asides |
| `...` three periods | `…` (U+2026) | ellipsis (optional, advisory) |

Regex-detectable; emit a fix suggestion, not a silent rewrite. The Typewolf
characters cheatsheet corroborates these.

**Exception — the em dash in generated page copy (owner rule, 2026-07-26).** The rows
above are typesetting hygiene for copy a human wrote: if a break-in-thought dash is
already there, it should be a real `—`, not `--`. They are NOT a licence to introduce
em dashes into copy this system generated. In generated UI, marketing and editorial
copy the em dash is a registered AI-voice tell (`ai-em-dash-copy`, seeds registry) —
owner, on the E3 editorial arms where it appeared in all three: *"em dashes present in
all arms - not supposed to be there."* Prefer a period, a comma, a colon, or a
restructured sentence, and never "upgrade" a hyphen to an em dash in generated prose.
The en dash for ranges (`2020–2024`) is unaffected; so is the em dash as a table's
data-absent glyph. Where a project's own house style genuinely calls for em dashes in
prose, its profile drops the cluster and this row applies unchanged.

## Tabular vs proportional figures
Distinct from prose: **any column or aligned run of numbers** — tables, prices,
metrics, countdowns, scoreboards, financial/analyst UIs — MUST use
`font-variant-numeric: tabular-nums` (or a face whose default figures are tabular) so
digits occupy equal width and align vertically. Proportional (default) figures are
correct for running prose. This matters most for analyst-terminal registers,
where mis-aligned digits read as broken. FAIL a numeric data column
rendering with proportional figures.

## Token-shape precondition
Before any value check, require the typography token to carry all of:
`fontFamily, fontSize, fontWeight, lineHeight, letterSpacing` (Terrazzo
`defaultOptions`). Report a structured `ERROR_MISSING` per absent property, then run
the value-range checks above. Shape without values is not "typography enforcement."

## Structured-report shape
Emit findings as objects (Terrazzo style), so `pixelhelm-evaluate` can fold them in:

```json
{
  "messageId": "measure-too-wide",
  "ruleRef": "butterick-4",
  "node": "src/components/Article.tsx:42",
  "severity": "warn",
  "data": { "measuredCh": 104, "max": 90 },
  "fix": "wrap prose in a container with max-width: 65ch"
}
```

Key findings to file: `measure-too-wide` / `measure-too-narrow`, `leading-out-of-range`,
`body-size-out-of-range`, `straight-quote`, `hyphen-as-dash`, `double-space`,
`caps-no-tracking`, `underline-non-link`, `bold-italic-same-run`,
`figures-not-tabular`, `ERROR_MISSING`.

## Scope and ignores
- Apply quote/dash/whitespace checks to **prose and visible UI copy only** — JSX/MD
  text and token string values. Do NOT flag `className` strings, code blocks, URLs,
  or identifiers.
- Provide an ignore mechanism (a la Terrazzo `options.ignore`) for false-positive
  surfaces (e.g. a `<code>` element, a regex literal in copy).
- Treat measure/leading/size/tabular as the hard floor; underline/bold-italic as
  WARN; quotes/dashes as fixable findings.
