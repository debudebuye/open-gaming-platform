import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { ErrorCode } from '../errors';

/**
 * Global exception filter — converts every thrown exception into
 * the standard ApiResponse error envelope.
 *
 * Register in main.ts:
 *   app.useGlobalFilters(new AllExceptionsFilter());
 */
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let code: string = ErrorCode.INTERNAL_ERROR;
    let message = 'An unexpected error occurred';
    let details: unknown;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const body = exception.getResponse();

      if (typeof body === 'object' && body !== null) {
        const b = body as Record<string, unknown>;
        code = (b['code'] as string) ?? ErrorCode.INTERNAL_ERROR;
        message = (b['message'] as string) ?? message;
        details = b['details'];
      } else {
        message = String(body);
      }
    } else if (exception instanceof Error) {
      this.logger.error(
        { err: exception, path: request.url },
        'Unhandled exception',
      );
    }

    response.status(status).json({
      success: false,
      error: {
        code,
        message,
        ...(details !== undefined && { details }),
      },
    });
  }
}
