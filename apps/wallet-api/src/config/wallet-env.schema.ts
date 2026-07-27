import { z } from 'zod';
import { BaseEnvSchema } from '@ogp/shared';

export const WalletEnvSchema = BaseEnvSchema.extend({
  JWT_SECRET: z.string().min(16),
});

export type WalletEnv = z.infer<typeof WalletEnvSchema>;
