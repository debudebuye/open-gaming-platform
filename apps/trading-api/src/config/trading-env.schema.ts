import { z } from 'zod';
import { BaseEnvSchema } from '@ogp/shared';

export const TradingEnvSchema = BaseEnvSchema.extend({
  JWT_SECRET: z.string().min(16),
});

export type TradingEnv = z.infer<typeof TradingEnvSchema>;
