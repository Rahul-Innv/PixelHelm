# E3 (editorial) admission driver: builds the original selection request for the
# E3 editorial-archetype task, obtains the original receipt from the ACCEPTED
# router, builds the continuation, and runs the committed admit_choicegate.py
# verifier. Writes all artifacts. Modeled on the E1 driver; one mechanical
# difference, recorded in the run REPORT: inventory component contents are read
# from the PINNED inventory commit's object store (`git show <commit>:<path>`)
# rather than the working tree, binding the accepted snapshot byte-exactly and
# independent of unrelated working-tree drift. The fingerprint assert is
# unchanged and still fail-closed.
import copy, hashlib, json, subprocess, sys
from pathlib import Path

REPO = Path(__file__).resolve().parents[5]
assert (REPO / "src" / "family.json").is_file(), REPO
CG_ROOT = Path(sys.argv[1])  # accepted ChoiceGate checkout (public v0.2.1, pinned in family.json)
INV_ROOT = Path(sys.argv[2])  # Skills-OS repo containing the pinned inventory commit
OUT = REPO / "evals/validation/e3/run-2026-07-26-editorial/admission"
FAMILY = json.loads((REPO / "src/family.json").read_text(encoding="utf-8"))
INV_COMMIT = FAMILY["inventory"]["commit"]

COMPONENT_PATHS = (
    "evals/choicegate/inventory-fixtures.json", "evals/choicegate/manifest.json",
    "evals/choicegate/routing-cases.json", "registry/bundles.json", "registry/capabilities.json",
    "registry/conflicts.json", "registry/dependencies.json", "registry/preconditions.json",
    "registry/schemas/bundle.schema.json", "registry/schemas/capability.schema.json",
    "registry/schemas/conflict.schema.json", "registry/schemas/dependency.schema.json",
    "registry/schemas/precondition.schema.json", "registry/schemas/supersession.schema.json",
    "registry/state-axes.json", "registry/supersessions.json",
)
SCOPE_KEYS = ("local_files_only", "outward_messages", "paid_actions",
              "provider_configuration", "provider_use", "remote_actions", "write_files")

def cj(v): return json.dumps(v, ensure_ascii=False, sort_keys=True, separators=(",", ":")).encode("utf-8")

def pinned_blob(path: str) -> str:
    r = subprocess.run(["git", "-C", str(INV_ROOT), "show", f"{INV_COMMIT}:{path}"],
                       capture_output=True, timeout=30)
    assert r.returncode == 0, (path, r.stderr.decode())
    return r.stdout.decode("utf-8")

components = []
for p in COMPONENT_PATHS:
    content = pinned_blob(p)
    components.append({"path": p, "sha256": hashlib.sha256(content.encode("utf-8")).hexdigest(), "content_utf8": content})
manifest = "".join(f"{c['path']}\t{c['sha256']}\n" for c in sorted(components, key=lambda c: c["path"]))
fp = hashlib.sha256(manifest.encode("utf-8")).hexdigest()
assert fp == FAMILY["inventory"]["inventory_fingerprint"], fp

policy = {"policy_version": "choicegate-router-policy/v1", "normal_ceiling": 8,
          "freshness_policy_id": "accepted-snapshot-explicit-v1", "explicit_owner_approved_setup_paths": []}
policy["policy_sha256"] = hashlib.sha256(cj(policy)).hexdigest()

request = {
    "contract_version": "choicegate.route-request/v1",
    "request_id": "pixelhelm-e3-editorial-season-moved",
    "evaluation_time_utc": "2026-07-26T23:15:00Z",
    "task": {
        "task_class": "frontend-design",
        "required_outcomes": ["frontend-design"],
        "allowed_scope": {k: k in ("local_files_only", "write_files") for k in SCOPE_KEYS},
        "surface": "claude-code",
        "private_data_class": "none",
        "authorization_required": False,
        "explicit_browser_choice": False,
        "intrinsic_visual_testing": False,
        "risk_class": "medium",
        "max_discoverable_capabilities": 1,
        "allow_setup_choice": False,
        "fixture_scope": False,
        "requested_route_ids": ["frontend-design"],
        "preconditions": {},
        "selected_path_failed": False,
    },
    "candidate_evidence": [{
        "route_type": "atomic", "route_id": "frontend-design", "canonical_route_id": "frontend-design",
        "version": None, "task_class_match": True, "covers_required_outcomes": ["frontend-design"],
        "necessary_member_roles": [], "task_fit": 5, "context_cost": 2, "expected_cost": 1,
        "evidence_refs": ["registry/capabilities.json#frontend-design"], "evidence_fresh": True,
        "risk_flags": [], "required_scope": {k: False for k in SCOPE_KEYS},
        "required_private_data_class": "none",
    }],
    "inventory": {"schema_version": 1, "accepted_registry_commit": INV_COMMIT,
                  "state_model_id": "orthogonal-seven-axis-v1", "manifest_algorithm": "sha256-path-hash-manifest-v1",
                  "manifest_fingerprint": fp, "components": components},
    "policy": policy,
}

router = subprocess.run([sys.executable, "-B", str(CG_ROOT / "scripts/route_capabilities.py"),
                         "--choicegate-commit", FAMILY["choicegate"]["commit"], "-"],
                        input=cj(request) + b"\n", capture_output=True, cwd=CG_ROOT, timeout=60)
assert router.returncode == 0, router.stderr.decode()
prior = json.loads(router.stdout)
d = prior["decision"]
assert d["route_id"] == "frontend-design" and d["route_type"] == "atomic" and d["executable"] is True, d

continuation = copy.deepcopy(request)
continuation["prior_receipt"] = prior
continuation["task"]["owner_selected_route_id"] = "frontend-design"

admit = subprocess.run([sys.executable, "-B",
                        str(REPO / "plugins/pixelhelm-lite/skills/pixelhelm-choicegate/scripts/admit_choicegate.py"),
                        "--choicegate-root", str(CG_ROOT), "-"],
                       input=cj(continuation) + b"\n", capture_output=True, timeout=120)
print("admit exit:", admit.returncode)
print(admit.stdout.decode()[:400])
admission = json.loads(admit.stdout)
assert admit.returncode == 0 and admission["admitted"] is True and admission["edition"] == "pixelhelm-lite", admission

OUT.mkdir(parents=True, exist_ok=True)
# The continuation embeds the full inventory contents (16 registry files, private
# machine metadata) - commit the receipt + admission + a redacted continuation
# summary rather than the raw megabyte payload; hashes bind everything.
(OUT / "original-selection-receipt.json").write_bytes(json.dumps(prior, ensure_ascii=False, indent=1).encode("utf-8") + b"\n")
(OUT / "admission.json").write_bytes(json.dumps(admission, ensure_ascii=False, indent=1).encode("utf-8") + b"\n")
summary = {
    "note": "Continuation request summary; full inventory component contents omitted from the committed record (private machine metadata) - bound by sha256 below and by the receipt/admission hashes.",
    "request_sha256_canonical": hashlib.sha256(cj(continuation)).hexdigest(),
    "request_id": continuation["request_id"],
    "task": continuation["task"],
    "candidate_evidence": continuation["candidate_evidence"],
    "inventory": {k: v for k, v in continuation["inventory"].items() if k != "components"},
    "inventory_component_hashes": [{"path": c["path"], "sha256": c["sha256"]} for c in components],
    "policy": continuation["policy"],
    "prior_receipt_sha256": prior["receipt_sha256"],
}
(OUT / "continuation-request-summary.json").write_bytes(json.dumps(summary, ensure_ascii=False, indent=1).encode("utf-8") + b"\n")
print("ARTIFACTS WRITTEN:", sorted(p.name for p in OUT.iterdir()))
print("admission_sha256:", admission["admission_sha256"])
