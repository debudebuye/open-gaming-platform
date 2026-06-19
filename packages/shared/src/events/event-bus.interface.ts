import { BaseEvent } from './base.event';

/**
 * Abstraction over the event transport.
 *
 * V1 implementation: Redis Pub/Sub
 * V2 implementation: Kafka / NATS JetStream
 *
 * Callers depend only on this interface — swapping the transport
 * requires no changes to domain code.
 */
export interface IEventBus {
  /**
   * Publish an event to the bus.
   * Fire-and-forget in V1; use Outbox for guaranteed delivery in V2.
   */
  publish(event: BaseEvent): Promise<void>;

  /**
   * Publish multiple events in a batch (e.g. after settlement).
   */
  publishAll(events: BaseEvent[]): Promise<void>;
}

/** NestJS DI token */
export const EVENT_BUS = Symbol('EVENT_BUS');
