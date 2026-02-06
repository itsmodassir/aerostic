import { Controller, Get, UseGuards, Query } from '@nestjs/common';
import { AuditService } from './audit.service';
import { LogLevel, LogCategory } from './entities/audit-log.entity';
import { AdminGuard } from '../common/guards/admin.guard';

@Controller('admin/audit-logs')
@UseGuards(AdminGuard)
export class AuditController {
  constructor(private readonly auditService: AuditService) {}

  @Get()
  async getLogs(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('level') level?: LogLevel,
    @Query('category') category?: LogCategory,
    @Query('search') search?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    const filters: any = {};

    if (page) filters.page = parseInt(page.toString());
    if (limit) filters.limit = parseInt(limit.toString());
    if (level) filters.level = level;
    if (category) filters.category = category;
    if (search) filters.search = search;
    if (startDate) filters.startDate = new Date(startDate);
    if (endDate) filters.endDate = new Date(endDate);

    return this.auditService.getLogsWithFilters(filters);
  }

  @Get('stats')
  async getStats() {
    return this.auditService.getLogStats();
  }
}
