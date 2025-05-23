import { WebSocketGateway, WebSocketServer, OnGatewayConnection, OnGatewayDisconnect, SubscribeMessage } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { RedisService } from '../services/redis.service';
import { JwtService } from '@nestjs/jwt';

@WebSocketGateway({
  cors: {
    origin: ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:3002'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'Accept',
      'Origin',
      'X-Requested-With',
      'Access-Control-Request-Method',
      'Access-Control-Request-Headers'
    ],
    exposedHeaders: ['Content-Type', 'Authorization'],
    maxAge: 3600,
    preflightContinue: false,
    optionsSuccessStatus: 204
  }
})
@Injectable()
export class ProductGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private viewers: Map<string, Set<string>> = new Map();
  private clientProducts: Map<string, string> = new Map(); // Maps client ID to product ID

  constructor(
    private readonly redisService: RedisService,
    private readonly jwtService: JwtService
  ) {}

  async handleConnection(client: Socket) {
    try {
      // Verify token
      const token = client.handshake.auth.token;
      if (!token) {
        throw new UnauthorizedException('No token provided');
      }

      const payload = await this.jwtService.verifyAsync(token);
      client.data.userId = payload.sub; // Store user ID in socket data
    } catch (error) {
      client.disconnect();
    }
  }

  @SubscribeMessage('joinProduct')
  async handleJoinProduct(client: Socket, payload: { productId: string }) {
    const { productId } = payload;
    if (!productId) return;

    // Leave previous product if any
    const previousProductId = this.clientProducts.get(client.id);
    if (previousProductId) {
      await this.handleLeaveProduct(client, { productId: previousProductId });
    }

    // Join new product room
    client.join(productId);
    this.clientProducts.set(client.id, productId);

    // Add viewer to the product
    if (!this.viewers.has(productId)) {
      this.viewers.set(productId, new Set());
    }
    this.viewers.get(productId).add(client.id);

    // Update Redis and broadcast
    await this.updateViewerCount(productId);

    // Add to recently viewed
    if (client.data.userId) {
      await this.redisService.addRecentlyViewed(client.data.userId, productId);
    }
  }

  @SubscribeMessage('leaveProduct')
  async handleLeaveProduct(client: Socket, payload: { productId: string }) {
    const { productId } = payload;
    if (!productId) return;

    // Leave room
    client.leave(productId);
    this.clientProducts.delete(client.id);

    // Remove viewer
    this.viewers.get(productId)?.delete(client.id);
    
    // Update Redis and broadcast
    await this.updateViewerCount(productId);
  }

  async handleDisconnect(client: Socket) {
    const productId = this.clientProducts.get(client.id);
    if (productId) {
      await this.handleLeaveProduct(client, { productId });
    }
  }

  private async updateViewerCount(productId: string) {
    const count = this.viewers.get(productId)?.size || 0;
    
    // Update Redis
    await this.redisService.setProductViewers(productId, count);

    // Broadcast to all clients viewing this product
    this.server.to(productId).emit('viewerCount', { count });
  }
} 