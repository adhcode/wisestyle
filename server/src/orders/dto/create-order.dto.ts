import { IsArray, IsNumber, IsString, IsObject, IsOptional, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class OrderItemDto {
    @IsString()
    productId: string;

    @IsNumber()
    quantity: number;

    @IsNumber()
    price: number;

    @IsString()
    @IsOptional()
    color?: string;

    @IsString()
    @IsOptional()
    size?: string;
}

class AddressDto {
    @IsString()
    name: string;

    @IsString()
    address: string;

    @IsString()
    city: string;

    @IsString()
    state: string;

    @IsString()
    postal: string;

    @IsString()
    country: string;

    @IsString()
    @IsOptional()
    phone?: string;
}

export class CreateOrderDto {
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => OrderItemDto)
    items: OrderItemDto[];

    @IsNumber()
    total: number;

    @IsObject()
    @ValidateNested()
    @Type(() => AddressDto)
    shippingAddress: AddressDto;

    @IsObject()
    @ValidateNested()
    @Type(() => AddressDto)
    billingAddress: AddressDto;

    @IsString()
    shippingMethod: string;

    @IsNumber()
    shippingCost: number;

    @IsString()
    email: string;

    @IsString()
    phone: string;
} 