import { Controller, Get, Param, Put, Body, Post, UseGuards, HttpCode, HttpStatus, Logger, Req } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { Prisma } from '@prisma/client';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../auth/enums/role.enum';
import { Public } from '../decorators/public.decorator';

type OrderStatus = 'PENDING' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';

@Controller('orders')
export class OrdersController {
    private readonly logger = new Logger(OrdersController.name);

    constructor(private readonly ordersService: OrdersService) {}

    @Public()
    @Get('test')
    @HttpCode(HttpStatus.OK)
    async testEndpoint() {
        this.logger.log('Test endpoint called');
        return {
            message: 'Orders endpoint is working',
            timestamp: new Date().toISOString(),
            status: 'success'
        };
    }

    @Public()
    @Post()
    @HttpCode(HttpStatus.CREATED)
    async create(@Body() createOrderDto: CreateOrderDto) {
        this.logger.log('Creating order with data:', JSON.stringify(createOrderDto, null, 2));

        try {
            const orderData: Prisma.OrderCreateInput = {
                status: 'PENDING',
                total: createOrderDto.total,
                shippingAddress: createOrderDto.shippingAddress as any,
                billingAddress: createOrderDto.billingAddress as any,
                shippingMethod: createOrderDto.shippingMethod,
                shippingCost: createOrderDto.shippingCost,
                email: createOrderDto.email,
                phone: createOrderDto.phone,
                items: {
                    create: createOrderDto.items.map(item => ({
                        product: { connect: { id: item.productId } },
                        quantity: item.quantity,
                        price: item.price,
                        color: item.color || '',
                        size: item.size || ''
                    }))
                }
            };

            this.logger.log('Processed order data:', JSON.stringify(orderData, null, 2));
            const order = await this.ordersService.create(orderData);
            this.logger.log('Order created successfully:', order);
            return order;
        } catch (error) {
            this.logger.error('Error creating order:', error);
            throw error;
        }
    }

    @Get()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.ADMIN)
    async findAll() {
        return this.ordersService.findAll();
    }

    @Get('my-orders')
    @UseGuards(JwtAuthGuard)
    async findMyOrders(@Req() req) {
        return this.ordersService.findByUser(req.user.id);
    }

    @Get('stats')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.ADMIN)
    getStats() {
        return this.ordersService.getOrderStats();
    }

    @Get(':id')
    @UseGuards(JwtAuthGuard)
    async findOne(@Param('id') id: string, @Req() req) {
        const order = await this.ordersService.findOne(id);
        if (!order) {
            throw new Error('Order not found');
        }
        
        // Allow admin to access any order
        if (req.user.role === Role.ADMIN) {
            return order;
        }
        
        // Regular users can only access their own orders
        if (order.userId !== req.user.id) {
            throw new Error('Unauthorized to access this order');
        }
        
        return order;
    }

    @Get('status/:status')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.ADMIN)
    findByStatus(@Param('status') status: OrderStatus) {
        return this.ordersService.getOrdersByStatus(status);
    }

    @Put(':id/status')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.ADMIN)
    updateStatus(
        @Param('id') id: string,
        @Body() body: { status: OrderStatus },
    ) {
        return this.ordersService.updateStatus(id, body.status);
    }
} 