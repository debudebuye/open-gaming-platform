import { randomUUID } from 'crypto';

/**
 * Every domain event must extend BaseEvent.
 *
 * The contract is intentionally Kafka-compatible so V2 migration
 * is a transport swap, not a rewrite.
 *
 * Naming convention:  {domain}.{entity}.{past-tense-verb}
 *   e.g.  'identity.user.created'
 *         'wallet.balance.debited'
 *         'gaming.bet.settled'
 */
export abstract class BaseEvent {
  /** Globally unique event identifier */
  readonly eventId: string = randomUUID();

  /** Wall-clock time the event occurred */
  readonly occurredAt: Date = new Date();

  /** Dot-separated event type — used for routing/filtering */
  abstract readonly eventType: string;

  /** ID of the aggregate that produced this event (e.g. userId, slipId) */
  abstract readonly aggregateId: string;

  /** Type name of the aggregate (e.g. 'User', 'BetSlip') */
  abstract readonly aggregateType: string;

  /**
   * Trace ID that flows across service boundaries.
   * Set from the incoming HTTP request's X-Correlation-ID header.
   */
  readonly correlationId?: string;

  /** Schema version — increment when the payload shape changes */
  readonly version: number = 1;
}
