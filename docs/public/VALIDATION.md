# Offline validation contract

This contract prepares evidence for a fresh reviewer. It does not self-certify the
candidate or authorize any outward action.

## Accepted parent

The accepted-parent commit/tree pins and the independent critic-report checksums for
this candidate belong to the owner's private migration evidence and are deliberately
not restated in this public tree. This clean-sheet tree carries no claim that those
private receipts are reproducible from the public history alone.

## Frozen release-audit authority

The frozen ReleaseBench audit from the readiness-gate pass is likewise pinned only
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
`7d95e9612d011a577d232cf9a51ba0c1bfab7571` /
`1d35cb708f880b228d9334c85f4b4c356f0f36d4` (the public v0.2.1 release; re-accepted
2026-07-26 by owner decision after the original private accepted checkout was lost
to the public-history rewrite) and capability inventory commit/tree
`354046f9627c4a83a2a912e09a656d1871ed6cc4` /
`786171bc52fe6efeefb860f01bb71d4c09ed3504` (unchanged; the accepted router pins this
same registry snapshot). The accepted registry snapshot predates the family's public
rename and records `frontend-design` under the pre-rename owner id
`plumbline-family`; the owner ruled 2026-07-26 that this is the same family as
`pixelhelm-family`, and the admission verifier checks the accepted content verbatim.

## Privacy and closed actions

Scans report only paths and finding classes, never secret values. No remote read or
write, fetch, pull, push, tag, Release, visibility or metadata change, provider call,
registry or marketplace action, authentication, publication, skill lifecycle change,
archive mutation, destructive cleanup, or canonical dirty-worktree edit is permitted.
