import { Request, Response, NextFunction } from 'express';
import rateLimit from 'express-rate-limit';
import { ApiResponse } from '@kuyash/shared';

/**
 * Rate limiter middleware factory
 * Creates a rate limiter with specified requests per window
 */
export const rateLimiter = (maxRequests: number, windowMinutes: number) => {
  return rateLimit({
    windowMs: windowMinutes * 60 * 1000, // Convert minutes to milliseconds
    max: maxRequests,
    message: {
      success: false,
      message: `Too many requests. Maximum ${maxRequests} requests per ${windowMinutes} minutes allowed.`,
      error: 'Rate limit exceeded',
    } as ApiResponse<null>,
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
    handler: (req: Request, res: Response) => {
      res.status(429).json({
        success: false,
        message: `Too many requests. Maximum ${maxRequests} requests per ${windowMinutes} minutes allowed.`,
        error: 'Rate limit exceeded',
      } as ApiResponse<null>);
    },
  });
};

/**
 * Strict rate limiter for sensitive endpoints
 */
export const strictRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 3, // 3 requests per window
  message: {
    success: false,
    message: 'Too many requests from this IP. Please try again later.',
    error: 'Rate limit exceeded',
  } as ApiResponse<null>,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req: Request, res: Response) => {
    res.status(429).json({
      success: false,
      message: 'Too many requests from this IP. Please try again later.',
      error: 'Rate limit exceeded',
    } as ApiResponse<null>);
  },
});

/**
 * General API rate limiter
 */
export const generalRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per window
  message: {
    success: false,
    message: 'Too many requests from this IP. Please try again later.',
    error: 'Rate limit exceeded',
  } as ApiResponse<null>,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req: Request, res: Response) => {
    res.status(429).json({
      success: false,
      message: 'Too many requests from this IP. Please try again later.',
      error: 'Rate limit exceeded',
    } as ApiResponse<null>);
  },
});

/**
 * Authentication rate limiter
 */
export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 requests per window
  message: {
    success: false,
    message: 'Too many authentication attempts. Please try again later.',
    error: 'Rate limit exceeded',
  } as ApiResponse<null>,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req: Request, res: Response) => {
    res.status(429).json({
      success: false,
      message: 'Too many authentication attempts. Please try again later.',
      error: 'Rate limit exceeded',
    } as ApiResponse<null>);
  },
});

/**
 * Password reset rate limiter
 */
export const passwordResetRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 3, // 3 requests per window
  message: {
    success: false,
    message: 'Too many password reset attempts. Please try again later.',
    error: 'Rate limit exceeded',
  } as ApiResponse<null>,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req: Request, res: Response) => {
    res.status(429).json({
      success: false,
      message: 'Too many password reset attempts. Please try again later.',
      error: 'Rate limit exceeded',
    } as ApiResponse<null>);
  },
});
