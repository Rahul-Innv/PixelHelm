# STATUS

PixelHelm `2.0.0` release candidate. This file is the authoritative statement of
what is and is not claimed; the README carries only the one-line summary.

## True today

- Public repository: [gitlab.com/krahul02004/PixelHelm](https://gitlab.com/krahul02004/PixelHelm).
  CI runs the deterministic offline checks (the build check plus the 19-test suite)
  on every push.
- PyPI: the standalone Python slice is published as
  [`pixelhelm` 0.1.1](https://pypi.org/project/pixelhelm/): the verified
  evidence-brief engine plus the design adapter, standard library only,
  offline-capable.
- The `0.1.0` packaging issue (installation placed three top-level packages:
  `pixelhelm`, `storm_engine`, and `design_adapter`, the latter two generic
  names that could shadow or collide with other distributions in the same
  environment) is fixed in `0.1.1`: the wheel installs exactly one top-level
  package, with the engine and adapter namespaced as `pixelhelm.storm_engine`
  and `pixelhelm.design_adapter`.
- The two Claude Code plugin editions are directory-loaded from this repository.
  They are not on PyPI and not on any plugin marketplace.

## Deliberately not claimed or performed

- Marketplace activation and live plugin installation remain separate, owner-gated
  lifecycle decisions; nothing in this repository claims them.
- Optional browser rendering dependencies (Playwright, axe-core) are installed only
  inside one exact selected edition after lifecycle approval; none of the README
  checks need them.
- Local proof is not public traction or hosted-behavior proof.

## Process record

The phase-by-phase readiness gates this repository passed before publication, and
the boundaries the candidate still enforces:

- [Readiness gates](docs/public/READINESS.md)
- [Offline validation contract](docs/public/VALIDATION.md)
- [Dependencies and runtime boundaries](docs/public/DEPENDENCIES.md)
- [Configuration applicability](docs/public/CONFIGURATION.md)
- [Release candidate](docs/public/RELEASE-CANDIDATE.md)
- [Owner-only outward handoff](docs/public/OWNER-HANDOFF.md)
- [Activation boundary](docs/authority-boundary.md)
- [Roadmap](ROADMAP.md)
