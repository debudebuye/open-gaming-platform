import Redis from 'ioredis';

export interface RiskCheckResult {
  allowed: boolean;
  reason?: string;
}

export interface RiskLimits {
  maxPositionPerInstrument: number;
  maxDailyLoss: number;
  maxOrderQuantity: number;
}

const DEFAULT_LIMITS: RiskLimits = {
  maxPositionPerInstrument: 1000,
  maxDailyLoss: 50000,
  maxOrderQuantity: 100,
};

export class RiskService {
  constructor(
    private readonly redis: Redis,
    private readonly limits: RiskLimits = DEFAULT_LIMITS,
  ) {}

  async checkOrder(userId: string, instrumentId: string, quantity: number, price: number): Promise<RiskCheckResult> {
    if (quantity > this.limits.maxOrderQuantity) {
      return { allowed: false, reason: `Order quantity exceeds max of ${this.limits.maxOrderQuantity}` };
    }

    const positionKey = `position:${userId}:${instrumentId}`;
    const currentPos = await this.redis.get(positionKey);
    const posQty = currentPos ? parseFloat(currentPos) : 0;
    if (Math.abs(posQty) + quantity > this.limits.maxPositionPerInstrument) {
      return { allowed: false, reason: 'Position limit exceeded' };
    }

    const dailyLossKey = `dailyloss:${userId}:${new Date().toISOString().slice(0, 10)}`;
    const dailyLoss = await this.redis.get(dailyLossKey);
    if (dailyLoss && parseFloat(dailyLoss) >= this.limits.maxDailyLoss) {
      return { allowed: false, reason: 'Daily loss limit reached' };
    }

    return { allowed: true };
  }

  async updatePosition(userId: string, instrumentId: string, deltaQty: number): Promise<void> {
    const key = `position:${userId}:${instrumentId}`;
    await this.redis.incrbyfloat(key, deltaQty);
  }
}
