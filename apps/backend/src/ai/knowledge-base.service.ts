import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { KnowledgeBase } from './entities/knowledge-base.entity';
import { KnowledgeChunk } from './entities/knowledge-chunk.entity';
import { AiService } from './ai.service';

@Injectable()
export class KnowledgeBaseService {
    private readonly logger = new Logger(KnowledgeBaseService.name);

    constructor(
        @InjectRepository(KnowledgeBase)
        private kbRepo: Repository<KnowledgeBase>,
        @InjectRepository(KnowledgeChunk)
        private chunkRepo: Repository<KnowledgeChunk>,
        private aiService: AiService,
    ) { }

    async createKnowledgeBase(tenantId: string, name: string, description?: string) {
        const kb = this.kbRepo.create({
            tenantId,
            name,
            description,
        });
        return this.kbRepo.save(kb);
    }

    async getKnowledgeBases(tenantId: string) {
        return this.kbRepo.find({ where: { tenantId } });
    }

    async ingestText(knowledgeBaseId: string, content: string, metadata: any = {}) {
        this.logger.log(`Ingesting content into KB: ${knowledgeBaseId}`);

        // 1. Simple Chunking (Fixed size for now, can be improved to use sentence boundaries)
        const chunks = this.chunkText(content, 1000); // 1000 chars approx

        const results = [];
        for (const chunkContent of chunks) {
            // 2. Generate Embedding
            const embedding = await this.aiService.generateEmbedding(chunkContent);

            // 3. Save Chunk
            const chunk = this.chunkRepo.create({
                knowledgeBaseId,
                content: chunkContent,
                embedding,
                metadata,
            });
            const saved = await this.chunkRepo.save(chunk);
            results.push(saved.id);
        }

        return {
            chunkCount: results.length,
            chunkIds: results,
        };
    }

    /**
     * Splits text into smaller chunks with some overlap
     */
    private chunkText(text: string, size: number, overlap: number = 200): string[] {
        const chunks: string[] = [];
        let start = 0;

        while (start < text.length) {
            const end = start + size;
            chunks.push(text.substring(start, end));
            start += size - overlap;
        }

        return chunks;
    }
}
