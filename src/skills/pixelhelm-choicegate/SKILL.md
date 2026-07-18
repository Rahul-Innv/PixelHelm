---
name: pixelhelm-choicegate
description: Verify and consume one complete ChoiceGate continuation that explicitly selects the canonical frontend-design route for PixelHelm on Claude Code. Use at the trust boundary before any PixelHelm routing or leaf work. Do not use with a bare receipt, Codex surface, setup/browser route, bundle, stale authority, or inferred ChoiceGate checkout.
---

# Admit one ChoiceGate decision

Run `scripts/admit_choicegate.py --choicegate-root <exact-local-root> <request-or->`.
The caller must supply the exact accepted local ChoiceGate worktree and the complete
continuation request containing its original selection receipt. The verifier performs
no discovery, installation, activation, provider call, or write.

Proceed only when the deterministic admission says `admitted: true`, family is
`pixelhelm-family`, edition is exactly `pixelhelm-lite`, surface is `claude-code`, and
the returned task is the requested task. Preserve the admission and pins in downstream
evidence. Any failure is terminal for this route; return to ChoiceGate rather than
guessing or weakening a check.
