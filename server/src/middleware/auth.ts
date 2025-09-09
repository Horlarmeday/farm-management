import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { FarmRole } from '@kuyash/shared';

interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    farmId?: string;
    farmRole?: FarmRole;
  };
}

interface JwtPayload {
  userId: string;
  email: string;
  farmId?: string;
  farmRole?: FarmRole;
}

/**
 * Middleware to authenticate JWT tokens
 */
export const authenticateToken = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  const jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret) {
    console.error('JWT_SECRET environment variable is not set');
    return res.status(500).json({ error: 'Server configuration error' });
  }

  try {
    const decoded = jwt.verify(token, jwtSecret) as JwtPayload;
    req.user = {
      id: decoded.userId,
      email: decoded.email,
      farmId: decoded.farmId,
      farmRole: decoded.farmRole
    };
    next();
  } catch (error) {
    return res.status(403).json({ error: 'Invalid or expired token' });
  }
};

/**
 * Optional authentication middleware - doesn't fail if no token provided
 */
export const optionalAuth = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return next();
  }

  const jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret) {
    return next();
  }

  try {
    const decoded = jwt.verify(token, jwtSecret) as JwtPayload;
    req.user = {
      id: decoded.userId,
      email: decoded.email,
      farmId: decoded.farmId,
      farmRole: decoded.farmRole
    };
  } catch (error) {
    // Ignore invalid tokens in optional auth
  }
  
  next();
};