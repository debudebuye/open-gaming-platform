import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Wallet } from '@ogp/wallet';
import { ErrorCode, ResourceNotFoundException } from '@ogp/shared';
import { BalanceCalculator } from '@ogp/wallet';
import { CreateWalletDto } from './dto/create-wallet.dto';

@Injectable()
export class WalletService {
  constructor(
    @InjectRepository(Wallet) private readonly walletRepo: Repository<Wallet>,
    private readonly balanceCalculator: BalanceCalculator,
  ) {}

  async create(dto: CreateWalletDto): Promise<Wallet> {
    const existing = await this.walletRepo.findOne({ where: { userId: dto.userId, currency: dto.currency } });
    if (existing) return existing;

    const wallet = this.walletRepo.create({
      userId: dto.userId,
      currency: dto.currency,
      isDefault: dto.isDefault ?? false,
    });
    return this.walletRepo.save(wallet);
  }

  async findByUser(userId: string): Promise<Wallet[]> {
    return this.walletRepo.find({ where: { userId } });
  }

  async findById(id: string): Promise<Wallet> {
    const wallet = await this.walletRepo.findOne({ where: { id } });
    if (!wallet) {
      throw new ResourceNotFoundException(ErrorCode.WALLET_NOT_FOUND, 'Wallet not found');
    }
    return wallet;
  }

  async getBalance(walletId: string) {
    const wallet = await this.findById(walletId);
    const [total, available, held] = await Promise.all([
      this.balanceCalculator.getTotalBalance(walletId),
      this.balanceCalculator.getAvailableBalance(walletId),
      this.balanceCalculator.getHeldAmount(walletId),
    ]);

    return {
      walletId: wallet.id,
      currency: wallet.currency,
      total,
      available,
      held,
    };
  }

  async findByUserAndCurrency(userId: string, currency: string): Promise<Wallet | null> {
    return this.walletRepo.findOne({ where: { userId, currency } });
  }
}
