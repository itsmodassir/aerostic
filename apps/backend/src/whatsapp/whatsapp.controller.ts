import {
  Controller,
  Get,
  Query,
  Res,
  Post,
  Body,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { WhatsappService } from './whatsapp.service';
import type { Response } from 'express';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { UserTenant } from '../auth/decorators/user-tenant.decorator';

@Controller('whatsapp')
export class WhatsappController {
  constructor(private readonly whatsappService: WhatsappService) { }

  @UseGuards(JwtAuthGuard)
  @Get('embedded/start')
  async startEmbeddedSignup(
    @UserTenant() tenantId: string,
    @Res() res: Response,
  ) {
    const url = await this.whatsappService.getEmbeddedSignupUrl(tenantId);
    return res.redirect(url);
  }
  @UseGuards(JwtAuthGuard)
  @Get('status')
  async getStatus(@UserTenant() tenantId: string) {
    return this.whatsappService.getStatus(tenantId);
  }

  @Get('public-config')
  async getPublicConfig() {
    return this.whatsappService.getPublicConfig();
  }

  @UseGuards(JwtAuthGuard)
  @Delete()
  async disconnect(@UserTenant() tenantId: string) {
    return this.whatsappService.disconnect(tenantId);
  }

  @UseGuards(JwtAuthGuard)
  @Post('send-test')
  async sendTest(@UserTenant() tenantId: string, @Body('to') to: string) {
    return this.whatsappService.sendTestMessage(tenantId, to);
  }

  // Cloud API Onboarding (Mode 1)
  @UseGuards(JwtAuthGuard)
  @Post('cloud/init')
  async initCloudSignup(
    @UserTenant() tenantId: string,
    @Body() body: { phoneNumber: string },
  ) {
    // Init logic
    return { status: 'otp_sent', phoneNumber: body.phoneNumber };
  }

  @UseGuards(JwtAuthGuard)
  @Post('cloud/verify')
  async verifyCloudSignup(
    @UserTenant() tenantId: string,
    @Body() body: { otp: string },
  ) {
    // Verify logic
    return { status: 'connected', wabaId: 'new_waba_id' };
  }

  @UseGuards(JwtAuthGuard)
  @Get('account-details')
  async getAccountDetails(@UserTenant() tenantId: string) {
    return this.whatsappService.getAccountDetails(tenantId);
  }

  @UseGuards(JwtAuthGuard)
  @Post('sync-account')
  async syncAccount(@UserTenant() tenantId: string) {
    return this.whatsappService.syncAccountFromMeta(tenantId);
  }
}
