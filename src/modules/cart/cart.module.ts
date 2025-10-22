import { Module } from '@nestjs/common';
import { CartService } from 'src/services/cart.service';
import { CartController } from 'src/controllers/cart.controller';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [CartController],
  providers: [CartService],
  exports: [CartService],
})
export class CartModule {}
