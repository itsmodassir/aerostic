import { Repository } from 'typeorm';
import { Tenant } from '../tenants/entities/tenant.entity';
import { WhatsappAccount } from '../whatsapp/entities/whatsapp-account.entity';
import { SystemConfig } from './entities/system-config.entity';
import { Message } from '../messages/entities/message.entity';
import { ApiKey } from '../billing/entities/api-key.entity';
export declare class AdminService {
    private tenantRepo;
    private whatsappAccountRepo;
    private configRepo;
    private messageRepo;
    private apiKeyRepo;
    constructor(tenantRepo: Repository<Tenant>, whatsappAccountRepo: Repository<WhatsappAccount>, configRepo: Repository<SystemConfig>, messageRepo: Repository<Message>, apiKeyRepo: Repository<ApiKey>);
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
    getDashboardStats(): Promise<{
        stats: {
            label: string;
            value: string;
            change: string;
            up: boolean;
        }[];
        systemHealth: {
            service: string;
            status: string;
            uptime: string;
        }[];
    }>;
    getAllApiKeys(): Promise<{
        id: string;
        name: string;
        tenantName: any;
        key: string;
        status: string;
        createdAt: Date;
        lastUsed: Date;
        requests: string;
    }[]>;
}
