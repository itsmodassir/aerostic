import {
  Controller,
  Get,
  Post,
  Query,
  Body,
  Req,
  Res,
  HttpStatus,
  Logger,
} from "@nestjs/common";
import { WebhooksService } from "./webhooks.service";
import type { Request, Response } from "express";

@Controller("webhooks")
export class WebhooksController {
  private readonly logger = new Logger(WebhooksController.name);
  constructor(private readonly webhooksService: WebhooksService) { }

  @Get("meta")
  verify(
    @Query("hub.mode") mode: string,
    @Query("hub.verify_token") token: string,
    @Query("hub.challenge") challenge: string,
    @Res() res: Response,
  ) {
    this.logger.log(`Received verification request: mode=${mode}, token=${token}`);
    try {
      const result = this.webhooksService.verifyWebhook(mode, token, challenge);
      this.logger.log("Verification successful");
      return res.status(HttpStatus.OK).send(result);
    } catch (e) {
      this.logger.error(`Verification failed: ${e.message}`);
      return res.status(HttpStatus.FORBIDDEN).send();
    }
  }

  @Post("meta")
  async receive(@Req() req: Request, @Res() res: Response, @Body() body: any) {
    const signature = req.headers["x-hub-signature-256"] as string;
    this.logger.log(`Received webhook POST. Signature: ${signature}`);

    if (!signature) {
      this.logger.warn("Signature missing from webhook request");
      return res.status(HttpStatus.FORBIDDEN).send("Signature missing");
    }

    // Use rawBody if available, otherwise fallback to stringified body (less reliable)
    const rawBody = (req as any).rawBody || JSON.stringify(body);
    const isValid = this.webhooksService.verifySignature(
      rawBody,
      signature,
    );

    if (!isValid) {
      this.logger.error("Invalid signature detected for webhook payload");
      return res.status(HttpStatus.FORBIDDEN).send("Invalid signature");
    }

    this.logger.log("Signature valid, enqueuing payload for processing");
    await this.webhooksService.processWebhook(body);
    return res.status(HttpStatus.OK).json({ status: "ok" });
  }
}

