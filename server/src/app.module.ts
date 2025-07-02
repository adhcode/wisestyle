import { Module, NestModule, MiddlewareConsumer, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { PrismaModule } from './prisma/prisma.module';
import { RedisModule } from './redis/redis.module';
import { CacheHeadersMiddleware } from './middleware/cache-headers.middleware';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { RateLimitGuard } from './guards/rate-limit.guard';
import { RedisCacheInterceptor } from './interceptors/redis-cache.interceptor';
import { AdminModule } from './admin/admin.module';
import { ProductsModule } from './products/products.module';
import { CategoriesModule } from './categories/categories.module';
import { OrdersModule } from './orders/orders.module';
import { UsersModule } from './users/users.module';
import { UploadModule } from './upload/upload.module';
import { CloudinaryModule } from './cloudinary/cloudinary.module';
import { PaymentModule } from './payment/payment.module';
import { HealthModule } from './health/health.module';
import * as Joi from 'joi';
import { join } from 'path';


@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
            envFilePath: join(__dirname, '..', '.env'),
            load: [() => {
                const env = {
                    DATABASE_URL: process.env.DATABASE_URL,
                    REDIS_URL: process.env.REDIS_URL,
                    JWT_SECRET: process.env.JWT_SECRET,
                    PORT: process.env.PORT || 3001,
                    NODE_ENV: process.env.NODE_ENV || 'development',
                };
                console.log('Loaded environment variables:', {
                    DATABASE_URL_exists: !!env.DATABASE_URL,
                    REDIS_URL_exists: !!env.REDIS_URL,
                    JWT_SECRET_exists: !!env.JWT_SECRET,
                    PORT: env.PORT,
                    NODE_ENV: env.NODE_ENV,
                });
                return env;
            }],
            validationSchema: Joi.object({
                NODE_ENV: Joi.string()
                    .valid('development', 'production', 'test')
                    .default('development'),
                PORT: Joi.number().default(3001),
                DATABASE_URL: Joi.string().required(),
                REDIS_URL: Joi.string().optional(),
                JWT_SECRET: Joi.string().required(),
                JWT_EXPIRATION: Joi.string().default('24h'),
                FRONTEND_URL: Joi.string().default('https://wisestyle.vercel.app'),
            }),
            validationOptions: {
                allowUnknown: true,
                abortEarly: false,
            },
        }),
        AuthModule,
        PrismaModule,
        RedisModule,
        AdminModule,
        ProductsModule,
        CategoriesModule,
        OrdersModule,
        UsersModule,
        UploadModule,
        CloudinaryModule,
        PaymentModule,
        HealthModule,
    ],
    providers: [
        {
            provide: APP_GUARD,
            useClass: RateLimitGuard,
        },
        {
            provide: APP_INTERCEPTOR,
            useClass: RedisCacheInterceptor,
        },
    ],
})
export class AppModule implements NestModule, OnModuleInit {
    private readonly logger = new Logger(AppModule.name);

    constructor(private configService: ConfigService) {}

    configure(consumer: MiddlewareConsumer) {
        consumer
            .apply(CacheHeadersMiddleware)
            .forRoutes('*');
    }

    async onModuleInit() {
        this.logger.log('Environment variables:');
        this.logger.log(`NODE_ENV: ${process.env.NODE_ENV}`);
        this.logger.log(`DATABASE_URL exists: ${!!process.env.DATABASE_URL}`);
        this.logger.log(`REDIS_URL exists: ${!!process.env.REDIS_URL}`);
        this.logger.log(`JWT_SECRET exists: ${!!process.env.JWT_SECRET}`);
        this.logger.log(`PORT: ${process.env.PORT}`);

        this.logger.log('ConfigService values:');
        this.logger.log(`NODE_ENV: ${this.configService.get('NODE_ENV')}`);
        this.logger.log(`DATABASE_URL exists: ${!!this.configService.get('DATABASE_URL')}`);
        this.logger.log(`REDIS_URL exists: ${!!this.configService.get('REDIS_URL')}`);
        this.logger.log(`JWT_SECRET exists: ${!!this.configService.get('JWT_SECRET')}`);
        this.logger.log(`PORT: ${this.configService.get('PORT')}`);
    }
}