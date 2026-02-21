import { IsNotEmpty, IsOptional, IsString } from "class-validator";

export class CreateTenantDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  slug?: string;
}
