# @ogp/wallet

Wallet domain logic — reusable balance, ledger, and hold computation.

## Exports

- `LedgerService` — Debit, credit, and balance calculation from ledger entries
- `HoldService` — Create, confirm, and release fund holds
- `BalanceCalculator` — Derives available balance (total - active holds)
- Entities: `Wallet`, `LedgerEntry`, `Hold`
- DTOs: `DebitDto`, `CreditDto`, `HoldDto`, `SettleHoldDto`

## Design

Uses a **double-entry ledger** — every money movement is recorded as an immutable ledger entry. The wallet balance is always computed from the ledger, never stored as a mutable field.

All operations that modify balance require a unique `referenceId` for idempotency.
