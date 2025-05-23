import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma, Order } from '@prisma/client';
import { MailService } from '../mail/mail.service';

type OrderStatus = 'PENDING' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';

@Injectable()
export class OrdersService {
    private readonly logger = new Logger(OrdersService.name);

    constructor(
        private readonly prisma: PrismaService,
        private readonly mailService: MailService,
    ) {}

    async findAll() {
        return this.prisma.order.findMany({
            include: {
                user: true,
                items: {
                    include: {
                        product: true,
                    },
                },
            },
        });
    }

    async findOne(id: string) {
        return this.prisma.order.findUnique({
            where: { id },
            include: {
                user: true,
                items: {
                    include: {
                        product: true,
                    },
                },
            },
        });
    }

    async findByUser(userId: string) {
        return this.prisma.order.findMany({
            where: { userId },
            include: {
                items: {
                    include: {
                        product: true,
                    },
                },
            },
        });
    }

    async create(data: Prisma.OrderCreateInput) {
        try {
            this.logger.log('Creating order with data:', JSON.stringify(data, null, 2));

            // Create the order
            const order = await this.prisma.order.create({
                data: {
                    status: 'PENDING',
                    total: data.total,
                    shippingAddress: data.shippingAddress as any,
                    billingAddress: data.billingAddress as any,
                    shippingMethod: data.shippingMethod,
                    shippingCost: data.shippingCost,
                    email: data.email,
                    phone: data.phone,
                    items: {
                        create: Array.isArray(data.items.create) 
                            ? data.items.create.map(item => ({
                                product: { connect: { id: item.product.connect.id } },
                                quantity: item.quantity,
                                price: item.price,
                                color: item.color || '',
                                size: item.size || ''
                            }))
                            : [{
                                product: { connect: { id: data.items.create.product.connect.id } },
                                quantity: data.items.create.quantity,
                                price: data.items.create.price,
                                color: data.items.create.color || '',
                                size: data.items.create.size || ''
                            }]
                    }
                },
                include: {
                    items: {
                        include: {
                            product: true
                        }
                    }
                }
            });

            this.logger.log('Order created successfully:', order);

            // Send order confirmation email
            try {
                await this.mailService.sendOrderConfirmationEmail(data.email, order);
                this.logger.log('Order confirmation email sent successfully');
            } catch (error) {
                this.logger.error('Failed to send order confirmation email:', error);
                // Don't throw the error as the order was created successfully
            }

            return order;
        } catch (error) {
            this.logger.error('Error creating order:', error);
            throw error;
        }
    }

    async update(id: string, data: Prisma.OrderUpdateInput) {
        return this.prisma.order.update({
            where: { id },
            data,
            include: {
                user: true,
                items: {
                    include: {
                        product: true,
                    },
                },
            },
        });
    }

    async delete(id: string) {
        return this.prisma.order.delete({
            where: { id },
        });
    }

    async updateStatus(id: string, status: string) {
        return this.prisma.order.update({
            where: { id },
            data: { status: status as any }
        });
    }

    async getOrdersByStatus(status: string) {
        return this.prisma.order.findMany({
            where: { status: status as any },
            include: {
                items: {
                    include: {
                        product: true
                    }
                }
            }
        });
    }

    async getOrderStats() {
        const total = await this.prisma.order.count();
        const pending = await this.prisma.order.count({
            where: { status: 'PENDING' }
        });
        const processing = await this.prisma.order.count({
            where: { status: 'PROCESSING' }
        });
        const shipped = await this.prisma.order.count({
            where: { status: 'SHIPPED' }
        });
        const delivered = await this.prisma.order.count({
            where: { status: 'DELIVERED' }
        });

        return {
            total,
            pending,
            processing,
            shipped,
            delivered
        };
    }
} 