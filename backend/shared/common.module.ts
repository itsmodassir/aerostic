import { Module, Global } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { RedisService } from "./redis.service";
import { EncryptionService } from "./encryption.service";
import { MailService } from "./mail.service";
import { KafkaService } from "./kafka.service";
import { NotificationService } from "./notification.service";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Tenant } from "@shared/database/entities/core/tenant.entity";
import { TenantMembership } from "@shared/database/entities/core/tenant-membership.entity";
import { Role } from "@shared/database/entities/core/role.entity";
import { User } from "@shared/database/entities/core/user.entity";
import { Plan } from "@shared/database/entities/billing/plan.entity";
import { Permission } from "@shared/database/entities/core/permission.entity";
import { RolePermission } from "@shared/database/entities/core/role-permission.entity";
import { ResellerConfig } from "@shared/database/entities/core/reseller-config.entity";
import { Domain } from "@shared/database/entities/core/domain.entity";
import { Contact } from "@shared/database/entities/core/contact.entity";
import { Mailbox } from "@shared/database/entities/core/mailbox.entity";
import { Message } from "@shared/database/entities/messaging/message.entity";
import { Conversation } from "@shared/database/entities/messaging/conversation.entity";

@Global()
@Module({
  imports: [
    ConfigModule,
    TypeOrmModule.forFeature([
      Tenant,
      TenantMembership,
      Role,
      User,
      Plan,
      Permission,
      RolePermission,
      ResellerConfig,
      Domain,
      Contact,
      Mailbox,
      Message,
      Conversation,
    ]),
  ],
  providers: [
    RedisService,
    EncryptionService,
    MailService,
    KafkaService,
    NotificationService,
  ],
  exports: [
    RedisService,
    EncryptionService,
    MailService,
    KafkaService,
    NotificationService,
    TypeOrmModule,
  ],
})
export class CommonModule {}
