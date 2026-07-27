import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { LedgerService } from './ledger.service';
import { LedgerEntry } from '../entities/ledger-entry.entity';
import { LedgerEntryType } from '../enums';

describe('LedgerService', () => {
  let service: LedgerService;
  let repo: jest.Mocked<Repository<LedgerEntry>>;

  beforeEach(async () => {
    const mockRepo = {
      find: jest.fn(),
      findAndCount: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
      findOne: jest.fn(),
      createQueryBuilder: jest.fn(),
    };

    const mockDataSource = {
      transaction: jest.fn((fn: Function) => fn({
        findOne: jest.fn().mockResolvedValue(null),
        create: jest.fn().mockImplementation((_, data) => data),
        save: jest.fn().mockImplementation((data) => Promise.resolve({ id: '1', ...data })),
        createQueryBuilder: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnThis(),
          setParameters: jest.fn().mockReturnThis(),
          where: jest.fn().mockReturnThis(),
          getRawOne: jest.fn().mockResolvedValue({ balance: '100' }),
        }),
      })),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LedgerService,
        { provide: getRepositoryToken(LedgerEntry), useValue: mockRepo },
        { provide: DataSource, useValue: mockDataSource },
      ],
    }).compile();

    service = module.get(LedgerService);
    repo = module.get(getRepositoryToken(LedgerEntry));
  });

  it('should return balance for a wallet', async () => {
    const mockQb = {
      select: jest.fn().mockReturnThis(),
      setParameters: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      getRawOne: jest.fn().mockResolvedValue({ balance: '250.50' }),
    };
    repo.createQueryBuilder!.mockReturnValue(mockQb as any);

    const balance = await service.getBalance('wallet-1');
    expect(balance).toBe(250.5);
  });

  it('should credit a wallet', async () => {
    const result = await service.credit('wallet-1', 100, 'ref-1', 'deposit', 'Test deposit');
    expect(result.amount).toBe(100);
    expect(result.referenceId).toBe('ref-1');
  });

  it('should debit a wallet when sufficient funds', async () => {
    const result = await service.debit('wallet-1', 50, 'ref-2', 'bet', LedgerEntryType.BET_DEBIT, 'Bet placed');
    expect(result.amount).toBe(50);
  });
});
