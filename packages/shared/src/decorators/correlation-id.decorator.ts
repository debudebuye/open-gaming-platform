import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { IncomingMessage } from 'http';
import { randomUUID } from 'crypto';

/**
 * Extracts the X-Correlation-ID header from the request.
 * Generates a new UUID if the header is absent.
 *
 * Usage:
 *   @Get('/orders')
 *   list(@CorrelationId() correlationId: string) { ... }
 */
export const CorrelationId = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): string => {
    const req = ctx.switchToHttp().getRequest<IncomingMessage & { headers: Record<string, string> }>();
    return req.headers['x-correlation-id'] ?? randomUUID();
  },
);
