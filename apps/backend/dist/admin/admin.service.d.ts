import { Repository } from 'typeorm';
import { Tenant } from '../tenants/entities/tenant.entity';
import { WhatsappAccount } from '../whatsapp/entities/whatsapp-account.entity';
export declare class AdminService {
    private tenantRepo;
    private whatsappAccountRepo;
    constructor(tenantRepo: Repository<Tenant>, whatsappAccountRepo: Repository<WhatsappAccount>);
    getAllTenants(): Promise<Tenant[]>;
    getAllAccounts(): Promise<WhatsappAccount[]>;
    rotateSystemTokens(): Promise<{
        status: string;
        timestamp: Date;
    }>;
    getSystemLogs(): Promise<{
        uptime: number;
        memoryUsage: NodeJS.MemoryUsage;
        timestamp: Date;
    }>;
}
