"""
run_live.py — the PAID/live smoke test for the design STORM adapter (Task 2 of the resume plan).

Drives the REAL roles + gate + judge through provider.brief() against a REAL subject, grounded in the
real local design corpus (design KB + WCAG + the project's reference notes). NOT offline — this makes
Anthropic API calls. Bounded on purpose (k_runs=2, max_turns=1) so one run is cheap.

Auth: a bare anthropic.Anthropic() auto-resolves an `ant auth login` OAuth profile when no
ANTHROPIC_API_KEY shadows it (claude-api skill, 2026-07). OAuth on /v1/messages may need the
`anthropic-beta: oauth-2025-04-20` header — we probe bare first, then fall back to the beta header, then
give up with a precise diagnostic (an API workspace with $0 credits surfaces as a billing error at the
probe rather than burning a full run).

Usage:
    cd <this storm/ dir>
    python run_live.py                # the bundled demo subject, k_runs=2, max_turns=1
    python run_live.py --k 1 --turns 1  # cheaper/fuller (no self-consistency requirement)

Re-target: edit SUBJECT below (name + a data-explicit description of the surface, its register, and its
current UI) and add your project's reference/brief files to the `extra` corpus list — the retrieval
skips missing files gracefully.
"""
from __future__ import annotations

import json
import os
import sys

from design_adapter import (
    DesignFramework, DesignRetrieval, DesignGate, DesignVerify,
    DesignInterrogator, DesignExpert, DesignInferenceSurfacer,
    DesignLLM, Ledger, StormDesignProvider,
)

HERE = os.path.dirname(os.path.abspath(__file__))


def parse_args(argv):
    k, turns = 2, 1
    for i, a in enumerate(argv):
        if a == "--k" and i + 1 < len(argv):
            k = int(argv[i + 1])
        if a == "--turns" and i + 1 < len(argv):
            turns = int(argv[i + 1])
    return k, turns


# ---- 1. AUTH PROBE (cheapest possible: ~4 output tokens) --------------------------------------------
def make_client():
    import anthropic
    if os.environ.get("ANTHROPIC_API_KEY"):
        print("  note: ANTHROPIC_API_KEY is set — it takes precedence over any ant OAuth profile.")

    def _probe(client):
        r = client.messages.create(model="claude-opus-4-8", max_tokens=4,
                                   messages=[{"role": "user", "content": "ok"}])
        return getattr(r, "model", "?")

    attempts = [
        ("bare Anthropic()", lambda: anthropic.Anthropic()),
        ("Anthropic(+oauth-2025-04-20 beta header)",
         lambda: anthropic.Anthropic(default_headers={"anthropic-beta": "oauth-2025-04-20"})),
    ]
    errors = []
    for label, ctor in attempts:
        try:
            c = ctor()
            model = _probe(c)
            print(f"  AUTH OK via {label} -> model={model}")
            return c
        except Exception as e:  # noqa: BLE001 — we want the exact class + message + request id
            status = getattr(e, "status_code", None)
            rid = getattr(e, "request_id", None)
            errors.append(f"    [{label}] {type(e).__name__} status={status} rid={rid}: {str(e)[:300]}")
    print("  AUTH FAILED on all attempts:")
    print("\n".join(errors))
    return None


def main():
    k_runs, max_turns = parse_args(sys.argv[1:])
    print(f"### DESIGN STORM — LIVE SMOKE TEST (k_runs={k_runs}, max_turns={max_turns}) ###\n")
    print("Probing auth (opus-4-8, 4 tokens)...")
    client = make_client()
    if client is None:
        print("\nRESULT: BLOCKED on auth. Fix credentials (ANTHROPIC_API_KEY or `ant auth login`) "
              "and retry, or run the free subagent path. No paid run was attempted.")
        return 2

    # ---- 2. shared client + ledger; sonnet roles, opus judge ---------------------------------------
    ledger = Ledger()
    conv = DesignLLM("sonnet", ledger=ledger, client=client)   # interrogator + expert + surfacer
    judge = DesignLLM("opus", ledger=ledger, client=client)     # entailment judge (keep it strong)

    # ---- 3. retrieval over the local design corpus (+ your project's own notes) --------------------
    # Add your project's reference/brief files here; missing files are skipped gracefully.
    extra = []
    for path, channel, title, tags in [
        # (os.path.join("<your-project>", ".design", "references.md"), "reference",
        #  "<project> north-stars", "reference ui inspiration <comparables>"),
    ]:
        if os.path.exists(path):
            extra.append({"url": path, "channel": channel, "title": title, "tags": tags})
            print(f"  corpus += {os.path.basename(path)} ({channel})")
    retrieval = DesignRetrieval.default_design_kb(extra=extra)

    # ---- 4. the subject under review (the bundled demo — replace with YOUR surface) ----------------
    subject = {
        "name": "Harborline status board",
        "description": (
            "The public status page of a municipal bike-share network. "
            "PRIMARY JOB: at a glance — is my station usable right now, and is the network healthy. "
            "REGISTER (locked, do not homogenize): civic-utility calm — transit-signage legibility, "
            "quiet high-contrast ink-on-paper, zero marketing gloss, color spent ONLY on status "
            "semantics plus one teal accent, honest about data gaps (unknown is unknown, never zero). "
            "CURRENT UI: a network verdict line (bikes/docks with a reporting-stations-only "
            "qualifier), two alert notices, a 12-row station table with status pills and last-report "
            "timestamps (three stations show UNKNOWN, not stale counts), a 7-day ridership bar row "
            "with one labeled no-data gap and one labeled estimate, a sample-data footer. "
            "STATES: normal, degraded telemetry (some stations dark), station closed for maintenance. "
            "The current design has survived a blind register panel; the loop must not regress its "
            "plainness."
        ),
    }
    print(f"\nSubject: {subject['name']}\n")

    prov = StormDesignProvider(
        framework=DesignFramework(),
        retrieval=retrieval,
        interrogator=DesignInterrogator(conv),
        expert=DesignExpert(conv, subject),
        surfacer=DesignInferenceSurfacer(conv),
        gate=DesignGate(DesignVerify(judge, retrieval.read)),  # judge re-reads the cited local file
        k_runs=k_runs, max_turns=max_turns, strict_drop=False,  # FLAG-ONLY (spec default)
    )

    # ---- 5. run + inspect --------------------------------------------------------------------------
    try:
        brief = prov.brief(subject)
    except Exception as e:  # noqa: BLE001
        status = getattr(e, "status_code", None)
        print(f"\nRESULT: FAILED mid-run: {type(e).__name__} status={status}: {str(e)[:400]}")
        print("Partial cost ledger:", json.dumps(ledger.summary(), indent=2))
        return 1

    print("\n===== VERIFIED DESIGN BRIEF =====")
    print(f"subject={brief['subject']}  framework={brief['framework_id']}  flag_only={brief['flag_only']}")
    for s in brief["sections"]:
        flag = " CONTESTED" if s["contested"] else ""
        print(f"\n[{s['lens']}] status={s['status']} conf={s['confidence']}{flag}")
        if s["headline"]:
            print(f"   headline: {s['headline']}")
        for r in s["recommendations"]:
            mark = f"  <FLAGGED:{r['verdict']}>" if r["flagged"] else ""
            print(f"   - ({r['kind']}) {r['text'][:110]}{mark}")
        for rk in s.get("risks", []):
            print(f"   ! risk: {rk['text'][:100]}")
        cits = s.get("citations", [])
        if cits:
            srcs = sorted({os.path.basename(c.get("url") or "") for c in cits})
            print(f"   cited: {', '.join(srcs)}")
    if brief["abstained"]:
        print(f"\nabstained lenses: {brief['abstained']}")
    if brief.get("evasions"):
        print(f"anti-evasion flags: {len(brief['evasions'])}")

    print("\n===== COST LEDGER =====")
    print(json.dumps(ledger.summary(), indent=2))

    # ---- 6. archive-first (survivable) -------------------------------------------------------------
    out = os.path.join(HERE, "live-brief-demo.json")
    with open(out, "w", encoding="utf-8") as fh:
        json.dump({"brief": brief, "ledger": ledger.summary(),
                   "config": {"k_runs": k_runs, "max_turns": max_turns}}, fh, indent=2)
    print(f"\nsaved -> {out}")
    filled = sum(1 for s in brief["sections"] if s["status"] == "filled")
    print(f"\nRESULT: PASS — live path ran end to end. {filled}/{len(brief['sections'])} lenses filled, "
          f"{len(brief['abstained'])} abstained, ${ledger.summary()['usd']} spent.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
