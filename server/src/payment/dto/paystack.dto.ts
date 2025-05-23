import { IsString, IsObject, IsOptional, IsNumber } from 'class-validator';
import { BasePaymentDto } from './base-payment.dto';

export class PaystackPaymentRequestDto extends BasePaymentDto {
    @IsString()
    @IsOptional()
    callback_url?: string;

    @IsString()
    @IsOptional()
    currency?: string;
}

export class PaystackPaymentResponseDto {
    @IsString()
    status: string;

    @IsString()
    message: string;

    @IsObject()
    data: {
        authorization_url: string;
        access_code: string;
        reference: string;
    };
}

export class PaystackWebhookDto {
    @IsString()
    event: string;

    @IsObject()
    data: {
        id: number;
        domain: string;
        status: string;
        reference: string;
        amount: number;
        message: string;
        gateway_response: string;
        paid_at: string;
        created_at: string;
        channel: string;
        currency: string;
        ip_address: string;
        metadata: {
            custom_fields: Array<{
                display_name: string;
                variable_name: string;
                value: string;
            }>;
            referrer: string;
        };
        log: {
            time_spent: number;
            attempts: number;
            authentication: string;
            errors: number;
            success: boolean;
            mobile: boolean;
            input: Array<any>;
            channel: string;
            history: Array<{
                type: string;
                message: string;
                time: number;
            }>;
        };
        fees: number;
        customer: {
            id: number;
            first_name: string;
            last_name: string;
            email: string;
            customer_code: string;
            phone: string;
            metadata: any;
            risk_action: string;
        };
        authorization: {
            authorization_code: string;
            bin: string;
            last4: string;
            exp_month: string;
            exp_year: string;
            channel: string;
            card_type: string;
            bank: string;
            country_code: string;
            brand: string;
            reusable: boolean;
            signature: string;
        };
    };
} 