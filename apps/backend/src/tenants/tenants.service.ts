import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Tenant } from './entities/tenant.entity';
import { CreateTenantDto } from './dto/create-tenant.dto';
import { TenantMembership, TenantRole } from './entities/tenant-membership.entity';
import { Role } from './entities/role.entity';

@Injectable() // Service is injectable
export class TenantsService {
  constructor(
    @InjectRepository(Tenant)
    private tenantsRepository: Repository<Tenant>,
    @InjectRepository(TenantMembership)
    private membershipRepository: Repository<TenantMembership>,
    @InjectRepository(Role)
    private roleRepository: Repository<Role>,
  ) { }

  async create(createTenantDto: CreateTenantDto, userId: string): Promise<Tenant> {
    const slug = createTenantDto.slug || this.slugify(createTenantDto.name);

    // Check if slug exists
    const existing = await this.tenantsRepository.findOne({ where: { slug } });
    if (existing) {
      throw new Error('Workspace with this name already exists');
    }

    const tenant = this.tenantsRepository.create({
      ...createTenantDto,
      slug,
      subscriptionStatus: 'trialing',
      trialEndsAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });
    const savedTenant = await this.tenantsRepository.save(tenant);

    // Create membership for the creator (Owner)
    const ownerRole = await this.roleRepository.findOne({ where: { name: 'owner' } });

    // Handle case where roles might not be seeded yet (though they should be)
    // Fallback to enum if needed, but we should aim for role entity

    const membership = this.membershipRepository.create({
      userId,
      tenantId: savedTenant.id,
      role: TenantRole.OWNER, // Enum fallback/sync
      roleId: ownerRole?.id,
      status: 'active',
    });

    await this.membershipRepository.save(membership);

    return savedTenant;
  }

  private slugify(text: string): string {
    return text
      .toLowerCase()
      .replace(/[^\w ]+/g, '')
      .replace(/ +/g, '-');
  }

  async findOne(id: string): Promise<Tenant> {
    const tenant = await this.tenantsRepository.findOneBy({ id });
    if (!tenant) {
      throw new NotFoundException(`Tenant with ID ${id} not found`);
    }
    return tenant;
  }

  async findByName(name: string): Promise<Tenant | null> {
    return this.tenantsRepository.findOneBy({ name });
  }

  async findBySlug(slug: string): Promise<Tenant | null> {
    return this.tenantsRepository.findOneBy({ slug });
  }

  async findAll(): Promise<Tenant[]> {
    return this.tenantsRepository.find();
  }
}
