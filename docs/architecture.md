# Open Gaming Platform — Complete Architecture Guide

> **Version:** 1.0 (Hybrid Monorepo Phase)  
> **Stack:** NestJS · TypeScript · PostgreSQL · Redis · Docker  
> **Monorepo Tool:** pnpm workspaces  

---

## Table of Contents

1. [Complete Folder Structure](#1-complete-folder-structure)
2. [System Architecture Diagram](#2-system-architecture-diagram)
3. [Domain Boundaries](#3-domain-boundaries)
4. [Database Design Strategy](#4-database-design-strategy)
5. [Redis Usage Strategy](#5-redis-usage-strategy)
6. [Event Architecture](#6-event-architecture)
7. [Deployment Architecture](#7-deployment-architecture)
8. [Security Architecture](#8-security-architecture)
9. [Wallet Architecture](#9-wallet-architecture)
10. [Betting Architecture](#10-betting-architecture)
11. [Keno Architecture](#11-keno-architecture)
12. [Trading Architecture](#12-trading-architecture)
13. [Plugin Architecture](#13-plugin-architecture)
14. [Migration Path — Hybrid → Microservices](#14-migration-path)
15. [CI/CD Strategy](#15-cicd-strategy)
16. [Monitoring & Observability](#16-monitoring--observability)
17. [Open-Source Project Governance](#17-open-source-project-governance)

---

## 1. Complete Folder Structure

```
open-gaming-platform/
├── apps/
│   ├── identity-api/               # Auth, users, sessions, roles, OAuth
│   │   ├── src/
│   │   │   ├── auth/               # JWT, refresh tokens, OAuth2 providers
│   │   │   │   ├── auth.controller.ts
│   │   │   │   ├── auth.service.ts
│   │   │   │   ├── auth.module.ts
│   │   │   │   ├── strategies/     # Passport strategies (jwt, local, google)
│   │   │   │   └── guards/
│   │   │   ├── users/              # User CRUD, profile, KYC status
│   │   │   │   ├── users.controller.ts
│   │   │   │   ├── users.service.ts
│   │   │   │   ├── users.module.ts
│   │   │   │   └── entities/
│   │   │   ├── sessions/           # Session management, device tracking
│   │   │   ├── roles/              # RBAC roles and permissions
│   │   │   ├── kyc/                # KYC verification hooks
│   │   │   ├── events/             # Domain events (UserCreated, UserBanned...)
│   │   │   ├── app.module.ts
│   │   │   └── main.ts
│   │   ├── test/
│   │   ├── Dockerfile
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   ├── wallet-api/                 # Balances, transactions, ledger
│   │   ├── src/
│   │   │   ├── wallet/             # Wallet CRUD, balance queries
│   │   │   ├── transactions/       # Debit/credit, transaction history
│   │   │   ├── ledger/             # Double-entry ledger
│   │   │   ├── holds/              # Fund holds (bet reservation)
│   │   │   ├── events/             # WalletDebited, WalletCredited...
│   │   │   ├── app.module.ts
│   │   │   └── main.ts
│   │   ├── test/
│   │   ├── Dockerfile
│   │   └── package.json
│   │
│   ├── gaming-api/                 # Betting, Keno, Casino, Lottery
│   │   ├── src/
│   │   │   ├── betting/            # Sports betting slice
│   │   │   │   ├── markets/
│   │   │   │   ├── selections/
│   │   │   │   ├── slips/
│   │   │   │   ├── settlement/
│   │   │   │   └── events/
│   │   │   ├── keno/               # Keno game slice
│   │   │   │   ├── games/
│   │   │   │   ├── draws/
│   │   │   │   ├── tickets/
│   │   │   │   └── events/
│   │   │   ├── casino/             # Casino placeholder (plugin-ready)
│   │   │   ├── lottery/            # Lottery placeholder (plugin-ready)
│   │   │   ├── app.module.ts
│   │   │   └── main.ts
│   │   ├── test/
│   │   ├── Dockerfile
│   │   └── package.json
│   │
│   ├── trading-api/                # Order book, trades, positions
│   │   ├── src/
│   │   │   ├── orders/             # Limit/market orders
│   │   │   ├── orderbook/          # In-memory order book engine
│   │   │   ├── trades/             # Trade execution records
│   │   │   ├── positions/          # User positions and PnL
│   │   │   ├── markets/            # Tradeable instruments
│   │   │   ├── events/
│   │   │   ├── app.module.ts
│   │   │   └── main.ts
│   │   ├── test/
│   │   ├── Dockerfile
│   │   └── package.json
│   │
│   └── admin-api/                  # Back-office, reporting, management
│       ├── src/
│       │   ├── users-admin/
│       │   ├── finance/
│       │   ├── game-management/
│       │   ├── reports/
│       │   ├── audit-logs/
│       │   ├── app.module.ts
│       │   └── main.ts
│       ├── Dockerfile
│       └── package.json
│
├── packages/
│   ├── shared/                     # Cross-cutting utilities
│   │   ├── src/
│   │   │   ├── config/             # Config loader, env validation (Zod)
│   │   │   ├── database/           # TypeORM base entity, migrations helper
│   │   │   ├── redis/              # Redis client factory
│   │   │   ├── logger/             # Pino/Winston structured logger
│   │   │   ├── errors/             # BaseException, error codes
│   │   │   ├── pagination/         # Cursor/offset pagination DTOs
│   │   │   ├── events/             # BaseEvent, EventBus interface
│   │   │   ├── decorators/         # @CurrentUser, @Roles, etc.
│   │   │   └── index.ts
│   │   └── package.json
│   │
│   ├── auth/                       # Reusable auth logic
│   │   ├── src/
│   │   │   ├── jwt/                # JWT sign/verify helpers
│   │   │   ├── guards/             # JwtAuthGuard, RolesGuard
│   │   │   ├── decorators/
│   │   │   └── index.ts
│   │   └── package.json
│   │
│   ├── wallet/                     # Wallet domain logic (reusable)
│   │   ├── src/
│   │   │   ├── balance/
│   │   │   ├── ledger/
│   │   │   └── index.ts
│   │   └── package.json
│   │
│   ├── betting/                    # Betting domain logic
│   │   ├── src/
│   │   │   ├── odds/               # Odds calculation, conversion
│   │   │   ├── validation/         # Slip validation rules
│   │   │   ├── settlement/         # Settlement engine
│   │   │   └── index.ts
│   │   └── package.json
│   │
│   ├── keno/                       # Keno domain logic
│   │   ├── src/
│   │   │   ├── draw/               # RNG draw engine
│   │   │   ├── payouts/            # Payout table calculation
│   │   │   └── index.ts
│   │   └── package.json
│   │
│   ├── casino/                     # Casino plugin foundation
│   │   ├── src/
│   │   │   ├── plugin-interface/   # ICasinoGame contract
│   │   │   └── index.ts
│   │   └── package.json
│   │
│   ├── trading/                    # Trading domain logic
│   │   ├── src/
│   │   │   ├── matching/           # Order matching algorithm
│   │   │   ├── risk/               # Position limits, risk checks
│   │   │   └── index.ts
│   │   └── package.json
│   │
│   ├── payments/                   # Payment provider integrations
│   │   ├── src/
│   │   │   ├── providers/          # Stripe, Flutterwave, M-Pesa adapters
│   │   │   ├── interfaces/         # IPaymentProvider contract
│   │   │   ├── webhooks/           # Webhook verification & parsing
│   │   │   └── index.ts
│   │   └── package.json
│   │
│   └── notifications/              # Notification delivery
│       ├── src/
│       │   ├── channels/           # Email, SMS, Push, In-App
│       │   ├── templates/          # Notification templates
│       │   ├── interfaces/         # INotificationChannel
│       │   └── index.ts
│       └── package.json
│
├── infrastructure/
│   ├── docker/
│   │   ├── docker-compose.yml          # Full local stack
│   │   ├── docker-compose.dev.yml      # Dev overrides
│   │   └── docker-compose.test.yml     # Integration test stack
│   ├── nginx/
│   │   └── nginx.conf                  # API Gateway / reverse proxy config
│   └── postgres/
│       └── init.sql                    # DB init scripts
│
├── .github/
│   ├── workflows/
│   │   ├── ci.yml                  # Lint, test, build on PR
│   │   ├── cd-identity.yml         # Deploy identity-api
│   │   ├── cd-wallet.yml
│   │   ├── cd-gaming.yml
│   │   └── cd-trading.yml
│   ├── ISSUE_TEMPLATE/
│   ├── PULL_REQUEST_TEMPLATE.md
│   └── CODEOWNERS
│
├── docs/
│   ├── architecture.md             # This file
│   ├── system-architecture-evolution-v1.md
│   ├── adr/                        # Architecture Decision Records
│   │   ├── 001-monorepo-strategy.md
│   │   ├── 002-database-per-domain.md
│   │   └── 003-event-bus-strategy.md
│   └── api/                        # OpenAPI specs per service
│
├── CONTRIBUTING.md
├── CODE_OF_CONDUCT.md
├── SECURITY.md
├── LICENSE
├── package.json
├── pnpm-workspace.yaml
├── tsconfig.base.json
└── README.md
```


---

## 2. System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────┐
│                          CLIENT LAYER                                    │
│           Web App │ Mobile App │ Admin Dashboard │ Third-Party API       │
└──────────────────────────────┬──────────────────────────────────────────┘
                               │ HTTPS
┌──────────────────────────────▼──────────────────────────────────────────┐
│                        API GATEWAY / NGINX                               │
│          Route by path prefix · TLS termination · Rate limiting         │
│  /auth/*  /wallet/*  /gaming/*  /trading/*  /admin/*  /notifications/*  │
└────┬──────────┬──────────┬──────────┬──────────┬──────────┬────────────┘
     │          │          │          │          │          │
     ▼          ▼          ▼          ▼          ▼          ▼
┌─────────┐ ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐ ┌──────────────┐
│identity │ │wallet  │ │gaming  │ │trading │ │admin   │ │notifications │
│  -api   │ │  -api  │ │  -api  │ │  -api  │ │  -api  │ │  (embedded)  │
│ :3001   │ │ :3002  │ │ :3003  │ │ :3004  │ │ :3005  │ │              │
└────┬────┘ └───┬────┘ └───┬────┘ └───┬────┘ └───┬────┘ └──────┬───────┘
     │          │          │          │          │             │
     │          │          │          │          │             │
     └──────────┴──────────┴──────────┴──────────┴─────────────┘
                                   │
               ┌───────────────────▼───────────────────┐
               │        INTERNAL EVENT BUS              │
               │   (Redis Pub/Sub in V1 →               │
               │    Kafka/NATS in V2)                   │
               └───────────────────────────────────────┘
                                   │
          ┌────────────────────────┼──────────────────────┐
          │                        │                       │
     ┌────▼──────┐          ┌──────▼──────┐         ┌─────▼──────┐
     │PostgreSQL │          │    Redis     │         │  External  │
     │(per-domain│          │  · Sessions  │         │  Services  │
     │ schemas)  │          │  · Cache     │         │  (Stripe,  │
     │           │          │  · Pub/Sub   │         │  M-Pesa,   │
     │ identity  │          │  · Rate Lmt  │         │  Twilio,   │
     │ wallet    │          │  · Locks     │         │  Firebase) │
     │ gaming    │          │  · Leaderbd  │         └────────────┘
     │ trading   │          └─────────────┘
     └───────────┘
```

### Request Flow Example — Place a Bet

```
Client
  │  POST /gaming/betting/slip
  ▼
Nginx API Gateway
  │  forward → gaming-api:3003
  ▼
gaming-api  [BettingController]
  │  1. JwtAuthGuard (validates JWT via packages/auth)
  │  2. Validate slip (packages/betting/validation)
  │  3. HTTP call → wallet-api: POST /internal/holds (reserve funds)
  │  4. Persist BetSlip in gaming DB
  │  5. Publish event: BetPlaced → Redis Pub/Sub
  ▼
Event Bus (Redis Pub/Sub)
  ├── wallet-api subscriber → confirm hold
  ├── notifications → "Bet placed successfully" push
  └── admin-api → live feed update
```


---

## 3. Domain Boundaries

Each domain owns its data, logic, and events. No domain reaches into another domain's database.

| Domain       | Owns                                               | Communicates Via                          | Must NOT Touch             |
|--------------|----------------------------------------------------|-------------------------------------------|----------------------------|
| Identity     | Users, sessions, roles, KYC status                | Events: UserCreated, KYCApproved          | Wallet DB, Gaming DB       |
| Wallet       | Balances, ledger entries, holds, transactions      | Events: WalletDebited, WalletCredited     | User PII, Bet logic        |
| Payments     | Payment intents, provider webhooks, deposit/withdraw | Events: DepositConfirmed, WithdrawCompleted | Wallet balance directly  |
| Betting      | Markets, selections, slips, settlement             | Events: BetPlaced, BetSettled             | Wallet balance directly    |
| Keno         | Games, draws, tickets, payouts                     | Events: KenoDrawCompleted, TicketWon      | Wallet balance directly    |
| Casino       | Sessions, rounds, game results (future)            | Events: CasinoRoundCompleted              | Wallet balance directly    |
| Trading      | Orders, order book, trades, positions              | Events: OrderFilled, PositionUpdated      | Wallet balance directly    |
| Notifications| Channels, templates, delivery logs                 | Subscribes to all domain events           | Business logic             |
| Admin        | Reports, audit logs, management views              | Read-only projections + admin commands    | Direct game/wallet writes  |

### Anti-Corruption Layers

- All cross-domain calls go through **internal HTTP endpoints** (`/internal/*`) or **events**, never direct DB joins.
- The `wallet-api` is the single source of truth for money. Betting, gaming, and trading only call wallet via HTTP or events — they never write to the wallet database.
- Identity provides a `UserContext` DTO (userId, roles, kycStatus) that other services consume but never duplicate.


---

## 4. Database Design Strategy

### Strategy: Schema-per-Domain in a Single PostgreSQL Instance (V1)

In V1, all domains share one PostgreSQL instance but use **separate schemas**. This gives you logical isolation without the operational overhead of multiple databases. In V2, each schema can be split into its own database/instance with zero code changes.

```
PostgreSQL Instance
├── schema: identity     → users, sessions, roles, kyc_verifications
├── schema: wallet       → wallets, ledger_entries, holds, transactions
├── schema: gaming       → bet_slips, markets, selections, keno_games, keno_tickets
└── schema: trading      → orders, trades, positions, instruments
```

### TypeORM Configuration (per app)

```typescript
// apps/wallet-api — TypeORM DataSource
{
  type: 'postgres',
  schema: 'wallet',           // ← domain-scoped schema
  entities: [__dirname + '/**/*.entity{.ts,.js}'],
  migrations: [__dirname + '/migrations/*{.ts,.js}'],
}
```

### Core Entity Design

**Identity Schema**
```sql
users (id UUID PK, email, username, password_hash, kyc_status, is_active, created_at)
sessions (id UUID PK, user_id FK, refresh_token_hash, device_info, expires_at)
roles (id, name, permissions JSONB)
user_roles (user_id FK, role_id FK)
```

**Wallet Schema**
```sql
wallets        (id UUID PK, user_id UUID UNIQUE, currency, created_at)
ledger_entries (id UUID PK, wallet_id FK, type [CREDIT|DEBIT], amount NUMERIC(20,8),
                reference_id, reference_type, balance_after NUMERIC(20,8), created_at)
holds          (id UUID PK, wallet_id FK, amount, reason, reference_id, status, expires_at)
```

**Gaming Schema**
```sql
markets        (id, sport, name, status, starts_at, metadata JSONB)
selections     (id, market_id FK, name, odds NUMERIC(10,4), status)
bet_slips      (id UUID PK, user_id, total_stake, potential_payout, status, settled_at)
bet_lines      (id, slip_id FK, selection_id FK, odds_at_placement)
keno_games     (id, draw_number, drawn_numbers INT[], status, drawn_at)
keno_tickets   (id UUID PK, user_id, game_id FK, selected_numbers INT[], stake, payout)
```

**Trading Schema**
```sql
instruments    (id, symbol, base_currency, quote_currency, status)
orders         (id UUID PK, user_id, instrument_id FK, side [BUY|SELL], type, quantity,
                price, filled_quantity, status, created_at)
trades         (id UUID PK, buy_order_id FK, sell_order_id FK, quantity, price, executed_at)
positions      (id UUID PK, user_id, instrument_id FK, quantity, avg_entry_price, unrealized_pnl)
```

### Migration Strategy

- All migrations live in each app's `src/migrations/` folder.
- Use TypeORM CLI: `typeorm migration:generate` and `typeorm migration:run`.
- Never run raw SQL in production — all schema changes through migrations.
- V2 split: extract each schema to its own database by changing the DataSource config only.


---

## 5. Redis Usage Strategy

Redis serves multiple distinct roles. Each use case uses a **dedicated key namespace** to avoid collisions.

| Namespace Prefix         | Use Case                              | TTL / Eviction           |
|--------------------------|---------------------------------------|--------------------------|
| `session:{userId}`       | JWT refresh token session store       | 7 days (sliding)         |
| `cache:user:{userId}`    | User profile cache                    | 5 minutes                |
| `cache:market:{id}`      | Sports market/odds cache              | 30 seconds               |
| `cache:keno:current`     | Current Keno game state               | Until draw completes     |
| `rate:{ip}:{endpoint}`   | Rate limiting per IP + endpoint       | 1 minute window          |
| `lock:bet:{slipId}`      | Distributed lock — prevent double bet | 10 seconds               |
| `lock:wallet:{userId}`   | Distributed lock — wallet operations  | 5 seconds                |
| `ob:{symbol}`            | Order book snapshot (trading)         | Real-time, no TTL        |
| `leaderboard:{period}`   | Game leaderboard sorted set           | Rotated per period       |
| `pubsub:events`          | Internal event bus (V1)               | N/A (fire and forget)    |

### Distributed Locking Pattern (Critical for Wallet & Betting)

```typescript
// packages/shared/src/redis/redlock.service.ts
async withLock<T>(key: string, ttl: number, fn: () => Promise<T>): Promise<T> {
  const lock = await this.redlock.acquire([`lock:${key}`], ttl);
  try {
    return await fn();
  } finally {
    await lock.release();
  }
}

// Usage in wallet-api — debit operation
await this.redlock.withLock(`wallet:${userId}`, 5000, async () => {
  const balance = await this.walletRepo.getBalance(userId);
  if (balance < amount) throw new InsufficientFundsException();
  await this.ledgerRepo.debit({ userId, amount, reference });
});
```

### Caching Pattern

```typescript
// packages/shared/src/redis/cache.service.ts
async getOrSet<T>(key: string, ttl: number, factory: () => Promise<T>): Promise<T> {
  const cached = await this.redis.get(key);
  if (cached) return JSON.parse(cached);
  const fresh = await factory();
  await this.redis.setex(key, ttl, JSON.stringify(fresh));
  return fresh;
}
```


---

## 6. Event Architecture

### V1 — Redis Pub/Sub (In-Process Event Bus with Redis transport)

In V1, NestJS's `EventEmitter2` handles in-process events within a single app. For cross-app events, Redis Pub/Sub is used as a lightweight message bus.

```
Domain Service
    │  emit('bet.placed', payload)
    ▼
EventEmitter2 (in-process)
    │  + publish to Redis channel: events:gaming
    ▼
Redis Pub/Sub
    ├── wallet-api subscriber → hold confirmation
    ├── notifications subscriber → push notification
    └── admin-api subscriber → live dashboard update
```

### Event Naming Convention

```
{domain}.{entity}.{past-tense-action}

Examples:
  identity.user.created
  identity.user.kyc-approved
  wallet.balance.debited
  wallet.balance.credited
  gaming.bet.placed
  gaming.bet.settled
  gaming.keno-ticket.won
  trading.order.filled
  payments.deposit.confirmed
  payments.withdrawal.completed
```

### Base Event Contract

```typescript
// packages/shared/src/events/base.event.ts
export abstract class BaseEvent {
  readonly eventId: string = crypto.randomUUID();
  readonly occurredAt: Date = new Date();
  abstract readonly eventType: string;
  abstract readonly aggregateId: string;   // e.g. userId, betSlipId
  abstract readonly aggregateType: string; // e.g. 'User', 'BetSlip'
  readonly correlationId?: string;         // trace across services
  readonly version: number = 1;
}

// Example
export class BetPlacedEvent extends BaseEvent {
  readonly eventType = 'gaming.bet.placed';
  readonly aggregateType = 'BetSlip';

  constructor(
    readonly aggregateId: string,  // slipId
    readonly userId: string,
    readonly totalStake: number,
    readonly currency: string,
    readonly correlationId?: string,
  ) { super(); }
}
```

### V2 — Migration to Kafka / NATS

When V2 migration begins, replace the Redis Pub/Sub transport with Kafka or NATS:

- Each domain gets a **dedicated Kafka topic**: `gaming.events`, `wallet.events`, `identity.events`
- Enable **consumer groups** for independent scaling of subscribers
- Add **event sourcing** for the wallet ledger (append-only event log)
- **Outbox Pattern**: Persist events to DB in the same transaction, then publish — prevents lost events

```
V1: emit() → Redis Pub/Sub   (at-most-once)
V2: emit() → Outbox table → Kafka → consumer groups  (at-least-once + idempotent consumers)
```


---

## 7. Deployment Architecture

### V1 — Docker Compose (Local Dev + Single-Server Production)

```yaml
# infrastructure/docker/docker-compose.yml (abbreviated)
services:
  nginx:
    image: nginx:alpine
    ports: ["80:80", "443:443"]
    depends_on: [identity-api, wallet-api, gaming-api, trading-api, admin-api]

  identity-api:
    build: ../../apps/identity-api
    environment:
      PORT: 3001
      DB_SCHEMA: identity
      REDIS_URL: redis://redis:6379
    depends_on: [postgres, redis]

  wallet-api:
    build: ../../apps/wallet-api
    environment:
      PORT: 3002
      DB_SCHEMA: wallet

  gaming-api:
    build: ../../apps/gaming-api
    environment:
      PORT: 3003
      DB_SCHEMA: gaming

  trading-api:
    build: ../../apps/trading-api
    environment:
      PORT: 3004
      DB_SCHEMA: trading

  admin-api:
    build: ../../apps/admin-api
    environment:
      PORT: 3005

  postgres:
    image: postgres:16-alpine
    volumes: [pgdata:/var/lib/postgresql/data]
    environment:
      POSTGRES_DB: ogp
      POSTGRES_USER: ogp_user
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}

  redis:
    image: redis:7-alpine
    command: redis-server --requirepass ${REDIS_PASSWORD}

volumes:
  pgdata:
```

### Dockerfile Pattern (per app)

```dockerfile
# apps/identity-api/Dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY packages/ ./packages/
COPY apps/identity-api/ ./apps/identity-api/
RUN npm install -g pnpm && pnpm install --frozen-lockfile
RUN pnpm --filter identity-api build

FROM node:20-alpine AS runner
WORKDIR /app
COPY --from=builder /app/apps/identity-api/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
USER node
CMD ["node", "dist/main.js"]
```

### V2 — Kubernetes Deployment

```
Kubernetes Cluster
├── Namespace: ogp-production
│   ├── Deployment: identity-api     (replicas: 3)
│   ├── Deployment: wallet-api       (replicas: 3)
│   ├── Deployment: gaming-api       (replicas: 5, HPA on CPU)
│   ├── Deployment: trading-api      (replicas: 3)
│   ├── Deployment: admin-api        (replicas: 2)
│   ├── Service: ClusterIP per app
│   └── Ingress: NGINX Ingress Controller
│
├── Namespace: ogp-data
│   ├── StatefulSet: PostgreSQL (or managed RDS)
│   └── StatefulSet: Redis Cluster (or managed ElastiCache)
│
└── Namespace: ogp-messaging (V2)
    └── StatefulSet: Kafka + Zookeeper (or managed MSK)
```

### Environment Strategy

| Environment | Infra                       | Purpose                        |
|-------------|-----------------------------|--------------------------------|
| local       | docker-compose.dev.yml      | Developer machines             |
| test        | docker-compose.test.yml     | Integration tests in CI        |
| staging     | K8s / single Docker host    | Pre-production QA              |
| production  | K8s + managed DB/Redis      | Live users                     |


---

## 8. Security Architecture

### Authentication Flow

```
Client → POST /auth/login → identity-api
  │
  ├── Validate credentials (bcrypt compare)
  ├── Check KYC status, is_active flag
  ├── Issue: access_token (JWT, 15 min) + refresh_token (opaque, 7 days)
  ├── Store refresh_token hash in Redis: session:{userId}:{tokenId}
  └── Return tokens to client

Client → Any API (with Authorization: Bearer <access_token>)
  │
  └── JwtAuthGuard (packages/auth) verifies JWT signature + expiry
      No DB call needed for access token validation
```

### JWT Payload (minimal — never embed sensitive data)

```typescript
interface JwtPayload {
  sub: string;       // userId
  email: string;
  roles: string[];
  kycStatus: 'pending' | 'approved' | 'rejected';
  iat: number;
  exp: number;
}
```

### Authorization — RBAC

```typescript
// Roles: PLAYER, OPERATOR, ADMIN, SUPER_ADMIN
// Usage:
@Roles('ADMIN', 'OPERATOR')
@UseGuards(JwtAuthGuard, RolesGuard)
@Get('/admin/users')
listUsers() {}
```

### Security Layers

| Layer              | Mechanism                                                    |
|--------------------|--------------------------------------------------------------|
| Transport          | TLS 1.3 via Nginx, HSTS headers                              |
| Authentication     | JWT (short-lived) + refresh token rotation                   |
| Authorization      | RBAC with permission checks                                  |
| Rate Limiting      | Redis-backed, per IP + per user (NestJS ThrottlerModule)     |
| Input Validation   | class-validator + class-transformer on all DTOs              |
| SQL Injection      | TypeORM parameterized queries (never raw interpolation)      |
| Secrets            | Environment variables, never committed to repo               |
| Wallet Operations  | Distributed Redis lock on every debit/credit                 |
| Payment Webhooks   | HMAC signature verification per provider                     |
| Audit Log          | Every financial operation writes an immutable audit record   |
| CORS               | Allowlist of trusted origins only                            |
| Internal endpoints | `/internal/*` routes blocked at Nginx — only service-to-service |

### KYC Gate Pattern

```typescript
// Decorator enforces KYC before financial operations
@KycRequired()          // custom guard reads JWT kycStatus claim
@Post('/wallet/deposit')
deposit(@Body() dto: DepositDto) {}
```


---

## 9. Wallet Architecture

The wallet is the financial core of the platform. It uses a **double-entry ledger** — every money movement creates two ledger entries that always balance.

### Core Principles

1. **Ledger is the source of truth** — the balance is derived from ledger entries, not a simple number column.
2. **All operations are atomic** — wrapped in DB transactions + Redis distributed lock.
3. **Idempotent operations** — each operation requires a unique `referenceId` to prevent double-processing.
4. **Holds before debit** — funds are reserved (held) before a bet/trade; settled after outcome.

### Wallet Flow — Bet Placement

```
User places bet (stake: $10)
        │
        ▼
gaming-api
  POST /internal/wallet/hold
  { userId, amount: 10, reason: 'BET', referenceId: slipId }
        │
        ▼
wallet-api  [HoldService]
  ├── Acquire Redis lock: lock:wallet:{userId}
  ├── Check available balance = total_balance - sum(active_holds)
  ├── If sufficient → INSERT hold record
  ├── INSERT ledger entry (type: HOLD_CREATED)
  ├── Release lock
  └── Return { holdId }
        │
        ▼ (after settlement)
gaming-api
  POST /internal/wallet/settle
  { holdId, outcome: WIN, payoutAmount: 25 }
        │
        ▼
wallet-api  [SettlementService]
  ├── Acquire lock
  ├── Delete/expire hold
  ├── INSERT ledger: DEBIT (stake consumed) + CREDIT (payout)
  ├── Release lock
  └── Publish: WalletCredited event
```

### Ledger Entry Types

```typescript
enum LedgerEntryType {
  DEPOSIT          = 'DEPOSIT',
  WITHDRAWAL       = 'WITHDRAWAL',
  BET_HOLD         = 'BET_HOLD',
  BET_DEBIT        = 'BET_DEBIT',       // stake consumed on loss
  BET_WIN_CREDIT   = 'BET_WIN_CREDIT',  // payout credited on win
  BET_HOLD_RELEASE = 'BET_HOLD_RELEASE',// hold released on cancel
  TRADE_HOLD       = 'TRADE_HOLD',
  TRADE_SETTLEMENT = 'TRADE_SETTLEMENT',
  BONUS_CREDIT     = 'BONUS_CREDIT',
  FEE_DEBIT        = 'FEE_DEBIT',
  ADJUSTMENT       = 'ADJUSTMENT',       // admin corrections
}
```

### Multi-Currency Support

```typescript
// Each wallet is currency-specific
// A user can have multiple wallets: USD, BTC, NGN
wallets (id, user_id, currency, is_default)

// All amounts stored as NUMERIC(20, 8) to support crypto precision
// Display conversion handled in the presentation layer
```


---

## 10. Betting Architecture

### Domain Model

```
Sport → League → Event (Match) → Market → Selection
                                            │
                                      BetSlip ← BetLine (1..n selections)
```

### State Machine — BetSlip

```
PENDING → ACCEPTED → SETTLED (WIN | LOSS | VOID)
               └──→ CANCELLED
```

### Odds Formats (handled in packages/betting/odds)

- Decimal (1.95) — stored internally, all calculations use decimal
- Fractional (19/20) — display conversion
- American (-105) — display conversion
- Asian Handicap — special market type

### Bet Types

| Type           | Description                                  |
|----------------|----------------------------------------------|
| Single         | One selection, straightforward win/loss       |
| Accumulator    | Multiple legs, all must win, multiplied odds  |
| System bet     | Subset combinations (e.g., 2-of-3)           |
| Live/In-Play   | Bets placed while event is in progress        |

### Settlement Flow

```
External feed (odds provider) → gaming-api webhook
        │  EventResult: { marketId, outcome }
        ▼
SettlementService
  ├── Update selection status (WIN/LOSS/VOID)
  ├── Find all affected BetSlips
  ├── For each slip:
  │   ├── Calculate payout (packages/betting/settlement)
  │   ├── POST /internal/wallet/settle
  │   └── Update slip status
  └── Publish: BetSettled events (batch)
```

### Potential Payout Calculation

```typescript
// packages/betting/src/settlement/payout.calculator.ts
// Accumulator: product of all odds * stake
const payout = slip.lines.reduce((acc, line) => acc * line.oddsAtPlacement, 1) * slip.stake;

// Maximum payout cap enforced per operator config
const cappedPayout = Math.min(payout, operatorConfig.maxPayout);
```


---

## 11. Keno Architecture

### Game Lifecycle

```
KenoGame created (status: OPEN)
        │  Accept tickets until draw time
        ▼
Ticket sales window closes (status: DRAWING)
        │
        ▼
DrawEngine (packages/keno/draw)
  ├── Generate 20 random numbers from 1–80 (cryptographically secure RNG)
  ├── Store drawn_numbers on KenoGame
  └── Update status: DRAWN
        │
        ▼
PayoutEngine
  ├── For each ticket: count matches between selected and drawn numbers
  ├── Look up payout table [spots_picked][matches_hit] → multiplier
  ├── Calculate payout = stake × multiplier
  ├── POST /internal/wallet/credit per winning ticket
  └── Update ticket status (WON / LOST)
        │
        ▼
Publish: KenoDrawCompleted event
  └── Notifications: "You won $X on Keno!"
```

### RNG Requirements

```typescript
// packages/keno/src/draw/rng.ts
// Use crypto.randomInt (Node.js) — NOT Math.random()
import { randomInt } from 'crypto';

function drawKeno(count: number, max: number): number[] {
  const pool = Array.from({ length: max }, (_, i) => i + 1);
  const drawn: number[] = [];
  while (drawn.length < count) {
    const idx = randomInt(0, pool.length);
    drawn.push(pool.splice(idx, 1)[0]);
  }
  return drawn.sort((a, b) => a - b);
}
```

### Keno Payout Table (Example — configurable per operator)

| Spots Picked | Matches | Multiplier |
|---|---|---|
| 1 | 1 | 3x |
| 2 | 2 | 9x |
| 3 | 3 | 27x |
| 4 | 4 | 75x |
| 5 | 5 | 300x |
| 10 | 10 | 10,000x |

Payout tables are stored in the database and configurable by admins — they are not hardcoded.

### Draw Frequency Options

- **Standard**: draws every 5 minutes
- **Quick Keno**: draws every 1 minute  
- **Manual**: operator-triggered draws
- Draw scheduling handled by a NestJS `@Cron` task in gaming-api.


---

## 12. Trading Architecture

### Order Book Design

The order book lives in **Redis sorted sets** (for performance) and is persisted to PostgreSQL for durability.

```
Instrument: BTC/USD
  ├── BIDS (sorted set): key=ob:BTCUSD:bids  score=price (desc)
  └── ASKS (sorted set): key=ob:BTCUSD:asks  score=price (asc)
```

### Order Matching Engine (packages/trading/matching)

```
Incoming LIMIT BUY order (price: 50,000, qty: 1 BTC)
        │
        ▼
MatchingEngine
  ├── Lock instrument: lock:ob:BTCUSD (Redis)
  ├── Check asks sorted set for price ≤ 50,000
  ├── If match found:
  │   ├── Fill order (partial or full)
  │   ├── Create Trade record
  │   ├── Update/remove matched ask order
  │   ├── POST /internal/wallet/settle (buyer ← BTC, seller ← USD)
  │   └── Publish: OrderFilled event
  ├── If no match: insert into bids sorted set (resting order)
  └── Release lock
```

### Order Types

| Type         | Behaviour                                          |
|--------------|----------------------------------------------------|
| LIMIT        | Rests at price until matched or cancelled          |
| MARKET       | Matches immediately at best available price        |
| STOP-LIMIT   | Triggers LIMIT order when price hits stop price    |
| IOC          | Immediate-or-cancel, fills what it can instantly   |

### Position Tracking

```typescript
// Positions updated after every trade
// PnL = (current_price - avg_entry_price) × quantity
// Unrealized PnL cached in Redis, realized PnL persisted in DB
```

### Risk Controls

- Per-user position limits (max open quantity per instrument)
- Margin requirements (future: margin trading)
- Daily loss limits (configurable per user tier)
- Circuit breakers: halt trading if price moves > X% in Y minutes


---

## 13. Plugin Architecture

The platform is designed to allow new game types (casino games, lottery, custom games) to be added as plugins without modifying core code.

### Plugin Contract

```typescript
// packages/casino/src/plugin-interface/casino-game.interface.ts
export interface ICasinoGame {
  readonly gameId: string;
  readonly gameName: string;
  readonly gameType: 'SLOTS' | 'TABLE' | 'LIVE' | 'VIRTUAL';

  // Called when player starts a round
  initRound(params: RoundInitParams): Promise<RoundInitResult>;

  // Called to resolve round outcome
  resolveRound(params: RoundResolveParams): Promise<RoundResolveResult>;

  // Returns current RTP configuration
  getRTPConfig(): RTPConfig;

  // Validates a bet before wallet hold
  validateBet(params: BetValidationParams): ValidationResult;
}

export interface RoundInitResult {
  roundId: string;
  clientSeed?: string;     // for provably fair games
  serverSeedHash?: string; // commit before reveal
}

export interface RoundResolveResult {
  outcome: GameOutcome;
  payout: number;
  serverSeed?: string;     // revealed after round for fairness proof
}
```

### Plugin Registration (NestJS Dynamic Modules)

```typescript
// apps/gaming-api/src/casino/casino.module.ts
@Module({})
export class CasinoModule {
  static forPlugins(plugins: ICasinoGame[]): DynamicModule {
    return {
      module: CasinoModule,
      providers: [
        ...plugins.map(plugin => ({
          provide: `CASINO_GAME_${plugin.gameId}`,
          useValue: plugin,
        })),
        CasinoService,
      ],
      exports: [CasinoService],
    };
  }
}

// Usage:
CasinoModule.forPlugins([
  new SlotsGame(),
  new RouletteGame(),
  new BlackjackGame(),
])
```

### Provably Fair Pattern (for Keno and Casino)

```
Server commits: serverSeedHash = SHA256(serverSeed)
  → Send hash to client before round

Round resolves using: outcome = derive(serverSeed + clientSeed + nonce)

After round:
  → Reveal serverSeed
  → Client can verify: SHA256(serverSeed) === committed hash
  → Client can reproduce outcome independently
```


---

## 14. Migration Path

### Hybrid Monorepo → Microservices

The migration is **domain-by-domain, triggered by real bottlenecks** — not a big-bang rewrite.

### Trigger Criteria (when to extract a service)

| Trigger                              | Candidate Domain          |
|--------------------------------------|---------------------------|
| DB connection pool saturation        | gaming-api (high traffic) |
| Deployment coupling causing risk     | wallet-api (high risk)    |
| Independent scaling needs            | trading-api (low latency) |
| Team ownership boundaries            | any domain                |
| Compliance isolation required        | payments, identity        |

### Migration Steps Per Domain

**Step 1 — Enforce the contract boundary (do now)**
- All cross-domain calls already use `/internal/*` HTTP endpoints or events.
- Domain packages (`packages/betting`, etc.) have no cross-domain imports.
- Each domain uses its own DB schema.

**Step 2 — Extract the DB (when ready)**
```
Before: PostgreSQL single instance, schema=gaming
After:  PostgreSQL dedicated instance for gaming
Change: Only update the TypeORM DataSource connection string
Code change: Zero (config only)
```

**Step 3 — Extract the service**
```
Before: packages/betting code runs inside gaming-api process
After:  New standalone betting-service app reads from packages/betting

Migration:
1. Copy the domain module from gaming-api into a new apps/betting-service
2. Update Nginx routing: /betting/* → betting-service:3006
3. Remove the module from gaming-api
4. No package/library code changes needed
```

**Step 4 — Upgrade the event bus**
```
Before: Redis Pub/Sub (at-most-once, no consumer groups)
After:  Kafka (at-least-once, consumer groups, replay)

Migration:
1. Implement Outbox pattern in event publishers (V1 prep)
2. Deploy Kafka
3. Replace Redis Pub/Sub calls with Kafka producer/consumer
4. No domain business logic changes
```

**Step 5 — Kubernetes**
```
Before: Docker Compose
After:  Kubernetes manifests per service

Migration:
1. Convert each Dockerfile into a K8s Deployment + Service
2. Add ConfigMaps and Secrets for env vars
3. Add HPA (Horizontal Pod Autoscaler) based on CPU/RPS
4. Add Ingress controller to replace Nginx config
```

### V1 → V2 Readiness Checklist

- [ ] All domain cross-calls use HTTP or events (no shared DB queries)
- [ ] All events use `BaseEvent` contract with `correlationId`
- [ ] All domain packages have zero cross-domain imports
- [ ] All financial operations use the Outbox pattern
- [ ] Health check endpoints on all apps
- [ ] Structured logging with correlation IDs
- [ ] Docker images built and pushed in CI


---

## 15. CI/CD Strategy

### GitHub Actions — Pipeline Per Service

Each app has an independent pipeline so a change in `gaming-api` doesn't block deployment of `wallet-api`.

```yaml
# .github/workflows/ci.yml — Runs on every PR
name: CI
on:
  pull_request:
    branches: [main, develop]

jobs:
  lint-and-test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v3
        with: { version: 9 }
      - run: pnpm install --frozen-lockfile
      - run: pnpm run lint
      - run: pnpm run test          # unit tests
      - run: pnpm run test:e2e      # integration (spins up docker-compose.test.yml)
```

```yaml
# .github/workflows/cd-gaming.yml — Deploy gaming-api on merge to main
name: Deploy gaming-api
on:
  push:
    branches: [main]
    paths:
      - 'apps/gaming-api/**'
      - 'packages/betting/**'
      - 'packages/keno/**'

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Build Docker image
        run: docker build -f apps/gaming-api/Dockerfile -t registry/gaming-api:${{ github.sha }} .
      - name: Push to registry
        run: docker push registry/gaming-api:${{ github.sha }}
      - name: Deploy to staging
        run: ./scripts/deploy.sh gaming-api staging ${{ github.sha }}
      - name: Run smoke tests
        run: ./scripts/smoke-test.sh staging
      - name: Promote to production
        if: success()
        run: ./scripts/deploy.sh gaming-api production ${{ github.sha }}
```

### Branch Strategy

```
main          → production deployments (protected, requires PR + CI pass)
develop       → staging deployments
feature/*     → developer branches, CI runs on PR to develop
hotfix/*      → emergency fixes, PR directly to main + backport to develop
```

### Versioning

- **Semantic versioning** for packages (`packages/*`) using Changesets
- **Git SHA tags** for Docker images in production
- **API versioning**: URL prefix `/v1/` from the start, avoids breaking clients on future changes


---

## 16. Monitoring & Observability

### The Three Pillars

**1. Structured Logging (Pino)**

```typescript
// packages/shared/src/logger/logger.ts
// Every log line is JSON with consistent fields
{
  "level": "info",
  "timestamp": "2025-01-01T00:00:00.000Z",
  "service": "gaming-api",
  "correlationId": "abc-123",   // trace across services
  "userId": "user-456",
  "action": "bet.placed",
  "slipId": "slip-789",
  "stake": 10.00,
  "duration_ms": 45
}
```

**2. Metrics (Prometheus + Grafana)**

```typescript
// Expose /metrics endpoint (prom-client)
// Key metrics per service:
http_request_duration_ms       // latency histogram per route
http_requests_total             // rate, error rate
wallet_operations_total         // debit/credit operations
bet_placed_total                // volume of bets
keno_tickets_sold_total         // Keno volume
trading_orders_total            // order flow
redis_lock_acquire_duration_ms  // lock contention
db_query_duration_ms            // DB performance
```

**3. Distributed Tracing (OpenTelemetry → Jaeger/Tempo)**

```typescript
// packages/shared/src/tracing/otel.ts
// Auto-instrument HTTP, DB, Redis calls
// Propagate trace context via HTTP headers (traceparent)
// Every cross-service call carries the same traceId
```

### Alerting Rules (Prometheus Alertmanager)

| Alert                          | Condition                           | Severity  |
|-------------------------------|--------------------------------------|-----------|
| High error rate                | 5xx rate > 1% for 2 min             | critical  |
| Wallet operation failure       | Any wallet debit/credit error       | critical  |
| High API latency               | p99 > 2s for 5 min                  | warning   |
| Redis lock timeout             | Lock wait > 1s                      | warning   |
| DB connection pool exhaustion  | Pool > 90% utilized                 | warning   |
| Settlement backlog             | Unsettled bets > 15 min past event  | critical  |

### Health Checks (per app)

```typescript
// NestJS TerminusModule
@Get('/health')
check() {
  return this.health.check([
    () => this.db.pingCheck('database'),
    () => this.redis.pingCheck('redis'),
    () => this.disk.checkStorage('storage', { thresholdPercent: 0.9 }),
    () => this.memory.checkHeap('memory_heap', 300 * 1024 * 1024),
  ]);
}
```

### Dashboards

- **Grafana**: Per-service latency, error rates, throughput
- **Business metrics**: Bets placed/settled per minute, Keno ticket revenue, wallet volume
- **Financial reconciliation**: Daily ledger balance checks, settlement lag


---

## 17. Open-Source Project Governance

### Repository Structure for Open Source

```
open-gaming-platform/
├── CONTRIBUTING.md         # How to contribute (setup, PR process, code style)
├── CODE_OF_CONDUCT.md      # Community standards (Contributor Covenant)
├── SECURITY.md             # Vulnerability disclosure policy
├── LICENSE                 # MIT License (or AGPL if you want copyleft)
├── CHANGELOG.md            # Auto-generated via Changesets
└── .github/
    ├── ISSUE_TEMPLATE/
    │   ├── bug_report.md
    │   ├── feature_request.md
    │   └── domain_plugin.md    # Template for proposing new game domains
    ├── PULL_REQUEST_TEMPLATE.md
    └── CODEOWNERS              # Domain owners for auto-review assignment
```

### CODEOWNERS Example

```
# .github/CODEOWNERS
/apps/wallet-api/         @wallet-team
/apps/identity-api/       @identity-team
/apps/gaming-api/         @gaming-team
/apps/trading-api/        @trading-team
/packages/shared/         @platform-team     # requires 2 reviewers
/packages/payments/       @payments-team @platform-team
```

### Issue Labels

| Label              | Meaning                                    |
|--------------------|--------------------------------------------|
| `domain:wallet`    | Wallet domain issue                        |
| `domain:gaming`    | Gaming domain issue                        |
| `domain:trading`   | Trading domain issue                       |
| `type:plugin`      | Proposal for a new game/payment plugin     |
| `type:bug`         | Bug report                                 |
| `type:feature`     | Feature request                            |
| `status:good-first-issue` | Suitable for new contributors       |
| `status:help-wanted`      | Looking for community contribution  |
| `breaking-change`  | Requires migration note in CHANGELOG       |

### Architecture Decision Records (ADRs)

Every significant architectural decision lives in `docs/adr/`:

```markdown
# ADR-001: Use Schema-per-Domain for PostgreSQL (V1)

## Status: Accepted

## Context
We need domain isolation but want to avoid operating multiple databases in V1.

## Decision
Use a single PostgreSQL instance with separate schemas per domain.

## Consequences
+ Zero operational overhead vs multiple DB instances
+ Easy migration to separate DBs in V2 (config change only)
- Shared DB is a single point of failure (mitigated by replication in staging/prod)
```

### Versioning & Release Strategy

- **Packages** (`packages/*`): [Semantic Versioning](https://semver.org/) via Changesets
- **Apps**: Deployed by Git SHA, not versioned separately
- **API contracts**: URL-versioned (`/v1/`) — never break existing endpoints

### Plugin Contribution Guidelines

Third parties can contribute new game domains or payment providers:

1. Implement the relevant interface (`ICasinoGame`, `IPaymentProvider`)
2. Add to `packages/` with its own `package.json`
3. Write unit tests covering the full game/payment lifecycle
4. Submit PR with documentation, ADR entry, and payout/settlement logic explanation
5. Platform team reviews for security (RNG, wallet integration) and code quality

---

## Quick Reference — Port Map

| Service        | Default Port | Purpose                  |
|----------------|-------------|--------------------------|
| identity-api   | 3001        | Auth, users, KYC         |
| wallet-api     | 3002        | Balances, ledger         |
| gaming-api     | 3003        | Betting, Keno, Casino    |
| trading-api    | 3004        | Order book, trades       |
| admin-api      | 3005        | Back-office              |
| PostgreSQL     | 5432        | Primary database         |
| Redis          | 6379        | Cache, sessions, events  |
| Nginx          | 80 / 443    | API gateway              |

---

*Last updated: June 2025 — Open Gaming Platform v1.0 (Hybrid Monorepo Phase)*
