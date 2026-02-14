import { IsNotEmpty, IsOptional, IsString, IsEmail, IsEnum, IsNumber, IsUUID } from 'class-validator';
import { ContactStatus } from '../entities/contact.entity';

export class CreateContactDto {
  @IsOptional()
  @IsString()
  tenantId?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsEnum(ContactStatus)
  status?: ContactStatus;

  @IsOptional()
  @IsNumber()
  score?: number;

  @IsOptional()
  @IsUUID()
  assignedToId?: string;

  @IsNotEmpty()
  @IsString()
  phoneNumber: string;

  @IsNotEmpty()
  @IsString()
  name: string;
}
