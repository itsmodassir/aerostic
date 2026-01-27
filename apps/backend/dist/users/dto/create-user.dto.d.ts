import { UserRole } from '../entities/user.entity';
export declare class CreateUserDto {
    tenantId: string;
    name: string;
    email: string;
    password: string;
    role: UserRole;
}
