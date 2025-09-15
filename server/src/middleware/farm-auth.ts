import { Request, Response, NextFunction } from 'express';
import { FarmRole } from '../../../shared/src/types';

/**
 * Middleware to require farm access with specific roles
 * @param allowedRoles - Array of roles that are allowed to access the endpoint
 */
export const requireFarmAccess = (allowedRoles: FarmRole[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const farmUser = (req as any).farmUser;

    if (!farmUser) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    if (!farmUser.farmId) {
      res.status(400).json({ error: 'Farm selection required' });
      return;
    }

    if (!farmUser.farmRole) {
      res.status(403).json({ error: 'No farm role assigned' });
      return;
    }

    if (!allowedRoles.includes(farmUser.farmRole)) {
      res.status(403).json({ 
        error: 'Insufficient permissions',
        required: allowedRoles,
        current: farmUser.farmRole
      });
      return;
    }

    next();
  };
};

/**
 * Middleware to require farm ownership
 */
export const requireFarmOwner = requireFarmAccess([FarmRole.OWNER]);

/**
 * Middleware to require farm management permissions (owner or manager)
 */
export const requireFarmManager = requireFarmAccess([FarmRole.OWNER, FarmRole.MANAGER]);