import { Controller, Get, Post, Body, Query, BadRequestException } from "@nestjs/common";
import { MetaService } from "./meta.service";

@Controller("meta")
export class MetaController {
  constructor(private readonly metaService: MetaService) {}

  @Get("callback")
  async metaCallback(
    @Query("code") code: string,
    @Query("state") state: string,
    @Query("wabaId") wabaId?: string,
    @Query("phoneNumberId") phoneNumberId?: string,
  ) {
    const [tenantId, mode] = (state || "").split(":");
    if (!tenantId) {
      throw new BadRequestException("Invalid OAuth state");
    }
    await this.metaService.handleOAuthCallback(
      code,
      tenantId,
      wabaId,
      phoneNumberId,
      undefined,
      mode,
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
  async handleWebhook(@Body() body: any) {
    return this.metaService.handleWebhookEvent(body);
  }
}
