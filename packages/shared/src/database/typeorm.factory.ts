import { DataSourceOptions } from 'typeorm';
import { BaseEnv } from '../config';

type AppDataSourceOverrides = {
  entities: DataSourceOptions['entities'];
  migrations?: DataSourceOptions['migrations'];
} & Omit<Partial<DataSourceOptions>, 'type'>;

/**
 * Builds TypeORM DataSourceOptions from validated env config.
 * Each app supplies its own entities and migrations arrays.
 *
 * Key behaviours:
 *  - synchronize is only ever true in development — safety guard prevents
 *    accidental schema wipe in production even if DB_SYNC=true is set
 *  - migrationsRun is true in production so migrations run automatically on deploy
 *  - uuidExtension: pgcrypto — matches the extension installed by init.sql
 *  - SSL enabled automatically in production
 *
 * Usage:
 *   TypeOrmModule.forRoot(
 *     buildTypeOrmOptions(config, {
 *       entities: [UserEntity],
 *       migrations: [__dirname + '/migrations/*{.ts,.js}'],
 *     })
 *   )
 */
export function buildTypeOrmOptions(
  env: Pick<
    BaseEnv,
    | 'DB_HOST'
    | 'DB_PORT'
    | 'DB_NAME'
    | 'DB_USER'
    | 'DB_PASSWORD'
    | 'DB_SCHEMA'
    | 'DB_SYNC'
    | 'DB_LOGGING'
    | 'NODE_ENV'
  >,
  overrides: AppDataSourceOverrides,
): DataSourceOptions {
  const isProduction = env.NODE_ENV === 'production';

  const base = {
    type: 'postgres' as const,

    // Connection
    host: env.DB_HOST,
    port: env.DB_PORT,
    database: env.DB_NAME,
    username: env.DB_USER,
    password: env.DB_PASSWORD ?? undefined,
    schema: env.DB_SCHEMA,

    // Schema management
    // Safety guard: synchronize is NEVER true in production regardless of env var
    synchronize: isProduction ? false : env.DB_SYNC,
    // Migrations run automatically on production startup
    migrationsRun: isProduction,

    // Logging — only SQL in dev; errors only in production
    logging: isProduction
      ? (['error', 'warn'] as const)
      : env.DB_LOGGING
      ? (['query', 'error', 'warn', 'schema'] as const)
      : (['error'] as const),

    // UUID generation via pgcrypto (matches init.sql extension)
    uuidExtension: 'pgcrypto' as const,

    // Connection pool
    extra: {
      max: isProduction ? 20 : 5,
      idleTimeoutMillis: 30_000,
      connectionTimeoutMillis: 5_000,
    },

    // SSL — required in production, disabled locally
    ssl: isProduction ? { rejectUnauthorized: false } : false,
  };

  return { ...base, ...overrides } as DataSourceOptions;
}
