export enum BetStatus {
  PENDING = 'PENDING',
  ACCEPTED = 'ACCEPTED',
  SETTLED_WIN = 'SETTLED_WIN',
  SETTLED_LOSS = 'SETTLED_LOSS',
  SETTLED_VOID = 'SETTLED_VOID',
  CANCELLED = 'CANCELLED',
}

export enum SelectionStatus {
  OPEN = 'OPEN',
  SUSPENDED = 'SUSPENDED',
  CLOSED = 'CLOSED',
  WIN = 'WIN',
  LOSS = 'LOSS',
  VOID = 'VOID',
}

export enum BetType {
  SINGLE = 'SINGLE',
  ACCUMULATOR = 'ACCUMULATOR',
  SYSTEM = 'SYSTEM',
}

export enum MarketStatus {
  OPEN = 'OPEN',
  SUSPENDED = 'SUSPENDED',
  CLOSED = 'CLOSED',
}
