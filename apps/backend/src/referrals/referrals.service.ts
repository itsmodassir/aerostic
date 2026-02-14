import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Referral } from './entities/referral.entity';
import { CreateReferralDto } from './dto/create-referral.dto';

@Injectable()
export class ReferralsService {
    constructor(
        @InjectRepository(Referral)
        private referralRepository: Repository<Referral>,
    ) { }

    async create(createDto: CreateReferralDto, tenantId: string): Promise<Referral> {
        const existing = await this.referralRepository.findOneBy({ code: createDto.code });
        if (existing) {
            throw new ConflictException('Referral code already exists');
        }

        const referral = this.referralRepository.create({
            ...createDto,
            tenantId,
        });
        return this.referralRepository.save(referral);
    }

    async findAll(tenantId: string): Promise<Referral[]> {
        return this.referralRepository.find({
            where: { tenantId },
            relations: ['referrer', 'referee'],
            order: { createdAt: 'DESC' },
        });
    }

    async findOne(id: string, tenantId: string): Promise<Referral> {
        const referral = await this.referralRepository.findOne({
            where: { id, tenantId },
            relations: ['referrer', 'referee'],
        });
        if (!referral) {
            throw new NotFoundException('Referral not found');
        }
        return referral;
    }

    async update(id: string, tenantId: string, updateData: Partial<Referral>): Promise<Referral> {
        const referral = await this.findOne(id, tenantId);
        Object.assign(referral, updateData);
        return this.referralRepository.save(referral);
    }

    async remove(id: string, tenantId: string): Promise<void> {
        const referral = await this.findOne(id, tenantId);
        await this.referralRepository.remove(referral);
    }
}
