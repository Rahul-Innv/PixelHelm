# Owner-only outward handoff

This is preparation, not authorization.

## Decisions still required

1. Confirm the exact canonical GitLab project URL. The display name is already
   **PixelHelm**, but no URL or slug is inferred from local configuration or legacy
   history.
2. Confirm a durable private security and conduct-reporting channel.
3. After local independent acceptance, decide whether and when to push, create the
   `v2.0.0` tag and matching host Release, configure metadata/avatar, run hosted CI,
   install or activate either edition, and change visibility.

## Closed outward sequence

After separate exact approvals, the future owner sequence is: confirm host identity →
configure private security settings → push the accepted commit → verify hosted CI →
create the tag and host Release → set description/topics/avatar → choose visibility →
perform unauthenticated public verification. No command is included while the canonical
URL is unresolved.

Credentials remain in the owner's authenticated client or browser and are never pasted
into chat, written to evidence, or committed.
