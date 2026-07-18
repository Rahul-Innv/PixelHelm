"""design_adapter — the DESIGN adapter for the portable STORM research engine.

Implements the engine's 3 Protocols + 3 injected LLM roles so STORM produces a VERIFIED DESIGN BRIEF
(grounded, cited recommendations with confidence + honest abstains), NOT UI. The skill turns the brief
into pixels as a separate step. Engine (storm_engine/) is copied verbatim and never modified — raise
engine bugs / contract changes to the upstream engine project, don't fork.
"""
from .framework import DesignFramework
from .retrieval import DesignRetrieval
from .gate import DesignGate, DesignVerify
from .roles import DesignInterrogator, DesignExpert, DesignInferenceSurfacer
from .llm import DesignLLM, Ledger
from .provider import StormDesignProvider

__all__ = [
    "DesignFramework", "DesignRetrieval", "DesignGate", "DesignVerify",
    "DesignInterrogator", "DesignExpert", "DesignInferenceSurfacer",
    "DesignLLM", "Ledger", "StormDesignProvider",
]
