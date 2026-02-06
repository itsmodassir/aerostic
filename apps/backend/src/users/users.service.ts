import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, UserRole } from './entities/user.entity';
import { Tenant } from '../tenants/entities/tenant.entity';
import { CreateUserDto } from './dto/create-user.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(Tenant)
    private tenantsRepository: Repository<Tenant>,
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
    return this.usersRepository.findBy({ tenantId });
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
      console.log('Seeding Admin User...');
      // Check for System Tenant
      let tenant = await this.tenantsRepository.manager
        .getRepository(Tenant)
        .findOneBy({ name: 'System' });

      if (!tenant) {
        console.log('Creating System Tenant...');
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
      await this.create({
        email: adminEmail,
        password: 'admin123',
        name: 'System Admin',
        tenantId: tenant.id,
        role: UserRole.ADMIN,
      });
      console.log('Admin User Seeded Successfully.');
    }

    // Seed Demo User (md@modassir.info)
    const demoEmail = 'md@modassir.info';
    const demoUserExists = await this.findOneByEmail(demoEmail);

    if (!demoUserExists) {
      console.log('Seeding Demo User...');
      // Ensure tenant exists (re-fetch if needed, but should exist from above)
      let tenant = await this.tenantsRepository.manager
        .getRepository(Tenant)
        .findOneBy({ name: 'System' });

      if (tenant) {
        await this.create({
          email: demoEmail,
          password: 'Am5361$44',
          name: 'Modassir',
          tenantId: tenant.id,
          role: UserRole.SUPER_ADMIN,
        });
        console.log('Demo User Seeded Successfully.');
      }
    } else {
      // Force update password for existing demo user
      console.log('Demo User exists. Updating password...');
      const salt = await bcrypt.genSalt();
      const passwordHash = await bcrypt.hash('Am5361$44', salt);

      demoUserExists.passwordHash = passwordHash;
      demoUserExists.role = UserRole.SUPER_ADMIN; // Ensure super_admin role
      await this.usersRepository.save(demoUserExists);
      console.log('Demo User Password & Role Updated.');
    }
  }
}
