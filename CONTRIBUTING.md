# Contributing to Open Gaming Platform

Thank you for your interest in contributing. This guide covers setup, conventions, and the PR process.

## Getting Started

### Prerequisites

- Node.js 20+
- pnpm 9+
- Docker & Docker Compose

### Local Setup

```bash
git clone https://github.com/your-org/open-gaming-platform.git
cd open-gaming-platform
pnpm install

# Start infrastructure (PostgreSQL + Redis)
docker compose -f infrastructure/docker/docker-compose.yml up postgres redis -d

# Copy and configure environment
cp .env.example .env

# Run database migrations
pnpm --filter identity-api migration:run
pnpm --filter wallet-api migration:run
pnpm --filter gaming-api migration:run
pnpm --filter trading-api migration:run

# Start all apps in dev mode
pnpm run dev
```

## Domain Boundaries — Non-Negotiable Rules

These rules keep the architecture clean and the V2 migration path open:

1. **No cross-domain database queries.** `gaming-api` must never query the `wallet` schema.
2. **No cross-domain package imports.** `packages/betting` must never import from `packages/wallet`.
3. **All cross-domain calls use HTTP `/internal/*` or events.** Direct function calls across domains are not allowed.
4. **Wallet is the single source of truth for money.** No domain stores its own balance.

ESLint rules enforce #2. Code review enforces #1, #3, and #4.

## Code Style

- TypeScript strict mode enabled
- ESLint + Prettier (run `pnpm run lint` before committing)
- All public methods must have JSDoc comments
- All DTOs must use `class-validator` decorators
- No `any` types — use `unknown` and narrow instead

## Testing Requirements

- Unit tests for all domain logic in `packages/*`
- Integration tests for all API endpoints in `apps/*`
- Minimum 80% coverage for packages

## Pull Request Process

1. Fork the repo and create a branch: `feature/your-feature` or `fix/your-bug`
2. Write tests for your changes
3. Run `pnpm run lint && pnpm run test` — all must pass
4. Open a PR against `develop` (not `main`)
5. Fill out the PR template completely
6. Request review from the relevant CODEOWNER

## Proposing New Game Domains or Payment Providers

Use the **Domain Plugin** issue template to propose new domains. Proposals must include:
- Interface implementation plan
- Wallet integration design (how bets/payouts interact with `wallet-api`)
- Provably fair approach (for game domains)
- Security considerations

## Reporting Security Vulnerabilities

See [SECURITY.md](./SECURITY.md). Do not open public GitHub issues for security vulnerabilities.
