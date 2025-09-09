import { Router } from 'express';
import { FarmController } from '@/controllers/FarmController';
import { authenticate } from '@/middleware/auth.middleware';

const router = Router();
const farmController = new FarmController();

// All farm routes require authentication
router.use(authenticate);

// GET /api/farms/user - Get farms for authenticated user
router.get('/user', farmController.getUserFarms);

// GET /api/farms/:id - Get farm by ID
router.get('/:id', farmController.getFarmById);

// POST /api/farms - Create new farm
router.post('/', farmController.createFarm);

// PUT /api/farms/:id - Update farm
router.put('/:id', farmController.updateFarm);

// DELETE /api/farms/:id - Delete farm
router.delete('/:id', farmController.deleteFarm);

export default router;