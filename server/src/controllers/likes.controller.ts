import { Controller, Post, Delete, Param, UseGuards, Request, Get } from '@nestjs/common';
import { RedisService } from '../services/redis.service';

@Controller('api/likes')
export class LikesController {
    constructor(private readonly redisService: RedisService) {}

    @Post(':productId')
    async toggleLike(@Param('productId') productId: string, @Request() req) {
        const userId = req.user?.id || req.ip; // Use IP for non-authenticated users
        const key = `likes:${userId}`;
        
        const isLiked = await this.redisService.sismember(key, productId);
        
        if (isLiked) {
            await this.redisService.srem(key, productId);
            await this.redisService.decr(`product:${productId}:likes`);
        } else {
            await this.redisService.sadd(key, productId);
            await this.redisService.incr(`product:${productId}:likes`);
        }

        return { liked: !isLiked };
    }

    @Get('user')
    async getUserLikes(@Request() req) {
        const userId = req.user?.id || req.ip;
        const key = `likes:${userId}`;
        
        const likes = await this.redisService.smembers(key);
        return { likes };
    }

    @Get('product/:productId')
    async getProductLikes(@Param('productId') productId: string) {
        const count = await this.redisService.get(`product:${productId}:likes`);
        return { count: parseInt(count || '0') };
    }
} 