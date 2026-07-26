# ChoiceGate re-acceptance record — 2026-07-26

**Owner decision (Rahul, 2026-07-26, given directly in the executing session):**
the E1 admission block recorded in
`../e1/attempt-2026-07-26-admission-blocked/REPORT.md` is ruled a **failed
execution precondition** (not "E1 falsified-as-attempted"), and **re-acceptance
of the current public ChoiceGate release is authorized** as a separate
engineering change landing on main before a fresh E1 run — the same pattern as
the P0-4/5/6 unblock. `docs/authority-boundary.md` classifies this as an
authority-semantics change requiring exactly this kind of explicit owner
decision.

## What changed

Accepted ChoiceGate pins (old accepted checkout lost to the public history
rewrite; unrecoverable — see the attempt record):

| pin | old (lost) | new (accepted) |
|---|---|---|
| ChoiceGate commit | `bad38b9f359d6594c7443d666dcc505eb95c99a3` | `7d95e9612d011a577d232cf9a51ba0c1bfab7571` (= tag `v0.2.1`) |
| ChoiceGate tree | `0bcd97a2c7c550b6542f9aec9549c44475d05ece` | `1d35cb708f880b228d9334c85f4b4c356f0f36d4` |
| Inventory commit/tree/fingerprint | unchanged | unchanged (`354046f…` / `786171bc…` / `6ef1493…`) |

The accepted v0.2.1 router itself hard-pins the same Skills-OS registry
snapshot (`ACCEPTED_REGISTRY_COMMIT = 354046f…`, same manifest fingerprint), so
the accepted pair is mutually consistent by construction.

Files changed: `src/family.json`, `src/skills/pixelhelm-choicegate/scripts/
admit_choicegate.py` (and its two build-generated plugin copies),
`docs/public/VALIDATION.md`, `evals/pixelhelm/run_tests.py`.

## Contract adaptations (each verified by the replay below)

1. **Inventory field name:** the v0.2.1 router names the accepted-registry
   binding `accepted_registry_commit` (request inventory envelope and receipt
   `inventory_binding`); the old private router used `accepted_inventory_commit`.
   The verifier now checks the current name. Same value, same strictness.
2. **Pre-rename family owner id:** the accepted registry snapshot predates the
   family's public rename and records `frontend-design` under owner
   `plumbline-family` (edition adapter `design-plumbline-lite`, editions
   lite/full with exactly lite lifecycle-ready). Owner ruling 2026-07-26:
   plumbline-family **is** pixelhelm-family (pre-rename identity; the repo's
   own legacy-alias policy documents the rename). The verifier checks the
   accepted content verbatim via a single constant
   (`ACCEPTED_REGISTRY_OWNER = "plumbline-family"`) used in the
   authority-record, edition-policy, surface-policy, and decision-owner
   equality checks — all still exact-match and fail-closed. The admission
   output now also records `accepted_registry_owner` for downstream evidence.
   Consequence worth stating plainly: with the pinned inventory content, the
   shipped verifier's `pixelhelm-family` equality could never have passed —
   the boundary had not been replayed end-to-end since the rename.
3. **Boundary harness:** the old `frontend_continuation()` imported ChoiceGate's
   private eval harness (`evals/choicegate/run_tests.py`), which no longer
   ships in the public tree. It now builds the original selection request
   directly and drives the accepted router through its public CLI
   (`scripts/route_capabilities.py --choicegate-commit <pin> -`), asserting the
   original decision is executable atomic `frontend-design` before building
   the continuation. The v0.2.1 release's `evals/choicegate/
   sample-route-request.json` and `tools/build_public_route_demo.py` document
   this interface.

## Evidence

- Full boundary replay, green: `boundary-replay-output.txt` — 30 tests, OK,
  including `test_valid_complete_continuation_is_admitted_without_writes`
  (real router → real receipt → `admitted: true`, edition `pixelhelm-lite`,
  hash-verified, no writes to the ChoiceGate root) and the fail-closed fault
  cases (bare receipt, wrong surface, wrong owner, tampered fingerprint,
  bundle, duplicate keys, non-finite numbers, wrong root).
- Portable suite (no roots): 26 tests, OK (skipped=1) — the one documented skip.
- `node build/build.mjs --check`: committed plugins match a fresh build.

Accepted local roots used (recorded here; also pinned in
`docs/public/VALIDATION.md`):

- `~\Documents\Workbench\System\Governance\Accepted-Authorities\ChoiceGate-v0.2.1`
  — dedicated clean worktree, detached at the accepted commit; not used for
  development.
- `~\Documents\Workbench\System\Governance\Accepted-Authorities\Skills-OS-354046f`
  — dedicated clean worktree at the accepted inventory commit (fingerprint
  reproduction verified).

## Recurrence prevention

The root cause of the original loss was a history rewrite orphaning the only
copy of an accepted commit. Countermeasures taken outside this repo:

1. the accepted inventory commit is now protected by a tag in its home repo
   (`accepted-inventory-354046f`); the accepted ChoiceGate commit is already
   tag-protected (`v0.2.1`);
2. git bundles of both accepted commits stored in the private archive under
   `Archive\Retained-Evidence\Accepted-Authority-Bundles-2026-07-26\`.
