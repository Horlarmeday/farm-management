import { Request, Response, NextFunction } from 'express';
import * as jwt from 'jsonwebtoken';
import { FarmRole } from '@kuyash/shared';

interface JwtPayload {
  userId: string;
  email: string;
  farmId?: string;
  farmRole?: FarmRole;
}

/**
 * Middleware to authenticate JWT tokens
 */
export const authenticateToken = (req: Request, res: Response, next: NextFunction): void => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    res.status(401).json({ error: 'Access token required' });
    return;
  }

  const jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret) {
    console.error('JWT_SECRET environment variable is not set');
    res.status(500).json({ error: 'Server configuration error' });
    return;
  }

  try {
    const decoded = jwt.verify(token, jwtSecret) as JwtPayload;
    // Note: This is a simplified auth for farm-specific features
    // The main auth.middleware.ts handles full user authentication
    (req as any).farmUser = {
      id: decoded.userId,
      email: decoded.email,
      farmId: decoded.farmId,
      farmRole: decoded.farmRole
    };
    console.log('🔐 Auth middleware - decoded user:', (req as any).farmUser);
    next();
  } catch (error) {
    res.status(403).json({ error: 'Invalid or expired token' });
    return;
  }
}

/**
 * Optional authentication middleware - doesn't fail if no token provided
 */
export const optionalAuth = (req: Request, res: Response, next: NextFunction) => {
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
    (req as any).farmUser = {
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