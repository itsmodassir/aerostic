import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Plan } from './entities/plan.entity';

@Injectable()
export class PlansService {
    constructor(
        @InjectRepository(Plan)
        private planRepo: Repository<Plan>,
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
        const plan = this.planRepo.create(createPlanDto);
        if (!plan.slug && plan.name) {
            plan.slug = this.generateSlug(plan.name);
        }
        return this.planRepo.save(plan);
    }

    async update(id: string, updatePlanDto: Partial<Plan>) {
        const plan = await this.findOne(id);
        Object.assign(plan, updatePlanDto);
        return this.planRepo.save(plan);
    }

    async remove(id: string) {
        const plan = await this.findOne(id);
        return this.planRepo.remove(plan);
    }

    private generateSlug(name: string): string {
        return name
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)/g, '');
    }
}
