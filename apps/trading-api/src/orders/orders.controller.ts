import { Controller, Get, Post, Delete, Param, Body, ParseUUIDPipe, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '@ogp/auth';
import { CurrentUser, RequestUser } from '@ogp/shared';
import { OrdersService } from './orders.service';
import { PlaceOrderDto } from '@ogp/trading';

@Controller('orders')
@UseGuards(JwtAuthGuard)
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  async placeOrder(@CurrentUser() user: RequestUser, @Body() dto: PlaceOrderDto) {
    return this.ordersService.placeOrder(user.sub, dto);
  }

  @Get()
  async getMyOrders(@CurrentUser() user: RequestUser) {
    return this.ordersService.getUserOrders(user.sub);
  }

  @Get(':id')
  async getOrder(@Param('id', ParseUUIDPipe) id: string) {
    return this.ordersService.getOrder(id);
  }

  @Delete(':id')
  async cancelOrder(@CurrentUser() user: RequestUser, @Param('id', ParseUUIDPipe) id: string) {
    return this.ordersService.cancelOrder(id, user.sub);
  }
}
