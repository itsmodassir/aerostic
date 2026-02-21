import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Template } from "./entities/template.entity";
import { MetaService } from "../meta/meta.service";
import { WhatsappService } from "../whatsapp/whatsapp.service";

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
      throw new Error("WhatsApp not connected");
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
      rejectionReason: t.rejected_reason, // Map Meta's field to our entity
    }));

    // Naive upsert: Delete all for tenant and re-insert (easiest for sync)
    // Or iterating upsert. Let's do iteration to preserve IDs if we had them (but we regenerate UUIDs here so delete-insert is cleaner for MVP sync)

    await this.templateRepo.delete({ tenantId });
    return this.templateRepo.save(entities);
  }

  async create(tenantId: string, createDto: any) {
    const creds = await this.whatsappService.getCredentials(tenantId);
    if (!creds || !creds.wabaId || !creds.accessToken) {
      throw new Error("WhatsApp not connected");
    }

    // 1. Generate Unique Name (tenantId_name_timestamp) to avoid collisions
    // Meta Rule: lowercase letters and underscores only. No hyphens!
    const timestamp = Date.now();
    const cleanName = createDto.name.toLowerCase().replace(/[^a-z0-9_]/g, "_");
    const cleanTenantId = tenantId.replace(/[^a-z0-9]/g, ""); // Remove hyphens/etc from UUID
    const uniqueName = `${cleanTenantId}_${cleanName}_${timestamp}`;

    // Transform components to include 'example' data for variables (Meta Requirement)
    const normalizedComponents = this.normalizeComponents(createDto.components);

    // Special Handling for AUTHENTICATION: Must have COPY_CODE button
    if (createDto.category.toUpperCase() === "AUTHENTICATION") {
      const hasButton = normalizedComponents.some((c) => c.type === "BUTTONS");
      if (!hasButton) {
        normalizedComponents.push({
          type: "BUTTONS",
          buttons: [
            {
              type: "COPY_CODE",
              example: "123456", // Requirement for Auth templates
            },
          ],
        });
      }
    }

    // 2. Check Existence (Sanity check)
    const existing = await this.metaService.findTemplate(
      creds.wabaId,
      creds.accessToken,
      uniqueName,
    );

    if (existing) {
      // If it exists (unlikely with timestamp, but good practice), reuse it
      const template = this.templateRepo.create({
        tenantId,
        name: existing.name,
        language: existing.language,
        category: existing.category,
        status: existing.status,
        components: existing.components,
        rejectionReason: existing.rejected_reason,
      });
      return this.templateRepo.save(template);
    }

    // 3. Submit to Meta
    await this.metaService.createTemplate(creds.wabaId, creds.accessToken, {
      name: uniqueName,
      language: createDto.language,
      category: createDto.category.toUpperCase(), // Ensure uppercase category
      components: normalizedComponents,
    });

    // 4. Save locally
    const template = this.templateRepo.create({
      tenantId,
      name: uniqueName,
      language: createDto.language,
      category: createDto.category.toUpperCase(),
      components: normalizedComponents,
      status: "PENDING",
    });

    return this.templateRepo.save(template);
  }

  private normalizeComponents(components: any[]) {
    return components.map((component) => {
      if (component.type === "BODY") {
        // detect variables {{1}}, {{2}}, etc.
        const matches = component.text.match(/\{\{\d+\}\}/g) || [];
        const variableCount = matches.length;

        if (variableCount > 0) {
          // generate example array dynamically
          // Use realistic examples to avoid "Invalid Format"
          const exampleValues = Array(variableCount)
            .fill(0)
            .map((_, i) => (i === 0 ? "123456" : `example${i + 1}`));

          return {
            type: "BODY",
            text: component.text,
            example: {
              body_text: [exampleValues],
            },
          };
        }
      }
      return component;
    });
  }
}
