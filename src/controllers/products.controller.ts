import { Body, Controller, Get, Post, Delete, Param, UseGuards } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { Role } from '@prisma/client';
import { Roles } from 'src/common/decorators/roles.decorator';
import { JwtAuthGuard } from 'src/common/jwt.guard';
import { RolesGuard } from 'src/common/roles.guard';
import { CreateProductDto } from 'src/modules/product/dto/create-product.dto';
import { ProductsService } from 'src/services/products.service';


@Controller('products')
export class ProductsController {
    constructor(private productsService: ProductsService) { }

    // Admin: Create product
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Throttle({ limit: 5, ttl: 60 }as any)
    @Roles(Role.ADMIN)
    @Post('admin/add')
    async create(@Body() dto: CreateProductDto) {
        return this.productsService.create(dto);
    }

    @Throttle({ limit: 5, ttl: 60 }as any)
    @Get()
    async getAll() {
        return this.productsService.findAll();
    }

    // Admin: Delete product
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Throttle({ limit: 5, ttl: 60 }as any)
    @Roles(Role.ADMIN)
    @Delete('admin/delete/:id')
    async remove(@Param('id') id: string) {
        return this.productsService.delete(id);
    }
}
