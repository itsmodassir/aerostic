import { Injectable, Logger, OnModuleInit } from "@nestjs/common";
import { Cron, CronExpression } from "@nestjs/schedule";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { AuditLog } from "../../shared/database/entities/core/audit-log.entity";
import { AuditAlertService } from "./audit-alert.service";
import { AnomalyService } from "../analytics/anomaly.service";
import { PiiMasker } from "@shared/utils/pii-masker.util";
import { KafkaService } from "@shared/kafka.service";
import * as crypto from "crypto";

export enum LogLevel {
  INFO = "INFO",
  SUCCESS = "SUCCESS",
  WARNING = "WARNING",
  ERROR = "ERROR",
  CRITICAL = "CRITICAL",
}

export enum LogCategory {
  AUTH = "AUTH",
  USER = "USER",
  SECURITY = "SECURITY",
  WHATSAPP = "WHATSAPP",
  BILLING = "BILLING",
  SYSTEM = "SYSTEM",
  API = "API",
}

@Injectable()
export class AuditService implements OnModuleInit {
  private readonly logger = new Logger(AuditService.name);
  private lastHash: string | null = null;

  constructor(
    @InjectRepository(AuditLog)
    private auditRepo: Repository<AuditLog>,
    private alertService: AuditAlertService,
    private anomalyService: AnomalyService,
    private kafkaService: KafkaService,
  ) { }

  async log(data: any): Promise<AuditLog> {
    return this.logAction(data);
  }

  async onModuleInit() {
    // Load the most recent hash to continue the chain
    const latestLog = await this.auditRepo.findOne({
      where: {},
      order: { createdAt: "DESC" },
    });
    this.lastHash = latestLog ? latestLog.hash : "INIT_HASH";
    this.logger.log(
      `Audit chain initialized. Last hash: ${this.lastHash.substring(0, 8)}...`,
    );
  }

  /**
   * Standard logging method for all system actions.
   * Overloaded to handle both object-based and positional arguments.
   */
  async logAction(
    actorTypeOrData: any,
    actorNameOrId?: string,
    action?: string,
    resourceType?: string,
    resourceId?: string,
    metadata?: any,
    tenantId?: string,
    _level?: string,
    _category?: string,
    _component?: string,
  ): Promise<AuditLog> {
    let logData: any;

    if (typeof actorTypeOrData === "object") {
      logData = actorTypeOrData;
    } else {
      logData = {
        actorType: actorTypeOrData,
        actorId: actorNameOrId, // Callers use Name/Id interchangeably in logs
        action,
        resourceType,
        resourceId,
        tenantId: tenantId || process.env.SYSTEM_TENANT_ID || "cb06f16b-74af-4e98-852c-7e30f63b3c0a",
        metadata,
        ipAddress: "0.0.0.0", // Fallbacks for backend-internal calls
        userAgent: "Aimstors Solution-System",
      };
    }

    const previousHash = this.lastHash || "INIT_HASH";

    // Create new log instance with masked metadata
    const logEntry = this.auditRepo.create({
      ...logData,
      metadata: logData.metadata ? PiiMasker.mask(logData.metadata) : {},
      previousHash,
    }) as unknown as AuditLog;

    // Calculate Hash: SHA256(previousHash + logContent)
    const contentToHash =
      previousHash +
      JSON.stringify({
        actorType: logData.actorType,
        actorId: logData.actorId,
        action: logData.action,
        resourceType: logData.resourceType,
        resourceId: logData.resourceId,
        tenantId: logData.tenantId,
        metadata: logData.metadata,
        ipAddress: logData.ipAddress,
        userAgent: logData.userAgent,
      });

    logEntry.hash = crypto
      .createHash("sha256")
      .update(contentToHash)
      .digest("hex");

    // Save to DB
    const saved = await this.auditRepo.save(logEntry);

    // Trigger alert processing
    this.alertService
      .processLog(saved)
      .catch((err) =>
        this.logger.error(
          `Failed to process audit alert for ${saved.id}`,
          err.stack,
        ),
      );

    // Trigger Anomaly Detection evaluation
    this.anomalyService
      .evaluateAuditLog(saved)
      .catch((err) =>
        this.logger.error(
          `Failed to evaluate anomaly for log ${saved.id}`,
          err.stack,
        ),
      );

    // Update local state
    this.lastHash = saved.hash;

    // Emit to Kafka for real-time stream processing
    this.kafkaService.emit("aimstors.security.events", {
      eventId: saved.id,
      tenantId: saved.tenantId,
      actorType: saved.actorType,
      actorId: saved.actorId,
      action: saved.action,
      resourceType: saved.resourceType,
      resourceId: saved.resourceId,
      timestamp: saved.createdAt.getTime(),
      metadata: saved.metadata,
    });

    return saved;
  }

  async verifyChain(): Promise<{ isValid: boolean; corruptedId?: string }> {
    const logs = await this.auditRepo.find({ order: { createdAt: "ASC" } });
    let expectedPreviousHash = "INIT_HASH";

    for (const log of logs) {
      const contentToHash =
        expectedPreviousHash +
        JSON.stringify({
          actorType: log.actorType,
          actorId: log.actorId,
          action: log.action,
          resourceType: log.resourceType,
          resourceId: log.resourceId,
          tenantId: log.tenantId,
          metadata: log.metadata,
          ipAddress: log.ipAddress,
          userAgent: log.userAgent,
        });

      const calculatedHash = crypto
        .createHash("sha256")
        .update(contentToHash)
        .digest("hex");

      if (
        calculatedHash !== log.hash ||
        log.previousHash !== expectedPreviousHash
      ) {
        this.logger.error(
          `Audit logs compromised! Integrity broken at log ID: ${log.id}`,
        );
        return { isValid: false, corruptedId: log.id };
      }

      expectedPreviousHash = log.hash;
    }

    return { isValid: true };
  }

  /**
   * Automated high-integrity background check.
   * Aligns with SOC2 requirements for data tampering detection.
   */
  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async runDailyIntegrityCheck() {
    this.logger.log("Starting daily audit log integrity verification...");
    const result = await this.verifyChain();

    if (!result.isValid) {
      this.logger.error(
        `CRITICAL SECURITY ALERT: Audit chain corruption detected at ID: ${result.corruptedId}`,
      );
      // Force increase risk score for system boundary
      await this.anomalyService.flagPermissionViolation(
        "SYSTEM",
        "system-integrity-check",
        "system",
        `audit_chain_corruption:${result.corruptedId}`,
      );
    } else {
      this.logger.log(
        "Daily audit integrity verification successful. Chain is valid.",
      );
    }
  }

  async getLogs(limit: number): Promise<any[]> {
    const logs = await this.auditRepo.find({
      take: limit,
      order: { createdAt: "DESC" },
    });

    return logs.map((log) => ({
      id: log.id,
      action: log.action,
      actorName:
        log.actorType === "admin" ? "Administrator" : log.actorId || "System",
      target: `${log.resourceType}:${log.resourceId || "N/A"}`,
      timestamp: log.createdAt,
      severity: this.getSeverityForAction(log.action),
    }));
  }

  private getSeverityForAction(
    action: string,
  ): "info" | "warning" | "error" | "success" {
    if (action.includes("DELETE") || action.includes("SUSPENDED"))
      return "error";
    if (action.includes("UPDATE") || action.includes("CRITICAL"))
      return "warning";
    if (action.includes("CREATE") || action.includes("SUCCESS"))
      return "success";
    return "info";
  }
}
