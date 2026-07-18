# pixelhelm

The Python-side distribution of **PixelHelm**, the frontend-design capability
family. It ships the portable, offline-capable **verified-evidence-brief
engine** and PixelHelm's **design adapter**: given a design subject and a
source corpus, non-overlapping perspectives interrogate it, an expert answers
grounded only in fetched sources, every load-bearing inference is surfaced as
a typed claim, each claim is verified at the claim level, and the output is a
cited, confidence-labeled design **brief** that abstains honestly when
evidence is thin. It produces briefs, not UI.

## Install

```
pip install pixelhelm          # offline engine + adapter (standard library only)
pip install pixelhelm[live]    # optional live model adapter
```

## Use

```python
from pixelhelm import (
    DesignFramework, DesignRetrieval, DesignGate, DesignVerify,
    DesignInterrogator, DesignExpert, DesignInferenceSurfacer,
    DesignLLM, Ledger, StormDesignProvider,
)
```

The deterministic offline stubs (no network, no credentials) are in
`design_adapter.stubs`; the live path uses the optional `anthropic` dependency
and standard SDK credential resolution.

## Scope

This package contains exactly the PixelHelm functionality that runs standalone:
the engine packages `storm_engine` (imported verbatim from its upstream
project) and `design_adapter`, re-exported under `pixelhelm`. The Claude Code
plugin editions, the deterministic eval suite, and the ChoiceGate admission
consumer live in the PixelHelm repository because they require the repository
tree or externally accepted local roots.

MIT licensed. Built by Rahul Krishna.
