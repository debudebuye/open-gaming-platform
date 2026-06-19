# @ogp/keno

Keno game domain logic — RNG draws and payout calculation.

## Exports

- `DrawEngine` — Cryptographically secure random draw (20 numbers from 1–80)
- `PayoutCalculator` — Calculate ticket payout based on spots picked vs matches hit
- `PayoutTableService` — Load and manage configurable payout tables per game variant
- Entities: `KenoGame`, `KenoTicket`
- Events: `KenoDrawCompletedEvent`, `KenoTicketWonEvent`

## RNG

Uses Node.js `crypto.randomInt` — NOT `Math.random()`. Supports provably fair mode where the server commits to a seed hash before drawing.

## Payout Tables

Payout tables are stored in the database and configurable by operators. The engine supports multiple variants (Standard Keno, Quick Keno, Power Keno) with different table multipliers.
