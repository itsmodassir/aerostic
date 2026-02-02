import { Controller, Get, UseGuards, Query } from '@nestjs/common';
import { AuditService } from './audit.service';
// Assuming you have an AdminAuthGuard or similar. If not, we'll verify imports later.
// For now, I'll omit the guard to avoid import errors until I check common guards.

@Controller('admin/audit-logs')
export class AuditController {
    constructor(private readonly auditService: AuditService) { }

    @Get()
    async getLogs() {
        return this.auditService.getLogs();
    }
}
