import { Module } from '@nestjs/common';
import { AiService } from './ai.service';
import { MessagesModule } from '../messages/messages.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AiAgent } from './entities/ai-agent.entity';
import { AiController } from './ai.controller';

@Module({
  imports: [TypeOrmModule.forFeature([AiAgent]), MessagesModule],
  controllers: [AiController],
  providers: [AiService],
  exports: [AiService],
})
export class AiModule {}
