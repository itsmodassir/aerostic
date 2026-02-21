import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import * as crypto from "crypto";

@Injectable()
export class WebhookSignatureGuard implements CanActivate {
  constructor(private configService: ConfigService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const signature = request.headers["x-hub-signature-256"];
    const appSecret = this.configService.get<string>("META_APP_SECRET");

    if (!signature) {
      throw new UnauthorizedException("Signature missing");
    }

    if (!appSecret) {
      throw new UnauthorizedException("App secret not configured");
    }

    const [algo, hash] = (signature as string).split("=");
    if (algo !== "sha256") {
      throw new UnauthorizedException("Unsupported signature algorithm");
    }

    const expectedHash = crypto
      .createHmac("sha256", appSecret)
      .update(request.rawBody || "") // Assumes raw-body middleware is enabled
      .digest("hex");

    if (hash !== expectedHash) {
      throw new UnauthorizedException("Invalid signature");
    }

    return true;
  }
}
