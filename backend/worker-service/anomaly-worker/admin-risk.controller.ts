import { Controller, Get, Query, Param, UseGuards } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { PlatformRiskSnapshot } from "../../shared/database/entities/analytics/platform-risk-snapshot.entity";
import { TenantRiskScore } from "../../shared/database/entities/analytics/tenant-risk-score.entity";
import { ResellerRiskScore } from "../../shared/database/entities/analytics/reseller_risk_score.entity";
// import { AdminJwtAuthGuard } from '../../auth/guards/admin-jwt.guard';

@Controller("admin/security/risk")
// @UseGuards(AdminJwtAuthGuard)
export class AdminRiskController {
  constructor(
    @InjectRepository(PlatformRiskSnapshot)
    private platformSnapshotRepo: Repository<PlatformRiskSnapshot>,
    @InjectRepository(TenantRiskScore)
    private tenantRiskRepo: Repository<TenantRiskScore>,
    @InjectRepository(ResellerRiskScore)
    private resellerRiskRepo: Repository<ResellerRiskScore>,
  ) {}

  @Get("snapshot/latest")
  async getLatestSnapshot() {
    return this.platformSnapshotRepo.findOne({
      order: { createdAt: "DESC" },
    });
  }

  @Get("snapshot/history")
  async getSnapshotHistory(@Query("limit") limit = 100) {
    return this.platformSnapshotRepo.find({
      order: { createdAt: "DESC" },
      take: limit,
    });
  }

  @Get("tenants/risky")
  async getRiskyTenants(@Query("minScore") minScore = 30) {
    return this.tenantRiskRepo
      .createQueryBuilder("t")
      .where("t.current_score >= :minScore", { minScore })
      .orderBy("t.current_score", "DESC")
      .getMany();
  }

  @Get("resellers")
  async getResellerRisks() {
    return this.resellerRiskRepo.find({
      order: { aggregatedRisk: "DESC" },
    });
  }

  @Get("tenant/:id")
  async getTenantRiskDetail(@Param("id") tenantId: string) {
    return this.tenantRiskRepo.findOne({ where: { tenantId } });
  }
}
