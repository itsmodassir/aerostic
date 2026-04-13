import {
  Injectable,
  ConflictException,
  NotFoundException,
  Logger,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { User, UserRole } from "@shared/database/entities/core/user.entity";
import { Tenant } from "@shared/database/entities/core/tenant.entity";
import { CreateUserDto } from "./dto/create-user.dto";
import * as bcrypt from "bcrypt";

import {
  TenantMembership,
  TenantRole,
} from "@shared/database/entities/core/tenant-membership.entity";
import { AuthzCacheService } from "@shared/authorization/cache/authz-cache.service";
import { AuditLog } from "@shared/database/entities/core/audit-log.entity";

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
    @InjectRepository(AuditLog)
    private auditLogRepository: Repository<AuditLog>,
    private authzCache: AuthzCacheService,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    const existingUser = await this.usersRepository.findOneBy({
      email: createUserDto.email,
    });
    if (existingUser) {
      throw new ConflictException("Email already exists");
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

  async updateProfile(userId: string, data: Partial<{ name: string; phone: string; company: string; website: string; address: string; avatar: string }>): Promise<User> {
    const user = await this.findOne(userId);
    let updatedUser = false;
    
    if (data.name !== undefined) { user.name = data.name; updatedUser = true; }
    if (data.phone !== undefined) { user.phone = data.phone; updatedUser = true; }
    if (data.avatar !== undefined) { user.avatar = data.avatar; updatedUser = true; }
    
    if (updatedUser) {
      await this.usersRepository.save(user);
    }

    if (data.company !== undefined || data.website !== undefined || data.address !== undefined) {
      const membership = await this.membershipRepository.findOne({
        where: { userId },
        relations: ["tenant"],
        order: { createdAt: "ASC" },
      });

      if (membership && membership.tenant) {
        let updatedTenant = false;
        if (data.company !== undefined) { membership.tenant.name = data.company; updatedTenant = true; }
        if (data.website !== undefined) { membership.tenant.website = data.website; updatedTenant = true; }
        // Tenant entity does not currently have an address column, but we keep it in DTO for future schema updates
        
        if (updatedTenant) {
          await this.tenantsRepository.save(membership.tenant);
        }
      }
    }

    return user;
  }

  async getNotifications(tenantId: string): Promise<any[]> {
    if (!tenantId) return [];
    
    const logs = await this.auditLogRepository.find({
      where: { tenantId },
      order: { createdAt: "DESC" },
      take: 5,
    });

    return logs.map((log) => ({
      id: log.id,
      title: this.formatAuditActionString(log.action),
      message: `${log.resourceType} ${log.action.toLowerCase()}`,
      time: log.createdAt,
      unread: false, // Audit logs don't have read status for now
    }));
  }

  private formatAuditActionString(action: string): string {
    return action.split("_").map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(" ");
  }

  async invalidateTokens(userId: string): Promise<void> {
    await this.authzCache.invalidate(userId);
    await this.usersRepository.increment({ id: userId }, "tokenVersion", 1);
  }

  async findAllByTenant(tenantId: string): Promise<User[]> {
    const memberships = await this.membershipRepository.find({
      where: { tenantId },
      relations: ["user"],
    });
    return memberships.map((m) => m.user);
  }

  async cleanupMockData(): Promise<{ deleted: number }> {
    const mockEmails = [
      "rahul@example.com",
      "priya@example.com",
      "vikram@example.com", // Just in case
      "neha@example.com",
      "ravi@example.com",
      "anjali@example.com",
    ];

    const result = await this.usersRepository
      .createQueryBuilder()
      .delete()
      .from(User)
      .where("email IN (:...emails)", { emails: mockEmails })
      .execute();

    return { deleted: result.affected || 0 };
  }

  async onModuleInit() {
    // Seed Admin User
    const adminEmail = "admin@aimstore.in";
    const adminExists = await this.findOneByEmail(adminEmail);

    if (!adminExists) {
      this.logger.log("Seeding Admin User...");
      let tenant = await this.tenantsRepository.manager
        .getRepository(Tenant)
        .findOneBy({ name: "System" });

      if (!tenant) {
        this.logger.log("Creating System Tenant...");
        tenant = this.tenantsRepository.manager.getRepository(Tenant).create({
          name: "System",
          website: "system.aimstore.in",
          plan: "enterprise",
        });
        tenant = await this.tenantsRepository.manager
          .getRepository(Tenant)
          .save(tenant);
      }

      const admin = await this.create({
        email: adminEmail,
        password: "admin123",
        name: "System Admin",
        role: UserRole.SUPER_ADMIN,
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
      { email: "admin@aimstore.in", name: "System Admin" },
      { email: "md@modassir.info", name: "Modassir" },
      { email: "mdrive492@gmail.com", name: "Md Modassir" },
    ];

    for (const account of systemAccounts) {
      const existing = await this.findOneByEmail(account.email);

      if (!existing) {
        this.logger.log(`Seeding System User: ${account.email}...`);
        const tenant = await this.tenantsRepository.manager
          .getRepository(Tenant)
          .findOneBy({ name: "System" });

        if (tenant) {
          const user = await this.create({
            email: account.email,
            password: "Am5361$44",
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
        const passwordHash = await bcrypt.hash("Am5361$44", salt);

        existing.passwordHash = passwordHash;
        existing.role = UserRole.SUPER_ADMIN;
        await this.usersRepository.save(existing);

        // Ensure membership exists for pre-existing system accounts
        const tenant = await this.tenantsRepository.manager
          .getRepository(Tenant)
          .findOneBy({ name: "System" });

        if (tenant) {
          const membership = await this.membershipRepository.findOneBy({
            userId: existing.id,
            tenantId: tenant.id,
          });

          if (!membership) {
            this.logger.log(`Linking existing System User ${account.email} to System Tenant...`);
            await this.membershipRepository.save(
              this.membershipRepository.create({
                userId: existing.id,
                tenantId: tenant.id,
                role: TenantRole.OWNER,
              }),
            );
          }
        }
        this.logger.log(`System User ${account.email} Sync Complete.`);
      }
    }
  }
}
