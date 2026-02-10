import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Campaign } from './entities/campaign.entity';
import { ContactsService } from '../contacts/contacts.service';
import { MessagesService } from '../messages/messages.service';
import { AuditService } from '../audit/audit.service';
import { LogCategory, LogLevel } from '../audit/entities/audit-log.entity';

import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';

@Injectable()
export class CampaignsService {
  constructor(
    @InjectRepository(Campaign)
    private campaignRepo: Repository<Campaign>,
    private contactsService: ContactsService,
    private messagesService: MessagesService,
    @InjectQueue('campaign-queue') private campaignQueue: Queue,
    private auditService: AuditService,
  ) { }

  async create(tenantId: string, name: string) {
    // Simplified
    const campaign = this.campaignRepo.create({
      tenantId,
      name,
      status: 'draft',
    });
    return this.campaignRepo.save(campaign);
  }

  async findAll(tenantId: string) {
    return this.campaignRepo.find({
      where: { tenantId },
      order: { createdAt: 'DESC' },
    });
  }

  async dispatch(tenantId: string, campaignId: string) {
    const campaign = await this.campaignRepo.findOneBy({
      id: campaignId,
      tenantId,
    });
    if (!campaign) throw new Error('Campaign not found');

    // 1. Get All Contacts
    const contacts = await this.contactsService.findAll(tenantId);
    campaign.totalContacts = contacts.length;
    campaign.status = 'sending';
    await this.campaignRepo.save(campaign);

    // 2. Add to Queue
    const jobs = contacts.map((contact) => ({
      name: 'send-message',
      data: {
        tenantId,
        campaignId,
        to: contact.phoneNumber,
        type: 'template',
        payload: {
          name: 'hello_world',
          language: { code: 'en_US' },
        },
      },
    }));

    await this.campaignQueue.addBulk(jobs);

    // Audit dispatch (Note: passing undefined for actorName if not available here, service might need userId passed in)
    await this.auditService.logAction(
      'SYSTEM', // System action or we might want to pass user info to this service
      'Campaign Service',
      'DISPATCH_CAMPAIGN',
      `Campaign: ${campaign.name}`,
      tenantId,
      { campaignId, totalContacts: contacts.length },
      undefined,
      LogLevel.SUCCESS,
      LogCategory.WHATSAPP,
      'CampaignsService'
    );

    return campaign;
  }
}
