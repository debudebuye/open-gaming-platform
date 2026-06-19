# @ogp/auth

Reusable authentication and authorization primitives.

## Exports

- `JwtAuthGuard` — NestJS guard that validates JWT access tokens
- `RolesGuard` — Enforces RBAC role checks
- `KycGuard` — Blocks requests from users who haven't completed KYC
- `JwtService` — Sign and verify JWT tokens
- `@Public()` — Decorator to bypass JWT auth on public routes
- `@Roles(...roles)` — Decorator to declare required roles

## Token Strategy

- **Access token**: JWT, signed with RS256, 15-minute TTL
- **Refresh token**: Opaque random string, hashed and stored in Redis, 7-day sliding TTL

## Usage

```typescript
import { JwtAuthGuard, RolesGuard, Roles } from '@ogp/auth';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
@Get('/admin/stats')
getStats() {}
```
