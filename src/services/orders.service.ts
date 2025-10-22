import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { randomBytes } from 'crypto';
import { CreateOrderDto } from 'src/modules/order/dto/create-order.dto';
import { AmqpConnection } from '@golevelup/nestjs-rabbitmq';


@Injectable()
export class OrdersService {
  constructor(
    private prisma: PrismaService,
    private readonly amqpConnection: AmqpConnection,

  ) {}

  async placeOrder(userId: string, dto: CreateOrderDto) {
   
    const cart = await this.prisma.cart.findFirst({
      where: { userId },
      include: { items: true },
    });

    if (!cart || !cart.items || cart.items.length === 0) {
      throw new BadRequestException('Cart is empty');
    }

   
    const paymentType: string = dto.paymentType ?? dto.paymentMethod ?? 'cash_on_delivery';

 
    const orderNumber = 'ORD-' + randomBytes(4).toString('hex').toUpperCase();

   
    const order = await this.prisma.order.create({
      data: {
        orderNumber,
        userId,
        total: cart.total ?? 0,
        paymentType, 
        items: {
          create: cart.items.map((item) => ({
            variantId: item.variantId,
            quantity: item.quantity,
          })),
        },
      },
      include: { items: true },
    });

    // clear cart
    await this.prisma.cartItem.deleteMany({ where: { cartId: cart.id } });
    await this.prisma.cart.update({ where: { id: cart.id }, data: { total: 0 } });

    // Push order to RabbitMQ
    await this.amqpConnection.publish(
      'orders_exchange',
      'order.created', 
      { orderId: order.id }
    );

    return order;
  }


  async getOrders(userId: string) {
    return this.prisma.order.findMany({
      where: { userId },
      include: { items: { include: { variant: { include: { product: true } } } } },
    });
  }
}
