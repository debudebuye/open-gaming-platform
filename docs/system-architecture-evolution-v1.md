## Version 1 — Hybrid Monorepo (Startup Phase)

### Focus
- **Features:** Ship real product slices quickly (identity, wallet, payments, games).
- **Stability:** Keep boundaries clear so you don’t break everything when adding features.
- **Users:** Optimize for “does it work end-to-end for real users?”
- **Revenue:** Prioritize money-moving flows first (wallet + payments + game entry + settlement).
- **NOT perfect architecture:** You want iteration speed + reliability, not theoretical purity.

### Hybrid Monorepo Structure

**apps/**
- `identity-api`
- `wallet-api`
- `gaming-api`
- `trading-api`

**packages/**
- `shared` (common utilities, types, logging helpers, configs)
- `auth`
- `wallet`
- `betting`
- `keno`
- `casino`
- `trading`
- `payments`

### Why this goal matters
The goal is:
> **“Can people use the platform?”**  
Not:
> **“Can we run 50 microservices?”**

### Practical intent of Version 1
- Keep one repo so teams move fast together.
- Use a modular layout so domain code stays understandable.
- Deploy independently when helpful, but avoid the operational overhead of full microservice sprawl.
- Standardize the `packages/shared` package to reduce duplication and drift.

### Recommended Version 1 stack (example)
- **NestJS**
- **PostgreSQL**
- **Redis**
- **Docker**

### Build the core slice first
- Auth
- Wallet
- Payments
- Betting
- Keno
- Trading
- Admin
