import { IsString, IsOptional, IsJSON, IsObject } from 'class-validator';

export class UpdateBrandingDto {
    @IsString()
    @IsOptional()
    domain?: string;

    @IsString()
    @IsOptional()
    logo?: string;

    @IsString()
    @IsOptional()
    favicon?: string;

    @IsString()
    @IsOptional()
    brandName?: string;

    @IsString()
    @IsOptional()
    primaryColor?: string;

    @IsObject()
    @IsOptional()
    theme?: Record<string, any>;

    @IsString()
    @IsOptional()
    supportEmail?: string;
}
