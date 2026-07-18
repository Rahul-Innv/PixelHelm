---
name: pixelhelm-repair
description: Apply the smallest bounded change that clears one specific validated UI finding, then request targeted rerender and reevaluation. Use only when a finding has evidence and an owned target path. Do not use for broad redesigns, speculative polish, or unrelated refactors.
---

# Repair one finding

Restate the finding, evidence, owned path, and pass condition. Change only what is
needed, preserving the register and token authority. Rerender the affected matrix and
rerun the relevant gates. If the repair expands scope or creates a product decision,
stop and return the unresolved choice.
