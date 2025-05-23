import { IsString, IsNumber, IsEmail, Min } from 'class-validator';

export class BasePaymentDto {
    @IsString()
    orderId: string;

    @IsNumber()
    @Min(0)
    amount: number;

    @IsEmail()
    email: string;
} 