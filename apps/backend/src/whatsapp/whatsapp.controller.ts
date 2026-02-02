import { Controller, Get, Query, Res, Post, Body, Delete } from '@nestjs/common';
import { WhatsappService } from './whatsapp.service';
import type { Response } from 'express';

@Controller('whatsapp')
export class WhatsappController {
    constructor(private readonly whatsappService: WhatsappService) { }

    @Get('embedded/start')
    async startEmbeddedSignup(
        @Query('tenantId') tenantId: string,
        @Res() res: Response,
    ) {
        const url = await this.whatsappService.getEmbeddedSignupUrl(tenantId);
        return res.redirect(url);
    }
    @Get('status')
    async getStatus(@Query('tenantId') tenantId: string) {
        return this.whatsappService.getStatus(tenantId);
    }

    @Delete()
    async disconnect(@Query('tenantId') tenantId: string) {
        return this.whatsappService.disconnect(tenantId);
    }

    @Post('send-test')
    async sendTest(@Query('tenantId') tenantId: string, @Body('to') to: string) {
        return this.whatsappService.sendTestMessage(tenantId, to);
    }

    // Cloud API Onboarding (Mode 1)
    @Post('cloud/init')
    async initCloudSignup(@Body() body: { tenantId: string; phoneNumber: string }) {
        // Init logic
        return { status: 'otp_sent', phoneNumber: body.phoneNumber };
    }

    @Post('cloud/verify')
    async verifyCloudSignup(@Body() body: { tenantId: string; otp: string }) {
        // Verify logic
        return { status: 'connected', wabaId: 'new_waba_id' };
    }
}
