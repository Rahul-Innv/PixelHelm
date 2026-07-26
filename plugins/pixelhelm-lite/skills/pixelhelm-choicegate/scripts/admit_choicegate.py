#!/usr/bin/env python3
"""Fail-closed thin consumer for the accepted local ChoiceGate continuation."""

from __future__ import annotations

import argparse
import hashlib
import json
import os
from pathlib import Path
import subprocess
import sys
from typing import Any

CHOICEGATE_COMMIT = "7d95e9612d011a577d232cf9a51ba0c1bfab7571"
CHOICEGATE_TREE = "1d35cb708f880b228d9334c85f4b4c356f0f36d4"
INVENTORY_COMMIT = "354046f9627c4a83a2a912e09a656d1871ed6cc4"
INVENTORY_TREE = "786171bc52fe6efeefb860f01bb71d4c09ed3504"
INVENTORY_FINGERPRINT = "6ef1493691332e372106b652c991a4e9477c869d1a22e10af319845ae533198b"
# The accepted registry snapshot (Skills-OS @ INVENTORY_COMMIT, hard-pinned by the
# accepted ChoiceGate router itself) predates the family's public rename and records
# frontend-design under the family's pre-rename owner id. Owner ruling 2026-07-26:
# plumbline-family and pixelhelm-family are the same family; admission verifies the
# accepted content verbatim rather than the post-rename id.
ACCEPTED_REGISTRY_OWNER = "plumbline-family"
REQUEST_VERSION = "choicegate.route-request/v1"
RECEIPT_VERSION = "choicegate.decision-receipt/v1"
OUTPUT_VERSION = "pixelhelm.choicegate-admission/v1"


class AdmissionError(ValueError):
    def __init__(self, code: str, message: str) -> None:
        super().__init__(message)
        self.code = code


def canonical_bytes(value: Any) -> bytes:
    return json.dumps(value, ensure_ascii=False, sort_keys=True, separators=(",", ":"), allow_nan=False).encode("utf-8")


def sha256(value: Any) -> str:
    return hashlib.sha256(canonical_bytes(value)).hexdigest()


def duplicate_pairs(pairs: list[tuple[str, Any]]) -> dict[str, Any]:
    out: dict[str, Any] = {}
    for key, value in pairs:
        if key in out:
            raise AdmissionError("DUPLICATE_JSON_KEY", f"duplicate JSON key: {key}")
        out[key] = value
    return out


def reject_constant(value: str) -> None:
    raise AdmissionError("NONFINITE_JSON_NUMBER", f"non-finite JSON number: {value}")


def strict_json(raw: bytes) -> dict[str, Any]:
    try:
        text = raw.decode("utf-8")
    except UnicodeDecodeError as error:
        raise AdmissionError("INVALID_UTF8", "request must be strict UTF-8") from error
    try:
        value = json.loads(text, object_pairs_hook=duplicate_pairs, parse_constant=reject_constant)
    except AdmissionError:
        raise
    except json.JSONDecodeError as error:
        raise AdmissionError("INVALID_JSON", f"invalid JSON at character {error.pos}") from error
    if not isinstance(value, dict):
        raise AdmissionError("INVALID_REQUEST", "request must be an object")
    return value


def require(condition: bool, code: str, message: str) -> None:
    if not condition:
        raise AdmissionError(code, message)


def git(root: Path, *args: str) -> str:
    result = subprocess.run(
        ["git", "-c", f"safe.directory={root}", "-C", str(root), *args],
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        env={**os.environ, "GIT_OPTIONAL_LOCKS": "0"},
        check=False,
        timeout=15,
    )
    if result.returncode != 0:
        raise AdmissionError("CHOICEGATE_GIT_FAILURE", f"git {' '.join(args)} failed")
    try:
        return result.stdout.decode("utf-8").strip()
    except UnicodeDecodeError as error:
        raise AdmissionError("CHOICEGATE_GIT_FAILURE", "git output was not UTF-8") from error


def verify_choicegate_root(value: str) -> Path:
    supplied = Path(value)
    require(supplied.is_absolute(), "CHOICEGATE_ROOT_INVALID", "ChoiceGate root must be absolute")
    root = supplied.resolve()
    require((root / "scripts" / "route_capabilities.py").is_file(), "CHOICEGATE_ROOT_INVALID", "router missing")
    require(Path(git(root, "rev-parse", "--show-toplevel")).resolve() == root, "CHOICEGATE_ROOT_INVALID", "not exact Git root")
    require(git(root, "rev-parse", "HEAD") == CHOICEGATE_COMMIT, "CHOICEGATE_COMMIT_MISMATCH", "ChoiceGate HEAD mismatch")
    require(git(root, "rev-parse", "HEAD^{tree}") == CHOICEGATE_TREE, "CHOICEGATE_TREE_MISMATCH", "ChoiceGate tree mismatch")
    require(git(root, "status", "--porcelain=v1", "--untracked-files=all") == "", "CHOICEGATE_ROOT_DIRTY", "ChoiceGate root is dirty")
    return root


def inventory_component(request: dict[str, Any], path: str) -> dict[str, Any]:
    inventory = request.get("inventory")
    require(isinstance(inventory, dict), "INVENTORY_INVALID", "inventory missing")
    require(inventory.get("accepted_registry_commit") == INVENTORY_COMMIT, "INVENTORY_COMMIT_MISMATCH", "capability inventory commit mismatch")
    require(inventory.get("manifest_fingerprint") == INVENTORY_FINGERPRINT, "INVENTORY_FINGERPRINT_MISMATCH", "inventory fingerprint mismatch")
    components = inventory.get("components")
    require(isinstance(components, list), "INVENTORY_INVALID", "inventory components missing")
    rows: list[str] = []
    found: dict[str, Any] | None = None
    for component in components:
        require(isinstance(component, dict), "INVENTORY_INVALID", "component must be an object")
        p, claimed, content = component.get("path"), component.get("sha256"), component.get("content_utf8")
        require(isinstance(p, str) and isinstance(claimed, str) and isinstance(content, str), "INVENTORY_INVALID", "component fields invalid")
        actual = hashlib.sha256(content.encode("utf-8")).hexdigest()
        require(actual == claimed, "COMPONENT_HASH_MISMATCH", f"component hash mismatch: {p}")
        rows.append(f"{p}\t{claimed}\n")
        if p == path:
            found = component
    fingerprint = hashlib.sha256("".join(sorted(rows)).encode("utf-8")).hexdigest()
    require(fingerprint == INVENTORY_FINGERPRINT, "INVENTORY_FINGERPRINT_MISMATCH", "component manifest mismatch")
    require(found is not None, "INVENTORY_INVALID", f"missing component: {path}")
    return found


def verify_edition(request: dict[str, Any]) -> str:
    component = inventory_component(request, "registry/capabilities.json")
    try:
        document = strict_json(component["content_utf8"].encode("utf-8"))
    except AdmissionError as error:
        raise AdmissionError("INVENTORY_INVALID", str(error)) from error
    records = [item for item in document.get("capabilities", []) if isinstance(item, dict) and item.get("name") == "frontend-design"]
    require(len(records) == 1, "FRONTEND_AUTHORITY_INVALID", "frontend-design authority must be unique")
    record = records[0]
    require(record.get("owner") == ACCEPTED_REGISTRY_OWNER and record.get("authority_role") == "canonical-family", "FRONTEND_AUTHORITY_INVALID", "wrong frontend-design owner")
    require(record.get("edition_policy") == {"default_edition": "lite", "maximum_active_per_surface": 1, "selection_authority": ACCEPTED_REGISTRY_OWNER, "simultaneous_eligibility": "forbidden"}, "EDITION_POLICY_INVALID", "edition policy mismatch")
    surface = [item for item in record.get("surface_policies", []) if item.get("surface") == "claude-code"]
    require(surface == [{"surface": "claude-code", "authority": ACCEPTED_REGISTRY_OWNER, "route_policy": "edition-adapter", "qualification_state": "qualified-current"}], "SURFACE_POLICY_INVALID", "Claude Code surface policy mismatch")
    ready = {"install_state": "installed", "enablement_state": "enabled", "exposure_state": "surface-exposed", "authorization_state": "not-required", "activity_state": "available", "promotion_state": "available"}
    eligible = [item.get("id") for item in record.get("editions", []) if item.get("lifecycle") == ready]
    require(eligible == ["lite"], "EDITION_EXCLUSIVITY_VIOLATION", "exactly Lite must be eligible")
    return "pixelhelm-lite"


def preflight_request(request: dict[str, Any]) -> None:
    require(request.get("contract_version") == REQUEST_VERSION, "REQUEST_VERSION_INVALID", "unsupported request contract")
    prior = request.get("prior_receipt")
    require(isinstance(prior, dict), "COMPLETE_CONTINUATION_REQUIRED", "complete continuation with prior receipt required")
    require(prior.get("receipt_version") == RECEIPT_VERSION, "PRIOR_RECEIPT_INVALID", "prior receipt contract mismatch")
    task = request.get("task")
    prior_task = prior.get("task")
    decision = prior.get("decision")
    require(isinstance(task, dict) and isinstance(prior_task, dict) and isinstance(decision, dict), "PRIOR_RECEIPT_INVALID", "task or decision missing")
    require(task.get("surface") == "claude-code", "SURFACE_MISMATCH", "PixelHelm is qualified only on Claude Code")
    require(task.get("owner_selected_route_id") == "frontend-design" and task.get("selected_path_failed") is False, "SELECTION_INVALID", "frontend-design must be the intact selected path")
    require(prior_task.get("owner_selected_route_id") is None and prior_task.get("selected_path_failed") is False, "PRIOR_RECEIPT_INVALID", "prior receipt is not an original selection receipt")
    require(decision.get("route_type") == "atomic" and decision.get("route_id") == "frontend-design" and decision.get("owner") == ACCEPTED_REGISTRY_OWNER and decision.get("executable") is True, "ROUTE_INVALID", "prior decision is not executable canonical frontend-design")
    require(prior.get("bundle_members") == [], "BUNDLE_NOT_ALLOWED", "PixelHelm consumes an atomic route only")
    claimed = prior.get("receipt_sha256")
    body = {key: value for key, value in prior.items() if key != "receipt_sha256"}
    require(isinstance(claimed, str) and claimed == sha256(body), "PRIOR_RECEIPT_HASH_MISMATCH", "prior receipt hash mismatch")


def invoke(root: Path, request: dict[str, Any]) -> dict[str, Any]:
    env = {**os.environ, "PYTHONDONTWRITEBYTECODE": "1", "PYTHONHASHSEED": "0", "GIT_OPTIONAL_LOCKS": "0"}
    result = subprocess.run(
        [sys.executable, "-B", str(root / "scripts" / "route_capabilities.py"), "--choicegate-commit", CHOICEGATE_COMMIT, "-"],
        input=canonical_bytes(request) + b"\n", stdout=subprocess.PIPE, stderr=subprocess.PIPE,
        cwd=root, env=env, check=False, timeout=30,
    )
    require(result.returncode == 0, "CHOICEGATE_REJECTED", "ChoiceGate rejected the continuation")
    receipt = strict_json(result.stdout)
    require(result.stderr == b"", "CHOICEGATE_STDERR", "ChoiceGate wrote unexpected stderr")
    return receipt


def verify_handoff(request: dict[str, Any], receipt: dict[str, Any], edition: str) -> dict[str, Any]:
    decision = receipt.get("decision")
    require(receipt.get("receipt_version") == RECEIPT_VERSION and isinstance(decision, dict), "HANDOFF_INVALID", "invalid handoff receipt")
    require(decision == {"route_type": "handoff", "route_id": "frontend-design", "version": None, "owner": ACCEPTED_REGISTRY_OWNER, "executable": True, "reason": "valid-prior-receipt"}, "HANDOFF_INVALID", "handoff decision mismatch")
    require(receipt.get("bundle_members") == [] and receipt.get("approvals_required") == [], "HANDOFF_INVALID", "bundle or approvals not allowed")
    require(receipt.get("discovery") == {"status": "suppressed-valid-handoff", "reason": "complete-prior-receipt-validated"}, "HANDOFF_INVALID", "discovery was not suppressed")
    expected_task = dict(request.get("task", {}))
    expected_task["fixture_id"] = expected_task.get("fixture_id")
    expected_task["owner_selected_route_id"] = expected_task.get("owner_selected_route_id")
    require(receipt.get("task") == expected_task, "TASK_MUTATION", "ChoiceGate mutated the selected task")
    router = receipt.get("router_binding", {})
    inventory = receipt.get("inventory_binding", {})
    require(router.get("choicegate_commit") == CHOICEGATE_COMMIT, "CHOICEGATE_COMMIT_MISMATCH", "receipt ChoiceGate pin mismatch")
    require(inventory.get("accepted_registry_commit") == INVENTORY_COMMIT and inventory.get("manifest_fingerprint") == INVENTORY_FINGERPRINT, "INVENTORY_FINGERPRINT_MISMATCH", "receipt inventory pin mismatch")
    claimed = receipt.get("receipt_sha256")
    require(isinstance(claimed, str) and claimed == sha256({key: value for key, value in receipt.items() if key != "receipt_sha256"}), "HANDOFF_HASH_MISMATCH", "handoff receipt hash mismatch")
    output = {
        "contract_version": OUTPUT_VERSION,
        "admitted": True,
        "capability": "frontend-design",
        "family": "pixelhelm-family",
        "edition": edition,
        "surface": "claude-code",
        "task": receipt["task"],
        "choicegate": {"commit": CHOICEGATE_COMMIT, "tree": CHOICEGATE_TREE, "receipt_sha256": claimed},
        "inventory": {"commit": INVENTORY_COMMIT, "tree": INVENTORY_TREE, "inventory_fingerprint": INVENTORY_FINGERPRINT, "accepted_registry_owner": ACCEPTED_REGISTRY_OWNER},
    }
    output["admission_sha256"] = sha256(output)
    return output


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--choicegate-root", required=True)
    parser.add_argument("request", nargs="?", default="-")
    args = parser.parse_args()
    try:
        raw = sys.stdin.buffer.read() if args.request == "-" else Path(args.request).read_bytes()
        require(len(raw) <= 20_000_000, "REQUEST_TOO_LARGE", "request exceeds 20 MB")
        request = strict_json(raw)
        root = verify_choicegate_root(args.choicegate_root)
        preflight_request(request)
        edition = verify_edition(request)
        output = verify_handoff(request, invoke(root, request), edition)
        sys.stdout.buffer.write(canonical_bytes(output) + b"\n")
        return 0
    except (AdmissionError, OSError, subprocess.TimeoutExpired) as error:
        code = error.code if isinstance(error, AdmissionError) else "ADMISSION_FAILURE"
        message = str(error) if isinstance(error, AdmissionError) else type(error).__name__
        failure = {"contract_version": OUTPUT_VERSION, "admitted": False, "error_code": code, "message": message}
        sys.stdout.buffer.write(canonical_bytes(failure) + b"\n")
        sys.stderr.write(f"{code}: {message}\n")
        return 2


if __name__ == "__main__":
    raise SystemExit(main())
