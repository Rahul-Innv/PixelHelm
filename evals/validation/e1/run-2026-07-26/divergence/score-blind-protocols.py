#!/usr/bin/env python3
"""Score the E2 blind protocols (e: intent, b: layout class, c: motif Jaccard)
from the committed raw judge outputs + the seeded blind map. Mechanical only."""
import json
from collections import Counter
from itertools import combinations
from pathlib import Path

base = Path(__file__).parent
m = json.load(open(base / "blind-map.json"))
judges = {k: json.load(open(base / "blind-judges" / f"judge-{k}.json")) for k in range(1, 6)}
out = {"metric": "E2 (e)/(b)/(c) blind protocols"}

correct, per_judge = 0, {}
for k in range(1, 6):
    jm = m["judges"][f"judge-{k}"]
    render_arm = {f"render-{i+1}": a for i, a in enumerate(jm["renderOrder"])}
    intent_arm = {f"intent-{i+1}": a for i, a in enumerate(jm["intentOrder"])}
    ok = all(render_arm[r] == intent_arm[i] for r, i in judges[k]["assignment"].items())
    per_judge[f"judge-{k}"] = ok
    correct += ok
out["e_blind_intent"] = {"fullyCorrectJudges": correct, "of": 5, "thresholdRegistered": 3,
                        "pass": correct >= 3, "perJudge": per_judge}

votes = {arm: Counter() for arm in m["armOrderBase"]}
for k in range(1, 6):
    jm = m["judges"][f"judge-{k}"]
    for i, arm in enumerate(jm["renderOrder"]):
        votes[arm][judges[k]["layoutClass"][f"render-{i+1}"]] += 1
assigned = {}
for arm, c in votes.items():
    top = c.most_common()
    best = top[0][1]
    tied = [cls for cls, n in top if n == best]
    # majority (>=3 of 5) wins; no majority -> conservatively shares every tied class
    assigned[arm] = [top[0][0]] if best >= 3 and len(tied) == 1 else tied
share = any(set(assigned[a]) & set(assigned[b]) for a, b in combinations(assigned, 2))
out["b_layout_class"] = {"votes": {a: dict(c) for a, c in votes.items()}, "assigned": assigned,
                         "thresholdRegistered": "no two arms share a class", "pass": not share}

mech = json.load(open(base / "motif-grep.result.json"))["results"]
vis = {arm: Counter() for arm in m["armOrderBase"]}
for k in range(1, 6):
    jm = m["judges"][f"judge-{k}"]
    for i, arm in enumerate(jm["renderOrder"]):
        for motif, present in judges[k]["motifs"][f"render-{i+1}"].items():
            if present: vis[arm][motif] += 1
vectors = {}
for arm in m["armOrderBase"]:
    v = {mo for mo, cnt in vis[arm].items() if cnt >= 3}
    v |= {mo for mo, val in mech[arm].items() if val}
    vectors[arm] = sorted(v)
pairs = {}
allpass = True
for a, b in combinations(m["armOrderBase"], 2):
    A, B = set(vectors[a]), set(vectors[b])
    j = len(A & B) / len(A | B) if (A | B) else 0.0
    ok = j <= 0.40
    allpass &= ok
    pairs[f"{a} vs {b}"] = {"jaccard": round(j, 3), "shared": sorted(A & B), "pass": ok}
out["c_motifs"] = {"visualVotes": {a: dict(c) for a, c in vis.items()}, "vectors": vectors,
                   "pairs": pairs, "thresholdRegistered": 0.40, "pass": allpass}
out["allProtocolsPass"] = out["e_blind_intent"]["pass"] and out["b_layout_class"]["pass"] and allpass
print(json.dumps(out, indent=2))
