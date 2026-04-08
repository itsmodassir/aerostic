import { Injectable, BadRequestException, Inject, forwardRef, Logger, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { randomBytes } from "crypto";
import { Campaign } from "./entities/campaign.entity";
import { CampaignTrigger } from "./entities/campaign-trigger.entity";
import { Contact } from "@shared/database/entities/core/contact.entity";
import { ContactsService } from "../contacts/contacts.service";
import { MessagesService } from "../messages/messages.service";
import { AuditService, LogLevel, LogCategory } from "../audit/audit.service";
import { WalletService } from "../billing/wallet.service";
import { WalletAccountType } from "@shared/database/entities/billing/wallet-account.entity";
import { TransactionType } from "@shared/database/entities/billing/wallet-transaction.entity";

import { InjectQueue } from "@nestjs/bullmq";
import { Queue } from "bullmq";

import { AdminConfigService } from "../admin/services/admin-config.service";

@Injectable()
export class CampaignsService {
  private readonly logger = new Logger(CampaignsService.name);
  constructor(
    @InjectRepository(Campaign)
    private readonly campaignRepo: Repository<Campaign>,
    @InjectRepository(CampaignTrigger)
    private readonly triggerRepo: Repository<CampaignTrigger>,
    @InjectRepository(Contact)
    private readonly contactRepo: Repository<Contact>,
    private contactsService: ContactsService,
    private messagesService: MessagesService,
    @InjectQueue("campaign-queue") private campaignQueue: Queue,
    private auditService: AuditService,
    @Inject(forwardRef(() => WalletService))
    private walletService: WalletService,
    @Inject(forwardRef(() => AdminConfigService))
    private adminConfigService: AdminConfigService,
  ) { }

  async create(tenantId: string, data: any) {
    const variants =
      Array.isArray(data.variants) && data.variants.length > 0
        ? data.variants
        : [];

    const primaryTemplateName = data.templateName || variants[0]?.templateName;
    const primaryTemplateLanguage =
      data.templateLanguage || variants[0]?.templateLanguage;

    if (!data.name?.trim()) {
      throw new BadRequestException("Campaign name is required");
    }

    if (!primaryTemplateName) {
      throw new BadRequestException("At least one template must be selected");
    }

    if (
      variants.some(
        (variant: any) => !variant?.templateName || !variant?.templateLanguage,
      )
    ) {
      throw new BadRequestException(
        "Every campaign variant must include a template and language",
      );
    }

    const parsedScheduledAt = data.scheduledAt ? new Date(data.scheduledAt) : undefined;
    if (parsedScheduledAt && Number.isNaN(parsedScheduledAt.getTime())) {
      throw new BadRequestException("Invalid scheduled time");
    }

    const campaign = this.campaignRepo.create({
      tenantId,
      name: data.name.trim(),
      templateName: primaryTemplateName,
      templateLanguage: primaryTemplateLanguage,
      recipientType: data.recipientType || "ALL",
      recipients: data.recipients || [],
      isABTest: data.isABTest || false,
      variants,
      segmentationConfig: data.segmentationConfig || {},
      scheduledAt: parsedScheduledAt,
      isRecurring: !!data.isRecurring,
      recurrenceRule: data.recurrenceRule || null,
      status:
        parsedScheduledAt && parsedScheduledAt.getTime() > Date.now() ? "scheduled" : "draft",
    });

    if (campaign.isRecurring) {
      await this.handleRecurrence(campaign);
    }

    return this.campaignRepo.save(campaign);
  }

  async findTriggers(tenantId: string) {
    return this.triggerRepo.find({
      where: { tenantId },
      relations: ["campaign"],
      order: { createdAt: "DESC" },
    });
  }

  async createTrigger(
    tenantId: string,
    data: {
      name?: string;
      campaignId?: string;
      triggerType?: string;
      mappingConfig?: Record<string, string>;
    },
  ) {
    if (!data.name?.trim()) {
      throw new BadRequestException("Trigger name is required");
    }

    if (!data.campaignId) {
      throw new BadRequestException("Campaign is required");
    }

    const campaign = await this.campaignRepo.findOneBy({
      id: data.campaignId,
      tenantId,
    });

    if (!campaign) {
      throw new NotFoundException("Campaign not found");
    }

    const trigger = this.triggerRepo.create({
      tenantId,
      campaignId: campaign.id,
      name: data.name.trim(),
      triggerType: data.triggerType || "webhook",
      apiKey: `trg_${randomBytes(16).toString("hex")}`,
      mappingConfig: data.mappingConfig || {},
      isActive: true,
    });

    return this.triggerRepo.save(trigger);
  }

  async disableTrigger(tenantId: string, triggerId: string) {
    const trigger = await this.triggerRepo.findOneBy({
      id: triggerId,
      tenantId,
    });

    if (!trigger) {
      throw new NotFoundException("Trigger not found");
    }

    trigger.isActive = false;
    await this.triggerRepo.save(trigger);

    return { success: true };
  }

  async triggerSingle(apiKey: string, payload: { phone: string, name?: string, variables?: any }) {
      const trigger = await this.triggerRepo.findOne({
          where: { apiKey, isActive: true },
          relations: ["campaign"]
      });

      if (!trigger) throw new NotFoundException("Invalid or inactive trigger key");

      const campaign = trigger.campaign;
      const variant = campaign.variants?.[0] || { 
          templateName: campaign.templateName, 
          templateLanguage: campaign.templateLanguage 
      };

      await this.campaignQueue.add("send-message", {
          campaignId: campaign.id,
          tenantId: trigger.tenantId,
          phoneNumber: payload.phone,
          name: payload.name || "Customer",
          templateName: variant.templateName,
          templateLanguage: variant.templateLanguage,
          variables: { ...(campaign.segmentationConfig || {}), ...payload.variables },
      });

      return { status: "queued", phone: payload.phone };
  }

  async findAll(tenantId: string) {
    return this.campaignRepo.find({
      where: { tenantId },
      order: { createdAt: "DESC" },
    });
  }

  async getRecent(tenantId: string, limit: number = 5) {
    if (!tenantId) return [];
    return this.campaignRepo.find({
      where: { tenantId },
      order: { createdAt: "DESC" },
      take: limit,
    });
  }

  async dispatch(tenantId: string, campaignId: string) {
    const campaign = await this.campaignRepo.findOneBy({
      id: campaignId,
      tenantId,
    });
    if (!campaign) throw new Error("Campaign not found");

    let contacts: any[] = [];

    if (campaign.recipientType === "ALL") {
      const allContacts = await this.contactsService.findAll(tenantId);
      contacts = allContacts.map((c) => ({
        phoneNumber: c.phoneNumber,
        name: c.name,
        attributes: c.attributes || {}
      }));
    } else if (campaign.recipientType === "SEGMENT") {
      const segmentedContacts = await this.contactsService.getSegmentedContacts(
        tenantId,
        campaign.segmentationConfig,
      );
      contacts = segmentedContacts.map((c) => ({
        phoneNumber: c.phoneNumber,
        name: c.name,
        attributes: c.attributes || {}
      }));
    } else if (["CSV", "MANUAL"].includes(campaign.recipientType)) {
      contacts = campaign.recipients || [];
    }

    if (contacts.length === 0) {
      if (campaign.isRecurring) {
        await this.handleRecurrence(campaign);
        return campaign;
      }
      throw new Error("No contacts found for this campaign");
    }

    const rateStr = await this.adminConfigService.getConfigValue(
      "whatsapp.template_rate_inr",
      tenantId,
    );
    const templateRate = parseFloat(rateStr || "0.80");
    const totalCost = contacts.length * templateRate;

    try {
      await this.walletService.processTransaction(
        tenantId,
        WalletAccountType.MAIN_BALANCE,
        totalCost,
        TransactionType.DEBIT,
        {
          referenceType: "CAMPAIGN_BROADCAST",
          referenceId: campaignId,
          description: `Template broadcast to ${contacts.length} recipients. Rate: ₹${templateRate}/msg`,
        },
      );
    } catch (error) {
      campaign.status = "failed";
      campaign.errorLog = "Insufficient wallet balance";
      await this.campaignRepo.save(campaign);
      throw new BadRequestException(
        "Insufficient wallet balance for this campaign broadcast",
      );
    }

    campaign.totalContacts = contacts.length;
    campaign.totalCost = totalCost;
    campaign.sentCount = 0;
    campaign.failedCount = 0;
    campaign.status = "sending";
    campaign.lastRunAt = new Date();

    if (campaign.isRecurring) {
      await this.handleRecurrence(campaign);
    }

    await this.campaignRepo.save(campaign);

    const variants: { templateName: string, templateLanguage: string, weight: number, variables?: Record<string, string> }[] = 
        (campaign.variants && campaign.variants.length > 0) 
        ? campaign.variants 
        : [{ templateName: campaign.templateName, templateLanguage: campaign.templateLanguage, weight: 1, variables: {} }];

    const totalWeight = variants.reduce((sum: number, v) => sum + (v.weight || 1), 0);
    let cumulativeContacts = 0;

    for (let vIndex = 0; vIndex < variants.length; vIndex++) {
      const variant = variants[vIndex];
      const variantCount = Math.floor(contacts.length * ((variant.weight || 1) / totalWeight));
      const variantContacts = contacts.slice(cumulativeContacts, vIndex === variants.length - 1 ? contacts.length : cumulativeContacts + variantCount);
      cumulativeContacts += variantCount;

      for (const contact of variantContacts) {
        // Resolve positional variables for the template
        const parameters = [];
        const customVars = variant.variables || {};
        
        // WhatsApp templates use positional variables {{1}}, {{2}}, etc.
        // We look for keys "1", "2" etc. in the customVars and resolve placeholders.
        Object.keys(customVars).sort((a, b) => parseInt(a) - parseInt(b)).forEach(key => {
            let val = customVars[key] || "";
            // Replace placeholders: {{contact.name}}, {{contact.phone}}
            val = val.replace(/{{contact\.name}}/g, contact.name || "");
            val = val.replace(/{{contact\.phone}}/g, contact.phoneNumber || "");
            
            parameters.push({ type: "text", text: val });
        });

        // Add a default parameter if none exist (most templates have at least one like name)
        if (parameters.length === 0) {
            parameters.push({ type: "text", text: contact.name || "Customer" });
        }

        await this.campaignQueue.add("send-message", {
          tenantId,
          campaignId,
          to: contact.phoneNumber,
          type: "template", // CRITICAL: Added missing type
          payload: {
            name: variant.templateName,
            language: { code: variant.templateLanguage || "en_US" },
            components: [
              {
                type: "body",
                parameters: parameters,
              },
            ],
          },
        });
      }
    }

    // Audit dispatch
    await this.auditService.logAction(
      "SYSTEM",
      "Campaign Service",
      "DISPATCH_CAMPAIGN",
      `Campaign: ${campaign.name}`,
      tenantId,
      { campaignId, totalContacts: contacts.length },
      undefined,
      LogLevel.SUCCESS,
      LogCategory.WHATSAPP,
      "CampaignsService",
    );

    return campaign;
  }

  async delete(tenantId: string, id: string) {
    const campaign = await this.campaignRepo.findOneBy({ id, tenantId });
    if (!campaign) throw new NotFoundException("Campaign not found");
    await this.campaignRepo.remove(campaign);
    return { success: true };
  }

  private async handleRecurrence(campaign: Campaign) {
    if (!campaign.recurrenceRule) return;

    try {
      const parser = require("cron-parser");
      const interval = parser.parseExpression(campaign.recurrenceRule, {
        currentDate: new Date(),
      });
      campaign.nextRunAt = interval.next().toDate();
    } catch (err) {
      this.logger.error(
        `Failed to parse recurrence rule for campaign ${campaign.id}: ${campaign.recurrenceRule}`,
        err,
      );
      campaign.isRecurring = false; // Disable if rule is invalid to prevent loops
      campaign.errorLog = `Invalid Recurrence Rule: ${campaign.recurrenceRule}`;
    }
  }
}
