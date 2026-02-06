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
} from '@nestjs/common';
import { AdminService } from './admin.service';
import { AdminGuard } from '../common/guards/admin.guard';

// DTO for config updates
interface UpdateConfigDto {
  [key: string]: string;
}

import {
  PlanType,
  SubscriptionStatus,
} from '../billing/entities/subscription.entity';

interface UpdateUserPlanDto {
  plan: PlanType;
  status?: SubscriptionStatus;
}

@Controller('admin')
@UseGuards(AdminGuard)
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  // ============ Tenant Management ============
  @Get('tenants')
  async getAllTenants() {
    return this.adminService.getAllTenants();
  }

  @Get('users')
  async getAllUsers() {
    return this.adminService.getAllUsers();
  }

  @Patch('users/:id/plan')
  async updateUserPlan(
    @Param('id') userId: string,
    @Body() dto: UpdateUserPlanDto,
  ) {
    return this.adminService.updateUserPlan(
      userId,
      dto.plan,
      dto.status as any,
    );
  }

  // ============ WhatsApp Account Management ============
  @Get('whatsapp-accounts')
  async getAllAccounts() {
    return this.adminService.getAllAccounts();
  }

  // ============ System Configuration ============
  @Get('config')
  async getConfig() {
    return this.adminService.getConfig();
  }

  @Post('config')
  async updateConfig(@Body() updates: UpdateConfigDto) {
    return this.adminService.setConfig(updates);
  }

  @Delete('config/:key')
  async deleteConfig(@Param('key') key: string) {
    await this.adminService.deleteConfig(key);
    return { success: true };
  }

  // ============ System Operations ============
  @Post('tokens/rotate')
  async rotateSystemTokens() {
    return this.adminService.rotateSystemTokens();
  }

  @Get('system-logs')
  async getLogs() {
    return this.adminService.getSystemLogs();
  }

  @Get('health')
  async getHealth() {
    return {
      status: 'healthy',
      uptime: process.uptime(),
      timestamp: new Date(),
      memory: process.memoryUsage(),
      version: '1.0.0',
    };
  }

  @Get('stats')
  async getStats() {
    return this.adminService.getDashboardStats();
  }

  @Get('stats/trends')
  async getTrends(@Query('range') range: string) {
    return this.adminService.getAnalyticsTrends(range);
  }

  @Get('api-keys')
  async getApiKeys() {
    return this.adminService.getAllApiKeys();
  }

  @Get('messages')
  async getMessages(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 20,
    @Query('search') search?: string,
  ) {
    return this.adminService.getAllMessages(page, limit, search);
  }

  @Get('webhooks')
  async getWebhooks() {
    return this.adminService.getAllWebhooks();
  }

  @Get('billing/stats')
  async getBillingStats() {
    return this.adminService.getBillingStats();
  }

  @Get('alerts')
  async getAlerts() {
    return this.adminService.getSystemAlerts();
  }
}
