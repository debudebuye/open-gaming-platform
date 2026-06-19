# @ogp/betting

Sports betting domain logic — odds, validation, and settlement.

## Exports

- `OddsConverter` — Convert between decimal, fractional, and American odds formats
- `SlipValidator` — Validate bet slip (max selections, min/max stake, duplicate markets)
- `PayoutCalculator` — Calculate potential and actual payouts for single/accumulator/system bets
- `SettlementEngine` — Process event results and settle affected slips
- Enums: `BetStatus`, `SelectionStatus`, `BetType`
- Events: `BetPlacedEvent`, `BetSettledEvent`, `BetCancelledEvent`

## Payout Formula

```
Single:      payout = stake × odds
Accumulator: payout = stake × (odds₁ × odds₂ × ... × oddsₙ)
```

Maximum payout is capped by operator configuration.
