import { Injectable } from '@nestjs/common';
import { CreateProductDto } from 'src/modules/product/dto/create-product.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class ProductsService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateProductDto) {
    return this.prisma.product.create({
      data: {
        name: dto.name,
        description: dto.description,
        imageUrl: dto.imageUrl,
        variants: {
          create: dto.variants.map(v => ({
            name: v.name,
            price: parseFloat(v.price),
          })),
        },
      },
      include: { variants: true },
    });
  }

  async findAll() {
    return this.prisma.product.findMany({ include: { variants: true } });
  }

  async delete(id: string) {
    return this.prisma.product.delete({ where: { id } });
  }
}
