#!/usr/bin/env python3
"""Deterministic offline PixelHelm atomic-family and ChoiceGate-boundary tests."""

from __future__ import annotations

import argparse
import copy
import hashlib
import importlib.util
import itertools
import json
import os
from pathlib import Path
import subprocess
import sys
import tempfile
import unittest

ROOT = Path(__file__).resolve().parents[2]
CASES = json.loads((ROOT / "evals/pixelhelm/atomic-cases.json").read_text(encoding="utf-8"))
FAMILY = json.loads((ROOT / "src/family.json").read_text(encoding="utf-8"))
REGISTRY = json.loads((ROOT / "src/skills.json").read_text(encoding="utf-8"))
EXPECTED = {item["id"] for item in REGISTRY["skills"]}
EXPECTED_LITE = set(FAMILY["editions"]["pixelhelm-lite"])
ORACLE_SPEC = importlib.util.spec_from_file_location(
    "_pixelhelm_atomic_oracle", ROOT / "evals/pixelhelm/atomic_oracle.py"
)
assert ORACLE_SPEC and ORACLE_SPEC.loader
ORACLE = importlib.util.module_from_spec(ORACLE_SPEC)
ORACLE_SPEC.loader.exec_module(ORACLE)
CHOICEGATE_ROOT: Path | None = None
INVENTORY_ROOT: Path | None = None


def command(
    *args: str,
    cwd: Path = ROOT,
    input_bytes: bytes | None = None,
    env: dict[str, str] | None = None,
) -> subprocess.CompletedProcess[bytes]:
    command_env = {
        **os.environ,
        "PYTHONDONTWRITEBYTECODE": "1",
        "PYTHONHASHSEED": "0",
        "GIT_OPTIONAL_LOCKS": "0",
        **(env or {}),
    }
    return subprocess.run(args, cwd=cwd, input=input_bytes, stdout=subprocess.PIPE, stderr=subprocess.PIPE,
                          env=command_env, check=False)


def frontend_continuation() -> dict:
    assert CHOICEGATE_ROOT and INVENTORY_ROOT
    os.environ.update({
        "GIT_CONFIG_COUNT": "2",
        "GIT_CONFIG_KEY_0": "safe.directory",
        "GIT_CONFIG_VALUE_0": str(CHOICEGATE_ROOT),
        "GIT_CONFIG_KEY_1": "safe.directory",
        "GIT_CONFIG_VALUE_1": str(INVENTORY_ROOT),
    })
    sys.path.insert(0, str(CHOICEGATE_ROOT / "evals/choicegate"))
    try:
        spec = importlib.util.spec_from_file_location("_pixelhelm_choicegate_harness", CHOICEGATE_ROOT / "evals/choicegate/run_tests.py")
        assert spec and spec.loader
        cg = importlib.util.module_from_spec(spec)
        sys.modules[spec.name] = cg
        spec.loader.exec_module(cg)
        context = cg.configure_test_context(cg.HarnessContext(CHOICEGATE_ROOT, INVENTORY_ROOT, FAMILY["choicegate"]["commit"]))
        request = cg.build_request(context, "CG-ATOMIC-01")
        request["task"].update({
            "task_class": "frontend-design", "required_outcomes": ["frontend-design"],
            "surface": "claude-code", "risk_class": "medium", "fixture_scope": False,
            "requested_route_ids": ["frontend-design"], "preconditions": {},
        })
        request["task"].pop("fixture_id", None)
        required_scope = {key: False for key in request["task"]["allowed_scope"]}
        request["candidate_evidence"] = [{
            "route_type": "atomic", "route_id": "frontend-design", "canonical_route_id": "frontend-design",
            "version": None, "task_class_match": True, "covers_required_outcomes": ["frontend-design"],
            "necessary_member_roles": [], "task_fit": 5, "context_cost": 2, "expected_cost": 1,
            "evidence_refs": ["registry/capabilities.json#frontend-design"], "evidence_fresh": True,
            "risk_flags": [], "required_scope": required_scope, "required_private_data_class": "none",
        }]
        router = cg.load_router(context)
        prior = router.route_request(copy.deepcopy(request), context.choicegate_commit)
        continuation = copy.deepcopy(request)
        continuation["prior_receipt"] = prior
        continuation["task"]["owner_selected_route_id"] = "frontend-design"
        continuation["task"]["selected_path_failed"] = False
        return continuation
    finally:
        sys.path.pop(0)


class FamilyTests(unittest.TestCase):
    def test_exact_atomic_family_and_editions(self) -> None:
        self.assertEqual(25, len(EXPECTED))
        self.assertEqual(25, len(FAMILY["editions"]["pixelhelm-full"]))
        self.assertEqual(15, len(EXPECTED_LITE))
        self.assertEqual(EXPECTED, set(FAMILY["editions"]["pixelhelm-full"]))
        self.assertTrue(EXPECTED_LITE < EXPECTED)
        self.assertEqual("pixelhelm-lite", FAMILY["edition_policy"]["default"])
        self.assertEqual(1, FAMILY["edition_policy"]["maximum_eligible"])
        self.assertEqual("forbidden", FAMILY["edition_policy"]["simultaneous_eligibility"])

    def test_exact_legacy_alias_map_is_compatibility_only(self) -> None:
        self.assertEqual(19, len(FAMILY["legacy_aliases"]))
        self.assertEqual(19, len(set(FAMILY["legacy_aliases"].values())))
        self.assertEqual("compatibility-only-no-natural-language-coeligibility", FAMILY["legacy_alias_policy"])
        self.assertTrue(set(FAMILY["legacy_aliases"].values()) <= EXPECTED)

    def test_skill_sources_are_atomic_and_trigger_bounded(self) -> None:
        for skill in sorted(EXPECTED):
            text = (ROOT / "src/skills" / skill / "SKILL.md").read_text(encoding="utf-8")
            self.assertTrue(text.startswith("---\n"), skill)
            self.assertIn(f"name: {skill}\n", text, skill)
            self.assertIn("description:", text, skill)
            self.assertRegex(text, r"(?i)do not|never")
            self.assertLessEqual(len(text), 5000, skill)

    def test_positive_and_near_miss_coverage_is_exact(self) -> None:
        positives = CASES["positive_cases"]
        misses = CASES["near_miss_cases"]
        self.assertEqual(EXPECTED, {item["skill"] for item in positives})
        self.assertEqual(EXPECTED, {item["excluded_skill"] for item in misses})
        self.assertEqual(25, len(positives))
        self.assertEqual(25, len(misses))
        for item in positives + misses:
            self.assertTrue(item["prompt"].strip())
        for item in positives:
            with self.subTest(kind="positive", skill=item["skill"]):
                receipt = ORACLE.route_prompt(item["prompt"])
                self.assertEqual("atomic-leaf", receipt["route_type"])
                self.assertEqual(item["skill"], receipt["leaf_id"])
                self.assertEqual([item["skill"]], receipt["matched_leaf_ids"])
        for item in misses:
            with self.subTest(kind="near-miss", skill=item["excluded_skill"]):
                receipt = ORACLE.route_prompt(item["prompt"])
                self.assertEqual("no-safe-route", receipt["route_type"])
                self.assertIsNone(receipt["leaf_id"])
                self.assertEqual([], receipt["matched_leaf_ids"])

    def test_pairwise_ids_do_not_collide(self) -> None:
        ids = sorted(EXPECTED)
        self.assertEqual(len(ids), len({value.encode("utf-8") for value in ids}))
        for left_index, left in enumerate(ids):
            for right in ids[left_index + 1:]:
                self.assertFalse(left == right or left.startswith(right + "/") or right.startswith(left + "/"))

    def test_every_pairwise_outcome_collision_fails_closed(self) -> None:
        positives = CASES["positive_cases"]
        self.assertEqual(300, len(list(itertools.combinations(positives, 2))))
        for left, right in itertools.combinations(positives, 2):
            prompt = f"{left['prompt']} AND ALSO: {right['prompt']}"
            with self.subTest(left=left["skill"], right=right["skill"]):
                receipt = ORACLE.route_prompt(prompt)
                self.assertEqual("no-safe-route", receipt["route_type"])
                self.assertEqual("ambiguous-outcome-collision", receipt["reason"])
                self.assertEqual(sorted([left["skill"], right["skill"]]), receipt["matched_leaf_ids"])

    def test_declared_semantic_collision_oracle_fails_closed(self) -> None:
        collisions = CASES["collision_cases"]
        self.assertGreaterEqual(len(collisions), 5)
        for item in collisions:
            with self.subTest(skills=item["skills"]):
                receipt = ORACLE.route_prompt(item["prompt"])
                self.assertEqual("no-safe-route", receipt["route_type"])
                self.assertEqual("ambiguous-outcome-collision", receipt["reason"])
                self.assertEqual(sorted(item["skills"]), receipt["matched_leaf_ids"])

    def test_known_description_boundaries_are_outcome_specific(self) -> None:
        generate = (ROOT / "src/skills/pixelhelm-generate/SKILL.md").read_text(encoding="utf-8")
        tokens = (ROOT / "src/skills/pixelhelm-tokens/SKILL.md").read_text(encoding="utf-8")
        self.assertIn("inside one already selected direction", generate)
        self.assertNotIn("competing UI directions", generate)
        self.assertIn("explicit color-role authoring belongs to pixelhelm-color", tokens)
        self.assertNotIn("palette-contract", tokens)

    def test_generated_editions_and_build_are_deterministic(self) -> None:
        result = command("node", "build/build.mjs", "--check")
        self.assertEqual(0, result.returncode, result.stderr.decode("utf-8", errors="replace"))
        dirs = {item.name for item in (ROOT / "plugins").iterdir() if item.is_dir()}
        self.assertEqual({"pixelhelm-full", "pixelhelm-lite"}, dirs)
        for edition, expected in (("pixelhelm-full", EXPECTED), ("pixelhelm-lite", EXPECTED_LITE)):
            actual = {item.name for item in (ROOT / "plugins" / edition / "skills").iterdir() if item.is_dir()}
            self.assertEqual(expected, actual)

    def test_forbidden_owned_inputs_are_unchanged(self) -> None:
        self.assertFalse((ROOT / "src/skills/design-render/package-lock.json").exists())
        engine = ROOT / "src/skills/design-storm/storm/storm_engine"
        digest = hashlib.sha256()
        files = sorted(
            (path for path in engine.rglob("*") if path.is_file()),
            key=lambda path: path.relative_to(ROOT).as_posix().encode("utf-8"),
        )
        self.assertEqual(6, len(files))
        for path in files:
            relative = path.relative_to(ROOT).as_posix().encode("utf-8")
            data = path.read_bytes()
            digest.update(len(relative).to_bytes(8, "big"))
            digest.update(relative)
            digest.update(len(data).to_bytes(8, "big"))
            digest.update(data)
        self.assertEqual(
            "d4258b994ca4f61c3ddde6c1f687f2649d11951edf69c81877d33f5d0995abb3",
            digest.hexdigest(),
        )

    def test_new_state_paths_are_canonical_with_explicit_fallback(self) -> None:
        doctor = (ROOT / "src/scripts/doctor.mjs").read_text(encoding="utf-8")
        reader = (ROOT / "src/scripts/read-lessons.mjs").read_text(encoding="utf-8")
        self.assertIn('".pixelhelm"', doctor)
        self.assertIn('".design"', doctor)
        self.assertIn('".pixelhelm"', reader)
        self.assertIn('".design"', reader)
        self.assertIn("state conflict", reader)
        for forbidden_write in (
            "fs.writeFileSync", "fs.appendFileSync", "fs.mkdirSync", "fs.renameSync",
            "fs.unlinkSync", "fs.rmSync",
        ):
            self.assertNotIn(forbidden_write, reader)

        forbidden_generated = (
            ".design-baseline.json", "~/.claude/design/", "<project>/.design/",
            "design/LESSONS.md", "design/<topic>.md",
        )
        for edition in ("pixelhelm-full", "pixelhelm-lite"):
            roots = [
                ROOT / "plugins" / edition / "skills",
                ROOT / "plugins" / edition / "profiles",
                ROOT / "plugins" / edition / "seeds",
                ROOT / "plugins" / edition / "CLAUDE.md",
            ]
            for base in roots:
                paths = [base] if base.is_file() else [p for p in base.rglob("*") if p.is_file()]
                for path in paths:
                    if path.suffix.lower() not in {".md", ".json", ".mjs", ".py", ".txt"}:
                        continue
                    text = path.read_text(encoding="utf-8")
                    for legacy in forbidden_generated:
                        self.assertNotIn(legacy, text, str(path))

    def test_legacy_state_is_executed_read_only_fallback_with_conflict_rejection(self) -> None:
        reader = ROOT / "src/scripts/read-lessons.mjs"
        with tempfile.TemporaryDirectory() as temporary:
            temp = Path(temporary)
            home = temp / "home"
            project = temp / "project"
            canonical = project / ".pixelhelm/LESSONS.md"
            legacy = project / ".design/LESSONS.md"
            legacy.parent.mkdir(parents=True)
            legacy_bytes = (
                "## Current entries\n"
                "- id: PLB-TEST-001 | status: verified | skills: pixelhelm | supersedes: none\n"
                "  - rule: retained legacy fallback\n"
            ).encode("utf-8")
            legacy.write_bytes(legacy_bytes)
            test_env = {
                "HOME": str(home),
                "USERPROFILE": str(home),
                "CLAUDE_PROJECT_DIR": str(project),
                "CLAUDE_PLUGIN_DATA": str(home / ".claude/pixelhelm"),
            }
            first = command("node", str(reader), "pixelhelm", env=test_env)
            self.assertEqual(0, first.returncode, first.stderr.decode())
            self.assertIn(b"PLB-TEST-001", first.stdout)
            self.assertFalse(canonical.exists())
            self.assertEqual(legacy_bytes, legacy.read_bytes())

            canonical.parent.mkdir(parents=True)
            canonical.write_bytes(legacy_bytes)
            second = command("node", str(reader), "pixelhelm", env=test_env)
            self.assertEqual(0, second.returncode, second.stderr.decode())
            self.assertEqual(legacy_bytes, canonical.read_bytes())
            self.assertEqual(legacy_bytes, legacy.read_bytes())

            canonical_bytes = legacy_bytes.replace(b"retained legacy fallback", b"canonical conflict")
            canonical.write_bytes(canonical_bytes)
            third = command("node", str(reader), "pixelhelm", env=test_env)
            self.assertEqual(2, third.returncode)
            self.assertIn(b"PIXELHELM_LESSON_STATE_CONFLICT", third.stderr)
            self.assertEqual(canonical_bytes, canonical.read_bytes())
            self.assertEqual(legacy_bytes, legacy.read_bytes())

    def test_ci_requires_and_executes_choicegate_boundary(self) -> None:
        ci = (ROOT / ".gitlab-ci.yml").read_text(encoding="utf-8")
        for required in (
            "CHOICEGATE_ROOT", "INVENTORY_ROOT", "--require-choicegate-boundary",
            "--choicegate-root", "--inventory-root",
        ):
            self.assertIn(required, ci)
        self.assertIn("python -B evals/pixelhelm/run_tests.py\n", ci)
        self.assertIn("merge_request_event", ci)
        self.assertIn("- when: never", ci)
        missing_roots = command(
            sys.executable, "-B", "evals/pixelhelm/run_tests.py", "--require-choicegate-boundary"
        )
        self.assertEqual(2, missing_roots.returncode)
        self.assertIn(b"accepted ChoiceGate and capability inventory roots are required", missing_roots.stderr)

    def test_private_readiness_identity_and_version_are_consistent(self) -> None:
        config = json.loads((ROOT / "build/build.config.json").read_text(encoding="utf-8"))
        self.assertEqual("2.0.0", config["version"])
        self.assertEqual("Rahul Krishna", config["marketplace"]["owner"])
        self.assertIsNone(config["marketplace"]["repoUrl"])
        self.assertIsNone(FAMILY["repository_url"])
        self.assertEqual("owner-confirmation-required", FAMILY["repository_url_status"])
        marketplace = json.loads((ROOT / ".claude-plugin/marketplace.json").read_text(encoding="utf-8"))
        self.assertEqual(config["marketplace"]["description"], marketplace["description"])
        self.assertEqual({"2.0.0"}, {item["version"] for item in marketplace["plugins"]})
        for edition in ("pixelhelm-lite", "pixelhelm-full"):
            manifest = json.loads(
                (ROOT / "plugins" / edition / ".claude-plugin/plugin.json").read_text(encoding="utf-8")
            )
            self.assertEqual("2.0.0", manifest["version"])
            self.assertEqual("Rahul Krishna", manifest["author"]["name"])
            self.assertNotIn("homepage", manifest)

    def test_private_readiness_surfaces_are_complete_and_owner_gated(self) -> None:
        required = (
            "CONTRIBUTING.md", "SECURITY.md", "CODE_OF_CONDUCT.md", "ROADMAP.md",
            ".gitlab/issue_templates/Bug.md", ".gitlab/issue_templates/Feature.md",
            ".gitlab/merge_request_templates/Default.md", "assets/logo.svg",
            "docs/public/CONFIGURATION.md", "docs/public/DEPENDENCIES.md",
            "docs/public/OWNER-HANDOFF.md", "docs/public/READINESS.md",
            "docs/public/RELEASE-CANDIDATE.md", "docs/public/VALIDATION.md",
        )
        for path in required:
            self.assertTrue((ROOT / path).is_file(), path)
        joined = "\n".join(
            (ROOT / path).read_text(encoding="utf-8")
            for path in ("README.md", "src/family.json", "docs/public/OWNER-HANDOFF.md")
        )
        self.assertNotIn("https://gitlab.com/", joined)
        self.assertIn("canonical GitLab project URL is intentionally unset", joined)

    def test_no_user_specific_absolute_path_in_candidate(self) -> None:
        sensitive_forward = "C:/Users" + "/"
        sensitive_windows = "C:" + "\\" + "Users" + "\\"
        for path in ROOT.rglob("*"):
            if not path.is_file() or ".git" in path.parts or ".build-check-" in path.as_posix():
                continue
            if path.suffix.lower() not in {".md", ".json", ".mjs", ".py", ".txt", ".yml", ".yaml"}:
                continue
            text = path.read_text(encoding="utf-8", errors="replace")
            self.assertNotIn(sensitive_forward, text, str(path))
            self.assertNotIn(sensitive_windows, text, str(path))

    def test_no_obvious_secrets_or_network_calls(self) -> None:
        watched = [ROOT / "src/family.json", ROOT / "src/skills.json", ROOT / "src/scripts",
                   *(ROOT / "src/skills" / item for item in EXPECTED)]
        patterns = ("BEGIN PRIVATE KEY", "AKIA", "api_key=", "requests.get(", "urllib.request", "fetch(")
        for base in watched:
            paths = [base] if base.is_file() else [p for p in base.rglob("*") if p.is_file()]
            for path in paths:
                if path.suffix.lower() not in {".md", ".json", ".mjs", ".py", ".txt"}: continue
                text = path.read_text(encoding="utf-8")
                for pattern in patterns:
                    self.assertNotIn(pattern, text, str(path))


class ChoiceGateBoundaryTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls) -> None:
        if CHOICEGATE_ROOT is None or INVENTORY_ROOT is None:
            raise unittest.SkipTest("accepted roots not supplied")
        cls.adapter = ROOT / "src/skills/pixelhelm-choicegate/scripts/admit_choicegate.py"
        cls.request = frontend_continuation()

    def invoke(self, request: dict | bytes) -> subprocess.CompletedProcess[bytes]:
        raw = request if isinstance(request, bytes) else json.dumps(request, sort_keys=True, separators=(",", ":")).encode()
        return command(sys.executable, "-B", str(self.adapter), "--choicegate-root", str(CHOICEGATE_ROOT), "-", input_bytes=raw)

    def test_valid_complete_continuation_is_admitted_without_writes(self) -> None:
        before = command("git", "status", "--porcelain=v1", "--untracked-files=all", cwd=CHOICEGATE_ROOT).stdout
        first = self.invoke(self.request)
        second = self.invoke(self.request)
        after = command("git", "status", "--porcelain=v1", "--untracked-files=all", cwd=CHOICEGATE_ROOT).stdout
        self.assertEqual(0, first.returncode, first.stderr.decode())
        self.assertEqual(first.stdout, second.stdout)
        self.assertEqual(before, after)
        output = json.loads(first.stdout)
        self.assertTrue(output["admitted"])
        self.assertEqual("pixelhelm-lite", output["edition"])
        self.assertEqual("claude-code", output["surface"])
        claimed = output.pop("admission_sha256")
        body = json.dumps(output, ensure_ascii=False, sort_keys=True, separators=(",", ":")).encode()
        self.assertEqual(claimed, hashlib.sha256(body).hexdigest())

    def test_bare_truncated_and_tampered_inputs_fail_closed(self) -> None:
        faults = []
        bare = copy.deepcopy(self.request["prior_receipt"])
        faults.append(bare)
        wrong_surface = copy.deepcopy(self.request); wrong_surface["task"]["surface"] = "codex"; faults.append(wrong_surface)
        wrong_owner = copy.deepcopy(self.request); wrong_owner["prior_receipt"]["decision"]["owner"] = "other"; faults.append(wrong_owner)
        wrong_inventory = copy.deepcopy(self.request); wrong_inventory["inventory"]["manifest_fingerprint"] = "0" * 64; faults.append(wrong_inventory)
        bundle = copy.deepcopy(self.request); bundle["prior_receipt"]["bundle_members"] = [{"role":"x"}]; faults.append(bundle)
        for fault in faults:
            with self.subTest(fault=len(json.dumps(fault))):
                result = self.invoke(fault)
                self.assertEqual(2, result.returncode)
                self.assertFalse(json.loads(result.stdout)["admitted"])

    def test_duplicate_keys_and_nonfinite_numbers_fail_before_routing(self) -> None:
        duplicate = b'{"contract_version":"bad","contract_version":"choicegate.route-request/v1"}'
        nonfinite = b'{"contract_version":"choicegate.route-request/v1","x":NaN}'
        for raw, code in ((duplicate, "DUPLICATE_JSON_KEY"), (nonfinite, "NONFINITE_JSON_NUMBER")):
            result = self.invoke(raw)
            self.assertEqual(2, result.returncode)
            self.assertEqual(code, json.loads(result.stdout)["error_code"])

    def test_wrong_explicit_root_fails_closed(self) -> None:
        raw = json.dumps(self.request, sort_keys=True, separators=(",", ":")).encode()
        result = command(sys.executable, "-B", str(self.adapter), "--choicegate-root", str(ROOT), "-", input_bytes=raw)
        self.assertEqual(2, result.returncode)
        self.assertEqual("CHOICEGATE_ROOT_INVALID", json.loads(result.stdout)["error_code"])


def main() -> int:
    global CHOICEGATE_ROOT, INVENTORY_ROOT
    parser = argparse.ArgumentParser()
    parser.add_argument("--choicegate-root")
    parser.add_argument("--inventory-root")
    parser.add_argument("--require-choicegate-boundary", action="store_true")
    args, remaining = parser.parse_known_args()
    if bool(args.choicegate_root) != bool(args.inventory_root):
        parser.error("both accepted roots are required together")
    if args.require_choicegate_boundary and not args.choicegate_root:
        parser.error("accepted ChoiceGate and capability inventory roots are required")
    if args.choicegate_root:
        CHOICEGATE_ROOT = Path(args.choicegate_root).resolve()
        INVENTORY_ROOT = Path(args.inventory_root).resolve()
    suite = unittest.defaultTestLoader.loadTestsFromModule(sys.modules[__name__])
    result = unittest.TextTestRunner(verbosity=2).run(suite)
    return 0 if result.wasSuccessful() else 1


if __name__ == "__main__":
    raise SystemExit(main())
