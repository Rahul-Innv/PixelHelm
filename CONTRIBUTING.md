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

## Evidence and claim discipline (method law)

Two rules, learned the hard way and now mandatory for every contribution:

1. **No artifact may describe a validation, judging, or adversarial pass as
   complete — in any tense, table, or checklist — before its output artifacts
   exist.** Anticipated results live in private notes, never in committed docs.
2. **Docs equal code.** A gate, validator, or mechanism may be described in the
   present tense only if the executable ships in this tree; designed-but-unwired
   behavior must be labeled SPEC / "not yet wired" at the point of description,
   not only in a status section elsewhere. Claims of scores or results carry
   their artifact paths, or they carry an explicit "attested, not committed"
   label.
