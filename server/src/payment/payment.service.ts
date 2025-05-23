import { Injectable, Logger, NotFoundException, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { OrdersService } from '../orders/orders.service';
import { UsersService } from '../users/users.service';
import { NotificationService } from '../notification/notification.service';
import axios from 'axios';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';
import { RedisService } from '../redis/redis.service';
import { Prisma, PaymentStatus, RefundStatus, TransactionStatus, NotificationStatus } from '@prisma/client';
import { FlutterwaveWebhookDto } from './dto/flutterwave.dto';
import { CreateRefundDto, UpdateRefundDto } from './dto/refund.dto';
import { createHmac } from 'crypto';

// Import Flutterwave using require as per documentation
const Flutterwave = require('flutterwave-node-v3');

type PaymentMetadata = {
    orderId?: string;
    email?: string;
    transactionId?: string;
    verificationResponse?: any;
    paymentData?: any;
    phone: string;
    name: string;
    paymentMethod?: 'card' | 'bank_transfer' | 'ng';
};

@Injectable()
export class PaymentService {
    private readonly logger = new Logger(PaymentService.name);
    private readonly flutterwave: any;
    private readonly paystackSecretKey: string;
    private readonly paystackBaseUrl: string;
    private readonly CACHE_TTL = 3600; // 1 hour

    constructor(
        private configService: ConfigService,
        private ordersService: OrdersService,
        private usersService: UsersService,
        private readonly prisma: PrismaService,
        private readonly redis: RedisService,
        private readonly notificationService: NotificationService,
    ) {
        const publicKey = this.configService.get('FLUTTERWAVE_PUBLIC_KEY');
        const secretKey = this.configService.get('FLUTTERWAVE_SECRET_KEY');
        
        if (!publicKey || !secretKey) {
            throw new Error('Flutterwave API keys are not configured');
        }

        this.flutterwave = new Flutterwave(publicKey, secretKey);
        this.paystackSecretKey = this.configService.get<string>('PAYSTACK_SECRET_KEY') || '';
        this.paystackBaseUrl = this.configService.get<string>('PAYSTACK_BASE_URL') || 'https://api.paystack.co';
    }

    async create(createPaymentDto: CreatePaymentDto & { userId: string }) {
        return this.prisma.payment.create({
            data: {
                ...createPaymentDto,
                status: PaymentStatus.PENDING,
            },
        });
    }

    async findAll(userId: string) {
        return this.prisma.payment.findMany({
            where: { userId },
            include: {
                order: true,
                refunds: true,
            },
        });
    }

    async findOne(id: string) {
        const payment = await this.prisma.payment.findUnique({
            where: { id },
            include: {
                order: true,
                refunds: true,
            },
        });

        if (!payment) {
            throw new NotFoundException(`Payment with ID ${id} not found`);
        }

        return payment;
    }

    async update(id: string, updatePaymentDto: UpdatePaymentDto) {
        return this.prisma.payment.update({
            where: { id },
            data: updatePaymentDto,
        });
    }

    async remove(id: string) {
        return this.prisma.payment.delete({
            where: { id },
        });
    }

    async processPayment(id: string) {
        const payment = await this.findOne(id);
        
        if (payment.status !== PaymentStatus.PENDING) {
            throw new BadRequestException('Payment is not in pending status');
        }

        // Process payment logic here
        return this.prisma.payment.update({
            where: { id },
            data: { status: PaymentStatus.COMPLETED },
        });
    }

    async verifyPayment(reference: string) {
        // Verify payment logic here
        return this.prisma.payment.findFirst({
            where: { transactionId: reference },
        });
    }

    private async createPaymentRecord(data: {
        orderId: string;
        amount: number;
        currency: string;
        provider: string;
        paymentMethod: string;
        transactionId: string;
        metadata: any;
    }) {
        return this.prisma.payment.create({
            data: {
                ...data,
                status: PaymentStatus.PENDING,
            },
        });
    }

    async initializeFlutterwavePayment(orderId: string, amount: number, email: string, paymentMethod: 'card' | 'bank_transfer' | 'ng' = 'card') {
        try {
            const order = await this.ordersService.findOne(orderId);
            if (!order) {
                throw new NotFoundException(`Order with ID ${orderId} not found`);
            }

            const response = await this.flutterwave.Charge.initiate({
                tx_ref: `TX-${orderId}-${Date.now()}`,
                    amount,
                currency: 'NGN',
                payment_options: paymentMethod,
                redirect_url: `${this.configService.get('FRONTEND_URL')}/payment/verify`,
                customer: {
                    email,
                    name: order.email,
                    phone_number: order.phone,
                },
                customizations: {
                    title: 'WiseStyle Payment',
                    description: `Payment for order ${orderId}`,
                    logo: `${this.configService.get('FRONTEND_URL')}/logo.png`,
                },
                meta: {
                    orderId,
                },
            });

            if (response.status === 'success') {
                await this.createPaymentRecord({
                    orderId,
                    amount,
                    currency: 'NGN',
                    provider: 'flutterwave',
                    paymentMethod,
                    transactionId: response.data.tx_ref,
                        metadata: {
                        orderId,
                        email,
                        transactionId: response.data.tx_ref,
                        paymentData: response.data,
                        phone: order.phone,
                        name: order.email,
                    },
                });

                return response;
            }

            throw new BadRequestException('Failed to initialize payment');
        } catch (error) {
            this.logger.error('Error initializing Flutterwave payment:', error);
            throw error;
        }
    }

    async initializePaystackPayment(orderId: string, amount: number, email: string) {
        try {
            const order = await this.ordersService.findOne(orderId);
            if (!order) {
                throw new NotFoundException(`Order with ID ${orderId} not found`);
            }

            const response = await axios.post(
                `${this.paystackBaseUrl}/transaction/initialize`,
                {
                    amount: amount * 100, // Convert to kobo
                    email,
                    callback_url: `${this.configService.get('FRONTEND_URL')}/payment/verify`,
                    metadata: {
                        orderId,
                        custom_fields: [
                            {
                                display_name: 'Order ID',
                                variable_name: 'order_id',
                                value: orderId,
                            },
                        ],
                    },
                },
                {
                    headers: {
                        Authorization: `Bearer ${this.paystackSecretKey}`,
                        'Content-Type': 'application/json',
                    },
                }
            );

            if (response.data.status) {
                await this.createPaymentRecord({
                    orderId,
                    amount,
                    currency: 'NGN',
                    provider: 'paystack',
                    paymentMethod: 'card',
                    transactionId: response.data.data.reference,
                    metadata: {
                        orderId,
                        email,
                        transactionId: response.data.data.reference,
                        paymentData: response.data.data,
                        phone: order.phone,
                        name: order.email,
                    },
                });

            return response.data;
            }

            throw new BadRequestException('Failed to initialize payment');
        } catch (error) {
            this.logger.error('Error initializing Paystack payment:', error);
            throw error;
        }
    }

    async verifyFlutterwavePayment(transactionId: string) {
        try {
            const response = await this.flutterwave.Transaction.verify({ id: transactionId });
            
            if (response.status === 'success' && response.data.status === 'successful') {
            const payment = await this.prisma.payment.findFirst({
                    where: { transactionId: response.data.tx_ref },
                });

                if (!payment) {
                    throw new NotFoundException('Payment not found');
                }

                // Update payment status
                await this.prisma.payment.update({
                    where: { id: payment.id },
                    data: {
                        status: PaymentStatus.COMPLETED,
                        metadata: {
                            ...(payment.metadata as PaymentMetadata),
                            verificationResponse: response.data,
                        } as PaymentMetadata,
                    },
                });

                // Update order status
                await this.ordersService.update(payment.orderId, {
                    status: 'PROCESSING',
                });

                return response.data;
            }

            throw new BadRequestException('Payment verification failed');
        } catch (error) {
            this.logger.error('Error verifying Flutterwave payment:', error);
            throw error;
        }
    }

    async verifyPaystackPayment(reference: string) {
        try {
            const response = await axios.get(
                `${this.paystackBaseUrl}/transaction/verify/${reference}`,
                {
                    headers: {
                        Authorization: `Bearer ${this.paystackSecretKey}`,
                    },
                }
            );

            if (response.data.status && response.data.data.status === 'success') {
            const payment = await this.prisma.payment.findFirst({
                    where: { transactionId: reference },
                });

                if (!payment) {
                    throw new NotFoundException('Payment not found');
                }

                // Update payment status
                await this.prisma.payment.update({
                    where: { id: payment.id },
                    data: {
                        status: PaymentStatus.COMPLETED,
                        metadata: {
                            ...(payment.metadata as PaymentMetadata),
                            verificationResponse: response.data.data,
                        } as PaymentMetadata,
                    },
                });

                // Update order status
                await this.ordersService.update(payment.orderId, {
                    status: 'PROCESSING',
                });

                return response.data.data;
            }

            throw new BadRequestException('Payment verification failed');
        } catch (error) {
            this.logger.error('Error verifying Paystack payment:', error);
            throw error;
        }
    }

    async handleFlutterwaveWebhook(webhookData: FlutterwaveWebhookDto, hash: string) {
        try {
            // Verify webhook hash
            const secretHash = this.configService.get('FLUTTERWAVE_SECRET_HASH');
            const computedHash = createHmac('sha512', secretHash)
                .update(JSON.stringify(webhookData))
                .digest('hex');

            if (hash !== computedHash) {
                throw new UnauthorizedException('Invalid webhook hash');
            }

            if (webhookData.event === 'charge.completed') {
                const orderId = webhookData.data.tx_ref.split('-')[1];
                return this.handlePaymentSuccess(orderId, 'flutterwave', webhookData);
            }

            return { success: true, message: 'Webhook processed' };
        } catch (error) {
            this.logger.error('Error processing Flutterwave webhook:', error);
            throw error;
        }
    }

    async handlePaymentSuccess(orderId: string, paymentProvider: 'flutterwave' | 'paystack', paymentData: any) {
        try {
            const order = await this.ordersService.findOne(orderId);
            if (!order) {
                throw new NotFoundException(`Order with ID ${orderId} not found`);
            }

            // Update order status
            await this.ordersService.update(orderId, {
                status: 'PROCESSING',
            });

            // Send notification to user
            if (order.userId) {
                await this.sendPaymentNotification(
                    order.userId,
                    'payment_success',
                    {
                        orderId,
                        amount: order.total,
                        paymentProvider,
                    }
                );
            }

            return {
                success: true,
                message: 'Payment processed successfully',
                orderId,
            };
        } catch (error) {
            this.logger.error('Error handling payment success:', error);
            throw error;
        }
    }

    async getTransactionHistory(filters: {
        from?: string;
        to?: string;
        status?: string;
        page?: number;
        limit?: number;
    }) {
        const { from, to, status, page = 1, limit = 10 } = filters;
        const skip = (page - 1) * limit;

        const where: Prisma.TransactionWhereInput = {};
        if (from && to) {
            where.createdAt = {
                gte: new Date(from),
                lte: new Date(to),
            };
        }
        if (status) {
            where.status = status as TransactionStatus;
        }

        const [transactions, total] = await Promise.all([
            this.prisma.transaction.findMany({
                where,
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
            }),
            this.prisma.transaction.count({ where }),
        ]);

        return {
            transactions,
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        };
    }

    async getTransactionDetails(transactionId: string) {
        const transaction = await this.prisma.transaction.findUnique({
            where: { id: transactionId },
        });

        if (!transaction) {
            throw new NotFoundException(`Transaction with ID ${transactionId} not found`);
        }

        return transaction;
    }

    async sendPaymentNotification(
        userId: string,
        type: 'payment_success' | 'payment_failed' | 'refund_processed',
        data: any
    ) {
            const notification = await this.prisma.notification.create({
                data: {
                title: this.getNotificationTitle(type),
                message: this.getNotificationMessage(type, data),
                status: NotificationStatus.UNREAD,
                userId
            }
        });

        return notification;
    }

    private getNotificationTitle(type: string): string {
        switch (type) {
            case 'payment_success':
                return 'Payment Successful';
            case 'payment_failed':
                return 'Payment Failed';
            case 'refund_processed':
                return 'Refund Processed';
            default:
                return 'Payment Update';
        }
    }

    private getNotificationMessage(type: string, data: any): string {
        switch (type) {
            case 'payment_success':
                return `Your payment of ${data.amount} has been processed successfully.`;
            case 'payment_failed':
                return `Your payment of ${data.amount} has failed. Please try again.`;
            case 'refund_processed':
                return `Your refund of ${data.amount} has been processed.`;
            default:
                return 'There has been an update to your payment.';
        }
    }

    async initiateRefund(transactionId: string, amount?: number, reason?: string) {
        const transaction = await this.prisma.transaction.findUnique({
            where: { id: transactionId }
        });

        if (!transaction) {
            throw new NotFoundException('Transaction not found');
        }

                const payment = await this.prisma.payment.findFirst({
            where: { transactionId }
        });

        if (!payment) {
            throw new NotFoundException('Payment not found');
        }

        const refund = await this.prisma.refund.create({
            data: {
                amount: amount || transaction.amount,
                reason: reason || 'Customer request',
                status: RefundStatus.PENDING,
                payment: { connect: { id: payment.id } }
            }
        });

        return refund;
    }

    async createNotification(title: string, message: string, userId: string) {
        const notification = await this.prisma.notification.create({
            data: {
                title,
                message,
                status: NotificationStatus.UNREAD,
                userId
            }
        });

        return notification;
    }

    async updateNotification(notification: any) {
        await this.prisma.notification.update({
            where: { id: notification.id },
            data: { status: NotificationStatus.READ }
        });
    }
} 