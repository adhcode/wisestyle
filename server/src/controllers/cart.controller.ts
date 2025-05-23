import { Controller, Get, Post, Patch, Delete, Body, Param, Request } from '@nestjs/common';
import { RedisService } from '../services/redis.service';

@Controller('api/cart')
export class CartController {
    constructor(private readonly redisService: RedisService) {}

    @Get()
    async getCart(@Request() req) {
        const userId = req.user?.id || req.ip;
        const cart = await this.redisService.get(`cart:${userId}`);
        return cart || { items: [] };
    }

    @Post()
    async addToCart(@Body() item: any, @Request() req) {
        const userId = req.user?.id || req.ip;
        const cartKey = `cart:${userId}`;
        
        const cart = await this.redisService.get(cartKey) || { items: [] };
        
        const existingItemIndex = cart.items.findIndex(
            (i: any) =>
                i.id === item.id &&
                i.selectedSize === item.selectedSize &&
                i.selectedColor === item.selectedColor
        );

        if (existingItemIndex > -1) {
            cart.items[existingItemIndex].quantity += item.quantity;
        } else {
            cart.items.push(item);
        }

        await this.redisService.set(cartKey, cart, 604800); // Expire after 1 week
        return cart;
    }

    @Patch(':id')
    async updateCartItem(
        @Param('id') itemId: string,
        @Body() { quantity }: { quantity: number },
        @Request() req
    ) {
        const userId = req.user?.id || req.ip;
        const cartKey = `cart:${userId}`;
        
        const cart = await this.redisService.get(cartKey) || { items: [] };
        
        const itemIndex = cart.items.findIndex((item: any) => item.id === itemId);
        if (itemIndex > -1) {
            cart.items[itemIndex].quantity = quantity;
            await this.redisService.set(cartKey, cart, 604800);
        }

        return cart;
    }

    @Delete(':id')
    async removeFromCart(@Param('id') itemId: string, @Request() req) {
        const userId = req.user?.id || req.ip;
        const cartKey = `cart:${userId}`;
        
        const cart = await this.redisService.get(cartKey) || { items: [] };
        
        cart.items = cart.items.filter((item: any) => item.id !== itemId);
        await this.redisService.set(cartKey, cart, 604800);
        
        return cart;
    }

    @Delete()
    async clearCart(@Request() req) {
        const userId = req.user?.id || req.ip;
        await this.redisService.del(`cart:${userId}`);
        return { items: [] };
    }
} 