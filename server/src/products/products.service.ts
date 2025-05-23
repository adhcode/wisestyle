import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma, DisplaySection } from '@prisma/client';
import { CreateProductDto, UpdateProductDto } from './dto';
import { RedisService } from '../redis/redis.service';
import { Logger } from '@nestjs/common';

@Injectable()
export class ProductsService {
  private readonly logger = new Logger(ProductsService.name);

  constructor(
    private prisma: PrismaService,
    private redisService: RedisService
  ) {}

  async create(createProductDto: CreateProductDto) {
    try {
      const {
        name,
        description,
        price,
        originalPrice,
        discount,
        categoryId,
        image,
        images,
        sizes,
        colors,
        tags,
        isLimited,
        inventory,
        displaySection,
      } = createProductDto;

      // Validate price and discount
      if (price < 0) {
        throw new Error('Price cannot be negative');
      }
      if (discount && (discount < 0 || discount > 100)) {
        throw new Error('Discount must be between 0 and 100');
      }

      // Check if category exists
      const category = await this.prisma.category.findUnique({
        where: { id: categoryId },
      });
      if (!category) {
        throw new NotFoundException(`Category with ID ${categoryId} not found`);
      }

      // Create or find sizes
      const sizePromises = sizes.map(async (sizeValue) => {
        const existingSize = await this.prisma.size.findFirst({
          where: {
            value: sizeValue,
            category: category.type
          }
        });
        if (existingSize) return existingSize;
        return this.prisma.size.create({
          data: {
            name: sizeValue,
            value: sizeValue,
            category: category.type
          }
        });
      });
      const createdSizes = await Promise.all(sizePromises);

      // Create or find colors
      const colorPromises = colors.map(async (colorValue) => {
        const existingColor = await this.prisma.color.findUnique({
          where: { value: colorValue }
        });
        if (existingColor) return existingColor;
        return this.prisma.color.create({
          data: {
            name: colorValue,
            value: colorValue,
            class: `bg-[${colorValue}]`
          }
        });
      });
      const createdColors = await Promise.all(colorPromises);

      // Create product with inventory
      const product = await this.prisma.product.create({
        data: {
          name,
          description,
          price,
          originalPrice,
          discount,
          slug: name.toLowerCase().replace(/\s+/g, '-'),
          category: {
            connect: { id: categoryId }
          },
          image,
          images: images ? {
            create: images.map(url => ({ url }))
          } : undefined,
          sizes: {
            connect: createdSizes.map(size => ({ id: size.id }))
          },
          colors: {
            connect: createdColors.map(color => ({ id: color.id }))
          },
          tags,
          isLimited,
          inventory: inventory ? {
            create: inventory.map(item => ({
              sizeId: createdSizes.find(s => s.value === item.sizeId)?.id || '',
              colorId: createdColors.find(c => c.value === item.colorId)?.id || '',
              quantity: item.quantity
            }))
          } : undefined,
          displaySection: DisplaySection[displaySection],
        },
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
      });

      // Invalidate homepage sections cache
      await this.redisService.del('homepage_sections');

      return product;
    } catch (error) {
      throw error;
    }
  }

  async findAll(page = 1, limit = 10) {
    try {
      const skip = (page - 1) * limit;
      return this.prisma.product.findMany({
        skip,
        take: limit,
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
    } catch (error) {
      throw new BadRequestException('Error fetching products');
    }
  }

  async findFeatured() {
    try {
      return this.prisma.product.findMany({
        where: {
          displaySection: DisplaySection.TRENDING,
        },
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
    } catch (error) {
      throw new BadRequestException('Error fetching featured products');
    }
  }

  async findNewArrivals() {
    try {
      return this.prisma.product.findMany({
        where: {
          displaySection: DisplaySection.NEW_ARRIVAL,
        },
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
        },
        take: 10,
      });
    } catch (error) {
      throw new BadRequestException('Error fetching new arrivals');
    }
  }

  async findLimitedEdition() {
    try {
      return this.prisma.product.findMany({
        where: {
          isLimited: true,
        },
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
      });
    } catch (error) {
      throw new BadRequestException('Error fetching limited edition products');
    }
  }

  async findByCategory(category: string) {
    try {
      const categoryExists = await this.prisma.category.findFirst({
        where: { slug: category }
      });

      if (!categoryExists) {
        throw new NotFoundException(`Category ${category} not found`);
      }

      return this.prisma.product.findMany({
        where: {
          category: {
            slug: category
          }
        },
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
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException('Error fetching products by category');
    }
  }

  async findBySlug(slug: string) {
    try {
      // Try to get from cache first
      const cachedProduct = await this.redisService.getCachedProduct(slug);
      if (cachedProduct) {
        return cachedProduct;
      }

      // Get from database
      const product = await this.prisma.product.findUnique({
        where: { slug },
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
        }
      });

      if (!product) {
        throw new NotFoundException(`Product with slug ${slug} not found`);
      }

      // Cache the product
      await this.redisService.cacheProduct(slug, product, 3600); // Cache for 1 hour

      return product;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException('Error fetching product by slug');
    }
  }

  async findOne(id: string) {
    const product = await this.prisma.product.findUnique({
      where: { id },
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
    });

    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }

    return product;
  }

  async update(id: string, updateProductDto: UpdateProductDto) {
    try {
      const {
        name,
        description,
        price,
        originalPrice,
        discount,
        categoryId,
        image,
        images,
        sizes,
        colors,
        tags,
        isLimited,
        inventory,
        displaySection,
      } = updateProductDto;

      // Check if product exists
      const existingProduct = await this.prisma.product.findUnique({
        where: { id },
      });
      if (!existingProduct) {
        throw new NotFoundException(`Product with ID ${id} not found`);
      }

      // Validate price and discount if provided
      if (price !== undefined && price < 0) {
        throw new Error('Price cannot be negative');
      }
      if (discount !== undefined && (discount < 0 || discount > 100)) {
        throw new Error('Discount must be between 0 and 100');
      }

      // Check if category exists if categoryId is provided
      if (categoryId) {
        const category = await this.prisma.category.findUnique({
          where: { id: categoryId },
        });
        if (!category) {
          throw new NotFoundException(`Category with ID ${categoryId} not found`);
        }
      }

      // Update product with inventory
      const product = await this.prisma.product.update({
        where: { id },
        data: {
          name,
          description,
          price,
          originalPrice,
          discount,
          category: categoryId ? {
            connect: { id: categoryId }
          } : undefined,
          image,
          images: images ? {
            create: images.map(url => ({ url }))
          } : undefined,
          sizes: sizes ? {
            set: sizes.map(id => ({ id }))
          } : undefined,
          colors: colors ? {
            set: colors.map(color => ({ value: color }))
          } : undefined,
          tags,
          isLimited,
          inventory: inventory ? {
            deleteMany: {},
            create: inventory.map(item => ({
              sizeId: item.sizeId,
              colorId: item.colorId,
              quantity: item.quantity
            }))
          } : undefined,
          displaySection: DisplaySection[displaySection],
        },
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
      });

      // Invalidate homepage sections cache
      await this.redisService.del('homepage_sections');

      return product;
    } catch (error) {
      throw error;
    }
  }

  async remove(id: string) {
    // Check if product exists
    const product = await this.prisma.product.findUnique({
      where: { id },
    });
    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }

    return this.prisma.product.delete({
      where: { id },
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
    });
  }

  async checkInventory(productId: string, sizeId: string, colorId: string, quantity: number) {
    const inventory = await this.prisma.productInventory.findFirst({
      where: {
        productId,
        sizeId,
        colorId,
      },
    });

    if (!inventory) {
      throw new NotFoundException('Inventory not found for this combination');
    }

    if (inventory.quantity < quantity) {
      throw new BadRequestException('Not enough stock available');
    }

    return inventory;
  }

  async updateInventory(productId: string, sizeId: string, colorId: string, quantity: number) {
    return this.prisma.productInventory.update({
      where: {
        productId_sizeId_colorId: {
          productId,
          sizeId,
          colorId,
        },
      },
      data: {
        quantity: {
          decrement: quantity,
        },
      },
    });
  }

  async getFeatured() {
    // Try to get from cache first
    const cachedProducts = await this.redisService.get('featured_products');
    if (cachedProducts) {
      return JSON.parse(cachedProducts);
    }

    // Get featured products (new arrivals and limited edition items)
    const products = await this.prisma.product.findMany({
      where: {
        OR: [
          { displaySection: DisplaySection.NEW_ARRIVAL },
          { isLimited: true },
        ],
      },
      include: {
        category: true,
        sizes: true,
        colors: true,
        images: true,
        inventory: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 8,
    });

    // Cache the results
    await this.redisService.set('featured_products', JSON.stringify(products), 3600); // Cache for 1 hour

    return products;
  }

  async findSimilar(slug: string) {
    try {
        // Get the product to get its category
        const product = await this.findBySlug(slug);
        if (!product) {
            throw new NotFoundException(`Product with slug ${slug} not found`);
        }

        // Get similar products from the same category
        return this.prisma.product.findMany({
            where: {
                categoryId: product.categoryId,
                id: { not: product.id }
            },
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
            take: 4
        });
    } catch (error) {
        if (error instanceof NotFoundException) {
            throw error;
        }
        throw new BadRequestException('Error fetching similar products');
    }
  }

  async getHomepageSections() {
    try {
      // Try to get from cache first
      const cachedSections = await this.redisService.get('homepage_sections');
      if (cachedSections) {
        return JSON.parse(cachedSections);
      }

      // Get products from database
      const products = await this.prisma.product.findMany({
        where: {
          displaySection: { not: 'NONE' }
        },
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

      // Group products by section
      const grouped = {
        NEW_ARRIVALS: [],
        WORK_WEEKEND: [],
        EFFORTLESS: []
      };

      for (const product of products) {
        if (grouped[product.displaySection]) {
          grouped[product.displaySection].push(product);
        }
      }

      // Cache the grouped sections
      await this.redisService.set('homepage_sections', JSON.stringify(grouped), 3600); // Cache for 1 hour

      return grouped;
    } catch (error) {
      this.logger.error('Error fetching homepage sections:', error);
      throw new BadRequestException('Error fetching homepage sections');
    }
  }

  async getRelatedProducts(productId: string, limit = 4) {
    try {
      // Get the current product
      const currentProduct = await this.prisma.product.findUnique({
        where: { id: productId },
        include: { category: true }
      });

      if (!currentProduct) {
        throw new NotFoundException('Product not found');
      }

      // Find related products based on category and tags
      const relatedProducts = await this.prisma.product.findMany({
        where: {
          AND: [
            { id: { not: productId } }, // Exclude current product
            {
              OR: [
                { categoryId: currentProduct.categoryId }, // Same category
                { tags: { hasSome: currentProduct.tags } } // Shared tags
              ]
            }
          ]
        },
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
        take: limit,
        orderBy: {
          createdAt: 'desc'
        }
      });

      return relatedProducts;
    } catch (error) {
      this.logger.error(`Error getting related products: ${error.message}`);
      throw new BadRequestException('Error fetching related products');
    }
  }
} 