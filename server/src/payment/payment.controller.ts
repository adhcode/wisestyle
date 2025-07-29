import {
    Controller,
    Post,
    Body,
    Get,
    Param,
    UseGuards,
    HttpCode,
    HttpStatus,
    Patch,
    Delete,
    Request,
    Query,
    Headers,
    UnauthorizedException,
    BadRequestException,
    Logger
} from '@nestjs/common';
import { PaymentService } from './payment.service';
import { Public } from '../auth/decorators/public.decorator';
import {
    FlutterwavePaymentRequestDto,
    FlutterwavePaymentResponseDto,
    FlutterwaveWebhookDto,
    PaystackPaymentRequestDto,
    PaystackPaymentResponseDto,
    PaystackWebhookDto
} from './dto';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';
import { RolesGuard } from '../guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../auth/enums/role.enum';

@Controller('payments')
export class PaymentController {
    private readonly logger = new Logger(PaymentController.name);

    constructor(private readonly paymentService: PaymentService) {
        this.logger.log('PaymentController initialized');
    }

    @Public()
    @Get('test')
    @HttpCode(HttpStatus.OK)
    async test(@Request() req) {
        this.logger.log('Test endpoint called');
        this.logger.log('Request URL:', req.url);
        this.logger.log('Request method:', req.method);
        this.logger.log('Request headers:', req.headers);
        return {
            message: 'Payment controller is working',
            timestamp: new Date().toISOString(),
            path: req.url,
            method: req.method,
            paystack: {
                configured: this.paymentService.isPaystackConfigured(),
                baseUrl: this.paymentService.getPaystackBaseUrl()
            },
            flutterwave: {
                configured: this.paymentService.isFlutterwaveConfigured(),
                publicKey: !!process.env.FLUTTERWAVE_PUBLIC_KEY,
                secretKey: !!process.env.FLUTTERWAVE_SECRET_KEY
            }
        };
    }

    @Public()
    @Post('webhook/test')
    @HttpCode(HttpStatus.OK)
    async testWebhook(@Body() body: any, @Headers() headers: any) {
        this.logger.log('Test webhook called');
        this.logger.log('Headers:', headers);
        this.logger.log('Body:', body);
        return {
            message: 'Webhook test successful',
            timestamp: new Date().toISOString(),
            receivedHeaders: headers,
            receivedBody: body
        };
    }

    @Public()
    @Get('test/flutterwave/:transactionId')
    @HttpCode(HttpStatus.OK)
    async testFlutterwaveVerification(@Param('transactionId') transactionId: string) {
        this.logger.log(`Testing Flutterwave verification for: ${transactionId}`);
        
        try {
            // Test direct API call to Flutterwave
            const secretKey = process.env.FLUTTERWAVE_SECRET_KEY;
            if (!secretKey) {
                return {
                    error: 'Flutterwave secret key not configured',
                    configured: false
                };
            }

            const axios = require('axios');
            
            // Try both verification methods
            let response1, response2;
            
            try {
                response1 = await axios.get(
                    `https://api.flutterwave.com/v3/transactions/verify_by_reference?tx_ref=${transactionId}`,
                    {
                        headers: {
                            Authorization: `Bearer ${secretKey}`,
                        },
                    }
                );
            } catch (err) {
                response1 = { error: err.message, status: err.response?.status };
            }

            try {
                response2 = await axios.get(
                    `https://api.flutterwave.com/v3/transactions/${transactionId}/verify`,
                    {
                        headers: {
                            Authorization: `Bearer ${secretKey}`,
                        },
                    }
                );
            } catch (err) {
                response2 = { error: err.message, status: err.response?.status };
            }

            return {
                transactionId,
                configured: true,
                verifyByReference: response1,
                verifyById: response2,
                timestamp: new Date().toISOString()
            };
        } catch (error) {
            this.logger.error('Test Flutterwave verification failed:', error);
            return {
                error: error.message,
                transactionId,
                timestamp: new Date().toISOString()
            };
        }
    }

    @Post()
    @HttpCode(HttpStatus.CREATED)
    create(@Body() createPaymentDto: CreatePaymentDto, @Request() req) {
        return this.paymentService.create({
            ...createPaymentDto,
            userId: req.user.id,
        });
    }

    @Get()
    findAll(@Request() req) {
        return this.paymentService.findAll(req.user.id);
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.paymentService.findOne(id);
    }

    @Patch(':id')
    @UseGuards(RolesGuard)
    @Roles(Role.ADMIN)
    update(@Param('id') id: string, @Body() updatePaymentDto: UpdatePaymentDto) {
        return this.paymentService.update(id, updatePaymentDto);
    }

    @Delete(':id')
    @UseGuards(RolesGuard)
    @Roles(Role.ADMIN)
    remove(@Param('id') id: string) {
        return this.paymentService.remove(id);
    }

    @Post(':id/process')
    @UseGuards(RolesGuard)
    @Roles(Role.ADMIN)
    processPayment(@Param('id') id: string) {
        return this.paymentService.processPayment(id);
    }

    @Get('verify/:reference')
    verifyPayment(@Param('reference') reference: string) {
        return this.paymentService.verifyPayment(reference);
    }

    @Post('initialize/flutterwave')
    @HttpCode(HttpStatus.OK)
    async initializeFlutterwavePayment(
        @Body() body: { orderId: string; amount: number; email: string }
    ) {
        this.logger.log('Received Flutterwave payment initialization request');
        this.logger.log('Request body:', body);

        try {
            const response = await this.paymentService.initializeFlutterwavePayment(
                body.orderId,
                body.amount,
                body.email
            );
            this.logger.log('Payment initialization successful');
            return response;
        } catch (error) {
            this.logger.error('Payment initialization failed:', error);
            throw error;
        }
    }

    @Post('initialize/paystack')
    @HttpCode(HttpStatus.OK)
    async initializePaystackPayment(
        @Body() paymentDto: PaystackPaymentRequestDto
    ): Promise<PaystackPaymentResponseDto> {
        return this.paymentService.initializePaystackPayment(
            paymentDto.orderId,
            paymentDto.amount,
            paymentDto.email
        );
    }

    @Public()
    @Get('verify/flutterwave/:transactionId')
    @HttpCode(HttpStatus.OK)
    async verifyFlutterwavePayment(
        @Param('transactionId') transactionId: string
    ) {
        try {
            this.logger.log(`Verifying Flutterwave payment with transaction ID: ${transactionId}`);
            const result = await this.paymentService.verifyFlutterwavePayment(transactionId);
            this.logger.log('Flutterwave verification successful');
            return result;
        } catch (error) {
            this.logger.error('Flutterwave verification failed:', error);
            throw error;
        }
    }

    @Public()
    @Get('verify/paystack/:reference')
    @HttpCode(HttpStatus.OK)
    async verifyPaystackPayment(
        @Param('reference') reference: string
    ): Promise<PaystackPaymentResponseDto> {
        return this.paymentService.verifyPaystackPayment(reference);
    }

    @Public()
    @Post('webhook/flutterwave')
    @HttpCode(HttpStatus.OK)
    async handleFlutterwaveWebhook(
        @Body() webhookData: FlutterwaveWebhookDto,
        @Headers('verif-hash') hash: string
    ) {
        if (!hash) {
            throw new UnauthorizedException('Missing verification hash');
        }

        return this.paymentService.handleFlutterwaveWebhook(webhookData, hash);
    }

    @Public()
    @Post('webhook/paystack')
    @HttpCode(HttpStatus.OK)
    async handlePaystackWebhook(
        @Body() webhookData: PaystackWebhookDto,
        @Headers('x-paystack-signature') signature: string
    ) {
        try {
            this.logger.log('Received Paystack webhook:', JSON.stringify(webhookData, null, 2));
            
            // Verify webhook signature for security (skip in development if no signature)
            if (signature) {
                const isValid = await this.paymentService.verifyPaystackWebhook(webhookData, signature);
                if (!isValid) {
                    this.logger.warn('Invalid webhook signature');
                    throw new UnauthorizedException('Invalid webhook signature');
                }
            } else {
                this.logger.warn('No webhook signature provided - this should only happen in development');
            }

            // Handle different webhook events
            if (webhookData.event === 'charge.success' && webhookData.data.status === 'success') {
                // Extract order ID from metadata or reference
                let orderId = webhookData.data.metadata?.orderId;
                
                // If not found in metadata, check custom_fields
                if (!orderId && webhookData.data.metadata?.custom_fields) {
                    const orderField = webhookData.data.metadata.custom_fields.find(
                        (field: any) => field.variable_name === 'order_id'
                    );
                    orderId = orderField?.value;
                }

                if (!orderId) {
                    this.logger.error('Order ID not found in webhook data:', {
                        metadata: webhookData.data.metadata,
                        reference: webhookData.data.reference
                    });
                    throw new BadRequestException('Order ID not found in webhook data');
                }

                return this.paymentService.handlePaymentSuccess(
                    orderId,
                    'paystack',
                    webhookData.data
                );
            }

            // Handle transfer events (bank transfer payments)
            if (webhookData.event === 'transfer.success' || webhookData.event === 'transfer.reversed') {
                this.logger.log(`Transfer event received: ${webhookData.event}`);
                // Handle transfer completion if needed
            }

            this.logger.log(`Webhook event ${webhookData.event} received but no action required`);
            return { success: true, message: 'Webhook received but no action required' };
        } catch (error) {
            this.logger.error('Paystack webhook error:', error);
            throw error;
        }
    }

    @Post('refund/:transactionId')
    @UseGuards(RolesGuard)
    @Roles(Role.ADMIN)
    @HttpCode(HttpStatus.OK)
    async initiateRefund(
        @Param('transactionId') transactionId: string,
        @Body() refundDto: { amount?: number; reason?: string }
    ) {
        return this.paymentService.initiateRefund(transactionId, refundDto.amount, refundDto.reason);
    }

    @Get('transactions')
    @UseGuards(RolesGuard)
    @Roles(Role.ADMIN)
    async getTransactionHistory(
        @Query('from') from?: string,
        @Query('to') to?: string,
        @Query('status') status?: string,
        @Query('page') page?: number,
        @Query('limit') limit?: number
    ) {
        return this.paymentService.getTransactionHistory({
            from,
            to,
            status,
            page,
            limit
        });
    }

    @Get('transactions/:transactionId')
    @UseGuards(RolesGuard)
    @Roles(Role.ADMIN)
    async getTransactionDetails(
        @Param('transactionId') transactionId: string
    ) {
        return this.paymentService.getTransactionDetails(transactionId);
    }

    @Post('notifications/send')
    @UseGuards(RolesGuard)
    @Roles(Role.ADMIN)
    async sendPaymentNotification(
        @Body() notificationDto: {
            userId: string;
            type: 'payment_success' | 'payment_failed' | 'refund_processed';
            data: any;
        }
    ) {
        return this.paymentService.sendPaymentNotification(
            notificationDto.userId,
            notificationDto.type,
            notificationDto.data
        );
    }
} 