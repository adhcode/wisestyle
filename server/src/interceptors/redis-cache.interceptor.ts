import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable, of } from 'rxjs';
import { tap } from 'rxjs/operators';
import { CacheService } from '../redis/cache.service';
import { Reflector } from '@nestjs/core';
import 'reflect-metadata';

export const CACHE_KEY = 'cache_key';
export const CACHE_TTL = 'cache_ttl';

export function Cache(ttl: number = 3600) {
  return (target: any, key: string, descriptor: PropertyDescriptor) => {
    Reflect.defineMetadata(CACHE_KEY, `${target.constructor.name}:${key}`, descriptor.value);
    Reflect.defineMetadata(CACHE_TTL, ttl, descriptor.value);
    return descriptor;
  };
}

@Injectable()
export class RedisCacheInterceptor implements NestInterceptor {
  constructor(
    private readonly cacheService: CacheService,
    private readonly reflector: Reflector,
  ) {}

  async intercept(context: ExecutionContext, next: CallHandler): Promise<Observable<any>> {
    const request = context.switchToHttp().getRequest();
    const handler = context.getHandler();

    // Skip caching for non-GET requests
    if (request.method !== 'GET') {
      return next.handle();
    }

    const cacheKey = this.reflector.get<string>(CACHE_KEY, handler);
    const ttl = this.reflector.get<number>(CACHE_TTL, handler);

    if (!cacheKey) {
      return next.handle();
    }

    // Generate a unique cache key based on the request parameters
    const key = this.generateCacheKey(cacheKey, request);

    // Try to get cached data
    const cachedData = await this.cacheService.get(key);
    if (cachedData) {
      return of(cachedData);
    }

    // If no cached data, proceed with the request and cache the response
    return next.handle().pipe(
      tap(async (data) => {
        await this.cacheService.set(key, data, ttl);
      }),
    );
  }

  private generateCacheKey(baseKey: string, request: any): string {
    const queryParams = request.query ? JSON.stringify(request.query) : '';
    const pathParams = request.params ? JSON.stringify(request.params) : '';
    return `${baseKey}:${queryParams}:${pathParams}`;
  }
} 