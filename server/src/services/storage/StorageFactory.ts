import { IStorageService } from '../../interfaces/IStorageService';
import { LocalStorageService } from './LocalStorageService';
import { S3StorageService } from './S3StorageService';
import { config } from '../../config';

export class StorageFactory {
  private static instance: IStorageService | null = null;

  /**
   * Get the configured storage service instance (singleton)
   * @returns IStorageService instance
   */
  static getInstance(): IStorageService {
    if (!this.instance) {
      this.instance = this.createStorageService();
    }
    return this.instance;
  }

  /**
   * Create a new storage service instance based on configuration
   * @returns IStorageService instance
   */
  private static createStorageService(): IStorageService {
    const storageType = config.storage.type;

    switch (storageType) {
      case 'local':
        return new LocalStorageService();
      
      case 'aws':
      case 's3':
        return new S3StorageService();
      
      default:
        console.warn(`Unknown storage type: ${storageType}. Falling back to local storage.`);
        return new LocalStorageService();
    }
  }

  /**
   * Reset the singleton instance (useful for testing)
   */
  static resetInstance(): void {
    this.instance = null;
  }

  /**
   * Check if the current storage configuration is valid
   * @returns boolean
   */
  static isConfigurationValid(): boolean {
    const storageType = config.storage.type;

    switch (storageType) {
      case 'local':
        return !!config.storage.localPath;
      
      case 'aws':
      case 's3':
        return !!(
          config.storage.aws.accessKeyId &&
          config.storage.aws.secretAccessKey &&
          config.storage.aws.region &&
          config.storage.aws.bucket
        );
      
      default:
        return false;
    }
  }

  /**
   * Get storage configuration info for debugging
   * @returns object with configuration details
   */
  static getConfigurationInfo(): {
    type: string;
    isValid: boolean;
    details: Record<string, any>;
  } {
    const storageType = config.storage.type;
    const isValid = this.isConfigurationValid();

    let details: Record<string, any> = {};

    switch (storageType) {
      case 'local':
        details = {
          localPath: config.storage.localPath,
        };
        break;
      
      case 'aws':
      case 's3':
        details = {
          region: config.storage.aws.region,
          bucket: config.storage.aws.bucket,
          hasAccessKey: !!config.storage.aws.accessKeyId,
          hasSecretKey: !!config.storage.aws.secretAccessKey,
        };
        break;
    }

    return {
      type: storageType,
      isValid,
      details,
    };
  }
}