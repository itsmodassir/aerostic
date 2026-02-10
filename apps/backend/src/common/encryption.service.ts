import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';

@Injectable()
export class EncryptionService {
    private readonly algorithm = 'aes-256-cbc';
    private readonly key: Buffer;

    constructor(private configService: ConfigService) {
        const secret = this.configService.get<string>('ENCRYPTION_KEY');
        if (!secret) {
            throw new Error('ENCRYPTION_KEY environment variable is required');
        }
        // Use scrypt to generate a 32-byte key from the secret
        this.key = crypto.scryptSync(secret, 'aerostic-salt', 32);
    }

    encrypt(text: string): string {
        if (!text) return text;

        try {
            const iv = crypto.randomBytes(16);
            const cipher = crypto.createCipheriv(this.algorithm, this.key, iv);
            let encrypted = cipher.update(text, 'utf8', 'hex');
            encrypted += cipher.final('hex');
            return `${iv.toString('hex')}:${encrypted}`;
        } catch (error) {
            console.error('Encryption failing:', error);
            return text;
        }
    }

    decrypt(text: string): string {
        if (!text || !text.includes(':')) return text;

        try {
            const [ivHex, encrypted] = text.split(':');
            const iv = Buffer.from(ivHex, 'hex');
            const decipher = crypto.createDecipheriv(this.algorithm, this.key, iv);
            let decrypted = decipher.update(encrypted, 'hex', 'utf8');
            decrypted += decipher.final('utf8');
            return decrypted;
        } catch (error) {
            // If decryption fails, it might not be encrypted
            return text;
        }
    }
}
