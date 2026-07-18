# Dependencies and runtime boundaries

## Core local qualification

- Node.js 22 for deterministic plugin generation and JavaScript syntax checks.
- Python 3.12 for the atomic-family, ChoiceGate-boundary, and offline evidence-engine
  checks.
- Git for exact tree, blob, diff, and worktree evidence.

The core qualification installs nothing and needs no network access.

## Optional selected-edition runtime

`pixelhelm-render` declares Playwright and axe-core. They are required only for real
browser rendering and accessibility checks after one exact edition is selected and
approved through the lifecycle. The repository intentionally does not commit generated
lockfiles from an unqualified installation.

The Full edition's evidence-brief engine uses Python's standard library for its offline
demo. Live provider adapters are not exercised, configured, authenticated, or claimed by
this candidate.

## Hosted CI caveat

The GitLab CI definition names external floating Node and Python container images. Its
scripts contain no deployment, publication, provider, registry, marketplace, or remote-
write commands, but a hosted runner may resolve those images over the network. Hosted CI
has not been run or verified by this local lane.
