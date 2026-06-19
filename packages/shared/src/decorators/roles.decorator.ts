import { SetMetadata } from '@nestjs/common';

export enum UserRole {
  PLAYER    = 'PLAYER',
  OPERATOR  = 'OPERATOR',
  ADMIN     = 'ADMIN',
  SUPER_ADMIN = 'SUPER_ADMIN',
}

export const ROLES_KEY = 'roles';

/**
 * Decorator — declares which roles can access a route.
 * Must be paired with RolesGuard (defined in packages/auth).
 *
 * Usage:
 *   @Roles(UserRole.ADMIN, UserRole.OPERATOR)
 *   @Get('/reports')
 *   getReports() { ... }
 */
export const Roles = (...roles: UserRole[]) => SetMetadata(ROLES_KEY, roles);
