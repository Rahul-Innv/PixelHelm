# PixelHelm current public source and next-release boundary

## Version decision

The canonical GitLab project is public at
`https://gitlab.com/krahul02004/PixelHelm`. The plugin family currently declares
`2.0.0`, while the standalone Python distribution is published on PyPI as `0.1.1`.
These are separate version lines. No source tag or GitLab Release provenance is claimed
for the PyPI artifact. Current changes remain Unreleased; a future plugin release must
choose a version newer than 2.0.0, and a future Python release must choose a version
newer than 0.1.1, before any tag or publication action.

## Distribution

The repository contains two directory-loaded Claude Code plugins and the
published `pixelhelm` Python distribution source (`0.1.1`), which packages the standalone
evidence-brief engine and design adapter from the generated Full edition. It is not an
npm, Cargo, or gem publication candidate. Deterministic generation, exact file
inventory, plugin validation, `python -m build`, `twine check`, and Git-free replay
are the applicable offline package dry run. The existing PyPI publication is recorded
as public state; no new upload is authorized by this source candidate.

## Deliberately not performed

This remediation creates no tag, GitLab Release, settings change, marketplace action,
live installation, or new publication. Read-only GitLab and PyPI checks establish the
current public state but authorize no mutation. Future tags, Releases, settings changes,
plugin activation, and package publication remain separate owner gates.
