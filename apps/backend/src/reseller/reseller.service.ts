import {
    Injectable,
    NotFoundException,
    BadRequestException,
    ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Tenant, TenantType } from '../tenants/entities/tenant.entity';
import { User, UserRole } from '../users/entities/user.entity';
import { Plan } from '../billing/entities/plan.entity';
import { ResellerConfig } from '../tenants/entities/reseller-config.entity';
import { CreateResellerDto } from './dto/create-reseller.dto';
import { OnboardSubTenantDto } from './dto/onboard-sub-tenant.dto';
import { UpdateBrandingDto } from './dto/update-branding.dto';
import { UsersService } from '../users/users.service';
import { TenantsService } from '../tenants/tenants.service';
import {
    TenantMembership,
    TenantRole,
} from '../tenants/entities/tenant-membership.entity';

@Injectable()
export class ResellerService {
    constructor(
        @InjectRepository(Tenant)
        private tenantsRepository: Repository<Tenant>,
        @InjectRepository(Plan)
        private plansRepository: Repository<Plan>,
        @InjectRepository(ResellerConfig)
        private configRepository: Repository<ResellerConfig>,
        @InjectRepository(TenantMembership)
        private membershipRepository: Repository<TenantMembership>,
        private usersService: UsersService,
        private tenantsService: TenantsService,
    ) { }

    async createReseller(dto: CreateResellerDto) {
        // 1. Check if user exists
        const existingUser = await this.usersService.findOneByEmail(dto.ownerEmail);
        if (existingUser) {
            throw new ConflictException('User with this email already exists');
        }

        // 2. Validate Plan
        const plan = await this.plansRepository.findOne({ where: { id: dto.planId } });
        if (!plan) {
            throw new NotFoundException('Selected plan not found');
        }

        // 3. Create Reseller Tenant
        const tenant = this.tenantsRepository.create({
            name: dto.name,
            type: TenantType.RESELLER,
            planId: plan.id,
            slug: this.slugify(dto.name),
        });
        const savedTenant = await this.tenantsRepository.save(tenant);

        // 4. Create Owner User
        const owner = await this.usersService.create({
            email: dto.ownerEmail,
            name: dto.ownerName,
            password: dto.password || 'TemporaryPass123!', // Should ideally send invite email
            role: UserRole.ADMIN,
        });

        // 5. Create Membership
        await this.membershipRepository.save(
            this.membershipRepository.create({
                userId: owner.id,
                tenantId: savedTenant.id,
                role: TenantRole.OWNER,
                status: 'active',
            }),
        );

        // 6. Create Default Reseller Config
        const config = this.configRepository.create({
            tenantId: savedTenant.id,
            brandName: dto.name,
        });
        await this.configRepository.save(config);

        return { tenant: savedTenant, owner };
    }

    async onboardSubTenant(resellerId: string, dto: OnboardSubTenantDto) {
        const reseller = await this.tenantsRepository.findOne({
            where: { id: resellerId },
            relations: ['plan'],
        });

        if (!reseller || reseller.type !== TenantType.RESELLER) {
            throw new BadRequestException('Invalid reseller');
        }

        // Check limits
        const subTenantCount = await this.tenantsRepository.count({
            where: { resellerId },
        });

        if (reseller.plan && subTenantCount >= (reseller.plan as any).maxSubTenants) {
            throw new BadRequestException('Max sub-tenants limit reached for your plan');
        }

        // 1. Create Sub-Tenant
        const tenant = this.tenantsRepository.create({
            name: dto.name,
            type: TenantType.REGULAR,
            resellerId: reseller.id,
            slug: this.slugify(dto.name),
        });
        const savedTenant = await this.tenantsRepository.save(tenant);

        // 2. Create Owner User for Sub-Tenant
        const user = await this.usersService.create({
            email: dto.ownerEmail,
            name: dto.ownerName,
            password: dto.password || 'ClientPass123!',
            role: UserRole.USER,
        });

        // 3. Create Membership
        await this.membershipRepository.save(
            this.membershipRepository.create({
                userId: user.id,
                tenantId: savedTenant.id,
                role: TenantRole.OWNER,
                status: 'active',
            }),
        );

        return savedTenant;
    }

    async updateBranding(tenantId: string, dto: UpdateBrandingDto) {
        let config = await this.configRepository.findOne({ where: { tenantId } });
        if (!config) {
            config = this.configRepository.create({ tenantId });
        }

        Object.assign(config, dto);
        return this.configRepository.save(config);
    }

    async allocateCredits(resellerId: string, targetTenantId: string, amount: number) {
        const reseller = await this.tenantsRepository.findOne({ where: { id: resellerId } });
        const target = await this.tenantsRepository.findOne({ where: { id: targetTenantId } });

        if (!reseller || !target) throw new NotFoundException('Tenant not found');
        if (target.resellerId !== resellerId) throw new BadRequestException('Tenant does not belong to this reseller');

        if (reseller.resellerCredits < amount) throw new BadRequestException('Insufficient credits');

        reseller.resellerCredits -= amount;
        target.resellerCredits = (target.resellerCredits || 0) + amount;

        await this.tenantsRepository.save([reseller, target]);
        return { success: true, remainingCredits: reseller.resellerCredits };
    }

    async listSubTenants(resellerId: string) {
        return this.tenantsRepository.find({
            where: { resellerId },
            order: { createdAt: 'DESC' },
        });
    }

    private slugify(text: string): string {
        return text
            .toLowerCase()
            .trim()
            .replace(/[^\w\s-]/g, '')
            .replace(/[\s_-]+/g, '-')
            .replace(/^-+|-+$/g, '');
    }
}
