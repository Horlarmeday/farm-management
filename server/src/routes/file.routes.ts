import { Router } from 'express';
import { FarmRole } from '../../../shared/src/types';
import { FileController } from '../controllers/FileController';
import { authenticate } from '../middleware/auth.middleware';
import { requireFarmAccessWithRole } from '../middleware/farm-auth.middleware';
import { uploadMultiple, uploadSingle } from '../middleware/upload.middleware';

const router = Router();
const fileController = new FileController();

// Apply authentication to all file routes
router.use(authenticate);

/**
 * @route POST /api/files/upload/single
 * @desc Upload a single file
 * @access Private (requires authentication)
 */
router.post('/upload/single', uploadSingle(), fileController.uploadSingle);

/**
 * @route POST /api/files/upload/multiple
 * @desc Upload multiple files
 * @access Private (requires authentication)
 */
router.post('/upload/multiple', uploadMultiple(), fileController.uploadMultiple);

/**
 * @route DELETE /api/files/:key
 * @desc Delete a file by key
 * @access Private (requires authentication)
 */
router.delete('/:key', fileController.deleteFile);

/**
 * @route GET /api/files/:key/metadata
 * @desc Get file metadata
 * @access Private (requires authentication)
 */
router.get('/:key/metadata', fileController.getFileMetadata);

/**
 * @route GET /api/files/:key/signed-url
 * @desc Get signed URL for file access
 * @access Private (requires authentication)
 * @query expiresIn - Expiration time in seconds (optional, default: 3600)
 */
router.get('/:key/signed-url', fileController.getSignedUrl);

/**
 * @route GET /api/files/storage/info
 * @desc Get storage configuration info
 * @access Private (requires authentication)
 */
router.get('/storage/info', fileController.getStorageInfo);

/**
 * Farm-specific file routes (requires farm access)
 */

/**
 * @route POST /api/files/farm/:farmId/upload/single
 * @desc Upload a single file to a specific farm
 * @access Private (requires farm access)
 */
router.post(
  '/farm/:farmId/upload/single',
  requireFarmAccessWithRole([FarmRole.OWNER, FarmRole.MANAGER, FarmRole.WORKER]),
  uploadSingle(),
  fileController.uploadSingle,
);

/**
 * @route POST /api/files/farm/:farmId/upload/multiple
 * @desc Upload multiple files to a specific farm
 * @access Private (requires farm access)
 */
router.post(
  '/farm/:farmId/upload/multiple',
  requireFarmAccessWithRole([FarmRole.OWNER, FarmRole.MANAGER, FarmRole.WORKER]),
  uploadMultiple(),
  fileController.uploadMultiple,
);

export default router;
