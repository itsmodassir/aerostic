import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { Tenant } from '../tenants/entities/tenant.entity';
import { CreateUserDto } from './dto/create-user.dto';
export declare class UsersService {
    private usersRepository;
    private tenantsRepository;
    constructor(usersRepository: Repository<User>, tenantsRepository: Repository<Tenant>);
    create(createUserDto: CreateUserDto): Promise<User>;
    findOneByEmail(email: string): Promise<User | null>;
    findOne(id: string): Promise<User>;
    findAllByTenant(tenantId: string): Promise<User[]>;
    cleanupMockData(): Promise<{
        deleted: number;
    }>;
    onModuleInit(): Promise<void>;
}
