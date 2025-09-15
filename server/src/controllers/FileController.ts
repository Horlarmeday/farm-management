import { Request, Response } from 'express';
import { StorageFactory } from '../services/storage/StorageFactory';
import { ApiResponse } from '../../../shared/src/types';
import path from 'path';

export class FileController {
  private storageService = StorageFactory.getInstance();

  /**
   * Upload a single file
   */
  uploadSingle = async (req: Request, res: Response): Promise<void> => {
    try {
      if (!req.file) {
        res.status(400).json({
          success: false,
          message: 'No file uploaded',
          error: 'NO_FILE',
        } as ApiResponse<null>);
        return;
      }

      const { buffer, originalname, mimetype } = req.file;
      const { folder } = req.body;

      // Upload file using storage service
      const result = await this.storageService.uploadFile(
        buffer,
        originalname,
        mimetype,
        folder
      );

      res.status(200).json({
        success: true,
        message: 'File uploaded successfully',
        data: {
          file: {
            url: result.url,
            key: result.key,
            originalName: originalname,
            size: result.size,
            mimeType: result.mimeType,
            uploadedAt: new Date().toISOString(),
          },
        },
      } as ApiResponse<any>);
    } catch (error) {
      console.error('File upload error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to upload file',
        error: error instanceof Error ? error.message : 'Unknown error',
      } as ApiResponse<null>);
    }
  };

  /**
   * Upload multiple files
   */
  uploadMultiple = async (req: Request, res: Response): Promise<void> => {
    try {
      if (!req.files || !Array.isArray(req.files) || req.files.length === 0) {
        res.status(400).json({
          success: false,
          message: 'No files uploaded',
          error: 'NO_FILES',
        } as ApiResponse<null>);
        return;
      }

      const { folder } = req.body;
      const uploadPromises = req.files.map(async (file) => {
        const result = await this.storageService.uploadFile(
          file.buffer,
          file.originalname,
          file.mimetype,
          folder
        );

        return {
          url: result.url,
          key: result.key,
          originalName: file.originalname,
          size: result.size,
          mimeType: result.mimeType,
          uploadedAt: new Date().toISOString(),
        };
      });

      const uploadedFiles = await Promise.all(uploadPromises);

      res.status(200).json({
        success: true,
        message: `${uploadedFiles.length} files uploaded successfully`,
        data: {
          files: uploadedFiles,
        },
      } as ApiResponse<any>);
    } catch (error) {
      console.error('Multiple file upload error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to upload files',
        error: error instanceof Error ? error.message : 'Unknown error',
      } as ApiResponse<null>);
    }
  };

  /**
   * Delete a file
   */
  deleteFile = async (req: Request, res: Response): Promise<void> => {
    try {
      const { key } = req.params;

      if (!key) {
        res.status(400).json({
          success: false,
          message: 'File key is required',
          error: 'MISSING_KEY',
        } as ApiResponse<null>);
        return;
      }

      const deleted = await this.storageService.deleteFile(key);

      if (deleted) {
        res.status(200).json({
          success: true,
          message: 'File deleted successfully',
          data: { key },
        } as ApiResponse<any>);
      } else {
        res.status(404).json({
          success: false,
          message: 'File not found',
          error: 'FILE_NOT_FOUND',
        } as ApiResponse<null>);
      }
    } catch (error) {
      console.error('File deletion error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete file',
        error: error instanceof Error ? error.message : 'Unknown error',
      } as ApiResponse<null>);
    }
  };

  /**
   * Get file metadata
   */
  getFileMetadata = async (req: Request, res: Response): Promise<void> => {
    try {
      const { key } = req.params;

      if (!key) {
        res.status(400).json({
          success: false,
          message: 'File key is required',
          error: 'MISSING_KEY',
        } as ApiResponse<null>);
        return;
      }

      const exists = await this.storageService.fileExists(key);
      if (!exists) {
        res.status(404).json({
          success: false,
          message: 'File not found',
          error: 'FILE_NOT_FOUND',
        } as ApiResponse<null>);
        return;
      }

      const metadata = await this.storageService.getFileMetadata(key);

      res.status(200).json({
        success: true,
        message: 'File metadata retrieved successfully',
        data: {
          key,
          ...metadata,
        },
      } as ApiResponse<any>);
    } catch (error) {
      console.error('Get file metadata error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get file metadata',
        error: error instanceof Error ? error.message : 'Unknown error',
      } as ApiResponse<null>);
    }
  };

  /**
   * Get signed URL for file access
   */
  getSignedUrl = async (req: Request, res: Response): Promise<void> => {
    try {
      const { key } = req.params;
      const { expiresIn } = req.query;

      if (!key) {
        res.status(400).json({
          success: false,
          message: 'File key is required',
          error: 'MISSING_KEY',
        } as ApiResponse<null>);
        return;
      }

      const exists = await this.storageService.fileExists(key);
      if (!exists) {
        res.status(404).json({
          success: false,
          message: 'File not found',
          error: 'FILE_NOT_FOUND',
        } as ApiResponse<null>);
        return;
      }

      const expiry = expiresIn ? parseInt(expiresIn as string, 10) : undefined;
      const signedUrl = await this.storageService.getSignedUrl(key, expiry);

      res.status(200).json({
        success: true,
        message: 'Signed URL generated successfully',
        data: {
          key,
          signedUrl,
          expiresIn: expiry || 3600,
        },
      } as ApiResponse<any>);
    } catch (error) {
      console.error('Get signed URL error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to generate signed URL',
        error: error instanceof Error ? error.message : 'Unknown error',
      } as ApiResponse<null>);
    }
  };

  /**
   * Get storage configuration info
   */
  getStorageInfo = async (req: Request, res: Response): Promise<void> => {
    try {
      const configInfo = StorageFactory.getConfigurationInfo();

      res.status(200).json({
        success: true,
        message: 'Storage configuration retrieved successfully',
        data: configInfo,
      } as ApiResponse<any>);
    } catch (error) {
      console.error('Get storage info error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get storage configuration',
        error: error instanceof Error ? error.message : 'Unknown error',
      } as ApiResponse<null>);
    }
  };
}