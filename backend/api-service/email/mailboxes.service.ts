import {
    Injectable,
    NotFoundException,
    ForbiddenException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Mailbox } from "@shared/database/entities/core/mailbox.entity";

@Injectable()
export class MailboxesService {
    constructor(
        @InjectRepository(Mailbox)
        private mailboxRepo: Repository<Mailbox>,
    ) { }

    async findAll(tenantId: string) {
        return this.mailboxRepo.find({
            where: { tenantId },
            order: { createdAt: "DESC" },
        });
    }

    async findOne(id: string, tenantId: string) {
        const mailbox = await this.mailboxRepo.findOne({
            where: { id, tenantId },
        });
        if (!mailbox) {
            throw new NotFoundException("Mailbox not found");
        }
        return mailbox;
    }

    async create(tenantId: string, data: Partial<Mailbox>) {
        const mailbox = this.mailboxRepo.create({
            ...data,
            tenantId,
        });
        return this.mailboxRepo.save(mailbox);
    }

    async update(id: string, tenantId: string, data: Partial<Mailbox>) {
        const mailbox = await this.findOne(id, tenantId);
        Object.assign(mailbox, data);
        return this.mailboxRepo.save(mailbox);
    }

    async remove(id: string, tenantId: string) {
        const mailbox = await this.findOne(id, tenantId);
        return this.mailboxRepo.remove(mailbox);
    }
}
