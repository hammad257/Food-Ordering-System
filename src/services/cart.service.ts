import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { AddItemDto } from 'src/modules/cart/dto/add-item.dto';

@Injectable()
export class CartService {
  constructor(private prisma: PrismaService) {}

  // Return cart (items include variant -> product)
  async getCart(userId: string) {
    if (!userId) return null;

    const cart = await this.prisma.cart.findFirst({
      where: { userId },
      include: {
        items: {
          include: {
            variant: {
              include: {
                product: true,
              },
            },
          },
        },
      },
    });

    if (!cart) {
      return { userId, items: [], total: 0 };
    }

    // compute total from variant.price * quantity
    const total =
      (cart.items ?? []).reduce((sum, it) => {
        const vPrice = it.variant?.price ?? 0;
        return sum + vPrice * it.quantity;
      }, 0) ?? 0;

    // ensure total in returned shape (optional: you may persist total in DB elsewhere)
    return { ...cart, total };
  }

  async addItem(userId: string, dto: AddItemDto) {
    const { productId, variantId, quantity } = dto;

    if (!userId) throw new BadRequestException('UserId is required');

    // make sure variant exists and belongs to product
    const variant = await this.prisma.variant.findUnique({
      where: { id: variantId },
    });
    if (!variant) throw new NotFoundException('Variant not found');

    if (variant.productId !== productId) {
      throw new BadRequestException('Variant does not belong to the provided product');
    }

    // find or create cart (use findFirst because userId is not a unique PK for findUnique)
    let cart = await this.prisma.cart.findFirst({ where: { userId } });
    if (!cart) {
      cart = await this.prisma.cart.create({ data: { userId } });
    }

    // check existing item (same variant)
    const existing = await this.prisma.cartItem.findFirst({
      where: { cartId: cart.id, variantId },
    });

    if (existing) {
      await this.prisma.cartItem.update({
        where: { id: existing.id },
        data: { quantity: existing.quantity + quantity },
      });
    } else {
      // NOTE: do not pass productId or price here if your schema doesn't include those fields
      await this.prisma.cartItem.create({
        data: {
          cartId: cart.id,
          variantId,
          quantity,
        },
      });
    }

    // compute updated cart (including variant -> product)
    const updated = await this.getCart(userId) as any;

    // optional: persist total into cart table if you have total field
    // if your Cart model has a 'total' field you can update it:
    if (typeof updated.total === 'number') {
      await this.prisma.cart.update({
        where: { id: cart.id },
        data: { total: updated.total },
      });
    }

    return updated;
  }

    // update quantity of an existing cart item (or throw if not found / not owner)
 async updateItem(userId: string, itemId: string, quantity: number) {
  if (!userId) throw new BadRequestException('UserId is required');

  // 1. Find the cart item by id
  const cartItem = await this.prisma.cartItem.findUnique({
    where: { id: itemId },
    include: { cart: true, variant: { include: { product: true } } },
  });

  if (!cartItem) {
    console.log(`Cart item not found: ${itemId}`);
    throw new NotFoundException('Cart item not found');
  }

  // 2. Check if the cart belongs to the user
  if (cartItem.cart.userId !== userId) {
    console.log(`Unauthorized update attempt by user ${userId}`);
    throw new BadRequestException('Not authorized to update this item');
  }

  // 3. Update or delete if quantity <= 0 (should not happen due to DTO)
  if (quantity <= 0) {
    await this.prisma.cartItem.delete({ where: { id: itemId } });
  } else {
    await this.prisma.cartItem.update({
      where: { id: itemId },
      data: { quantity },
    });
  }

  // 4. Recalculate total
  const items = await this.prisma.cartItem.findMany({
    where: { cartId: cartItem.cartId },
    include: { variant: true },
  });

  const total = items.reduce((sum, i) => sum + (i.variant?.price ?? 0) * i.quantity, 0);
  await this.prisma.cart.update({ where: { id: cartItem.cartId }, data: { total } }).catch(() => null);

  // 5. Return updated cart
  return this.getCart(userId);
}

  // remove a single item by id (ensure belongs to user)
  async removeItem(userId: string, itemId: string) {
    if (!userId) throw new BadRequestException('UserId is required');

    const cartItem = await this.prisma.cartItem.findUnique({
      where: { id: itemId },
      include: { cart: true },
    });
    if (!cartItem) throw new NotFoundException('Cart item not found');

    if (cartItem.cart.userId !== userId) {
      throw new BadRequestException('Not authorized to remove this item');
    }

    await this.prisma.cartItem.delete({ where: { id: itemId } });

    // recalc total
    const items = await this.prisma.cartItem.findMany({
      where: { cartId: cartItem.cartId },
      include: { variant: true },
    });
    const total = items.reduce((s, i) => s + (i.variant?.price ?? 0) * i.quantity, 0);
    await this.prisma.cart.update({ where: { id: cartItem.cartId }, data: { total } }).catch(() => null);

    return this.getCart(userId);
  }


  async clearCart(userId: string) {
    const cart = await this.prisma.cart.findFirst({ where: { userId } });
    if (!cart) return null;
    await this.prisma.cartItem.deleteMany({ where: { cartId: cart.id } });
    // optionally reset persisted total if exists
    await this.prisma.cart.update({ where: { id: cart.id }, data: { total: 0 } }).catch(() => null);
    return { status: 'success' };
  }
}
