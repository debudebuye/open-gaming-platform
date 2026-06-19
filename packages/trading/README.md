# @ogp/trading

Trading domain logic — order matching, risk checks, and position management.

## Exports

- `MatchingEngine` — Price-time priority order matching algorithm
- `OrderBookService` — Redis-backed sorted set order book (bids/asks)
- `RiskService` — Pre-trade risk checks (position limits, daily loss limits)
- `PositionService` — Track and update user positions and unrealized PnL
- Entities: `Order`, `Trade`, `Position`, `Instrument`
- Events: `OrderFilledEvent`, `OrderCancelledEvent`, `PositionUpdatedEvent`

## Matching Algorithm

Price-time priority (FIFO at same price):
- **Buy orders**: matched against lowest ask ≤ buy price
- **Sell orders**: matched against highest bid ≥ sell price
- Partial fills supported

## Order Book Storage

Redis sorted sets for real-time performance, with PostgreSQL as the durable record of all orders and trades.
