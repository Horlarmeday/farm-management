import jwt from 'jsonwebtoken';
import { config } from '@/config';
import { User } from '@/entities/User';
import { JwtPayload } from '@kuyash/shared';

export interface TokenResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface JwtVerifyResult {
  payload: JwtPayload;
  expired: boolean;
}

/**
 * Generate JWT access token
 */
export const generateAccessToken = (payload: JwtPayload): string => {
  return jwt.sign(payload, config.jwt.accessTokenSecret, {
    expiresIn: config.jwt.accessTokenExpiry,
    issuer: config.jwt.issuer,
    audience: config.jwt.audience,
  });
};

/**
 * Generate JWT refresh token
 */
export const generateRefreshToken = (payload: JwtPayload): string => {
  return jwt.sign(payload, config.jwt.refreshTokenSecret, {
    expiresIn: config.jwt.refreshTokenExpiry,
    issuer: config.jwt.issuer,
    audience: config.jwt.audience,
  });
};

/**
 * Generate both access and refresh tokens
 */
export const generateTokens = (user: User): TokenResponse => {
  const payload: JwtPayload = {
    userId: user.id,
    email: user.email,
    roleId: user.roleId,
    permissions: [], // Will be populated when needed
  };

  const accessToken = generateAccessToken(payload);
  const refreshToken = generateRefreshToken(payload);

  // Calculate expiry time in seconds
  const expiresIn = config.jwt.accessTokenExpiry.includes('h')
    ? parseInt(config.jwt.accessTokenExpiry) * 3600
    : parseInt(config.jwt.accessTokenExpiry) * 60;

  return {
    accessToken,
    refreshToken,
    expiresIn,
  };
};

/**
 * Verify JWT token
 */
export const verifyToken = (token: string, secret: string): JwtVerifyResult => {
  try {
    const decoded = jwt.verify(token, secret) as JwtPayload;
    return {
      payload: decoded,
      expired: false,
    };
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      return {
        payload: jwt.decode(token) as JwtPayload,
        expired: true,
      };
    }
    throw error;
  }
};

/**
 * Verify access token
 */
export const verifyAccessToken = (token: string): JwtVerifyResult => {
  return verifyToken(token, config.jwt.accessTokenSecret);
};

/**
 * Verify refresh token
 */
export const verifyRefreshToken = (token: string): JwtVerifyResult => {
  return verifyToken(token, config.jwt.refreshTokenSecret);
};

/**
 * Decode JWT token without verification
 */
export const decodeToken = (token: string): JwtPayload | null => {
  try {
    return jwt.decode(token) as JwtPayload;
  } catch (error) {
    return null;
  }
};

/**
 * Extract token from Authorization header
 */
export const extractBearerToken = (authorization?: string): string | null => {
  if (!authorization) return null;

  const parts = authorization.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') return null;

  return parts[1];
};

/**
 * Check if token is expired
 */
export const isTokenExpired = (token: string): boolean => {
  try {
    const decoded = jwt.decode(token) as JwtPayload;
    if (!decoded || !decoded.exp) return true;

    const currentTime = Math.floor(Date.now() / 1000);
    return decoded.exp < currentTime;
  } catch (error) {
    return true;
  }
};

/**
 * Get token expiration time
 */
export const getTokenExpiration = (token: string): Date | null => {
  try {
    const decoded = jwt.decode(token) as JwtPayload;
    if (!decoded || !decoded.exp) return null;

    return new Date(decoded.exp * 1000);
  } catch (error) {
    return null;
  }
};

/**
 * Refresh access token using refresh token
 */
export const refreshAccessToken = async (refreshToken: string): Promise<TokenResponse> => {
  const { payload, expired } = verifyRefreshToken(refreshToken);

  if (expired) {
    throw new Error('Refresh token has expired');
  }

  // Generate new tokens
  const newAccessToken = generateAccessToken(payload);
  const newRefreshToken = generateRefreshToken(payload);

  // Calculate expiry time in seconds
  const expiresIn = config.jwt.accessTokenExpiry.includes('h')
    ? parseInt(config.jwt.accessTokenExpiry) * 3600
    : parseInt(config.jwt.accessTokenExpiry) * 60;

  return {
    accessToken: newAccessToken,
    refreshToken: newRefreshToken,
    expiresIn,
  };
};
