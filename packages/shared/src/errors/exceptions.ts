import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  HttpException,
  HttpStatus,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { ErrorCode } from './error-codes';

interface ExceptionMeta {
  code: ErrorCode;
  message: string;
  details?: unknown;
}

/**
 * Base exception — all OGP exceptions extend this.
 * The `code` field gives clients a stable machine-readable identifier.
 */
export class OgpException extends HttpException {
  public readonly code: ErrorCode;

  constructor(meta: ExceptionMeta, status: HttpStatus) {
    super(
      {
        statusCode: status,
        code: meta.code,
        message: meta.message,
        ...(meta.details !== undefined && { details: meta.details }),
      },
      status,
    );
    this.code = meta.code;
  }
}

// ── Convenience subclasses ───────────────────────────────────────────────────

export class ValidationException extends OgpException {
  constructor(message: string, details?: unknown) {
    super({ code: ErrorCode.VALIDATION_ERROR, message, details }, HttpStatus.BAD_REQUEST);
  }
}

export class ResourceNotFoundException extends OgpException {
  constructor(resource: string, id?: string | number) {
    const message = id ? `${resource} '${id}' not found` : `${resource} not found`;
    super({ code: ErrorCode.NOT_FOUND, message }, HttpStatus.NOT_FOUND);
  }
}

export class UnauthorizedException_ extends OgpException {
  constructor(code: ErrorCode = ErrorCode.UNAUTHORIZED, message = 'Unauthorized') {
    super({ code, message }, HttpStatus.UNAUTHORIZED);
  }
}

export class ForbiddenException_ extends OgpException {
  constructor(message = 'Forbidden') {
    super({ code: ErrorCode.FORBIDDEN, message }, HttpStatus.FORBIDDEN);
  }
}

export class ConflictException_ extends OgpException {
  constructor(code: ErrorCode = ErrorCode.CONFLICT, message = 'Conflict') {
    super({ code, message }, HttpStatus.CONFLICT);
  }
}

export class InsufficientFundsException extends OgpException {
  constructor() {
    super(
      { code: ErrorCode.WALLET_INSUFFICIENT_FUNDS, message: 'Insufficient wallet balance' },
      HttpStatus.UNPROCESSABLE_ENTITY,
    );
  }
}

export class KycRequiredException extends OgpException {
  constructor() {
    super(
      { code: ErrorCode.USER_KYC_REQUIRED, message: 'KYC verification required' },
      HttpStatus.FORBIDDEN,
    );
  }
}

// Re-export NestJS originals so callers only need one import path
export {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  NotFoundException,
  UnauthorizedException,
};
