import { IsNotEmpty, IsNumber, IsString, IsEmail } from 'class-validator';

export class PaystackPaymentRequestDto {
    @IsNotEmpty()
    @IsString()
    orderId: string;

    @IsNotEmpty()
    @IsNumber()
    amount: number;

    @IsNotEmpty()
    @IsEmail()
    email: string;
}

export class PaystackPaymentResponseDto {
    status: boolean;
    message: string;
    data: {
        authorization_url: string;
        access_code: string;
        reference: string;
    };
}

export class PaystackWebhookDto {
    event: string;
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
            custom_fields: any[];
            referrer: string;
        };
        log: {
            start_time: number;
            time_spent: number;
            attempts: number;
            errors: number;
            success: boolean;
            mobile: boolean;
            input: any[];
            history: {
                type: string;
                message: string;
                time: number;
            }[];
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