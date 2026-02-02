import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuditLog } from './entities/audit-log.entity';

@Injectable()
export class AuditService {
    constructor(
        @InjectRepository(AuditLog)
        private auditRepo: Repository<AuditLog>,
    ) { }

    async logAction(actorId: string, actorName: string, action: string, target: string, metadata: any = {}, ipAddress: string = '') {
        const log = this.auditRepo.create({
            actorId,
            actorName,
            action,
            target,
            metadata,
            ipAddress,
        });
        return this.auditRepo.save(log);
    }

    async getLogs(limit: number = 100) {
        return this.auditRepo.find({
            order: { timestamp: 'DESC' },
            take: limit,
        });
    }
}
