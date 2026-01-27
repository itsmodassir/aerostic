import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Tenant } from '../tenants/entities/tenant.entity';
import { WhatsappAccount } from '../whatsapp/entities/whatsapp-account.entity';

@Injectable()
export class AdminService {
    constructor(
        @InjectRepository(Tenant)
        private tenantRepo: Repository<Tenant>,
        @InjectRepository(WhatsappAccount)
        private whatsappAccountRepo: Repository<WhatsappAccount>,
    ) { }

    async getAllTenants() {
        return this.tenantRepo.find({
            order: { createdAt: 'DESC' }
        });
    }

    async getAllAccounts() {
        return this.whatsappAccountRepo.find({
            relations: ['tenant'],
            order: { createdAt: 'DESC' }
        });
    }

    async rotateSystemTokens() {
        // Mock rotation logic for MVP - In real prod this would re-encrypt tokens
        console.log('Rotating system tokens...');
        return { status: 'success', timestamp: new Date() };
    }

    async getSystemLogs() {
        // Return basic server health stats
        return {
            uptime: process.uptime(),
            memoryUsage: process.memoryUsage(),
            timestamp: new Date(),
        };
    }
}
