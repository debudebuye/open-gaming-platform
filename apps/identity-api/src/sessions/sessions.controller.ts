import { Controller, Get, Delete, Param, Query, ParseUUIDPipe, UseGuards } from '@nestjs/common';
import { JwtAuthGuard, RolesGuard } from '@ogp/auth';
import { Roles, UserRole, OffsetPaginationQueryDto } from '@ogp/shared';
import { SessionsService } from './sessions.service';

@Controller('sessions')
@UseGuards(JwtAuthGuard, RolesGuard)
export class SessionsController {
  constructor(private readonly sessionsService: SessionsService) {}

  @Get()
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  async findAll(@Query() query: OffsetPaginationQueryDto) {
    return this.sessionsService.findAll(query);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  async revoke(@Param('id', ParseUUIDPipe) id: string) {
    await this.sessionsService.revoke(id);
    return { success: true };
  }
}
