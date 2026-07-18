# Offline validation contract

This contract prepares evidence for a fresh reviewer. It does not self-certify the
candidate or authorize any outward action.

## Accepted parent

The accepted-parent commit/tree pins and the independent critic-report checksums for
this candidate belong to the owner's private migration evidence and are deliberately
not restated in this public tree. This clean-sheet tree carries no claim that those
private receipts are reproducible from the public history alone.

## Frozen release-audit authority

The frozen ReleaseBench audit used during private readiness is likewise pinned only
in private migration evidence. Target: `PRIVATE_LAUNCH_READY_STOP_BEFORE_OUTWARD_ACTIONS`.

## Candidate gates

1. `git diff --cached --check`
2. `node build/build.mjs --check`
3. portable and full `evals/pixelhelm/run_tests.py` replays;
4. 25 native skill validators;
5. JavaScript and Python syntax checks for every generated script;
6. offline evidence-engine demo;
7. frozen ReleaseBench audit and redacted secret scan;
8. governance, README-link, repository-identity, version, and CI fail-closed checks;
9. exact Git-index blob manifest in UTF-8 byte ordinal path order;
10. fresh Git-free reconstruction and complete replay; and
11. a different independent critic before any commit.

The full authority replay must use clean, exact local roots at ChoiceGate commit/tree
`bad38b9f359d6594c7443d666dcc505eb95c99a3` /
`0bcd97a2c7c550b6542f9aec9549c44475d05ece` and capability inventory commit/tree
`354046f9627c4a83a2a912e09a656d1871ed6cc4` /
`786171bc52fe6efeefb860f01bb71d4c09ed3504`.

## Privacy and closed actions

Scans report only paths and finding classes, never secret values. No remote read or
write, fetch, pull, push, tag, Release, visibility or metadata change, provider call,
registry or marketplace action, authentication, publication, skill lifecycle change,
archive mutation, destructive cleanup, or canonical dirty-worktree edit is permitted.
