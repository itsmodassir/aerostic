import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { WaForm } from "./entities/wa-form.entity";
import { WhatsappService } from "@shared/whatsapp/whatsapp.service";

@Injectable()
export class WaFormsService {
  constructor(
    @InjectRepository(WaForm)
    private waFormRepo: Repository<WaForm>,
    private whatsappService: WhatsappService,
  ) {}

  async findAll(tenantId: string) {
    return this.waFormRepo.find({
      where: { tenantId },
      order: { updatedAt: "DESC" },
    });
  }

  async findPublished(tenantId: string) {
    return this.waFormRepo.find({
      where: { tenantId, status: "published" },
      order: { updatedAt: "DESC" },
    });
  }

  async findOne(tenantId: string, id: string) {
    const form = await this.waFormRepo.findOne({
      where: { id, tenantId },
    });
    if (!form) {
      throw new NotFoundException("WA Form not found");
    }
    return form;
  }

  async create(
    tenantId: string,
    body: {
      name: string;
      description?: string;
      schemaJson?: Record<string, any>;
      metaCategories?: string[];
    },
  ) {
    if (!body?.name?.trim()) {
      throw new BadRequestException("Form name is required");
    }

    const form = this.waFormRepo.create({
      tenantId,
      name: body.name.trim(),
      description: body.description?.trim() || "",
      schemaJson: body.schemaJson || {},
      metaCategories:
        body.metaCategories && body.metaCategories.length > 0
          ? body.metaCategories
          : ["OTHER"],
      status: "draft",
    });

    return this.waFormRepo.save(form);
  }

  async update(
    tenantId: string,
    id: string,
    body: {
      name?: string;
      description?: string;
      schemaJson?: Record<string, any>;
      metaCategories?: string[];
      status?: "draft" | "published" | "archived";
    },
  ) {
    const form = await this.findOne(tenantId, id);
    form.name = body.name?.trim() || form.name;
    form.description =
      body.description !== undefined ? body.description.trim() : form.description;
    form.schemaJson = body.schemaJson ?? form.schemaJson;
    if (body.metaCategories) {
      form.metaCategories =
        body.metaCategories.length > 0 ? body.metaCategories : ["OTHER"];
    }
    if (body.status) {
      form.status = body.status;
    }
    return this.waFormRepo.save(form);
  }

  async remove(tenantId: string, id: string) {
    const form = await this.findOne(tenantId, id);
    await this.waFormRepo.delete({ id: form.id, tenantId });
    return { success: true };
  }

  private buildMetaFlowPayload(form: WaForm) {
    const schema = (form.schemaJson || {}) as Record<string, any>;
    const sections = Array.isArray(schema.sections) ? schema.sections : [];
    const title = schema.title || form.name;
    const description = schema.description || form.description || "";

    const sectionBodies = sections.flatMap((section: any, sectionIndex: number) => {
      const sectionTitle = section?.title
        ? `Section ${sectionIndex + 1}: ${section.title}`
        : `Section ${sectionIndex + 1}`;
      const questions = Array.isArray(section?.questions) ? section.questions : [];
      const questionLines = questions.map((q: any, idx: number) => {
        const required = q?.required ? " (required)" : "";
        return `${idx + 1}. ${q?.label || q?.title || "Question"}${required}`;
      });
      const lineText = questionLines.length
        ? questionLines.join("\n")
        : "No questions configured yet.";
      return [
        {
          type: "TextBody",
          text: sectionTitle,
        },
        {
          type: "TextBody",
          text: lineText,
        },
      ];
    });

    return {
      version: "7.3",
      screens: [
        {
          id: "FORM_OVERVIEW",
          title: String(title).slice(0, 80),
          terminal: true,
          layout: {
            type: "SingleColumnLayout",
            children: [
              {
                type: "TextHeading",
                text: String(title).slice(0, 80),
              },
              {
                type: "TextBody",
                text: String(description || "Please complete the form below.").slice(
                  0,
                  1024,
                ),
              },
              ...sectionBodies.slice(0, 30),
              {
                type: "Footer",
                label: "Submit",
                "on-click-action": {
                  name: "complete",
                  payload: {
                    form_id: form.id,
                    form_name: form.name,
                  },
                },
              },
            ],
          },
        },
      ],
    };
  }

  async publish(tenantId: string, id: string) {
    const form = await this.findOne(tenantId, id);

    let flowId = form.metaFlowId || undefined;

    if (!flowId) {
      const created = await this.whatsappService.createFlow(
        tenantId,
        form.name,
        form.metaCategories && form.metaCategories.length > 0
          ? form.metaCategories
          : ["OTHER"],
      );
      flowId = created?.id;
      if (!flowId) {
        throw new BadRequestException("Failed to create Meta flow for form");
      }
      form.metaFlowId = flowId;
      form.metaFlowName = form.name;
    }

    const flowJson = this.buildMetaFlowPayload(form);
    await this.whatsappService.uploadFlowAsset(
      tenantId,
      flowId,
      `${form.name}.json`,
      flowJson,
    );
    await this.whatsappService.publishFlow(tenantId, flowId);

    form.status = "published";
    form.lastPublishedAt = new Date();
    return this.waFormRepo.save(form);
  }
}

