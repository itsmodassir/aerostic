import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, Like } from 'typeorm';
import { AuditLog, LogLevel, LogCategory } from './entities/audit-log.entity';

interface LogFilters {
  tenantId?: string;
  page?: number;
  limit?: number;
  level?: LogLevel;
  category?: LogCategory;
  search?: string;
  startDate?: Date;
  endDate?: Date;
}

@Injectable()
export class AuditService {
  constructor(
    @InjectRepository(AuditLog)
    private auditRepo: Repository<AuditLog>,
  ) { }

  async logAction(
    actorId: string,
    actorName: string,
    action: string,
    target: string,
    tenantId?: string,
    metadata: any = {},
    ipAddress: string = '',
    level: LogLevel = LogLevel.INFO,
    category: LogCategory = LogCategory.SYSTEM,
    source?: string,
  ) {
    const log = this.auditRepo.create({
      actorId,
      actorName,
      action,
      target,
      tenantId,
      metadata,
      ipAddress,
      level,
      category,
      source,
    });
    return this.auditRepo.save(log);
  }

  async getLogs(limit: number = 100) {
    return this.auditRepo.find({
      order: { timestamp: 'DESC' },
      take: limit,
    });
  }

  async getLogsWithFilters(filters: LogFilters = {}) {
    const {
      tenantId,
      page = 1,
      limit = 50,
      level,
      category,
      search,
      startDate,
      endDate,
    } = filters;

    const query = this.auditRepo.createQueryBuilder('log');

    // Apply filters
    if (tenantId) {
      query.andWhere('log.tenantId = :tenantId', { tenantId });
    }
    if (level) {
      query.andWhere('log.level = :level', { level });
    }

    if (category) {
      query.andWhere('log.category = :category', { category });
    }

    if (search) {
      query.andWhere(
        '(log.action ILIKE :search OR log.actorName ILIKE :search OR log.target ILIKE :search)',
        { search: `%${search}%` },
      );
    }

    if (startDate && endDate) {
      query.andWhere('log.timestamp BETWEEN :startDate AND :endDate', {
        startDate,
        endDate,
      });
    } else if (startDate) {
      query.andWhere('log.timestamp >= :startDate', { startDate });
    } else if (endDate) {
      query.andWhere('log.timestamp <= :endDate', { endDate });
    }

    // Get total count
    const total = await query.getCount();

    // Apply pagination
    query
      .orderBy('log.timestamp', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    const logs = await query.getMany();

    return {
      data: logs,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  // Get log statistics for the last 24 hours
  async getLogStats() {
    const oneDayAgo = new Date();
    oneDayAgo.setHours(oneDayAgo.getHours() - 24);

    const stats = await this.auditRepo
      .createQueryBuilder('log')
      .select('log.level', 'level')
      .addSelect('COUNT(*)', 'count')
      .where('log.timestamp >= :oneDayAgo', { oneDayAgo })
      .groupBy('log.level')
      .getRawMany();

    const result = {
      info: 0,
      success: 0,
      warning: 0,
      error: 0,
    };

    stats.forEach((stat) => {
      const level = stat.level as keyof typeof result;
      if (level in result) {
        result[level] = parseInt(stat.count);
      }
    });

    return result;
  }
}
