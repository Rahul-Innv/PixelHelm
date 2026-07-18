# Running pixelhelm-evidence-brief — auth, cost, corpus, re-targeting

The engine + adapter ship at `${CLAUDE_PLUGIN_ROOT}/skills/pixelhelm-evidence-brief/storm/`. Everything below runs
from that `storm/` directory. (`storm_engine/` is a verbatim MIRROR of its upstream project — never edit
it here; the owner's dev workspace holds the sync source and a one-line robocopy refresh:
`robocopy <kb>/storm <plugin>/skills/pixelhelm-evidence-brief/storm /E /XD __pycache__ /XF "live-brief-*.json"`.)

## Offline first (no network, free)

```
cd "${CLAUDE_PLUGIN_ROOT}/skills/pixelhelm-evidence-brief/storm"
python -m compileall storm_engine design_adapter    # both compile clean
python demo_offline.py                               # exits 0 on PASS (deterministic stubs)
python demo_live_shape.py                            # exits 0 on PASS (real roles via a fake client)
```

`demo_offline.py` proves the pipeline (over-association surfaced AND caught, a lens abstains, the refuter
contests + floors, flag-only keeps vs strict-drop drops). `demo_live_shape.py` drives the REAL roles/gate
through a deterministic fake Anthropic client — it covers the live code paths without spending tokens. Run
both after any adapter edit.

## Live run (paid)

```
cd "${CLAUDE_PLUGIN_ROOT}/skills/pixelhelm-evidence-brief/storm"
python run_live.py                # the bundled demo subject, k_runs=2, max_turns=1  (bounded)
python run_live.py --k 1 --turns 1   # cheaper + fuller (no self-consistency requirement)
```

`run_live.py` probes auth cheaply (≈4 tokens on opus) BEFORE any full run, builds sonnet roles + an opus
judge sharing one `Ledger`, grounds on `DesignRetrieval.default_design_kb(extra=[…])`, runs
`prov.brief(subject)`, prints the brief + `ledger.summary()`, and archives to `live-brief-<subject>.json`.

### Auth

`DesignLLM` uses `anthropic.Anthropic()`, which resolves credentials in this order: `ANTHROPIC_API_KEY` →
`ANTHROPIC_AUTH_TOKEN` → an `ant auth login` profile. Facts (claude-api skill, 2026-07):

- A **bare `Anthropic()` works after `ant auth login`** — but only when **no `ANTHROPIC_API_KEY` is set**
  (a stale key silently shadows the profile). `ant auth status` shows which source wins.
- OAuth on `/v1/messages` needs the `anthropic-beta: oauth-2025-04-20` header; `run_live.py` retries with
  it if the bare probe fails.
- **Refresh tokens hard-expire.** A `WorkloadIdentityError 400 invalid_grant "Refresh token not found or
  invalid"` means the stored `ant` profile is stale — re-run `ant auth login`, or drop a funded
  `ANTHROPIC_API_KEY` in the environment. (The API *workspace* billing is separate from a Max
  subscription; a subscription-OAuth token bills the subscription, an API key bills the workspace.)

### Cost bounding

Cost ≈ (6 framework + basic-fact + refuter = 8 perspectives) × `k_runs` expert calls (sonnet) + surfacer
calls (sonnet) + one judge call (opus) per cited claim + anti-evasion detects. Levers:

- `k_runs=1` — trivially satisfies self-consistency (every claim's fraction = 1.0), so the brief is fuller
  and ~half the cost, but the self-consistency tier is not exercised. `k_runs=2` is the real config; on a
  live (reworded) LLM it can over-abstain (this is the engine's exact-recurrence limitation — coordination
  item #2). Start with `k_runs=2`; if it over-abstains, re-run `k_runs=1` for a fuller read and note both.
- `max_turns=1` — seed questions only, no LLM follow-ups (cheapest). Raise for deeper interrogation.
- Models: `sonnet` (roles) + `opus` (judge) is the default; `haiku` is cheaper but `effort` is gated OFF
  Haiku (the client already sets `effort=None` there). Keep the judge strong.

## Corpus / re-targeting a new subject

The corpus is **local files only** (design KB + WCAG + design-system + reference notes) — confidential
research, no web. `DesignRetrieval.default_design_kb()` already loads the KB (INDEX, LESSONS, tokens-and-AA,
email-constraints, direction-mockup). Add the project's docs via `extra=[{"url","channel","title","tags"}]`
(channels: `standard` > `kb` > `design_system` > `reference`, by authoritativeness). To retarget:

1. Edit the `subject` dict in `run_live.py` — `{"name","description"}` where the description states the
   job-to-be-done, the register (verbatim from the profile `_register`), the current UI, and its states.
2. Add the project's reference notes + DESIGN.md to `extra` (real, citeable files — silence ≠ absence, so
   a missing file is simply skipped).
3. Run offline shape check is not needed for a new subject (stubs are fixed); just run `run_live.py`.
