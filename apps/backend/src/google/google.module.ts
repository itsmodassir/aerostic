import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GoogleService } from './google.service';
import { GoogleController } from './google.controller';
import { GoogleAccount } from './entities/google-account.entity';
import { EncryptionService } from '../common/encryption.service';
import { ConfigModule } from '@nestjs/config';

@Module({
    imports: [
        TypeOrmModule.forFeature([GoogleAccount]),
        ConfigModule
    ],
    controllers: [GoogleController],
    providers: [GoogleService, EncryptionService],
    exports: [GoogleService]
})
export class GoogleModule { }
