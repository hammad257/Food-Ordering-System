import { Module } from '@nestjs/common';
import { ProductsService } from 'src/services/products.service';
import { ProductsController } from 'src/controllers/products.controller';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [ProductsController],
  providers: [ProductsService],
  exports: [ProductsService],
})
export class ProductsModule {}
