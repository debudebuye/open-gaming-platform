import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Market, Selection, BetSlip, BetLine, BetStatus, BetType, MarketStatus, SelectionStatus } from '@ogp/betting';
import { validateSlip, calculatePayout } from '@ogp/betting';
import { ErrorCode, ResourceNotFoundException, ConflictException_ } from '@ogp/shared';

@Injectable()
export class BettingService {
  constructor(
    @InjectRepository(Market) private readonly marketRepo: Repository<Market>,
    @InjectRepository(Selection) private readonly selectionRepo: Repository<Selection>,
    @InjectRepository(BetSlip) private readonly slipRepo: Repository<BetSlip>,
    @InjectRepository(BetLine) private readonly lineRepo: Repository<BetLine>,
  ) {}

  async getMarkets(sport?: string): Promise<Market[]> {
    const where = sport ? { sport } : {};
    return this.marketRepo.find({ where, order: { startsAt: 'ASC' } });
  }

  async getMarket(id: string): Promise<Market> {
    const market = await this.marketRepo.findOne({ where: { id }, relations: ['selections'] });
    if (!market) throw new ResourceNotFoundException(ErrorCode.NOT_FOUND, 'Market not found');
    return market;
  }

  async getSelections(marketId: string): Promise<Selection[]> {
    return this.selectionRepo.find({ where: { marketId }, order: { odds: 'ASC' } });
  }

  async placeBet(userId: string, selectionIds: string[], stake: number): Promise<BetSlip> {
    const selections = await this.selectionRepo.findByIds(selectionIds);
    if (selections.length !== selectionIds.length) {
      throw new ResourceNotFoundException(ErrorCode.NOT_FOUND, 'One or more selections not found');
    }

    for (const sel of selections) {
      if (sel.status !== SelectionStatus.OPEN) {
        throw new ConflictException_(ErrorCode.BET_SELECTION_SUSPENDED, `Selection "${sel.name}" is ${sel.status}`);
      }
    }

    const lines = selections.map((s) => ({ selectionId: s.id, odds: Number(s.odds) }));
    validateSlip({ lines, stake });

    const betType = lines.length === 1 ? BetType.SINGLE : BetType.ACCUMULATOR;
    const potentialPayout = calculatePayout(stake, lines);

    const slip = this.slipRepo.create({
      userId,
      type: betType,
      totalStake: stake,
      potentialPayout,
      status: BetStatus.PENDING,
    });
    const savedSlip = await this.slipRepo.save(slip);

    const betLines = lines.map((l) =>
      this.lineRepo.create({
        slipId: savedSlip.id,
        selectionId: l.selectionId,
        oddsAtPlacement: l.odds,
      }),
    );
    await this.lineRepo.save(betLines);

    savedSlip.lines = betLines;
    return savedSlip;
  }

  async getBetSlip(id: string): Promise<BetSlip> {
    const slip = await this.slipRepo.findOne({ where: { id }, relations: ['lines'] });
    if (!slip) throw new ResourceNotFoundException(ErrorCode.NOT_FOUND, 'Bet slip not found');
    return slip;
  }

  async getUserSlips(userId: string): Promise<BetSlip[]> {
    return this.slipRepo.find({ where: { userId }, order: { createdAt: 'DESC' }, relations: ['lines'] });
  }
}
