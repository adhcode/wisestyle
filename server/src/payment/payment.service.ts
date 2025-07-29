import { Injectable, Logger, NotFoundException, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { OrdersService } from '../orders/orders.service';
import { UsersService } from '../users/users.service';
import { NotificationService } from '../notification/notification.service';
import { MailService } from '../mail/mail.service';
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
    private readonly paystackWebhookSecret: string;
    private readonly paystackBaseUrl: string;
    private readonly CACHE_TTL = 3600; // 1 hour

    constructor(
        private configService: ConfigService,
        private ordersService: OrdersService,
        private usersService: UsersService,
        private readonly prisma: PrismaService,
        private readonly redis: RedisService,
        private readonly notificationService: NotificationService,
        private readonly mailService: MailService,
    ) {
        const publicKey = this.configService.get('FLUTTERWAVE_PUBLIC_KEY');
        const secretKey = this.configService.get('FLUTTERWAVE_SECRET_KEY');

        if (!publicKey || !secretKey) {
            this.logger.warn('Flutterwave API keys not provided – Flutterwave payments disabled.');
            this.flutterwave = null; // disable feature
        } else {
            this.flutterwave = new Flutterwave(publicKey, secretKey);
        }
        this.paystackSecretKey = this.configService.get<string>('PAYSTACK_SECRET_KEY') || '';
        this.paystackWebhookSecret = this.configService.get<string>('PAYSTACK_WEBHOOK_SECRET') || '';
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
        if (!this.flutterwave) {
            throw new BadRequestException('Flutterwave payments are disabled on this server');
        }
        try {
            const order = await this.ordersService.findOne(orderId);
            if (!order) {
                throw new NotFoundException(`Order with ID ${orderId} not found`);
            }

            const tx_ref = `TX-${orderId}-${Date.now()}`;

            const response = await axios.post('https://api.flutterwave.com/v3/payments', {
                tx_ref,
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
                meta: { orderId },
            }, {
                headers: {
                    Authorization: `Bearer ${this.configService.get('FLUTTERWAVE_SECRET_KEY')}`,
                    'Content-Type': 'application/json',
                },
            });

            if (response.data?.status === 'success') {
                const paymentData = response.data.data;
                await this.createPaymentRecord({
                    orderId,
                    amount,
                    currency: 'NGN',
                    provider: 'flutterwave',
                    paymentMethod,
                    transactionId: tx_ref,
                    metadata: {
                        orderId,
                        email,
                        transactionId: tx_ref,
                        paymentData,
                        phone: order.phone,
                        name: order.email,
                    },
                });

                return paymentData; // contains link
            }

            throw new BadRequestException('Failed to initialize payment');
        } catch (error) {
            this.logger.error('Error initializing Flutterwave payment:', error);
            throw error;
        }
    }

    async initializePaystackPayment(orderId: string, amount: number, email: string) {
        try {
            if (!this.paystackSecretKey) {
                throw new BadRequestException('Paystack is not configured on this server');
            }

            const order = await this.ordersService.findOne(orderId);
            if (!order) {
                throw new NotFoundException(`Order with ID ${orderId} not found`);
            }

            this.logger.log(`Initializing Paystack payment for order ${orderId}, amount: ${amount}`);

            const frontendUrl = this.configService.get('FRONTEND_URL') || 'http://localhost:3000';
            
            const paymentData = {
                amount: amount * 100, // Convert to kobo
                email,
                callback_url: `${frontendUrl}/payment/verify`,
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
            };

            this.logger.log('Paystack payment data:', JSON.stringify(paymentData, null, 2));

            const response = await axios.post(
                `${this.paystackBaseUrl}/transaction/initialize`,
                paymentData,
                {
                    headers: {
                        Authorization: `Bearer ${this.paystackSecretKey}`,
                        'Content-Type': 'application/json',
                    },
                    timeout: 30000, // 30 second timeout
                }
            );

            this.logger.log(`Paystack response:`, JSON.stringify(response.data, null, 2));

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

                this.logger.log(`Payment record created for reference: ${response.data.data.reference}`);
                return response.data;
            }

            throw new BadRequestException('Paystack returned unsuccessful status');
        } catch (error) {
            this.logger.error('Error initializing Paystack payment:', {
                orderId,
                amount,
                email,
                error: error.message,
                stack: error.stack,
                response: error.response?.data
            });
            
            if (error.response?.status === 401) {
                throw new BadRequestException('Invalid Paystack API key');
            } else if (error.response?.status === 400) {
                throw new BadRequestException(`Paystack API error: ${error.response.data?.message || 'Invalid request'}`);
            } else if (error.code === 'ECONNREFUSED' || error.code === 'ETIMEDOUT') {
                throw new BadRequestException('Unable to connect to Paystack. Please try again.');
            }
            
            throw error;
        }
    }

    async verifyFlutterwavePayment(transactionId: string) {
        if (!this.flutterwave) {
            throw new BadRequestException('Flutterwave payments are disabled on this server');
        }
        try {
            this.logger.log(`Verifying Flutterwave payment with transaction ID: ${transactionId}`);
            
            // First, try to find existing payment record by transactionId (tx_ref)
            let payment = await this.prisma.payment.findFirst({
                where: { transactionId: transactionId },
            });

            // If payment found, verify with Flutterwave using the tx_ref
            let response;
            if (payment) {
                this.logger.log(`Found payment record, verifying with tx_ref: ${transactionId}`);
                // For Flutterwave, we need to verify using tx_ref, not transaction ID
                response = await axios.get(
                    `https://api.flutterwave.com/v3/transactions/verify_by_reference?tx_ref=${transactionId}`,
                    {
                        headers: {
                            Authorization: `Bearer ${this.configService.get('FLUTTERWAVE_SECRET_KEY')}`,
                        },
                    }
                );
            } else {
                // If no payment record found, try verifying directly with Flutterwave
                this.logger.log(`No payment record found, attempting direct verification with: ${transactionId}`);
                try {
                    // Try as tx_ref first
                    response = await axios.get(
                        `https://api.flutterwave.com/v3/transactions/verify_by_reference?tx_ref=${transactionId}`,
                        {
                            headers: {
                                Authorization: `Bearer ${this.configService.get('FLUTTERWAVE_SECRET_KEY')}`,
                            },
                        }
                    );
                } catch (txRefError) {
                    // If tx_ref fails, try as transaction ID
                    this.logger.log(`tx_ref verification failed, trying as transaction ID: ${transactionId}`);
                    response = await axios.get(
                        `https://api.flutterwave.com/v3/transactions/${transactionId}/verify`,
                        {
                            headers: {
                                Authorization: `Bearer ${this.configService.get('FLUTTERWAVE_SECRET_KEY')}`,
                            },
                        }
                    );
                }
            }
            
            this.logger.log(`Flutterwave verification response:`, JSON.stringify(response.data, null, 2));
            
            if (response.data?.status === 'success' && response.data?.data?.status === 'successful') {
                const verificationData = response.data.data;
                
                // If payment record not found, try to create it from the verification data
                if (!payment) {
                    this.logger.warn(`Payment record not found for tx_ref: ${verificationData.tx_ref}, attempting to create from verification data`);
                    
                    // Extract order ID from tx_ref (format: TX-{orderId}-{timestamp})
                    // Handle both simple orderIds and UUIDs
                    const txRefParts = verificationData.tx_ref.split('-');
                    let orderId = null;
                    
                    if (txRefParts.length >= 3) {
                        // For UUID format: TX-uuid-part1-uuid-part2-uuid-part3-timestamp
                        // Take everything except the first part (TX) and last part (timestamp)
                        const lastPart = txRefParts[txRefParts.length - 1];
                        // Check if last part is a timestamp (13 digits)
                        if (/^\d{13}$/.test(lastPart)) {
                            orderId = txRefParts.slice(1, -1).join('-');
                        } else {
                            // If not a timestamp, include all parts except TX
                            orderId = txRefParts.slice(1).join('-');
                        }
                    } else if (txRefParts.length === 2) {
                        // Simple format: TX-orderId
                        orderId = txRefParts[1];
                    }

                    this.logger.log(`Extracted order ID: ${orderId} from tx_ref: ${verificationData.tx_ref}`);

                    if (orderId) {
                        try {
                            payment = await this.createPaymentRecord({
                                orderId,
                                amount: verificationData.amount,
                                currency: verificationData.currency || 'NGN',
                                provider: 'flutterwave',
                                paymentMethod: 'card',
                                transactionId: verificationData.tx_ref,
                                metadata: {
                                    orderId,
                                    email: verificationData.customer?.email,
                                    transactionId: verificationData.tx_ref,
                                    paymentData: verificationData,
                                    phone: verificationData.customer?.phone_number || '',
                                    name: verificationData.customer?.name || verificationData.customer?.email || '',
                                },
                            });
                            this.logger.log(`Created payment record for tx_ref: ${verificationData.tx_ref}`);
                        } catch (createError) {
                            this.logger.error(`Failed to create payment record: ${createError.message}`);
                            // Continue with the verification even if we can't create the payment record
                            // This allows the payment to be processed even if there's a database issue
                        }
                    } else {
                        this.logger.error(`Could not extract order ID from tx_ref: ${verificationData.tx_ref}`);
                        // Don't throw an error here - let the payment verification continue
                        // The payment might still be valid even if we can't create a record
                        this.logger.warn('Continuing with payment verification despite missing payment record');
                    }
                }

                // Delegate further processing (status update, email, notification) to a central helper
                if (payment) {
                    await this.handlePaymentSuccess(payment.orderId, 'flutterwave', verificationData);
                } else {
                    // If we don't have a payment record, try to extract order ID and process anyway
                    const txRefParts = verificationData.tx_ref.split('-');
                    let orderId = null;
                    
                    if (txRefParts.length >= 3) {
                        const lastPart = txRefParts[txRefParts.length - 1];
                        if (/^\d{13}$/.test(lastPart)) {
                            orderId = txRefParts.slice(1, -1).join('-');
                        } else {
                            orderId = txRefParts.slice(1).join('-');
                        }
                    } else if (txRefParts.length === 2) {
                        orderId = txRefParts[1];
                    }

                    if (orderId) {
                        try {
                            await this.handlePaymentSuccess(orderId, 'flutterwave', verificationData);
                        } catch (successError) {
                            this.logger.error(`Failed to handle payment success: ${successError.message}`);
                            // Don't throw - return the verification data anyway
                        }
                    }
                }

                return verificationData;
            }

            throw new BadRequestException('Payment verification failed - payment not successful');
        } catch (error) {
            this.logger.error('Error verifying Flutterwave payment:', {
                transactionId,
                error: error.message,
                stack: error.stack,
                response: error.response?.data,
                status: error.response?.status
            });
            
            // Handle specific error cases
            if (error.response?.status === 404) {
                this.logger.error(`Transaction not found on Flutterwave: ${transactionId}`);
                throw new NotFoundException(`Transaction ${transactionId} not found on Flutterwave. Please check the transaction reference.`);
            } else if (error.response?.status === 401) {
                this.logger.error('Invalid Flutterwave API key');
                throw new BadRequestException('Payment service configuration error. Please contact support.');
            } else if (error.response?.status === 400) {
                this.logger.error(`Flutterwave API error: ${error.response?.data?.message}`);
                throw new BadRequestException(`Payment verification error: ${error.response?.data?.message || 'Invalid transaction reference'}`);
            } else if (error.code === 'ECONNREFUSED' || error.code === 'ETIMEDOUT') {
                this.logger.error('Connection error to Flutterwave API');
                throw new BadRequestException('Unable to connect to payment service. Please try again later.');
            }
            
            this.logger.error(`Unexpected payment verification error: ${error.message}`);
            throw new BadRequestException(`Payment verification failed: ${error.message}`);
        }
    }

    async verifyPaystackPayment(reference: string) {
        try {
            this.logger.log(`Verifying Paystack payment with reference: ${reference}`);
            
            const response = await axios.get(
                `${this.paystackBaseUrl}/transaction/verify/${reference}`,
                {
                    headers: {
                        Authorization: `Bearer ${this.paystackSecretKey}`,
                    },
                }
            );

            this.logger.log(`Paystack verification response:`, JSON.stringify(response.data, null, 2));

            if (response.data.status) {
                const paymentData = response.data.data;
                
                // First, try to find the payment record
                let payment = await this.prisma.payment.findFirst({
                    where: { transactionId: reference },
                });

                // If payment record not found, try to create it from the verification data
                if (!payment) {
                    this.logger.warn(`Payment record not found for reference: ${reference}, attempting to create from verification data`);
                    
                    // Extract order ID from metadata
                    let orderId = paymentData.metadata?.orderId;
                    if (!orderId && paymentData.metadata?.custom_fields) {
                        const orderField = paymentData.metadata.custom_fields.find(
                            (field: any) => field.variable_name === 'order_id'
                        );
                        orderId = orderField?.value;
                    }

                    if (orderId) {
                        // Create the payment record
                        payment = await this.createPaymentRecord({
                            orderId,
                            amount: paymentData.amount / 100, // Convert from kobo
                            currency: paymentData.currency || 'NGN',
                            provider: 'paystack',
                            paymentMethod: 'card',
                            transactionId: reference,
                            metadata: {
                                orderId,
                                email: paymentData.customer?.email,
                                transactionId: reference,
                                paymentData: paymentData,
                                phone: paymentData.customer?.phone || '',
                                name: paymentData.customer?.email || '',
                            },
                        });
                        this.logger.log(`Created payment record for reference: ${reference}`);
                    } else {
                        this.logger.error(`Could not extract order ID from payment data for reference: ${reference}`);
                        throw new NotFoundException('Payment reference not found and could not create record');
                    }
                }

                // Handle different payment statuses
                if (paymentData.status === 'success') {
                    // Payment successful
                    await this.handlePaymentSuccess(payment.orderId, 'paystack', paymentData);
                    return { ...paymentData, status: 'success' };
                } else if (paymentData.status === 'pending') {
                    // Payment is still pending (e.g., bank transfer)
                    this.logger.log(`Payment ${reference} is still pending`);
                    return { ...paymentData, status: 'pending', message: 'Payment is being processed' };
                } else if (paymentData.status === 'failed') {
                    // Payment failed
                    this.logger.log(`Payment ${reference} failed`);
                    return { ...paymentData, status: 'failed', message: 'Payment failed' };
                } else {
                    // Unknown status
                    this.logger.log(`Payment ${reference} has unknown status: ${paymentData.status}`);
                    return { ...paymentData, status: paymentData.status };
                }
            }

            throw new BadRequestException('Payment verification failed - invalid response from Paystack');
        } catch (error) {
            this.logger.error('Error verifying Paystack payment:', {
                reference,
                error: error.message,
                response: error.response?.data
            });
            throw error;
        }
    }

    async verifyPaystackWebhook(webhookData: any, signature: string): Promise<boolean> {
        try {
            if (!this.paystackWebhookSecret) {
                this.logger.warn('Paystack webhook secret not configured');
                return false;
            }

            const computedHash = createHmac('sha512', this.paystackWebhookSecret)
                .update(JSON.stringify(webhookData))
                .digest('hex');

            return computedHash === signature;
        } catch (error) {
            this.logger.error('Error verifying Paystack webhook:', error);
            return false;
        }
    }

    async handleFlutterwaveWebhook(webhookData: FlutterwaveWebhookDto, hash: string) {
        if (!this.flutterwave) return;
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

            // Update order status only if not already updated (prevent duplicate processing)
            if (order.status === 'PENDING') {
                await this.ordersService.update(orderId, {
                    status: 'PROCESSING',
                });
            }

            // Send notification to user (only once)
            if (order.userId && order.status === 'PENDING') {
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

            // Send order confirmation email once
            if (order.status === 'PENDING') {
                try {
                    await this.mailService.sendOrderConfirmationEmail(order.email, order);
                } catch (emailErr) {
                    this.logger.error('Failed to send order confirmation email:', emailErr);
                }
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

    // Configuration check methods
    isPaystackConfigured(): boolean {
        return !!this.paystackSecretKey;
    }

    isFlutterwaveConfigured(): boolean {
        return !!this.flutterwave;
    }

    getPaystackBaseUrl(): string {
        return this.paystackBaseUrl;
    }
} 