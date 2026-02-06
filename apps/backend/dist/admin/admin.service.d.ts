import { Repository } from 'typeorm';
import { Tenant } from '../tenants/entities/tenant.entity';
import { WhatsappAccount } from '../whatsapp/entities/whatsapp-account.entity';
import { SystemConfig } from './entities/system-config.entity';
import { Message } from '../messages/entities/message.entity';
import { ApiKey } from '../billing/entities/api-key.entity';
import { WebhookEndpoint } from '../billing/entities/webhook-endpoint.entity';
import { AuditService } from '../audit/audit.service';
import { Subscription, SubscriptionStatus, PlanType } from '../billing/entities/subscription.entity';
import { BillingService } from '../billing/billing.service';
export declare class AdminService {
    private tenantRepo;
    private whatsappAccountRepo;
    private configRepo;
    private messageRepo;
    private apiKeyRepo;
    private subscriptionRepo;
    private webhookEndpointRepo;
    private auditService;
    private billingService;
    constructor(tenantRepo: Repository<Tenant>, whatsappAccountRepo: Repository<WhatsappAccount>, configRepo: Repository<SystemConfig>, messageRepo: Repository<Message>, apiKeyRepo: Repository<ApiKey>, subscriptionRepo: Repository<Subscription>, webhookEndpointRepo: Repository<WebhookEndpoint>, auditService: AuditService, billingService: BillingService);
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
    updateUserPlan(userId: string, plan: PlanType, status?: SubscriptionStatus): Promise<Tenant>;
    getTenantById(tenantId: string): Promise<Tenant>;
    getAllUsers(): Promise<any[]>;
    checkSystemHealth(): Promise<{
        service: string;
        status: string;
        uptime: string;
    }[]>;
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
    getRecentAlerts(): Promise<{
        type: string;
        message: string;
        time: string;
    }[]>;
    getAnalyticsTrends(period?: string): Promise<{
        revenue: {
            date: string;
            value: number;
        }[];
        messages: {
            date: string;
            value: number;
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
    getAllMessages(page?: number, limit?: number, search?: string): Promise<{
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
    getAllWebhooks(): Promise<{
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
    getSystemAlerts(): Promise<{
        id: string;
        type: string;
        title: string;
        description: string;
        source: string;
        time: string;
        acknowledged: boolean;
    }[]>;
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
}
