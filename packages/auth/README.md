# @ogp/auth

Reusable authentication and authorization primitives.

## Exports

- `JwtAuthModule` — Dynamic NestJS module for RS256 JWT signing/verification
- `JwtService` — Sign and verify JWT access tokens
- `JwtStrategy` — Passport strategy for JWT Bearer auth
- `JwtAuthGuard` — NestJS guard that validates JWT access tokens, respects `@Public()`
- `RolesGuard` — Enforces RBAC role checks via `@Roles()` metadata
- `KycGuard` — Blocks requests from users who haven't completed KYC
- `PasswordService` — Bcrypt hash and compare
- `RefreshTokenService` — Opaque refresh token CRUD in Redis

## Token Strategy

- **Access token**: JWT, signed with RS256, 15-minute TTL
- **Refresh token**: Opaque random string, hashed and stored in Redis, 7-day sliding TTL

## Usage

```typescript
import { JwtAuthGuard, RolesGuard, JwtAuthModule } from '@ogp/auth';

@Module({
  imports: [JwtAuthModule.forRoot({ publicKey, privateKey, accessTtl: '15m', refreshTtlDays: 7 })],
})
export class AuthModule {}

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
@Get('/admin/stats')
getStats() {}
```
