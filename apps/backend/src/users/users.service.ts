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

import { TenantMembership, TenantRole } from '../tenants/entities/tenant-membership.entity';

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
  ) { }

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
      // Check for System Tenant
      let tenant = await this.tenantsRepository.manager
        .getRepository(Tenant)
        .findOneBy({ name: 'System' });

      if (!tenant) {
        this.logger.log('Creating System Tenant...');
        tenant = this.tenantsRepository.manager.getRepository(Tenant).create({
          name: 'System',
          website: 'system.aerostic.in', // detailed below
          plan: 'enterprise',
        });
        tenant = await this.tenantsRepository.manager
          .getRepository(Tenant)
          .save(tenant);
      }

      // Create Admin User
      const admin = await this.create({
        email: adminEmail,
        password: 'admin123',
        name: 'System Admin',
        role: UserRole.USER,
      });

      // Assign Membership
      await this.membershipRepository.save(
        this.membershipRepository.create({
          userId: admin.id,
          tenantId: tenant.id,
          role: TenantRole.OWNER,
        }),
      );
    }

    // Seed Demo User (md@modassir.info)
    const demoEmail = 'md@modassir.info';
    const demoUserExists = await this.findOneByEmail(demoEmail);

    if (!demoUserExists) {
      this.logger.log('Seeding Demo User...');
      // Ensure tenant exists (re-fetch if needed, but should exist from above)
      let tenant = await this.tenantsRepository.manager
        .getRepository(Tenant)
        .findOneBy({ name: 'System' });

      if (tenant) {
        const demo = await this.create({
          email: demoEmail,
          password: 'Am5361$44',
          name: 'Modassir',
          role: UserRole.SUPER_ADMIN,
        });

        await this.membershipRepository.save(
          this.membershipRepository.create({
            userId: demo.id,
            tenantId: tenant.id,
            role: TenantRole.OWNER,
          }),
        );
        this.logger.log('Demo User Seeded Successfully.');
      }
    } else {
      // Force update password for existing demo user
      this.logger.log('Demo User exists. Updating password...');
      const salt = await bcrypt.genSalt();
      const passwordHash = await bcrypt.hash('Am5361$44', salt);

      demoUserExists.passwordHash = passwordHash;
      demoUserExists.role = UserRole.SUPER_ADMIN; // Ensure super_admin role
      await this.usersRepository.save(demoUserExists);
      this.logger.log('Demo User Password & Role Updated.');
    }
  }
}
