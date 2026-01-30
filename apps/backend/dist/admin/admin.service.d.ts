import { Repository } from 'typeorm';
import { Tenant } from '../tenants/entities/tenant.entity';
import { WhatsappAccount } from '../whatsapp/entities/whatsapp-account.entity';
import { SystemConfig } from './entities/system-config.entity';
export declare class AdminService {
    private tenantRepo;
    private whatsappAccountRepo;
    private configRepo;
    constructor(tenantRepo: Repository<Tenant>, whatsappAccountRepo: Repository<WhatsappAccount>, configRepo: Repository<SystemConfig>);
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
    getConfig(): Promise<Record<string, any>>;
    getConfigValue(key: string): Promise<string | null>;
    setConfig(updates: Record<string, string>): Promise<{
        success: boolean;
        updated: string[];
    }>;
    deleteConfig(key: string): Promise<void>;
    updateUserPlan(userId: string, plan: 'starter' | 'growth' | 'enterprise'): Promise<Tenant>;
    getTenantById(tenantId: string): Promise<Tenant>;
    getAllUsers(): Promise<any[]>;
}
