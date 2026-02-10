import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Tenant } from './entities/tenant.entity';
import { CreateTenantDto } from './dto/create-tenant.dto';

@Injectable() // Service is injectable
export class TenantsService {
  constructor(
    @InjectRepository(Tenant)
    private tenantsRepository: Repository<Tenant>,
  ) { }

  async create(createTenantDto: CreateTenantDto): Promise<Tenant> {
    const slug = createTenantDto.slug || this.slugify(createTenantDto.name);
    const tenant = this.tenantsRepository.create({
      ...createTenantDto,
      slug,
    });
    return this.tenantsRepository.save(tenant);
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
