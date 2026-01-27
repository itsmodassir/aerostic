import { Controller, Get, Post, UseGuards } from '@nestjs/common';
import { AdminService } from './admin.service';

@Controller('admin')
export class AdminController {
    constructor(private readonly adminService: AdminService) { }

    @Get('tenants')
    async getAllTenants() {
        return this.adminService.getAllTenants();
    }

    @Get('whatsapp-accounts')
    async getAllAccounts() {
        return this.adminService.getAllAccounts();
    }

    @Post('tokens/rotate')
    async rotateSystemTokens() {
        return this.adminService.rotateSystemTokens();
    }

    @Get('system-logs')
    async getLogs() {
        return this.adminService.getSystemLogs();
    }
}
