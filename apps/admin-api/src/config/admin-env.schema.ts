import { z } from 'zod';
import { BaseEnvSchema } from '@ogp/shared';

export const AdminEnvSchema = BaseEnvSchema.extend({
  JWT_SECRET: z.string().min(16),
});

export type AdminEnv = z.infer<typeof AdminEnvSchema>;
