import { IsString, IsEmail, IsNotEmpty, IsOptional } from "class-validator";

export class OnboardSubTenantDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsEmail()
  @IsNotEmpty()
  ownerEmail: string;

  @IsString()
  @IsNotEmpty()
  ownerName: string;

  @IsString()
  @IsOptional()
  password?: string;
}
