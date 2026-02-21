import {
  IsString,
  IsEmail,
  IsNotEmpty,
  IsUUID,
  IsOptional,
} from "class-validator";

export class CreateResellerDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsEmail()
  @IsNotEmpty()
  ownerEmail: string;

  @IsString()
  @IsNotEmpty()
  ownerName: string;

  @IsUUID()
  @IsNotEmpty()
  planId: string;

  @IsString()
  @IsOptional()
  password?: string;
}
