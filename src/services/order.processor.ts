// order.processor.ts
import { Injectable, Logger } from '@nestjs/common';
import { RabbitSubscribe } from '@golevelup/nestjs-rabbitmq';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class OrderProcessor {
  private readonly logger = new Logger(OrderProcessor.name);

  constructor(private prisma: PrismaService) {}

  @RabbitSubscribe({
    exchange: 'orders_exchange',
    routingKey: 'order.created',
    queue: 'orders_queue',
  })
  public async handleOrder(message: { orderId: string }) {
    const { orderId } = message;
    this.logger.log(`Processing order ${orderId}`);

    const order = await this.prisma.order.findUnique({ where: { id: orderId }, include: { items: true } });

    if (!order) {
      this.logger.error(`Order ${orderId} not found`);
      return;
    }

    await this.prisma.order.update({ where: { id: orderId }, data: { status: 'completed' } });

    this.logger.log(`Order ${orderId} completed`);
  }
}
