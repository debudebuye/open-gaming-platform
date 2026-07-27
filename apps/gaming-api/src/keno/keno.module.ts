import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { KenoGame, KenoTicket } from '@ogp/keno';
import { KenoService } from './keno.service';
import { KenoController } from './keno.controller';

@Module({
  imports: [TypeOrmModule.forFeature([KenoGame, KenoTicket])],
  controllers: [KenoController],
  providers: [KenoService],
  exports: [KenoService],
})
export class KenoModule {}
