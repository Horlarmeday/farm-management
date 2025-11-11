import * as crypto from 'crypto';
import config from '../config';

/**
 * Encryption service for sensitive data fields
 * Uses AES-256-GCM for authenticated encryption
 */
export class EncryptionService {
  private static instance: EncryptionService;
  private readonly algorithm = 'aes-256-gcm';
  private readonly keyLength = 32; // 256 bits
  private readonly ivLength = 16; // 128 bits
  private readonly tagLength = 16; // 128 bits
  private readonly key: Buffer;

  private constructor() {
    const encryptionKey = config.security.encryptionKey;
    if (!encryptionKey) {
      throw new Error('ENCRYPTION_KEY configuration is required');
    }
    
    if (encryptionKey.length < 32) {
      throw new Error('ENCRYPTION_KEY must be at least 32 characters long');
    }
    
    // Use the first 32 bytes of the key
    this.key = Buffer.from(encryptionKey.slice(0, 32), 'utf8');
  }

  /**
   * Get singleton instance
   */
  public static getInstance(): EncryptionService {
    if (!EncryptionService.instance) {
      EncryptionService.instance = new EncryptionService();
    }
    return EncryptionService.instance;
  }

  /**
   * Encrypt sensitive data
   * @param plaintext - Data to encrypt
   * @returns Encrypted data with IV and auth tag
   */
  public encrypt(plaintext: string): string {
    if (!plaintext) return plaintext;

    try {
      const iv = crypto.randomBytes(this.ivLength);
      const cipher = crypto.createCipher(this.algorithm, this.key);
      cipher.setAAD(Buffer.from('farm-management-aad'));
      
      let encrypted = cipher.update(plaintext, 'utf8', 'hex');
      encrypted += cipher.final('hex');
      
      const authTag = cipher.getAuthTag();
      
      // Combine IV + authTag + encrypted data
      const combined = Buffer.concat([
        iv,
        authTag,
        Buffer.from(encrypted, 'hex')
      ]);
      
      return combined.toString('base64');
    } catch (error) {
      console.error('Encryption error:', error);
      throw new Error('Failed to encrypt data');
    }
  }

  /**
   * Decrypt sensitive data
   * @param encryptedData - Encrypted data with IV and auth tag
   * @returns Decrypted plaintext
   */
  public decrypt(encryptedData: string): string {
    if (!encryptedData) return encryptedData;

    try {
      const combined = Buffer.from(encryptedData, 'base64');
      
      // Extract IV, auth tag, and encrypted data
      const iv = combined.subarray(0, this.ivLength);
      const authTag = combined.subarray(this.ivLength, this.ivLength + this.tagLength);
      const encrypted = combined.subarray(this.ivLength + this.tagLength);
      
      const decipher = crypto.createDecipher(this.algorithm, this.key);
      decipher.setAAD(Buffer.from('farm-management-aad'));
      decipher.setAuthTag(authTag);
      
      let decrypted = decipher.update(encrypted, undefined, 'utf8');
      decrypted += decipher.final('utf8');
      
      return decrypted;
    } catch (error) {
      console.error('Decryption error:', error);
      throw new Error('Failed to decrypt data');
    }
  }

  /**
   * Encrypt financial amount (preserves decimal precision)
   * @param amount - Financial amount as number
   * @returns Encrypted amount as string
   */
  public encryptAmount(amount: number): string {
    if (amount === null || amount === undefined) return '';
    return this.encrypt(amount.toString());
  }

  /**
   * Decrypt financial amount
   * @param encryptedAmount - Encrypted amount as string
   * @returns Decrypted amount as number
   */
  public decryptAmount(encryptedAmount: string): number {
    if (!encryptedAmount) return 0;
    const decrypted = this.decrypt(encryptedAmount);
    return parseFloat(decrypted) || 0;
  }

  /**
   * Check if data appears to be encrypted
   * @param data - Data to check
   * @returns True if data appears encrypted
   */
  public isEncrypted(data: string): boolean {
    if (!data) return false;
    
    try {
      // Check if it's valid base64 and has minimum length for IV + tag + data
      const buffer = Buffer.from(data, 'base64');
      return buffer.length >= (this.ivLength + this.tagLength + 1);
    } catch {
      return false;
    }
  }

  /**
   * Encrypt object with specified fields
   * @param obj - Object to encrypt
   * @param fields - Fields to encrypt
   * @returns Object with encrypted fields
   */
  public encryptFields<T extends Record<string, any>>(obj: T, fields: (keyof T)[]): T {
    const result = { ...obj };
    
    for (const field of fields) {
      if (result[field] !== null && result[field] !== undefined) {
        if (typeof result[field] === 'number') {
          result[field] = this.encryptAmount(result[field] as number) as T[keyof T];
        } else if (typeof result[field] === 'string') {
          result[field] = this.encrypt(result[field] as string) as T[keyof T];
        }
      }
    }
    
    return result;
  }

  /**
   * Decrypt object with specified fields
   * @param obj - Object to decrypt
   * @param fields - Fields to decrypt
   * @param numericFields - Fields that should be converted back to numbers
   * @returns Object with decrypted fields
   */
  public decryptFields<T extends Record<string, any>>(
    obj: T, 
    fields: (keyof T)[], 
    numericFields: (keyof T)[] = []
  ): T {
    const result = { ...obj };
    
    for (const field of fields) {
      if (result[field] && this.isEncrypted(result[field] as string)) {
        if (numericFields.includes(field)) {
          result[field] = this.decryptAmount(result[field] as string) as T[keyof T];
        } else {
          result[field] = this.decrypt(result[field] as string) as T[keyof T];
        }
      }
    }
    
    return result;
  }
}

// Export function to get singleton instance (lazy loading)
export const getEncryptionService = () => EncryptionService.getInstance();