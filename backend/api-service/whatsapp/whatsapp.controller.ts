import {
  Controller,
  Get,
  Query,
  Res,
  Post,
  Put,
  Patch,
  Body,
  Delete,
  Param,
  UseGuards,
  BadRequestException,
  UseInterceptors,
  UploadedFile,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { WhatsappService } from "@shared/whatsapp/whatsapp.service";
import type { Response } from "express";
import { JwtAuthGuard } from "@api/auth/jwt-auth.guard";
import { UserTenant } from "../auth/decorators/user-tenant.decorator";

@Controller("whatsapp")
export class WhatsappController {
  constructor(private readonly whatsappService: WhatsappService) {}

  @UseGuards(JwtAuthGuard)
  @Get("embedded/url")
  async getEmbeddedSignupUrl(
    @UserTenant() tenantId: string,
    @Query("mode") mode?: string,
  ) {
    const selectedMode = mode || "coexistence";
    if (!["coexistence", "cloud"].includes(selectedMode)) {
      throw new BadRequestException("Invalid embedded signup mode");
    }
    const url = await this.whatsappService.getEmbeddedSignupUrl(
      tenantId,
      selectedMode as "coexistence" | "cloud",
    );
    return { url };
  }

  @UseGuards(JwtAuthGuard)
  @Get("embedded/start")
  async startEmbeddedSignup(
    @UserTenant() tenantId: string,
    @Query("mode") mode: string | undefined,
    @Res() res: Response,
  ) {
    const selectedMode = mode || "coexistence";
    if (!["coexistence", "cloud"].includes(selectedMode)) {
      throw new BadRequestException("Invalid embedded signup mode");
    }
    const url = await this.whatsappService.getEmbeddedSignupUrl(
      tenantId,
      selectedMode as "coexistence" | "cloud",
    );
    return res.redirect(url);
  }
  @UseGuards(JwtAuthGuard)
  @Get("status")
  async getStatus(@UserTenant() tenantId: string) {
    return this.whatsappService.getStatus(tenantId);
  }

  @Get("public-config")
  async getPublicConfig() {
    return this.whatsappService.getPublicConfig();
  }

  @UseGuards(JwtAuthGuard)
  @Delete()
  async disconnect(@UserTenant() tenantId: string) {
    return this.whatsappService.disconnect(tenantId);
  }

  @UseGuards(JwtAuthGuard)
  @Post("send-test")
  async sendTest(@UserTenant() tenantId: string, @Body("to") to: string) {
    return this.whatsappService.sendTestMessage(tenantId, to);
  }

  // Cloud API Onboarding (Mode 1)
  @UseGuards(JwtAuthGuard)
  @Post("cloud/init")
  async initCloudSignup(
    @UserTenant() tenantId: string,
    @Body() body: { phoneNumber: string },
  ) {
    // Init logic
    return { status: "otp_sent", phoneNumber: body.phoneNumber };
  }

  @UseGuards(JwtAuthGuard)
  @Post("cloud/verify")
  async verifyCloudSignup(
    @UserTenant() tenantId: string,
    @Body() body: { otp: string },
  ) {
    // Verify logic
    return { status: "connected", wabaId: "new_waba_id" };
  }

  @UseGuards(JwtAuthGuard)
  @Get("account-details")
  async getAccountDetails(@UserTenant() tenantId: string) {
    return this.whatsappService.getAccountDetails(tenantId);
  }

  @UseGuards(JwtAuthGuard)
  @Post("sync-account")
  async syncAccount(@UserTenant() tenantId: string) {
    return this.whatsappService.syncAccountFromMeta(tenantId);
  }

  @UseGuards(JwtAuthGuard)
  @Get("flows")
  async getFlows(@UserTenant() tenantId: string) {
    return this.whatsappService.getFlows(tenantId);
  }

  @UseGuards(JwtAuthGuard)
  @Get("flows/published")
  async getPublishedFlows(@UserTenant() tenantId: string) {
    return this.whatsappService.getPublishedFlows(tenantId);
  }

  @UseGuards(JwtAuthGuard)
  @Post("flows")
  async createFlow(
    @UserTenant() tenantId: string,
    @Body() body: { name: string; categories: string[]; endpointUri?: string },
  ) {
    return this.whatsappService.createFlow(tenantId, body.name, body.categories, undefined, body.endpointUri);
  }

  @UseGuards(JwtAuthGuard)
  @Delete("flows/:id")
  async deleteFlow(@UserTenant() tenantId: string, @Param("id") flowId: string) {
    return this.whatsappService.deleteFlow(tenantId, flowId);
  }

  @UseGuards(JwtAuthGuard)
  @Post("flows/:id/publish")
  async publishFlow(
    @UserTenant() tenantId: string,
    @Param("id") flowId: string,
  ) {
    return this.whatsappService.publishFlow(tenantId, flowId);
  }
  
  @UseGuards(JwtAuthGuard)
  @Post("flows/:id/unpublish")
  async unpublishFlow(
    @UserTenant() tenantId: string,
    @Param("id") flowId: string,
  ) {
    return this.whatsappService.deprecateFlow(tenantId, flowId);
  }

  @UseGuards(JwtAuthGuard)
  @Get("flows/:id/assets")
  async getFlowAssets(
    @UserTenant() tenantId: string,
    @Param("id") flowId: string,
  ) {
    return this.whatsappService.getFlowAssets(tenantId, flowId);
  }

  @UseGuards(JwtAuthGuard)
  @Post("flows/:id/assets")
  async updateFlowAsset(
    @UserTenant() tenantId: string,
    @Param("id") flowId: string,
    @Body() body: { json: any },
  ) {
    return this.whatsappService.uploadFlowAsset(tenantId, flowId, "flow.json", body.json);
  }

  @UseGuards(JwtAuthGuard)
  @Get("flows/:id/json")
  async getFlowJsonEditor(
    @UserTenant() tenantId: string,
    @Param("id") flowId: string,
  ) {
    return this.whatsappService.getFlowJsonEditor(tenantId, flowId);
  }

  @UseGuards(JwtAuthGuard)
  @Put("flows/:id/json")
  async updateFlowJsonEditor(
    @UserTenant() tenantId: string,
    @Param("id") flowId: string,
    @Body() body: { json: any; useCustomOverride?: boolean },
  ) {
    return this.whatsappService.updateFlowJsonEditor(tenantId, flowId, body);
  }

  @UseGuards(JwtAuthGuard)
  @Delete("flows/:id/json")
  async clearFlowJsonOverride(
    @UserTenant() tenantId: string,
    @Param("id") flowId: string,
  ) {
    return this.whatsappService.clearFlowJsonOverride(tenantId, flowId);
  }
  @UseGuards(JwtAuthGuard)
  @Post("smb-sync")
  async triggerSmbSync(@UserTenant() tenantId: string) {
    return this.whatsappService.triggerSmbSync(tenantId);
  }

  // ─── Business Profile ───────────────────────────────────────────────────────

  @UseGuards(JwtAuthGuard)
  @Get("profile")
  async getProfile(@UserTenant() tenantId: string) {
    return this.whatsappService.getBusinessProfile(tenantId);
  }

  @UseGuards(JwtAuthGuard)
  @Post("profile") // Using POST for general updates as Meta does
  async updateProfile(@UserTenant() tenantId: string, @Body() body: any) {
    return this.whatsappService.updateBusinessProfile(tenantId, body);
  }

  @UseGuards(JwtAuthGuard)
  @Post("profile/photo")
  @UseInterceptors(FileInterceptor("file"))
  async uploadPhoto(
    @UserTenant() tenantId: string,
    @UploadedFile() file: any,
  ) {
    if (!file) throw new BadRequestException("No file uploaded");
    return this.whatsappService.uploadProfilePhoto(tenantId, file.buffer, file.mimetype);
  }

  // ─── Flow Canvas ──────────────────────────────────────────────────────────

  @UseGuards(JwtAuthGuard)
  @Get("flows/:id/canvas")
  async getFlowCanvas(
    @UserTenant() tenantId: string,
    @Param("id") flowId: string,
  ) {
    return this.whatsappService.getFlowCanvas(tenantId, flowId);
  }

  @UseGuards(JwtAuthGuard)
  @Put("flows/:id/canvas")
  async updateFlowCanvas(
    @UserTenant() tenantId: string,
    @Param("id") flowId: string,
    @Body() body: { name: string; flowData: any },
  ) {
    return this.whatsappService.saveFlowCanvas(tenantId, flowId, body);
  }
}
