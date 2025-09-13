import { IStorageService } from '../../interfaces/IStorageService';
import { promises as fs } from 'fs';
import path from 'path';
import { config } from '../../config';
import crypto from 'crypto';

export class LocalStorageService implements IStorageService {
  private basePath: string;

  constructor() {
    this.basePath = config.storage.localPath;
    this.ensureDirectoryExists(this.basePath);
  }

  async uploadFile(
    file: Buffer,
    fileName: string,
    mimeType: string,
    folder?: string
  ): Promise<{
    url: string;
    key: string;
    size: number;
    mimeType: string;
  }> {
    try {
      // Generate unique filename to avoid conflicts
      const fileExtension = path.extname(fileName);
      const baseName = path.basename(fileName, fileExtension);
      const uniqueId = crypto.randomUUID();
      const uniqueFileName = `${baseName}_${uniqueId}${fileExtension}`;
      
      // Construct file path
      const folderPath = folder ? path.join(this.basePath, folder) : this.basePath;
      const filePath = path.join(folderPath, uniqueFileName);
      
      // Ensure directory exists
      await this.ensureDirectoryExists(folderPath);
      
      // Write file to disk
      await fs.writeFile(filePath, file);
      
      // Generate relative key for storage reference
      const key = folder ? `${folder}/${uniqueFileName}` : uniqueFileName;
      
      // Generate URL (assuming files are served from /uploads endpoint)
      const url = `/uploads/${key}`;
      
      return {
        url,
        key,
        size: file.length,
        mimeType,
      };
    } catch (error) {
      throw new Error(`Failed to upload file: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async deleteFile(key: string): Promise<boolean> {
    try {
      const filePath = path.join(this.basePath, key);
      await fs.unlink(filePath);
      return true;
    } catch (error) {
      // File might not exist, which is fine for delete operation
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
        return true;
      }
      throw new Error(`Failed to delete file: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async getSignedUrl(key: string, expiresIn?: number): Promise<string> {
    // For local storage, we just return the regular URL
    // In a production environment, you might want to implement
    // temporary access tokens or signed URLs
    return `/uploads/${key}`;
  }

  async fileExists(key: string): Promise<boolean> {
    try {
      const filePath = path.join(this.basePath, key);
      await fs.access(filePath);
      return true;
    } catch {
      return false;
    }
  }

  async getFileMetadata(key: string): Promise<{
    size: number;
    lastModified: Date;
    mimeType: string;
  }> {
    try {
      const filePath = path.join(this.basePath, key);
      const stats = await fs.stat(filePath);
      
      // Simple MIME type detection based on file extension
      const mimeType = this.getMimeTypeFromExtension(path.extname(key));
      
      return {
        size: stats.size,
        lastModified: stats.mtime,
        mimeType,
      };
    } catch (error) {
      throw new Error(`Failed to get file metadata: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private async ensureDirectoryExists(dirPath: string): Promise<void> {
    try {
      await fs.access(dirPath);
    } catch {
      await fs.mkdir(dirPath, { recursive: true });
    }
  }

  private getMimeTypeFromExtension(extension: string): string {
    const mimeTypes: Record<string, string> = {
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.gif': 'image/gif',
      '.pdf': 'application/pdf',
      '.doc': 'application/msword',
      '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      '.xls': 'application/vnd.ms-excel',
      '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      '.csv': 'text/csv',
      '.txt': 'text/plain',
    };
    
    return mimeTypes[extension.toLowerCase()] || 'application/octet-stream';
  }
}