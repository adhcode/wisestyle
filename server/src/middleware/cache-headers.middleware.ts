import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class CacheHeadersMiddleware implements NestMiddleware {
    use(req: Request, res: Response, next: NextFunction) {
        // Skip caching for non-GET requests
        if (req.method !== 'GET') {
            next();
            return;
        }

        // Set cache control headers based on the route
        if (req.path.startsWith('/api/products') || req.path.startsWith('/api/categories')) {
            // Cache product and category data for 1 hour
            res.setHeader('Cache-Control', 'public, max-age=3600');
        } else if (req.path.startsWith('/api/static')) {
            // Cache static assets for 1 day
            res.setHeader('Cache-Control', 'public, max-age=86400');
        } else {
            // No caching for other routes
            res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
            res.setHeader('Pragma', 'no-cache');
            res.setHeader('Expires', '0');
        }

        // Add ETag header
        const etag = this.generateETag(req);
        res.setHeader('ETag', etag);

        // Check if client sent If-None-Match header
        const ifNoneMatch = req.headers['if-none-match'];
        if (ifNoneMatch === etag) {
            res.status(304).end();
            return;
        }

        next();
    }

    private generateETag(req: Request): string {
        // Generate a simple ETag based on the request URL and query parameters
        const url = req.url;
        const query = JSON.stringify(req.query);
        return `"${Buffer.from(url + query).toString('base64')}"`;
    }
} 