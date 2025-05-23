import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { RedisService } from '../services/redis.service';

@Controller('api/products')
export class ProductController {
    constructor(private readonly redisService: RedisService) {}

    @Get(':slug/similar')
    async getSimilarProducts(
        @Param('slug') productId: string,
        @Query('category') categoryId: string,
        @Query('limit') limit: number = 4
    ) {
        // Get similar products using multiple recommendation strategies
        const [similarByCategory, boughtTogether] = await Promise.all([
            this.redisService.getSimilarProducts(productId, categoryId, limit),
            this.redisService.getPeopleBoughtTogether(productId, limit)
        ]);

        // Combine and deduplicate recommendations
        const recommendations = new Set([...similarByCategory, ...boughtTogether]);
        
        // Convert product IDs to full product data (mock data for now)
        const products = Array.from(recommendations).slice(0, limit).map(id => ({
            id,
            name: `Product ${id}`,
            price: Math.floor(Math.random() * 200) + 50,
            image: `/images/products/product-${id}.jpg`
        }));

        return products;
    }

    @Get(':slug/bought-together')
    async getBoughtTogether(
        @Param('slug') productId: string,
        @Query('limit') limit: number = 4
    ) {
        // Get products frequently bought together
        const boughtTogether = await this.redisService.getPeopleBoughtTogether(productId, limit);
        
        // Convert to full product data (mock data for now)
        const products = boughtTogether.map(id => ({
            id,
            name: `Product ${id}`,
            price: Math.floor(Math.random() * 200) + 50,
            image: `/images/products/product-${id}.jpg`
        }));

        return products;
    }

    @Get(':slug/trending')
    async getTrendingProducts(
        @Param('slug') productId: string,
        @Query('category') categoryId: string,
        @Query('limit') limit: number = 4
    ) {
        // Get trending products in the same category
        const trending = await this.redisService.getTrendingInCategory(categoryId, limit);
        
        return trending.map(id => ({
            id,
            name: `Product ${id}`,
            price: Math.floor(Math.random() * 200) + 50,
            image: `/images/products/product-${id}.jpg`
        }));
    }

    @Get(':slug/complete-the-look')
    async getCompleteTheLook(
        @Param('slug') productId: string,
        @Query('limit') limit: number = 4
    ) {
        // Get curated products that complete the look
        const complementary = await this.redisService.getComplementaryProducts(productId, limit);
        
        return complementary.map(id => ({
            id,
            name: `Product ${id}`,
            price: Math.floor(Math.random() * 200) + 50,
            image: `/images/products/product-${id}.jpg`
        }));
    }
} 