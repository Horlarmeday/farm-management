import { Request, Response, NextFunction } from 'express';
import { FarmService } from '@/services/FarmService';
import { AuthenticatedRequest } from '@/middleware/auth.middleware';

export class FarmController {
  private farmService: FarmService;

  constructor() {
    this.farmService = new FarmService();
  }

  /**
   * Get farms for the authenticated user
   */
  getUserFarms = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user?.id;
      
      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'User not authenticated'
        });
        return;
      }

      const result = await this.farmService.getUserFarms(userId);
      
      if (result.success) {
        res.status(200).json(result);
      } else {
        res.status(400).json(result);
      }
    } catch (error) {
      console.error('Error in getUserFarms:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  };

  /**
   * Get farm by ID
   */
  getFarmById = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const userId = req.user?.id;
      
      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'User not authenticated'
        });
        return;
      }

      // Check if user has access to this farm
      const hasAccess = await this.farmService.checkFarmAccess(userId, id);
      if (!hasAccess) {
        res.status(403).json({
          success: false,
          message: 'Access denied to this farm'
        });
        return;
      }

      const result = await this.farmService.getFarmById(id);
      
      if (result.success) {
        res.status(200).json(result);
      } else {
        res.status(404).json(result);
      }
    } catch (error) {
      console.error('Error in getFarmById:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  };

  /**
   * Create a new farm
   */
  createFarm = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user?.id;
      
      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'User not authenticated'
        });
        return;
      }

      const farmData = req.body;
      const result = await this.farmService.createFarm(farmData, userId);
      
      if (result.success) {
        res.status(201).json(result);
      } else {
        res.status(400).json(result);
      }
    } catch (error) {
      console.error('Error in createFarm:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  };

  /**
   * Update farm
   */
  updateFarm = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const userId = req.user?.id;
      
      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'User not authenticated'
        });
        return;
      }

      // Check if user has access to this farm
      const hasAccess = await this.farmService.checkFarmAccess(userId, id);
      if (!hasAccess) {
        res.status(403).json({
          success: false,
          message: 'Access denied to this farm'
        });
        return;
      }

      const farmData = req.body;
      const result = await this.farmService.updateFarm(id, farmData);
      
      if (result.success) {
        res.status(200).json(result);
      } else {
        res.status(400).json(result);
      }
    } catch (error) {
      console.error('Error in updateFarm:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  };

  /**
   * Delete farm
   */
  deleteFarm = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const userId = req.user?.id;
      
      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'User not authenticated'
        });
        return;
      }

      // Check if user has owner role for this farm
      const userRole = await this.farmService.getUserFarmRole(userId, id);
      if (userRole !== 'owner') {
        res.status(403).json({
          success: false,
          message: 'Only farm owners can delete farms'
        });
        return;
      }

      const result = await this.farmService.deleteFarm(id);
      
      if (result.success) {
        res.status(200).json(result);
      } else {
        res.status(400).json(result);
      }
    } catch (error) {
      console.error('Error in deleteFarm:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  };
}