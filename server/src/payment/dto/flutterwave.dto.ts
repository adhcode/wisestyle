import { IsString, IsObject, IsOptional } from 'class-validator';
import { BasePaymentDto } from './base-payment.dto';

export class FlutterwavePaymentRequestDto extends BasePaymentDto {
    @IsString()
    @IsOptional()
    paymentOptions?: string;

    @IsObject()
    @IsOptional()
    customizations?: {
        title?: string;
        description?: string;
        logo?: string;
    };
}

export class FlutterwavePaymentResponseDto {
    @IsString()
    status: string;

    @IsString()
    message: string;

    @IsObject()
    data: {
        link: string;
        tx_ref: string;
    };
}

export class FlutterwaveWebhookDto {
    @IsString()
    event: string;

    @IsObject()
    data: {
        id: number;
        tx_ref: string;
        flw_ref: string;
        device_fingerprint: string;
        amount: number;
        currency: string;
        charged_amount: number;
        app_fee: number;
        merchant_fee: number;
        processor_response: string;
        auth_model: string;
        ip: string;
        narration: string;
        status: string;
        payment_type: string;
        created_at: string;
        account_id: number;
        customer: {
            id: number;
            name: string;
            phone_number: string;
            email: string;
            created_at: string;
        };
    };
} 