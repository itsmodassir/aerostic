import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';

@Injectable()
export class RazorpayWebhookGuard implements CanActivate {
  constructor(private configService: ConfigService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const signature = request.headers['x-razorpay-signature'];
    const webhookSecret = this.configService.get<string>(
      'RAZORPAY_WEBHOOK_SECRET',
    );

    if (!webhookSecret) {
      console.error('RAZORPAY_WEBHOOK_SECRET is not configured');
      throw new UnauthorizedException('Webhook secret not configured');
    }

    if (!signature) {
      throw new UnauthorizedException('Missing signature');
    }

    // IMPORTANT: NestJS must preserve rawBody.
    // This requires `app.useBodyParser('json', { limit: '10mb' })` or similar configuration
    // where rawBody is attached to the request, OR using a raw body interceptor.
    // For now, checking if rawBody exists on request (common convention with standard NestJS raw body setup).
    const rawBody = request.rawBody;

    if (!rawBody) {
      // Fallback: If rawBody is not available, we can't securely verify credentials
      // In some setups, request.body might be the object, converting it back to string
      // JSON.stringify(request.body) is NOT reliable because key order matters for HMAC.
      console.error(
        'Raw body not found on request - cannot verify signature securely',
      );
      throw new BadRequestException(
        'Raw body missing for signature verification',
      );
    }

    const expectedSignature = crypto
      .createHmac('sha256', webhookSecret)
      .update(rawBody)
      .digest('hex');

    if (signature !== expectedSignature) {
      throw new UnauthorizedException('Invalid Razorpay signature');
    }

    return true;
  }
}
