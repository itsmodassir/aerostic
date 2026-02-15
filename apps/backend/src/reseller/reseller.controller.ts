import {
    Controller,
    Post,
    Body,
    UseGuards,
    Param,
    Patch,
    Get,
    Request,
} from '@nestjs/common';
import { ResellerService } from './reseller.service';
import { CreateResellerDto } from './dto/create-reseller.dto';
import { OnboardSubTenantDto } from './dto/onboard-sub-tenant.dto';
import { UpdateBrandingDto } from './dto/update-branding.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { TenantRole } from '../tenants/entities/tenant-membership.entity';

@Controller('reseller')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ResellerController {
    constructor(private readonly resellerService: ResellerService) { }

    @Get('stats')
    @Roles(TenantRole.OWNER)
    async getStats(@Request() req: any) {
        return this.resellerService.getStats(req.user.tenantId);
    }

    @Post('onboard')
    @Roles(TenantRole.OWNER) // Super Admins bypass this and can access
    async createReseller(@Body() dto: CreateResellerDto) {
        return this.resellerService.createReseller(dto);
    }

    @Post('client')
    @Roles(TenantRole.OWNER)
    async onboardClient(@Request() req: any, @Body() dto: OnboardSubTenantDto) {
        return this.resellerService.onboardSubTenant(req.user.tenantId, dto);
    }

    @Patch('branding')
    @Roles(TenantRole.OWNER)
    async updateBranding(@Request() req: any, @Body() dto: UpdateBrandingDto) {
        return this.resellerService.updateBranding(req.user.tenantId, dto);
    }

    async allocateCredits(
        @Request() req: any,
        @Body('targetTenantId') targetTenantId: string,
        @Body('amount') amount: number,
    ) {
        return this.resellerService.allocateCredits(
            req.user.tenantId,
            targetTenantId,
            amount,
        );
    }

    @Get('clients')
    @Roles(TenantRole.OWNER)
    async listClients(@Request() req: any) {
        return this.resellerService.listSubTenants(req.user.tenantId);
    }
}
