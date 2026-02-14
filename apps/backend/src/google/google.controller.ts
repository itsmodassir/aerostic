import { Controller, Get, Query, Res, Req, UseGuards, BadRequestException } from '@nestjs/common';
import { GoogleService } from './google.service';
import { ConfigService } from '@nestjs/config';
import { Response } from 'express';

@Controller('google')
export class GoogleController {
    constructor(
        private readonly googleService: GoogleService,
        private readonly configService: ConfigService,
    ) { }

    @Get('auth')
    async googleAuth(@Query('tenantId') tenantId: string, @Res() res: Response) {
        if (!tenantId) throw new BadRequestException('Tenant ID is required');

        const clientId = this.configService.get('GOOGLE_CLIENT_ID');
        const redirectUri = this.configService.get('GOOGLE_REDIRECT_URI');

        const scopes = [
            'https://www.googleapis.com/auth/drive.readonly',
            'https://www.googleapis.com/auth/drive.file'
        ];

        const url = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code&scope=${scopes.join(' ')}&access_type=offline&state=${tenantId}&prompt=consent`;

        res.redirect(url);
    }

    @Get('callback')
    async googleAuthCallback(@Query('code') code: string, @Query('state') tenantId: string, @Res() res: Response) {
        if (!code || !tenantId) throw new BadRequestException('Invalid callback parameters');

        await this.googleService.handleAuthCallback(tenantId, code);

        // Close the popup or redirect back to dashboard
        res.send(`
      <script>
        window.opener.postMessage({ type: 'GOOGLE_AUTH_SUCCESS' }, '*');
        window.close();
      </script>
    `);
    }
}
