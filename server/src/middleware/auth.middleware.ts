import { Request, Response, NextFunction } from 'express';
import { AppDataSource } from '../config/database';
import { User as UserEntity } from '../entities/User';
import { Role } from '../entities/Role';
import { Permission } from '../entities/Permission';
import { verifyAccessToken, extractBearerToken } from '../utils/jwt';
import { ApiError } from '../utils/ApiError';
import { JwtPayload } from '@kuyash/shared';

// Extend Express Request interface
declare global {
  namespace Express {
    interface Request {
      user?: UserEntity;
      permissions?: string[];
    }
  }
}

/**
 * Authentication middleware
 * Verifies JWT token and attaches user to request
 */
export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const token = extractBearerToken(req.headers.authorization);

    if (!token) {
      throw new ApiError(401, 'Access token is required');
    }

    const { payload, expired } = verifyAccessToken(token);

    if (expired) {
      throw new ApiError(401, 'Token has expired');
    }

    // Get user from database
    const userRepository = AppDataSource.getRepository(UserEntity);
    const user = await userRepository.findOne({
      where: { id: payload.userId },
      relations: ['role', 'role.permissions'],
    });

    if (!user) {
      throw new ApiError(401, 'User not found');
    }

    if (!user.isActive) {
      throw new ApiError(401, 'User account is deactivated');
    }

    // Extract permissions
    const permissions = user.role.permissions.map((p) => p.name);

    // Attach user and permissions to request
    req.user = user;
    req.permissions = permissions;

    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Optional authentication middleware
 * Doesn't fail if no token provided, but attaches user if valid token exists
 */
export const optionalAuthenticate = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const token = extractBearerToken(req.headers.authorization);

    if (!token) {
      return next();
    }

    const { payload, expired } = verifyAccessToken(token);

    if (expired) {
      return next();
    }

    // Get user from database
    const userRepository = AppDataSource.getRepository(UserEntity);
    const user = await userRepository.findOne({
      where: { id: payload.userId },
      relations: ['role', 'role.permissions'],
    });

    if (user && user.isActive) {
      const permissions = user.role.permissions.map((p) => p.name);
      req.user = user;
      req.permissions = permissions;
    }

    next();
  } catch (error) {
    // Don't fail on optional authentication
    next();
  }
};

/**
 * Role-based authorization middleware
 * Checks if user has required role
 */
export const authorize = (requiredRoles: string | string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      throw new ApiError(401, 'Authentication required');
    }

    const userRole = req.user.role.name;
    const roles = Array.isArray(requiredRoles) ? requiredRoles : [requiredRoles];

    if (!roles.includes(userRole)) {
      throw new ApiError(403, 'Insufficient permissions');
    }

    next();
  };
};

/**
 * Permission-based authorization middleware
 * Checks if user has required permission
 */
export const requirePermission = (requiredPermission: string | string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user || !req.permissions) {
      throw new ApiError(401, 'Authentication required');
    }

    const permissions = Array.isArray(requiredPermission)
      ? requiredPermission
      : [requiredPermission];
    const hasPermission = permissions.some((permission) => req.permissions!.includes(permission));

    if (!hasPermission) {
      throw new ApiError(403, 'Insufficient permissions');
    }

    next();
  };
};

/**
 * Check if user has any of the required permissions
 */
export const requireAnyPermission = (requiredPermissions: string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user || !req.permissions) {
      throw new ApiError(401, 'Authentication required');
    }

    const hasAnyPermission = requiredPermissions.some((permission) =>
      req.permissions!.includes(permission),
    );

    if (!hasAnyPermission) {
      throw new ApiError(403, 'Insufficient permissions');
    }

    next();
  };
};

/**
 * Check if user has all required permissions
 */
export const requireAllPermissions = (requiredPermissions: string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user || !req.permissions) {
      throw new ApiError(401, 'Authentication required');
    }

    const hasAllPermissions = requiredPermissions.every((permission) =>
      req.permissions!.includes(permission),
    );

    if (!hasAllPermissions) {
      throw new ApiError(403, 'Insufficient permissions');
    }

    next();
  };
};

/**
 * Check if user owns the resource or has admin permission
 */
export const requireOwnershipOrAdmin = (resourceUserIdField: string = 'userId') => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      throw new ApiError(401, 'Authentication required');
    }

    const resourceUserId = req.params[resourceUserIdField] || req.body[resourceUserIdField];
    const isOwner = req.user.id === resourceUserId;
    const isAdmin = req.user.role.name === 'admin';

    if (!isOwner && !isAdmin) {
      throw new ApiError(403, 'Access denied');
    }

    next();
  };
};

/**
 * Middleware to check if user is active
 */
export const requireActiveUser = (req: Request, res: Response, next: NextFunction): void => {
  if (!req.user) {
    throw new ApiError(401, 'Authentication required');
  }

  if (!req.user.isActive) {
    throw new ApiError(403, 'Account is deactivated');
  }

  next();
};

/**
 * Middleware to check if user email is verified
 */
export const requireVerifiedEmail = (req: Request, res: Response, next: NextFunction): void => {
  if (!req.user) {
    throw new ApiError(401, 'Authentication required');
  }

  if (!req.user.isEmailVerified) {
    throw new ApiError(403, 'Email verification required');
  }

  next();
};
