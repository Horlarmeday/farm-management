import { AuthController } from '@/controllers/AuthController';
import { authenticate } from '@/middleware/auth.middleware';
import { validate } from '@/middleware/joiValidation.middleware';
import { rateLimiter } from '@/middleware/rateLimiter.middleware';
import { authValidations } from '@/validations/auth.validations';
import { Router } from 'express';

const router: Router = Router();
const authController = new AuthController();

// Public routes
router.post(
  '/login',
  rateLimiter(5, 15), // 5 requests per 15 minutes
  validate(authValidations.login),
  authController.authenticateUser,
);

router.post(
  '/refresh-token',
  rateLimiter(10, 15), // 10 requests per 15 minutes
  validate(authValidations.refreshToken),
  authController.refreshAccessToken,
);

router.post(
  '/forgot-password',
  rateLimiter(3, 15), // 3 requests per 15 minutes
  validate(authValidations.forgotPassword),
  authController.initiatePasswordReset,
);

router.post(
  '/reset-password',
  rateLimiter(3, 15), // 3 requests per 15 minutes
  validate(authValidations.resetPassword),
  authController.resetPasswordWithToken,
);

router.get(
  '/verify-email/:token',
  validate(authValidations.verifyEmail),
  authController.verifyUserEmail,
);

// Protected routes
router.post('/logout', authenticate, authController.logout);

router.post(
  '/change-password',
  authenticate,
  validate(authValidations.changePassword),
  authController.changeUserPassword,
);

// Admin/HR routes - require authentication and admin/manager role
router.post(
  '/admin/create-user',
  authenticate,
  validate(authValidations.adminCreateUser),
  authController.createUser,
);

router.get('/profile', authenticate, authController.getUserProfile);

router.get('/me', authenticate, authController.getCurrentUser);

export default router;
