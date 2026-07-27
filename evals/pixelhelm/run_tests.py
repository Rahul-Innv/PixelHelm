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
import tomllib
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


INVENTORY_COMPONENT_PATHS = (
    "evals/choicegate/inventory-fixtures.json",
    "evals/choicegate/manifest.json",
    "evals/choicegate/routing-cases.json",
    "registry/bundles.json",
    "registry/capabilities.json",
    "registry/conflicts.json",
    "registry/dependencies.json",
    "registry/preconditions.json",
    "registry/schemas/bundle.schema.json",
    "registry/schemas/capability.schema.json",
    "registry/schemas/conflict.schema.json",
    "registry/schemas/dependency.schema.json",
    "registry/schemas/precondition.schema.json",
    "registry/schemas/supersession.schema.json",
    "registry/state-axes.json",
    "registry/supersessions.json",
)

SCOPE_KEYS = (
    "local_files_only", "outward_messages", "paid_actions",
    "provider_configuration", "provider_use", "remote_actions", "write_files",
)


def canonical_json_bytes(value) -> bytes:
    return json.dumps(value, ensure_ascii=False, sort_keys=True, separators=(",", ":")).encode("utf-8")


def frontend_continuation() -> dict:
    # Builds the boundary request against the accepted public ChoiceGate router
    # (scripts/route_capabilities.py CLI) — the pre-rewrite private harness the
    # earlier version imported no longer ships with ChoiceGate.
    assert CHOICEGATE_ROOT and INVENTORY_ROOT
    components = []
    for path in INVENTORY_COMPONENT_PATHS:
        content = (INVENTORY_ROOT / path).read_text(encoding="utf-8")
        digest = hashlib.sha256(content.encode("utf-8")).hexdigest()
        components.append({"path": path, "sha256": digest, "content_utf8": content})
    manifest = "".join(f"{c['path']}\t{c['sha256']}\n" for c in sorted(components, key=lambda c: c["path"]))
    fingerprint = hashlib.sha256(manifest.encode("utf-8")).hexdigest()
    if fingerprint != FAMILY["inventory"]["inventory_fingerprint"]:
        raise AssertionError(f"inventory root does not reproduce the accepted fingerprint: {fingerprint}")
    policy = {
        "policy_version": "choicegate-router-policy/v1",
        "normal_ceiling": 8,
        "freshness_policy_id": "accepted-snapshot-explicit-v1",
        "explicit_owner_approved_setup_paths": [],
    }
    policy["policy_sha256"] = hashlib.sha256(canonical_json_bytes(policy)).hexdigest()
    request = {
        "contract_version": "choicegate.route-request/v1",
        "request_id": "pixelhelm-frontend-design-boundary",
        "evaluation_time_utc": "2026-07-26T00:00:00Z",
        "task": {
            "task_class": "frontend-design",
            "required_outcomes": ["frontend-design"],
            "allowed_scope": {key: key in ("local_files_only", "write_files") for key in SCOPE_KEYS},
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
            "risk_flags": [], "required_scope": {key: False for key in SCOPE_KEYS},
            "required_private_data_class": "none",
        }],
        "inventory": {
            "schema_version": 1,
            "accepted_registry_commit": FAMILY["inventory"]["commit"],
            "state_model_id": "orthogonal-seven-axis-v1",
            "manifest_algorithm": "sha256-path-hash-manifest-v1",
            "manifest_fingerprint": fingerprint,
            "components": components,
        },
        "policy": policy,
    }
    router = command(
        sys.executable, "-B", str(CHOICEGATE_ROOT / "scripts/route_capabilities.py"),
        "--choicegate-commit", FAMILY["choicegate"]["commit"], "-",
        cwd=CHOICEGATE_ROOT, input_bytes=canonical_json_bytes(request) + b"\n",
    )
    if router.returncode != 0:
        raise AssertionError(f"accepted router rejected the original selection: {router.stderr.decode()}")
    prior = json.loads(router.stdout)
    decision = prior.get("decision", {})
    if not (decision.get("route_id") == "frontend-design" and decision.get("route_type") == "atomic" and decision.get("executable") is True):
        raise AssertionError(f"original selection is not executable atomic frontend-design: {decision}")
    continuation = copy.deepcopy(request)
    continuation["prior_receipt"] = prior
    continuation["task"]["owner_selected_route_id"] = "frontend-design"
    continuation["task"]["selected_path_failed"] = False
    return continuation


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
        canonical = "https://gitlab.com/krahul02004/PixelHelm"
        self.assertEqual(canonical, config["marketplace"]["repoUrl"])
        self.assertEqual(canonical, FAMILY["repository_url"])
        self.assertEqual("confirmed-public", FAMILY["repository_url_status"])
        marketplace = json.loads((ROOT / ".claude-plugin/marketplace.json").read_text(encoding="utf-8"))
        self.assertEqual(config["marketplace"]["description"], marketplace["description"])
        self.assertEqual({"2.0.0"}, {item["version"] for item in marketplace["plugins"]})
        for edition in ("pixelhelm-lite", "pixelhelm-full"):
            manifest = json.loads(
                (ROOT / "plugins" / edition / ".claude-plugin/plugin.json").read_text(encoding="utf-8")
            )
            self.assertEqual("2.0.0", manifest["version"])
            self.assertEqual("Rahul Krishna", manifest["author"]["name"])
            self.assertEqual(canonical, manifest["homepage"])

    def test_readme_python_prerequisite_matches_package_metadata(self) -> None:
        metadata = tomllib.loads((ROOT / "pyproject.toml").read_text(encoding="utf-8"))
        self.assertEqual(">=3.12", metadata["project"]["requires-python"])
        readme = (ROOT / "README.md").read_text(encoding="utf-8")
        self.assertIn("Python 3.12+ for the `pixelhelm` evidence engine on PyPI", readme)

    def test_python_package_metadata_links_to_public_project(self) -> None:
        metadata = tomllib.loads((ROOT / "pyproject.toml").read_text(encoding="utf-8"))
        self.assertEqual("0.1.2", metadata["project"]["version"])
        package_init = (ROOT / "packaging/pixelhelm/__init__.py").read_text(encoding="utf-8")
        self.assertIn('__version__ = "0.1.2"', package_init)
        self.assertEqual(
            {
                "Repository": "https://gitlab.com/krahul02004/PixelHelm",
                "Issues": "https://gitlab.com/krahul02004/PixelHelm/-/work_items",
                "Changelog": "https://gitlab.com/krahul02004/PixelHelm/-/blob/main/CHANGELOG.md",
            },
            metadata["project"]["urls"],
        )
        # The README's advertised suite size must match what this file actually declares
        # (docs-equal-code, CONTRIBUTING). Derived, not literal: the old literal had
        # drifted to 30 while the suite ran 31.
        # Without the private roots, ChoiceGateBoundaryTests skips as a class (the one
        # "skipped=1"), so the advertised count is exactly FamilyTests' method count.
        declared = sum(1 for name in dir(FamilyTests) if name.startswith("test"))
        readme = (ROOT / "README.md").read_text(encoding="utf-8")
        self.assertIn(f"Ran {declared} tests ... OK (skipped=1)", readme)
        self.assertIn(f"a {declared}-test offline suite", readme)
        current_surfaces = "\n".join(
            (ROOT / relative).read_text(encoding="utf-8")
            for relative in ("README.md", "STATUS.md", "docs/public/RELEASE-CANDIDATE.md")
        )
        self.assertNotIn("17-check", current_surfaces)
        self.assertNotIn("17-test", current_surfaces)
        self.assertIn("prepared `pixelhelm` Python distribution source (`0.1.2`)", current_surfaces)
        self.assertIn("current Python slice on PyPI still `pixelhelm` `0.1.1`", current_surfaces)
        self.assertNotIn("No PyPI upload is performed or claimed", current_surfaces)

    def test_private_readiness_surfaces_are_complete_and_owner_gated(self) -> None:
        required = (
            "CONTRIBUTING.md", "SECURITY.md", "CODE_OF_CONDUCT.md", "ROADMAP.md",
            ".gitlab/issue_templates/Bug.md", ".gitlab/issue_templates/Feature.md",
            ".gitlab/merge_request_templates/Default.md",
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
        canonical = "https://gitlab.com/krahul02004/PixelHelm"
        self.assertIn(canonical, joined)
        self.assertEqual(joined.count("https://gitlab.com/"), joined.count(canonical))
        self.assertNotIn("intentionally unset", joined)

    def test_no_user_specific_absolute_path_in_candidate(self) -> None:
        sensitive_forward = "C:/Users" + "/"
        sensitive_windows = "C:" + "\\" + "Users" + "\\"
        # JSON-escaped variant (the drive prefix followed by doubled backslashes
        # before "Users") — leaked through the 2026-07-26 E1 run artifacts unseen
        # by the two checks above.
        sensitive_escaped = "C:" + "\\\\" + "Users"
        for path in ROOT.rglob("*"):
            # .claude holds other sessions' live worktrees — transient state, not
            # part of this tree; scanning it makes the suite fail on files this
            # repo does not ship.
            if not path.is_file() or ".git" in path.parts or ".claude" in path.parts or ".build-check-" in path.as_posix():
                continue
            if path.suffix.lower() not in {".md", ".json", ".mjs", ".py", ".txt", ".yml", ".yaml"}:
                continue
            text = path.read_text(encoding="utf-8", errors="replace")
            self.assertNotIn(sensitive_forward, text, str(path))
            self.assertNotIn(sensitive_windows, text, str(path))
            self.assertNotIn(sensitive_escaped, text, str(path))

    EVALUATE_SCRIPTS = "skills/pixelhelm-evaluate/scripts"
    LOOP_SCRIPTS = "skills/pixelhelm-loop/scripts"
    BASELINE_SCRIPTS = "skills/pixelhelm-baseline/scripts"

    def _floor_validator_common(self, script: str, usage_token: str) -> Path:
        """Presence in both editions + syntax + loud usage exit 2; returns the lite copy."""
        for edition in ("pixelhelm-full", "pixelhelm-lite"):
            base = ROOT / "plugins" / edition / self.EVALUATE_SCRIPTS
            self.assertTrue((base / script).is_file(), f"{edition}/{script}")
            self.assertTrue((base / "verify_lib.mjs").is_file(), edition)
        lite = ROOT / "plugins/pixelhelm-lite" / self.EVALUATE_SCRIPTS / script
        checked = command("node", "--check", str(lite))
        self.assertEqual(0, checked.returncode, checked.stderr.decode())
        bare = command("node", str(lite))
        self.assertEqual(2, bare.returncode)
        self.assertIn(usage_token.encode(), bare.stderr)
        return lite

    def _committed_gate_artifact(self, name: str) -> dict:
        artifact = ROOT / "examples/harborline/gates" / name
        self.assertTrue(artifact.is_file(), name)
        return json.loads(artifact.read_text(encoding="utf-8"))

    def test_verify_responsive_validator_contract(self) -> None:
        self._floor_validator_common("verify_responsive.mjs", "usage: node verify_responsive.mjs")
        run = self._committed_gate_artifact("verify_responsive.json")
        self.assertEqual("verify_responsive", run["validator"])
        self.assertEqual([280, 320, 414], run["widths"])
        # The original committed FAIL (stations table overflow at 280/320) was cleared
        # by the 2026-07-26 repair pass (the table got its own overflow-x container);
        # the committed record must now show zero page-level overflow at every width.
        self.assertTrue(run["pass"])
        for cell in run["targets"][0]["cells"]:
            self.assertTrue(cell["pass"], cell)
            self.assertEqual(0, cell["overflowPx"])
            self.assertEqual([], cell["culprits"])

    def test_verify_states_validator_contract(self) -> None:
        self._floor_validator_common("verify_states.mjs", "usage: node verify_states.mjs")
        run = self._committed_gate_artifact("verify_states.json")
        self.assertEqual("verify_states", run["validator"])
        self.assertEqual(["light", "dark"], run["modes"])
        self.assertEqual({"normalText": 4.5, "largeTextOrIcon": 3}, run["thresholds"])
        self.assertTrue(run["pass"])
        for mode in run["targets"][0]["modes"]:
            self.assertEqual(0, mode["controls"])  # explicit zero-measure, not implied conformance

    def test_verify_focustrap_validator_contract(self) -> None:
        self._floor_validator_common("verify_focustrap.mjs", "usage: node verify_focustrap.mjs")
        run = self._committed_gate_artifact("verify_focustrap.json")
        self.assertEqual("verify_focustrap", run["validator"])
        self.assertFalse(run["applicable"])  # no dialog: explicit not-applicable, never a silent pass
        self.assertEqual("applicability", run["findings"][0]["id"])

    def test_verify_targetsize_validator_contract(self) -> None:
        lite = self._floor_validator_common("verify_targetsize.mjs", "usage: node verify_targetsize.mjs")
        bad_viewport = command("node", str(lite), "x.html", "--viewport", "bogus")
        self.assertEqual(2, bad_viewport.returncode)
        run = self._committed_gate_artifact("verify_targetsize.json")
        self.assertEqual("verify_targetsize", run["validator"])
        self.assertEqual(24, run["minPx"])
        self.assertTrue(run["pass"])
        self.assertEqual(0, run["targets"][0]["measured"])

    def test_verify_scrollcapture_validator_contract(self) -> None:
        lite = self._floor_validator_common("verify_scrollcapture.mjs", "usage: node verify_scrollcapture.mjs")
        bad_positions = command("node", str(lite), "x.html", "--positions", "bogus")
        self.assertEqual(2, bad_positions.returncode)
        run = self._committed_gate_artifact("verify_scrollcapture.json")
        self.assertEqual("verify_scrollcapture", run["validator"])
        self.assertEqual(2, run["contract"]["passes"])
        self.assertEqual("killed", run["contract"]["animations"])
        self.assertTrue(run["pass"])
        entry = run["targets"][0]
        self.assertTrue(entry["readiness"]["layoutSettled"])  # the page-readiness contract held
        self.assertEqual(5, len(entry["captures"]))
        for capture in entry["captures"]:
            self.assertLessEqual(capture["deltaPx"], 1)
            self.assertTrue(capture["reproduced"])
            self.assertTrue(capture["stable"])

    def test_verify_frametime_validator_contract(self) -> None:
        lite = self._floor_validator_common("verify_frametime.mjs", "usage: node verify_frametime.mjs")
        bad_budget = command("node", str(lite), "x.html", "--budget-p95", "bogus")
        self.assertEqual(2, bad_budget.returncode)
        desktop = self._committed_gate_artifact("verify_frametime.json")
        self.assertEqual("verify_frametime", desktop["validator"])
        self.assertEqual({"p95Ms": 16.7, "jitterAllowanceMs": 1}, desktop["budget"])
        self.assertEqual("desktop", desktop["profile"]["name"])
        self.assertTrue(desktop["pass"])
        # The scheduling-stall exclusion is mobile-profile-only: the desktop record
        # must not carry it (re-registration 2026-07-26, layer-1-gates.md).
        self.assertNotIn("schedulingStallExclusion", desktop["targets"][0])
        mobile = self._committed_gate_artifact("verify_frametime.mobile.json")
        # Budgets are UNCHANGED by the re-registration — only the diagnosed harness
        # stall (one gap per scripted wheel step) is excluded before percentile math.
        self.assertEqual({"p95Ms": 33, "jitterAllowanceMs": 1}, mobile["budget"])
        self.assertEqual("emulated-mobile", mobile["profile"]["name"])
        self.assertEqual(4, mobile["profile"]["cpuThrottleRate"])
        self.assertEqual({"width": 375, "height": 812}, mobile["profile"]["viewport"])
        entry = mobile["targets"][0]
        # Nothing silently dropped: the record carries the wheel-step count, every
        # excluded gap's size, and the pre-exclusion sample count.
        exclusion = entry["schedulingStallExclusion"]
        self.assertEqual(exclusion["excludedCount"], len(exclusion["excludedGapsMs"]))
        self.assertLessEqual(exclusion["excludedCount"], exclusion["wheelSteps"])
        self.assertEqual(entry["samplesBeforeExclusion"], entry["samples"] + exclusion["excludedCount"])
        self.assertTrue(mobile["pass"])  # post-re-registration run: p95 within the unchanged 33 + 1 ms budget
        frame = entry["frameMs"]
        self.assertLessEqual(frame["p95"], 33 + 1)
        self.assertLessEqual(frame["p50"], frame["p95"])
        self.assertLessEqual(frame["p95"], frame["max"])
        self.assertGreater(entry["samples"], 0)

    def test_verify_cwv_validator_contract(self) -> None:
        self._floor_validator_common("verify_cwv.mjs", "usage: node verify_cwv.mjs")
        run = self._committed_gate_artifact("verify_cwv.json")
        self.assertEqual("verify_cwv", run["validator"])
        self.assertEqual({"lcpMs": 2500, "cls": 0.1, "inpProxyMs": 200}, run["budgets"])
        self.assertTrue(run["pass"])
        self.assertEqual(["desktop", "emulated-mobile"], [p["name"] for p in run["profiles"]])
        for profile in run["profiles"]:
            entry = profile["targets"][0]
            self.assertEqual(0, entry["metrics"]["inpProxy"]["interactiveElements"])
            checks = {c["id"]: c for c in entry["checks"]}
            self.assertTrue(checks["INP-proxy"]["na"])  # explicit zero-measure, never implied responsiveness
            self.assertTrue(checks["LCP"]["ok"])
            self.assertTrue(checks["CLS"]["ok"])
        mobile = run["profiles"][1]
        self.assertEqual(4, mobile["cpuThrottleRate"])
        self.assertEqual(2, mobile["deviceScaleFactor"])

    def test_verify_keyboard_validator_contract(self) -> None:
        self._floor_validator_common("verify_keyboard.mjs", "usage: node verify_keyboard.mjs")
        run = self._committed_gate_artifact("verify_keyboard.json")
        self.assertEqual("verify_keyboard", run["validator"])
        self.assertTrue(run["pass"])
        self.assertEqual(0, run["measured"])  # explicit zero-measure, not a keyboard-support conformance claim
        self.assertEqual("applicability", run["findings"][0]["id"])
        self.assertEqual("left-document", run["traversalEnd"])

    def test_verify_lib_pure_math_is_exact(self) -> None:
        lib = ROOT / "plugins/pixelhelm-lite" / self.EVALUATE_SCRIPTS / "verify_lib.mjs"
        probe = (
            "const{pathToFileURL}=require('node:url');"
            "import(pathToFileURL(process.argv[1]).href).then(m=>{"
            "const out={"
            "blackOnWhite:m.contrastRatio('#000000',{r:255,g:255,b:255}),"
            "compositedGrey:m.contrastRatio('rgba(0, 0, 0, 0.5)',{r:255,g:255,b:255}),"
            "large:[m.isLargeText(24,'400'),m.isLargeText(18.66,'700'),m.isLargeText(18.66,'400')],"
            "clustered:m.spacingExceptionHolds(0,[{x:0,y:0,w:16,h:16},{x:16,y:0,w:16,h:16}],new Set([0,1])),"
            "isolated:m.spacingExceptionHolds(0,[{x:0,y:0,w:16,h:16},{x:200,y:200,w:16,h:16}],new Set([0,1])),"
            "pcts:[m.percentile([5,1,9,3],50),m.percentile([5,1,9,3],95),m.percentile([5,1,9,3],100),m.percentile([],50)],"
            "diff:m.diffStyles({a:'1',b:'2'},{b:'3',a:'1',c:'x'})};"
            "console.log(JSON.stringify(out));})"
        )
        result = command("node", "-e", probe, str(lib))
        self.assertEqual(0, result.returncode, result.stderr.decode())
        out = json.loads(result.stdout)
        self.assertEqual(21, out["blackOnWhite"])
        self.assertEqual(3.95, out["compositedGrey"])  # 50% black composited over white = rgb(128,128,128)
        self.assertEqual([True, True, False], out["large"])
        self.assertFalse(out["clustered"])
        self.assertTrue(out["isolated"])
        self.assertEqual([3, 9, 9, None], out["pcts"])  # nearest-rank: ceil(p/100 * n), empty input -> null
        self.assertEqual(["b", "c"], out["diff"])

    def test_output_floor_gate_fires_and_harborline_clears(self) -> None:
        gate = ROOT / "plugins/pixelhelm-lite" / self.EVALUATE_SCRIPTS / "output-floor-gate.mjs"
        for edition in ("pixelhelm-full", "pixelhelm-lite"):
            self.assertTrue((ROOT / "plugins" / edition / self.EVALUATE_SCRIPTS / "output-floor-gate.mjs").is_file())
        self.assertEqual(2, command("node", str(gate)).returncode)

        def fails_of(raw: bytes) -> set[str]:
            report = json.loads(raw)
            return {f["id"] for t in report["targets"] for f in t["findings"] if f["level"] == "fail"}

        with tempfile.TemporaryDirectory() as temporary:
            good = Path(temporary) / "good.html"
            good.write_text(
                "<!DOCTYPE html><html lang='en'><head><meta name=\"description\" content=\"A page.\">"
                "<title>t</title></head><body><header>h</header><nav>n</nav><main><h1>One</h1>"
                "<h2>Two</h2></main><footer>f</footer></body></html>", encoding="utf-8")
            passed = command("node", str(gate), str(good), "--json")
            self.assertEqual(0, passed.returncode, passed.stdout.decode())
            bad = Path(temporary) / "bad.html"
            bad.write_text(
                "<!DOCTYPE html><html lang='en'><head><title>t</title></head><body>"
                "<h1>One</h1><h4>Skipped</h4><div class=\"section-title\">Impostor</div></body></html>",
                encoding="utf-8")
            failed = command("node", str(gate), str(bad), "--json")
            self.assertEqual(1, failed.returncode)
            self.assertEqual(
                {"landmark-main", "heading-order", "heading-impostor", "meta-description"},
                fails_of(failed.stdout))

        # The worked example cleared its three original gaps in the 2026-07-26 repair
        # pass (examples/harborline/repairs/2026-07-26/REPAIR.md); live run and
        # committed artifact must agree that the floor is now met.
        harborline = command("node", str(gate), "examples/harborline/status-page.html", "--json")
        self.assertEqual(0, harborline.returncode, harborline.stdout.decode())
        self.assertEqual(set(), fails_of(harborline.stdout))
        committed = self._committed_gate_artifact("output-floor-gate.json")
        self.assertTrue(committed["pass"])
        committed_fails = {f["id"] for t in committed["targets"] for f in t["findings"] if f["level"] == "fail"}
        self.assertEqual(set(), committed_fails)

    def test_judge_record_writer_validates_and_archives(self) -> None:
        records = ROOT / "plugins/pixelhelm-lite" / self.LOOP_SCRIPTS / "records.mjs"
        for edition in ("pixelhelm-full", "pixelhelm-lite"):
            self.assertTrue((ROOT / "plugins" / edition / self.LOOP_SCRIPTS / "records.mjs").is_file())
        self.assertEqual(2, command("node", str(records)).returncode)
        template = command("node", str(records), "template", "judge-verdict")
        self.assertEqual(0, template.returncode)
        self.assertEqual("pixelhelm/judge-verdict@1", json.loads(template.stdout)["schema"])

        verdict = {
            "schema": "pixelhelm/judge-verdict@1",
            "date": "2026-07-26", "project": "eval-fixture", "surface": "Status Page",
            "mode": "review", "pass": "fast",
            "candidates": {
                "incumbent": {"label": "current", "kind": "incumbent", "render": "renders/a.png"},
                "b": {"label": "challenger", "kind": "challenger", "render": "renders/b.png"},
            },
            "registerFitPanel": {
                "jurors": 5,
                "scores": {"incumbent": [7, 8, 7, 9, 8], "b": [6, 7, 6, 5, 7]},
                "medians": {"incumbent": 8, "b": 6},
                "nonOverlapping": True, "modeFairness": "both-modes",
            },
            "lensScores": {"craft": {"incumbent": 8, "b": 7}},
            "constraints": [{"seat": "honesty", "finding": "none open", "severity": "minor"}],
            "aggregation": {"contract": "gates-and-loop.md 2026-07-26", "weightedScores": {}, "guardOutcome": "incumbent holds"},
            "winner": "incumbent",
            "registerSafeGrafts": [], "rejectedGrafts": [],
            "rejectedDirections": [{"direction": "neon dashboard", "why": "off register"}],
            "ownerVerdict": None,
        }
        raw = json.dumps(verdict).encode("utf-8")
        with tempfile.TemporaryDirectory() as temporary:
            project = Path(temporary) / "proj"
            written = command("node", str(records), "write", "judge-verdict", "--project", str(project), input_bytes=raw)
            self.assertEqual(0, written.returncode, written.stderr.decode())
            archive = project / ".pixelhelm/council/2026-07-26--status-page--council.json"
            self.assertTrue(archive.is_file())
            self.assertEqual(0, command("node", str(records), "validate", str(archive)).returncode)
            ledger = (project / ".pixelhelm/council/ledger.md").read_text(encoding="utf-8")
            self.assertIn("| 2026-07-26 | Status Page | review/fast | winner: incumbent |", ledger)
            self.assertEqual(1, command("node", str(records), "write", "judge-verdict", "--project", str(project), input_bytes=raw).returncode)

            tampered = copy.deepcopy(verdict)
            tampered["registerFitPanel"]["medians"]["incumbent"] = 9
            tampered["winner"] = "ghost"
            bad = Path(temporary) / "tampered.json"
            bad.write_text(json.dumps(tampered), encoding="utf-8")
            invalid = command("node", str(records), "validate", str(bad))
            self.assertEqual(1, invalid.returncode)
            self.assertIn(b"does not equal the median", invalid.stdout)

            signoff = {
                "schema": "pixelhelm/signoff@1", "date": "2026-07-26", "project": "eval-fixture",
                "surface": "Status Page", "artifact": "council/2026-07-26--status-page--council.json",
                "decision": "approved", "ownerWords": "ship it", "clarifies": "none", "followUp": ["none"],
            }
            self.assertEqual(0, command("node", str(records), "write", "signoff", "--project", str(project),
                                        input_bytes=json.dumps(signoff).encode()).returncode)
            self.assertTrue((project / ".pixelhelm/signoffs/2026-07-26--status-page.json").is_file())
            signoff["decision"] = "maybe"
            self.assertEqual(1, command("node", str(records), "write", "signoff", "--project", str(project),
                                        input_bytes=json.dumps(signoff).encode()).returncode)

            run_record = json.loads(command("node", str(records), "template", "run").stdout)
            run_record.update({"date": "2026-07-26", "project": "eval-fixture", "surface": "Status Page",
                               "intent": "eval fixture", "workerModel": "offline",
                               # REQUIRED on every new run record — see
                               # test_intent_elicitation_is_required_on_new_run_records.
                               "intentElicitation": {
                                   "asked": True,
                                   "ownerWords": "quiet, like transit signage; nothing that looks sold to me",
                                   "capturedInto": "ground-context.md",
                                   "waived": False, "waiverWords": "",
                               }})
            self.assertEqual(0, command("node", str(records), "write", "run", "--project", str(project),
                                        input_bytes=json.dumps(run_record).encode()).returncode)
            self.assertTrue((project / ".pixelhelm/runs/2026-07-26--status-page--run.json").is_file())

    def test_juror_record_writer_validates_and_archives(self) -> None:
        records = ROOT / "plugins/pixelhelm-lite" / self.LOOP_SCRIPTS / "records.mjs"
        template = command("node", str(records), "template", "juror-record")
        self.assertEqual(0, template.returncode)
        self.assertEqual("pixelhelm/juror-record@1", json.loads(template.stdout)["schema"])

        juror = {
            "schema": "pixelhelm/juror-record@1",
            "date": "2026-07-26", "project": "eval-fixture", "surface": "Status Page",
            "jurorId": "juror-1", "blindLabel": "candidate-A",
            "rubric": "evals/validation/e1/PREREG-RUBRIC-utility.md",
            "scores": {"1": 7, "2": 8},
            "rationales": {"1": "Scannable at a glance. The alert is visible on mobile.",
                           "2": "Statuses stay distinct without color."},
            "inputTranscriptSha256": "a" * 64,
            "shuffleSeed": "seed-1734",
        }
        with tempfile.TemporaryDirectory() as temporary:
            project = Path(temporary) / "proj"
            raw = json.dumps(juror).encode("utf-8")
            written = command("node", str(records), "write", "juror-record", "--project", str(project), input_bytes=raw)
            self.assertEqual(0, written.returncode, written.stderr.decode())
            archive = project / ".pixelhelm/jurors/2026-07-26--status-page--juror-1--candidate-a.json"
            self.assertTrue(archive.is_file())
            self.assertEqual(0, command("node", str(records), "validate", str(archive)).returncode)
            # append-only: the same juror scoring the same blind label is refused
            self.assertEqual(1, command("node", str(records), "write", "juror-record", "--project", str(project), input_bytes=raw).returncode)
            # a second candidate from the same juror is its own archive (one record per juror per candidate)
            second = dict(juror, blindLabel="candidate-B")
            self.assertEqual(0, command("node", str(records), "write", "juror-record", "--project", str(project),
                                        input_bytes=json.dumps(second).encode()).returncode)
            self.assertTrue((project / ".pixelhelm/jurors/2026-07-26--status-page--juror-1--candidate-b.json").is_file())

            # behavioral rejections: non-integer/out-of-scale scores, bad criterion keys,
            # over-long rationales, missing rationales, malformed transcript hash
            for mutation, expected in [
                (dict(juror, scores={"1": 7.5, "2": 8}), b"must be an integer 0..10"),
                (dict(juror, scores={"0": 7, "2": 8}), b"not a rubric criterion number"),
                (dict(juror, rationales={"1": "One. Two. Three sentences is too many.",
                                         "2": juror["rationales"]["2"]}), b"max 2 per criterion"),
                (dict(juror, rationales={"1": juror["rationales"]["1"]}), b'missing criterion "2"'),
                (dict(juror, inputTranscriptSha256="beef"), b"64 lowercase hex chars"),
            ]:
                bad = Path(temporary) / "bad.json"
                bad.write_text(json.dumps(mutation), encoding="utf-8")
                invalid = command("node", str(records), "validate", str(bad))
                self.assertEqual(1, invalid.returncode, invalid.stdout.decode())
                self.assertIn(expected, invalid.stdout)

            # panel integrity is SOFT: a judge-verdict with no matching juror records
            # writes (exit 0) but WARNS; with them present it stays silent.
            verdict = {
                "schema": "pixelhelm/judge-verdict@1",
                "date": "2026-07-26", "project": "eval-fixture", "surface": "Status Page",
                "mode": "review", "pass": "fast",
                "candidates": {"incumbent": {"label": "current", "kind": "incumbent", "render": "renders/a.png"}},
                "registerFitPanel": {"jurors": 3, "scores": {"incumbent": [7, 8, 8]},
                                     "medians": {"incumbent": 8}, "nonOverlapping": True, "modeFairness": "both-modes"},
                "lensScores": {}, "constraints": [],
                "aggregation": {"contract": "gates-and-loop.md 2026-07-26", "weightedScores": {}, "guardOutcome": "incumbent holds"},
                "winner": "incumbent", "registerSafeGrafts": [], "rejectedGrafts": [], "rejectedDirections": [],
                "ownerVerdict": None,
            }
            verdict_raw = json.dumps(verdict).encode("utf-8")
            with_jurors = command("node", str(records), "write", "judge-verdict", "--project", str(project), input_bytes=verdict_raw)
            self.assertEqual(0, with_jurors.returncode)
            self.assertNotIn(b"juror-record", with_jurors.stderr)
            bare_project = Path(temporary) / "bare"
            without_jurors = command("node", str(records), "write", "judge-verdict", "--project", str(bare_project), input_bytes=verdict_raw)
            self.assertEqual(0, without_jurors.returncode)  # soft: never a refusal (old records predate the schema)
            self.assertIn(b"juror-record", without_jurors.stderr)

    def test_judge_verdict_floor_precondition_is_enforced_softly(self) -> None:
        """R1/R2 repair: floor evidence WARNS (never refuses) and the new shapes validate.

        Repair decision: evals/validation/E4-JUDGING-SEAT-REPAIR-DECISION.md. A scored
        candidate must reference its floor artifacts; a floor-failing or gate-less
        candidate belongs in `unscored`, never "scored low".
        """
        records = ROOT / "plugins/pixelhelm-lite" / self.LOOP_SCRIPTS / "records.mjs"
        for edition in ("pixelhelm-full", "pixelhelm-lite"):
            self.assertTrue((ROOT / "plugins" / edition / self.LOOP_SCRIPTS / "records.mjs").is_file())
        template = json.loads(command("node", str(records), "template", "judge-verdict").stdout)
        # the template teaches the repaired shape
        self.assertEqual({"gateOutputs": [], "notRun": []}, template["candidates"]["incumbent"]["floorEvidence"])
        self.assertEqual([], template["unscored"])

        def verdict(**overrides) -> dict:
            base = {
                "schema": "pixelhelm/judge-verdict@1",
                "date": "2026-07-27", "project": "eval-fixture", "surface": "Floor Seam",
                "mode": "new-design", "pass": "fast",
                "candidates": {
                    "a": {"label": "A", "kind": "challenger", "render": "renders/a.png",
                          "floorEvidence": {"gateOutputs": ["gates/a/static-gates.json"], "notRun": ["verify_cwv"]}},
                },
                "unscored": [{"candidate": "plant", "gate": "verify_targetsize",
                              "why": "7 controls below the 24px minimum; excluded before scoring"}],
                "registerFitPanel": {"jurors": 3, "scores": {"a": [7, 8, 8]}, "medians": {"a": 8},
                                     "nonOverlapping": True, "modeFairness": "both-modes"},
                "lensScores": {}, "constraints": [],
                "aggregation": {"contract": "gates-and-loop.md 2026-07-27", "weightedScores": {},
                                "guardOutcome": "no incumbent"},
                "winner": "a", "registerSafeGrafts": [], "rejectedGrafts": [], "rejectedDirections": [],
                "ownerVerdict": None,
            }
            base.update(overrides)
            return base

        def write(record: dict, project: Path) -> subprocess.CompletedProcess[bytes]:
            return command("node", str(records), "write", "judge-verdict", "--project", str(project),
                           input_bytes=json.dumps(record).encode("utf-8"), )

        with tempfile.TemporaryDirectory() as temporary:
            temp = Path(temporary)

            # 1. floor evidence present on every scored candidate -> written, no floor warning
            clean = write(verdict(), temp / "clean")
            self.assertEqual(0, clean.returncode, clean.stderr.decode())
            self.assertNotIn(b"floor evidence", clean.stderr)

            # 2. no floorEvidence at all -> SOFT: still written (exit 0), but warns
            bare_candidates = {"a": {"label": "A", "kind": "challenger", "render": "renders/a.png"}}
            warned = write(verdict(candidates=bare_candidates), temp / "bare")
            self.assertEqual(0, warned.returncode, warned.stderr.decode())
            self.assertIn(b"no referenced floor evidence: a", warned.stderr)
            self.assertIn(b'belongs in "unscored", never scored low', warned.stderr)

            # 3. floorEvidence present but empty -> same warning (a prose pass is not evidence)
            empty = {"a": {"label": "A", "kind": "challenger", "render": "renders/a.png",
                           "floorEvidence": {"gateOutputs": [], "notRun": []}}}
            empty_json = command("node", str(records), "write", "judge-verdict", "--project",
                                 str(temp / "empty"), "--json",
                                 input_bytes=json.dumps(verdict(candidates=empty)).encode())
            self.assertEqual(0, empty_json.returncode, empty_json.stderr.decode())
            payload = json.loads(empty_json.stdout)
            self.assertTrue(payload["valid"])
            self.assertEqual(1, len([w for w in payload["warnings"] if "floor evidence" in w]))

            # 4. behavioral rejections of the new shapes (opt-in: absent stays valid)
            for mutation, expected in [
                ({"candidates": {"a": {"label": "A", "kind": "challenger", "render": "renders/a.png",
                                       "floorEvidence": {"gateOutputs": "gates/a"}}}},
                 b"must be an array of gate ARTIFACT paths"),
                ({"candidates": {"a": {"label": "A", "kind": "challenger", "render": "renders/a.png",
                                       "floorEvidence": {"gateOutputs": ["g.json"], "notRun": [""]}}}},
                 b"notRun must be an array of gate ids that did not run"),
                ({"unscored": [{"candidate": "plant", "gate": "verify_targetsize"}]},
                 b"must be { candidate, gate, why }"),
                ({"unscored": [{"candidate": "a", "gate": "verify_targetsize", "why": "below 24px"}]},
                 b"is also a scored candidate"),
            ]:
                bad = temp / "bad.json"
                bad.write_text(json.dumps(verdict(**mutation)), encoding="utf-8")
                invalid = command("node", str(records), "validate", str(bad))
                self.assertEqual(1, invalid.returncode, invalid.stdout.decode())
                self.assertIn(expected, invalid.stdout)

            # 5. a pre-repair record (neither field) still validates — old archives stay valid
            legacy = verdict(candidates=bare_candidates)
            legacy.pop("unscored")
            old = temp / "legacy.json"
            old.write_text(json.dumps(legacy), encoding="utf-8")
            self.assertEqual(0, command("node", str(records), "validate", str(old)).returncode)

    def _run_record(self, **overrides) -> dict:
        base = {
            "schema": "pixelhelm/run@1",
            "date": "2026-07-27", "project": "eval-fixture", "surface": "Trail Conditions",
            "intent": "new design", "edition": "lite", "workerModel": "offline",
            "skillsFired": ["pixelhelm-loop"], "engines": [],
            "council": {"pass": "fast", "seats": 7, "registerJurors": 5},
            "iterations": 0, "renders": {"items": 1, "cells": 4},
            "tokens": {"subagentsMeasured": 0, "workflowsMeasured": 0,
                       "note": "measured-only; main-context usage is not observable in-session"},
            "wallClockMinutes": 0, "outcome": "report-only", "notes": "",
        }
        base.update(overrides)
        return base

    def test_intent_elicitation_is_required_on_new_run_records(self) -> None:
        """The elicitation gate is ENFORCED, not described.

        Owner, E3 commerce sign-off 2026-07-26: "the loop should ASK the owner what
        theme and feeling is wanted before generating." A run that never asked cannot
        close its loop: `write run` REFUSES a record with no `intentElicitation`, and
        the loop treats a refused write as a blocking finding. `validate` stays
        permissive so run archives written before the rule remain valid.
        """
        records = ROOT / "plugins/pixelhelm-lite" / self.LOOP_SCRIPTS / "records.mjs"
        template = json.loads(command("node", str(records), "template", "run").stdout)
        self.assertEqual(
            {"asked": True, "ownerWords": "", "capturedInto": "", "waived": False, "waiverWords": ""},
            template["intentElicitation"])

        asked = {"asked": True, "ownerWords": "warm, unfussy, like a field notebook",
                 "capturedInto": ".pixelhelm/ground-context.md", "waived": False, "waiverWords": ""}
        waived = {"asked": False, "ownerWords": "", "capturedInto": "",
                  "waived": True, "waiverWords": "just pick something, I trust you"}

        def write(record: dict, project: Path) -> subprocess.CompletedProcess[bytes]:
            return command("node", str(records), "write", "run", "--project", str(project),
                           input_bytes=json.dumps(record).encode("utf-8"))

        with tempfile.TemporaryDirectory() as temporary:
            temp = Path(temporary)

            # 1. the field is absent -> HARD refusal, nothing written
            missing = self._run_record()
            self.assertNotIn("intentElicitation", missing)
            refused = write(missing, temp / "unasked")
            self.assertEqual(1, refused.returncode)
            self.assertIn(b"intentElicitation is REQUIRED", refused.stderr)
            self.assertIn(b"ASK the owner what theme and feeling is wanted before generating",
                          refused.stderr)
            self.assertFalse((temp / "unasked/.pixelhelm/runs").exists())

            # 2. asked-and-answered -> written
            ok = write(self._run_record(intentElicitation=asked), temp / "asked")
            self.assertEqual(0, ok.returncode, ok.stderr.decode())
            self.assertTrue((temp / "asked/.pixelhelm/runs/2026-07-27--trail-conditions--run.json").is_file())

            # 3. an explicit owner waiver, in the owner's words -> also written
            waived_ok = write(self._run_record(intentElicitation=waived), temp / "waived")
            self.assertEqual(0, waived_ok.returncode, waived_ok.stderr.decode())

            # 4. behavioral rejections — a half-answered or self-issued elicitation is not one
            for block, expected in [
                ({**asked, "ownerWords": ""}, b"VERBATIM answer"),
                ({**asked, "capturedInto": ""}, b"entered the ground context"),
                ({**waived, "waiverWords": ""}, b"self-issued waiver is not a waiver"),
                ({"asked": False, "waived": False, "ownerWords": "", "capturedInto": "", "waiverWords": ""},
                 b"a run that did neither is a process defect"),
                ({**asked, "waived": True, "waiverWords": "x"}, b"both asked and waived"),
                ("not an object", b"intentElicitation must be an object"),
            ]:
                bad = temp / "bad.json"
                bad.write_text(json.dumps(self._run_record(intentElicitation=block)), encoding="utf-8")
                invalid = command("node", str(records), "validate", str(bad))
                self.assertEqual(1, invalid.returncode, invalid.stdout.decode())
                self.assertIn(expected, invalid.stdout)

            # 5. a pre-rule archive (no field at all) still VALIDATES — only `write` refuses
            legacy = temp / "legacy-run.json"
            legacy.write_text(json.dumps(self._run_record()), encoding="utf-8")
            self.assertEqual(0, command("node", str(records), "validate", str(legacy)).returncode)

    def test_house_style_check_is_advisory_and_recorded(self) -> None:
        """The cross-run felt-variety check: ADVISORY by construction.

        E3 2026-07-26: every in-run divergence metric PASSED (dE00, layout class, motif
        Jaccard, blind-intent) while the owner saw "a theme, all of them are similar".
        So a multi-candidate verdict records what it compared the field against across
        prior runs — a WARNING when it does not, never a refusal, and never a veto over
        a winner. Cited evidence is required of any tell (the fingerprint ADD/PROMOTE rule).
        """
        records = ROOT / "plugins/pixelhelm-lite" / self.LOOP_SCRIPTS / "records.mjs"
        template = json.loads(command("node", str(records), "template", "judge-verdict").stdout)
        self.assertEqual({"comparedAgainst": [], "recurringSignatures": [], "verdict": "not-run", "why": ""},
                         template["houseStyleCheck"])

        def verdict(**overrides) -> dict:
            base = {
                "schema": "pixelhelm/judge-verdict@1",
                "date": "2026-07-27", "project": "eval-fixture", "surface": "Felt Variety",
                "mode": "new-design", "pass": "fast",
                "candidates": {
                    "a": {"label": "A", "kind": "challenger", "render": "renders/a.png",
                          "floorEvidence": {"gateOutputs": ["gates/a/static-gates.json"], "notRun": []}},
                    "b": {"label": "B", "kind": "challenger", "render": "renders/b.png",
                          "floorEvidence": {"gateOutputs": ["gates/b/static-gates.json"], "notRun": []}},
                },
                "registerFitPanel": {"jurors": 3, "scores": {"a": [7, 8, 8], "b": [6, 6, 7]},
                                     "medians": {"a": 8, "b": 6}, "nonOverlapping": True,
                                     "modeFairness": "both-modes"},
                "lensScores": {}, "constraints": [],
                "aggregation": {"contract": "gates-and-loop.md 2026-07-27", "weightedScores": {},
                                "guardOutcome": "no incumbent"},
                "winner": "a", "registerSafeGrafts": [], "rejectedGrafts": [], "rejectedDirections": [],
                "ownerVerdict": None,
            }
            base.update(overrides)
            return base

        cited = {
            "comparedAgainst": ["council/2026-07-26--catalog--council.json", "baselines/trail-ledger.png"],
            "recurringSignatures": [{
                "signature": "hero over a symmetric three-up over a ledger table",
                "evidence": "same spine in both prior committed winners; see the two records named above",
                "runs": ["2026-07-26 catalog", "2026-07-26 trail conditions"],
            }],
            "verdict": "house-style-tell", "why": "third run on the same spine",
        }

        with tempfile.TemporaryDirectory() as temporary:
            temp = Path(temporary)

            # absent on a multi-candidate verdict -> SOFT: written (exit 0) with a warning
            bare = command("node", str(records), "write", "judge-verdict", "--project", str(temp / "bare"),
                           input_bytes=json.dumps(verdict()).encode())
            self.assertEqual(0, bare.returncode, bare.stderr.decode())
            self.assertIn(b"no houseStyleCheck", bare.stderr)
            self.assertIn(b"ADVISORY", bare.stderr)

            # present -> written, no felt-variety warning; the tell does NOT unseat the winner
            with_check = command("node", str(records), "write", "judge-verdict", "--project",
                                 str(temp / "checked"), "--json",
                                 input_bytes=json.dumps(verdict(houseStyleCheck=cited)).encode())
            self.assertEqual(0, with_check.returncode, with_check.stderr.decode())
            payload = json.loads(with_check.stdout)
            self.assertTrue(payload["valid"])
            self.assertEqual([], [w for w in payload["warnings"] if "houseStyleCheck" in w])
            written = json.loads((temp / "checked/.pixelhelm/council/2026-07-27--felt-variety--council.json")
                                 .read_text(encoding="utf-8"))
            self.assertEqual("house-style-tell", written["houseStyleCheck"]["verdict"])
            self.assertEqual("a", written["winner"])  # advisory: recorded, never a veto

            # behavioral rejections: an uncited tell, a one-run tell, a silent not-run
            for mutation, expected in [
                ({**cited, "recurringSignatures": [dict(cited["recurringSignatures"][0], evidence="")]},
                 b"an uncited tell is not a finding"),
                ({**cited, "recurringSignatures": [dict(cited["recurringSignatures"][0], runs=["one run"])]},
                 b"runs: [>= 2 run refs]"),
                ({**cited, "verdict": "not-run", "why": ""},
                 b'silence must never read as "checked and clean"'),
                ({**cited, "verdict": "house-style-tell", "recurringSignatures": []},
                 b"requires at least one cited recurringSignatures entry"),
                ({**cited, "comparedAgainst": []},
                 b"claims a comparison happened"),
            ]:
                bad = temp / "bad.json"
                bad.write_text(json.dumps(verdict(houseStyleCheck=mutation)), encoding="utf-8")
                invalid = command("node", str(records), "validate", str(bad))
                self.assertEqual(1, invalid.returncode, invalid.stdout.decode())
                self.assertIn(expected, invalid.stdout)

            # a pre-rule record (no houseStyleCheck at all) still validates
            legacy = temp / "legacy.json"
            legacy.write_text(json.dumps(verdict()), encoding="utf-8")
            self.assertEqual(0, command("node", str(records), "validate", str(legacy)).returncode)

    def test_em_dash_fingerprint_fires_through_the_anticliche_grep(self) -> None:
        """The AI-voice copy tell is WIRED, not just described — and it stays SOFT.

        Owner, E3 editorial sign-off 2026-07-26: em dashes were present in all three
        arms, "not supposed to be there". The `ai-em-dash-copy` fingerprint ships in the
        seed registry with greppable needles, the shipped example profile carries the
        cluster, and design-evaluate's existing anti-cliche grep matches it. The gate is
        SOFT by contract: matches are reported, the exit code stays 0.
        """
        seed_entry = None
        for edition in ("pixelhelm-full", "pixelhelm-lite"):
            seed = (ROOT / "plugins" / edition / "seeds/fingerprints-seed.md").read_text(encoding="utf-8")
            self.assertIn("id: ai-em-dash-copy", seed, edition)
            self.assertIn("id: uniform-paragraph-rhythm", seed, edition)
            self.assertIn("id: symmetric-three-card", seed, edition)
            for entry in seed.split("\n- id: "):
                if entry.startswith("ai-em-dash-copy"):
                    self.assertIn("status: active", entry.split("\n")[0], edition)
                    self.assertIn("scope: global", entry.split("\n")[0], edition)
                    needles = json.loads([l for l in entry.split("\n") if l.strip().startswith("any:")][0]
                                         .split("any:", 1)[1].strip())
                    seed_entry = needles if seed_entry is None else seed_entry
                    self.assertEqual(seed_entry, needles, edition)  # identical in both editions
        self.assertIsNotNone(seed_entry)
        self.assertIn("—", seed_entry)  # the em dash itself is the greppable needle

        # the shipped example profile actually carries the cluster (wired, not orphaned)
        for edition in ("pixelhelm-full", "pixelhelm-lite"):
            example = json.loads((ROOT / "plugins" / edition / "profiles/examples/example.json")
                                 .read_text(encoding="utf-8"))
            cluster = [c for c in example["bannedClusters"] if c["id"] == "ai-em-dash-copy"]
            self.assertEqual(1, len(cluster), edition)
            self.assertEqual(seed_entry, cluster[0]["any"], edition)

        gates = ROOT / "plugins/pixelhelm-lite" / self.EVALUATE_SCRIPTS / "static-gates.mjs"
        with tempfile.TemporaryDirectory() as temporary:
            temp = Path(temporary)
            (temp / "clean.html").write_text(
                "<p>Three trails are open. The ridge route is closed until Friday.</p>", encoding="utf-8")
            (temp / "tell.html").write_text(
                "<p>Three trails are open — the ridge route is closed until Friday.</p>\n"
                "<p>Conditions &mdash; updated hourly.</p>", encoding="utf-8")
            profile = {
                "project": "em-dash-fixture", "root": str(temp), "sourceDirs": ["."],
                "sourceExts": [".html"], "ignore": [], "allowRawColorIn": [], "tokenModule": None,
                "bannedClusters": [{"id": "ai-em-dash-copy", "any": seed_entry, "note": "AI-voice tell"}],
            }
            profile_path = temp / "profile.json"
            profile_path.write_text(json.dumps(profile), encoding="utf-8")

            run = command("node", str(gates), str(profile_path), "--json")
            self.assertEqual(0, run.returncode, run.stderr.decode())  # SOFT: a match never exits non-zero
            report = json.loads(run.stdout)
            anti = report["gates"]["antiCliche"]
            self.assertFalse(anti["hard"])  # the contract says soft, in the report itself
            self.assertTrue(report["hardGatesPassed"])
            hits = {(f["file"], f["cluster"]) for f in anti["findings"]}
            self.assertIn(("tell.html", "ai-em-dash-copy"), hits)
            self.assertNotIn(("clean.html", "ai-em-dash-copy"), hits)
            self.assertEqual(2, anti["count"])  # the character and its HTML entity both match

            # non-vacuous: drop the cluster and the same file reports clean
            profile_path.write_text(json.dumps({**profile, "bannedClusters": []}), encoding="utf-8")
            without = json.loads(command("node", str(gates), str(profile_path), "--json").stdout)
            self.assertEqual(0, without["gates"]["antiCliche"]["count"])

    def test_owner_findings_are_encoded_into_both_editions(self) -> None:
        """The five 2026-07-26 owner findings ship as machinery text, in BOTH editions.

        Sources: the four sign-offs under evals/validation/{e1,e3}/*/project/.pixelhelm/
        signoffs/ and design lessons L-082/L-083. Each finding is asserted where its
        enforcement level says it lives, and the advisory ones are asserted to SAY
        advisory (docs equal code: nothing is described as enforced unless it is).
        """
        for edition in ("pixelhelm-full", "pixelhelm-lite"):
            base = ROOT / "plugins" / edition / "skills"
            seam = (base / "pixelhelm-loop/references/gates-and-loop.md").read_text(encoding="utf-8")
            loop_records = (base / "pixelhelm-loop/references/close-the-loop.md").read_text(encoding="utf-8")
            loop_skill = (base / "pixelhelm-loop/SKILL.md").read_text(encoding="utf-8")
            judge = (base / "pixelhelm-judge/SKILL.md").read_text(encoding="utf-8")
            lenses = (base / "pixelhelm-judge/references/lenses.md").read_text(encoding="utf-8")
            council_recipe = (base / "pixelhelm-judge/references/recipe.md").read_text(encoding="utf-8")
            generate = (base / "pixelhelm-generate/references/anti-homogeneity.md").read_text(encoding="utf-8")
            prompts = (base / "pixelhelm-generate/references/prompt-stack.md").read_text(encoding="utf-8")

            # 1. elicitation — ENFORCED (a refused run-record write), so it may say so
            self.assertIn("intentElicitation", loop_records, edition)
            self.assertRegex(seam, r"(?i)elicitation gate", edition)
            self.assertRegex(seam, r"(?i)before any direction intent", edition)
            self.assertRegex(seam, r"(?i)process defect", edition)
            self.assertRegex(loop_skill, r"(?i)feel like", edition)

            # 2. felt variety — ADVISORY, and it must say the word
            for text, name in ((seam, "gates-and-loop.md"), (judge, "judge SKILL.md"),
                               (generate, "anti-homogeneity.md"), (council_recipe, "council recipe.md")):
                self.assertRegex(text, r"(?i)advisory", f"{edition}/{name}")
            self.assertIn("houseStyleCheck", loop_records, edition)
            self.assertRegex(seam, r"(?i)never (blocks?|vetoes?)|does NOT block", edition)

            # 3. in-use usability — the lens item and the rubric-authoring guidance
            self.assertRegex(lenses, r"(?i)in-use usability", edition)
            self.assertRegex(lenses, r"(?i)absent UI is the finding", edition)
            self.assertRegex(council_recipe, r"(?i)rubric authoring", edition)
            self.assertRegex(council_recipe, r"(?i)future sheets only|NEW sheets only", edition)

            # 4. AI voice tells — registered in the seed both editions ship
            seed = (ROOT / "plugins" / edition / "seeds/fingerprints-seed.md").read_text(encoding="utf-8")
            for tell in ("ai-em-dash-copy", "uniform-paragraph-rhythm", "symmetric-three-card"):
                self.assertIn(f"id: {tell}", seed, f"{edition}/{tell}")
            self.assertRegex(generate, r"(?i)em dash", edition)

            # 5. lead with the actionable answer — utility + long-form register guidance
            self.assertRegex(prompts, r"(?i)lead with the (actionable )?answer", edition)
            self.assertRegex(prompts, r"(?i)recommendation", edition)
            self.assertRegex(prompts, r"(?i)executive brief", edition)

    def test_repair_r1_r2_is_written_into_both_editions(self) -> None:
        """The precondition ships as text, not just as a decision record."""
        for edition in ("pixelhelm-full", "pixelhelm-lite"):
            base = ROOT / "plugins" / edition / "skills"
            judge = (base / "pixelhelm-judge/SKILL.md").read_text(encoding="utf-8")
            recipe = (base / "pixelhelm-judge/references/recipe.md").read_text(encoding="utf-8")
            seam = (base / "pixelhelm-loop/references/gates-and-loop.md").read_text(encoding="utf-8")
            loop = (base / "pixelhelm-loop/references/close-the-loop.md").read_text(encoding="utf-8")
            for text, name in ((judge, "judge SKILL.md"), (recipe, "recipe.md"), (seam, "gates-and-loop.md")):
                self.assertIn("UNSCORED", text, f"{edition}/{name}")
                self.assertRegex(text, r"(?i)never.{0,24}scored low", f"{edition}/{name}")
            # R2: gate outputs travel with the renders, and the juror hash covers them
            self.assertIn("floorEvidence", loop, edition)
            self.assertIn("unscored", loop, edition)
            self.assertRegex(loop, r"(?i)covers the gate outputs", edition)
            self.assertRegex(recipe, r"(?i)gate outputs", edition)
            self.assertRegex(judge, r"(?i)gate outputs travel with", edition)

    # ---- P3-1 capability ledger -------------------------------------------------

    def _ledger(self) -> Path:
        script = ROOT / "plugins/pixelhelm-lite" / self.LOOP_SCRIPTS / "capability-ledger.mjs"
        for edition in ("pixelhelm-full", "pixelhelm-lite"):
            self.assertTrue((ROOT / "plugins" / edition / self.LOOP_SCRIPTS / "capability-ledger.mjs").is_file(), edition)
        return script

    @staticmethod
    def _entry(**overrides) -> dict:
        base = {
            "schema": "pixelhelm/capability-entry@1",
            "date": "2026-07-26", "runId": "fixture-run", "archetype": "utility",
            "kind": "design-run", "project": "eval-fixture", "surface": "Status Page",
            "runRecord": "unknown",
            "artifacts": ["evals/validation/README.md"],
            "floor": {"outcome": "pass", "firedInLoop": [], "failedAtClose": [], "notRun": [],
                      "evidence": ["examples/harborline/gates/output-floor-gate.json"]},
            "panel": {"standing": "advisory-only", "jurors": 5,
                      "medians": {"a": 9, "b": 8}, "winner": "a", "winnerMedian": 9},
            "owner": {"decision": "rejected", "band": 6, "bandBasis": "upper-bound",
                      "ownerWords": "the 9.0 arms are a maximum 6", "record": "signoffs/x.json"},
            "ownerVsPanel": -3, "plants": "unknown", "notes": "",
        }
        base.update(overrides)
        return base

    def test_capability_ledger_writer_validates_and_archives(self) -> None:
        """P3-1: a run with no valid ledger record is not evidence of repetition."""
        ledger = self._ledger()
        self.assertEqual(2, command("node", str(ledger)).returncode)
        for kind, schema in (("entry", "pixelhelm/capability-entry@1"), ("escape", "pixelhelm/capability-escape@1")):
            template = command("node", str(ledger), "template", kind)
            self.assertEqual(0, template.returncode)
            self.assertEqual(schema, json.loads(template.stdout)["schema"])

        with tempfile.TemporaryDirectory() as temporary:
            temp = Path(temporary)
            project = temp / "proj"
            raw = json.dumps(self._entry()).encode("utf-8")
            written = command("node", str(ledger), "write", "entry", "--project", str(project), input_bytes=raw)
            self.assertEqual(0, written.returncode, written.stderr.decode())
            archive = project / ".pixelhelm/capability/entries/2026-07-26--utility--fixture-run.json"
            self.assertTrue(archive.is_file())
            self.assertEqual(0, command("node", str(ledger), "validate", str(archive)).returncode)
            roll_up = (project / ".pixelhelm/capability/LEDGER.md").read_text(encoding="utf-8")
            self.assertIn("| 2026-07-26 | utility | design-run | run: fixture-run |", roll_up)
            self.assertIn("owner: rejected 6 (upper-bound) | delta: -3 |", roll_up)
            # append-only: the ledger records history, it never rewrites it
            again = command("node", str(ledger), "write", "entry", "--project", str(project), input_bytes=raw)
            self.assertEqual(1, again.returncode)
            self.assertIn(b"never rewrites it", again.stderr)

            # an escape found LATER attaches to the run and leaves its entry untouched
            before = archive.read_bytes()
            escape = {
                "schema": "pixelhelm/capability-escape@1",
                "date": "2026-07-27", "runId": "fixture-run", "archetype": "utility",
                "defect": "no main landmark", "defectClass": "structure",
                "escapedPast": "shipped-artifact", "caughtBy": "output-floor-gate", "whenFound": "post-hoc",
                "cleared": {"date": "open", "how": "", "artifact": ""},
                "artifacts": ["examples/harborline/gates/README.md"], "notes": "",
            }
            escaped = command("node", str(ledger), "write", "escape", "--project", str(project),
                              input_bytes=json.dumps(escape).encode())
            self.assertEqual(0, escaped.returncode, escaped.stderr.decode())
            self.assertEqual(before, archive.read_bytes())  # the run's own line is never edited
            self.assertIn("escape on run: fixture-run", (project / ".pixelhelm/capability/LEDGER.md").read_text(encoding="utf-8"))
            # an escape pointing at an unknown run WARNS (soft) but still writes
            orphan = dict(escape, runId="no-such-run", defect="orphan")
            warned = command("node", str(ledger), "write", "escape", "--project", str(project),
                             input_bytes=json.dumps(orphan).encode())
            self.assertEqual(0, warned.returncode)
            self.assertIn(b"no capability-entry with runId", warned.stderr)

            # behavioral rejections: the anti-fabrication rules, not shape box-ticking
            for mutation, expected in [
                ({"artifacts": []}, b"every ledger record cites the artifact"),
                ({"ownerVsPanel": 3}, b"ownerVsPanel must equal owner.band - panel.winnerMedian"),
                ({"owner": {"decision": "pending", "band": "unknown", "bandBasis": "unknown",
                            "ownerWords": "unknown", "record": "unknown"}},
                 b'ownerVsPanel must be "unknown" unless BOTH'),
                ({"panel": {"standing": "unknown", "jurors": 5, "medians": {"a": 9, "b": 8},
                            "winner": "a", "winnerMedian": 8}}, b"does not equal panel.medians.a"),
                ({"owner": {"decision": "rejected", "band": 6, "bandBasis": "unknown",
                            "ownerWords": "six", "record": "unknown"}}, b"owner.bandBasis"),
                ({"owner": {"decision": "rejected", "band": 6, "bandBasis": "stated",
                            "ownerWords": "unknown", "record": "unknown"}}, b"is a reconstruction"),
                ({"floor": {"outcome": "pass", "firedInLoop": [], "failedAtClose": ["verify_states"],
                            "notRun": [], "evidence": ["g.json"]}}, b"is a contradiction"),
                ({"floor": {"outcome": "fail", "firedInLoop": [], "failedAtClose": [],
                            "notRun": [], "evidence": ["g.json"]}}, b"must name its gate"),
                ({"plants": {"planted": 4, "caught": 5}}, b"cannot exceed plants.planted"),
            ]:
                bad = temp / "bad.json"
                bad.write_text(json.dumps(self._entry(**mutation)), encoding="utf-8")
                invalid = command("node", str(ledger), "validate", str(bad))
                self.assertEqual(1, invalid.returncode, invalid.stdout.decode())
                self.assertIn(expected, invalid.stdout)
                # a refused record writes NOTHING
                refused = command("node", str(ledger), "write", "entry", "--project", str(temp / "clean"),
                                  input_bytes=json.dumps(self._entry(**mutation)).encode())
                self.assertEqual(1, refused.returncode)
                self.assertFalse((temp / "clean/.pixelhelm/capability").exists())

            summary = json.loads(command("node", str(ledger), "summary", "--project", str(project), "--json").stdout)
            utility = next(a for a in summary["archetypes"] if a["archetype"] == "utility")
            self.assertEqual(1, utility["runs"])
            self.assertEqual([9], utility["panelWinnerMedians"])
            self.assertEqual(-3, utility["meanOwnerVsPanel"])
            self.assertEqual(2, utility["escapes"]["total"])
            self.assertEqual(2, utility["escapes"]["open"])
            self.assertGreater(utility["unknownFields"], 0)  # gaps stay visible, never averaged away

    def test_capability_ledger_check_catches_a_loop_closed_without_a_line(self) -> None:
        """The mechanical half of 'closing a loop appends its ledger line'."""
        ledger = self._ledger()
        records = ROOT / "plugins/pixelhelm-lite" / self.LOOP_SCRIPTS / "records.mjs"
        with tempfile.TemporaryDirectory() as temporary:
            project = Path(temporary) / "proj"
            run_record = json.loads(command("node", str(records), "template", "run").stdout)
            run_record.update({"date": "2026-07-26", "project": "eval-fixture", "surface": "Status Page",
                               "intent": "eval fixture", "workerModel": "offline",
                               # REQUIRED on every new run record — see
                               # test_intent_elicitation_is_required_on_new_run_records.
                               "intentElicitation": {
                                   "asked": True,
                                   "ownerWords": "quiet, like transit signage; nothing that looks sold to me",
                                   "capturedInto": "ground-context.md",
                                   "waived": False, "waiverWords": "",
                               }})
            self.assertEqual(0, command("node", str(records), "write", "run", "--project", str(project),
                                        input_bytes=json.dumps(run_record).encode()).returncode)
            missing = command("node", str(ledger), "check", "--project", str(project), "--json")
            self.assertEqual(1, missing.returncode)
            payload = json.loads(missing.stdout)
            self.assertFalse(payload["clean"])
            self.assertEqual([".pixelhelm/runs/2026-07-26--status-page--run.json"], payload["missing"])

            entry = self._entry(runId="covering-run",
                                runRecord=".pixelhelm/runs/2026-07-26--status-page--run.json")
            covered = command("node", str(ledger), "write", "entry", "--project", str(project),
                              input_bytes=json.dumps(entry).encode())
            self.assertEqual(0, covered.returncode, covered.stderr.decode())
            self.assertNotIn(b"runRecord", covered.stderr)  # the citation resolves, so no warning
            clean = command("node", str(ledger), "check", "--project", str(project), "--json")
            self.assertEqual(0, clean.returncode)
            self.assertTrue(json.loads(clean.stdout)["clean"])

    def test_committed_capability_ledger_seed_is_valid_and_cites_real_artifacts(self) -> None:
        """The seed is history, read from the committed trail — not reconstructed."""
        ledger = self._ledger()
        store = ROOT / ".pixelhelm/capability"
        entries = sorted((store / "entries").glob("*.json"))
        escapes = sorted((store / "escapes").glob("*.json"))
        self.assertGreaterEqual(len(entries), 9)
        self.assertGreaterEqual(len(escapes), 6)
        valid = command("node", str(ledger), "validate", *[str(p) for p in entries + escapes])
        self.assertEqual(0, valid.returncode, valid.stdout.decode())

        roll_up = (store / "LEDGER.md").read_text(encoding="utf-8")
        self.assertEqual(len(entries) + len(escapes), sum(1 for line in roll_up.splitlines() if line.startswith("| ")))
        for path in entries + escapes:
            record = json.loads(path.read_text(encoding="utf-8"))
            self.assertTrue(record["artifacts"], path.name)
            for cited in record["artifacts"] + record.get("floor", {}).get("evidence", []):
                self.assertTrue((ROOT / cited).exists(), f"{path.name} cites a missing artifact: {cited}")
            self.assertIn(record["runId"], roll_up)

        summary = json.loads(command("node", str(ledger), "summary", "--project", str(ROOT), "--json").stdout)
        groups = {a["archetype"]: a for a in summary["archetypes"]}
        self.assertLessEqual({"utility", "saas-marketing", "commerce", "editorial", "launch-page",
                              "cross-archetype"}, set(groups))
        # the floor is the evidenced part: 8 of 8 planted defects caught across E4 + E4-R
        self.assertEqual({"planted": 8, "caught": 8, "recordedOn": 2}, groups["cross-archetype"]["plants"])
        # and every measurable owner-vs-panel delta is NEGATIVE - the owner scored below the panel
        deltas = [d for a in groups.values() for d in a["ownerVsPanel"]]
        self.assertEqual(4, len(deltas))
        self.assertTrue(all(d < 0 for d in deltas), deltas)
        # unknowns are recorded as unknown rather than reconstructed, and stay countable
        self.assertGreater(sum(a["unknownFields"] for a in groups.values()), 0)

    # ---- P3-2 baseline regression memory ----------------------------------------

    def _baseline(self) -> Path:
        script = ROOT / "plugins/pixelhelm-lite" / self.BASELINE_SCRIPTS / "baseline.mjs"
        for edition in ("pixelhelm-full", "pixelhelm-lite"):
            self.assertTrue((ROOT / "plugins" / edition / self.BASELINE_SCRIPTS / "baseline.mjs").is_file(), edition)
        return script

    HARBORLINE_GATES = ("output-floor-gate", "verify_responsive", "verify_focustrap")

    def _incumbent_args(self) -> list[str]:
        args: list[str] = []
        for gate in self.HARBORLINE_GATES:
            args += ["--gate-artifact", f"examples/harborline/gates/{gate}.json"]
        return args + ["--measure", "frametime.p95=16.8:lower:1"]

    def test_baseline_capture_and_compare_classify_regressions(self) -> None:
        """P3-2: a redesign proves it did not regress, or it does not get to claim it."""
        script = self._baseline()
        self.assertEqual(2, command("node", str(script)).returncode)
        with tempfile.TemporaryDirectory() as temporary:
            project = Path(temporary) / "proj"
            base = ["node", str(script), "capture", "--project", str(project), "--key", "abc123",
                    "--screen", "status-page", "--date", "2026-07-26"]
            captured = command(*base, *self._incumbent_args(),
                               "--finding", "raw-color|nit|inline token block")
            self.assertEqual(0, captured.returncode, captured.stderr.decode())
            stored = json.loads((project / ".pixelhelm/baseline.json").read_text(encoding="utf-8"))
            self.assertEqual("pixelhelm/baseline@1", stored["schema"])
            screen = stored["screens"]["status-page"]
            # the focus-trap record is applicable:false -> n/a, never a silent pass
            self.assertEqual({"output-floor-gate": "pass", "verify_responsive": "pass",
                              "verify_focustrap": "n/a"}, screen["layer1"])
            self.assertEqual({"value": 16.8, "better": "lower", "tolerance": 1}, screen["measurements"]["frametime.p95"])

            def compare(*extra: str) -> tuple[int, dict]:
                result = command("node", str(script), "compare", "--project", str(project),
                                 "--key", "abc123", "--screen", "status-page", "--json", *extra)
                return result.returncode, json.loads(result.stdout)

            # 1. same measurements, drift inside tolerance -> clean AND proven
            code, clean = compare(*self._incumbent_args()[:-1], "frametime.p95=16.9:lower:1",
                                  "--finding", "raw-color|nit|inline token block")
            self.assertEqual(0, code)
            self.assertTrue(clean["provenNoRegression"])
            self.assertEqual([], clean["blockers"])
            self.assertEqual(["raw-color"], [f["rule"] for f in clean["findings"]["persistent"]])

            # 2. a gate that passed at baseline now fails -> Blocker, exit 1
            code, regressed = compare("--gate", "output-floor-gate=fail", "--gate", "verify_responsive=pass",
                                      "--gate", "verify_focustrap=n/a", "--measure", "frametime.p95=16.8:lower:1")
            self.assertEqual(1, code)
            self.assertFalse(regressed["provenNoRegression"])
            self.assertEqual([{"gate": "output-floor-gate", "before": "pass", "after": "fail"}], regressed["regressed"])
            self.assertIn("REGRESSED gate output-floor-gate: pass -> fail", regressed["blockers"])

            # 3. a gate that passed at baseline is declared not-run -> lost evidence, still a Blocker
            code, lost = compare("--gate", "output-floor-gate=pass", "--gate", "verify_responsive=not-run",
                                 "--gate", "verify_focustrap=n/a", "--measure", "frametime.p95=16.8:lower:1")
            self.assertEqual(1, code)
            self.assertEqual([{"gate": "verify_responsive", "before": "pass"}], lost["lostEvidence"])
            self.assertEqual([], lost["regressed"])  # reported under its own name, never as "Regressed"

            # 4. a measurement that moved the wrong way past tolerance -> Blocker
            code, drifted = compare(*self._incumbent_args()[:-1], "frametime.p95=24:lower:1")
            self.assertEqual(1, code)
            self.assertEqual("regressed", next(m for m in drifted["measurements"] if m["metric"] == "frametime.p95")["verdict"])
            # ... and the same movement in the BETTER direction is not a regression
            code, improved = compare(*self._incumbent_args()[:-1], "frametime.p95=9:lower:1")
            self.assertEqual(0, code)
            self.assertEqual("improved", next(m for m in improved["measurements"] if m["metric"] == "frametime.p95")["verdict"])

            # 5. silence is never a pass: an un-supplied gate is named, and costs the proof
            code, partial = compare("--gate-artifact", "examples/harborline/gates/output-floor-gate.json")
            self.assertEqual(0, code)  # not a regression...
            self.assertFalse(partial["provenNoRegression"])  # ...but nothing is proven either
            self.assertEqual(["verify_responsive", "verify_focustrap"], partial["notCompared"]["gates"])
            self.assertEqual(["frametime.p95"], partial["notCompared"]["measurements"])

            # 6. flipping which direction is better is a re-registration, not a comparison
            flipped = command("node", str(script), "compare", "--project", str(project), "--key", "abc123",
                              "--screen", "status-page", "--measure", "frametime.p95=16.8:higher:1")
            self.assertEqual(1, flipped.returncode)
            self.assertIn(b"changed direction", flipped.stderr)

            # 7. the wrong branch point answers a different question -> refused
            wrong_key = command("node", str(script), "compare", "--project", str(project), "--key", "zzz",
                                "--screen", "status-page", "--gate", "output-floor-gate=pass")
            self.assertEqual(1, wrong_key.returncode)
            self.assertIn(b"wrong branch point", wrong_key.stderr)

            # 8. no baseline for a screen == cannot prove no regression (and says so)
            missing = command("node", str(script), "compare", "--project", str(project), "--key", "abc123",
                              "--screen", "checkout", "--json", "--gate", "output-floor-gate=pass")
            self.assertEqual(0, missing.returncode)  # a screen with no memory has not regressed...
            unproven = json.loads(missing.stdout)
            self.assertFalse(unproven["provenNoRegression"])  # ...and has proven nothing either
            self.assertIn("cannot prove it did not regress", unproven["why"])

    def test_baseline_never_silently_absorbs_a_change(self) -> None:
        """Re-baselining an INTENDED change stays a human's reviewable call."""
        script = self._baseline()
        with tempfile.TemporaryDirectory() as temporary:
            temp = Path(temporary)
            project = temp / "proj"
            store = project / ".pixelhelm/baseline.json"
            capture = ["node", str(script), "capture", "--project", str(project), "--key", "abc123",
                       "--date", "2026-07-26"]
            self.assertEqual(0, command(*capture, "--screen", "status-page", *self._incumbent_args()).returncode)
            original = store.read_bytes()

            # identical re-capture is a no-op, not a rewrite
            same = command(*capture, "--screen", "status-page", *self._incumbent_args())
            self.assertEqual(0, same.returncode)
            self.assertEqual(original, store.read_bytes())

            # a DIFFERENT capture of a captured screen is REFUSED, with the diff shown
            refused = command(*capture, "--screen", "status-page", "--gate", "output-floor-gate=fail")
            self.assertEqual(1, refused.returncode)
            self.assertIn(b"never silently absorbs", refused.stderr)
            self.assertIn(b"gate output-floor-gate: pass -> fail", refused.stderr)
            self.assertEqual(original, store.read_bytes())
            self.assertFalse((project / ".pixelhelm/baseline.proposed.json").exists())

            # --rebaseline PROPOSES; the memory itself is untouched
            proposed = command(*capture, "--screen", "status-page", "--gate", "output-floor-gate=fail",
                               "--rebaseline", "--json")
            self.assertEqual(0, proposed.returncode)
            payload = json.loads(proposed.stdout)
            self.assertEqual(".pixelhelm/baseline.proposed.json", payload["proposed"])
            self.assertIsNone(payload["written"])
            self.assertEqual(original, store.read_bytes())
            self.assertTrue((project / ".pixelhelm/baseline.proposed.json").is_file())

            # re-keying is refused too: it would drop every screen at the old branch point
            rekey = command("node", str(script), "capture", "--project", str(project), "--key", "def456",
                            "--date", "2026-07-26", "--screen", "status-page", "--gate", "output-floor-gate=pass")
            self.assertEqual(1, rekey.returncode)
            self.assertIn(b"re-keying drops every screen", rekey.stderr)
            self.assertEqual(original, store.read_bytes())

            # a NEW screen under the same key is additive - it overwrites no memory
            added = command(*capture, "--screen", "product-page", "--gate", "output-floor-gate=pass")
            self.assertEqual(0, added.returncode, added.stderr.decode())
            grown = json.loads(store.read_text(encoding="utf-8"))
            self.assertEqual({"status-page", "product-page"}, set(grown["screens"]))
            self.assertEqual(json.loads(original)["screens"]["status-page"], grown["screens"]["status-page"])

            # a finding whose identity hash was hand-edited does not validate
            tampered = json.loads(store.read_text(encoding="utf-8"))
            tampered["screens"]["status-page"]["findings"] = [
                {"rule": "raw-color", "severity": "nit", "location": "token block", "hash": "0" * 16}
            ]
            bad = temp / "tampered.json"
            bad.write_text(json.dumps(tampered), encoding="utf-8")
            invalid = command("node", str(script), "validate", str(bad))
            self.assertEqual(1, invalid.returncode)
            self.assertIn(b"identity is rule + location", invalid.stdout)

    def test_ledger_and_baseline_wiring_ships_in_both_editions(self) -> None:
        """Docs equal code: nothing above is described as wired unless the edition carries it."""
        for edition in ("pixelhelm-full", "pixelhelm-lite"):
            base = ROOT / "plugins" / edition
            self.assertTrue((base / self.LOOP_SCRIPTS / "capability-ledger.mjs").is_file(), edition)
            self.assertTrue((base / self.BASELINE_SCRIPTS / "baseline.mjs").is_file(), edition)

            loop = (base / "skills/pixelhelm-loop/references/close-the-loop.md").read_text(encoding="utf-8")
            for required in ("pixelhelm/capability-entry@1", "pixelhelm/capability-escape@1",
                             "capability-ledger.mjs", "ownerVsPanel", "capability-ledger.mjs check"):
                self.assertIn(required, loop, f"{edition}/close-the-loop.md")
            # the ledger's law, in the shipped text and not only in the code
            self.assertRegex(loop, r"(?i)records history[^.]*never rewrites it", edition)
            self.assertRegex(loop, r'(?i)unmeasured is the literal string', edition)

            seam = (base / "skills/pixelhelm-loop/references/gates-and-loop.md").read_text(encoding="utf-8")
            self.assertIn("pixelhelm-baseline/scripts/baseline.mjs", seam, edition)
            for required in ("Lost evidence", "not-compared", "Regressed measurement"):
                self.assertIn(required, seam, f"{edition}/gates-and-loop.md")

            protocol = (base / "skills/pixelhelm-evaluate/references/baseline.md").read_text(encoding="utf-8")
            self.assertIn("baseline.mjs", protocol, edition)
            self.assertIn(".pixelhelm/baseline.json", protocol, edition)
            # the honest not-wired statement must survive into both editions
            self.assertRegex(protocol, r"(?i)\*\*not wired:\*\*.{0,80}pixel diff", edition)
            self.assertRegex(protocol, r"(?i)never a finding and never a blocker", edition)

            for skill, needles in (
                ("pixelhelm-baseline", ("scripts/baseline.mjs", "not-compared")),
                ("pixelhelm-loop", ("scripts/capability-ledger.mjs", "scripts/baseline.mjs")),
                ("pixelhelm-evaluate", ("scripts/baseline.mjs",)),
            ):
                text = (base / "skills" / skill / "SKILL.md").read_text(encoding="utf-8")
                for needle in needles:
                    self.assertIn(needle, text, f"{edition}/{skill}/SKILL.md")

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
