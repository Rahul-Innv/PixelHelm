"""
Live-shape proof (no network, no API): drives the REAL roles + gate + verify with a deterministic FAKE
Anthropic client + focused unit checks. Covers the LIVE paths the stub proof (demo_offline.py) bypasses,
and verifies the adversarial-review fixes:
  F1 basic-fact 'subject' section actually ships   F4 3-valued entailment (absent source -> 'unclear')
  F3 surfacer inherits the source stance           F5 same-text constructive+refuter don't collide
  F6 perspective.id == lens key (all framework)    + the real roles drive provider.brief() with no crash

Run:  cd .../frontend-design-skill/storm  &&  python demo_live_shape.py
"""
import json

from storm_engine.contracts import Claim
from storm_engine.perspective import design_perspectives
from storm_engine.writer import assert_no_unsurfaced_inference
from design_adapter.framework import DesignFramework
from design_adapter.roles import DesignInterrogator, DesignExpert, DesignInferenceSurfacer
from design_adapter.gate import DesignGate, DesignVerify
from design_adapter.retrieval import DesignRetrieval
from design_adapter.llm import DesignLLM
from design_adapter.provider import StormDesignProvider

results = {}


# ---- F6: perspective.id == lens key for every framework perspective (the alignment fix) --------------
ps = design_perspectives(DesignFramework())
fw = [p for p in ps.perspectives if p.kind == "framework"]
results["F6 perspective.id == lens key (all 6 framework perspectives)"] = (
    len(fw) == 6 and all(p.anchor_keys and p.id == p.anchor_keys[0] for p in fw))


# ---- F5: a constructive and a refuter claim with IDENTICAL text both survive self_consistency --------
def _mk(stance, text):
    return Claim(kind="evaluative", text=text,
                 citations=({"url": "kb://x", "supports": "fact", "channel": "standard"},),
                 perspective_id="p", anchor_keys=("accessibility",), stance=stance)

c_pos = _mk("constructive", "Body text fails WCAG AA contrast.")
c_neg = _mk("disconfirming", "Body text fails WCAG AA contrast.")  # identical text + citation
survivors = DesignGate(verify_provider=None).self_consistency([[c_pos, c_neg], [c_pos, c_neg]])
results["F5 same-text constructive+refuter both survive (no id collision)"] = (
    len(survivors) == 2 and {s.stance for s in survivors} == {"constructive", "disconfirming"})


# ---- F4: entailment on an ABSENT source -> 'unclear' (silence != absence), not 'unsupported' ---------
gate_absent = DesignGate(DesignVerify(llm=None, read_source=lambda u: None))  # reader returns None
v = gate_absent.entailment(_mk("constructive", "Some claim."))
results["F4 absent source -> 'unclear' (not 'unsupported')"] = (v.get("verdict") == "unclear")


# ---- F3: the surfacer inherits the disconfirming stance from the refuter's fact-claims ---------------
class _SurfLLM:
    def structured(self, system, user, schema, **kw):
        return {"inferences": [{"text": "Tiny targets therefore fail motor-impaired users.",
                                "relation": "therefore", "link_supported": False, "link_url": ""}]}

refuter_fact = Claim(kind="fact", text="Targets are 12px.",
                     citations=({"url": "kb://wcag", "supports": "fact", "channel": "standard"},),
                     perspective_id="refuter", anchor_keys=("accessibility",), stance="disconfirming")
rels = DesignInferenceSurfacer(_SurfLLM()).surface(
    "Targets are 12px, therefore they fail motor-impaired users.", [refuter_fact], perspective_id="refuter")
results["F3 surfacer inherits refuter's 'disconfirming' stance"] = (
    len(rels) == 1 and rels[0].stance == "disconfirming")


# ---- F1 + no-crash: the REAL roles drive provider.brief() via a deterministic fake Anthropic client --
class _Usage:
    input_tokens = 200
    output_tokens = 80
    cache_read_input_tokens = 0
    cache_creation_input_tokens = 0


class _Block:
    type = "text"

    def __init__(self, text):
        self.text = text


class _R:
    stop_reason = "end_turn"
    model = "fake"

    def __init__(self, text):
        self.content = [_Block(text)]
        self.usage = _Usage()


class _FakeMessages:
    def create(self, **kw):
        system = (kw.get("system") or "").lower()
        user = kw["messages"][0]["content"]
        oc = kw.get("output_config") or {}
        req = set((((oc.get("format") or {}).get("schema")) or {}).get("required", []))
        if not req:                                   # text() -> interrogator follow-up
            return _R("STOP")
        if req == {"verdict", "note"}:                # the judge
            return _R(json.dumps({"verdict": "supported", "note": "fake"}))
        if req == {"inferences"}:                     # surfacer.surface / detect
            return _R(json.dumps({"inferences": []}))
        # else: the expert (required includes answer + claims)
        if "desk researcher" in system:               # basic-fact baseline -> the 'subject' lens
            claims = [{"kind": "fact", "text": "TestApp is a mobile dashboard; primary job is logging an item.",
                       "evidence_urls": ["kb://wcag"], "anchor_keys": ["subject"], "rubric_anchor": ""}]
            return _R(json.dumps({"answer": "TestApp is a mobile logging dashboard.", "claims": claims}))
        if "accessibility" in system:
            claims = [{"kind": "evaluative", "text": "Body text is 3.9:1 - below WCAG 2.2 AA (4.5:1).",
                       "evidence_urls": ["kb://wcag"], "anchor_keys": ["accessibility"], "rubric_anchor": "wcag"}]
            return _R(json.dumps({"answer": "Contrast is 3.9:1.", "claims": claims}))
        return _R(json.dumps({"answer": "", "claims": []}))  # other lenses: no findings this run


class _FakeClient:
    def __init__(self):
        self.messages = _FakeMessages()


CORPUS = [
    {"url": "kb://wcag", "channel": "standard", "title": "WCAG contrast", "tags": "contrast aa 4.5 accessibility"},
    {"url": "kb://ia", "channel": "kb", "title": "IA principles", "tags": "navigation labeling hick findability"},
]
READ = {"kb://wcag": "WCAG 2.2 AA requires body text contrast of at least 4.5:1.",
        "kb://ia": "Group related items; label plainly (Hick's law)."}
retrieval = DesignRetrieval(CORPUS, read=lambda u: READ.get(u))

llm = DesignLLM("sonnet", client=_FakeClient())
judge = DesignLLM("opus", client=_FakeClient())
prov = StormDesignProvider(
    framework=DesignFramework(), retrieval=retrieval,
    interrogator=DesignInterrogator(llm),
    expert=DesignExpert(llm, {"name": "TestApp", "description": "mobile dashboard"}),
    surfacer=DesignInferenceSurfacer(llm),
    gate=DesignGate(DesignVerify(judge, retrieval.read)),
    k_runs=2, max_turns=1, strict_drop=False)
brief = prov.brief({"name": "TestApp"})

subj = next((s for s in brief["sections"] if s["lens"] == "subject"), None)
acc = next((s for s in brief["sections"] if s["lens"] == "accessibility"), None)
results["F1 basic-fact 'subject' section ships with a recommendation"] = (
    bool(subj) and subj["status"] == "filled" and len(subj["recommendations"]) >= 1)
results["live path: real roles -> provider.brief() no crash + accessibility filled"] = (
    isinstance(brief, dict) and "sections" in brief and bool(acc) and acc["status"] == "filled")

print("### LIVE-SHAPE PROOF (deterministic fake Anthropic client; no network) ###\n")
if subj:
    print("subject section:", [r["text"][:70] for r in subj["recommendations"]])
if acc:
    print("accessibility:", acc["status"], "conf", acc["confidence"],
          "->", [r["text"][:60] for r in acc["recommendations"]])
print("cost ledger:", llm.ledger.summary()["calls"], "conv calls +", judge.ledger.summary()["calls"], "judge calls\n")

for k, ok in results.items():
    print(f"  [{'OK' if ok else 'XX'}] {k}")

allok = all(results.values())
print("\nRESULT:", "PASS - live-path fixes verified on the real roles." if allok else "FAIL - see above.")
import sys
sys.exit(0 if allok else 1)
