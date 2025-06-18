import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe, Logger } from '@nestjs/common';
import { join } from 'path';
import { NestExpressApplication } from '@nestjs/platform-express';
import * as compression from 'compression';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    logger: ['error', 'warn', 'log', 'debug', 'verbose'],
  });
  
  const configService = app.get(ConfigService);
  const isProduction = configService.get('NODE_ENV') === 'production';
  
  logger.log(`Starting server in ${isProduction ? 'production' : 'development'} mode`);
  
  // Security middleware
  app.use(helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
    contentSecurityPolicy: false,
  }));
  
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
  app.use('/api/products/homepage-sections', publicLimiter);
  app.use('/api', apiLimiter);

  app.useGlobalPipes(new ValidationPipe({
    transform: true,
    whitelist: true,
    forbidNonWhitelisted: true,
  }));

  // Serve static files from the uploads directory with caching
  app.useStaticAssets(join(__dirname, '..', 'uploads'), {
    prefix: '/uploads',
    maxAge: '1d',
    immutable: true,
  });

  // Set global prefix for API routes
  app.setGlobalPrefix('api');

  // CORS configuration
  const allowedOrigins = isProduction 
    ? ['https://wisestyle.vercel.app']
    : ['http://localhost:3000', 'http://localhost:3001'];

  logger.log(`Configuring CORS with allowed origins: ${allowedOrigins.join(', ')}`);

  app.enableCors({
    origin: (origin, callback) => {
      logger.debug(`Incoming request from origin: ${origin}`);
      
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        logger.warn(`Blocked request from unauthorized origin: ${origin}`);
        callback(new Error('Not allowed by CORS'));
      }
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'Origin', 'X-Requested-With'],
    exposedHeaders: ['Content-Type', 'Authorization'],
    maxAge: 3600,
  });

  // Global error handler
  app.use((err: any, req: any, res: any, next: any) => {
    logger.error('Unhandled error:', {
      error: err.message,
      stack: err.stack,
      path: req.path,
      method: req.method,
      query: req.query,
      body: req.body,
    });
    
    res.status(500).json({
      statusCode: 500,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined,
    });
  });

  // Get port from environment variable or use default
  const port = process.env.PORT || 3001;
  
  await app.listen(port, '0.0.0.0', () => {
    logger.log(`Application is running on port ${port}`);
    logger.log(`Environment: ${process.env.NODE_ENV}`);
    logger.log(`Frontend URL: ${process.env.FRONTEND_URL}`);
    logger.log(`Allowed Origins: ${allowedOrigins.join(', ')}`);
    logger.log(`Database URL configured: ${!!process.env.DATABASE_URL}`);
    logger.log(`Redis URL configured: ${!!process.env.REDIS_URL}`);
  });
}

process.on('unhandledRejection', (reason, promise) => {
  const logger = new Logger('UnhandledRejection');
  logger.error('Unhandled Rejection at:', {
    promise,
    reason,
  });
});

process.on('uncaughtException', (error) => {
  const logger = new Logger('UncaughtException');
  logger.error('Uncaught Exception:', {
    error: error.message,
    stack: error.stack,
  });
});

bootstrap(); 