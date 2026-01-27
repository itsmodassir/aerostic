import { Tenant } from '../../tenants/entities/tenant.entity';
export declare enum UserRole {
    SUPER_ADMIN = "super_admin",
    ADMIN = "admin",
    AGENT = "agent"
}
export declare class User {
    id: string;
    tenantId: string;
    tenant: Tenant;
    name: string;
    email: string;
    passwordHash: string;
    role: UserRole;
    createdAt: Date;
}
