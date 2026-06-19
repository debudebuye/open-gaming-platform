# ADR-002: Schema-per-Domain Database Strategy

**Status:** Accepted  
**Date:** 2025-06

## Context

Domain isolation requires that the wallet, gaming, identity, and trading domains cannot query each other's data directly. We need an isolation strategy that works for V1 and smoothly migrates to V2.

Options considered:
1. Single shared schema — all tables in one schema
2. **Schema-per-domain** — separate PostgreSQL schemas in one instance
3. Database-per-domain — separate PostgreSQL instances per domain

## Decision

Use **schema-per-domain** in a single PostgreSQL instance for V1:
- `identity` schema for identity-api
- `wallet` schema for wallet-api
- `gaming` schema for gaming-api
- `trading` schema for trading-api

TypeORM DataSource for each app is configured to a specific schema.

## V2 Migration Path

When a domain needs to be extracted to a dedicated database instance, the migration is purely a config change:

```typescript
// Before (V1)
{ schema: 'wallet', host: 'shared-postgres' }

// After (V2)
{ schema: 'public', host: 'wallet-postgres-instance' }
```

No application code changes are required.

## Consequences

**Positive:**
- Strong logical isolation — no cross-schema queries in application code
- Single DB instance is easy to operate and back up in V1
- Zero-code migration to database-per-domain in V2

**Negative:**
- Cross-domain database queries are technically possible in SQL (mitigated by app-layer enforcement)
- Shared DB is a potential bottleneck under very high load (V2 migration resolves this)
