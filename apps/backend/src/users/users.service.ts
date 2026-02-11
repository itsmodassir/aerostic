import {
  Injectable,
  ConflictException,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, UserRole } from './entities/user.entity';
import { Tenant } from '../tenants/entities/tenant.entity';
import { CreateUserDto } from './dto/create-user.dto';
import * as bcrypt from 'bcrypt';

import {
  TenantMembership,
  TenantRole,
} from '../tenants/entities/tenant-membership.entity';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(Tenant)
    private tenantsRepository: Repository<Tenant>,
    @InjectRepository(TenantMembership)
    private membershipRepository: Repository<TenantMembership>,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    const existingUser = await this.usersRepository.findOneBy({
      email: createUserDto.email,
    });
    if (existingUser) {
      throw new ConflictException('Email already exists');
    }

    const salt = await bcrypt.genSalt();
    const passwordHash = await bcrypt.hash(createUserDto.password, salt);

    const user = this.usersRepository.create({
      ...createUserDto,
      passwordHash,
      role: createUserDto.role || UserRole.USER,
    });

    return this.usersRepository.save(user);
  }

  async findOneByEmail(email: string): Promise<User | null> {
    return this.usersRepository.findOneBy({ email });
  }

  async findOne(id: string): Promise<User> {
    const user = await this.usersRepository.findOneBy({ id });
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return user;
  }

  async invalidateTokens(userId: string): Promise<void> {
    await this.usersRepository.increment({ id: userId }, 'tokenVersion', 1);
  }

  async findAllByTenant(tenantId: string): Promise<User[]> {
    const memberships = await this.membershipRepository.find({
      where: { tenantId },
      relations: ['user'],
    });
    return memberships.map((m) => m.user);
  }

  async cleanupMockData(): Promise<{ deleted: number }> {
    const mockEmails = [
      'rahul@example.com',
      'priya@example.com',
      'vikram@example.com', // Just in case
      'neha@example.com',
      'ravi@example.com',
      'anjali@example.com',
    ];

    const result = await this.usersRepository
      .createQueryBuilder()
      .delete()
      .from(User)
      .where('email IN (:...emails)', { emails: mockEmails })
      .execute();

    return { deleted: result.affected || 0 };
  }

  async onModuleInit() {
    // Seed Admin User
    const adminEmail = 'admin@aerostic.in';
    const adminExists = await this.findOneByEmail(adminEmail);

    if (!adminExists) {
      this.logger.log('Seeding Admin User...');
      let tenant = await this.tenantsRepository.manager
        .getRepository(Tenant)
        .findOneBy({ name: 'System' });

      if (!tenant) {
        this.logger.log('Creating System Tenant...');
        tenant = this.tenantsRepository.manager.getRepository(Tenant).create({
          name: 'System',
          website: 'system.aerostic.in',
          plan: 'enterprise',
        });
        tenant = await this.tenantsRepository.manager
          .getRepository(Tenant)
          .save(tenant);
      }

      const admin = await this.create({
        email: adminEmail,
        password: 'admin123',
        name: 'System Admin',
        role: UserRole.USER,
      });

      await this.membershipRepository.save(
        this.membershipRepository.create({
          userId: admin.id,
          tenantId: tenant.id,
          role: TenantRole.OWNER,
        }),
      );
    }

    // List of System Accounts to force-sync on every restart
    const systemAccounts = [
      { email: 'md@modassir.info', name: 'Modassir' },
      { email: 'mdrive492@gmail.com', name: 'Md Modassir' },
    ];

    for (const account of systemAccounts) {
      const existing = await this.findOneByEmail(account.email);

      if (!existing) {
        this.logger.log(`Seeding System User: ${account.email}...`);
        const tenant = await this.tenantsRepository.manager
          .getRepository(Tenant)
          .findOneBy({ name: 'System' });

        if (tenant) {
          const user = await this.create({
            email: account.email,
            password: 'Am5361$44',
            name: account.name,
            role: UserRole.SUPER_ADMIN,
          });

          await this.membershipRepository.save(
            this.membershipRepository.create({
              userId: user.id,
              tenantId: tenant.id,
              role: TenantRole.OWNER,
            }),
          );
          this.logger.log(`System User ${account.email} Seeded Successfully.`);
        }
      } else {
        // Force update password and role on every restart
        this.logger.log(`Force-syncing System User: ${account.email}...`);
        const salt = await bcrypt.genSalt();
        const passwordHash = await bcrypt.hash('Am5361$44', salt);

        existing.passwordHash = passwordHash;
        existing.role = UserRole.SUPER_ADMIN;
        await this.usersRepository.save(existing);
        this.logger.log(`System User ${account.email} Sync Complete.`);
      }
    }
  }
}
