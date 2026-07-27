import { Controller, Get, Post, Param, Body, ParseUUIDPipe, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '@ogp/auth';
import { Public } from '@ogp/shared';
import { CurrentUser, RequestUser } from '@ogp/shared';
import { BettingService } from './betting.service';

@Controller('betting')
@UseGuards(JwtAuthGuard)
export class BettingController {
  constructor(private readonly bettingService: BettingService) {}

  @Public()
  @Get('markets')
  async getMarkets(@Param('sport') sport?: string) {
    return this.bettingService.getMarkets(sport);
  }

  @Public()
  @Get('markets/:id')
  async getMarket(@Param('id', ParseUUIDPipe) id: string) {
    return this.bettingService.getMarket(id);
  }

  @Public()
  @Get('markets/:id/selections')
  async getSelections(@Param('id', ParseUUIDPipe) id: string) {
    return this.bettingService.getSelections(id);
  }

  @Post('slips')
  async placeBet(
    @CurrentUser() user: RequestUser,
    @Body() body: { selectionIds: string[]; stake: number },
  ) {
    return this.bettingService.placeBet(user.sub, body.selectionIds, body.stake);
  }

  @Get('slips/:id')
  async getSlip(@Param('id', ParseUUIDPipe) id: string) {
    return this.bettingService.getBetSlip(id);
  }

  @Get('slips')
  async getUserSlips(@CurrentUser() user: RequestUser) {
    return this.bettingService.getUserSlips(user.sub);
  }
}
