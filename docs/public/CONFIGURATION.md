# Configuration applicability

PixelHelm has no single application runtime config that a repository forker must edit.
`build/build.config.json` is an internal deterministic build contract, while project
profiles are task inputs owned by the selected PixelHelm workflow. Adding a public JSON
Schema or new validator would therefore expand the product contract and is not part of
this readiness-gate pass.

The current candidate keeps the canonical repository URL as JSON `null` with
`repository_url_status: owner-confirmation-required`. Generated plugin manifests omit
`homepage` until the owner confirms the exact GitLab project URL. No local remote value
or legacy slug is treated as canonical evidence.

A versioned profile schema remains a separately reviewed roadmap item.
