import { IsString, IsNumber, IsOptional, IsEnum } from 'class-validator';
import { RefundStatus } from '@prisma/client';

export class CreateRefundDto {
    @IsString()
    transactionId: string;

    @IsNumber()
    @IsOptional()
    amount?: number;

    @IsString()
    @IsOptional()
    reason?: string;
}

export class UpdateRefundDto {
    @IsEnum(RefundStatus)
    status: RefundStatus;

    @IsString()
    @IsOptional()
    reason?: string;
} 