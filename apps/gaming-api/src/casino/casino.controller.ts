import { Controller, Get, Post, Param, Body, ParseUUIDPipe, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '@ogp/auth';
import { Public, CurrentUser, RequestUser } from '@ogp/shared';
import { CasinoService } from './casino.service';

@Controller('casino')
@UseGuards(JwtAuthGuard)
export class CasinoController {
  constructor(private readonly casinoService: CasinoService) {}

  @Public()
  @Get('games')
  listGames() {
    return this.casinoService.listGames();
  }

  @Post('games/:gameId/rounds')
  async initRound(
    @Param('gameId') gameId: string,
    @CurrentUser() user: RequestUser,
    @Body() body: { stake: number; clientSeed?: string },
  ) {
    return this.casinoService.initRound(gameId, {
      userId: user.sub,
      stake: body.stake,
      clientSeed: body.clientSeed,
    });
  }

  @Post('games/:gameId/rounds/:roundId/resolve')
  async resolveRound(
    @Param('gameId') gameId: string,
    @Param('roundId') roundId: string,
    @Body() body: { serverSeed?: string; clientSeed?: string; nonce?: number },
  ) {
    return this.casinoService.resolveRound(gameId, {
      roundId,
      ...body,
    });
  }
}
