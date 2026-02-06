import { AdminService } from './admin.service';
interface UpdateConfigDto {
    [key: string]: string;
}
import { PlanType, SubscriptionStatus } from '../billing/entities/subscription.entity';
interface UpdateUserPlanDto {
    plan: PlanType;
    status?: SubscriptionStatus;
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
        recentAlerts: {
            type: string;
            message: string;
            time: string;
        }[];
        topTenants: {
            name: string;
            plan: string;
            messages: string;
            revenue: string;
        }[];
    }>;
    getTrends(range: string): Promise<{
        revenue: {
            date: string;
            value: number;
        }[];
        messages: {
            date: string;
            value: number;
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
    getMessages(page?: number, limit?: number, search?: string): Promise<{
        data: {
            id: string;
            tenant: string;
            from: string;
            to: string;
            type: string;
            status: string;
            timestamp: Date;
        }[];
        total: number;
        page: number;
        totalPages: number;
    }>;
    getWebhooks(): Promise<{
        stats: {
            total: number;
            active: number;
            failing: number;
            deliveriesToday: string;
        };
        webhooks: {
            id: string;
            url: string;
            tenant: string;
            events: string[];
            status: string;
            lastDelivery: Date;
            successRate: string;
        }[];
    }>;
    getBillingStats(): Promise<{
        revenueStats: {
            label: string;
            value: string;
            change: string;
            period: string;
        }[];
        planDistribution: {
            plan: string;
            count: number;
            revenue: string;
            percentage: number;
        }[];
        recentTransactions: {
            id: string;
            tenant: string;
            plan: PlanType;
            amount: string;
            status: SubscriptionStatus;
            date: string;
        }[];
    }>;
    getAlerts(): Promise<{
        id: string;
        type: string;
        title: string;
        description: string;
        source: string;
        time: string;
        acknowledged: boolean;
    }[]>;
}
export {};
