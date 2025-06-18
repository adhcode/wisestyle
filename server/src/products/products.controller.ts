import { Controller, Get, Post, Body, Patch, Param, Delete, Query, BadRequestException } from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto, UpdateProductDto } from './dto';
import { Public } from '../decorators/public.decorator';
import { RedisService } from '../redis/redis.service';
import { Logger } from '@nestjs/common';

@Controller('products')
export class ProductsController {
  private readonly logger = new Logger(ProductsController.name);

  constructor(
    private readonly productsService: ProductsService,
    private readonly redisService: RedisService
  ) {}

  @Post()
  create(@Body() createProductDto: CreateProductDto) {
    return this.productsService.create(createProductDto);
  }

  @Public()
  @Get()
  findAll(@Query('page') page = '1', @Query('limit') limit = '10') {
    return this.productsService.findAll(parseInt(page), parseInt(limit));
  }

  @Public()
  @Get('featured')
  getFeatured() {
    return this.productsService.getFeatured();
  }

  @Public()
  @Get('new-arrivals')
  findNewArrivals() {
    return this.productsService.findNewArrivals();
  }

  @Public()
  @Get('limited-edition')
  findLimitedEdition() {
    return this.productsService.findLimitedEdition();
  }

  @Public()
  @Get('category/:slug')
  findByCategory(
    @Param('slug') slug: string,
    @Query('includeChildren') includeChildren: boolean = false
  ) {
    return this.productsService.findByCategorySlug(slug, includeChildren);
  }

  @Public()
  @Get('slug/:slug')
  findBySlug(@Param('slug') slug: string) {
    this.logger.debug(`Finding product by slug: ${slug}`);
    return this.productsService.findBySlug(slug);
  }

  @Public()
  @Get('id/:id')
  findOne(@Param('id') id: string) {
    return this.productsService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateProductDto: UpdateProductDto) {
    return this.productsService.update(id, updateProductDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.productsService.remove(id);
  }

  @Public()
  @Post('check-inventory')
  async checkInventory(
    @Body() data: { productId: string; size: string; color: string; quantity: number }
  ) {
    return this.productsService.checkInventory(
      data.productId,
      data.size,
      data.color,
      data.quantity
    );
  }

  @Public()
  @Get('slug/:slug/similar')
  findSimilar(@Param('slug') slug: string) {
    return this.productsService.findSimilar(slug);
  }

  @Public()
  @Get('homepage-sections')
  async getHomepageSections() {
    return this.productsService.getHomepageSections();
  }

  @Public()
  @Get(':id/related')
  getRelatedProducts(
    @Param('id') id: string,
    @Query('limit') limit = '4'
  ) {
    return this.productsService.getRelatedProducts(id, parseInt(limit));
  }
} 