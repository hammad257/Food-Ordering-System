import { BadRequestException, Body, Controller, Delete, Get, NotFoundException, Param, Post, Put, Req, UseGuards } from '@nestjs/common';
import { AddItemDto } from 'src/modules/cart/dto/add-item.dto';
import { CartService } from 'src/services/cart.service';
import { JwtAuthGuard } from 'src/common/jwt.guard';
import { UpdateItemDto } from 'src/modules/cart/dto/update-item.dto';
import { Throttle } from '@nestjs/throttler';

@Controller('cart')
@UseGuards(JwtAuthGuard)
export class CartController {
    constructor(private cartService: CartService) { }

    @Throttle({ limit: 5, ttl: 60 }as any)
    @Get()
    async getCart(@Req() req) {
        const userId = req.user?.userId || req.user?.id;
        return this.cartService.getCart(userId);
    }

    @Throttle({ limit: 5, ttl: 60 }as any)
    @Post('add')
    async addItem(@Req() req, @Body() dto: AddItemDto) {
        const userId = req.user?.userId || req.user?.id;
        if (!userId) return { statusCode: 401, message: 'Unauthorized' };
        return this.cartService.addItem(userId, dto);
    }

    @Throttle({ limit: 5, ttl: 60 }as any)
    @Put('item/:itemId')
    async updateItem(
        @Req() req,
        @Param('itemId') itemId: string,
        @Body() dto: UpdateItemDto,
    ) {
        const userId = req.user?.userId || req.user?.id;
        if (!userId) return { statusCode: 401, message: 'Unauthorized' };

        try {
            const updatedCart = await this.cartService.updateItem(userId, itemId, dto.quantity);
            return updatedCart;
        } catch (error) {
            if (error instanceof NotFoundException || error instanceof BadRequestException) {
                return {
                    statusCode: error.getStatus(),
                    message: error.message,
                    error: error.name,
                };
            }
            return {
                statusCode: 500,
                message: 'Internal Server Error',
                error: 'ServerError',
            };
        }
    }


    @Delete('item/:itemId')
    async removeItem(@Req() req, @Param('itemId') itemId: string) {
        const userId = req.user?.userId || req.user?.id;
        if (!userId) return { statusCode: 401, message: 'Unauthorized' };
        return this.cartService.removeItem(userId, itemId);
    }

    @Delete('clear')
    async clear(@Req() req) {
        const userId = req.user?.userId || req.user?.id;
        if (!userId) return { statusCode: 401, message: 'Unauthorized' };
        await this.cartService.clearCart(userId);
        return { status: 'success', message: 'Cart cleared' };
    }
}
