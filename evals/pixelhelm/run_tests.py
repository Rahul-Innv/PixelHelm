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
                               "intent": "eval fixture", "workerModel": "offline"})
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
