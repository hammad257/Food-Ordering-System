// src/controllers/orders.controller.ts
import { Body, Controller, Get, Post, Req, UseGuards, BadRequestException } from '@nestjs/common';
import { CreateOrderDto } from 'src/modules/order/dto/create-order.dto';
import { OrdersService } from 'src/services/orders.service';
import { JwtAuthGuard } from 'src/common/jwt.guard';
import { Throttle } from '@nestjs/throttler';

@Controller('orders')
@UseGuards(JwtAuthGuard)
export class OrdersController {
  constructor(private ordersService: OrdersService) {}

  @Throttle({ limit: 5, ttl: 60 }as any)
  @Post()
  async place(@Req() req, @Body() dto: CreateOrderDto) {
    
    const userId = req.user?.userId ?? req.user?.sub ?? req.user?.id;
    if (!userId) {
      throw new BadRequestException('Authenticated user id not found on request (req.user)');
    }

    return this.ordersService.placeOrder(userId, dto);
  }

  @Throttle({ limit: 5, ttl: 60 }as any)
  @Get()
  async list(@Req() req) {
    const userId = req.user?.userId ?? req.user?.sub ?? req.user?.id;
    if (!userId) return [];
    return this.ordersService.getOrders(userId);
  }
}
