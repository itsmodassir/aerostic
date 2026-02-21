import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import * as crypto from "crypto";

@Injectable()
export class EncryptionService {
  private static instance: EncryptionService;
  private readonly algorithm = "aes-256-gcm";
  private readonly key: Buffer;

  constructor(private configService: ConfigService) {
    const secret = this.configService.get<string>("ENCRYPTION_KEY");
    if (!secret) {
      throw new Error("ENCRYPTION_KEY environment variable is required");
    }
    // Use scrypt to generate a 32-byte key from the secret
    this.key = crypto.scryptSync(secret, "aerostic-salt", 32);
    EncryptionService.instance = this;
  }

  static getInstance(): EncryptionService {
    return EncryptionService.instance;
  }

  encrypt(text: string): string {
    if (!text) return text;

    try {
      const iv = crypto.randomBytes(12); // GCM recommended IV size is 12 bytes
      const cipher = crypto.createCipheriv(this.algorithm, this.key, iv);

      let encrypted = cipher.update(text, "utf8", "hex");
      encrypted += cipher.final("hex");

      const authTag = cipher.getAuthTag().toString("hex");

      // format: iv:authTag:encrypted
      return `${iv.toString("hex")}:${authTag}:${encrypted}`;
    } catch (error) {
      console.error("Encryption failed:", error);
      return text;
    }
  }

  decrypt(text: string): string {
    if (!text || !text.includes(":")) return text;

    try {
      const parts = text.split(":");
      if (parts.length !== 3) {
        // Handle legacy CBC if needed, but here we enforce GCM for new data
        // For CBC fallback logic could be added here if migration is needed
        return text;
      }

      const [ivHex, authTagHex, encrypted] = parts;
      const iv = Buffer.from(ivHex, "hex");
      const authTag = Buffer.from(authTagHex, "hex");

      const decipher = crypto.createDecipheriv(this.algorithm, this.key, iv);
      decipher.setAuthTag(authTag);

      let decrypted = decipher.update(encrypted, "hex", "utf8");
      decrypted += decipher.final("utf8");
      return decrypted;
    } catch (error) {
      console.error("Decryption failed:", error);
      return text;
    }
  }
}
