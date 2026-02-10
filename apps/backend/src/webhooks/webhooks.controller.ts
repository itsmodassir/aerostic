import {
  Controller,
  Get,
  Post,
  Query,
  Body,
  Req,
  Res,
  HttpStatus,
} from '@nestjs/common';
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
  async receive(
    @Req() req: Request,
    @Res() res: Response,
    @Body() body: any,
  ) {
    const signature = req.headers['x-hub-signature-256'] as string;

    if (!signature) {
      return res.status(HttpStatus.FORBIDDEN).send('Signature missing');
    }

    const isValid = this.webhooksService.verifySignature(
      JSON.stringify(body),
      signature,
    );

    if (!isValid) {
      return res.status(HttpStatus.FORBIDDEN).send('Invalid signature');
    }

    await this.webhooksService.processWebhook(body);
    return res.status(HttpStatus.OK).json({ status: 'ok' });
  }
}
