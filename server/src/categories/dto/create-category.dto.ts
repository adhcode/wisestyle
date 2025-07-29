import { IsString, IsOptional, IsBoolean, IsInt, IsUrl, ValidateIf } from 'class-validator';

export class CreateCategoryDto {
    @IsString()
    name: string;

    @IsString()
    slug: string;

    @IsOptional()
    @IsString()
    description?: string;

    @IsString()
    type: string;

    @IsOptional()
    @IsBoolean()
    isActive?: boolean = true;

    @IsOptional()
    @ValidateIf((o) => o.imageUrl && o.imageUrl.trim() !== '')
    @IsUrl()
    imageUrl?: string;

    @IsOptional()
    @IsString()
    image?: string;

    @IsOptional()
    @IsInt()
    displayOrder?: number = 0;

    @IsOptional()
    @IsString()
    parentId?: string;
}