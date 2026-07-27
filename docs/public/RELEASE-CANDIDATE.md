# PixelHelm current public source and next-release boundary

## Version decision

The canonical GitLab project is public at
`https://gitlab.com/krahul02004/PixelHelm`. The plugin family declares `2.1.0`, cut
2026-07-27 for the plugin-side feature work of that cycle; the standalone Python
distribution source is unchanged at `0.1.2` and PyPI still serves `0.1.1`. These are
separate version lines, and the 2.1.0 cut deliberately carries no Python release
because no Python-package surface changed. No source tag or GitLab Release provenance
is claimed for the existing PyPI artifact. A further plugin release must choose a
version newer than 2.1.0. The reviewed Python 0.1.2 commit must be merged
and its artifacts independently verified before any tag or publication action.

## Distribution

The repository contains two directory-loaded Claude Code plugins and the
prepared `pixelhelm` Python distribution source (`0.1.2`), which packages the standalone
evidence-brief engine and design adapter from the generated Full edition. It is not an
npm, Cargo, or gem publication candidate. Deterministic generation, exact file
inventory, plugin validation, `python -m build`, `twine check`, and Git-free replay
are the applicable offline package dry run. The existing PyPI publication is recorded
as public state; no new upload is authorized by this source candidate.

## Deliberately not performed

This preparation creates no tag, GitLab Release, settings change, marketplace action,
live installation, or new publication. The 0.1.2 tag, Release, and package publication,
plus all plugin activation and settings changes, remain separate owner gates.
