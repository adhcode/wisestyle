import { Injectable, CanActivate, ExecutionContext, HttpException, HttpStatus } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CacheService } from '../redis/cache.service';

@Injectable()
export class RateLimitGuard implements CanActivate {
  private readonly windowMs: number;
  private readonly maxRequests: number;

  constructor(
    private readonly cacheService: CacheService,
    private readonly configService: ConfigService,
  ) {
    this.windowMs = this.configService.get<number>('RATE_LIMIT_WINDOW_MS', 15 * 60 * 1000); // 15 minutes
    this.maxRequests = this.configService.get<number>('RATE_LIMIT_MAX_REQUESTS', 100);
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const ip = request.ip;
    const key = this.generateKey(ip);

    const requests = await this.getRequestCount(key);
    
    if (requests >= this.maxRequests) {
      throw new HttpException(
        'Too many requests, please try again later.',
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    await this.incrementRequestCount(key);
    return true;
  }

  private generateKey(ip: string): string {
    return `rate-limit:${ip}`;
  }

  private async getRequestCount(key: string): Promise<number> {
    const count = await this.cacheService.get<number>(key);
    return count || 0;
  }

  private async incrementRequestCount(key: string): Promise<void> {
    const currentCount = await this.getRequestCount(key);
    await this.cacheService.set(key, currentCount + 1, this.windowMs / 1000);
  }
} 