# Contributing to PixelHelm

PixelHelm is currently a private candidate. Contributions must preserve its atomic
ownership, fail-closed authority boundary, edition exclusivity, and offline evidence
contract.

## Before editing

1. Work from an isolated branch or worktree.
2. Do not hand-edit `plugins/pixelhelm-lite/` or `plugins/pixelhelm-full/`; edit `src/`
   or `build/overlays/`, then regenerate with `node build/build.mjs`.
3. Do not add credentials, private paths, provider calls, remote writes, or hidden
   network dependencies.
4. Keep one skill responsible for one independently measurable outcome. Compatibility
   aliases are metadata, not second owners.

## Validate locally

```powershell
node build/build.mjs --check
python -B evals/pixelhelm/run_tests.py
python -B plugins/pixelhelm-full/skills/pixelhelm-evidence-brief/storm/demo_offline.py
```

Changes to ChoiceGate admission must also run the full suite with explicit accepted
ChoiceGate and capability inventory roots. Changes to a skill require its focused validator and a
positive, near-miss, and collision fixture where applicable.

## Merge-request checklist

- Explain the owned outcome and non-goals.
- List exact changed paths and any generated files.
- Include deterministic commands, exit codes, and an untouched-base comparison.
- Confirm no secret, remote, provider, marketplace, publication, or live-skill action.
- Freeze exact bytes for a reviewer who did not produce the change.

Report security concerns privately as described in [SECURITY.md](SECURITY.md), not in
a public issue.
