# ADR-003: Redis Pub/Sub as Event Bus (V1) with Kafka Migration Path (V2)

**Status:** Accepted  
**Date:** 2025-06

## Context

Cross-domain communication needs an event bus. The bus must support V1 simplicity and V2 durability/scalability.

Options considered:
1. Direct HTTP calls only (synchronous coupling)
2. **Redis Pub/Sub** — lightweight, already in stack
3. Kafka/NATS — powerful but heavy for V1

## Decision

**V1:** Use Redis Pub/Sub via NestJS EventEmitter2 with a Redis transport adapter.

**V2:** Migrate to Kafka (or NATS JetStream) using the Outbox Pattern.

All events must implement the `BaseEvent` contract from `packages/shared` from day one. This ensures the event shape is Kafka-compatible without modification.

## Outbox Pattern (V1 prep for V2)

Even in V1, financial events (wallet debits, bet settlements) should use the Outbox Pattern:
1. Write the event to an `outbox` table in the same DB transaction as the business operation
2. A background worker polls the outbox and publishes to Redis/Kafka
3. This prevents lost events if the app crashes between DB write and Redis publish

## Event Delivery Guarantees

| Phase | Bus          | Delivery        |
|-------|--------------|-----------------|
| V1    | Redis Pub/Sub | At-most-once    |
| V2    | Kafka        | At-least-once   |
| V2+   | Kafka + idempotent consumers | Effectively-once |

## Consequences

**Positive:**
- Redis is already in the stack — no extra infra for V1
- `BaseEvent` contract ensures V2 migration is a transport swap, not a rewrite
- Outbox pattern prevents event loss in financial flows

**Negative:**
- Redis Pub/Sub has no persistence — events lost if no subscriber is running
- No consumer groups — all subscribers receive all events (fine for V1 scale)
