import multer from 'multer';
import { Request, Response, NextFunction } from 'express';
import { config } from '../config';
import path from 'path';

// Configure multer to use memory storage
const storage = multer.memoryStorage();

// File filter function
const fileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  // Get allowed file types from config
  const allowedTypes = config.upload.allowedFileTypes;
  const fileExtension = path.extname(file.originalname).toLowerCase().substring(1); // Remove the dot
  
  if (allowedTypes.includes(fileExtension)) {
    cb(null, true);
  } else {
    cb(new Error(`File type .${fileExtension} is not allowed. Allowed types: ${allowedTypes.join(', ')}`));
  }
};

// Create multer instance
const upload = multer({
  storage,
  limits: {
    fileSize: config.upload.maxFileSize, // Max file size from config
    files: 10, // Max number of files
  },
  fileFilter,
});

// Middleware for single file upload
export const uploadSingle = (fieldName: string = 'file') => {
  return (req: Request, res: Response, next: NextFunction) => {
    const singleUpload = upload.single(fieldName);
    
    singleUpload(req as any, res as any, (err: any) => {
      if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          res.status(400).json({
            success: false,
            message: `File too large. Maximum size is ${Math.round(config.upload.maxFileSize / 1024 / 1024)}MB`,
            error: 'FILE_TOO_LARGE',
          });
          return;
        }
        if (err.code === 'LIMIT_FILE_COUNT') {
          res.status(400).json({
            success: false,
            message: 'Too many files uploaded',
            error: 'TOO_MANY_FILES',
          });
          return;
        }
        res.status(400).json({
          success: false,
          message: `Upload error: ${err.message}`,
          error: 'UPLOAD_ERROR',
        });
        return;
      }
      
      if (err) {
        res.status(400).json({
          success: false,
          message: err.message,
          error: 'INVALID_FILE_TYPE',
        });
        return;
      }
      
      next();
    });
  };
};

// Middleware for multiple file upload
export const uploadMultiple = (fieldName: string = 'files', maxCount: number = 5) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const multipleUpload = upload.array(fieldName, maxCount);
    
    multipleUpload(req as any, res as any, (err: any) => {
      if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          res.status(400).json({
            success: false,
            message: `File too large. Maximum size is ${Math.round(config.upload.maxFileSize / 1024 / 1024)}MB`,
            error: 'FILE_TOO_LARGE',
          });
          return;
        }
        if (err.code === 'LIMIT_FILE_COUNT') {
          res.status(400).json({
            success: false,
            message: `Too many files. Maximum is ${maxCount} files`,
            error: 'TOO_MANY_FILES',
          });
          return;
        }
        res.status(400).json({
          success: false,
          message: `Upload error: ${err.message}`,
          error: 'UPLOAD_ERROR',
        });
        return;
      }
      
      if (err) {
        res.status(400).json({
          success: false,
          message: err.message,
          error: 'INVALID_FILE_TYPE',
        });
        return;
      }
      
      next();
    });
  };
};

// Middleware for fields with different file types
export const uploadFields = (fields: { name: string; maxCount?: number }[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const fieldsUpload = upload.fields(fields);
    
    fieldsUpload(req as any, res as any, (err: any) => {
      if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          res.status(400).json({
            success: false,
            message: `File too large. Maximum size is ${Math.round(config.upload.maxFileSize / 1024 / 1024)}MB`,
            error: 'FILE_TOO_LARGE',
          });
          return;
        }
        if (err.code === 'LIMIT_FILE_COUNT') {
          res.status(400).json({
            success: false,
            message: 'Too many files uploaded',
            error: 'TOO_MANY_FILES',
          });
          return;
        }
        res.status(400).json({
          success: false,
          message: `Upload error: ${err.message}`,
          error: 'UPLOAD_ERROR',
        });
        return;
      }
      
      if (err) {
        res.status(400).json({
          success: false,
          message: err.message,
          error: 'INVALID_FILE_TYPE',
        });
        return;
      }
      
      next();
    });
  };
};

// Helper function to validate file type
export const isValidFileType = (filename: string): boolean => {
  const allowedTypes = config.upload.allowedFileTypes;
  const fileExtension = path.extname(filename).toLowerCase().substring(1);
  return allowedTypes.includes(fileExtension);
};

// Helper function to get file size limit
export const getFileSizeLimit = (): number => {
  return config.upload.maxFileSize;
};

// Helper function to get allowed file types
export const getAllowedFileTypes = (): string[] => {
  return config.upload.allowedFileTypes;
};