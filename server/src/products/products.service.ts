import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma, DisplaySection } from '@prisma/client';
import { CreateProductDto, UpdateProductDto } from './dto';
import { RedisService } from '../redis/redis.service';
import { Logger } from '@nestjs/common';
import { Product, HomepageSection } from './types';

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
        
        // Handle "As Seen" color specially
        const isAsSeen = colorValue === 'As Seen';
        return this.prisma.color.create({
          data: {
            name: colorValue,
            value: colorValue,
            class: isAsSeen ? 'bg-gradient-to-r from-gray-400 to-gray-600' : `bg-[${colorValue}]`
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
          slug: `${name.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}`,
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

  async findAll(page = 1, limit = 10, search?: string) {
    try {
      const skip = (page - 1) * limit;
      
      // Build where clause for search
      const whereClause: Prisma.ProductWhereInput = search ? {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } },
          { category: { name: { contains: search, mode: 'insensitive' } } }
        ]
      } : {};
      
      const [products, total] = await Promise.all([
        this.prisma.product.findMany({
          where: whereClause,
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
        }),
        this.prisma.product.count({ where: whereClause })
      ]);

      return {
        products,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
          hasNext: page < Math.ceil(total / limit),
          hasPrev: page > 1
        }
      };
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

  async findByCategory(slug: string, includeChildren: boolean = false) {
    try {
      // Try to get from cache first
      const cacheKey = `products:category:${slug}:${includeChildren}`;
      const cachedProducts = await this.redisService.get(cacheKey);
      if (cachedProducts) {
        return cachedProducts;
      }

      // Get the category and its children if needed
      const category = await this.prisma.category.findFirst({
        where: { slug },
        include: {
          children: includeChildren,
        },
      });

      if (!category) {
        throw new NotFoundException(`Category with slug ${slug} not found`);
      }

      // Build category IDs to search for
      const categoryIds = [category.id];
      if (includeChildren && category.children) {
        categoryIds.push(...category.children.map(child => child.id));
      }

      // Get products for the category and its children
      const products = await this.prisma.product.findMany({
        where: {
          categoryId: {
            in: categoryIds,
          },
          isActive: true,
        },
        include: {
          category: true,
          sizes: true,
          colors: true,
          inventory: {
            include: {
              size: true,
              color: true,
            },
          },
          images: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
      });

      // Cache the results
      await this.redisService.set(cacheKey, products, 3600); // Cache for 1 hour

      return products;
    } catch (error) {
      this.logger.error(`Error fetching products for category ${slug}:`, error);
      throw error;
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
        sizes: sizeValues,
        colors: colorValues,
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
      let category = null;
      if (categoryId) {
        category = await this.prisma.category.findUnique({
          where: { id: categoryId },
        });
        if (!category) {
          throw new NotFoundException(`Category with ID ${categoryId} not found`);
        }
      }

      // Handle sizes - create or find them
      let sizeConnections = undefined;
      if (sizeValues && sizeValues.length > 0) {
        // Get category type from the provided category or existing product's category
        let categoryType = 'clothing'; // default fallback
        if (category?.type) {
          categoryType = category.type;
        } else if (existingProduct.categoryId) {
          const existingCategory = await this.prisma.category.findUnique({
            where: { id: existingProduct.categoryId }
          });
          categoryType = existingCategory?.type || 'clothing';
        }

        const sizes = await Promise.all(
          sizeValues.map(async (sizeValue: string) => {
            const existingSize = await this.prisma.size.findFirst({
              where: {
                value: sizeValue,
                category: categoryType
              }
            });
            if (existingSize) return existingSize;
            return this.prisma.size.create({
              data: {
                name: sizeValue,
                value: sizeValue,
                category: categoryType
              }
            });
          })
        );
        sizeConnections = { set: sizes.map(size => ({ id: size.id })) };
      } else {
        sizeConnections = { set: [] };
      }

      // Handle colors - create or find them
      let colorConnections = undefined;
      if (colorValues && colorValues.length > 0) {
        const colors = await Promise.all(
          colorValues.map(async (colorValue: string) => {
            const existingColor = await this.prisma.color.findUnique({
              where: { value: colorValue }
            });
            if (existingColor) return existingColor;
            
            // Handle "As Seen" color specially
            const isAsSeen = colorValue === 'As Seen';
            return this.prisma.color.create({
              data: {
                name: colorValue,
                value: colorValue,
                class: isAsSeen ? 'bg-gradient-to-r from-gray-400 to-gray-600' : `bg-[${colorValue}]`
              }
            });
          })
        );
        colorConnections = { set: colors.map(color => ({ id: color.id })) };
      } else {
        colorConnections = { set: [] };
      }

      // Handle images - clear existing and create new ones
      let imageData = undefined;
      if (images && images.length > 0) {
        imageData = {
          deleteMany: {},
          create: images.map(url => ({ url }))
        };
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
          slug: name ? `${name.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}` : undefined,
          category: categoryId ? {
            connect: { id: categoryId }
          } : undefined,
          image,
          images: imageData,
          sizes: sizeConnections,
          colors: colorConnections,
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
          displaySection: displaySection ? DisplaySection[displaySection] : undefined,
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
      this.logger.error('Error updating product:', error);
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

    // Use a transaction to ensure all related data is deleted properly
    return this.prisma.$transaction(async (tx) => {
      // Delete related order items first
      await tx.orderItem.deleteMany({
        where: { productId: id }
      });

      // Delete related images
      await tx.image.deleteMany({
        where: { productId: id }
      });

      // Delete related inventory
      await tx.productInventory.deleteMany({
        where: { productId: id }
      });

      // Delete the product (this will also remove the many-to-many relationships with sizes and colors)
      const deletedProduct = await tx.product.delete({
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

      // Invalidate homepage sections cache
      await this.redisService.del('homepage_sections');

      return deletedProduct;
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

  async getFeatured(): Promise<Product[]> {
    const cachedProducts = await this.redisService.get<Product[]>('featured_products');
    if (cachedProducts) {
      return cachedProducts;
    }

    // Get featured products (new arrivals and limited edition items)
    const products = await this.prisma.product.findMany({
      where: {
        OR: [
          { displaySection: DisplaySection.NEW_ARRIVAL },
          { isLimited: true }
        ]
      },
      include: {
        images: true,
        category: true
      }
    });

    // Map to Product interface
    const mappedProducts = products.map(product => ({
      ...product,
      isNewArrival: product.displaySection === DisplaySection.NEW_ARRIVAL,
      isLimitedEdition: product.isLimited,
      isBestSeller: product.displaySection === DisplaySection.TRENDING
    }));

    // Cache the results for 1 hour
    await this.redisService.set('featured_products', mappedProducts, 3600);
    return mappedProducts;
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

  async getHomepageSections(): Promise<HomepageSection[]> {
    // Clear any stale cache
    await this.redisService.del('homepage_sections');
    this.logger.debug('Fetching homepage sections...');

    // Get products from database with all necessary relations
    const products = await this.prisma.product.findMany({
      include: {
        images: true,
        category: true,
        sizes: true,
        colors: true,
        inventory: {
          include: {
            size: true,
            color: true
          }
        }
      },
      where: {
        OR: [
          { displaySection: DisplaySection.NEW_ARRIVAL },
          { displaySection: DisplaySection.TRENDING },
          { isLimited: true }
        ]
      }
    });

    this.logger.debug(`Found ${products.length} products`);

    // Map products to Product interface
    const mappedProducts = products.map(product => ({
      ...product,
      isNewArrival: product.displaySection === DisplaySection.NEW_ARRIVAL,
      isLimitedEdition: product.isLimited,
      isBestSeller: product.displaySection === DisplaySection.TRENDING
    }));

    // Create sections
    const sections: HomepageSection[] = [
      {
        id: 'new-arrivals',
        title: 'New Arrivals',
        products: mappedProducts.filter(p => p.displaySection === DisplaySection.NEW_ARRIVAL)
      },
      {
        id: 'limited-edition',
        title: 'Limited Edition',
        products: mappedProducts.filter(p => p.isLimited)
      },
      {
        id: 'best-sellers',
        title: 'Best Sellers',
        products: mappedProducts.filter(p => p.displaySection === DisplaySection.TRENDING)
      }
    ];

    this.logger.debug('Homepage sections:', sections);

    // Cache the results for 1 hour
    await this.redisService.set('homepage_sections', sections, 3600);
    return sections;
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

      // Find "cool with" products from OTHER categories (different from current product)
      const relatedProducts = await this.prisma.product.findMany({
        where: {
          AND: [
            { id: { not: productId } }, // Exclude current product
            { categoryId: { not: currentProduct.categoryId } }, // Different category
            { isActive: true }
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

  async findByCategorySlug(slug: string, includeChildren: boolean = false) {
    try {
      // First, find the category by slug
      const category = await this.prisma.category.findFirst({
        where: { slug, isActive: true },
        include: {
          children: {
            where: { isActive: true },
            select: { id: true }
          },
          parent: {
            where: { isActive: true },
            select: { id: true }
          }
        }
      });

      if (!category) {
        throw new NotFoundException(`Category with slug ${slug} not found`);
      }

      // Get all category IDs to search for
      const categoryIds = [category.id];
      
      // Include parent's products if this is a child category
      if (category.parent) {
        categoryIds.push(category.parent.id);
      }
      
      // Include children's products if requested
      if (includeChildren && category.children.length > 0) {
        categoryIds.push(...category.children.map(child => child.id));
      }

      // Find all products in the category and its children
      const products = await this.prisma.product.findMany({
        where: {
          isActive: true,
          categoryId: {
            in: categoryIds
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

      return products;
    } catch (error) {
      this.logger.error(`Error finding products by category slug ${slug}:`, error);
      throw error;
    }
  }
} 