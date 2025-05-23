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
import { RolesGuard } from '../auth/guards/roles.guard';
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
            method: req.method
        };
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

    @Get('verify/flutterwave/:transactionId')
    async verifyFlutterwavePayment(
        @Param('transactionId') transactionId: string
    ) {
        return this.paymentService.verifyFlutterwavePayment(transactionId);
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
        @Body() webhookData: PaystackWebhookDto
    ) {
        if (webhookData.data.status === 'success') {
            const orderId = webhookData.data.reference.split('-')[1];
            return this.paymentService.handlePaymentSuccess(
                orderId,
                'paystack',
                webhookData
            );
        }
        return { success: false, message: 'Payment not successful' };
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