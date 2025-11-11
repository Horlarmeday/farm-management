import { ApiResponse, PaginatedResponse } from '../../../shared/src/types/api.types';
import {
  User,
  UserResponse,
  CreateUserRequest,
  AdminCreateUserRequest,
  UpdateUserRequest,
  UserStats,
  AttendanceRecord,
  PayrollRecord,
  LeaveRequest,
  Role,
  Permission,
  UserRole,
  AttendanceStatus,
  PayrollStatus,
  LeaveStatus,
  LeaveType
} from '../../../shared/src/types/user.types';
import { apiClient } from './api';

export class UsersService {
  private static readonly BASE_URL = '/api/users';
  private static readonly DEPARTMENTS_URL = '/api/departments';
  private static readonly ROLES_URL = '/api/roles';
  private static readonly ATTENDANCE_URL = '/api/attendance';
  private static readonly PAYROLL_URL = '/api/payroll';
  private static readonly LEAVES_URL = '/api/leaves';
  // New endpoints aligned with users router
  private static readonly USERS_ATTENDANCE_URL = '/api/users/attendance';
  private static readonly USERS_LEAVE_URL = '/api/users/leave';

  // User CRUD Operations
  static async getUsers(params?: {
    page?: number;
    limit?: number;
    search?: string;
    department?: string;
    role?: UserRole;
    status?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }): Promise<PaginatedResponse<UserResponse>> {
    const response = await apiClient.get(this.BASE_URL, { params });
    return response.data;
  }

  static async getUserById(id: string): Promise<ApiResponse<UserResponse>> {
    const response = await apiClient.get(`${this.BASE_URL}/${id}`);
    return response.data;
  }

  static async createUser(data: CreateUserRequest): Promise<ApiResponse<UserResponse>> {
    const response = await apiClient.post(this.BASE_URL, data);
    return response.data;
  }

  static async adminCreateUser(data: AdminCreateUserRequest): Promise<ApiResponse<UserResponse>> {
    const response = await apiClient.post(`${this.BASE_URL}/admin`, data);
    return response.data;
  }

  static async updateUser(id: string, data: UpdateUserRequest): Promise<ApiResponse<UserResponse>> {
    const response = await apiClient.put(`${this.BASE_URL}/${id}`, data);
    return response.data;
  }

  static async deleteUser(id: string): Promise<ApiResponse<void>> {
    const response = await apiClient.delete(`${this.BASE_URL}/${id}`);
    return response.data;
  }

  static async activateUser(id: string): Promise<ApiResponse<UserResponse>> {
    const response = await apiClient.patch(`${this.BASE_URL}/${id}/activate`);
    return response.data;
  }

  static async deactivateUser(id: string): Promise<ApiResponse<UserResponse>> {
    const response = await apiClient.patch(`${this.BASE_URL}/${id}/deactivate`);
    return response.data;
  }

  static async resetUserPassword(id: string): Promise<ApiResponse<void>> {
    const response = await apiClient.post(`${this.BASE_URL}/${id}/reset-password`);
    return response.data;
  }

  // Department Management
  static async getDepartments(): Promise<ApiResponse<string[]>> {
    const response = await apiClient.get(this.DEPARTMENTS_URL);
    return response.data;
  }

  static async createDepartment(name: string): Promise<ApiResponse<string>> {
    const response = await apiClient.post(this.DEPARTMENTS_URL, { name });
    return response.data;
  }

  static async updateDepartment(oldName: string, newName: string): Promise<ApiResponse<string>> {
    const response = await apiClient.put(`${this.DEPARTMENTS_URL}/${oldName}`, { name: newName });
    return response.data;
  }

  static async deleteDepartment(name: string): Promise<ApiResponse<void>> {
    const response = await apiClient.delete(`${this.DEPARTMENTS_URL}/${name}`);
    return response.data;
  }

  static async getUsersByDepartment(department: string): Promise<PaginatedResponse<UserResponse>> {
    const response = await apiClient.get(`${this.DEPARTMENTS_URL}/${department}/users`);
    return response.data;
  }

  // Role Management
  static async getRoles(): Promise<ApiResponse<Role[]>> {
    const response = await apiClient.get(this.ROLES_URL);
    return response.data;
  }

  static async getRoleById(id: string): Promise<ApiResponse<Role>> {
    const response = await apiClient.get(`${this.ROLES_URL}/${id}`);
    return response.data;
  }

  static async createRole(data: {
    name: string;
    displayName: string;
    description: string;
    permissions: string[];
  }): Promise<ApiResponse<Role>> {
    const response = await apiClient.post(this.ROLES_URL, data);
    return response.data;
  }

  static async updateRole(id: string, data: {
    displayName?: string;
    description?: string;
    permissions?: string[];
  }): Promise<ApiResponse<Role>> {
    const response = await apiClient.put(`${this.ROLES_URL}/${id}`, data);
    return response.data;
  }

  static async deleteRole(id: string): Promise<ApiResponse<void>> {
    const response = await apiClient.delete(`${this.ROLES_URL}/${id}`);
    return response.data;
  }

  static async getPermissions(): Promise<ApiResponse<Permission[]>> {
    const response = await apiClient.get(`${this.ROLES_URL}/permissions`);
    return response.data;
  }

  // Attendance Management
  static async getAttendanceRecords(params?: {
    userId?: string;
    startDate?: string;
    endDate?: string;
    status?: AttendanceStatus;
    page?: number;
    limit?: number;
  }): Promise<PaginatedResponse<AttendanceRecord>> {
    const response = await apiClient.get(this.ATTENDANCE_URL, { params });
    return response.data;
  }

  // Create attendance via /api/users/attendance (server users router)
  static async createAttendance(data: {
    userId: string;
    date: Date;
    checkIn: Date;
    checkOut?: Date;
    location?: string;
    notes?: string;
  }): Promise<ApiResponse<AttendanceRecord>> {
    const response = await apiClient.post(this.USERS_ATTENDANCE_URL, data);
    return response.data;
  }

  static async getUserAttendance(userId: string, params?: {
    startDate?: string;
    endDate?: string;
    page?: number;
    limit?: number;
  }): Promise<PaginatedResponse<AttendanceRecord>> {
    const response = await apiClient.get(`${this.ATTENDANCE_URL}/user/${userId}`, { params });
    return response.data;
  }

  static async clockIn(data: {
    userId: string;
    location?: string;
    notes?: string;
  }): Promise<ApiResponse<AttendanceRecord>> {
    const response = await apiClient.post(`${this.ATTENDANCE_URL}/clock-in`, data);
    return response.data;
  }

  static async clockOut(data: {
    userId: string;
    notes?: string;
  }): Promise<ApiResponse<AttendanceRecord>> {
    const response = await apiClient.post(`${this.ATTENDANCE_URL}/clock-out`, data);
    return response.data;
  }

  static async updateAttendance(id: string, data: {
    clockIn?: Date;
    clockOut?: Date;
    breakStartTime?: Date;
    breakEndTime?: Date;
    status?: AttendanceStatus;
    notes?: string;
  }): Promise<ApiResponse<AttendanceRecord>> {
    const response = await apiClient.put(`${this.ATTENDANCE_URL}/${id}`, data);
    return response.data;
  }

  // Payroll Management
  static async getPayrollRecords(params?: {
    userId?: string;
    payPeriodStart?: string;
    payPeriodEnd?: string;
    status?: PayrollStatus;
    page?: number;
    limit?: number;
  }): Promise<PaginatedResponse<PayrollRecord>> {
    const response = await apiClient.get(this.PAYROLL_URL, { params });
    return response.data;
  }

  static async getUserPayroll(userId: string, params?: {
    year?: number;
    month?: number;
    page?: number;
    limit?: number;
  }): Promise<PaginatedResponse<PayrollRecord>> {
    const response = await apiClient.get(`${this.PAYROLL_URL}/user/${userId}`, { params });
    return response.data;
  }

  static async createPayrollRecord(data: {
    userId: string;
    payPeriodStart: Date;
    payPeriodEnd: Date;
    baseSalary: number;
    overtime?: number;
    bonuses?: number;
    deductions?: number;
    taxDeductions?: number;
  }): Promise<ApiResponse<PayrollRecord>> {
    const response = await apiClient.post(this.PAYROLL_URL, data);
    return response.data;
  }

  static async updatePayrollRecord(id: string, data: {
    overtime?: number;
    bonuses?: number;
    deductions?: number;
    taxDeductions?: number;
    status?: PayrollStatus;
  }): Promise<ApiResponse<PayrollRecord>> {
    const response = await apiClient.put(`${this.PAYROLL_URL}/${id}`, data);
    return response.data;
  }

  static async approvePayroll(id: string): Promise<ApiResponse<PayrollRecord>> {
    const response = await apiClient.patch(`${this.PAYROLL_URL}/${id}/approve`);
    return response.data;
  }

  static async processPayroll(id: string): Promise<ApiResponse<PayrollRecord>> {
    const response = await apiClient.patch(`${this.PAYROLL_URL}/${id}/process`);
    return response.data;
  }

  // Leave Management
  static async getLeaveRequests(params?: {
    userId?: string;
    type?: LeaveType;
    status?: LeaveStatus;
    startDate?: string;
    endDate?: string;
    page?: number;
    limit?: number;
  }): Promise<PaginatedResponse<LeaveRequest>> {
    const response = await apiClient.get(this.LEAVES_URL, { params });
    return response.data;
  }

  static async getUserLeaves(userId: string, params?: {
    year?: number;
    type?: LeaveType;
    status?: LeaveStatus;
    page?: number;
    limit?: number;
  }): Promise<PaginatedResponse<LeaveRequest>> {
    const response = await apiClient.get(`${this.LEAVES_URL}/user/${userId}`, { params });
    return response.data;
  }

  static async createLeaveRequest(data: {
    userId: string;
    type: LeaveType;
    startDate: Date;
    endDate: Date;
    reason: string;
  }): Promise<ApiResponse<LeaveRequest>> {
    const response = await apiClient.post(this.LEAVES_URL, data);
    return response.data;
  }

  // Create leave via /api/users/leave (server users router)
  static async createLeaveRequestUsers(data: {
    userId: string;
    type: LeaveType;
    startDate: Date;
    endDate: Date;
    reason: string;
  }): Promise<ApiResponse<LeaveRequest>> {
    const response = await apiClient.post(this.USERS_LEAVE_URL, data);
    return response.data;
  }

  static async updateLeaveRequest(id: string, data: {
    type?: LeaveType;
    startDate?: Date;
    endDate?: Date;
    reason?: string;
  }): Promise<ApiResponse<LeaveRequest>> {
    const response = await apiClient.put(`${this.LEAVES_URL}/${id}`, data);
    return response.data;
  }

  static async approveLeave(id: string): Promise<ApiResponse<LeaveRequest>> {
    const response = await apiClient.patch(`${this.LEAVES_URL}/${id}/approve`);
    return response.data;
  }

  // Approve/Reject leave via /api/users/leave/:id/approve (server users router uses PUT with body)
  static async approveLeaveUsers(id: string, data: {
    status: 'APPROVED' | 'REJECTED';
    comments?: string;
  }): Promise<ApiResponse<LeaveRequest>> {
    const response = await apiClient.put(`${this.USERS_LEAVE_URL}/${id}/approve`, data);
    return response.data;
  }

  static async rejectLeave(id: string, reason: string): Promise<ApiResponse<LeaveRequest>> {
    const response = await apiClient.patch(`${this.LEAVES_URL}/${id}/reject`, { reason });
    return response.data;
  }

  static async cancelLeave(id: string): Promise<ApiResponse<LeaveRequest>> {
    const response = await apiClient.patch(`${this.LEAVES_URL}/${id}/cancel`);
    return response.data;
  }

  // Statistics and Reports
  static async getUserStats(): Promise<ApiResponse<UserStats>> {
    const response = await apiClient.get(`${this.BASE_URL}/stats`);
    return response.data;
  }

  static async getDepartmentStats(): Promise<ApiResponse<Record<string, {
    totalUsers: number;
    activeUsers: number;
    averageSalary: number;
    totalPayroll: number;
  }>>> {
    const response = await apiClient.get(`${this.DEPARTMENTS_URL}/stats`);
    return response.data;
  }

  static async getAttendanceStats(params?: {
    userId?: string;
    department?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<ApiResponse<{
    totalDays: number;
    presentDays: number;
    absentDays: number;
    lateDays: number;
    attendanceRate: number;
    averageHours: number;
  }>> {
    const response = await apiClient.get(`${this.ATTENDANCE_URL}/stats`, { params });
    return response.data;
  }

  static async getPayrollSummary(params?: {
    department?: string;
    year?: number;
    month?: number;
  }): Promise<ApiResponse<{
    totalGrossPay: number;
    totalNetPay: number;
    totalDeductions: number;
    totalTaxes: number;
    averageSalary: number;
    payrollCount: number;
  }>> {
    const response = await apiClient.get(`${this.PAYROLL_URL}/summary`, { params });
    return response.data;
  }

  static async getLeaveStats(params?: {
    userId?: string;
    department?: string;
    year?: number;
  }): Promise<ApiResponse<{
    totalRequests: number;
    approvedRequests: number;
    pendingRequests: number;
    rejectedRequests: number;
    totalDaysTaken: number;
    leavesByType: Record<LeaveType, number>;
  }>> {
    const response = await apiClient.get(`${this.LEAVES_URL}/stats`, { params });
    return response.data;
  }

  // User Profile Management
  static async updateUserProfile(id: string, data: {
    firstName?: string;
    lastName?: string;
    phone?: string;
    bio?: string;
    dateOfBirth?: Date;
    gender?: string;
    address?: string;
    city?: string;
    state?: string;
    country?: string;
    postalCode?: string;
    emergencyContact?: string;
  }): Promise<ApiResponse<UserResponse>> {
    const response = await apiClient.put(`${this.BASE_URL}/${id}/profile`, data);
    return response.data;
  }

  static async uploadUserAvatar(id: string, file: File): Promise<ApiResponse<{ avatarUrl: string }>> {
    const formData = new FormData();
    formData.append('avatar', file);
    const response = await apiClient.post(`${this.BASE_URL}/${id}/avatar`, formData);
    return response.data;
  }

  static async deleteUserAvatar(id: string): Promise<ApiResponse<void>> {
    const response = await apiClient.delete(`${this.BASE_URL}/${id}/avatar`);
    return response.data;
  }
}

export default UsersService;