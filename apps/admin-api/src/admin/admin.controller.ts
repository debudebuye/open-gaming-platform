import { Controller, Get, Post, Param, Body, Query, ParseUUIDPipe, UseGuards } from '@nestjs/common';
import { JwtAuthGuard, RolesGuard } from '@ogp/auth';
import { Roles, UserRole } from '@ogp/shared';
import { AdminService } from './admin.service';

@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('dashboard')
  async getDashboard() {
    return this.adminService.getDashboard();
  }

  @Get('users')
  async getUsers(@Query() query: { page?: number; limit?: number }) {
    return this.adminService.getUsers(query);
  }

  @Get('users/:id')
  async getUserDetail(@Param('id', ParseUUIDPipe) id: string) {
    return this.adminService.getUserDetail(id);
  }

  @Post('users/:id/status')
  async updateUserStatus(@Param('id', ParseUUIDPipe) id: string, @Body() body: { status: string }) {
    return this.adminService.updateUserStatus(id, body.status);
  }
}
