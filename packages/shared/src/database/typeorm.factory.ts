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
  const base = {
    type: 'postgres' as const,
    host: env.DB_HOST,
    port: env.DB_PORT,
    database: env.DB_NAME,
    username: env.DB_USER,
    password: env.DB_PASSWORD ?? undefined,
    schema: env.DB_SCHEMA,
    synchronize: env.DB_SYNC,
    logging: env.DB_LOGGING,
    migrationsRun: env.NODE_ENV === 'production',
    ssl: env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  };

  return { ...base, ...overrides } as DataSourceOptions;
}
