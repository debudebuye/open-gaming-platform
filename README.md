# Open Gaming Platform

An open-source, modular gaming platform supporting Sports Betting, Keno, Casino, Trading, and Payments — built with NestJS, TypeScript, PostgreSQL, and Redis.

## Architecture

**V1: Hybrid Monorepo** — Ship fast with clear domain boundaries, independently deployable apps, and a zero-rewrite migration path to microservices.

📖 **[Full Architecture Guide →](./docs/architecture.md)**

## Apps

| App | Port | Responsibility |
|-----|------|----------------|
| `identity-api` | 3001 | Auth, users, KYC, sessions |
| `wallet-api` | 3002 | Balances, ledger, holds |
| `gaming-api` | 3003 | Betting, Keno, Casino |
| `trading-api` | 3004 | Order book, trades, positions |
| `admin-api` | 3005 | Back-office, reports, management |

## Packages

| Package | Description |
|---------|-------------|
| `@ogp/shared` | Config, logging, errors, pagination, base event |
| `@ogp/auth` | JWT guards, RBAC, decorators |
| `@ogp/wallet` | Ledger, balance, holds logic |
| `@ogp/betting` | Odds, validation, settlement engine |
| `@ogp/keno` | RNG draw engine, payout tables |
| `@ogp/casino` | Plugin interface for casino games |
| `@ogp/trading` | Order matching, risk checks, positions |
| `@ogp/payments` | Payment provider adapters (Stripe, M-Pesa...) |
| `@ogp/notifications` | Email, SMS, Push, In-App delivery |

## Quick Start

```bash
# Install dependencies
pnpm install

# Start infrastructure
docker compose -f infrastructure/docker/docker-compose.yml up postgres redis -d

# Start all apps (dev mode)
pnpm run dev
```

## Tech Stack

- **Framework:** NestJS + TypeScript
- **Database:** PostgreSQL 16 (schema-per-domain)
- **Cache / Events:** Redis 7 (cache, sessions, pub/sub, distributed locks)
- **API Gateway:** Nginx
- **Monorepo:** pnpm workspaces
- **Containers:** Docker / Docker Compose

## Documentation

- [Architecture Guide](./docs/architecture.md)
- [System Architecture Evolution V1](./docs/system-architecture-evolution-v1.md)
- [ADR-001: Monorepo Strategy](./docs/adr/001-monorepo-strategy.md)
- [ADR-002: Database Strategy](./docs/adr/002-database-per-domain.md)
- [ADR-003: Event Bus Strategy](./docs/adr/003-event-bus-strategy.md)

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md) for setup instructions, domain boundary rules, and the PR process.

## License

MIT
