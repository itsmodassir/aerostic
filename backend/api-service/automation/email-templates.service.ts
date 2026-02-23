import {
    Injectable,
    NotFoundException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { EmailTemplate } from "./entities/email-template.entity";

@Injectable()
export class EmailTemplatesService {
    constructor(
        @InjectRepository(EmailTemplate)
        private templateRepo: Repository<EmailTemplate>,
    ) { }

    async findAll(tenantId: string) {
        return this.templateRepo.find({
            where: { tenantId },
            order: { createdAt: "DESC" },
        });
    }

    async findOne(id: string, tenantId: string) {
        const template = await this.templateRepo.findOne({
            where: { id, tenantId },
        });
        if (!template) {
            throw new NotFoundException("Email template not found");
        }
        return template;
    }

    async create(tenantId: string, data: Partial<EmailTemplate>) {
        const template = this.templateRepo.create({
            ...data,
            tenantId,
        });
        return this.templateRepo.save(template);
    }

    async update(id: string, tenantId: string, data: Partial<EmailTemplate>) {
        const template = await this.findOne(id, tenantId);
        Object.assign(template, data);
        return this.templateRepo.save(template);
    }

    async remove(id: string, tenantId: string) {
        const template = await this.findOne(id, tenantId);
        return this.templateRepo.remove(template);
    }
}
