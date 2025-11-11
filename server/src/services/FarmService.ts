import { AppDataSource } from '@/config/database';
import { Farm } from '@/entities/Farm';
import { FarmInvitation } from '@/entities/FarmInvitation';
import { FarmUser } from '@/entities/FarmUser';
import { User } from '@/entities/User';
import { Repository } from 'typeorm';
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
        relations: ['farm'],
      });

      return {
        success: true,
        data: farmUsers,
        message: 'User farms retrieved successfully',
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      console.error('Error getting user farms:', error);
      return {
        success: false,
        message: 'Failed to retrieve user farms',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
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
        relations: ['farmUsers', 'farmUsers.user'],
      });

      if (!farm) {
        return {
          success: false,
          message: 'Farm not found',
          timestamp: new Date().toISOString(),
        };
      }

      return {
        success: true,
        data: farm,
        message: 'Farm retrieved successfully',
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      console.error('Error getting farm by ID:', error);
      return {
        success: false,
        message: 'Failed to retrieve farm',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
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
        ownerId,
      });
      const savedFarm = await this.farmRepository.save(farm);

      // Add the creator as the owner
      const farmUser = this.farmUserRepository.create({
        farmId: savedFarm.id,
        userId: ownerId,
        role: FarmRole.OWNER,
        isActive: true,
      });
      await this.farmUserRepository.save(farmUser);

      return {
        success: true,
        data: savedFarm,
        message: 'Farm created successfully',
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      console.error('Error creating farm:', error);
      return {
        success: false,
        message: 'Failed to create farm',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
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
          timestamp: new Date().toISOString(),
        };
      }

      Object.assign(farm, farmData);
      const updatedFarm = await this.farmRepository.save(farm);

      return {
        success: true,
        data: updatedFarm,
        message: 'Farm updated successfully',
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      console.error('Error updating farm:', error);
      return {
        success: false,
        message: 'Failed to update farm',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
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
          timestamp: new Date().toISOString(),
        };
      }

      await this.farmRepository.remove(farm);

      return {
        success: true,
        message: 'Farm deleted successfully',
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      console.error('Error deleting farm:', error);
      return {
        success: false,
        message: 'Failed to delete farm',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      };
    }
  }

  /**
   * Check if user has access to farm
   */
  async checkFarmAccess(userId: string, farmId: string): Promise<boolean> {
    try {
      const farmUser = await this.farmUserRepository.findOne({
        where: { userId, farmId, isActive: true },
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
        where: { userId, farmId, isActive: true },
      });
      return farmUser?.role || null;
    } catch (error) {
      console.error('Error getting user farm role:', error);
      return null;
    }
  }

  /**
   * Get all users in a farm
   */
  async getFarmUsers(farmId: string): Promise<ApiResponse<FarmUser[]>> {
    try {
      const farmUsers = await this.farmUserRepository.find({
        where: { farmId, isActive: true },
        relations: ['user'],
        order: { role: 'ASC', createdAt: 'ASC' },
      });

      return {
        success: true,
        data: farmUsers,
        message: 'Farm users retrieved successfully',
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      console.error('Error getting farm users:', error);
      return {
        success: false,
        message: 'Failed to retrieve farm users',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      };
    }
  }

  /**
   * Update farm user role
   */
  async updateFarmUserRole(
    farmId: string,
    userId: string,
    role: FarmRole,
  ): Promise<ApiResponse<FarmUser>> {
    try {
      const farmUser = await this.farmUserRepository.findOne({
        where: { farmId, userId, isActive: true },
        relations: ['user'],
      });

      if (!farmUser) {
        return {
          success: false,
          message: 'User not found in farm',
          timestamp: new Date().toISOString(),
        };
      }

      // Prevent changing the owner's role if they are the only owner
      if (farmUser.role === FarmRole.OWNER && role !== FarmRole.OWNER) {
        const ownerCount = await this.farmUserRepository.count({
          where: { farmId, role: FarmRole.OWNER, isActive: true },
        });

        if (ownerCount <= 1) {
          return {
            success: false,
            message: 'Cannot change the role of the only farm owner',
            timestamp: new Date().toISOString(),
          };
        }
      }

      farmUser.role = role;
      const updatedFarmUser = await this.farmUserRepository.save(farmUser);

      return {
        success: true,
        data: updatedFarmUser,
        message: 'User role updated successfully',
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      console.error('Error updating farm user role:', error);
      return {
        success: false,
        message: 'Failed to update user role',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      };
    }
  }

  /**
   * Remove user from farm
   */
  async removeUserFromFarm(farmId: string, userId: string): Promise<ApiResponse<void>> {
    try {
      const farmUser = await this.farmUserRepository.findOne({
        where: { farmId, userId, isActive: true },
      });

      if (!farmUser) {
        return {
          success: false,
          message: 'User not found in farm',
          timestamp: new Date().toISOString(),
        };
      }

      // Prevent removing the only owner
      if (farmUser.role === FarmRole.OWNER) {
        const ownerCount = await this.farmUserRepository.count({
          where: { farmId, role: FarmRole.OWNER, isActive: true },
        });

        if (ownerCount <= 1) {
          return {
            success: false,
            message: 'Cannot remove the only farm owner',
            timestamp: new Date().toISOString(),
          };
        }
      }

      // Soft delete by setting isActive to false
      farmUser.isActive = false;
      await this.farmUserRepository.save(farmUser);

      return {
        success: true,
        message: 'User removed from farm successfully',
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      console.error('Error removing user from farm:', error);
      return {
        success: false,
        message: 'Failed to remove user from farm',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      };
    }
  }
}
