import {
    Controller,
    Get,
    Post,
    Body,
    Param,
    Delete,
    UseGuards,
    Query,
} from '@nestjs/common';
import { BillingService } from '../billing.service';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { SuperAdminGuard } from '../../common/guards/super-admin.guard';

@Controller('admin/api-keys')
@UseGuards(JwtAuthGuard, SuperAdminGuard)
export class AdminApiKeysController {
    constructor(private readonly billingService: BillingService) { }

    @Get()
    async findAll(@Query('tenantId') tenantId?: string) {
        if (tenantId) {
            return this.billingService.getApiKeys(tenantId);
        }
        return this.billingService.findAllApiKeys();
    }

    @Post()
    async create(
        @Body() body: { tenantId: string; name: string; permissions: string[] },
    ) {
        return this.billingService.createApiKey(
            body.tenantId,
            body.name,
            body.permissions,
        );
    }

    @Delete(':id')
    async revoke(
        @Param('id') id: string,
        @Query('tenantId') tenantId: string, // Needed for service method, though admin should be able to revoke any.
    ) {
        // Current service method requires tenantId.
        // If we want admin to revoke without knowing tenantId, we need to update service or fetch key first.
        // For now, let's assume admin UI passes tenantId.
        // Or better, update service to allow admin revocation.
        // Let's rely on the service existing method which is safe.
        return this.billingService.revokeApiKey(tenantId, id);
    }
}
