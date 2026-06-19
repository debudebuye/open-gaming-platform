import { ZodSchema } from 'zod';

/**
 * Validates process.env against a Zod schema and returns typed config.
 * Throws a clear error listing every invalid / missing variable.
 *
 * Usage (in NestJS ConfigModule.forRoot):
 *   validate: () => loadConfig(MyEnvSchema)
 */
export function loadConfig<T>(schema: ZodSchema<T>, env = process.env): T {
  const result = schema.safeParse(env);

  if (!result.success) {
    const issues = result.error.issues
      .map((i) => `  [${i.path.join('.')}] ${i.message}`)
      .join('\n');

    throw new Error(`Environment validation failed:\n${issues}`);
  }

  return result.data;
}
