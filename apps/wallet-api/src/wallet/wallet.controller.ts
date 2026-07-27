import { Controller, Get, Post, Param, Body, ParseUUIDPipe, UseGuards } from '@nestjs/common';
import { JwtAuthGuard, RolesGuard } from '@ogp/auth';
import { Roles } from '@ogp/shared';
import { WalletService } from './wallet.service';
import { CreateWalletDto } from './dto/create-wallet.dto';

@Controller('wallets')
@UseGuards(JwtAuthGuard, RolesGuard)
export class WalletController {
  constructor(private readonly walletService: WalletService) {}

  @Post()
  @Roles('ADMIN', 'SUPER_ADMIN')
  async create(@Body() dto: CreateWalletDto) {
    return this.walletService.create(dto);
  }

  @Get('user/:userId')
  async findByUser(@Param('userId', ParseUUIDPipe) userId: string) {
    return this.walletService.findByUser(userId);
  }

  @Get(':id')
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.walletService.findById(id);
  }

  @Get(':id/balance')
  async getBalance(@Param('id', ParseUUIDPipe) id: string) {
    return this.walletService.getBalance(id);
  }
}
