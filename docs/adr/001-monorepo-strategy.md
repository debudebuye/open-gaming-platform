# ADR-001: Hybrid Monorepo Architecture for V1

**Status:** Accepted  
**Date:** 2025-06

## Context

We are building an open-source gaming platform that needs to ship features fast while maintaining clear domain boundaries for a future microservices migration.

Options considered:
1. Full microservices from day one
2. Traditional monolith
3. **Hybrid Monorepo** — multiple deployable apps sharing a single repo and package ecosystem

## Decision

Use a **Hybrid Monorepo** managed by pnpm workspaces with:
- Independent deployable apps in `apps/`
- Shared domain logic in `packages/`
- A single PostgreSQL instance with schema-per-domain isolation
- Docker Compose for local development and single-server deployment

## Consequences

**Positive:**
- Fast iteration — one repo, shared tooling, no cross-repo dependency management
- Clear domain boundaries enforced by package structure
- Independent deployment per app without full microservice overhead
- Zero-rewrite path to microservices — extract one app/package at a time

**Negative:**
- Shared PostgreSQL is a single point of failure (mitigated by replication in prod)
- Large repo size as the platform grows (mitigated by sparse checkout)
- Developers can accidentally break domain boundaries if not enforced by linting rules

## Enforcement

- ESLint `no-restricted-imports` rules prevent cross-domain package imports
- CI checks that `packages/betting` has no imports from `packages/wallet`
- All cross-domain communication via HTTP `/internal/*` or event bus only
