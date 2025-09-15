import { Repository } from 'typeorm';
import { AppDataSource } from '@/config/database';
import { Farm } from '@/entities/Farm';
import { FarmUser } from '@/entities/FarmUser';
import { FarmInvitation } from '@/entities/FarmInvitation';
import { User } from '@/entities/User';
import { ApiResponse, FarmRole } from '../../../shared/src/types';

export class FarmService {
  private farmRepository: Repository<Farm>;
  private farmUserRepository: Repository<FarmUser>;
  private farmInvitationRepository: Repository<FarmInvitation>;
  private userRepository: Repository<User>;

  constructor() {
    this.farmRepository = AppDataSource.getRepository(Farm);
    this.farmUserRepository = AppDataSource.getRepository(FarmUser);
    this.farmInvitationRepository = AppDataSource.getRepository(FarmInvitation);
    this.userRepository = AppDataSource.getRepository(User);
  }

  /**
   * Get farms associated with a user
   */
  async getUserFarms(userId: string): Promise<ApiResponse<FarmUser[]>> {
    try {
      const farmUsers = await this.farmUserRepository.find({
        where: { userId, isActive: true },
        relations: ['farm']
      });

      return {
        success: true,
        data: farmUsers,
        message: 'User farms retrieved successfully',
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error getting user farms:', error);
      return {
        success: false,
        message: 'Failed to retrieve user farms',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Get farm by ID
   */
  async getFarmById(farmId: string): Promise<ApiResponse<Farm>> {
    try {
      const farm = await this.farmRepository.findOne({
        where: { id: farmId },
        relations: ['farmUsers', 'farmUsers.user']
      });

      if (!farm) {
        return {
          success: false,
          message: 'Farm not found',
          timestamp: new Date().toISOString()
        };
      }

      return {
        success: true,
        data: farm,
        message: 'Farm retrieved successfully',
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error getting farm by ID:', error);
      return {
        success: false,
        message: 'Failed to retrieve farm',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Create a new farm
   */
  async createFarm(farmData: Partial<Farm>, ownerId: string): Promise<ApiResponse<Farm>> {
    try {
      // Create the farm with ownerId
      const farm = this.farmRepository.create({
        ...farmData,
        ownerId
      });
      const savedFarm = await this.farmRepository.save(farm);

      // Add the creator as the owner
        const farmUser = this.farmUserRepository.create({
          farmId: savedFarm.id,
          userId: ownerId,
          role: FarmRole.OWNER,
          isActive: true
        });
      await this.farmUserRepository.save(farmUser);

      return {
        success: true,
        data: savedFarm,
        message: 'Farm created successfully',
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error creating farm:', error);
      return {
        success: false,
        message: 'Failed to create farm',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Update farm
   */
  async updateFarm(farmId: string, farmData: Partial<Farm>): Promise<ApiResponse<Farm>> {
    try {
      const farm = await this.farmRepository.findOne({ where: { id: farmId } });
      
      if (!farm) {
        return {
          success: false,
          message: 'Farm not found',
          timestamp: new Date().toISOString()
        };
      }

      Object.assign(farm, farmData);
      const updatedFarm = await this.farmRepository.save(farm);

      return {
        success: true,
        data: updatedFarm,
        message: 'Farm updated successfully',
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error updating farm:', error);
      return {
        success: false,
        message: 'Failed to update farm',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Delete farm
   */
  async deleteFarm(farmId: string): Promise<ApiResponse<void>> {
    try {
      const farm = await this.farmRepository.findOne({ where: { id: farmId } });
      
      if (!farm) {
        return {
          success: false,
          message: 'Farm not found',
          timestamp: new Date().toISOString()
        };
      }

      await this.farmRepository.remove(farm);

      return {
        success: true,
        message: 'Farm deleted successfully',
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error deleting farm:', error);
      return {
        success: false,
        message: 'Failed to delete farm',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Check if user has access to farm
   */
  async checkFarmAccess(userId: string, farmId: string): Promise<boolean> {
    try {
      const farmUser = await this.farmUserRepository.findOne({
        where: { userId, farmId, isActive: true }
      });
      return !!farmUser;
    } catch (error) {
      console.error('Error checking farm access:', error);
      return false;
    }
  }

  /**
   * Get user role in farm
   */
  async getUserFarmRole(userId: string, farmId: string): Promise<string | null> {
    try {
      const farmUser = await this.farmUserRepository.findOne({
        where: { userId, farmId, isActive: true }
      });
      return farmUser?.role || null;
    } catch (error) {
      console.error('Error getting user farm role:', error);
      return null;
    }
  }
}