import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Template } from './entities/template.entity';
import { MetaService } from '../meta/meta.service';
import { WhatsappService } from '../whatsapp/whatsapp.service';

@Injectable()
export class TemplatesService {
  constructor(
    @InjectRepository(Template)
    private templateRepo: Repository<Template>,
    private metaService: MetaService,
    private whatsappService: WhatsappService,
  ) {}

  async findAll(tenantId: string) {
    return this.templateRepo.find({ where: { tenantId } });
  }

  async sync(tenantId: string) {
    // 1. Get WABA ID & Token from WhatsappService (assuming we stored credentials there,
    // but looking at WhatsappService, we might need to fetch the SystemUser token or WABA creds).
    // For MVP, we'll assume the WhatsappService can provide the WABA info.

    // In our current implementation, credentials might be in `WhatsappConfig` or similar.
    // Let's ask WhatsappService for credentials.
    const creds = await this.whatsappService.getCredentials(tenantId);
    if (!creds || !creds.wabaId || !creds.accessToken) {
      throw new Error('WhatsApp not connected');
    }

    // 2. Fetch from Meta
    const metaTemplates = await this.metaService.getTemplates(
      creds.wabaId,
      creds.accessToken,
    );

    // 3. Upsert into DB
    const entities = metaTemplates.map((t: any) => ({
      tenantId,
      name: t.name,
      language: t.language,
      status: t.status,
      category: t.category,
      components: t.components,
    }));

    // Naive upsert: Delete all for tenant and re-insert (easiest for sync)
    // Or iterating upsert. Let's do iteration to preserve IDs if we had them (but we regenerate UUIDs here so delete-insert is cleaner for MVP sync)

    await this.templateRepo.delete({ tenantId });
    return this.templateRepo.save(entities);
  }
}
