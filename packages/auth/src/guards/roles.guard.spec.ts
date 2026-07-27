import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { RolesGuard } from './roles.guard';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '@ogp/shared';

describe('RolesGuard', () => {
  let guard: RolesGuard;
  let reflector: Reflector;

  beforeEach(() => {
    reflector = new Reflector();
    guard = new RolesGuard(reflector);
  });

  const mockContext = (user?: { roles: string[] }): ExecutionContext => ({
    switchToHttp: () => ({
      getRequest: () => ({ user }),
    }),
    getHandler: () => jest.fn(),
    getClass: () => jest.fn(),
  }) as unknown as ExecutionContext;

  it('should allow when no roles required', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(undefined);
    expect(guard.canActivate(mockContext({ roles: [] }))).toBe(true);
  });

  it('should allow when user has required role', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(['ADMIN']);
    expect(guard.canActivate(mockContext({ roles: ['ADMIN', 'PLAYER'] }))).toBe(true);
  });

  it('should deny when user lacks required role', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(['ADMIN']);
    expect(() => guard.canActivate(mockContext({ roles: ['PLAYER'] }))).toThrow(ForbiddenException);
  });

  it('should deny when no user context', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(['ADMIN']);
    expect(() => guard.canActivate(mockContext(undefined))).toThrow(ForbiddenException);
  });
});
