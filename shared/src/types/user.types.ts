import { BaseEntity, ContactInfo, NotificationPreferences, Status } from './common.types';

// User roles and permissions
export type UserRole = 'admin' | 'manager' | 'supervisor' | 'worker' | 'viewer';

// Attendance status enum
export enum AttendanceStatus {
  PRESENT = 'present',
  ABSENT = 'absent',
  LATE = 'late',
  HALF_DAY = 'half_day',
}

// Payroll status enum
export enum PayrollStatus {
  DRAFT = 'draft',
  PENDING = 'pending',
  APPROVED = 'approved',
  PAID = 'paid',
}

// User status enum
export enum UserStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  PENDING = 'pending',
  SUSPENDED = 'suspended',
}

// Leave type enum
export enum LeaveType {
  ANNUAL = 'annual',
  SICK = 'sick',
  MATERNITY = 'maternity',
  PATERNITY = 'paternity',
  EMERGENCY = 'emergency',
  UNPAID = 'unpaid',
  OTHER = 'other',
}

// Leave status enum
export enum LeaveStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  CANCELLED = 'cancelled',
}

export interface Permission {
  id: string;
  name: string;
  description: string;
  resource: string;
  action: string;
}

export interface Role extends BaseEntity {
  name: UserRole;
  displayName: string;
  description: string;
  permissions: Permission[];
  isDefault: boolean;
}

// Role response type for UserResponse
export interface RoleResponse {
  id: string;
  name: string | UserRole;
  description: string;
  isActive: boolean;
  isSystemRole: boolean;
}

// UserResponse type based on AuthService.ts implementation
export interface UserResponse extends BaseEntity {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  avatar?: string;
  employeeId?: string;
  department?: string;
  bio?: string;
  salary?: number;
  status: Status;
  isActive: boolean;
  isEmailVerified: boolean;
  lastLoginAt?: Date;
  dateOfBirth?: Date;
  gender?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  postalCode?: string;
  hireDate?: Date;
  terminationDate?: Date;
  emergencyContact?: string;
  preferences?: Record<string, any>;
  role: RoleResponse;
}

export interface User extends BaseEntity {
  email: string;
  firstName: string;
  lastName: string;
  fullName: string;
  avatar?: string;
  phone?: string;
  status: Status;
  role: Role;
  department?: string;
  employeeId?: string;
  hireDate?: Date;
  salary?: number;
  contactInfo?: ContactInfo;
  notificationPreferences: NotificationPreferences;
  lastLoginAt?: Date;
  emailVerifiedAt?: Date;
  phoneVerifiedAt?: Date;
  twoFactorEnabled: boolean;
  isActive: boolean;
}

export interface CreateUserRequest {
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  roleId: string;
  department?: string;
  employeeId?: string;
  hireDate?: Date;
  salary?: number;
  password: string;
}

// Complete user creation request for HR/Admin
export interface AdminCreateUserRequest {
  // Basic Information
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  password: string;

  // Employment Details
  roleId: string;
  department?: string;
  hireDate: Date;
  salary: number;
  status: Status;

  // Personal Information
  dateOfBirth?: Date;
  gender?: string;
  bio?: string;

  // Address Information
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  postalCode?: string;

  // Emergency Contact
  emergencyContact?: string;

  // System Settings
  isActive: boolean;
  isEmailVerified?: boolean;

  // Preferences
  preferences?: Record<string, any>;
}

export interface UpdateUserRequest {
  firstName?: string;
  lastName?: string;
  phone?: string;
  department?: string;
  salary?: number;
  roleId?: string;
  status?: Status;
  notificationPreferences?: NotificationPreferences;
  bio?: string;
  dateOfBirth?: Date;
  gender?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  postalCode?: string;
  emergencyContact?: string;
  isActive?: boolean;
  preferences?: Record<string, any>;
}

export interface LoginRequest {
  email: string;
  password: string;
  rememberMe?: boolean;
  ipAddress?: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
}

export interface AuthResponse {
  user: UserResponse;
  accessToken: string;
  refreshToken: string;
  expiresAt: Date;
}

export interface JwtPayload {
  userId: string;
  email: string;
  role: string;
  iat?: number;
  exp?: number;
  iss?: string;
  aud?: string;
}

export interface PasswordResetRequest {
  email: string;
}

export interface PasswordChangeRequest {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  token: string;
  newPassword: string;
  confirmPassword: string;
}

export interface AttendanceRecord extends BaseEntity {
  userId: string;
  user: User;
  date: Date;
  clockIn: Date;
  clockOut?: Date;
  breakStartTime?: Date;
  breakEndTime?: Date;
  totalHours?: number;
  status: AttendanceStatus;
  notes?: string;
  location?: string;
  approvedBy?: string;
  approvedAt?: Date;
}

export interface PayrollRecord extends BaseEntity {
  userId: string;
  user: User;
  payPeriodStart: Date;
  payPeriodEnd: Date;
  baseSalary: number;
  overtime?: number;
  bonuses?: number;
  deductions?: number;
  grossPay: number;
  netPay: number;
  taxDeductions?: number;
  status: PayrollStatus;
  payDate?: Date;
  processedBy?: string;
  processedAt?: Date;
}

export interface LeaveRequest extends BaseEntity {
  userId: string;
  user: User;
  type: LeaveType;
  startDate: Date;
  endDate: Date;
  reason: string;
  status: LeaveStatus;
  approvedBy?: string;
  approvedAt?: Date;
  rejectedReason?: string;
  totalDays: number;
}

export interface UserStats {
  totalUsers: number;
  activeUsers: number;
  inactiveUsers: number;
  usersByRole: Record<UserRole, number>;
  usersByDepartment: Record<string, number>;
  recentLogins: number;
  averageSessionDuration: number;
}
