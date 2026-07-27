import { RiskService } from './risk.service';

describe('RiskService', () => {
  let service: RiskService;
  let redis: any;

  beforeEach(() => {
    redis = {
      get: jest.fn().mockResolvedValue(null),
      incrbyfloat: jest.fn().mockResolvedValue('1'),
    };
    service = new RiskService(redis);
  });

  it('should allow valid order', async () => {
    const result = await service.checkOrder('user-1', 'BTCUSD', 1, 50000);
    expect(result.allowed).toBe(true);
  });

  it('should reject oversized order', async () => {
    const result = await service.checkOrder('user-1', 'BTCUSD', 200, 50000);
    expect(result.allowed).toBe(false);
    expect(result.reason).toContain('Order quantity exceeds max');
  });

  it('should reject when daily loss limit reached', async () => {
    redis.get.mockResolvedValue('60000');
    const result = await service.checkOrder('user-1', 'BTCUSD', 1, 50000);
    expect(result.allowed).toBe(false);
    expect(result.reason).toContain('Daily loss limit');
  });

  it('should update position', async () => {
    await service.updatePosition('user-1', 'BTCUSD', 0.5);
    expect(redis.incrbyfloat).toHaveBeenCalledWith('position:user-1:BTCUSD', 0.5);
  });
});
