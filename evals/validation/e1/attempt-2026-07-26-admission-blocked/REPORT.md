# E1 attempt 2026-07-26 — STOPPED at step 0: ChoiceGate admission is unsatisfiable on this machine

**Outcome: the E1 loop did not run.** No ground stage, no direction arms, no
candidates, no renders, no gate runs, no mutant ritual, no juror panel, no
divergence measurements, no repair, no verdict. Nothing downstream of admission
was generated, drafted, or anticipated. The sealed pre-registration pack
(`PREREG-BRIEF.md`, `PREREG-RUBRIC-utility.md`, `PREREG-METRICS-divergence.md`,
`data/trail-status.json`, `../README.md`) was not edited.

## The exact gap

E1's documented protocol requires a complete `pixelhelm-choicegate` admission
before any loop work. The admission verifier (`admit_choicegate.py`, fail-closed,
untouched — see `admission-attempt/root-state.txt` for its sha256) requires the
caller to supply the exact accepted local ChoiceGate checkout at:

- commit `bad38b9f359d6594c7443d666dcc505eb95c99a3`
- tree `0bcd97a2c7c550b6542f9aec9549c44475d05ece`

**That commit no longer exists anywhere reachable from this machine.**

Attempt evidence (all in `admission-attempt/`): running the verifier against the
only ChoiceGate checkout present (clean, HEAD `440448b`) returns
`{"admitted": false, "error_code": "CHOICEGATE_COMMIT_MISMATCH"}`, exit 2.
Because root verification precedes request preflight, no continuation-request
content could change this outcome. The dependency is also deeper than the one
check: a valid continuation request must embed an original selection receipt
produced by the pinned router itself (`scripts/route_capabilities.py` at
`bad38b9f`), so without the pinned checkout no admissible request can exist
either.

## Search evidence (why "does not exist" is claimed)

1. **Every git repository under `~\Documents\Workbench`** was
   enumerated (`find … -name .git`) and each object store probed with
   `git cat-file -t` for both pinned commits. The ChoiceGate commit is absent
   from all of them — including the public `Projects\ChoiceGate` clone, the
   archived release checkouts (`ChoiceGate-0.2.0`, `ChoiceGate-0.2.1`,
   `_codex-fixes/ChoiceGate`, `_release-prep/ChoiceGate` under
   `Archive\Retained-Evidence\GitLab-Portfolio-Remediation-2026-07-19-20`), and
   every predecessor repo in `Archive\Superseded\Public-Family-Predecessors`.
2. **The GitLab remote** (`gitlab.com/krahul02004/ChoiceGate.git`) was fully
   fetched — all branches, tags, and merge-request refs (captured in
   `admission-attempt/choicegate-remote-refs.txt`). The object is still absent;
   a direct fetch by SHA is refused (`not our ref`). The public history is a
   clean-sheet rewrite whose root commit is `2f7dd94` "Initial public release",
   consistent with `docs/public/VALIDATION.md`'s own warning that the private
   receipts "are deliberately not restated in this public tree" and are not
   "reproducible from the public history alone".
3. **The archived predecessor copy**
   `Archive\Superseded\Public-Family-Predecessors\Choicegate-System-Reference`
   is a partial, non-git file copy; its `scripts/` directory does not even
   contain `route_capabilities.py`. It can satisfy neither the git pin checks
   nor the router invocation.
4. **Git bundles and stray checkouts:** a profile-wide search found no
   ChoiceGate bundles (only CohortWatch ones), no other `route_capabilities.py`
   working copies outside the paths above, and nothing in OneDrive.
5. **The capability-inventory side is intact** (contrast case, proving the
   sweep works): Skills-OS at
   `~\Documents\Workbench\System\Skills-OS` contains the pinned
   inventory commit `354046f`, whose tree hash matches the pin
   (`786171bc…`). Only the ChoiceGate half of the accepted authority pair is
   lost.

Most probable cause (from the archive layout, for the owner to confirm): the
accepted private ChoiceGate checkout was removed or only partially archived
during the 2026-07-18 workbench cutover / public-family migration, while the
E1 pre-registration (sealed 2026-07-26) assumed the accepted roots still
existed as stated in `docs/authority-boundary.md`.

## Standing under the pre-registration

`PREREG-BRIEF.md` (success/falsification): *"Falsified if: the loop cannot
complete without improvisation outside the documented process."* The
`pixelhelm-choicegate` skill: *"Any failure is terminal for this route; return
to ChoiceGate rather than guessing or weakening a check"* — and it explicitly
forbids an *"inferred ChoiceGate checkout"*.

As executed on 2026-07-26, on this machine, the condition is met: the loop
cannot complete without improvisation (forging or substituting an authority
root, or weakening the verifier — all forbidden). Execution therefore STOPPED
at step 0, per the sealed instruction to report the exact gap rather than
improvise around it.

Stated without reframing: **E1 as attempted today could not run.** Two honest
readings are left to the owner, and this report does not choose between them:

- record E1 as falsified-as-attempted under the clause above; or
- treat this as a failed *execution precondition* discovered before any
  generation (analogous to the P0-4/5/6 block the prereg already recognized as
  blocking, not falsifying), restore the precondition, and run E1 fresh. The
  prereg is uncontaminated — no candidate, score, or verdict exists anywhere.

## Remedy paths (owner decision required; not attempted here)

1. **Restore the accepted checkout** from any off-machine copy (another
   machine, external drive, pre-rewrite private remote). Anything containing
   commit `bad38b9f…` restores admission with zero code or doc changes.
2. **Owner-gated re-acceptance:** run a new ChoiceGate acceptance against the
   current public ChoiceGate, update the pins in `src/family.json`,
   `admit_choicegate.py`, and `docs/public/VALIDATION.md`, and re-run the full
   boundary replay (`evals/pixelhelm/run_tests.py --choicegate-root …
   --inventory-root …`). `docs/authority-boundary.md` classifies this as an
   authority-semantics change requiring an explicit owner decision — it must
   not be done casually, and was not done in this session.

Either path is followed by a fresh E1 run against the untouched sealed pack.

## What this session changed

- Added this attempt record (`REPORT.md` + `admission-attempt/` evidence).
- Ran read-only searches and one `git fetch` in the ChoiceGate clone (updates
  remote-tracking refs only; working tree and local branches untouched).
- Nothing else: no sealed file edited, no verifier modified, no loop stage run,
  no push, no merge.
