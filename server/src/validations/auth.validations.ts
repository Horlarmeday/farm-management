import Joi from 'joi';

export const authValidations = {
  adminCreateUser: {
    body: Joi.object({
      // Basic Information
      email: Joi.string().email().required().messages({
        'string.email': 'Please provide a valid email address',
        'any.required': 'Email is required',
      }),
      firstName: Joi.string().min(2).max(50).required().messages({
        'string.min': 'First name must be at least 2 characters long',
        'string.max': 'First name cannot exceed 50 characters',
        'any.required': 'First name is required',
      }),
      lastName: Joi.string().min(2).max(50).required().messages({
        'string.min': 'Last name must be at least 2 characters long',
        'string.max': 'Last name cannot exceed 50 characters',
        'any.required': 'Last name is required',
      }),
      phone: Joi.string().required().messages({
        'any.required': 'Phone number is required',
      }),
      password: Joi.string().min(6).required().messages({
        'string.min': 'Password must be at least 6 characters long',
        'any.required': 'Password is required',
      }),

      // Employment Details
      roleId: Joi.string().uuid().required().messages({
        'any.required': 'Role ID is required',
        'string.guid': 'Role ID must be a valid UUID',
      }),
      department: Joi.string().optional(),
      hireDate: Joi.date().required().messages({
        'any.required': 'Hire date is required',
        'date.base': 'Hire date must be a valid date',
      }),
      salary: Joi.number().positive().required().messages({
        'any.required': 'Salary is required',
        'number.base': 'Salary must be a number',
        'number.positive': 'Salary must be positive',
      }),
      status: Joi.string().valid('active', 'inactive', 'pending', 'suspended').required().messages({
        'any.required': 'Status is required',
        'any.only': 'Status must be one of: active, inactive, pending, suspended',
      }),

      // Personal Information
      dateOfBirth: Joi.date().optional().messages({
        'date.base': 'Date of birth must be a valid date',
      }),
      gender: Joi.string().valid('male', 'female', 'other').optional().messages({
        'any.only': 'Gender must be one of: male, female, other',
      }),
      bio: Joi.string().max(500).optional().messages({
        'string.max': 'Bio cannot exceed 500 characters',
      }),

      // Address Information
      address: Joi.string().optional(),
      city: Joi.string().optional(),
      state: Joi.string().optional(),
      country: Joi.string().optional(),
      postalCode: Joi.string().optional(),

      // Emergency Contact
      emergencyContact: Joi.string().optional(),

      // System Settings
      isActive: Joi.boolean().required().messages({
        'any.required': 'Active status is required',
        'boolean.base': 'Active status must be a boolean',
      }),
      isEmailVerified: Joi.boolean().optional().messages({
        'boolean.base': 'Email verification status must be a boolean',
      }),

      // Preferences
      preferences: Joi.object().optional(),
    }),
  },

  login: {
    body: Joi.object({
      email: Joi.string().email().required().messages({
        'string.email': 'Please provide a valid email address',
        'any.required': 'Email is required',
      }),
      password: Joi.string().required().messages({
        'any.required': 'Password is required',
      }),
      ipAddress: Joi.string().ip().optional(),
    }),
  },

  refreshToken: {
    body: Joi.object({
      refreshToken: Joi.string().required().messages({
        'any.required': 'Refresh token is required',
      }),
    }),
  },

  forgotPassword: {
    body: Joi.object({
      email: Joi.string().email().required().messages({
        'string.email': 'Please provide a valid email address',
        'any.required': 'Email is required',
      }),
    }),
  },

  resetPassword: {
    body: Joi.object({
      token: Joi.string().required().messages({
        'any.required': 'Reset token is required',
      }),
      password: Joi.string().min(6).required().messages({
        'string.min': 'Password must be at least 6 characters long',
        'any.required': 'Password is required',
      }),
    }),
  },

  changePassword: {
    body: Joi.object({
      currentPassword: Joi.string().required().messages({
        'any.required': 'Current password is required',
      }),
      newPassword: Joi.string().min(6).required().messages({
        'string.min': 'New password must be at least 6 characters long',
        'any.required': 'New password is required',
      }),
    }),
  },

  verifyEmail: {
    params: Joi.object({
      token: Joi.string().required().messages({
        'any.required': 'Verification token is required',
      }),
    }),
  },
};
