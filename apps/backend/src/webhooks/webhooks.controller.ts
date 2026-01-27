import { Controller, Get, Post, Query, Body, Req, Res, HttpStatus } from '@nestjs/common';
import { WebhooksService } from './webhooks.service';
import type { Request, Response } from 'express';

@Controller('webhooks')
export class WebhooksController {
    constructor(private readonly webhooksService: WebhooksService) { }

    @Get('meta')
    verify(
        @Query('hub.mode') mode: string,
        @Query('hub.verify_token') token: string,
        @Query('hub.challenge') challenge: string,
        @Res() res: Response,
    ) {
        try {
            const result = this.webhooksService.verifyWebhook(mode, token, challenge);
            return res.status(HttpStatus.OK).send(result);
        } catch (e) {
            return res.status(HttpStatus.FORBIDDEN).send();
        }
    }

    @Post('meta')
    async receive(@Body() body: any) {
        // In production: Verify X-Hub-Signature header here
        await this.webhooksService.processWebhook(body);
        return { status: 'ok' };
    }
}
