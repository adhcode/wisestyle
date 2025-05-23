import { Injectable, OnModuleDestroy } from '@nestjs/common';
import Redis from 'ioredis';

@Injectable()
export class RedisService implements OnModuleDestroy {
  private readonly redis: Redis;

  constructor() {
    this.redis = new Redis({
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379'),
      password: process.env.REDIS_PASSWORD,
      retryStrategy: (times) => Math.min(times * 50, 2000)
    });

    this.redis.on('error', (err) => console.error('Redis Client Error', err));
  }

  async onModuleDestroy() {
    await this.redis.quit();
  }

  async set(key: string, value: any, expiry?: number) {
    if (expiry) {
      return await this.redis.set(key, JSON.stringify(value), 'EX', expiry);
    }
    return await this.redis.set(key, JSON.stringify(value));
  }

  async get(key: string) {
    const value = await this.redis.get(key);
    return value ? JSON.parse(value) : null;
  }

  async del(key: string) {
    return await this.redis.del(key);
  }

  async incr(key: string) {
    return await this.redis.incr(key);
  }

  async decr(key: string) {
    return await this.redis.decr(key);
  }

  // Add these new methods
  async sadd(key: string, member: string) {
    return await this.redis.sadd(key, member);
  }

  async srem(key: string, member: string) {
    return await this.redis.srem(key, member);
  }

  async sismember(key: string, member: string) {
    return await this.redis.sismember(key, member);
  }

  async smembers(key: string) {
    return await this.redis.smembers(key);
  }

  // Product likes specific methods
  async getLikedProducts(userId: string): Promise<string[]> {
    return await this.redis.smembers(`likes:${userId}`);
  }

  async getProductLikesCount(productId: string): Promise<number> {
    const count = await this.redis.get(`product:${productId}:likes`);
    return parseInt(count || '0');
  }

  // Product specific methods
  async getProductViewers(productId: string): Promise<number> {
    const count = await this.redis.get(`product:${productId}:viewers`);
    return parseInt(count || '0');
  }

  async setProductViewers(productId: string, count: number) {
    await this.redis.set(`product:${productId}:viewers`, count, 'EX', 300); // Expire after 5 minutes
  }

  async addRecentlyViewed(userId: string, productId: string) {
    await this.redis.multi()
      .lpush(`user:${userId}:recentlyViewed`, productId)
      .ltrim(`user:${userId}:recentlyViewed`, 0, 9) // Keep only last 10 items
      .expire(`user:${userId}:recentlyViewed`, 604800) // Expire after 1 week
      .exec();
  }

  async getRecentlyViewed(userId: string): Promise<string[]> {
    return await this.redis.lrange(`user:${userId}:recentlyViewed`, 0, 9);
  }

  // Product recommendation methods
  async trackPurchaseTogether(productId: string, boughtWithProductId: string) {
    // Increment the count for products bought together
    await this.redis.zincrby(`product:${productId}:boughtWith`, 1, boughtWithProductId);
    await this.redis.zincrby(`product:${boughtWithProductId}:boughtWith`, 1, productId);
    
    // Keep only top 20 products
    await this.redis.zremrangebyrank(`product:${productId}:boughtWith`, 0, -21);
    await this.redis.zremrangebyrank(`product:${boughtWithProductId}:boughtWith`, 0, -21);
  }

  async getPeopleBoughtTogether(productId: string, limit: number = 4): Promise<string[]> {
    // Get top products bought together
    return await this.redis.zrevrange(`product:${productId}:boughtWith`, 0, limit - 1);
  }

  async trackProductView(userId: string, productId: string, categoryId: string) {
    const multi = this.redis.multi();
    
    // Track in user's viewed category
    multi.zincrby(`user:${userId}:viewedCategories`, 1, categoryId);
    
    // Track product view count
    multi.zincrby(`category:${categoryId}:popularProducts`, 1, productId);
    
    // Expire after 30 days
    multi.expire(`category:${categoryId}:popularProducts`, 2592000);
    
    await multi.exec();
  }

  async getSimilarProducts(productId: string, categoryId: string, limit: number = 4): Promise<string[]> {
    // Get popular products from same category, excluding current product
    const products = await this.redis.zrevrange(`category:${categoryId}:popularProducts`, 0, limit);
    return products.filter(id => id !== productId).slice(0, limit);
  }

  async getPersonalizedRecommendations(userId: string, limit: number = 4): Promise<string[]> {
    // Get user's most viewed categories
    const topCategories = await this.redis.zrevrange(`user:${userId}:viewedCategories`, 0, 2);
    
    const recommendations: string[] = [];
    for (const categoryId of topCategories) {
      const products = await this.redis.zrevrange(`category:${categoryId}:popularProducts`, 0, limit - 1);
      recommendations.push(...products);
      if (recommendations.length >= limit) break;
    }
    
    return recommendations.slice(0, limit);
  }

  async getTrendingInCategory(categoryId: string, limit: number = 4): Promise<string[]> {
    // Get trending products based on view count velocity
    const now = Math.floor(Date.now() / 1000);
    const hourAgo = now - 3600;
    
    // Track hourly views in a separate sorted set
    const hourlyKey = `category:${categoryId}:hourlyViews:${Math.floor(now / 3600)}`;
    const previousHourKey = `category:${categoryId}:hourlyViews:${Math.floor(hourAgo / 3600)}`;
    
    // Get current and previous hour views
    const [currentViews, previousViews] = await Promise.all([
      this.redis.zrange(hourlyKey, 0, -1, 'WITHSCORES'),
      this.redis.zrange(previousHourKey, 0, -1, 'WITHSCORES')
    ]);
    
    // Calculate velocity (view rate change)
    const velocities = new Map();
    for (let i = 0; i < currentViews.length; i += 2) {
      const productId = currentViews[i];
      const currentScore = parseInt(currentViews[i + 1]);
      const previousScore = parseInt(previousViews[previousViews.indexOf(productId) + 1] || '0');
      const velocity = currentScore - previousScore;
      velocities.set(productId, velocity);
    }
    
    // Sort by velocity and return top products
    return Array.from(velocities.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit)
      .map(([productId]) => productId);
  }

  async getComplementaryProducts(productId: string, limit: number = 4): Promise<string[]> {
    // Get product category and style tags
    const [category, styleTags] = await Promise.all([
      this.redis.get(`product:${productId}:category`),
      this.redis.smembers(`product:${productId}:styleTags`)
    ]);
    
    // Get products that share style tags but are in different categories
    const complementaryCategories = await this.redis.smembers(`category:${category}:complementary`);
    const recommendations = new Set<string>();
    
    // For each complementary category, find products with matching style tags
    for (const compCategory of complementaryCategories) {
      // Find products in this category that share style tags
      for (const styleTag of styleTags) {
        const products = await this.redis.sinter(
          `category:${compCategory}:products`,
          `styleTag:${styleTag}:products`
        );
        products.forEach(p => recommendations.add(p));
        if (recommendations.size >= limit) break;
      }
      if (recommendations.size >= limit) break;
    }
    
    return Array.from(recommendations).slice(0, limit);
  }

  // Helper method to track style matches
  async trackStyleMatch(productId: string, matchedWithProductId: string) {
    // Increment style match score
    await this.redis.zincrby(`product:${productId}:styleMatches`, 1, matchedWithProductId);
    await this.redis.zincrby(`product:${matchedWithProductId}:styleMatches`, 1, productId);
    
    // Expire after 90 days
    await this.redis.expire(`product:${productId}:styleMatches`, 7776000);
    await this.redis.expire(`product:${matchedWithProductId}:styleMatches`, 7776000);
  }

  // Helper method to track product view velocity
  async trackProductViewVelocity(categoryId: string, productId: string) {
    const hourlyKey = `category:${categoryId}:hourlyViews:${Math.floor(Date.now() / 3600)}`;
    await this.redis.zincrby(hourlyKey, 1, productId);
    await this.redis.expire(hourlyKey, 7200); // Expire after 2 hours
  }
} 