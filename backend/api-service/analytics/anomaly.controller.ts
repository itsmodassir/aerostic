import {
  Controller,
  Get,
  Post,
  Param,
  Query,
  UseGuards,
  Patch,
  Body,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { AnomalyEvent } from "../../shared/database/entities/analytics/anomaly-event.entity";
import { TenantRiskScore } from "../../shared/database/entities/analytics/tenant-risk-score.entity";
import { JwtAuthGuard } from "@api/auth/jwt-auth.guard";
import { RolesGuard } from "@shared/guards/roles.guard";
import { RequireRole } from "@shared/decorators/require-role.decorator";
import { SystemRole } from "@shared/types/roles";

@Controller("admin/anomalies")
@UseGuards(JwtAuthGuard, RolesGuard)
export class AnomalyController {
  constructor(
    @InjectRepository(AnomalyEvent)
    private anomalyRepo: Repository<AnomalyEvent>,
    @InjectRepository(TenantRiskScore)
    private riskRepo: Repository<TenantRiskScore>,
  ) {}

  @Get("risk-scores")
  @RequireRole(SystemRole.PLATFORM_ADMIN, SystemRole.SUPER_ADMIN)
  async getRiskScores(@Query("status") status?: string) {
    const query = this.riskRepo
      .createQueryBuilder("risk")
      .leftJoinAndSelect("risk.tenant", "tenant")
      .orderBy("risk.currentScore", "DESC");

    if (status) {
      query.andWhere("risk.status = :status", { status });
    }

    return query.getMany();
  }

  @Get("events")
  @RequireRole(SystemRole.PLATFORM_ADMIN, SystemRole.SUPER_ADMIN)
  async getAnomalyEvents(
    @Query("tenantId") tenantId?: string,
    @Query("resolved") resolved?: boolean,
  ) {
    const where: any = {};
    if (tenantId) where.tenantId = tenantId;
    if (resolved !== undefined) where.resolved = resolved;

    return this.anomalyRepo.find({
      where,
      order: { createdAt: "DESC" },
      take: 50,
    });
  }

  @Patch("events/:id/resolve")
  @RequireRole(SystemRole.PLATFORM_ADMIN, SystemRole.SUPER_ADMIN)
  async resolveAnomaly(@Param("id") id: string, @Body("notes") notes: string) {
    const event = await this.anomalyRepo.findOne({ where: { id } });
    if (!event) return { message: "Event not found" };

    event.resolved = true;
    event.resolvedAt = new Date();
    event.details = { ...event.details, resolutionNotes: notes };

    return this.anomalyRepo.save(event);
  }

  @Get("tenant/:tenantId")
  @RequireRole(SystemRole.PLATFORM_ADMIN, SystemRole.SUPER_ADMIN)
  async getTenantSecurityPosture(@Param("tenantId") tenantId: string) {
    const [risk, events] = await Promise.all([
      this.riskRepo.findOne({ where: { tenantId }, relations: ["tenant"] }),
      this.anomalyRepo.find({
        where: { tenantId },
        order: { createdAt: "DESC" },
        take: 10,
      }),
    ]);

    return { risk, recentEvents: events };
  }
}
