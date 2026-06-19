# @ogp/shared

Cross-cutting utilities used by all apps and packages.

## Exports

- `config/` — Env validation with Zod, typed config loader
- `database/` — TypeORM base entity (`BaseEntity` with `id`, `createdAt`, `updatedAt`), migration helpers
- `redis/` — Redis client factory, `CacheService`, `RedlockService` (distributed locks)
- `logger/` — Structured Pino logger with correlation ID support
- `errors/` — `BaseException`, domain error codes, HTTP error factories
- `pagination/` — Cursor and offset pagination DTOs
- `events/` — `BaseEvent` abstract class, `IEventBus` interface
- `decorators/` — `@CurrentUser()`, `@Roles()`, `@KycRequired()`

## Usage

```typescript
import { BaseEvent, CacheService, BaseException } from '@ogp/shared';
```
