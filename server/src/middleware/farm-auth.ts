import { Request, Response, NextFunction } from 'express';
import { FarmRole } from '@kuyash/shared';

interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    farmId?: string;
    farmRole?: FarmRole;
  };
}

/**
 * Middleware to require farm access with specific roles
 * @param allowedRoles - Array of roles that are allowed to access the endpoint
 */
export const requireFarmAccess = (allowedRoles: FarmRole[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const { user } = req;

    if (!user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    if (!user.farmId) {
      return res.status(400).json({ error: 'Farm selection required' });
    }

    if (!user.farmRole) {
      return res.status(403).json({ error: 'No farm role assigned' });
    }

    if (!allowedRoles.includes(user.farmRole)) {
      return res.status(403).json({ 
        error: 'Insufficient permissions',
        required: allowedRoles,
        current: user.farmRole
      });
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