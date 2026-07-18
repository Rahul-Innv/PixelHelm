---
name: pixelhelm-tokens
description: Define or verify the canonical design-token module, schema, build-time drift guard, and cross-domain conformance tests. Use for token-system structure, theme wiring, or whole-contract verification. In Full, explicit color-role authoring belongs to pixelhelm-color. Do not use for freehand color suggestions or direct component styling.
---

# Maintain the token contract

Preserve one canonical token module and its human-readable contract. Semantic roles,
theme variants, and computed accessibility assertions must remain in lockstep. Report
raw-value drift and duplicate authority as failures; downstream skills consume tokens
and may not mint alternatives.
