import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { TenantsService } from '../tenants/tenants.service';
import { UserRole } from '../users/entities/user.entity';
declare class LoginDto {
    email: string;
    password: string;
}
declare class RegisterDto {
    email: string;
    password: string;
    name: string;
    workspace: string;
}
export declare class AuthController {
    private authService;
    private usersService;
    private tenantsService;
    constructor(authService: AuthService, usersService: UsersService, tenantsService: TenantsService);
    login(loginDto: LoginDto): Promise<{
        access_token: string;
    }>;
    register(registerDto: RegisterDto): Promise<{
        id: string;
        tenantId: string;
        tenant: import("../tenants/entities/tenant.entity").Tenant;
        name: string;
        email: string;
        role: UserRole;
        phone: string;
        avatar: string;
        apiAccessEnabled: boolean;
        isActive: boolean;
        emailVerified: boolean;
        lastLoginAt: Date;
        createdAt: Date;
        updatedAt: Date;
    }>;
    getProfile(): Promise<{
        id: string;
        email: string;
    }>;
}
export {};
