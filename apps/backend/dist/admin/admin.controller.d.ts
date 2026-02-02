import { AdminService } from './admin.service';
interface UpdateConfigDto {
    [key: string]: string;
}
interface UpdateUserPlanDto {
    plan: 'starter' | 'growth' | 'enterprise';
}
export declare class AdminController {
    private readonly adminService;
    constructor(adminService: AdminService);
    getAllTenants(): Promise<import("../tenants/entities/tenant.entity").Tenant[]>;
    getAllUsers(): Promise<any[]>;
    updateUserPlan(userId: string, dto: UpdateUserPlanDto): Promise<import("../tenants/entities/tenant.entity").Tenant>;
    getAllAccounts(): Promise<import("../whatsapp/entities/whatsapp-account.entity").WhatsappAccount[]>;
    getConfig(): Promise<Record<string, any>>;
    updateConfig(updates: UpdateConfigDto): Promise<{
        success: boolean;
        updated: string[];
    }>;
    deleteConfig(key: string): Promise<{
        success: boolean;
    }>;
    rotateSystemTokens(): Promise<{
        status: string;
        timestamp: Date;
    }>;
    getLogs(): Promise<{
        uptime: number;
        memoryUsage: NodeJS.MemoryUsage;
        timestamp: Date;
    }>;
    getHealth(): Promise<{
        status: string;
        uptime: number;
        timestamp: Date;
        memory: NodeJS.MemoryUsage;
        version: string;
    }>;
    getStats(): Promise<{
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
    getApiKeys(): Promise<{
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
export {};
