import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma, Category } from '@prisma/client';
import { RedisService } from '../redis/redis.service';
import { Logger } from '@nestjs/common';

@Injectable()
export class CategoriesService {
  private readonly CACHE_KEY = 'categories';
  private readonly CACHE_TTL = 3600; // 1 hour in seconds
  private readonly logger = new Logger(CategoriesService.name);

  constructor(
    private prisma: PrismaService,
    private redis: RedisService
  ) {}

  async create(data: Prisma.CategoryCreateInput) {
    try {
      // If parent is provided, verify it exists
      if (data.parent?.connect?.id) {
        const parent = await this.prisma.category.findUnique({
          where: { id: data.parent.connect.id },
        });
        if (!parent) {
          throw new BadRequestException('Parent category not found');
        }
      }

      const category = await this.prisma.category.create({
        data,
        include: {
          parent: true,
          children: true,
        },
      });

      await this.invalidateCache();
      return category;
    } catch (error) {
      this.logger.error('Error creating category:', error);
      throw error;
    }
  }

  async findAll() {
    try {
      // Try to get from cache
      const cachedCategories = await this.redis.get('categories');
      if (cachedCategories && typeof cachedCategories === 'string') {
        return JSON.parse(cachedCategories);
      }

      // Get from database with nested children
      const categories = await this.prisma.category.findMany({
        where: {
          isActive: true,
        },
        include: {
          children: {
            where: {
              isActive: true,
            },
            orderBy: {
              displayOrder: 'asc',
            },
          },
        },
        orderBy: {
          displayOrder: 'asc',
        },
      });

      // Cache the results for 1 hour
      await this.redis.set('categories', JSON.stringify(categories), this.CACHE_TTL);

      return categories;
    } catch (error) {
      this.logger.error('Error fetching categories:', error);
      throw error;
    }
  }

  async findOne(id: string) {
    try {
      const category = await this.prisma.category.findUnique({
        where: { id },
        include: {
          parent: true,
          children: true,
          products: true,
        },
      });

      if (!category) {
        throw new NotFoundException(`Category with ID ${id} not found`);
      }

      return category;
    } catch (error) {
      this.logger.error(`Error fetching category ${id}:`, error);
      throw error;
    }
  }

  async findBySlug(slug: string) {
    try {
      // Try to get from cache
      const cachedCategory = await this.redis.get(`category:${slug}`);
      if (cachedCategory) {
        return cachedCategory;
      }

      const category = await this.prisma.category.findFirst({
        where: {
          slug,
          isActive: true,
        },
        include: {
          children: {
            where: {
              isActive: true,
            },
            orderBy: {
              displayOrder: 'asc',
            },
          },
        },
      });

      if (!category) {
        throw new NotFoundException(`Category with slug ${slug} not found`);
      }

      // Cache the result for 1 hour
      await this.redis.set(`category:${slug}`, category, this.CACHE_TTL);

      return category;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error(`Error fetching category with slug ${slug}:`, error);
      throw error;
    }
  }

  async update(id: string, data: Prisma.CategoryUpdateInput) {
    try {
      // Check if category exists
      const existingCategory = await this.prisma.category.findUnique({
        where: { id },
        include: { children: true, parent: true },
      });

      if (!existingCategory) {
        throw new NotFoundException(`Category with ID ${id} not found`);
      }

      // If updating parent, verify the new parent exists and isn't a child of this category
      if (data.parent?.connect?.id) {
        const newParent = await this.prisma.category.findUnique({
          where: { id: data.parent.connect.id },
          include: { children: true },
        });

        if (!newParent) {
          throw new BadRequestException('Parent category not found');
        }

        // Check for circular reference
        if (this.isCircularReference(existingCategory, newParent.id)) {
          throw new BadRequestException('Circular reference detected in category hierarchy');
        }
      }

      const updatedCategory = await this.prisma.category.update({
        where: { id },
        data,
        include: {
          parent: true,
          children: true,
          products: true,
        },
      });

      await this.invalidateCache();
      return updatedCategory;
    } catch (error) {
      this.logger.error(`Error updating category ${id}:`, error);
      throw error;
    }
  }

  async delete(id: string) {
    try {
      const category = await this.prisma.category.findUnique({
        where: { id },
        include: { children: true },
      });

      if (!category) {
        throw new NotFoundException(`Category with ID ${id} not found`);
      }

      // Check if category has children
      if (category.children.length > 0) {
        throw new BadRequestException('Cannot delete category with subcategories. Please delete subcategories first.');
      }

      await this.prisma.category.delete({
        where: { id },
      });

      await this.invalidateCache();
      return { message: 'Category deleted successfully' };
    } catch (error) {
      this.logger.error(`Error deleting category ${id}:`, error);
      throw error;
    }
  }

  private async invalidateCache() {
    await this.redis.del(this.CACHE_KEY);
  }

  // Helper method to check for circular references in category hierarchy
  private isCircularReference(category: Category & { parent?: Category }, newParentId: string): boolean {
    if (category.id === newParentId) return true;
    if (!category.parent) return false;
    return this.isCircularReference(category.parent, newParentId);
  }

  // Fetch category tree: top-level categories and their children
  async getCategoryTree() {
    try {
      const cacheKey = 'category_tree';
      const cachedTree = await this.redis.get(cacheKey) as string;
      
      if (cachedTree) {
        return JSON.parse(cachedTree);
      }

      this.logger.debug('Fetching fresh category tree from database');
      
      const allCategories = await this.prisma.category.findMany({
        where: { isActive: true },
        include: {
          parent: true,
          children: {
            where: { isActive: true },
            orderBy: { displayOrder: 'asc' },
          },
        },
        orderBy: { displayOrder: 'asc' },
      });

      this.logger.debug(`Found ${allCategories.length} total categories`);

      // Create a map for quick lookup
      const categoryMap = new Map();
      allCategories.forEach(category => {
        categoryMap.set(category.id, {
          ...category,
          children: []
        });
      });

      // Build the tree structure
      const rootCategories = [];
      allCategories.forEach(category => {
        const categoryWithChildren = categoryMap.get(category.id);
        if (category.parentId) {
          const parent = categoryMap.get(category.parentId);
          if (parent) {
            parent.children.push(categoryWithChildren);
          }
        } else {
          rootCategories.push(categoryWithChildren);
        }
      });

      // Cache the tree structure
      await this.redis.set(cacheKey, JSON.stringify(rootCategories), this.CACHE_TTL);
      return rootCategories;
    } catch (error) {
      this.logger.error('Error building category tree:', error);
      throw error;
    }
  }

  async getAllCategories() {
    try {
      const cachedCategories = await this.redis.get(this.CACHE_KEY) as string;
      if (cachedCategories) {
        return JSON.parse(cachedCategories);
      }
      // ... existing code ...
    } catch (error) {
      this.logger.error('Error getting all categories:', error);
      throw error;
    }
  }

  async getCategoryById(id: string) {
    try {
      const cached = await this.redis.get(`category:${id}`) as string;
      if (cached) {
        return JSON.parse(cached);
      }
      // ... existing code ...
    } catch (error) {
      this.logger.error(`Error getting category by id ${id}:`, error);
      throw error;
    }
  }
} 