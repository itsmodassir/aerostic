import { Injectable, Logger } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { GoogleAccount } from "./entities/google-account.entity";
import { EncryptionService } from "@shared/encryption.service";
import { Tool } from "../ai/tools/tool.interface";

@Injectable()
export class GoogleService {
  private readonly logger = new Logger(GoogleService.name);

  constructor(
    @InjectRepository(GoogleAccount)
    private googleAccountRepo: Repository<GoogleAccount>,
    private encryptionService: EncryptionService,
  ) {}

  // In a real implementation, we would use 'googleapis' package and OAuth2 client
  // For now, we stub the methods to support the Node logic

  async listFiles(tenantId: string, accessToken: string) {
    this.logger.log(`[STUB] Listing files for tenant ${tenantId}`);
    return ["file1.txt", "file2.txt", "report.pdf"];
  }

  async readFile(tenantId: string, accessToken: string, fileId: string) {
    this.logger.log(`[STUB] Reading file ${fileId} for tenant ${tenantId}`);
    return "This is the content of the file from Google Drive.";
  }

  async uploadFile(
    tenantId: string,
    accessToken: string,
    content: string,
    fileName: string,
    mimeType: string,
  ) {
    this.logger.log(`[STUB] Uploading file ${fileName} for tenant ${tenantId}`);
    return { id: "new-file-id", name: fileName };
  }

  async getAccessToken(tenantId: string): Promise<string | null> {
    const account = await this.googleAccountRepo.findOne({
      where: { tenantId },
    });
    if (!account) return null;

    // Decrypt
    return this.encryptionService.decrypt(account.accessToken);
  }

  /**
   * Exposes Google Drive capabilities as AI Tools.
   * Tools are strictly scoped and permissions are checked via the token.
   */
  getTools(tenantId: string): Tool[] {
    return [
      {
        name: "google_drive_list_files",
        description: "List files in Google Drive. Returns file names and IDs.",
        parameters: {
          type: "object",
          properties: {
            pageSize: {
              type: "number",
              description: "Number of files to return (default 10)",
            },
          },
        },
        execute: async (args: any) => {
          const token = await this.getAccessToken(tenantId);
          if (!token) throw new Error("Google Account not connected");
          return this.listFiles(tenantId, token);
        },
      },
      {
        name: "google_drive_read_file",
        description:
          "Read the content of a text file from Google Drive given its ID.",
        parameters: {
          type: "object",
          properties: {
            fileId: {
              type: "string",
              description: "The ID of the file to read",
            },
          },
          required: ["fileId"],
        },
        execute: async (args: any) => {
          const token = await this.getAccessToken(tenantId);
          if (!token) throw new Error("Google Account not connected");
          return this.readFile(tenantId, token, args.fileId);
        },
      },
      {
        name: "google_drive_upload_file",
        description: "Upload a text file to Google Drive.",
        parameters: {
          type: "object",
          properties: {
            fileName: { type: "string", description: "Name of the file" },
            content: {
              type: "string",
              description: "Text content of the file",
            },
          },
          required: ["fileName", "content"],
        },
        execute: async (args: any) => {
          const token = await this.getAccessToken(tenantId);
          if (!token) throw new Error("Google Account not connected");
          return this.uploadFile(
            tenantId,
            token,
            args.content,
            args.fileName,
            "text/plain",
          );
        },
      },
    ];
  }

  async handleAuthCallback(tenantId: string, code: string) {
    // In real implementation: Exchange code for tokens
    // const { tokens } = await oauth2Client.getToken(code);

    // MOCK token exchange for demonstration since we don't have client credentials configured
    // In production, use valid Google Client ID/Secret in .env
    const mockAccessToken = `mock-access-${Date.now()}`;
    const mockRefreshToken = `mock-refresh-${Date.now()}`;
    const mockExpiry = new Date(Date.now() + 3600 * 1000);

    let account = await this.googleAccountRepo.findOne({ where: { tenantId } });
    if (!account) {
      account = new GoogleAccount();
      account.tenantId = tenantId;
      account.email = "user@example.com";
    }

    account.accessToken = this.encryptionService.encrypt(mockAccessToken);
    account.refreshToken = this.encryptionService.encrypt(mockRefreshToken);
    account.tokenExpiresAt = mockExpiry;
    account.scopes = ["drive.readonly", "drive.file"];

    await this.googleAccountRepo.save(account);
    this.logger.log(`Google Account connected for tenant ${tenantId}`);
  }
}
