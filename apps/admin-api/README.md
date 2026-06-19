# admin-api

Back-office API for the Open Gaming Platform.

## Responsibilities

- User management and KYC review
- Financial reporting and reconciliation
- Game management (markets, draws, instruments)
- Audit log access
- System configuration

## Port

`3005`

## Key Modules

- `users-admin` — View, ban, and manage user accounts
- `finance` — Deposit/withdrawal approvals, balance reports
- `game-management` — Market creation, Keno draw scheduling
- `reports` — Revenue, GGR, NGR reports
- `audit-logs` — Immutable audit trail for all admin actions

## Access Control

All endpoints require `ADMIN` or `OPERATOR` role (enforced via `JwtAuthGuard` + `RolesGuard` from `packages/auth`).
