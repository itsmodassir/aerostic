import { Module } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { UsersModule } from "../users/users.module";
import { TenantsModule } from "../tenants/tenants.module";
import { PassportModule } from "@nestjs/passport";
import { JwtModule } from "@nestjs/jwt";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { JwtStrategy } from "./jwt.strategy";
import { AuthController } from "./auth.controller";
import { TypeOrmModule } from "@nestjs/typeorm";
import { TenantMembership } from "@shared/database/entities/core/tenant-membership.entity";
import { Role } from "@shared/database/entities/core/role.entity";
import { AuditModule } from "../audit/audit.module";

import { UserSession } from "./entities/user-session.entity";
import { AuthorizationModule } from "@shared/authorization/authorization.module";
import { CommonModule } from "@shared/common.module";
import { User } from "@shared/database/entities/core/user.entity";
import { Domain } from "@shared/database/entities/core/domain.entity";
import { ResellerConfig } from "@shared/database/entities/core/reseller-config.entity";

@Module({
  imports: [
    UsersModule,
    TenantsModule,
    AuditModule,
    CommonModule,
    AuthorizationModule,
    TypeOrmModule.forFeature([
      TenantMembership,
      Role,
      UserSession,
      User,
      Domain,
      ResellerConfig,
    ]), // Required for AuthController and AuthService injection
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>("JWT_SECRET") || "default_secret",
        signOptions: { expiresIn: "1d" },
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [AuthService, JwtStrategy],
  controllers: [AuthController],
  exports: [AuthService],
})
export class AuthModule {}
