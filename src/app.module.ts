import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { UsersModule } from './modules/users/users.module';
import { AuthModule } from './modules/auth/auth.module';
import { ProductsModule } from './modules/product/products.module';
import { CartModule } from './modules/cart/cart.module';
import { OrdersModule } from './modules/order/orders.module';
import { RabbitMqModule } from './modules/messagingQueue/rabbitmq.module';
import { APP_GUARD, Reflector } from '@nestjs/core';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    UsersModule,
    AuthModule,
    ProductsModule,
    CartModule,
    OrdersModule,
    RabbitMqModule
  ],
})
export class AppModule { }
