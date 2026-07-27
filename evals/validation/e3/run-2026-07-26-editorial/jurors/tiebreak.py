#!/usr/bin/env python3
"""E3 editorial winner tie-break — E1's mechanical hierarchy applied verbatim
(see TIEBREAK.md). Stages: (a) min criterion median, (b) criteria at median>=9,
(c) pairwise criterion-median wins, (d) sum of criterion medians, (e) per-juror
preference (juror's own median over their 10 scores; internal ties by raw sum).
The hierarchy stops at the first separating stage; all stage values recorded."""
import json
from statistics import median
from pathlib import Path

base = Path(__file__).parent
m = json.load(open(base / "blind-map.json"))
jurors = {k: json.load(open(base / "raw" / f"juror-{k}.json")) for k in range(1, 6)}
res = json.load(open(base / "panel-results.json"))
tied = res["winner"]["tie"] if isinstance(res["winner"], dict) else [res["winner"]]

a_ = {a: res["arms"][a]["minCriterionMedian"] for a in tied}
b_ = {a: sum(1 for v in res["arms"][a]["criterionMedians"].values() if v >= 9) for a in tied}
def pw(x, y):
    mx, my = res["arms"][x]["criterionMedians"], res["arms"][y]["criterionMedians"]
    return sum(1 for c in mx if mx[c] > my[c])
c_ = {a: sum(pw(a, b) for b in tied if b != a) for a in tied}
d_ = {a: sum(res["arms"][a]["criterionMedians"].values()) for a in tied}
e_, e_detail = {a: 0 for a in tied}, {}
for k in range(1, 6):
    order = m["jurors"][f"juror-{k}"]["armOrder"]
    stats = {}
    for i, arm in enumerate(order, 1):
        if arm not in tied: continue
        sc = [int(jurors[k]["candidates"][f"candidate-{i}"]["criteria"][c]["score"]) for c in map(str, range(1, 11))]
        stats[arm] = (median(sc), sum(sc))
    best = max(v[0] for v in stats.values())
    top = [a for a, v in stats.items() if v[0] == best]
    if len(top) > 1:
        bs = max(stats[a][1] for a in top)
        top = [a for a in top if stats[a][1] == bs]
    e_detail[f"juror-{k}"] = {"perArm": {a: {"median": stats[a][0], "sum": stats[a][1]} for a in stats},
                              "preference": top[0] if len(top) == 1 else "tie"}
    if len(top) == 1: e_[top[0]] += 1

remaining = tied[:]
decision_stage = None
for name, vals in [("a", a_), ("b", b_), ("c", c_), ("d", d_), ("e", e_)]:
    best = max(vals[a] for a in remaining)
    nxt = [a for a in remaining if vals[a] == best]
    if len(nxt) < len(remaining):
        remaining = nxt
    if len(remaining) == 1:
        decision_stage = name
        break

out = {"tied": tied,
       "hierarchy": "E1 TIEBREAK.md stages (a)-(e), applied to the remaining tied set until one arm stands",
       "stages": {"a_minCriterionMedian": a_, "b_criteriaAt9plus": b_,
                  "c_pairwiseCriterionMedianWins": c_, "d_sumOfCriterionMedians": d_,
                  "e_perJurorPreference": e_, "e_detail": e_detail},
       "decisionStage": decision_stage, "winner": remaining[0] if len(remaining) == 1 else {"tie": remaining},
       "passBarTieInvariance": {a: {"minCriterionMedian": res["arms"][a]["minCriterionMedian"],
                                    "overallMedian": res["arms"][a]["overallMedian"],
                                    "clears": res["arms"][a]["minCriterionMedian"] >= 6 and res["arms"][a]["overallMedian"] >= 8}
                                for a in tied}}
print(json.dumps(out, indent=2))
