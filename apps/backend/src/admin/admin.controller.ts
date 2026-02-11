import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
  Query,
  Req,
} from '@nestjs/common';
import { IsEnum, IsOptional, IsString, Allow } from 'class-validator';
import { Type } from 'class-transformer';
import { AdminGuard } from '../common/guards/admin.guard';
import { SuperAdminGuard } from '../common/guards/super-admin.guard';

// New Services
import { AdminConfigService } from './services/admin-config.service';
import { AdminTenantService } from './services/admin-tenant.service';
import { AdminBillingService } from './services/admin-billing.service';
import { AdminHealthService } from './services/admin-health.service';
import { AdminAnalyticsService } from './services/admin-analytics.service';
import { AdminDatabaseService } from './services/admin-database.service';
import { AdminInboxService } from './services/admin-inbox.service';
import { AuditService } from '../audit/audit.service';
import { AdminService } from './admin.service';

import {
  PlanType,
  SubscriptionStatus,
} from '../billing/entities/subscription.entity';
import { InboxFolderName } from './entities/email-message.entity';

class UpdateUserPlanDto {
  @IsEnum(PlanType)
  plan: PlanType;

  @IsOptional()
  @IsEnum(SubscriptionStatus)
  status?: SubscriptionStatus;
}

@Controller('admin')
@UseGuards(SuperAdminGuard)
export class AdminController {
  constructor(
    private readonly configService: AdminConfigService,
    private readonly tenantService: AdminTenantService,
    private readonly billingService: AdminBillingService,
    private readonly healthService: AdminHealthService,
    private readonly analyticsService: AdminAnalyticsService,
    private readonly databaseService: AdminDatabaseService,
    private readonly inboxService: AdminInboxService,
    private readonly auditService: AuditService,
    private readonly legacyAdminService: AdminService,
  ) {}

  // ============ Database Explorer ============
  @Get('database/tables')
  async getTables() {
    return this.databaseService.getTables();
  }

  @Get('database/tables/:tableName')
  async getTableData(
    @Param('tableName') tableName: string,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 50,
  ) {
    return this.databaseService.getTableData(tableName, page, limit);
  }

  // ============ Tenant Management ============
  @Get('tenants')
  async getAllTenants() {
    return this.tenantService.getAllTenants();
  }

  @Get('users')
  async getAllUsers() {
    // Fixed: Returns valid tenant summary instead of trying to look like users
    return this.tenantService.getAllTenantsSummary();
  }

  @Patch('users/:id/plan')
  async updateUserPlan(
    @Param('id') userId: string,
    @Body() dto: UpdateUserPlanDto,
  ) {
    return this.tenantService.updateUserPlan(
      userId,
      dto.plan,
      dto.status as any,
    );
  }

  // ============ WhatsApp Account Management ============
  @Get('whatsapp-accounts')
  async getAllAccounts() {
    return this.legacyAdminService.getAllAccounts();
  }

  // ============ System Configuration ============
  @Get('config')
  async getConfig() {
    return this.configService.getConfig();
  }

  @Post('config')
  async updateConfig(@Body() updates: any, @Req() req: any) {
    console.log('Received config update request:', updates);
    // Pass actor ID from request user
    return this.configService.setConfig(updates, req.user?.id);
  }

  @Delete('config/:key')
  async deleteConfig(@Param('key') key: string) {
    await this.configService.deleteConfig(key);
    return { success: true };
  }

  // ============ System Operations ============
  @Post('tokens/rotate')
  async rotateSystemTokens() {
    return this.legacyAdminService.rotateSystemTokens();
  }

  @Get('system-logs')
  async getLogs() {
    return this.healthService.getSystemLogs();
  }

  @Get('audit-logs')
  async getAuditLogs(@Query('limit') limit: number = 100) {
    return this.auditService.getLogs(limit);
  }

  @Get('health')
  async getHealth() {
    const health = await this.healthService.checkSystemHealth();
    return {
      status: 'healthy',
      checks: health,
      timestamp: new Date(),
      version: '1.0.0',
    };
  }

  @Get('env')
  async getEnv() {
    return this.healthService.getEnvContent();
  }

  @Get('stats')
  async getStats() {
    return this.analyticsService.getDashboardStats();
  }

  @Get('stats/trends')
  async getTrends(@Query('range') range: string) {
    return this.analyticsService.getAnalyticsTrends(range);
  }

  @Get('api-keys')
  async getApiKeys() {
    return this.billingService.getAllApiKeys();
  }

  @Get('messages')
  async getMessages(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 20,
    @Query('search') search?: string,
  ) {
    return this.legacyAdminService.getAllMessages(page, limit, search);
  }

  @Get('webhooks')
  async getWebhooks() {
    return this.billingService.getAllWebhooks();
  }

  @Get('billing/stats')
  async getBillingStats() {
    return this.billingService.getBillingStats();
  }

  @Get('alerts')
  async getAlerts() {
    return this.analyticsService.getSystemAlerts();
  }

  // ============ Admin Shared Inbox ============
  @Get('inbox/messages')
  async getInboxMessages(
    @Query('mailbox') mailbox?: string,
    @Query('folder') folder: InboxFolderName = InboxFolderName.INBOX,
  ) {
    return this.inboxService.getMessages(mailbox, folder);
  }

  @Get('inbox/messages/:id')
  async getInboxMessage(@Param('id') id: string) {
    return this.inboxService.getMessageById(id);
  }

  @Patch('inbox/messages/:id/read')
  async markInboxMessageRead(@Param('id') id: string) {
    return this.inboxService.markAsRead(id);
  }

  @Post('inbox/messages/send')
  async sendInboxMessage(
    @Body()
    dto: {
      mailbox: string;
      to: string;
      subject: string;
      content: string;
    },
  ) {
    return this.inboxService.sendMessage(
      dto.mailbox,
      dto.to,
      dto.subject,
      dto.content,
    );
  }

  @Post('inbox/messages/receive')
  async receiveInboxMessage(
    @Body()
    dto: {
      mailbox: string;
      from: string;
      to: string;
      subject: string;
      content: string;
    },
  ) {
    return this.inboxService.receiveMessage(
      dto.mailbox,
      dto.from,
      dto.to,
      dto.subject,
      dto.content,
    );
  }

  @Delete('inbox/messages/:id')
  async deleteInboxMessage(@Param('id') id: string) {
    return this.inboxService.deleteMessage(id);
  }
}
