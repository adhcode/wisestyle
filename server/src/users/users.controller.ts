import { Controller, Get, Post, Delete, UseGuards, Req, Body, Param, Logger } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { UsersService } from './users.service';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  private readonly logger = new Logger(UsersController.name);
  
  constructor(private readonly usersService: UsersService) {}

  @Get('profile')
  async getProfile(@Req() req) {
    return this.usersService.findById(req.user.userId);
  }

  @Get('likes')
  async getUserLikes(@Req() req) {
    try {
      this.logger.log(`Getting likes for user: ${req.user?.userId || req.user?.id}`);
      const userId = req.user?.userId || req.user?.id;
      
      if (!userId) {
        this.logger.error('No user ID found in request');
        return { products: [] };
      }
      
      const likes = await this.usersService.getUserLikes(userId);
      this.logger.log(`Found ${likes.length} likes for user ${userId}`);
      return { products: likes };
    } catch (error) {
      this.logger.error('Error getting user likes:', error);
      // Return empty array if no likes found
      return { products: [] };
    }
  }

  @Post('likes')
  async addLike(@Req() req, @Body() body: { productId: string }) {
    const userId = req.user?.userId || req.user?.id;
    this.logger.log(`Adding like for user ${userId}, product ${body.productId}`);
    return this.usersService.addLike(userId, body.productId);
  }

  @Delete('likes/:productId')
  async removeLike(@Req() req, @Param('productId') productId: string) {
    const userId = req.user?.userId || req.user?.id;
    this.logger.log(`Removing like for user ${userId}, product ${productId}`);
    return this.usersService.removeLike(userId, productId);
  }
} 