import { NextFunction, Request, Response } from 'express';

/**
 * Cache control middleware
 * Adds appropriate Cache-Control headers based on response status and type
 */
export const cacheControl = (req: Request, res: Response, next: NextFunction): void => {
  // Store original json method
  const originalJson = res.json.bind(res);

  // Override json method to add cache headers based on response
  res.json = function (body: any) {
    // Check if response is successful
    const isSuccess = body?.success === true;
    const statusCode = res.statusCode;

    if (!isSuccess || statusCode >= 400) {
      // Never cache error responses
      res.set({
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        Pragma: 'no-cache',
        Expires: '0',
        'Surrogate-Control': 'no-store',
      });
    } else {
      // Cache successful responses based on endpoint type
      const url = req.originalUrl || req.url;

      if (url.includes('/dashboard') || url.includes('/kpis') || url.includes('/summary')) {
        // Dashboard/reporting data: short cache (2 minutes)
        res.set({
          'Cache-Control': 'private, max-age=120, must-revalidate',
        });
      } else if (url.includes('/categories') || url.includes('/reference')) {
        // Reference data: longer cache (30 minutes)
        res.set({
          'Cache-Control': 'private, max-age=1800, must-revalidate',
        });
      } else if (req.method === 'GET') {
        // Other GET requests: moderate cache (5 minutes)
        res.set({
          'Cache-Control': 'private, max-age=300, must-revalidate',
        });
      } else {
        // POST/PUT/DELETE: no cache
        res.set({
          'Cache-Control': 'no-store, no-cache, must-revalidate',
        });
      }
    }

    return originalJson(body);
  };

  next();
};

/**
 * No-cache middleware for specific routes that should never be cached
 */
export const noCache = (req: Request, res: Response, next: NextFunction): void => {
  res.set({
    'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
    Pragma: 'no-cache',
    Expires: '0',
  });
  next();
};

/**
 * Short cache middleware (2 minutes) for frequently updated data
 */
export const shortCache = (req: Request, res: Response, next: NextFunction): void => {
  res.set({
    'Cache-Control': 'private, max-age=120, must-revalidate',
  });
  next();
};

/**
 * Medium cache middleware (5 minutes) for moderately stable data
 */
export const mediumCache = (req: Request, res: Response, next: NextFunction): void => {
  res.set({
    'Cache-Control': 'private, max-age=300, must-revalidate',
  });
  next();
};

/**
 * Long cache middleware (30 minutes) for stable reference data
 */
export const longCache = (req: Request, res: Response, next: NextFunction): void => {
  res.set({
    'Cache-Control': 'private, max-age=1800, must-revalidate',
  });
  next();
};
