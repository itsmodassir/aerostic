import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  IsIn,
} from "class-validator";

export class SendMessageDto {
  @IsOptional()
  @IsUUID()
  tenantId?: string;

  @IsNotEmpty()
  @IsString()
  to: string; // The recipient's phone number

  @IsNotEmpty()
  @IsIn(["text", "template"])
  type: string;

  @IsNotEmpty()
  payload: any; // content: { text: "..." } or template object

  @IsOptional()
  skipBilling?: boolean;

  @IsOptional()
  @IsUUID()
  campaignId?: string;
}
