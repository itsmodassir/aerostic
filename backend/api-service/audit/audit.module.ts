import { Global, Module, forwardRef } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { AuditLog } from "../../shared/database/entities/core/audit-log.entity";
import { AuditService } from "./audit.service";

import { AuditInterceptor } from "./audit.interceptor";
import { AuditController } from "./audit.controller";
import { AuditAlertService } from "./audit-alert.service";
import { AnalyticsModule } from "../analytics/analytics.module";

@Global()
@Module({
  imports: [
    TypeOrmModule.forFeature([AuditLog]),
    forwardRef(() => AnalyticsModule),
  ],
  controllers: [AuditController],
  providers: [AuditService, AuditInterceptor, AuditAlertService],
  exports: [AuditService, AuditInterceptor, AuditAlertService],
})
export class AuditModule {}
