import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsEnum,
  IsUUID,
  IsNumber,
} from "class-validator";
import { ReferralStatus, RewardStatus } from "../entities/referral.entity";

export class CreateReferralDto {
  @IsNotEmpty()
  @IsString()
  code: string;

  @IsOptional()
  @IsEnum(ReferralStatus)
  status?: ReferralStatus;

  @IsOptional()
  @IsEnum(RewardStatus)
  rewardStatus?: RewardStatus;

  @IsOptional()
  @IsNumber()
  rewardAmount?: number;

  @IsNotEmpty()
  @IsUUID()
  referrerId: string;

  @IsOptional()
  @IsUUID()
  refereeId?: string;

  @IsOptional()
  @IsUUID()
  tenantId?: string;
}
