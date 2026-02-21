import { Injectable, Logger } from "@nestjs/common";
import { AuditLog } from "../../shared/database/entities/core/audit-log.entity";
import { NotificationService } from "../../shared/notification.service";

@Injectable()
export class AuditAlertService {
  private readonly logger = new Logger(AuditAlertService.name);

  constructor(private notificationService: NotificationService) {}

  // High-sensitivity actions that trigger immediate alerts
  private readonly SENSITIVE_ACTIONS = new Set([
    "CONFIG_UPDATE",
    "ROLE_ESCALATION",
    "BULK_DELETE",
    "PASSWORD_RESET_ADMIN",
    "TAMPER_DETECTED",
  ]);

  async processLog(log: AuditLog) {
    if (this.SENSITIVE_ACTIONS.has(log.action)) {
      this.triggerSecurityAlert(log);
    }

    // Logic for frequency-based alerts (e.g., 10 failed logins in 1 min) can be added here
    // In production, this would use Redis-based counters or a streaming engine like Flink/Kafka
  }

  private triggerSecurityAlert(log: AuditLog) {
    this.logger.warn(
      `SECURITY ALERT: Sensitive action [${log.action}] detected by actor [${log.actorId}] on tenant [${log.tenantId}]`,
    );

    this.notificationService.sendSecurityAlert({
      title: `Sensitive Action: ${log.action}`,
      severity: "HIGH",
      message: `Sensitive action detected on tenant ${log.tenantId}`,
      tenantId: log.tenantId,
      metadata: {
        actorId: log.actorId,
        action: log.action,
        resource: `${log.resourceType}:${log.resourceId}`,
        metadata: log.metadata,
      },
    });
  }
}
