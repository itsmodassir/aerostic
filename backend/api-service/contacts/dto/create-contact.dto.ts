import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsEmail,
  IsEnum,
  IsNumber,
  IsUUID,
  IsBoolean,
} from "class-validator";
import { ContactStatus } from "@shared/database/entities/core/contact.entity";

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

  @IsOptional()
  @IsString()
  countryCode?: string;

  @IsOptional()
  @IsBoolean()
  isVIP?: boolean;

  @IsOptional()
  @IsString({ each: true })
  groups?: string[];
}
