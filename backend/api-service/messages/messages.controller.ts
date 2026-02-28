import { Body, Controller, Post, Get, Param, UseGuards, Req } from "@nestjs/common";
import { MessagesService } from "./messages.service";
import { SendMessageDto } from "./dto/send-message.dto";
import { JwtAuthGuard } from "@api/auth/jwt-auth.guard";
import { UserTenant } from "../auth/decorators/user-tenant.decorator";

@Controller("messages")
@UseGuards(JwtAuthGuard)
export class MessagesController {
  constructor(private readonly messagesService: MessagesService) { }

  @Post("send")
  async sendMessage(
    @UserTenant() tenantId: string,
    @Body() dto: SendMessageDto,
    @Req() req: any,
  ) {
    dto.tenantId = tenantId;
    // Attach the authenticated user's ID as agentId when sending from dashboard
    // This triggers the AI handover auto-pause if enabled
    if (!dto.agentId && req.user?.id) {
      dto.agentId = req.user.id;
    }
    return this.messagesService.send(dto);
  }

  @Get("conversations")
  async getConversations(@UserTenant() tenantId: string) {
    return this.messagesService.getConversations(tenantId);
  }

  @Get("conversations/:id")
  async getConversationMessages(
    @UserTenant() tenantId: string,
    @Param("id") conversationId: string,
  ) {
    return this.messagesService.getMessages(tenantId, conversationId);
  }

  /** Get AI mode status + 24h window timer for a conversation */
  @Get("conversations/:id/status")
  async getConversationStatus(
    @UserTenant() tenantId: string,
    @Param("id") conversationId: string,
  ) {
    return this.messagesService.getConversationStatus(conversationId, tenantId);
  }

  /** Set AI mode: toggle between 'ai', 'human', or 'paused' */
  @Post("conversations/:id/ai-mode")
  async setAiMode(
    @UserTenant() tenantId: string,
    @Param("id") conversationId: string,
    @Body() body: { mode: 'ai' | 'human' | 'paused'; pauseMinutes?: number },
  ) {
    return this.messagesService.setAiMode(
      conversationId,
      tenantId,
      body.mode,
      body.pauseMinutes,
    );
  }
}
