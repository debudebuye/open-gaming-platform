import { Controller, Get, Post, Patch, Param, Body, Query, ParseUUIDPipe, UseGuards } from '@nestjs/common';
import { JwtAuthGuard, RolesGuard } from '@ogp/auth';
import { Roles, OffsetPaginationQueryDto } from '@ogp/shared';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @Roles('ADMIN', 'SUPER_ADMIN')
  async create(@Body() dto: CreateUserDto) {
    return this.usersService.create(dto);
  }

  @Get(':id')
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.usersService.findById(id);
  }

  @Get()
  async findAll(@Query() query: OffsetPaginationQueryDto) {
    return this.usersService.findAll(query);
  }

  @Patch(':id')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateUserDto,
  ) {
    return this.usersService.update(id, dto);
  }
}
