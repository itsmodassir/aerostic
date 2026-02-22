import { Injectable, BadRequestException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Campaign } from "./entities/campaign.entity";
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
  constructor(
    @InjectRepository(Campaign)
    private campaignRepo: Repository<Campaign>,
    private contactsService: ContactsService,
    private messagesService: MessagesService,
    @InjectQueue("campaign-queue") private campaignQueue: Queue,
    private auditService: AuditService,
    private walletService: WalletService,
    private adminConfigService: AdminConfigService,
  ) { }

  async create(tenantId: string, data: any) {
    const campaign = this.campaignRepo.create({
      tenantId,
      name: data.name,
      templateName: data.templateName,
      templateLanguage: data.templateLanguage,
      recipientType: data.recipientType || "ALL",
      recipients: data.recipients || [],
      status: "draft",
    });
    return this.campaignRepo.save(campaign);
  }

  async findAll(tenantId: string) {
    return this.campaignRepo.find({
      where: { tenantId },
      order: { createdAt: "DESC" },
    });
  }

  async dispatch(tenantId: string, campaignId: string) {
    const campaign = await this.campaignRepo.findOneBy({
      id: campaignId,
      tenantId,
    });
    if (!campaign) throw new Error("Campaign not found");

    // 1. Determine Target Audience
    let contacts: any[] = [];

    if (campaign.recipientType === "ALL") {
      const allContacts = await this.contactsService.findAll(tenantId);
      contacts = allContacts.map((c) => ({
        phoneNumber: c.phoneNumber,
        name: c.name,
      }));
    } else if (["CSV", "MANUAL"].includes(campaign.recipientType)) {
      // Use stored recipients from JSONB
      // Expected format: [{ name, phoneNumber }, ...]
      contacts = campaign.recipients || [];
    }

    if (contacts.length === 0) {
      throw new Error("No contacts found for this campaign");
    }

    // 2. Fetch Rate & Pre-charge Wallet
    const rateStr = await this.adminConfigService.getConfigValue(
      "whatsapp.template_rate_inr",
      tenantId
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
        }
      );
    } catch (error) {
      throw new BadRequestException("Insufficient wallet balance for this campaign broadcast");
    }

    campaign.totalContacts = contacts.length;
    campaign.totalCost = totalCost;
    campaign.status = "sending";
    await this.campaignRepo.save(campaign);

    // 3. Add to Queue
    const jobs = contacts.map((contact) => ({
      name: "send-message",
      data: {
        tenantId,
        campaignId,
        to: contact.phoneNumber,
        type: "template",
        payload: {
          name: campaign.templateName || "hello_world",
          language: { code: campaign.templateLanguage || "en_US" },
          components: [
            {
              type: "body",
              parameters: [
                { type: "text", text: contact.name || "Valued Customer" }, // Example param 1
              ],
            },
          ],
        },
      },
    }));

    await this.campaignQueue.addBulk(jobs);

    // Audit dispatch (Note: passing undefined for actorName if not available here, service might need userId passed in)
    await this.auditService.logAction(
      "SYSTEM", // System action or we might want to pass user info to this service
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
}
