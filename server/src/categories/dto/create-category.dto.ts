import { IsString, IsOptional, IsEnum } from 'class-validator';

export enum CategoryType {
  MAIN = 'MAIN',
  LIFESTYLE = 'LIFESTYLE'
}

export class CreateCategoryDto {
  @IsString()
  name: string;

  @IsString()
  slug: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsEnum(CategoryType)
  type: CategoryType;
} 