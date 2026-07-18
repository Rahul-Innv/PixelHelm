"""
Offline gate-proof for the DESIGN adapter: proves the pipeline + the over-association catch +
contestation + abstain + flag-only-vs-strict-drop, end to end. No network, no API — deterministic stubs.

Run:  cd .../frontend-design-skill/storm  &&  python demo_offline.py
"""
from design_adapter import stubs
from design_adapter.framework import DesignFramework
from design_adapter.gate import DesignGate
from design_adapter.provider import StormDesignProvider
from storm_engine.writer import assert_no_unsurfaced_inference


def show(brief, mode):
    print(f"\n===== DESIGN BRIEF ({mode}) : {brief['subject']} =====")
    for s in brief["sections"]:
        flag = " CONTESTED" if s["contested"] else ""
        print(f"[{s['lens']}] status={s['status']} conf={s['confidence']}{flag}")
        for r in s["recommendations"]:
            mark = f"  [FLAGGED:{r['verdict']}]" if r["flagged"] else ""
            print("   -", r["text"][:78], mark)
        for rk in s.get("risks", []):
            print("   ! risk:", rk["text"][:74])
    if brief["abstained"]:
        print(" abstained lenses:", brief["abstained"])


def build(strict_drop):
    fw = DesignFramework()
    gate = DesignGate(stubs.StubVerify())  # corroborate=False -> 2-tier gate (spec default for design)
    return StormDesignProvider(
        framework=fw, retrieval=stubs.StubRetrieval(), interrogator=stubs.StubInterrogator(),
        expert=stubs.StubExpert(), surfacer=stubs.StubSurfacer(), gate=gate,
        strict_drop=strict_drop)


subject = {"name": "TestApp Today", "description": "A mobile dashboard; primary job = log an item fast."}

print("### FLAG-ONLY (default - judge unmeasured, nothing silently deleted) ###")
flag = build(strict_drop=False).brief(subject)
show(flag, "flag-only")

print("\n### STRICT-DROP (only after the judge earns it on a gold set) ###")
strict = build(strict_drop=True).brief(subject)
show(strict, "strict-drop")

# section lookups
def sect(brief, lens):
    return next((s for s in brief["sections"] if s["lens"] == lens), None)

acc_flag = sect(flag, "accessibility")
perf_flag = sect(flag, "performance")
conv_flag = sect(flag, "conversion_ux")
conv_strict = sect(strict, "conversion_ux")

leap_text = "therefore the design has fundamentally poor conversion"
leap_rec = next((r for r in (conv_flag["recommendations"] if conv_flag else []) if leap_text in r["text"]), None)

print("\n--- GATE-PROOF ASSERTIONS ---")
print(" accessibility filled + a supported finding present? ",
      bool(acc_flag) and acc_flag["status"] == "filled" and len(acc_flag["recommendations"]) >= 1)
print(" accessibility contested by the refuter?             ",
      bool(acc_flag) and acc_flag["contested"], "-> conf", acc_flag and acc_flag["confidence"])
print(" performance abstains (insufficient_evidence)?        ",
      perf_flag["status"] if perf_flag else "absent")
print(" over-association leap KEPT + FLAGGED in flag-only?   ",
      bool(leap_rec) and leap_rec["flagged"] is True, "-> verdict", leap_rec and leap_rec["verdict"])
print(" ...and DROPPED from the strict-drop body?            ",
      bool(conv_strict) and not any(leap_text in r["text"] for r in conv_strict["recommendations"]))
print(" brief is flag-only (strict-drop not assumed)?        ", flag["flag_only"] is True)

# anti-evasion: a leap left in prose with NO surfaced claim must be flagged
class _NoSurface:
    def detect(self, b): return stubs.StubSurfacer().detect(b)
    def surface(self, *a, **k): return []

leak = "The nav is hidden, therefore users cannot find settings."
missing = assert_no_unsurfaced_inference(leak, [], _NoSurface())
print(" anti-evasion: unsurfaced leap detected?              ", bool(missing), missing)

# overall PASS gate
ok = (
    acc_flag and acc_flag["status"] == "filled" and acc_flag["contested"]
    and perf_flag and perf_flag["status"] == "insufficient_evidence"
    and leap_rec and leap_rec["flagged"] is True
    and conv_strict and not any(leap_text in r["text"] for r in conv_strict["recommendations"])
    and flag["flag_only"] is True
    and bool(missing)
)
print("\nRESULT:", "PASS - design adapter drives the engine end to end." if ok else "FAIL - see assertions above.")
import sys
sys.exit(0 if ok else 1)
