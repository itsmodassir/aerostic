import { Controller, Get, Query } from '@nestjs/common';
import { MetaService } from './meta.service';

@Controller('meta')
export class MetaController {
  constructor(private readonly metaService: MetaService) {}

  @Get('callback')
  async metaCallback(
    @Query('code') code: string,
    @Query('state') tenantId: string,
    @Query('wabaId') wabaId?: string,
    @Query('phoneNumberId') phoneNumberId?: string,
  ) {
    await this.metaService.handleOAuthCallback(
      code,
      tenantId,
      wabaId,
      phoneNumberId,
    );
    return { success: true, message: 'WhatsApp Connected Successfully' };
  }
}
