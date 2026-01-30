import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { AdminService } from './admin.service';

// DTO for config updates
interface UpdateConfigDto {
    [key: string]: string;
}

interface UpdateUserPlanDto {
    plan: 'starter' | 'growth' | 'enterprise';
}

@Controller('admin')
export class AdminController {
    constructor(private readonly adminService: AdminService) { }

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
        return this.adminService.updateUserPlan(userId, dto.plan);
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
}
