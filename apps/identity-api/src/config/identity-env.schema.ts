import { z } from 'zod';
import { BaseEnvSchema } from '@ogp/shared';

export const IdentityEnvSchema = BaseEnvSchema.extend({
  JWT_SECRET: z.string().min(16),
  JWT_REFRESH_SECRET: z.string().min(16),
  BCRYPT_SALT_ROUNDS: z.coerce.number().int().min(4).max(20).default(12),
});

export type IdentityEnv = z.infer<typeof IdentityEnvSchema>;
