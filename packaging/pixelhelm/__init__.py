"""pixelhelm — the Python-side PixelHelm distribution.

Ships the portable, offline-capable verified-evidence-brief engine
(``pixelhelm.storm_engine``, imported verbatim from its upstream project) and
PixelHelm's design adapter (``pixelhelm.design_adapter``). Together they
produce grounded, cited, claim-verified design briefs with honest abstains.
Live model calls are optional (``pip install pixelhelm[live]``); the
deterministic offline stubs run with the standard library only.

The Claude Code plugin editions, the eval suite, and the ChoiceGate admission
consumer live in the PixelHelm repository, not in this distribution, because
they require the repository tree or externally accepted local roots.
"""

__version__ = "0.1.2"

from .design_adapter import (
    DesignExpert,
    DesignFramework,
    DesignGate,
    DesignInferenceSurfacer,
    DesignInterrogator,
    DesignLLM,
    DesignRetrieval,
    DesignVerify,
    Ledger,
    StormDesignProvider,
)

__all__ = [
    "DesignExpert",
    "DesignFramework",
    "DesignGate",
    "DesignInferenceSurfacer",
    "DesignInterrogator",
    "DesignLLM",
    "DesignRetrieval",
    "DesignVerify",
    "Ledger",
    "StormDesignProvider",
    "__version__",
]
