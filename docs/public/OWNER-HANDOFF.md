# Owner-only outward handoff

This is preparation, not authorization.

## Decisions still required

1. Confirm a durable private security and conduct-reporting channel.
2. After local independent acceptance, merge the exact reviewed commit and rerun hosted
   CI for that resulting head.
3. For a future plugin release, choose and commit a version newer than 2.0.0 before
   creating its tag and matching GitLab Release. Do not retro-tag a later commit as
   `v2.0.0`.
4. For the prepared Python 0.1.2 release, merge only the exact reviewed commit, build and
   inspect fresh artifacts from it, then approve the tag, GitLab Release, and PyPI
   publication as separate actions. Do not retro-tag the existing 0.1.1 artifact.
5. Decide separately whether to change metadata/avatar/settings or install or activate
   either plugin edition. The repository is already public; no visibility change is
   implied.

## Closed outward sequence

After separate exact approvals, the future owner sequence is: configure private security
settings -> merge the accepted 0.1.2 commit -> verify exact-head hosted CI -> rebuild and
inspect -> create the matching tag and GitLab Release -> publish the matching Python
artifact if approved -> perform unauthenticated
public verification. Plugin activation and settings changes remain independent decisions.

Credentials remain in the owner's authenticated client or browser and are never pasted
into chat, written to evidence, or committed.
