import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Position } from '../entities/position.entity';

@Injectable()
export class PositionService {
  constructor(
    @InjectRepository(Position) private readonly positionRepo: Repository<Position>,
  ) {}

  async upsert(userId: string, instrumentId: string, quantityDelta: number, tradePrice: number): Promise<Position> {
    let position = await this.positionRepo.findOne({ where: { userId, instrumentId } });

    if (!position) {
      position = this.positionRepo.create({
        userId,
        instrumentId,
        quantity: quantityDelta,
        avgEntryPrice: tradePrice,
        unrealizedPnl: 0,
      });
    } else {
      const newQty = Number(position.quantity) + quantityDelta;
      if (newQty === 0) {
        position.avgEntryPrice = 0;
      } else if (quantityDelta > 0) {
        const totalCost = Number(position.avgEntryPrice) * Number(position.quantity) + tradePrice * quantityDelta;
        position.avgEntryPrice = totalCost / newQty;
      }
      position.quantity = newQty;
      position.unrealizedPnl = newQty * (tradePrice - Number(position.avgEntryPrice));
    }

    return this.positionRepo.save(position);
  }

  async findByUser(userId: string): Promise<Position[]> {
    return this.positionRepo.find({ where: { userId } });
  }

  async findByUserAndInstrument(userId: string, instrumentId: string): Promise<Position | null> {
    return this.positionRepo.findOne({ where: { userId, instrumentId } });
  }
}
