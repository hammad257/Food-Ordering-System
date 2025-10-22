import { Module } from '@nestjs/common';
import { OrdersService } from 'src/services/orders.service';
import { OrdersController } from 'src/controllers/orders.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { CartModule } from '../cart/cart.module';
import { RabbitMqModule } from '../messagingQueue/rabbitmq.module';
// import { CartModule } from 'src/cart/cart.module';

@Module({
  imports: [PrismaModule, CartModule, RabbitMqModule],
  controllers: [OrdersController],
  providers: [OrdersService],
  exports: [OrdersService],
})
export class OrdersModule {}
