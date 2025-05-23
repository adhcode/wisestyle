import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe, Logger } from '@nestjs/common';
import { join } from 'path';
import { NestExpressApplication } from '@nestjs/platform-express';
import * as compression from 'compression';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    logger: ['error', 'warn', 'log', 'debug', 'verbose'],
  });
  
  // Enable CORS
  app.enableCors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    credentials: true,
  });

  // Security middleware
  app.use(helmet());
  
  // Compression middleware
  app.use(compression());
  
  // Rate limiting - more lenient for public routes
  const publicLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 300, // 300 requests per windowMs for public routes
    message: 'Too many requests from this IP, please try again later.',
  });

  const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // 100 requests per windowMs for API routes
    message: 'Too many requests from this IP, please try again later.',
  });

  // Apply rate limiting
  app.use('/api/products/homepage-sections', publicLimiter); // More lenient for homepage sections
  app.use('/api', apiLimiter); // Stricter for other API routes

  app.useGlobalPipes(new ValidationPipe({
    transform: true,
    whitelist: true,
    forbidNonWhitelisted: true,
  }));

  // Serve static files from the uploads directory with caching
  app.useStaticAssets(join(__dirname, '..', 'uploads'), {
    prefix: '/uploads',
    maxAge: '1d', // Cache static assets for 1 day
    immutable: true,
  });

  // Set global prefix for API routes
  app.setGlobalPrefix('api');

  // Global error handler
  app.use((err: any, req: any, res: any, next: any) => {
    logger.error('Unhandled error:', err);
    res.status(500).json({
      statusCode: 500,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined,
    });
  });

  const port = process.env.PORT || 3001;
  await app.listen(port);
  logger.log(`Application is running on: http://localhost:${port}`);
}
bootstrap(); 