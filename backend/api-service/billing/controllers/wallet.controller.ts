import {
    Controller,
    Get,
    Post,
    Body,
    UseGuards,
    UnauthorizedException,
    Query,
} from "@nestjs/common";
import { WalletService } from "../wallet.service";
import { RazorpayService } from "../razorpay.service";
import { JwtAuthGuard } from "@api/auth/jwt-auth.guard";
import { UserTenant } from "../../auth/decorators/user-tenant.decorator";
import { WalletAccountType } from "@shared/database/entities/billing/wallet-account.entity";
import { AdminConfigService } from "../../admin/services/admin-config.service";

@UseGuards(JwtAuthGuard)
@Controller("billing/wallet")
export class WalletController {
    constructor(
        private walletService: WalletService,
        private razorpayService: RazorpayService,
        private adminConfigService: AdminConfigService,
    ) { }

    @Get("balance")
    async getBalance(
        @UserTenant() tenantId: string,
        @Query("type") type: WalletAccountType = WalletAccountType.MAIN_BALANCE,
    ) {
        if (!tenantId) throw new UnauthorizedException("Tenant ID required");
        const balance = await this.walletService.getBalance(tenantId, type);
        const rateStr = await this.adminConfigService.getConfigValue("whatsapp.template_rate_inr", tenantId);
        const templateRate = parseFloat(rateStr || "0.80");
        return { balance, type, templateRate };
    }

    @Get("transactions")
    async getTransactions(
        @UserTenant() tenantId: string,
        @Query("limit") limit: number = 20,
        @Query("offset") offset: number = 0,
    ) {
        if (!tenantId) throw new UnauthorizedException("Tenant ID required");
        const [transactions, total] = await this.walletService.getTransactions(tenantId, limit, offset);
        return { transactions, total };
    }

    @Post("recharge")
    async createRechargeLink(
        @UserTenant() tenantId: string,
        @Body() body: { amount: number; description?: string },
    ) {
        if (!tenantId) throw new UnauthorizedException("Tenant ID required");
        if (body.amount <= 0) throw new Error("Amount must be positive");

        const description = body.description || `Wallet Recharge for Tenant ${tenantId}`;
        return this.razorpayService.createPaymentLink(
            body.amount,
            description,
            tenantId,
        );
    }
}
