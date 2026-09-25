# PixelHelm release state

Verified against the public GitLab project and PyPI on 2026-09-25:

- The plugin family declares `2.1.1`. GitLab has the `v2.1.1` tag and Release.
  Version `2.1.0` was withdrawn in practice after conflict markers shipped in a
  plugin loop skill.
- The standalone Python distribution declares `0.1.2`. PyPI publishes
  [`pixelhelm` 0.1.2](https://pypi.org/project/pixelhelm/), and GitLab has the
  `v0.1.2` tag and Release.
- These are separate version lines. The 2.1.x plugin cuts did not change the
  Python package. The plugin editions load from this repository's self-hosted
  marketplace; no external marketplace activation is claimed.

The tags identify release source commits. Matching version numbers do not by
themselves prove byte-for-byte provenance of a published Python artifact.
Further tags, publication, or marketplace activation require a separate owner
decision and qualification of the exact source.
