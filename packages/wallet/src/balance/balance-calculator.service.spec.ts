import { Test, TestingModule } from '@nestjs/testing';
import { BalanceCalculator } from './balance-calculator.service';
import { LedgerService } from '../ledger/ledger.service';
import { HoldService } from '../holds/hold.service';

describe('BalanceCalculator', () => {
  let service: BalanceCalculator;

  const mockLedgerService = { getBalance: jest.fn() };
  const mockHoldService = { getActiveHoldsTotal: jest.fn() };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BalanceCalculator,
        { provide: LedgerService, useValue: mockLedgerService },
        { provide: HoldService, useValue: mockHoldService },
      ],
    }).compile();

    service = module.get(BalanceCalculator);
    jest.clearAllMocks();
  });

  it('should calculate available balance', async () => {
    mockLedgerService.getBalance.mockResolvedValue(1000);
    mockHoldService.getActiveHoldsTotal.mockResolvedValue(250);

    const result = await service.getAvailableBalance('wallet-1');
    expect(result).toBe(750);
  });

  it('should return total balance', async () => {
    mockLedgerService.getBalance.mockResolvedValue(500);
    const result = await service.getTotalBalance('wallet-1');
    expect(result).toBe(500);
  });

  it('should return held amount', async () => {
    mockHoldService.getActiveHoldsTotal.mockResolvedValue(150);
    const result = await service.getHeldAmount('wallet-1');
    expect(result).toBe(150);
  });
});
