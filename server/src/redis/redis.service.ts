import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, RedisClientType } from 'redis';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
    private readonly logger = new Logger(RedisService.name);
    private client: RedisClientType;
    private isConnected = false;
    private reconnectAttempts = 0;
    private readonly maxReconnectAttempts = 3;
    private readonly reconnectDelay = 1000; // 1 second
    private healthCheckInterval: NodeJS.Timeout;
    private readonly healthCheckIntervalMs: number = 30000; // 30 seconds
    private lastOperationTime: number = Date.now();
    private readonly maxIdleTime: number = 60000; // 60 seconds
    private operationQueue: Array<() => Promise<void>> = [];
    private isProcessingQueue: boolean = false;

    constructor(private configService: ConfigService) {
        this.initializeClient();
    }

    private initializeClient() {
        const redisUrl = this.configService.get<string>('REDIS_URL');
        if (!redisUrl) {
            throw new Error('REDIS_URL is not defined');
        }

        this.client = createClient({
            url: redisUrl,
            socket: {
                reconnectStrategy: (retries) => {
                    if (retries >= this.maxReconnectAttempts) {
                        this.logger.error('Max reconnection attempts reached');
                        return new Error('Max reconnection attempts reached');
                    }
                    const delay = Math.min(this.reconnectDelay * Math.pow(2, retries), 10000);
                    this.logger.log(`Reconnecting in ${delay}ms...`);
                    return delay;
                },
                connectTimeout: 10000,
                keepAlive: 5000,
            },
        });

        this.setupEventHandlers();
    }

    private setupEventHandlers() {
        this.client.on('error', (err) => {
            this.logger.error('Redis Client Error:', err);
            this.isConnected = false;
        });

        this.client.on('connect', () => {
            this.logger.log('Redis Client Connected');
            this.isConnected = true;
            this.reconnectAttempts = 0;
        });

        this.client.on('reconnecting', () => {
            this.logger.log('Redis Client Reconnecting...');
            this.reconnectAttempts++;
        });

        this.client.on('end', () => {
            this.logger.log('Redis Client Connection Ended');
            this.isConnected = false;
        });
    }

    private async processOperationQueue() {
        if (this.isProcessingQueue || this.operationQueue.length === 0) {
            return;
        }

        this.isProcessingQueue = true;
        while (this.operationQueue.length > 0 && this.isConnected) {
            const operation = this.operationQueue.shift();
            try {
                await operation();
            } catch (error) {
                this.logger.error('Error processing operation from queue:', error);
                // Add the operation back to the queue if it's a connection error
                if (error.message.includes('ECONNRESET')) {
                    this.operationQueue.unshift(operation);
                    break;
                }
            }
        }
        this.isProcessingQueue = false;
    }

    private startHealthCheck() {
        this.healthCheckInterval = setInterval(async () => {
            try {
                await this.client.ping();
                this.isConnected = true;
            } catch (error) {
                this.logger.error('Redis health check failed:', error);
                this.isConnected = false;
                await this.reconnect();
            }
        }, 5000);
    }

    private async reconnect() {
        if (this.reconnectAttempts >= this.maxReconnectAttempts) {
            this.logger.error('Max reconnection attempts reached');
            return;
        }

        try {
            await this.client.connect();
        } catch (error) {
            this.logger.error('Reconnection failed:', error);
        }
    }

    async onModuleInit() {
        try {
            await this.client.connect();
            this.startHealthCheck();
        } catch (error) {
            this.logger.error('Failed to connect to Redis:', error);
            throw error;
        }
    }

    async onModuleDestroy() {
        if (this.healthCheckInterval) {
            clearInterval(this.healthCheckInterval);
        }
        await this.client.quit();
    }

    private async executeWithRetry<T>(operation: () => Promise<T>): Promise<T> {
        let lastError: Error | null = null;
        for (let attempt = 1; attempt <= 3; attempt++) {
            try {
                if (!this.isConnected) {
                    await this.reconnect();
                }
                return await operation();
            } catch (error) {
                lastError = error as Error;
                this.logger.error(`Operation failed (attempt ${attempt}/3):`, error);
                if (attempt < 3) {
                    await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
                }
            }
        }
        throw lastError;
    }

    async set(key: string, value: any, ttl?: number): Promise<void> {
        return this.executeWithRetry(async () => {
            const stringValue = JSON.stringify(value);
            if (ttl) {
                await this.client.set(key, stringValue, { EX: ttl });
            } else {
                await this.client.set(key, stringValue);
            }
        });
    }

    async get<T>(key: string): Promise<T | null> {
        return this.executeWithRetry(async () => {
            const value = await this.client.get(key);
            if (!value || typeof value !== 'string') return null;
            try {
                const parsed = JSON.parse(value);
                return parsed as T;
            } catch (error) {
                this.logger.error(`Error parsing Redis value for key ${key}:`, error);
                return null;
            }
        });
    }

    async del(key: string): Promise<void> {
        return this.executeWithRetry(async () => {
            await this.client.del(key);
        });
    }

    async flush(): Promise<void> {
        return this.executeWithRetry(async () => {
            await this.client.flushAll();
        });
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
        await this.set(`category:${categoryId}`, categoryData, ttl);
    }

    async getCachedCategory(categoryId: string): Promise<any | null> {
        return this.get(`category:${categoryId}`);
    }

    // Cache user session
    async cacheUserSession(userId: string, sessionData: any, ttl: number = 86400): Promise<void> {
        try {
            await this.ensureConnection();
            await this.set(`session:${userId}`, sessionData, ttl);
        } catch (error) {
            this.logger.error(`Failed to cache user session for ${userId}:`, error);
        }
    }

    async getCachedUserSession(userId: string): Promise<any | null> {
        try {
            await this.ensureConnection();
            return await this.get(`session:${userId}`);
        } catch (error) {
            this.logger.error(`Failed to get cached user session for ${userId}:`, error);
            return null;
        }
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
        try {
            const result = await this.client.ping();
            return result === 'PONG';
        } catch (error) {
            this.logger.error(`Redis ping failed: ${error.message}`);
            return false;
        }
    }

    private async ensureConnection() {
        if (!this.isConnected || !this.client.isOpen) {
            try {
                if (!this.client.isOpen) {
                    await this.client.connect();
                }
                await this.client.ping();
                this.isConnected = true;
                this.lastOperationTime = Date.now();
                this.logger.log('Redis connection re-established');
            } catch (error) {
                this.logger.error('Failed to reconnect to Redis:', error);
                await this.reconnect();
                return false;
            }
        }
        return true;
    }
} 