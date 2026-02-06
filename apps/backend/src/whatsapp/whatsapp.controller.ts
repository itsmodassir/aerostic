import { Controller, Get, Query, Res, Post, Body, Delete, UseGuards } from '@nestjs/common';
import { WhatsappService } from './whatsapp.service';
import type { Response } from 'express';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { UserTenant } from '../auth/decorators/user-tenant.decorator';

@Controller('whatsapp')
@UseGuards(JwtAuthGuard)
export class WhatsappController {
    constructor(private readonly whatsappService: WhatsappService) { }

    @Get('embedded/start')
    async startEmbeddedSignup(
        @UserTenant() tenantId: string,
        @Res() res: Response,
    ) {
        const url = await this.whatsappService.getEmbeddedSignupUrl(tenantId);
        return res.redirect(url);
    }
    @Get('status')
    async getStatus(@UserTenant() tenantId: string) {
        return this.whatsappService.getStatus(tenantId);
    }

    @Get('public-config')
    async getPublicConfig() {
        return this.whatsappService.getPublicConfig();
    }

    @Delete()
    async disconnect(@UserTenant() tenantId: string) {
        return this.whatsappService.disconnect(tenantId);
    }

    @Post('send-test')
    async sendTest(@UserTenant() tenantId: string, @Body('to') to: string) {
        return this.whatsappService.sendTestMessage(tenantId, to);
    }

    // Cloud API Onboarding (Mode 1)
    @Post('cloud/init')
    async initCloudSignup(
        @UserTenant() tenantId: string,
        @Body() body: { phoneNumber: string }
    ) {
        // Init logic
        return { status: 'otp_sent', phoneNumber: body.phoneNumber };
    }

    @Post('cloud/verify')
    async verifyCloudSignup(
        @UserTenant() tenantId: string,
        @Body() body: { otp: string }
    ) {
        // Verify logic
        return { status: 'connected', wabaId: 'new_waba_id' };
    }
}
