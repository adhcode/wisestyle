import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { Prisma, User } from '@prisma/client';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);
  
  constructor(private prisma: PrismaService) {}

  async findById(id: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { id },
    });
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { email },
    });
  }

  async create(data: Prisma.UserCreateInput): Promise<User> {
    const hashedPassword = await bcrypt.hash(data.password, 10);
    
    return this.prisma.user.create({
      data: {
        ...data,
        password: hashedPassword,
      },
    });
  }

  async update(id: string, data: {
    email?: string;
    firstName?: string;
    lastName?: string;
    password?: string;
  }): Promise<User> {
    if (data.password) {
      data.password = await bcrypt.hash(data.password, 10);
    }
    
    return this.prisma.user.update({
      where: { id },
      data,
    });
  }

  async getUserLikes(userId: string): Promise<string[]> {
    try {
      this.logger.log(`Fetching likes for user: ${userId}`);
      
      // For now, return empty array since we don't have likes table yet
      // TODO: Implement proper likes table when database migration is safe
      this.logger.log(`Likes feature not yet implemented in database - returning empty array`);
      return [];
    } catch (error) {
      this.logger.error(`Error fetching likes for user ${userId}:`, error);
      return [];
    }
  }

  async addLike(userId: string, productId: string): Promise<void> {
    try {
      this.logger.log(`Add like requested for user ${userId} on product ${productId}`);
      // For now, just log the action since we don't have likes table yet
      // TODO: Implement proper likes table when database migration is safe
      this.logger.log(`Likes feature not yet implemented in database - action logged only`);
    } catch (error) {
      this.logger.error(`Error adding like for user ${userId} on product ${productId}:`, error);
      throw error;
    }
  }

  async removeLike(userId: string, productId: string): Promise<void> {
    try {
      this.logger.log(`Remove like requested for user ${userId} on product ${productId}`);
      // For now, just log the action since we don't have likes table yet
      // TODO: Implement proper likes table when database migration is safe
      this.logger.log(`Likes feature not yet implemented in database - action logged only`);
    } catch (error) {
      this.logger.error(`Error removing like for user ${userId} on product ${productId}:`, error);
      throw error;
    }
  }
} 