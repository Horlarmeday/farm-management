export interface IStorageService {
  /**
   * Upload a file to the storage provider
   * @param file - File buffer or stream
   * @param fileName - Name of the file
   * @param mimeType - MIME type of the file
   * @param folder - Optional folder path
   * @returns Promise with file URL and metadata
   */
  uploadFile(
    file: Buffer,
    fileName: string,
    mimeType: string,
    folder?: string
  ): Promise<{
    url: string;
    key: string;
    size: number;
    mimeType: string;
  }>;

  /**
   * Delete a file from storage
   * @param key - File key/path
   * @returns Promise<boolean>
   */
  deleteFile(key: string): Promise<boolean>;

  /**
   * Get a signed URL for file access (for private files)
   * @param key - File key/path
   * @param expiresIn - Expiration time in seconds
   * @returns Promise<string>
   */
  getSignedUrl(key: string, expiresIn?: number): Promise<string>;

  /**
   * Check if a file exists
   * @param key - File key/path
   * @returns Promise<boolean>
   */
  fileExists(key: string): Promise<boolean>;

  /**
   * Get file metadata
   * @param key - File key/path
   * @returns Promise with file metadata
   */
  getFileMetadata(key: string): Promise<{
    size: number;
    lastModified: Date;
    mimeType: string;
  }>;
}