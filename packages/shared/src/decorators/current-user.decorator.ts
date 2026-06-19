import { createParamDecorator, ExecutionContext } from '@nestjs/common';

/** Shape of the JWT payload attached to req.user by JwtAuthGuard */
export interface RequestUser {
  sub: string;       // userId
  email: string;
  roles: string[];
  kycStatus: 'pending' | 'approved' | 'rejected';
}

/**
 * Parameter decorator — extracts the authenticated user from the request.
 *
 * Usage:
 *   @Get('/profile')
 *   getProfile(@CurrentUser() user: RequestUser) { ... }
 */
export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): RequestUser => {
    const request = ctx.switchToHttp().getRequest<{ user: RequestUser }>();
    return request.user;
  },
);
