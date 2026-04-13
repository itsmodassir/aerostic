import { Controller, Get, Post, Patch, Param, Body, UseGuards, Req } from "@nestjs/common";
import { CommerceService } from "@api/commerce/commerce.service";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";

@Controller("commerce")
@UseGuards(JwtAuthGuard)
export class CommerceController {
  constructor(private readonly commerceService: CommerceService) {}

  @Get("orders")
  async getOrders(@Req() req: any) {
    return this.commerceService.findAll(req.user.tenantId);
  }

  @Get("orders/:id")
  async getOrder(@Param("id") id: string, @Req() req: any) {
    return this.commerceService.findOne(id, req.user.tenantId);
  }

  @Patch("orders/:id/status")
  async updateStatus(
    @Param("id") id: string,
    @Body("status") status: string,
    @Req() req: any,
  ) {
    return this.commerceService.updateStatus(id, req.user.tenantId, status);
  }

  // --- Products ---

  @Get("products")
  async getProducts(@Req() req: any) {
    return this.commerceService.getProducts(req.user.tenantId);
  }

  @Post("products")
  async createProduct(@Body() data: any, @Req() req: any) {
    return this.commerceService.createProduct(req.user.tenantId, data);
  }

  @Post("products/batch")
  async batchCreate(@Body() body: any, @Req() req: any) {
    return this.commerceService.batchSaveProducts(req.user.tenantId, body.items, body.catalogId);
  }

  @Patch("products/:id")
  async updateProduct(
    @Param("id") id: string,
    @Body() data: any,
    @Req() req: any,
  ) {
    return this.commerceService.updateProduct(id, req.user.tenantId, data);
  }

  @Post("products/:id/publish")
  async publishProduct(@Param("id") id: string, @Req() req: any) {
    return this.commerceService.publishToMeta(id, req.user.tenantId);
  }

  // --- Catalogs ---

  @Get("catalogs")
  async getCatalogs(@Req() req: any) {
    return this.commerceService.getCatalogs(req.user.tenantId);
  }

  @Post("catalogs")
  async createCatalog(@Body() body: any, @Req() req: any) {
    return this.commerceService.createCatalog(req.user.tenantId, body.name, body.vertical);
  }

  // --- Settings ---

  @Get("settings/portfolios")
  async getPortfolios(@Req() req: any) {
    return this.commerceService.getPortfolios(req.user.tenantId);
  }

  @Patch("settings")
  async updateSettings(@Body() body: any, @Req() req: any) {
    return this.commerceService.updateSettings(req.user.tenantId, body);
  }

  // --- Batch ---

  @Post("catalogs/:catalogId/batch-sync")
  async syncBatch(@Param("catalogId") catalogId: string, @Body() body: any, @Req() req: any) {
    return this.commerceService.syncBatchToMeta(req.user.tenantId, catalogId, body.productIds);
  }

  @Post("orders/:id/payment-link")
  async sendPaymentLink(@Param("id") id: string, @Req() req: any) {
    return this.commerceService.generatePaymentLink(id, req.user.tenantId);
  }
}
