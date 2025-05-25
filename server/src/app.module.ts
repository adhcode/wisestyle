import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
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
import * as Joi from 'joi';

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
            validationSchema: Joi.object({
                NODE_ENV: Joi.string()
                    .valid('development', 'production', 'test')
                    .default('development'),
                PORT: Joi.number().default(3001),
                DATABASE_URL: Joi.string().required(),
                REDIS_URL: Joi.string().required(),
                JWT_SECRET: Joi.string().default('default_jwt_secret'),
                JWT_EXPIRATION: Joi.string().default('24h'),
                FRONTEND_URL: Joi.string().default('https://wisestyle.vercel.app'),
            }),
            validationOptions: {
                allowUnknown: true,
                abortEarly: false,
            },
            expandVariables: true,
            cache: true,
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
export class AppModule implements NestModule {
    configure(consumer: MiddlewareConsumer) {
        consumer
            .apply(CacheHeadersMiddleware)
            .forRoutes('*');
    }
}