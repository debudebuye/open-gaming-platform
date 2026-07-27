import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { ErrorCode } from '@ogp/shared';
import type { RequestUser } from '@ogp/shared';

@Injectable()
export class KycGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<{ user: RequestUser }>();
    const user = request.user;

    if (!user) {
      throw new ForbiddenException({ code: ErrorCode.FORBIDDEN, message: 'No user context' });
    }

    if (user.kycStatus !== 'approved') {
      throw new ForbiddenException({
        code: ErrorCode.USER_KYC_REQUIRED,
        message: 'KYC verification required',
      });
    }

    return true;
  }
}
