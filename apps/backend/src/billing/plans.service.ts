import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Plan } from './entities/plan.entity';
import { Tenant } from '../tenants/entities/tenant.entity';

@Injectable()
export class PlansService {
    constructor(
        @InjectRepository(Plan)
        private planRepo: Repository<Plan>,
        @InjectRepository(Tenant)
        private tenantRepo: Repository<Tenant>,
    ) { }

    async findAll() {
        return this.planRepo.find({ order: { price: 'ASC' } });
    }

    async findOne(id: string) {
        const plan = await this.planRepo.findOneBy({ id });
        if (!plan) {
            throw new NotFoundException(`Plan with ID ${id} not found`);
        }
        return plan;
    }

    async create(createPlanDto: Partial<Plan>) {
        if (!createPlanDto.name) {
            throw new BadRequestException('Plan name is required');
        }

        const slug = this.generateSlug(createPlanDto.name);
        const existing = await this.planRepo.findOneBy({ slug });
        if (existing) {
            throw new ConflictException(`Plan with name "${createPlanDto.name}" already exists`);
        }

        const plan = this.planRepo.create({
            ...createPlanDto,
            slug,
        });

        return this.planRepo.save(plan);
    }

    async update(id: string, updatePlanDto: Partial<Plan>) {
        const plan = await this.findOne(id);
        Object.assign(plan, updatePlanDto);
        return this.planRepo.save(plan);
    }

    async remove(id: string) {
        const usageCount = await this.tenantRepo.count({ where: { planId: id } });
        if (usageCount > 0) {
            throw new BadRequestException(`Cannot delete plan: it is currently assigned to ${usageCount} tenant(s).`);
        }

        const plan = await this.findOne(id);
        return this.planRepo.remove(plan);
    }

    async onModuleInit() {
        await this.seedPlans();
    }

    private async seedPlans() {
        const plans = [
            {
                name: 'Starter',
                price: 999,
                setupFee: 1999,
                limits: {
                    monthly_messages: 1000,
                    ai_credits: 100,
                    max_agents: 1,
                    max_phone_numbers: 1,
                    max_bots: 1,
                    monthly_broadcasts: 0,
                },
                features: ['whatsapp_embedded', 'human_takeover'],
            },
            {
                name: 'Starter 2',
                price: 2499,
                setupFee: 1999,
                limits: {
                    monthly_messages: 5000,
                    ai_credits: 500,
                    max_agents: 3,
                    max_phone_numbers: 1,
                    max_bots: 3,
                    monthly_broadcasts: 20000,
                },
                features: ['whatsapp_embedded', 'human_takeover'],
            },
            {
                name: 'Growth',
                price: 3999,
                setupFee: 0,
                limits: {
                    monthly_messages: 10000,
                    ai_credits: 1000,
                    max_agents: 5,
                    max_phone_numbers: 3,
                    max_bots: 10,
                    monthly_broadcasts: -1, // Unlimited
                },
                features: [
                    'whatsapp_embedded',
                    'human_takeover',
                    'unlimited_broadcasts',
                ],
            },
            {
                name: 'Professional',
                price: 6999,
                setupFee: 29999,
                limits: {
                    monthly_messages: 20000,
                    ai_credits: 2000,
                    max_agents: 10,
                    max_phone_numbers: 5,
                    max_bots: 20,
                    monthly_broadcasts: -1,
                },
                features: [
                    'whatsapp_embedded',
                    'human_takeover',
                    'unlimited_broadcasts',
                    'multi_client_dashboard',
                    'lead_pipeline',
                    'ai_classification',
                ],
            },
        ];

        for (const planData of plans) {
            const slug = this.generateSlug(planData.name);
            const existing = await this.planRepo.findOneBy({ slug });

            if (!existing) {
                console.log(`Seeding Plan: ${planData.name}`);
                await this.create({ ...planData, slug });
            } else {
                console.log(`Updating Plan: ${planData.name}`);
                // Optional: Update existing plans to match new pricing if desired
                // existing.price = planData.price;
                // existing.setupFee = planData.setupFee;
                // existing.limits = planData.limits;
                // existing.features = planData.features;
                // await this.planRepo.save(existing);
            }
        }
    }

    private generateSlug(name: string): string {
        return name
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)/g, '');
    }
}
