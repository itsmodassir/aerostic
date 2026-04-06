import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
  Logger,
} from "@nestjs/common";
import * as crypto from "crypto";
import { AdminConfigService } from "@api/admin/services/admin-config.service";

@Injectable()
export class MetaSignatureGuard implements CanActivate {
  private readonly logger = new Logger(MetaSignatureGuard.name);

  constructor(private adminConfigService: AdminConfigService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const signature = request.headers["x-hub-signature-256"] as string;

    if (!signature) {
      this.logger.warn("Missing x-hub-signature-256 header");
      throw new UnauthorizedException("Missing signature");
    }

    const appSecret = await this.adminConfigService.getConfigValue("meta.app_secret");
    if (!appSecret) {
      this.logger.error("meta.app_secret not configured in Admin Panel");
      return false; // Fail safe
    }

    // signature format: sha256={hash}
    const [algorithm, signatureHash] = signature.split("=");
    if (algorithm !== "sha256" || !signatureHash) {
      this.logger.warn(`Invalid signature format: ${signature}`);
      throw new UnauthorizedException("Invalid signature format");
    }

    const rawBody = request.rawBody;
    if (!rawBody) {
      this.logger.error("rawBody not found on request. Ensure NestFactory.create(..., { rawBody: true }) is set.");
      throw new InternalError("Body parsing failed");
    }

    const expectedHash = crypto
      .createHmac("sha256", appSecret)
      .update(rawBody)
      .digest("hex");

    // Timing-safe comparison
    try {
      const isMatch = crypto.timingSafeEqual(
        Buffer.from(signatureHash, "hex"),
        Buffer.from(expectedHash, "hex"),
      );

      if (!isMatch) {
         this.logger.warn("Signature mismatch");
         throw new UnauthorizedException("Signature mismatch");
      }
      return true;
    } catch (err) {
      this.logger.error("Signature comparison failed", err);
      return false;
    }
  }
}

class InternalError extends UnauthorizedException {
    constructor(msg: string) {
        super(msg);
    }
}
