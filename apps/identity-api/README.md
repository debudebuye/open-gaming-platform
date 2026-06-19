# identity-api

Service responsible for identity/auth concerns (users, sessions, profiles).

Startup phase guidance:
- Keep logic simple and test critical paths first.
- Share common types/utilities via `packages/shared`.
