# Output contract — the merged verdict + honest banner

> ToC: [The banner](#the-honest-banner-must-verbatim) · [JSON shape](#the-merged-json-verdict) ·
> [Field rules](#field-rules) · [Markdown summary](#human-markdown-summary)

The evaluator emits ONE merged, confidence-labeled findings list. Two parts: the machine banner
(always) and the structured JSON verdict (the gateable artifact). A human-readable Markdown summary
may accompany it.

## The honest banner (MUST, verbatim)

Print this whether the run PASSES or FAILS — it is the seam that keeps a Layer-1 PASS from being
misread as design approval (plugin87 `gate.md`):

> These gates prove tokens/contrast/a11y/no-drift correctness. They do not prove taste.

## The merged JSON verdict

Shape from gnurio `meta-refactor-ui` (L80-106), extended with the two-layer + baseline fields:

```json
{
  "overall_score": "PASS | NEEDS_WORK | FAIL",
  "banner": "These gates prove tokens/contrast/a11y/no-drift correctness. They do not prove taste.",
  "layer1": "12/12",
  "layer1_failed": [],
  "baseline_key": "<merge-base-sha>",
  "summary": "0 layer-1 fails, 1 regressed, 2 high, 3 medium",
  "findings": [
    {
      "layer": 1,
      "confidence": "machine-certain",
      "rule": "verify_states:hover-contrast",
      "severity": "blocker",
      "location": "button.secondary",
      "evidence": "hover \"Cancel\" 2.91:1 (need 4.5) [rgb(255,255,255) on rgb(96,165,250)]",
      "baseline_class": "regressed"
    },
    {
      "layer": 2,
      "confidence": "advisory",
      "rule": "hierarchy:no-focal-point",
      "severity": "high",
      "location": "hero section",
      "evidence": "<screenshot-path> — three elements compete; the CTA does not win the squint test",
      "what_defaulted": "uniform weight + size across hero elements",
      "why": "no single focal point, so the screen reads as a generic template",
      "baseline_class": "new"
    }
  ],
  "priority_fixes": [
    "1. Restore the secondary-button hover contrast (regressed since branch point)",
    "2. Give the hero one focal point via weight + color, not size alone"
  ]
}
```

## Field rules

- `overall_score` is computed by the SKILL.md Decision Criteria — NOT chosen freely.
- `layer1` is `N/N`; `layer1_failed` lists the failing gate ids. If non-empty, `findings` contains
  ONLY layer-1 entries (Layer-2 did not run) and `overall_score` is `FAIL`.
- Every finding MUST have `confidence`: `machine-certain` (layer 1) or `advisory` (layer 2). No
  unlabeled findings.
- Layer-2 findings carry `what_defaulted` + `why`; they MUST NOT contain a CSS value (prescriptions
  go to `pixelhelm-repair`). `evidence` for visual findings includes a screenshot path.
- `baseline_class` ∈ `new | persistent | fixed | regressed`. A `regressed` finding is forced to
  `severity: blocker`.
- Suppress `persistent` PASSES; report only what is New/Regressed/still-open.

## Human Markdown summary

Optional companion (OneRedOak report structure): a positive opening, then findings grouped under
Blockers / High-Priority / Medium-Priority / Nitpicks, each "problem + screenshot." End with the
banner and the computed verdict. Never end with "looks great / approved to ship" on a Layer-1 PASS
without the banner — that violates the seam rule.
