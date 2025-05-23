import { IsString, IsNumber, IsArray, IsOptional, IsBoolean, Min, Max, ValidateNested, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';
import { DisplaySection } from '@prisma/client';

export class InventoryItemDto {
  @IsString()
  sizeId: string;

  @IsString()
  colorId: string;

  @IsNumber()
  @Min(0)
  quantity: number;
}

export class CreateProductDto {
  @IsString()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsNumber()
  @Min(0)
  price: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  originalPrice?: number;

  @IsNumber()
  @Min(0)
  @Max(100)
  @IsOptional()
  discount?: number;

  @IsString()
  categoryId: string;

  @IsString()
  @IsOptional()
  image?: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  images?: string[];

  @IsArray()
  @IsString({ each: true })
  sizes: string[];

  @IsArray()
  @IsString({ each: true })
  colors: string[];

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  tags?: string[];

  @IsBoolean()
  @IsOptional()
  isLimited?: boolean;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => InventoryItemDto)
  @IsOptional()
  inventory?: InventoryItemDto[];

  @IsEnum(DisplaySection)
  @IsOptional()
  displaySection?: DisplaySection;
} 