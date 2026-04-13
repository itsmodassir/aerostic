import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
  Inject,
  forwardRef,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, IsNull } from "typeorm";
import { PlanType, Plan } from "@shared/database/entities/billing/plan.entity";
import { Tenant } from "@shared/database/entities/core/tenant.entity";
import { RazorpayService } from "./razorpay.service";

@Injectable()
export class PlansService {
  constructor(
    @InjectRepository(Plan)
    private planRepo: Repository<Plan>,
    @InjectRepository(Tenant)
    private tenantRepo: Repository<Tenant>,
    @Inject(forwardRef(() => RazorpayService))
    private razorpayService: RazorpayService,
  ) {}

  async findAll(tenantId: string | null = null) {
    return this.planRepo.find({ 
      where: { tenantId: tenantId === null ? IsNull() : tenantId },
      order: { price: "ASC" } 
    });
  }

  async findOne(id: string, tenantId: string | null = null) {
    const plan = await this.planRepo.findOneBy({ id, tenantId: tenantId === null ? IsNull() : tenantId });
    if (!plan) {
      throw new NotFoundException(`Plan with ID ${id} not found in your namespace`);
    }
    return plan;
  }

  async create(createPlanDto: Partial<Plan>) {
    if (!createPlanDto.name) {
      throw new BadRequestException("Plan name is required");
    }

    const tenantId = createPlanDto.tenantId || null;

    // Slug should be unique per tenant
    const baseSlug = this.generateSlug(createPlanDto.name);
    const slug = tenantId ? `${tenantId}-${baseSlug}` : baseSlug;

    const existing = await this.planRepo.findOneBy({ slug, tenantId: tenantId === null ? IsNull() : tenantId });
    if (existing) {
      throw new ConflictException(
        `Plan with name "${createPlanDto.name}" already exists`,
      );
    }

    const plan = this.planRepo.create({
      ...createPlanDto,
      slug,
    });

    // Create in Razorpay only if price > 0 AND razorpayPlanId is not already provided
    if (plan.price > 0 && !plan.razorpayPlanId) {
      try {
        const rpPlan = await this.razorpayService.createPlan(
          plan.name,
          plan.price,
          "monthly",
          `${plan.name} - Monthly Subscription`,
        );
        plan.razorpayPlanId = rpPlan.id;
      } catch (error) {
        console.error(
          "Failed to create Razorpay plan, saving local only",
          error,
        );
      }
    }

    return this.planRepo.save(plan);
  }

  async update(id: string, updatePlanDto: Partial<Plan>, tenantId: string | null = null) {
    const plan = await this.findOne(id, tenantId);

    // Check if price changed
    const priceChanged =
      updatePlanDto.price !== undefined &&
      Number(updatePlanDto.price) !== Number(plan.price);
    const manualRazorpayId = updatePlanDto.razorpayPlanId;

    Object.assign(plan, updatePlanDto);

    // Only create in Razorpay if price changed AND no manual ID was provided in this update,
    // AND the current plan doesn't have a manual ID we should preserve.
    if (priceChanged && plan.price > 0 && !manualRazorpayId) {
      try {
        const rpPlan = await this.razorpayService.createPlan(
          plan.name,
          plan.price,
          "monthly",
          `${plan.name} - Monthly Subscription (v${Date.now()})`,
        );
        plan.razorpayPlanId = rpPlan.id;
      } catch (error) {
        console.error("Failed to update Razorpay plan", error);
      }
    }

    return this.planRepo.save(plan);
  }

  async remove(id: string, tenantId: string | null = null) {
    const usageCount = await this.tenantRepo.count({ where: { planId: id } });
    if (usageCount > 0) {
      throw new BadRequestException(
        `Cannot delete plan: it is currently assigned to ${usageCount} tenant(s).`,
      );
    }

    const plan = await this.findOne(id, tenantId);
    return this.planRepo.remove(plan);
  }

  async onModuleInit() {
    // Only seed if the database is completely empty
    const count = await this.planRepo.count();
    if (count === 0) {
      await this.seedPlans();
    }
  }

  private async seedPlans() {
    const plans = [
      {
        name: "Free",
        price: 0,
        setupFee: 0,
        type: PlanType.REGULAR,
        features: ["whatsapp_embedded", "templates", "basic_support"],
        limits: {
          monthly_messages: 1000,
          ai_credits: 100,
          max_agents: 2,
          max_whatsapp_accounts: 1,
          monthly_broadcasts: 500,
          max_automations: 1,
          max_flows: 1,
          max_campaigns: 500,
          analytics_tier: "basic" as const
        }
      },
      {
        name: "Yearly",
        price: 3999,
        setupFee: 0,
        type: PlanType.REGULAR,
        features: ["whatsapp_embedded", "advanced_ai", "unlimited_templates", "api_access", "crm_integrations"],
        limits: {
          monthly_messages: -1,
          ai_credits: 10000,
          max_agents: 10,
          max_whatsapp_accounts: 5,
          monthly_broadcasts: -1,
          max_automations: 10,
          max_flows: -1,
          max_campaigns: -1,
          analytics_tier: "medium" as const
        }
      },
      {
        name: "Reseller Yearly",
        price: 15000,
        setupFee: 0,
        type: PlanType.RESELLER,
        features: ["whatsapp_embedded", "advanced_ai", "unlimited_templates", "api_access", "reseller_hub", "whitelabel"],
        limits: {
          monthly_messages: -1,
          ai_credits: 0,
          max_agents: -1,
          max_whatsapp_accounts: -1,
          monthly_broadcasts: -1,
          max_automations: -1,
          max_flows: -1,
          max_campaigns: -1,
          analytics_tier: "advanced" as const
        }
      }
    ];

    for (const planData of plans) {
      const slug = this.generateSlug(planData.name);
      const plan = this.planRepo.create({ ...planData, slug });
      await this.planRepo.save(plan);
    }
  }

  private generateSlug(name: string): string {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  }
}
