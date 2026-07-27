import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { KenoGame, KenoTicket } from '@ogp/keno';
import { drawNumbers, countMatches, calculatePayout, DEFAULT_PAYOUT_TABLE } from '@ogp/keno';
import { ErrorCode, ConflictException_ } from '@ogp/shared';

@Injectable()
export class KenoService {
  constructor(
    @InjectRepository(KenoGame) private readonly gameRepo: Repository<KenoGame>,
    @InjectRepository(KenoTicket) private readonly ticketRepo: Repository<KenoTicket>,
  ) {}

  async createGame(): Promise<KenoGame> {
    const lastGame = await this.gameRepo.findOne({ order: { drawNumber: 'DESC' } });
    const game = this.gameRepo.create({
      drawNumber: (lastGame?.drawNumber ?? 0) + 1,
      status: 'OPEN',
    });
    return this.gameRepo.save(game);
  }

  async getCurrentGame(): Promise<KenoGame | null> {
    return this.gameRepo.findOne({ where: { status: 'OPEN' }, order: { drawNumber: 'DESC' } });
  }

  async buyTicket(userId: string, gameId: string, selectedNumbers: number[], stake: number): Promise<KenoTicket> {
    if (selectedNumbers.length < 1 || selectedNumbers.length > 10) {
      throw new ConflictException_(ErrorCode.KENO_TICKET_INVALID_NUMBERS, 'Select between 1 and 10 numbers');
    }

    for (const num of selectedNumbers) {
      if (num < 1 || num > 80) {
        throw new ConflictException_(ErrorCode.KENO_TICKET_INVALID_NUMBERS, 'Numbers must be between 1 and 80');
      }
    }

    const unique = new Set(selectedNumbers);
    if (unique.size !== selectedNumbers.length) {
      throw new ConflictException_(ErrorCode.KENO_TICKET_INVALID_NUMBERS, 'Duplicate numbers not allowed');
    }

    const game = await this.gameRepo.findOne({ where: { id: gameId } });
    if (!game || game.status !== 'OPEN') {
      throw new ConflictException_(ErrorCode.KENO_GAME_NOT_OPEN, 'Game is not open for tickets');
    }

    const ticket = this.ticketRepo.create({
      userId,
      gameId,
      selectedNumbers: selectedNumbers.sort((a, b) => a - b),
      stake,
      status: 'PENDING',
    });
    return this.ticketRepo.save(ticket);
  }

  async drawGame(gameId: string): Promise<KenoGame> {
    const game = await this.gameRepo.findOne({ where: { id: gameId } });
    if (!game) throw new ConflictException_(ErrorCode.NOT_FOUND, 'Game not found');

    game.status = 'DRAWING';
    await this.gameRepo.save(game);

    game.drawnNumbers = drawNumbers(20, 80);
    game.status = 'DRAWN';
    game.drawnAt = new Date();
    await this.gameRepo.save(game);

    await this.settleTickets(game);
    return game;
  }

  private async settleTickets(game: KenoGame): Promise<void> {
    const tickets = await this.ticketRepo.find({ where: { gameId: game.id, status: 'PENDING' } });

    for (const ticket of tickets) {
      const matches = countMatches(ticket.selectedNumbers, game.drawnNumbers!);
      ticket.matchesCount = matches;
      ticket.payout = calculatePayout(Number(ticket.stake), ticket.selectedNumbers.length, matches);
      ticket.status = ticket.payout > 0 ? 'WON' : 'LOST';
      await this.ticketRepo.save(ticket);
    }
  }

  async getUserTickets(userId: string, gameId?: string): Promise<KenoTicket[]> {
    const where: Record<string, unknown> = { userId };
    if (gameId) where.gameId = gameId;
    return this.ticketRepo.find({ where, order: { createdAt: 'DESC' } });
  }
}
