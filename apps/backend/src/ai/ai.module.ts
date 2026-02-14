import { Module } from '@nestjs/common';
import { AiService } from './ai.service';
import { MessagesModule } from '../messages/messages.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AiAgent } from './entities/ai-agent.entity';
import { KnowledgeBase } from './entities/knowledge-base.entity';
import { KnowledgeChunk } from './entities/knowledge-chunk.entity';
import { AiController } from './ai.controller';
import { AuditModule } from '../audit/audit.module';
import { KnowledgeBaseService } from './knowledge-base.service';

@Module({
  imports: [TypeOrmModule.forFeature([AiAgent, KnowledgeBase, KnowledgeChunk]), MessagesModule, AuditModule],
  controllers: [AiController],
  providers: [AiService, KnowledgeBaseService],
  exports: [AiService, KnowledgeBaseService],
})
export class AiModule { }
