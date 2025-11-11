import { NextFunction, Request, Response } from 'express';
import { FarmRole } from '../../../shared/src/types';
import { AppDataSource } from '../config/database';
import { Farm } from '../entities/Farm';
import { FarmUser } from '../entities/FarmUser';
import { User as UserEntity } from '../entities/User';
import { ApiError } from '../utils/ApiError';

// Extend Express Request interface for farm context
declare global {
  namespace Express {
    interface Request {
      user?: UserEntity;
      farmUser?: FarmUser;
      farm?: Farm;
      farmRole?: FarmRole;
    }
  }
}

/**
 * Farm access middleware
 * Verifies user has access to the specified farm
 * Farm ID can come from:
 * - X-Farm-Id header (preferred for API clients)
 * - params.farmId (URL path parameter)
 * - body.farmId (request body)
 * - query.farmId (query parameter)
 */
export const requireFarmAccess = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    if (!req.user) {
      throw new ApiError(401, 'Authentication required');
    }

    // Extract farm ID from request (check header first, then params, body, query)
    const farmId =
      (req.headers['x-farm-id'] as string) ||
      req.params.farmId ||
      req.body.farmId ||
      req.query.farmId;

    if (!farmId) {
      throw new ApiError(400, 'Farm ID is required');
    }

    // Check if user has access to this farm
    const farmUserRepository = AppDataSource.getRepository(FarmUser);
    const farmUser = await farmUserRepository.findOne({
      where: {
        farmId: farmId as string,
        userId: req.user.id,
        isActive: true,
      },
      relations: ['farm'],
    });

    if (!farmUser) {
      throw new ApiError(403, 'Access denied to this farm');
    }

    // Attach farm context to request
    req.farmUser = farmUser;
    req.farm = farmUser.farm;
    req.farmRole = farmUser.role;

    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Farm role authorization middleware
 * Checks if user has required farm role
 */
export const requireFarmRole = (requiredRoles: FarmRole | FarmRole[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.farmUser || !req.farmRole) {
      throw new ApiError(401, 'Farm access required');
    }

    const roles = Array.isArray(requiredRoles) ? requiredRoles : [requiredRoles];

    if (!roles.includes(req.farmRole)) {
      throw new ApiError(403, 'Insufficient farm permissions');
    }

    next();
  };
};

/**
 * Farm owner authorization middleware
 * Checks if user is the owner of the farm
 */
export const requireFarmOwner = (req: Request, res: Response, next: NextFunction) => {
  if (!req.farmUser || !req.farmRole) {
    throw new ApiError(401, 'Farm access required');
  }

  if (req.farmRole !== FarmRole.OWNER) {
    throw new ApiError(403, 'Farm owner access required');
  }

  next();
};

/**
 * Farm manager or owner authorization middleware
 * Checks if user is a manager or owner of the farm
 */
export const requireFarmManagerOrOwner = (req: Request, res: Response, next: NextFunction) => {
  if (!req.farmUser || !req.farmRole) {
    throw new ApiError(401, 'Farm access required');
  }

  if (![FarmRole.OWNER, FarmRole.MANAGER].includes(req.farmRole)) {
    throw new ApiError(403, 'Farm manager or owner access required');
  }

  next();
};

/**
 * Optional farm access middleware
 * Doesn't fail if no farm access, but attaches farm context if available
 */
export const optionalFarmAccess = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    if (!req.user) {
      return next();
    }

    // Extract farm ID from request (check header first, then params, body, query)
    const farmId =
      (req.headers['x-farm-id'] as string) ||
      req.params.farmId ||
      req.body.farmId ||
      req.query.farmId;

    if (!farmId) {
      return next();
    }

    const farmUserRepository = AppDataSource.getRepository(FarmUser);
    const farmUser = await farmUserRepository.findOne({
      where: {
        farmId: farmId as string,
        userId: req.user.id,
        isActive: true,
      },
      relations: ['farm'],
    });

    if (farmUser) {
      req.farmUser = farmUser;
      req.farm = farmUser.farm;
      req.farmRole = farmUser.role;
    }

    next();
  } catch (error) {
    // Don't fail on optional farm access
    next();
  }
};

/**
 * Middleware to ensure farm is active
 */
export const requireActiveFarm = (req: Request, res: Response, next: NextFunction) => {
  if (!req.farm) {
    throw new ApiError(401, 'Farm context required');
  }

  if (!req.farm.isActive) {
    throw new ApiError(403, 'Farm is not active');
  }

  next();
};

/**
 * Combined middleware for farm access with role check
 * Combines requireFarmAccess and requireFarmRole into one
 */
export const requireFarmAccessWithRole = (requiredRoles: FarmRole | FarmRole[]) => {
  return [requireFarmAccess, requireFarmRole(requiredRoles), requireActiveFarm];
};

/**
 * Middleware to check if user can manage farm users
 * Only owners and managers can manage farm users
 */
export const requireFarmUserManagement = (req: Request, res: Response, next: NextFunction) => {
  if (!req.farmUser || !req.farmRole) {
    throw new ApiError(401, 'Farm access required');
  }

  if (![FarmRole.OWNER, FarmRole.MANAGER].includes(req.farmRole)) {
    throw new ApiError(403, 'Permission denied: Only farm owners and managers can manage users');
  }

  next();
};

/**
 * Middleware to check if user can modify farm settings
 * Only owners can modify farm settings
 */
export const requireFarmSettingsAccess = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  if (!req.farmUser || !req.farmRole) {
    throw new ApiError(401, 'Farm access required');
  }

  if (req.farmRole !== FarmRole.OWNER) {
    throw new ApiError(403, 'Permission denied: Only farm owners can modify farm settings');
  }

  next();
};
