import { ValueTransformer } from "typeorm";
import { EncryptionService } from "../../encryption.service";

/**
 * TypeORM Transformer for Database Column Encryption
 */
export class EncryptionTransformer implements ValueTransformer {
  /**
   * Encrypt data before saving to the database
   */
  to(value: string | null): string | null {
    if (!value) return value;
    const service = EncryptionService.getInstance();
    if (!service) return value; // Fallback for early initialization
    return service.encrypt(value);
  }

  /**
   * Decrypt data after retrieving from the database
   */
  from(value: string | null): string | null {
    if (!value) return value;
    const service = EncryptionService.getInstance();
    if (!service) return value; // Fallback
    return service.decrypt(value);
  }
}
