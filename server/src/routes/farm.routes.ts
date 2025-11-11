import { FarmController } from '@/controllers/FarmController';
import { authenticate } from '@/middleware/auth.middleware';
import { Router } from 'express';

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

// Farm User Management Routes

// GET /api/farms/:farmId/users - Get all users in a farm
router.get('/:farmId/users', farmController.getFarmUsers);

// PUT /api/farms/:farmId/users/:userId - Update farm user role
router.put('/:farmId/users/:userId', farmController.updateFarmUserRole);

// DELETE /api/farms/:farmId/users/:userId - Remove user from farm
router.delete('/:farmId/users/:userId', farmController.removeUserFromFarm);

export default router;
