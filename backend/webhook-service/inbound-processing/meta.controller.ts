import { Controller, Get, Post, Body, Query, UseGuards } from "@nestjs/common";
import { MetaService } from "./meta.service";
import { MetaSignatureGuard } from "./guards/meta-signature.guard";

@Controller("meta")
export class MetaController {
  constructor(private readonly metaService: MetaService) {}

  @Get("callback")
  async metaCallback(
    @Query("code") code: string,
    @Query("state") tenantId: string,
    @Query("wabaId") wabaId?: string,
    @Query("phoneNumberId") phoneNumberId?: string,
  ) {
    await this.metaService.handleOAuthCallback(
      code,
      tenantId,
      wabaId,
      phoneNumberId,
    );
    return { success: true, message: "WhatsApp Connected Successfully" };
  }

  @Get("webhook")
  async verifyWebhook(
    @Query("hub.mode") mode: string,
    @Query("hub.verify_token") token: string,
    @Query("hub.challenge") challenge: string,
  ) {
    return this.metaService.verifyWebhook(mode, token, challenge);
  }

  @Post("webhook")
  @UseGuards(MetaSignatureGuard)
  async handleWebhook(@Body() body: any) {
    return this.metaService.handleWebhookEvent(body);
  }
}
