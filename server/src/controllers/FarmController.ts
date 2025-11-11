import { NextFunction, Request, Response } from 'express';
import { FarmService } from '../services/FarmService';
import { ResponseHelper } from '../utils/response.helper';

export class FarmController {
  private farmService: FarmService;

  constructor() {
    this.farmService = new FarmService();
  }

  /**
   * Get farms for the authenticated user
   */
  getUserFarms = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = (req as any).user?.id;

      if (!userId) {
        ResponseHelper.error(res, 'User not authenticated', 401);
        return;
      }

      const result = await this.farmService.getUserFarms(userId);

      if (result.success && result.data) {
        ResponseHelper.success(res, result.data, result.message);
      } else {
        ResponseHelper.error(res, result.message || 'Failed to retrieve farms', 400, result.error);
      }
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get farm by ID
   */
  getFarmById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const userId = (req as any).user?.id;

      if (!userId) {
        ResponseHelper.error(res, 'User not authenticated', 401);
        return;
      }

      // Check if user has access to this farm
      const hasAccess = await this.farmService.checkFarmAccess(userId, id);
      if (!hasAccess) {
        ResponseHelper.error(res, 'Access denied to this farm', 403);
        return;
      }

      const result = await this.farmService.getFarmById(id);

      if (result.success && result.data) {
        ResponseHelper.success(res, result.data, result.message);
      } else {
        ResponseHelper.error(res, result.message || 'Farm not found', 404, result.error);
      }
    } catch (error) {
      next(error);
    }
  };

  /**
   * Create a new farm
   */
  createFarm = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = (req as any).user?.id;

      if (!userId) {
        ResponseHelper.error(res, 'User not authenticated', 401);
        return;
      }

      const farmData = req.body;
      const result = await this.farmService.createFarm(farmData, userId);

      if (result.success && result.data) {
        ResponseHelper.created(res, result.data, result.message);
      } else {
        ResponseHelper.error(res, result.message || 'Failed to create farm', 400, result.error);
      }
    } catch (error) {
      next(error);
    }
  };

  /**
   * Update farm
   */
  updateFarm = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const userId = (req as any).user?.id;

      if (!userId) {
        ResponseHelper.error(res, 'User not authenticated', 401);
        return;
      }

      // Check if user has access to this farm
      const hasAccess = await this.farmService.checkFarmAccess(userId, id);
      if (!hasAccess) {
        ResponseHelper.error(res, 'Access denied to this farm', 403);
        return;
      }

      const farmData = req.body;
      const result = await this.farmService.updateFarm(id, farmData);

      if (result.success && result.data) {
        ResponseHelper.success(res, result.data, result.message);
      } else {
        ResponseHelper.error(res, result.message || 'Failed to update farm', 400, result.error);
      }
    } catch (error) {
      next(error);
    }
  };

  /**
   * Delete farm
   */
  deleteFarm = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const userId = (req as any).user?.id;

      if (!userId) {
        ResponseHelper.error(res, 'User not authenticated', 401);
        return;
      }

      // Check if user has owner role for this farm
      const userRole = await this.farmService.getUserFarmRole(userId, id);
      if (userRole !== 'owner') {
        ResponseHelper.error(res, 'Only farm owners can delete farms', 403);
        return;
      }

      const result = await this.farmService.deleteFarm(id);

      if (result.success) {
        ResponseHelper.success(res, undefined, result.message);
      } else {
        ResponseHelper.error(res, result.message || 'Failed to delete farm', 400, result.error);
      }
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get farm users
   */
  getFarmUsers = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { farmId } = req.params;
      const userId = (req as any).user?.id;

      if (!userId) {
        ResponseHelper.error(res, 'User not authenticated', 401);
        return;
      }

      // Check if user has access to this farm
      const hasAccess = await this.farmService.checkFarmAccess(userId, farmId);
      if (!hasAccess) {
        ResponseHelper.error(res, 'Access denied to this farm', 403);
        return;
      }

      const result = await this.farmService.getFarmUsers(farmId);

      if (result.success && result.data) {
        ResponseHelper.success(res, result.data, result.message);
      } else {
        ResponseHelper.error(
          res,
          result.message || 'Failed to retrieve farm users',
          400,
          result.error,
        );
      }
    } catch (error) {
      next(error);
    }
  };

  /**
   * Update farm user role
   */
  updateFarmUserRole = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { farmId, userId: targetUserId } = req.params;
      const { role } = req.body;
      const userId = (req as any).user?.id;

      if (!userId) {
        ResponseHelper.error(res, 'User not authenticated', 401);
        return;
      }

      // Check if user has owner or manager role for this farm
      const userRole = await this.farmService.getUserFarmRole(userId, farmId);
      if (userRole !== 'owner' && userRole !== 'manager') {
        ResponseHelper.error(res, 'Only farm owners and managers can update user roles', 403);
        return;
      }

      const result = await this.farmService.updateFarmUserRole(farmId, targetUserId, role);

      if (result.success && result.data) {
        ResponseHelper.success(res, result.data, result.message);
      } else {
        ResponseHelper.error(
          res,
          result.message || 'Failed to update user role',
          400,
          result.error,
        );
      }
    } catch (error) {
      next(error);
    }
  };

  /**
   * Remove user from farm
   */
  removeUserFromFarm = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { farmId, userId: targetUserId } = req.params;
      const userId = (req as any).user?.id;

      if (!userId) {
        ResponseHelper.error(res, 'User not authenticated', 401);
        return;
      }

      // Check if user has owner or manager role for this farm
      const userRole = await this.farmService.getUserFarmRole(userId, farmId);
      if (userRole !== 'owner' && userRole !== 'manager') {
        ResponseHelper.error(res, 'Only farm owners and managers can remove users', 403);
        return;
      }

      const result = await this.farmService.removeUserFromFarm(farmId, targetUserId);

      if (result.success) {
        ResponseHelper.success(res, undefined, result.message);
      } else {
        ResponseHelper.error(
          res,
          result.message || 'Failed to remove user from farm',
          400,
          result.error,
        );
      }
    } catch (error) {
      next(error);
    }
  };
}
