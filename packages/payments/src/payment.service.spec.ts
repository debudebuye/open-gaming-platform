import { PaymentService } from '../payment.service';

describe('PaymentService', () => {
  let service: PaymentService;

  const mockProvider = {
    providerName: 'mock',
    createPayment: jest.fn().mockResolvedValue({ externalId: 'ext-1', status: 'PENDING' }),
    verifyPayment: jest.fn().mockResolvedValue({ externalId: 'ext-1', status: 'COMPLETED', amount: 100, currency: 'USD' }),
    refund: jest.fn().mockResolvedValue({ externalId: 'ext-1', status: 'REFUNDED' }),
  };

  beforeEach(() => {
    service = new PaymentService();
    service.registerProvider(mockProvider);
  });

  it('should register and list providers', () => {
    expect(service.listProviders()).toContain('mock');
  });

  it('should create payment', async () => {
    const result = await service.createPayment('mock', { userId: 'u1', amount: 100, currency: 'USD', type: 'DEPOSIT' });
    expect(result.externalId).toBe('ext-1');
  });

  it('should verify payment', async () => {
    const result = await service.verifyPayment('mock', 'ext-1');
    expect(result.status).toBe('COMPLETED');
  });

  it('should throw for unknown provider', async () => {
    await expect(service.createPayment('unknown', { userId: 'u1', amount: 100, currency: 'USD', type: 'DEPOSIT' })).rejects.toThrow();
  });
});
