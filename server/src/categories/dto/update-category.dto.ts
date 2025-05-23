import { IsString, IsOptional, IsEnum } from 'class-validator';
import { CategoryType } from './create-category.dto';

export class UpdateCategoryDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsEnum(CategoryType)
  @IsOptional()
  type?: CategoryType;
} 