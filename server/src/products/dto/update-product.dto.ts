import { IsString, IsNumber, IsArray, IsOptional, IsBoolean, IsObject, Min, Max, ValidateNested, IsEnum } from 'class-validator';
import { PartialType } from '@nestjs/mapped-types';
import { CreateProductDto, InventoryItemDto } from './create-product.dto';
import { DisplaySection } from '@prisma/client';
import { Type } from 'class-transformer';

export class UpdateProductDto extends PartialType(CreateProductDto) {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsNumber()
  @IsOptional()
  price?: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  originalPrice?: number | null;

  @IsNumber()
  @Min(0)
  @Max(100)
  @IsOptional()
  discount?: number | null;

  @IsString()
  @IsOptional()
  categoryId?: string;

  @IsString()
  @IsOptional()
  image?: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  images?: string[];

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  sizes?: string[];

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  colors?: string[];

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