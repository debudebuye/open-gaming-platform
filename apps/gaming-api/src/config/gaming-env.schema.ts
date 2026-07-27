import { z } from 'zod';
import { BaseEnvSchema } from '@ogp/shared';

export const GamingEnvSchema = BaseEnvSchema.extend({
  JWT_SECRET: z.string().min(16),
});

export type GamingEnv = z.infer<typeof GamingEnvSchema>;
