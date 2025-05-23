import { Module } from '@nestjs/common';
import { ProductGateway } from '../gateways/product.gateway';
import { RedisService } from '../services/redis.service';

@Module({
  providers: [ProductGateway, RedisService],
  exports: [RedisService]
})
export class RealtimeModule {} 