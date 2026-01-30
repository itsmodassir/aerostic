import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { BillingService } from '../../billing/billing.service';

@Injectable()
export class ApiKeyGuard implements CanActivate {
    constructor(private billingService: BillingService) { }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest();
        const apiKey = this.extractApiKey(request);

        if (!apiKey) {
            throw new UnauthorizedException('API key is required');
        }

        const validKey = await this.billingService.validateApiKey(apiKey);

        if (!validKey) {
            throw new UnauthorizedException('Invalid API key');
        }

        // Check rate limit
        if (validKey.requestsToday > validKey.rateLimit) {
            throw new UnauthorizedException('Rate limit exceeded');
        }

        // Attach tenant info to request
        request.apiKey = validKey;
        request.tenantId = validKey.tenantId;

        return true;
    }

    private extractApiKey(request: any): string | null {
        // Check Authorization header
        const authHeader = request.headers['authorization'];
        if (authHeader && authHeader.startsWith('Bearer ')) {
            return authHeader.substring(7);
        }

        // Check X-API-Key header
        const apiKeyHeader = request.headers['x-api-key'];
        if (apiKeyHeader) {
            return apiKeyHeader;
        }

        // Check query parameter
        if (request.query?.api_key) {
            return request.query.api_key;
        }

        return null;
    }
}
