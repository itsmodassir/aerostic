import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { Tenant } from '../tenants/entities/tenant.entity';
import { WhatsappAccount } from '../whatsapp/entities/whatsapp-account.entity';

@Module({
    imports: [
        TypeOrmModule.forFeature([Tenant, WhatsappAccount]),
    ],
    controllers: [AdminController],
    providers: [AdminService],
})
export class AdminModule { }
