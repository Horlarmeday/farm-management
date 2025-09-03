import { AuthService } from '@/services/AuthService';
import {
  AdminCreateUserRequest,
  ApiResponse,
  ChangePasswordRequest,
  ForgotPasswordRequest,
  LoginRequest,
  ResetPasswordRequest,
} from '@kuyash/shared';
import { NextFunction, Request, Response } from 'express';
import { ServiceFactory } from '../services/ServiceFactory';

export class AuthController {
  private authService: AuthService;

  constructor() {
    const serviceFactory = ServiceFactory.getInstance();
    this.authService = serviceFactory.getAuthService();
  }

  // ============================================================================
  // USER MANAGEMENT
  // ============================================================================

  /**
   * Creates a new user with complete information (Admin/HR only)
   */
  createUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userData = req.body as AdminCreateUserRequest;
      const user = await this.authService.createUser(userData);

      res.status(201).json({
        success: true,
        message: 'User created successfully',
        data: user,
      } as ApiResponse<typeof user>);
    } catch (error) {
      next(error);
    }
  };

  // ============================================================================
  // AUTHENTICATION
  // ============================================================================

  /**
   * Authenticates user and returns tokens
   */
  authenticateUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const loginData = req.body as LoginRequest;
      loginData.ipAddress = req.ip;

      const result = await this.authService.authenticateUser(loginData);

      res.json({
        success: true,
        message: 'Authentication successful',
        data: result,
      } as ApiResponse<typeof result>);
    } catch (error) {
      next(error);
    }
  };

  /**
   * Refreshes access token using refresh token
   */
  refreshAccessToken = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { refreshToken } = req.body;

      if (!refreshToken) {
        res.status(400).json({
          success: false,
          message: 'Refresh token is required',
        } as ApiResponse<null>);
        return;
      }

      const tokens = await this.authService.refreshAccessToken(refreshToken);

      res.json({
        success: true,
        message: 'Token refreshed successfully',
        data: tokens,
      } as ApiResponse<typeof tokens>);
    } catch (error) {
      next(error);
    }
  };

  /**
   * Logs out user by clearing refresh token
   */
  logoutUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          message: 'User not authenticated',
        } as ApiResponse<null>);
        return;
      }

      await this.authService.logoutUser(req.user.id);

      res.json({
        success: true,
        message: 'Logged out successfully',
      } as ApiResponse<null>);
    } catch (error) {
      next(error);
    }
  };

  // ============================================================================
  // PASSWORD MANAGEMENT
  // ============================================================================

  /**
   * Changes user password with validation
   */
  changeUserPassword = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          message: 'User not authenticated',
        } as ApiResponse<null>);
        return;
      }

      const { currentPassword, newPassword } = req.body as ChangePasswordRequest;

      if (!currentPassword || !newPassword) {
        res.status(400).json({
          success: false,
          message: 'Current password and new password are required',
        } as ApiResponse<null>);
        return;
      }

      await this.authService.changeUserPassword(req.user.id, currentPassword, newPassword);

      res.json({
        success: true,
        message: 'Password changed successfully',
      } as ApiResponse<null>);
    } catch (error) {
      next(error);
    }
  };

  /**
   * Initiates password reset process
   */
  initiatePasswordReset = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const { email } = req.body as ForgotPasswordRequest;

      if (!email) {
        res.status(400).json({
          success: false,
          message: 'Email is required',
        } as ApiResponse<null>);
        return;
      }

      const resetToken = await this.authService.initiatePasswordReset(email);

      // In a real application, you would send an email with the reset token
      // For now, we'll just return it in the response (NOT recommended for production)
      res.json({
        success: true,
        message: 'Password reset token generated successfully',
        data: { resetToken },
      } as ApiResponse<{ resetToken: string }>);
    } catch (error) {
      next(error);
    }
  };

  /**
   * Resets password using reset token
   */
  resetPasswordWithToken = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const { token, newPassword } = req.body as ResetPasswordRequest;

      if (!token || !newPassword) {
        res.status(400).json({
          success: false,
          message: 'Token and new password are required',
        } as ApiResponse<null>);
        return;
      }

      await this.authService.resetPasswordWithToken(token, newPassword);

      res.json({
        success: true,
        message: 'Password reset successfully',
      } as ApiResponse<null>);
    } catch (error) {
      next(error);
    }
  };

  // ============================================================================
  // EMAIL VERIFICATION
  // ============================================================================

  /**
   * Verifies user email using verification token
   */
  verifyUserEmail = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { token } = req.params;

      if (!token) {
        res.status(400).json({
          success: false,
          message: 'Verification token is required',
        } as ApiResponse<null>);
        return;
      }

      await this.authService.verifyUserEmail(token);

      res.json({
        success: true,
        message: 'Email verified successfully',
      } as ApiResponse<null>);
    } catch (error) {
      next(error);
    }
  };

  // ============================================================================
  // USER PROFILE
  // ============================================================================

  /**
   * Retrieves user profile by ID
   */
  getUserProfile = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          message: 'User not authenticated',
        } as ApiResponse<null>);
        return;
      }

      const user = await this.authService.getUserProfile(req.user.id);

      res.json({
        success: true,
        message: 'Profile retrieved successfully',
        data: user,
      } as ApiResponse<typeof user>);
    } catch (error) {
      next(error);
    }
  };

  /**
   * Gets current user information from request
   */
  getCurrentUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          message: 'User not authenticated',
        } as ApiResponse<null>);
        return;
      }

      res.json({
        success: true,
        message: 'Current user retrieved successfully',
        data: req.user,
      } as ApiResponse<typeof req.user>);
    } catch (error) {
      next(error);
    }
  };

  // ============================================================================
  // LEGACY METHOD ALIASES (for backward compatibility)
  // ============================================================================

  /**
   * @deprecated Use createUser instead
   */
  adminCreateUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    return this.createUser(req, res, next);
  };

  /**
   * @deprecated Use authenticateUser instead
   */
  login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    return this.authenticateUser(req, res, next);
  };

  /**
   * @deprecated Use refreshAccessToken instead
   */
  refreshToken = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    return this.refreshAccessToken(req, res, next);
  };

  /**
   * @deprecated Use logoutUser instead
   */
  logout = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    return this.logoutUser(req, res, next);
  };

  /**
   * @deprecated Use changeUserPassword instead
   */
  changePassword = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    return this.changeUserPassword(req, res, next);
  };

  /**
   * @deprecated Use initiatePasswordReset instead
   */
  forgotPassword = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    return this.initiatePasswordReset(req, res, next);
  };

  /**
   * @deprecated Use resetPasswordWithToken instead
   */
  resetPassword = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    return this.resetPasswordWithToken(req, res, next);
  };

  /**
   * @deprecated Use verifyUserEmail instead
   */
  verifyEmail = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    return this.verifyUserEmail(req, res, next);
  };

  /**
   * @deprecated Use getUserProfile instead
   */
  getProfile = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    return this.getUserProfile(req, res, next);
  };
}
