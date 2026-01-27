import { AdminService } from './admin.service';
export declare class AdminController {
    private readonly adminService;
    constructor(adminService: AdminService);
    getAllTenants(): Promise<import("../tenants/entities/tenant.entity").Tenant[]>;
    getAllAccounts(): Promise<import("../whatsapp/entities/whatsapp-account.entity").WhatsappAccount[]>;
    rotateSystemTokens(): Promise<{
        status: string;
        timestamp: Date;
    }>;
    getLogs(): Promise<{
        uptime: number;
        memoryUsage: NodeJS.MemoryUsage;
        timestamp: Date;
    }>;
}
