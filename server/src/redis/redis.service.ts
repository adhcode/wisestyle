import { Injectable, OnModuleDestroy, OnModuleInit, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, RedisClientType } from 'redis';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
    private client: RedisClientType;
    private isConnected: boolean = false;
    private readonly logger = new Logger(RedisService.name);
    private readonly maxRetries = 3;
    private readonly retryDelay = 1000; // 1 second

    constructor(private configService: ConfigService) {
        this.client = createClient({
            url: this.configService.get('REDIS_URL'),
            password: this.configService.get('REDIS_PASSWORD'),
            socket: {
                reconnectStrategy: (retries) => {
                    if (retries > this.maxRetries) {
                        this.logger.error('Max retries reached. Giving up on Redis connection.');
                        return new Error('Max retries reached');
                    }
                    return Math.min(retries * this.retryDelay, 3000);
                }
            }
        });

        this.client.on('error', (err) => {
            this.logger.error('Redis Client Error', err);
            this.isConnected = false;
        });

        this.client.on('connect', () => {
            this.logger.log('Redis Client Connected');
            this.isConnected = true;
        });
    }

    async onModuleInit() {
        try {
            if (!this.isConnected) {
                await this.client.connect();
            }
        } catch (error) {
            this.logger.error('Failed to connect to Redis:', error);
            this.isConnected = false;
        }
    }

    async onModuleDestroy() {
        if (this.isConnected) {
            await this.client.quit();
        }
    }

    private async ensureConnection() {
        if (!this.isConnected) {
            try {
                await this.client.connect();
                this.isConnected = true;
            } catch (error) {
                this.logger.error('Failed to reconnect to Redis:', error);
                return false;
            }
        }
        return true;
    }

    async get(key: string): Promise<any> {
        try {
            if (!await this.ensureConnection()) return null;
            const value = await this.client.get(key);
            return value ? JSON.parse(value) : null;
        } catch (error) {
            this.logger.error(`Error getting key ${key}:`, error);
            return null;
        }
    }

    async set(key: string, value: any, ttl?: number): Promise<void> {
        try {
            if (!await this.ensureConnection()) return;
            const serializedValue = JSON.stringify(value);
            if (ttl) {
                await this.client.set(key, serializedValue, { EX: ttl });
            } else {
                await this.client.set(key, serializedValue);
            }
        } catch (error) {
            this.logger.error(`Error setting key ${key}:`, error);
        }
    }

    async del(key: string): Promise<void> {
        try {
            if (!await this.ensureConnection()) return;
            await this.client.del(key);
        } catch (error) {
            this.logger.error(`Failed to delete key ${key}:`, error);
        }
    }

    async exists(key: string): Promise<boolean> {
        try {
            if (!await this.ensureConnection()) return false;
            const result = await this.client.exists(key);
            return result === 1;
        } catch (error) {
            this.logger.error(`Failed to check existence of key ${key}:`, error);
            return false;
        }
    }

    // Cache product data
    async cacheProduct(productId: string, productData: any, ttl: number = 3600): Promise<void> {
        await this.set(`product:${productId}`, productData, ttl);
    }

    async getCachedProduct(productId: string): Promise<any | null> {
        return this.get(`product:${productId}`);
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
        await this.set(`category:${categoryId}`, JSON.stringify(categoryData), ttl);
    }

    async getCachedCategory(categoryId: string): Promise<any | null> {
        const data = await this.get(`category:${categoryId}`);
        return data ? JSON.parse(data) : null;
    }

    // Cache user session
    async cacheUserSession(userId: string, sessionData: any, ttl: number = 86400): Promise<void> {
        try {
            await this.ensureConnection();
            await this.set(`session:${userId}`, JSON.stringify(sessionData), ttl);
        } catch (error) {
            this.logger.error(`Failed to cache user session for ${userId}:`, error);
        }
    }

    async getCachedUserSession(userId: string): Promise<any | null> {
        try {
            await this.ensureConnection();
            const data = await this.get(`session:${userId}`);
            return data ? JSON.parse(data) : null;
        } catch (error) {
            this.logger.error(`Failed to get cached user session for ${userId}:`, error);
            return null;
        }
    }

    // Cache dashboard data
    async cacheDashboardData(data: any, ttl: number = 300): Promise<void> {
        await this.set('dashboard:data', JSON.stringify(data), ttl);
    }

    async getCachedDashboardData(): Promise<any | null> {
        const data = await this.get('dashboard:data');
        return data ? JSON.parse(data) : null;
    }

    // Cache product list
    async cacheProductList(products: any[], ttl: number = 300): Promise<void> {
        await this.set('product_list', JSON.stringify(products), ttl);
    }

    async getCachedProductList(): Promise<any> {
        return this.get('product_list');
    }

    // Cache category list
    async cacheCategoryList(categories: any[], ttl: number = 3600): Promise<void> {
        await this.set('categories:list', JSON.stringify(categories), ttl);
    }

    async getCachedCategoryList(): Promise<any[] | null> {
        const data = await this.get('categories:list');
        return data ? JSON.parse(data) : null;
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
} 