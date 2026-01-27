import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateContactDto {
    @IsNotEmpty()
    @IsString()
    tenantId: string;

    @IsNotEmpty()
    @IsString()
    phoneNumber: string;

    @IsNotEmpty()
    @IsString()
    name: string;

    @IsOptional()
    email?: string;
}
