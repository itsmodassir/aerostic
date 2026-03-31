const crypto = require('crypto');

const secret = 'aimstors_encryption_key_v1_secure_2026';
const salt = 'aimstors-salt';
const algorithm = 'aes-256-gcm';
const text = 'd8855932593d5467b5c0077d:5f5aa3863f47a6af7b9c38f892724330:7ebff85d34f38e8176f56554abd27476f2c47223006c94cdfd6bb1eae90eb910';

function decrypt(text) {
    const key = crypto.scryptSync(secret, salt, 32);
    const parts = text.split(':');
    const [ivHex, authTagHex, encrypted] = parts;
    const iv = Buffer.from(ivHex, 'hex');
    const authTag = Buffer.from(authTagHex, 'hex');

    const decipher = crypto.createDecipheriv(algorithm, key, iv);
    decipher.setAuthTag(authTag);

    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
}

try {
    console.log('Decrypted Secret:', decrypt(text));
} catch (e) {
    console.error('Decryption failed:', e.message);
}
