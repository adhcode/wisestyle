import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RedisService } from '../redis/redis.service';

@Injectable()
export class AdminService {
  constructor(
    private prisma: PrismaService,
    private redisService: RedisService
  ) {}

  async getDashboardData() {
    const [
      stats,
      recentOrders,
      topProducts,
      orderStatus,
      totalUsers,
      totalCategories
    ] = await Promise.all([
      this.getStats(),
      this.getRecentOrders(),
      this.getTopProducts(),
      this.getOrderStatus(),
      this.prisma.user.count(),
      this.prisma.category.count()
    ]);

    return {
      stats,
      recentOrders,
      topProducts,
      orderStatus,
      totalUsers,
      totalCategories
    };
  }

  async getStats() {
    const [
      totalProducts,
      totalCustomers,
      totalOrders,
      totalRevenue
    ] = await Promise.all([
      this.prisma.product.count(),
      this.prisma.user.count({ where: { role: 'USER' } }),
      this.prisma.order.count(),
      this.prisma.order.aggregate({
        _sum: {
          total: true
        }
      })
    ]);

    return {
      totalProducts,
      totalCustomers,
      totalOrders,
      totalRevenue: totalRevenue._sum.total || 0
    };
  }

  async getRecentOrders() {
    return this.prisma.order.findMany({
      take: 5,
      orderBy: {
        createdAt: 'desc'
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          }
        },
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                image: true,
                images: {
                  select: {
                    url: true
                  }
                }
              }
            }
          }
        }
      }
    });
  }

  async getTopProducts() {
    const orderItems = await this.prisma.orderItem.groupBy({
      by: ['productId'],
      _sum: {
        quantity: true,
        price: true
      },
      orderBy: {
        _sum: {
          quantity: 'desc'
        }
      },
      take: 5
    });

    const products = await Promise.all(
      orderItems.map(async (item) => {
        const product = await this.prisma.product.findUnique({
          where: { id: item.productId }
        });
        return {
          id: product?.id || '',
          name: product?.name || '',
          totalSold: item._sum.quantity || 0,
          revenue: (item._sum.price || 0) * (item._sum.quantity || 0)
        };
      })
    );

    return products;
  }

  async getOrderStatus() {
    const statusCounts = await this.prisma.order.groupBy({
      by: ['status'],
      _count: true
    });

    return statusCounts.reduce((acc, curr) => {
      acc[curr.status] = curr._count;
      return acc;
    }, {} as Record<string, number>);
  }

  async getProducts() {
    try {
      // Try to get from cache first
      const cachedProducts = await this.redisService.getCachedProductList();
      if (cachedProducts) {
        return cachedProducts;
      }

      // If not in cache, get from database
      const products = await this.prisma.product.findMany({
        include: {
          category: true,
          sizes: true,
          colors: true,
          images: true,
          inventory: {
            include: {
              size: true,
              color: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      });

      // Cache the products
      await this.redisService.cacheProductList(products, 300); // Cache for 5 minutes

      return products;
    } catch (error) {
      throw new BadRequestException('Error fetching products');
    }
  }

  async getCategories() {
    return this.prisma.category.findMany({
      orderBy: {
        name: 'asc'
      }
    });
  }

  async getUsers() {
    return this.prisma.user.findMany({
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        createdAt: true,
        isEmailVerified: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async getOrders() {
    return this.prisma.order.findMany({
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                price: true,
                image: true,
                images: {
                  select: {
                    url: true
                  }
                }
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }
} 