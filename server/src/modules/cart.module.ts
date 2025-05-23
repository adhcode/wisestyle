import { Module } from '@nestjs/common';
import { CartController } from '../controllers/cart.controller';
import { RedisService } from '../services/redis.service';

@Module({
    controllers: [CartController],
    providers: [RedisService],
    exports: [RedisService]
})
export class CartModule {} 