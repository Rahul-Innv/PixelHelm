"""
design_adapter/llm.py — the model-configurable Anthropic client for the design STORM adapter.

Mirrors the upstream reference adapter's LiveLLM shape (one client owns SDK + auth + per-role
model selection + a token/USD ledger) so every role (interrogator / expert / surfacer / judge) is a
thin prompt over the same client. NOT a copy of the engine — this is adapter code the design project
owns; the engine stays untouched.

API surface confirmed against the claude-api skill (2026-07):
  - model ids: opus=claude-opus-4-8, sonnet=claude-sonnet-4-6, haiku=claude-haiku-4-5
  - structured output: output_config={"format": {"type": "json_schema", "schema": SCHEMA}}
  - effort: output_config={"effort": ...} — GATED per model (Haiku 4.5 rejects it, so effort=None there)
Auth = anthropic.Anthropic() resolving ANTHROPIC_API_KEY / ANTHROPIC_AUTH_TOKEN / `ant auth login`.
A deterministic stub client (see stubs.py / demo_offline.py) drives the offline proofs — no network.
"""
from __future__ import annotations

import json
from dataclasses import dataclass, field

# pricing per 1M tokens (input, output); effort=None means the model rejects the effort param (Haiku 4.5).
MODELS = {
    "haiku":  {"id": "claude-haiku-4-5",  "in": 1.0, "out": 5.0,  "effort": None},
    "sonnet": {"id": "claude-sonnet-4-6", "in": 3.0, "out": 15.0, "effort": "medium"},
    "opus":   {"id": "claude-opus-4-8",   "in": 5.0, "out": 25.0, "effort": "high"},
}


@dataclass
class Ledger:
    """Token + USD accounting across every call (cache reads ~0.1x in, writes ~1.25x in)."""
    calls: int = 0
    in_tok: int = 0
    out_tok: int = 0
    cache_read: int = 0
    cache_write: int = 0
    by_model: dict = field(default_factory=dict)
    usd: float = 0.0

    def add(self, model_key: str, usage) -> None:
        m = MODELS[model_key]
        it = getattr(usage, "input_tokens", 0) or 0
        ot = getattr(usage, "output_tokens", 0) or 0
        cr = getattr(usage, "cache_read_input_tokens", 0) or 0
        cw = getattr(usage, "cache_creation_input_tokens", 0) or 0
        cost = (it * m["in"] + ot * m["out"] + cr * m["in"] * 0.1 + cw * m["in"] * 1.25) / 1_000_000
        self.calls += 1
        self.in_tok += it
        self.out_tok += ot
        self.cache_read += cr
        self.cache_write += cw
        self.usd += cost
        b = self.by_model.setdefault(model_key, {"calls": 0, "in": 0, "out": 0, "usd": 0.0})
        b["calls"] += 1
        b["in"] += it
        b["out"] += ot
        b["usd"] += cost

    def summary(self) -> dict:
        return {"calls": self.calls, "in_tok": self.in_tok, "out_tok": self.out_tok,
                "cache_read": self.cache_read, "usd": round(self.usd, 4),
                "by_model": {k: {**v, "usd": round(v["usd"], 4)} for k, v in self.by_model.items()}}


class DesignLLM:
    """A single Anthropic client bound to one model role, sharing a Ledger across roles.

    `text()` returns plain text (the interrogator's follow-up question). `structured()` constrains
    output to a JSON schema (output_config.format) and returns the parsed dict — used by the expert's
    typed claims, the surfacer, and the judge verdict.
    """

    def __init__(self, model_key: str, *, ledger: "Ledger | None" = None, client=None, max_tokens: int = 1600):
        if model_key not in MODELS:
            raise ValueError(f"unknown model role {model_key!r}; choose from {list(MODELS)}")
        self.model_key = model_key
        self.model = MODELS[model_key]["id"]
        self.effort = MODELS[model_key]["effort"]
        self.ledger = ledger if ledger is not None else Ledger()
        self.max_tokens = max_tokens
        self._client = client  # injectable: a deterministic stub client for offline proofs

    # -- client / auth ------------------------------------------------------------------------------
    def _c(self):
        if self._client is None:
            import anthropic  # lazy: not needed on the offline stub path
            self._client = anthropic.Anthropic()  # resolves ANTHROPIC_API_KEY / OAuth profile
        return self._client

    def ping(self) -> str:
        """Cheapest possible auth probe — raises a clear error if credentials aren't resolvable."""
        r = self._c().messages.create(model=self.model, max_tokens=4,
                                      messages=[{"role": "user", "content": "ok"}])
        return getattr(r, "model", self.model)

    def _output_config(self, *, fmt=None) -> "dict | None":
        cfg = {}
        if fmt is not None:
            cfg["format"] = fmt
        if self.effort is not None:
            cfg["effort"] = self.effort  # gated: Haiku gets none (the param 400s there)
        return cfg or None

    # -- calls --------------------------------------------------------------------------------------
    def text(self, system: str, user: str, *, max_tokens: "int | None" = None) -> str:
        kw = {"model": self.model, "max_tokens": max_tokens or self.max_tokens,
              "system": system, "messages": [{"role": "user", "content": user}]}
        oc = self._output_config()
        if oc:
            kw["output_config"] = oc
        r = self._c().messages.create(**kw)
        self.ledger.add(self.model_key, r.usage)
        if getattr(r, "stop_reason", None) == "refusal":
            return ""
        return "".join(b.text for b in r.content if getattr(b, "type", None) == "text").strip()

    def structured(self, system: str, user: str, schema: dict, *, max_tokens: "int | None" = None) -> dict:
        kw = {"model": self.model, "max_tokens": max_tokens or self.max_tokens,
              "system": system, "messages": [{"role": "user", "content": user}],
              "output_config": self._output_config(fmt={"type": "json_schema", "schema": schema})}
        r = self._c().messages.create(**kw)
        self.ledger.add(self.model_key, r.usage)
        if getattr(r, "stop_reason", None) == "refusal":
            return {}
        text = next((b.text for b in r.content if getattr(b, "type", None) == "text"), "")
        try:
            return json.loads(text)
        except (ValueError, TypeError):
            return {}
