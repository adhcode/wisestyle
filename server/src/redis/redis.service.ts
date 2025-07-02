import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
    private readonly redis: Redis;
    private readonly logger = new Logger(RedisService.name);
    private isConnected = false;
    // Use ReturnType<typeof setInterval> to avoid NodeJS vs browser typings conflict
    private healthCheckInterval: ReturnType<typeof setInterval>;

    constructor(private configService: ConfigService) {
        const redisUrl = this.configService.get<string>('REDIS_URL');

        // If no REDIS_URL is supplied disable Redis features gracefully.
        if (!redisUrl) {
            this.logger.warn('REDIS_URL not provided – Redis cache disabled.');
            // Mark service as disabled; all public methods will become no-ops.
            this.isConnected = false;
            // Assign a non-functional placeholder to keep typings happy.
            this.redis = null as any;
            return;
        }

        this.redis = new Redis(redisUrl, {
            maxRetriesPerRequest: 3,
            retryStrategy: (times) => {
                const delay = Math.min(times * 50, 2000);
                return delay;
            },
            tls: {
                rejectUnauthorized: false,
            },
        });

        this.setupEventHandlers();
    }

    private setupEventHandlers() {
        this.redis.on('error', (err) => {
            this.logger.error('Redis Client Error:', err);
            this.isConnected = false;
        });

        this.redis.on('connect', () => {
            this.logger.log('Redis Client Connected');
            this.isConnected = true;
        });

        this.redis.on('end', () => {
            this.logger.log('Redis Client Connection Ended');
            this.isConnected = false;
        });
    }

    private startHealthCheck() {
        this.healthCheckInterval = setInterval(async () => {
            try {
                await this.redis.ping();
                this.isConnected = true;
            } catch (error) {
                this.logger.error('Redis health check failed:', error);
                this.isConnected = false;
            }
        }, 30000); // Check every 30 seconds
    }

    async onModuleInit() {
        // Skip initialization when redis is disabled
        if (!this.redis) {
            return;
        }

        try {
            this.startHealthCheck();
        } catch (error) {
            this.logger.error('Failed to initialize Redis:', error);
            // Don't crash the app – just keep Redis disabled
        }
    }

    async onModuleDestroy() {
        if (!this.redis) return;

        if (this.healthCheckInterval) {
            clearInterval(this.healthCheckInterval);
        }
        await this.redis.disconnect();
    }

    async set(key: string, value: any, ttl?: number): Promise<void> {
        if (!this.redis) return;
        try {
            const stringValue = JSON.stringify(value);
            if (ttl) {
                await this.redis.set(key, stringValue, 'EX', ttl);
            } else {
                await this.redis.set(key, stringValue);
            }
        } catch (error) {
            this.logger.error(`Error setting key ${key}:`, error);
        }
    }

    async get<T>(key: string): Promise<T | null> {
        if (!this.redis) return null;
        try {
            const value = await this.redis.get(key);
            return value ? JSON.parse(value) : null;
        } catch (error) {
            this.logger.error(`Error getting key ${key}:`, error);
            return null;
        }
    }

    async del(key: string): Promise<void> {
        if (!this.redis) return;
        try {
            await this.redis.del(key);
        } catch (error) {
            this.logger.error(`Error deleting key ${key}:`, error);
        }
    }

    async flush(): Promise<void> {
        if (!this.redis) return;
        try {
            await this.redis.flushall();
        } catch (error) {
            this.logger.error('Error flushing Redis:', error);
        }
    }

    // Cache product data
    async cacheProduct(slug: string, product: any, ttl: number = 3600): Promise<void> {
        await this.set(`product:${slug}`, product, ttl);
    }

    async getCachedProduct(slug: string): Promise<any | null> {
        return this.get(`product:${slug}`);
    }

    // Cache homepage sections
    async cacheHomepageSection(section: string, data: any, ttl: number = 300): Promise<void> {
        await this.set(`homepage:${section.toLowerCase()}`, data, ttl);
    }

    async getCachedHomepageSection(section: string): Promise<any | null> {
        return this.get(`homepage:${section.toLowerCase()}`);
    }

    // Invalidate cache
    async invalidateHomepageCache(): Promise<void> {
        const sections = ['new_arrivals', 'work_weekend', 'effortless'];
        await Promise.all(sections.map(section => this.del(`homepage:${section}`)));
    }

    async invalidateProductCache(productId?: string): Promise<void> {
        if (productId) {
            await this.del(`product:${productId}`);
        }
        await this.invalidateHomepageCache();
    }

    // Cache category data
    async cacheCategory(categoryId: string, categoryData: any, ttl: number = 3600): Promise<void> {
        await this.set(`category:${categoryId}`, categoryData, ttl);
    }

    async getCachedCategory(categoryId: string): Promise<any | null> {
        return this.get(`category:${categoryId}`);
    }

    // Cache user session
    async cacheUserSession(userId: string, sessionData: any, ttl: number = 86400): Promise<void> {
        await this.set(`session:${userId}`, sessionData, ttl);
    }

    async getCachedUserSession(userId: string): Promise<any | null> {
        return this.get(`session:${userId}`);
    }

    // Cache dashboard data
    async cacheDashboardData(data: any, ttl: number = 300): Promise<void> {
        await this.set('dashboard:data', data, ttl);
    }

    async getCachedDashboardData(): Promise<any | null> {
        return this.get('dashboard:data');
    }

    // Cache product list
    async cacheProductList(products: any[], ttl: number = 300): Promise<void> {
        await this.set('product_list', products, ttl);
    }

    async getCachedProductList(): Promise<any> {
        return this.get('product_list');
    }

    // Cache category list
    async cacheCategoryList(categories: any[], ttl: number = 3600): Promise<void> {
        await this.set('categories:list', categories, ttl);
    }

    async getCachedCategoryList(): Promise<any[] | null> {
        return this.get('categories:list');
    }

    async invalidateCategoryCache(categoryId?: string): Promise<void> {
        if (categoryId) {
            await this.del(`category:${categoryId}`);
        }
        await this.del('categories:list');
    }

    async invalidateDashboardCache(): Promise<void> {
        await this.del('dashboard:data');
    }

    async ping(): Promise<boolean> {
        if (!this.redis) return false;
        try {
            const result = await this.redis.ping();
            return result === 'PONG';
        } catch (error) {
            this.logger.error(`Redis ping failed: ${error.message}`);
            return false;
        }
    }
} 