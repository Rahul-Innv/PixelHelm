# The four exit tests

Every candidate must clear these. They are the falsifiable core of "is this an
intentional design or a default?" Source: Dammyjay93 interface-design (the Swap /
Squint / Signature / Token tests), reinforced by Anthropic frontend-design's
"work through a similar prompt and see if you arrive somewhere similar".

The bar all four serve, stated as one falsifiable test:

> **If another AI, given a similar prompt, would produce substantially the same
> output, the design has failed.**

Run each test from the lens currently judging (a Craft read of the Squint test is
about hierarchy; a Spool read of it is about findability). Record a plain
pass/fail plus one line of evidence per test, per candidate.

---

## 1. Swap test

Mentally swap the typeface and layout for the category defaults (system font,
generic grid). **If nothing meaningful changes, the design defaulted.** A
distinctive design breaks when you remove its specific choices; a generic one is
unchanged because it never made any.

- **Pass:** the design loses its identity when swapped — the choices were load-bearing.
- **Fail:** swapping to defaults leaves essentially the same page.

## 2. Squint test

Blur the render (squint, or actually look at a downscaled/blurred view). **Does the
visual hierarchy survive?** The most important thing should still dominate; the
structure should still route the eye.

- **Pass:** one clear focal point and a legible structure survive the blur.
- **Fail:** a flat, even field — no focal point, monotone weight, everything the
  same size. This is the strongest single tell of slop.

## 3. Signature test

Point to **five concrete elements that express THIS subject's world** — its
materials, vocabulary, artifacts, the page's actual job. Not five nice elements:
five that could only belong to this product.

- **Pass:** five subject-specific elements are nameable.
- **Fail:** the memorable elements are generic (a big number with a small label, a
  gradient accent, numbered 01/02/03 markers used where the content isn't actually a
  sequence). Decoration that would fit any product is not a signature.

## 4. Token test

Read the CSS variable / token NAMES. **`--ink` and `--canvas` evoke a world;
`--gray-700` and `--surface-2` evoke a template.** Token names are where intent
leaks even when the pixels look fine.

- **Pass:** token names come from the subject's vocabulary and the brand system.
- **Fail:** purely systemic/generic names with no connection to the brief.
- **Note:** this reads NAMES for intent. The separate question of whether colors ARE
  tokens (vs raw hex) is `design-evaluate` Layer-1's machine gate — don't conflate.

---

## Using the results

- A candidate failing the Squint test (no hierarchy) is almost always the weakest —
  weight it heavily.
- Two or more fails across these tests is a strong signal a direction "defaulted"
  and should lose the tournament, UNLESS the false-positive filter applies (a
  motivated minimal direction can intentionally look quiet — verify it's a choice,
  not an absence).
- The exit tests inform the lenses' verdicts; they do NOT produce a score. Report
  them as pass/fail evidence inside each lens's prose verdict.
