# PixelHelm 2.0.0 private release candidate

## Version decision

`2.0.0` is the correct next candidate because canonical plugin and skill identities
moved from `design-*` to the atomic `pixelhelm-*` family and edition names changed to
`pixelhelm-lite` and `pixelhelm-full`. Explicit compatibility aliases reduce migration
risk but do not erase the breaking canonical-identity change.

The build config, marketplace inventory, both generated plugin manifests, and changelog
must agree on `2.0.0`. The canonical GitLab URL remains owner-required, so generated
plugin manifests omit `homepage` and changelog compare links remain absent.

## Distribution

The release candidate contains two directory-loaded Claude Code plugins and the
`pixelhelm` Python distribution (`0.1.0`), which packages the standalone
evidence-brief engine and design adapter from the generated Full edition. It is not an
npm, Cargo, or gem publication candidate. Deterministic generation, exact file
inventory, plugin validation, `python -m build`, `twine check`, and Git-free replay
are the applicable offline package dry run. No PyPI upload is performed or claimed.

## Deliberately not performed

No tag exists or is created by this lane. There is no push, host Release, remote/API
read, registry lookup, authentication, marketplace action, live installation,
publication, or public verification. Those actions remain separate owner gates.
