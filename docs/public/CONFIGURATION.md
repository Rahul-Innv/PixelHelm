# Configuration applicability

PixelHelm has no single application runtime config that a repository forker must edit.
`build/build.config.json` is an internal deterministic build contract, while project
profiles are task inputs owned by the selected PixelHelm workflow. Adding a public JSON
Schema or new validator would therefore expand the product contract and is not part of
this readiness-gate pass.

The canonical public repository is
`https://gitlab.com/krahul02004/PixelHelm`. `build/build.config.json`, the family
manifests, generated plugin manifests, and Python package metadata bind that exact URL;
the family status is `confirmed-public`. This source binding records project identity
only and grants no authority to mutate GitLab settings, publish a package, or activate a
plugin.

A versioned profile schema remains a separately reviewed roadmap item.
