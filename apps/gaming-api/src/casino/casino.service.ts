import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { ICasinoGame, RoundInitResult, RoundResolveResult } from '@ogp/casino';
import { ErrorCode, ResourceNotFoundException } from '@ogp/shared';

@Injectable()
export class CasinoService {
  private readonly logger = new Logger(CasinoService.name);
  private readonly plugins = new Map<string, ICasinoGame>();

  registerPlugin(game: ICasinoGame): void {
    this.plugins.set(game.gameId, game);
    this.logger.log(`Registered casino game: ${game.gameName} (${game.gameId})`);
  }

  getGame(gameId: string): ICasinoGame {
    const game = this.plugins.get(gameId);
    if (!game) {
      throw new ResourceNotFoundException(ErrorCode.NOT_FOUND, `Game "${gameId}" not found`);
    }
    return game;
  }

  listGames(): { gameId: string; gameName: string; gameType: string; rtp: number }[] {
    return Array.from(this.plugins.values()).map((g) => ({
      gameId: g.gameId,
      gameName: g.gameName,
      gameType: g.gameType,
      rtp: g.getRTPConfig().rtp,
    }));
  }

  async initRound(gameId: string, params: { userId: string; stake: number; clientSeed?: string }): Promise<RoundInitResult> {
    const game = this.getGame(gameId);
    const validation = game.validateBet({ userId: params.userId, stake: params.stake });
    if (!validation.valid) {
      throw new ResourceNotFoundException(ErrorCode.VALIDATION_ERROR, validation.error ?? 'Invalid bet');
    }
    return game.initRound(params);
  }

  async resolveRound(gameId: string, params: { roundId: string; serverSeed?: string; clientSeed?: string; nonce?: number }): Promise<RoundResolveResult> {
    const game = this.getGame(gameId);
    return game.resolveRound(params);
  }
}
