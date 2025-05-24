import { Injectable, OnModuleDestroy, OnModuleInit, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, RedisClientType } from 'redis';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
    private client: RedisClientType;
    private isConnected: boolean = false;
    private readonly logger = new Logger(RedisService.name);
    private reconnectAttempts: number = 0;
    private readonly maxReconnectAttempts: number = 5;
    private healthCheckInterval: NodeJS.Timeout;
    private readonly healthCheckIntervalMs: number = 30000; // 30 seconds
    private lastOperationTime: number = Date.now();
    private readonly maxIdleTime: number = 60000; // 60 seconds
    private operationQueue: Array<() => Promise<void>> = [];
    private isProcessingQueue: boolean = false;

    constructor(private configService: ConfigService) {
        const redisUrl = this.configService.get('REDIS_URL');
        this.logger.log(`Initializing Redis with URL: ${redisUrl}`);

        this.client = createClient({
            url: redisUrl,
            socket: {
                reconnectStrategy: (retries) => {
                    if (retries > this.maxReconnectAttempts) {
                        this.logger.error(`Max reconnection attempts (${this.maxReconnectAttempts}) reached`);
                        return new Error('Max reconnection attempts reached');
                    }
                    const delay = Math.min(retries * 2000, 10000); // Exponential backoff up to 10s
                    this.logger.log(`Retrying Redis connection. Attempt ${retries}. Delay: ${delay}ms`);
                    return delay;
                },
                connectTimeout: 20000, // 20 seconds
                noDelay: true
            },
            disableOfflineQueue: false,
            readonly: false,
            legacyMode: false
        });

        this.setupEventHandlers();
        this.startHealthCheck();
    }

    private setupEventHandlers() {
        this.client.on('error', async (err) => {
            this.logger.error('Redis Client Error:', err);
            this.isConnected = false;
            this.reconnectAttempts++;
            
            if (err.message.includes('ECONNRESET') || err.message.includes('Connection lost')) {
                this.logger.warn('Connection reset or lost, waiting before reconnect...');
                await new Promise(resolve => setTimeout(resolve, 5000)); // Wait 5s before reconnect
                await this.reconnect();
            }
        });

        this.client.on('connect', () => {
            this.logger.log('Redis Client Connected');
            this.isConnected = true;
            this.reconnectAttempts = 0;
            this.lastOperationTime = Date.now();
            this.processOperationQueue();
        });

        this.client.on('ready', () => {
            this.logger.log('Redis Client Ready');
            this.isConnected = true;
            this.reconnectAttempts = 0;
            this.lastOperationTime = Date.now();
            this.processOperationQueue();
        });

        this.client.on('end', () => {
            this.logger.log('Redis Client Connection Ended');
            this.isConnected = false;
        });

        this.client.on('reconnecting', () => {
            this.logger.warn('Redis Client Reconnecting...');
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
                const now = Date.now();
                if (now - this.lastOperationTime > this.maxIdleTime) {
                    this.logger.warn('Connection idle for too long, performing health check...');
                    await this.client.ping();
                    this.lastOperationTime = Date.now();
                    this.logger.debug('Idle connection health check passed');
                } else {
                    await this.client.ping();
                    this.logger.debug('Redis health check passed');
                }
            } catch (error) {
                this.logger.error('Redis health check failed:', error);
                await this.reconnect();
            }
        }, this.healthCheckIntervalMs);
    }

    private async reconnect() {
        try {
            this.logger.log('Attempting to reconnect to Redis...');
            if (this.client.isOpen) {
                await this.client.disconnect();
            }
            await new Promise(resolve => setTimeout(resolve, 5000)); // Wait 5s before reconnect
            await this.client.connect();
            await this.client.ping();
            this.logger.log('Redis reconnected successfully');
            this.lastOperationTime = Date.now();
        } catch (error) {
            this.logger.error('Failed to reconnect to Redis:', error);
            await this.createNewClient();
        }
    }

    private async createNewClient() {
        try {
            const redisUrl = this.configService.get('REDIS_URL');
            this.client = createClient({
                url: redisUrl,
                socket: {
                    reconnectStrategy: (retries) => {
                        if (retries > this.maxReconnectAttempts) {
                            return new Error('Max reconnection attempts reached');
                        }
                        return Math.min(retries * 2000, 10000);
                    },
                    connectTimeout: 20000,
                    noDelay: true
                },
                disableOfflineQueue: false,
                readonly: false,
                legacyMode: false
            });
            this.setupEventHandlers();
            await this.client.connect();
            this.logger.log('New Redis client created and connected');
        } catch (error) {
            this.logger.error('Failed to create new Redis client:', error);
        }
    }

    async onModuleInit() {
        try {
            await this.client.connect();
            await this.client.ping();
            this.logger.log('Redis connection established during module initialization');
            this.isConnected = true;
            this.lastOperationTime = Date.now();
        } catch (error) {
            this.logger.error('Failed to connect to Redis during initialization:', error);
            this.isConnected = false;
            await this.createNewClient();
        }
    }

    async onModuleDestroy() {
        clearInterval(this.healthCheckInterval);
        if (this.client && this.client.isOpen) {
            await this.client.quit();
            this.logger.log('Redis connection closed during module destruction');
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
                await this.createNewClient();
                return false;
            }
        }
        return true;
    }

    private async executeWithRetry<T>(operation: () => Promise<T>): Promise<T> {
        const maxRetries = 3;
        let lastError: Error | null = null;

        for (let i = 0; i < maxRetries; i++) {
            try {
                if (!await this.ensureConnection()) {
                    throw new Error('Failed to ensure connection');
                }
                const result = await operation();
                this.lastOperationTime = Date.now();
                return result;
            } catch (error) {
                lastError = error;
                this.logger.error(`Operation failed (attempt ${i + 1}/${maxRetries}):`, error);
                if (i < maxRetries - 1) {
                    await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
                    await this.reconnect();
                }
            }
        }

        throw lastError || new Error('Operation failed after all retries');
    }

    async get(key: string): Promise<any> {
        return this.executeWithRetry(async () => {
            const value = await this.client.get(key);
            if (!value) return null;
            try {
                return JSON.parse(value as string);
            } catch (error) {
                this.logger.error(`Error parsing Redis value for key ${key}:`, error);
                return null;
            }
        });
    }

    async set(key: string, value: any, ttl?: number): Promise<void> {
        await this.executeWithRetry(async () => {
            const serializedValue = JSON.stringify(value);
            if (ttl) {
                await this.client.set(key, serializedValue, { EX: ttl });
            } else {
                await this.client.set(key, serializedValue);
            }
        });
    }

    async del(key: string): Promise<void> {
        await this.executeWithRetry(async () => {
            await this.client.del(key);
        });
    }

    async exists(key: string): Promise<boolean> {
        return this.executeWithRetry(async () => {
            const result = await this.client.exists(key);
            return result === 1;
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
} 