import { Controller, Get, Post, Param, Body, ParseUUIDPipe, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '@ogp/auth';
import { Public, CurrentUser, RequestUser } from '@ogp/shared';
import { KenoService } from './keno.service';

@Controller('keno')
@UseGuards(JwtAuthGuard)
export class KenoController {
  constructor(private readonly kenoService: KenoService) {}

  @Public()
  @Get('current')
  async getCurrentGame() {
    return this.kenoService.getCurrentGame();
  }

  @Post('tickets')
  async buyTicket(
    @CurrentUser() user: RequestUser,
    @Body() body: { gameId: string; selectedNumbers: number[]; stake: number },
  ) {
    return this.kenoService.buyTicket(user.sub, body.gameId, body.selectedNumbers, body.stake);
  }

  @Get('tickets')
  async getMyTickets(@CurrentUser() user: RequestUser) {
    return this.kenoService.getUserTickets(user.sub);
  }

  @Post('draw/:gameId')
  async drawGame(@Param('gameId', ParseUUIDPipe) gameId: string) {
    return this.kenoService.drawGame(gameId);
  }
}
