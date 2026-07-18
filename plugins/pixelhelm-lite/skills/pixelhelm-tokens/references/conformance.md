# Conformance — assert the rendered DOM matches the tokens

Source: build-spec gap #1 ("the moat") + ruling C15 + Style Dictionary
`outputReferences`. This is the gap nobody in the ecosystem closes: every token
tool (DESIGN.md, Terrazzo, Style Dictionary, VoltAgent) stops at validating the
*spec*. **Validating a DESIGN.md or a tokens file is NOT conformance.** Conformance
is proving the BROWSER actually rendered the tokens.

## The claim

After render, read `getComputedStyle` on each token-bound element and assert:

```
computed value  ===  resolved token value   (within the sRGB rounding epsilon)
```

for color/background/border/typography properties that bind to a token. Plus run
axe on the REAL DOM (not a static snapshot). Read tokens at generation time AND
prove the browser rendered them — that round trip is the moat.

## The seam (do NOT re-author the scripts)

This skill OWNS the assertion CONTRACT; it does not run the browser or the gate.

- DOM + computed styles are captured by
  `${CLAUDE_PLUGIN_ROOT}/skills/pixelhelm-render/scripts/render.mjs`, whose
  `render()` returns `{ screenshotPath, domPath, a11yTreePath, computedStyles }`.
- The deterministic Layer-1 gate that SHIPS today is
  `${CLAUDE_PLUGIN_ROOT}/skills/pixelhelm-evaluate/scripts/static-gates.mjs`
  (all-or-nothing, exit 1 on any fail): it recomputes contrast for every gated
  token pair (both modes) from the token module / inlined profile values, walks the
  SOURCE for raw-color violations, and greps the profile's banned clusters.
- **The rendered-DOM computed-style compare described below is a designed but
  NOT-YET-SHIPPED extension** — no script currently harvests `getComputedStyle` and
  diffs it against resolved tokens. Until it exists, DOM-aware verification is the
  both-theme axe sweep (L-011); do not claim computed-style conformance was checked.

Reference scripts via `${CLAUDE_PLUGIN_ROOT}` — they live in their owning sibling
skill's `scripts/`. Never inject model-authored JS into a renderer; only a FIXED,
reviewed audit function may ever harvest computed styles (an arbitrary-code hole
otherwise).

## Resolving the expected value

The token module is the resolver. For a token-bound element:

1. Identify the token the element binds to (`--status-positive-bg`, etc.).
2. Resolve it through the module (following any `{group.token}` / alias refs to the
   primitive — mirror Style Dictionary `outputReferences` semantics).
3. Resolve per the element's active MODE (light/dark) and BRAND
   (`[data-brand]`) — conformance must check the mode/brand the page actually rendered.
4. Normalize both sides to sRGB and compare within epsilon.

## The epsilon

`getComputedStyle` returns `rgb()` values that have been parsed, gamut-mapped, and
rounded by the engine, so an exact string match is wrong. Compare numerically in
sRGB with an owner-set epsilon (default: ±1 per 0–255 channel for color; exact for
dimensions/weights). Set it in the gate config, not by loosening the comparison
ad-hoc. Default epsilon: ±1 per 0–255 sRGB channel; widen only with an owner-signed
reason recorded next to the config.

## What conformance does NOT prove

Conformance proves tokens/contrast/no-drift correctness end to end. It does NOT
prove taste — always print the honest banner: *these gates prove correctness, not
taste.* Taste is judged by `pixelhelm-judge` (Layer-2), which never overrides a
Layer-1 conformance FAIL, and a Layer-1 PASS is never "design approved".
