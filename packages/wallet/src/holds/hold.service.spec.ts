import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { HoldService } from './hold.service';
import { Hold } from '../entities/hold.entity';
import { HoldStatus } from '../enums';
import { LedgerService } from '../ledger/ledger.service';

describe('HoldService', () => {
  let service: HoldService;

  const mockHoldRepo = {
    find: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    createQueryBuilder: jest.fn(),
  };

  const mockLedgerService = {
    getBalance: jest.fn().mockResolvedValue(1000),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        HoldService,
        { provide: getRepositoryToken(Hold), useValue: mockHoldRepo },
        { provide: LedgerService, useValue: mockLedgerService },
      ],
    }).compile();

    service = module.get(HoldService);
    jest.clearAllMocks();
  });

  it('should create a hold when sufficient balance', async () => {
    mockHoldRepo.createQueryBuilder!.mockReturnValue({
      select: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      getRawOne: jest.fn().mockResolvedValue({ total: '0' }),
    } as any);
    mockHoldRepo.save!.mockImplementation(async (h) => ({ id: 'hold-1', ...h }));

    const result = await service.create('wallet-1', 100, 'bet-1', 'BET');
    expect(result.id).toBe('hold-1');
    expect(result.status).toBe(HoldStatus.ACTIVE);
  });

  it('should settle a hold', async () => {
    mockHoldRepo.findOne!.mockResolvedValue({ id: 'hold-1', status: HoldStatus.ACTIVE, walletId: 'w1' });
    mockHoldRepo.save!.mockImplementation(async (h) => h);

    const result = await service.settle('hold-1', 'WIN');
    expect(result.status).toBe(HoldStatus.SETTLED);
  });

  it('should release a hold on cancel', async () => {
    mockHoldRepo.findOne!.mockResolvedValue({ id: 'hold-1', status: HoldStatus.ACTIVE, walletId: 'w1' });
    mockHoldRepo.save!.mockImplementation(async (h) => h);

    const result = await service.settle('hold-1', 'CANCEL');
    expect(result.status).toBe(HoldStatus.RELEASED);
  });

  it('should get active holds total', async () => {
    mockHoldRepo.createQueryBuilder!.mockReturnValue({
      select: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      getRawOne: jest.fn().mockResolvedValue({ total: '250' }),
    } as any);

    const total = await service.getActiveHoldsTotal('wallet-1');
    expect(total).toBe(250);
  });
});
