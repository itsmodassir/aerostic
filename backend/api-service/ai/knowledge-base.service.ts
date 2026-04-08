import { Injectable, Logger, BadRequestException, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { KnowledgeBase } from "./entities/knowledge-base.entity";
import { KnowledgeChunk } from "./entities/knowledge-chunk.entity";
import { AiService } from "./ai.service";
import axios from "axios";
import * as https from "https";
import * as XLSX from "xlsx";
// @ts-ignore
import * as pdfParse from "pdf-parse";

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

  async createKnowledgeBase(
    tenantId: string,
    name: string,
    description?: string,
  ) {
    const kb = this.kbRepo.create({
      tenantId,
      name,
      description,
    });
    return this.kbRepo.save(kb);
  }

  async getKnowledgeBases(tenantId: string) {
    const items = await this.kbRepo
      .createQueryBuilder("kb")
      .leftJoin("kb.chunks", "chunk")
      .where("kb.tenantId = :tenantId", { tenantId })
      .groupBy("kb.id")
      .orderBy("kb.updatedAt", "DESC")
      .select([
        "kb.id AS id",
        "kb.name AS name",
        "kb.description AS description",
        "kb.createdAt AS createdAt",
        "kb.updatedAt AS updatedAt",
        "COUNT(chunk.id) AS chunkCount",
      ])
      .getRawMany();

    return items.map((item) => ({
      id: item.id,
      name: item.name,
      description: item.description,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
      chunkCount: Number(item.chunkCount || 0),
    }));
  }

  async assertOwnership(tenantId: string, knowledgeBaseId: string) {
    const kb = await this.kbRepo.findOne({
      where: { id: knowledgeBaseId, tenantId },
    });
    if (!kb) {
      throw new NotFoundException("Knowledge base not found");
    }
    return kb;
  }

  async updateKnowledgeBase(
    tenantId: string,
    knowledgeBaseId: string,
    updates: { name?: string; description?: string | null },
  ) {
    const kb = await this.assertOwnership(tenantId, knowledgeBaseId);

    if (updates.name !== undefined) {
      const nextName = updates.name.trim();
      if (!nextName) {
        throw new BadRequestException("Knowledge base name is required");
      }
      kb.name = nextName;
    }

    if (updates.description !== undefined) {
      kb.description = updates.description?.trim() || "";
    }

    return this.kbRepo.save(kb);
  }

  async deleteKnowledgeBase(tenantId: string, knowledgeBaseId: string) {
    const kb = await this.assertOwnership(tenantId, knowledgeBaseId);
    await this.chunkRepo.delete({ knowledgeBaseId: kb.id });
    await this.kbRepo.remove(kb);
    return { success: true };
  }

  async ingestText(
    knowledgeBaseId: string,
    content: string,
    metadata: any = {},
  ) {
    if (!content?.trim()) {
      throw new BadRequestException("Content is required");
    }
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

  async ingestPdf(
    knowledgeBaseId: string,
    fileBuffer: Buffer,
    metadata: any = {},
  ) {
    this.logger.log(`Ingesting PDF into KB: ${knowledgeBaseId}`);
    try {
      const data = await pdfParse(fileBuffer);
      return this.ingestText(knowledgeBaseId, data.text, metadata);
    } catch (error) {
      this.logger.error("Failed to parse PDF document", error);
      throw new Error("Failed to parse uploaded PDF");
    }
  }

  async ingestUrl(
    knowledgeBaseId: string,
    url: string,
    metadata: any = {},
  ) {
    if (!/^https?:\/\//i.test(url || "")) {
      throw new BadRequestException("A valid http or https URL is required");
    }

    const requestConfig = {
      timeout: 15000,
      maxRedirects: 5,
      responseType: "text" as const,
      headers: {
        "User-Agent": "AimstoreKnowledgeBot/1.0 (+https://aimstore.in)",
        Accept: "text/html,application/xhtml+xml,text/plain;q=0.9,*/*;q=0.8",
      },
    };

    let response;
    try {
      response = await axios.get(url, requestConfig);
    } catch (error: any) {
      const errorCode = String(error?.code || "");
      const errorMessage = String(error?.message || "");
      const looksLikeTlsIssue =
        errorCode === "UNABLE_TO_GET_ISSUER_CERT_LOCALLY" ||
        errorCode === "SELF_SIGNED_CERT_IN_CHAIN" ||
        errorCode === "DEPTH_ZERO_SELF_SIGNED_CERT" ||
        errorCode === "UNABLE_TO_VERIFY_LEAF_SIGNATURE" ||
        errorMessage.toLowerCase().includes("local issuer certificate");

      if (!looksLikeTlsIssue) {
        throw error;
      }

      this.logger.warn(`Retrying URL ingest without strict TLS verification for ${url}`);
      response = await axios.get(url, {
        ...requestConfig,
        httpsAgent: new https.Agent({ rejectUnauthorized: false }),
      });
    }

    const contentType = String(response.headers["content-type"] || "").toLowerCase();
    const raw = typeof response.data === "string" ? response.data : JSON.stringify(response.data);
    const normalized =
      contentType.includes("text/html") || raw.includes("<html")
        ? this.extractReadableTextFromHtml(raw)
        : raw;

    return this.ingestText(knowledgeBaseId, normalized, {
      ...metadata,
      sourceType: "url",
      sourceUrl: url,
      fetchedAt: new Date().toISOString(),
    });
  }

  async ingestDocument(
    knowledgeBaseId: string,
    file: { buffer: Buffer; mimetype?: string; originalname?: string },
  ) {
    const mimetype = String(file.mimetype || "").toLowerCase();
    const filename = file.originalname || "upload";
    const metadata = {
      filename,
      mimetype,
      uploadedAt: new Date().toISOString(),
    };

    if (mimetype === "application/pdf") {
      return this.ingestPdf(knowledgeBaseId, file.buffer, metadata);
    }

    if (
      mimetype === "text/plain" ||
      mimetype === "text/csv" ||
      mimetype === "text/markdown" ||
      mimetype === "text/html" ||
      mimetype === "application/json" ||
      mimetype === "application/xml" ||
      mimetype === "text/xml" ||
      mimetype === "application/xhtml+xml"
    ) {
      const rawText = file.buffer.toString("utf8");
      const normalized =
        mimetype === "text/html" || mimetype === "application/xhtml+xml"
          ? this.extractReadableTextFromHtml(rawText)
          : rawText;
      return this.ingestText(knowledgeBaseId, normalized, metadata);
    }

    if (
      mimetype === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ||
      mimetype === "application/vnd.ms-excel"
    ) {
      const workbook = XLSX.read(file.buffer, { type: "buffer" });
      const sheetText = workbook.SheetNames.map((sheetName) => {
        const sheet = workbook.Sheets[sheetName];
        return `# Sheet: ${sheetName}\n${XLSX.utils.sheet_to_csv(sheet)}`;
      }).join("\n\n");
      return this.ingestText(knowledgeBaseId, sheetText, metadata);
    }

    throw new BadRequestException(
      "Unsupported file type. Use PDF, TXT, CSV, Markdown, HTML, JSON, XML, XLS, or XLSX.",
    );
  }

  /**
   * Splits text into smaller chunks with some overlap
   */
  private chunkText(
    text: string,
    size: number,
    overlap: number = 200,
  ): string[] {
    const chunks: string[] = [];
    let start = 0;

    while (start < text.length) {
      const end = start + size;
      chunks.push(text.substring(start, end));
      start += size - overlap;
    }

    return chunks;
  }

  private extractReadableTextFromHtml(html: string): string {
    return html
      .replace(/<script[\s\S]*?<\/script>/gi, " ")
      .replace(/<style[\s\S]*?<\/style>/gi, " ")
      .replace(/<noscript[\s\S]*?<\/noscript>/gi, " ")
      .replace(/<[^>]+>/g, " ")
      .replace(/&nbsp;/gi, " ")
      .replace(/&amp;/gi, "&")
      .replace(/\s+/g, " ")
      .trim();
  }
}
