import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ApiKey } from "../../shared/database/entities/core/api-key.entity";
import { ApiKeyUsage } from "../../shared/database/entities/analytics/api-key-usage.entity";
import { ApiKeyService } from "./api-keys.service";

import { ApiKeyUsageInterceptor } from "./api-key-usage.interceptor";
import { ApiKeysController } from "./api-keys.controller";

@Module({
  imports: [TypeOrmModule.forFeature([ApiKey, ApiKeyUsage])],
  controllers: [ApiKeysController],
  providers: [ApiKeyService, ApiKeyUsageInterceptor],
  exports: [ApiKeyService, ApiKeyUsageInterceptor],
})
export class ApiKeysModule {}
