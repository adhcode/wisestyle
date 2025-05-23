import { IsNotEmpty, IsNumber, IsString, IsEmail } from 'class-validator';

export class FlutterwavePaymentRequestDto {
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

export class FlutterwavePaymentResponseDto {
    status: string;
    message: string;
    data: {
        link: string;
        reference: string;
    };
}

export class FlutterwaveWebhookDto {
    event: string;
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