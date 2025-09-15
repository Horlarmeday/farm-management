import {
  AttendanceStatus,
  DeliveryChannel,
  LeaveStatus,
  LeaveType,
  NotificationType,
  PayrollStatus,
  UserStatus,
} from '../../../shared/src/types';
import * as bcrypt from 'bcryptjs';
import * as crypto from 'crypto';
import * as jwt from 'jsonwebtoken';
import { Repository } from 'typeorm';
import { AppDataSource } from '../config/database';
import { Attendance } from '../entities/Attendance';
import { Department } from '../entities/Department';
import { Leave } from '../entities/Leave';
import { PasswordResetToken } from '../entities/PasswordResetToken';
import { Payroll } from '../entities/Payroll';
import { PayrollRecord } from '../entities/PayrollRecord';
import { Permission } from '../entities/Permission';
import { Role } from '../entities/Role';
import { User } from '../entities/User';
import { UserSession } from '../entities/UserSession';
import { BadRequestError, NotFoundError, UnauthorizedError } from '../utils/errors';
import { ErrorHandler, ValidationError, ConflictError } from '../utils/error-handler';
import { NotificationService } from './NotificationService';
import { ServiceFactory } from './ServiceFactory';

export class UserService {
  private userRepository: Repository<User>;
  private roleRepository: Repository<Role>;
  private departmentRepository: Repository<Department>;
  private attendanceRepository: Repository<Attendance>;
  private payrollRepository: Repository<Payroll>;
  private payrollRecordRepository: Repository<PayrollRecord>;
  private leaveRepository: Repository<Leave>;
  private userSessionRepository: Repository<UserSession>;
  private passwordResetTokenRepository: Repository<PasswordResetToken>;
  private notificationService: NotificationService;

  constructor() {
    this.userRepository = AppDataSource.getRepository(User);
    this.roleRepository = AppDataSource.getRepository(Role);
    this.departmentRepository = AppDataSource.getRepository(Department);
    this.attendanceRepository = AppDataSource.getRepository(Attendance);
    this.payrollRepository = AppDataSource.getRepository(Payroll);
    this.payrollRecordRepository = AppDataSource.getRepository(PayrollRecord);
    this.leaveRepository = AppDataSource.getRepository(Leave);
    this.userSessionRepository = AppDataSource.getRepository(UserSession);
    this.passwordResetTokenRepository = AppDataSource.getRepository(PasswordResetToken);

    // Use ServiceFactory for dependency injection
    const serviceFactory = ServiceFactory.getInstance();
    this.notificationService = serviceFactory.getNotificationService();
  }

  // User Management
  async getUsers(filters?: {
    status?: UserStatus;
    roleId?: string;
    departmentId?: string;
    search?: string;
    isOnline?: boolean;
  }): Promise<User[]> {
    const query = this.userRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.role', 'role')
      .leftJoinAndSelect('user.department', 'department');

    if (filters?.status) {
      query.andWhere('user.status = :status', { status: filters.status });
    }

    if (filters?.roleId) {
      query.andWhere('user.roleId = :roleId', { roleId: filters.roleId });
    }

    if (filters?.departmentId) {
      query.andWhere('user.departmentId = :departmentId', { departmentId: filters.departmentId });
    }

    if (filters?.search) {
      query.andWhere(
        '(user.firstName LIKE :search OR user.lastName LIKE :search OR user.email LIKE :search OR user.employeeId LIKE :search)',
        { search: `%${filters.search}%` },
      );
    }

    if (filters?.isOnline !== undefined) {
      query.andWhere('user.isOnline = :isOnline', { isOnline: filters.isOnline });
    }

    return query.orderBy('user.firstName', 'ASC').getMany();
  }

  async getUserById(id: string): Promise<User> {
    const user = await ErrorHandler.handleDatabaseOperation(
      () => this.userRepository.findOne({
        where: { id },
        relations: ['role', 'department', 'attendances', 'payrolls', 'leaves'],
      }),
      'getUserById - user lookup'
    );

    ErrorHandler.validateExists(user, 'User');

    return user!;
  }

  async getUserByEmail(email: string): Promise<User | null> {
    return ErrorHandler.handleDatabaseOperation(
      () => this.userRepository.findOne({
        where: { email },
        relations: ['role', 'department'],
      }),
      'getUserByEmail - user lookup'
    );
  }

  async getUserByUsername(username: string): Promise<User | null> {
    return this.userRepository.findOne({
      where: { username },
      relations: ['role', 'department'],
    });
  }

  async updateUser(id: string, updates: Partial<User>): Promise<User> {
    const user = await this.getUserById(id);

    // Handle password update separately
    if (updates.password) {
      updates.password = await bcrypt.hash(updates.password, 10);
    }

    Object.assign(user, updates);
    await this.userRepository.save(user);

    return this.getUserById(id);
  }

  async deleteUser(id: string): Promise<void> {
    const user = await this.getUserById(id);
    user.status = UserStatus.INACTIVE;
    user.deletedAt = new Date();
    await this.userRepository.save(user);
  }

  // Authentication
  async login(credentials: { email?: string; username?: string; password: string }): Promise<{
    user: User;
    token: string;
    refreshToken: string;
    expiresIn: number;
  }> {
    const user = credentials.email
      ? await this.getUserByEmail(credentials.email)
      : await this.getUserByUsername(credentials.username!);

    if (!user || user.status !== UserStatus.ACTIVE) {
      throw new UnauthorizedError('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(credentials.password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedError('Invalid credentials');
    }

    // Generate tokens
    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role.name },
      process.env.JWT_SECRET!,
      { expiresIn: '1h' },
    );

    const refreshToken = jwt.sign({ userId: user.id }, process.env.JWT_REFRESH_SECRET!, {
      expiresIn: '7d',
    });

    // Update user login info
    user.lastLoginAt = new Date();
    user.isOnline = true;
    await this.userRepository.save(user);

    // Create session
    await this.createUserSession(user.id, token, refreshToken);

    return {
      user,
      token,
      refreshToken,
      expiresIn: 3600, // 1 hour
    };
  }

  async logout(userId: string, token: string): Promise<void> {
    // Update user online status
    const user = await this.getUserById(userId);
    user.isOnline = false;
    await this.userRepository.save(user);

    // Invalidate session
    await this.invalidateUserSession(userId, token);
  }

  async refreshToken(refreshToken: string): Promise<{
    token: string;
    refreshToken: string;
    expiresIn: number;
  }> {
    try {
      const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET!) as {
        userId: string;
      };
      const user = await this.getUserById(decoded.userId);

      if (user.status !== UserStatus.ACTIVE) {
        throw new UnauthorizedError('User is not active');
      }

      const newToken = jwt.sign(
        { userId: user.id, email: user.email, role: user.role.name },
        process.env.JWT_SECRET!,
        { expiresIn: '1h' },
      );

      const newRefreshToken = jwt.sign({ userId: user.id }, process.env.JWT_REFRESH_SECRET!, {
        expiresIn: '7d',
      });

      // Update session
      await this.updateUserSession(user.id, newToken, newRefreshToken);

      return {
        token: newToken,
        refreshToken: newRefreshToken,
        expiresIn: 3600,
      };
    } catch (error) {
      throw new UnauthorizedError('Invalid refresh token');
    }
  }

  async requestPasswordReset(email: string): Promise<void> {
    const user = await this.getUserByEmail(email);
    if (!user) {
      // Don't reveal if user exists
      return;
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 3600000); // 1 hour

    await this.passwordResetTokenRepository.save({
      userId: user.id,
      token: resetToken,
      expiresAt,
    });

    // Send reset email
    await this.notificationService.createNotification({
      title: 'Password Reset Request',
      message: `Click the link to reset your password: ${process.env.FRONTEND_URL}/reset-password/${resetToken}`,
      type: NotificationType.PASSWORD_RESET,
      priority: 'high',
      userId: user.id,
      deliveryMethods: [DeliveryChannel.EMAIL],
      actionRequired: true,
      actionText: 'Reset Password',
      actionUrl: `/reset-password/${resetToken}`,
      createdById: user.id,
    });
  }

  async resetPassword(token: string, newPassword: string): Promise<void> {
    const resetToken = await ErrorHandler.handleDatabaseOperation(
      () => this.passwordResetTokenRepository.findOne({
        where: { token, expiresAt: { $gt: new Date() } as any },
      }),
      'resetPassword - token lookup'
    );

    if (!resetToken) {
      throw new BadRequestError('Invalid or expired reset token');
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await this.updateUser(resetToken.userId, { password: hashedPassword });

    // Remove used token
    await ErrorHandler.handleDatabaseOperation(
      () => this.passwordResetTokenRepository.remove(resetToken),
      'resetPassword - remove token'
    );
  }

  // Role Management
  async createRole(roleData: {
    name: string;
    description?: string;
    permissions: Permission[];
    level: number;
    isActive?: boolean;
    createdById: string;
  }): Promise<Role> {
    const role = this.roleRepository.create({
      ...roleData,
      isActive: roleData.isActive !== false,
    });

    return ErrorHandler.handleDatabaseOperation(
      () => this.roleRepository.save(role),
      'createRole - save role'
    );
  }

  async getRoles(filters?: { isActive?: boolean; level?: number }): Promise<Role[]> {
    const query = this.roleRepository.createQueryBuilder('role');

    if (filters?.isActive !== undefined) {
      query.andWhere('role.isActive = :isActive', { isActive: filters.isActive });
    }

    if (filters?.level !== undefined) {
      query.andWhere('role.level = :level', { level: filters.level });
    }

    return query.orderBy('role.level', 'ASC').getMany();
  }

  async getRoleById(id: string): Promise<Role> {
    const role = await ErrorHandler.handleDatabaseOperation(
      () => this.roleRepository.findOne({
        where: { id },
        relations: ['users'],
      }),
      'getRoleById - role lookup'
    );

    ErrorHandler.validateExists(role, 'Role');

    return role!;
  }

  async updateRole(id: string, updates: Partial<Role>): Promise<Role> {
    const role = await this.getRoleById(id);
    Object.assign(role, updates);
    return ErrorHandler.handleDatabaseOperation(
      () => this.roleRepository.save(role),
      'updateRole - save role'
    );
  }

  // Department Management
  async createDepartment(departmentData: {
    name: string;
    description?: string;
    managerId?: string;
    budget?: number;
    isActive?: boolean;
    createdById: string;
  }): Promise<Department> {
    const department = this.departmentRepository.create({
      ...departmentData,
      isActive: departmentData.isActive !== false,
    });

    return this.departmentRepository.save(department);
  }

  async getDepartments(filters?: {
    isActive?: boolean;
    managerId?: string;
  }): Promise<Department[]> {
    const query = this.departmentRepository
      .createQueryBuilder('department')
      .leftJoinAndSelect('department.manager', 'manager')
      .leftJoinAndSelect('department.users', 'users');

    if (filters?.isActive !== undefined) {
      query.andWhere('department.isActive = :isActive', { isActive: filters.isActive });
    }

    if (filters?.managerId) {
      query.andWhere('department.managerId = :managerId', { managerId: filters.managerId });
    }

    return query.orderBy('department.name', 'ASC').getMany();
  }

  async getDepartmentById(id: string): Promise<Department> {
    const department = await this.departmentRepository.findOne({
      where: { id },
      relations: ['manager', 'users'],
    });

    if (!department) {
      throw new NotFoundError('Department not found');
    }

    return department;
  }

  // Attendance Management
  async recordAttendance(attendanceData: {
    userId: string;
    date: Date;
    clockIn: Date;
    clockOut?: Date;
    breakStart?: Date;
    breakEnd?: Date;
    location?: string;
    notes?: string;
    recordedById: string;
  }): Promise<Attendance> {
    // Check if attendance already exists for this user and date
    const existingAttendance = await this.attendanceRepository.findOne({
      where: {
        userId: attendanceData.userId,
        date: attendanceData.date,
      },
    });

    if (existingAttendance) {
      throw new BadRequestError('Attendance already recorded for this date');
    }

    const attendance = this.attendanceRepository.create({
      ...attendanceData,
      status: AttendanceStatus.PRESENT,
    });

    return this.attendanceRepository.save(attendance);
  }

  async updateAttendance(id: string, updates: Partial<Attendance>): Promise<Attendance> {
    const attendance = await this.attendanceRepository.findOneBy({ id });
    if (!attendance) {
      throw new NotFoundError('Attendance record not found');
    }

    Object.assign(attendance, updates);

    // Calculate hours worked if both clockIn and clockOut are present
    if (attendance.clockIn && attendance.clockOut) {
      const hoursWorked =
        (attendance.clockOut.getTime() - attendance.clockIn.getTime()) / (1000 * 60 * 60);
      attendance.hoursWorked = Math.round(hoursWorked * 100) / 100;
    }

    return this.attendanceRepository.save(attendance);
  }

  async getAttendance(filters?: {
    userId?: string;
    date?: Date;
    startDate?: Date;
    endDate?: Date;
    status?: AttendanceStatus;
  }): Promise<Attendance[]> {
    const query = this.attendanceRepository
      .createQueryBuilder('attendance')
      .leftJoinAndSelect('attendance.user', 'user');

    if (filters?.userId) {
      query.andWhere('attendance.userId = :userId', { userId: filters.userId });
    }

    if (filters?.date) {
      query.andWhere('attendance.date = :date', { date: filters.date });
    }

    if (filters?.startDate) {
      query.andWhere('attendance.date >= :startDate', { startDate: filters.startDate });
    }

    if (filters?.endDate) {
      query.andWhere('attendance.date <= :endDate', { endDate: filters.endDate });
    }

    if (filters?.status) {
      query.andWhere('attendance.status = :status', { status: filters.status });
    }

    return query.orderBy('attendance.date', 'DESC').getMany();
  }

  // Payroll Management
  async generatePayroll(payrollData: {
    userId: string;
    payPeriodStart: Date;
    payPeriodEnd: Date;
    baseSalary: number;
    overtime?: number;
    bonuses?: number;
    deductions?: number;
    notes?: string;
    createdById: string;
  }): Promise<Payroll> {
    const user = await this.getUserById(payrollData.userId);

    // Calculate attendance for the period
    const attendances = await this.getAttendance({
      userId: payrollData.userId,
      startDate: payrollData.payPeriodStart,
      endDate: payrollData.payPeriodEnd,
    });

    const totalHours = attendances.reduce((sum, att) => sum + (att.hoursWorked || 0), 0);

    // Calculate gross pay
    const grossPay =
      payrollData.baseSalary + (payrollData.overtime || 0) + (payrollData.bonuses || 0);
    const deductions = payrollData.deductions || 0;
    const netPay = grossPay - deductions;

    const payroll = this.payrollRepository.create({
      ...payrollData,
      totalHours,
      grossPay,
      deductions,
      netPay,
      status: PayrollStatus.PENDING,
    });

    const savedPayroll = await this.payrollRepository.save(payroll);

    // Send notification
    await this.notificationService.createNotification({
      title: 'Payroll Generated',
      message: `Your payroll for ${payrollData.payPeriodStart.toDateString()} - ${payrollData.payPeriodEnd.toDateString()} has been generated`,
      type: NotificationType.PAYROLL_GENERATED,
      priority: 'medium',
      userId: user.id,
      deliveryMethods: [DeliveryChannel.EMAIL, DeliveryChannel.IN_APP],
      referenceType: 'payroll',
      referenceId: savedPayroll.id,
      createdById: payrollData.createdById,
    });

    return savedPayroll;
  }

  async getPayrolls(filters?: {
    userId?: string;
    status?: PayrollStatus;
    payPeriodStart?: Date;
    payPeriodEnd?: Date;
  }): Promise<Payroll[]> {
    const query = this.payrollRepository
      .createQueryBuilder('payroll')
      .leftJoinAndSelect('payroll.user', 'user');

    if (filters?.userId) {
      query.andWhere('payroll.userId = :userId', { userId: filters.userId });
    }

    if (filters?.status) {
      query.andWhere('payroll.status = :status', { status: filters.status });
    }

    if (filters?.payPeriodStart) {
      query.andWhere('payroll.payPeriodStart >= :payPeriodStart', {
        payPeriodStart: filters.payPeriodStart,
      });
    }

    if (filters?.payPeriodEnd) {
      query.andWhere('payroll.payPeriodEnd <= :payPeriodEnd', {
        payPeriodEnd: filters.payPeriodEnd,
      });
    }

    return query.orderBy('payroll.payPeriodStart', 'DESC').getMany();
  }

  async approvePayroll(id: string, approvedById: string): Promise<Payroll> {
    const payroll = await this.payrollRepository.findOne({
      where: { id },
      relations: ['user'],
    });

    if (!payroll) {
      throw new NotFoundError('Payroll not found');
    }

    payroll.status = PayrollStatus.APPROVED;
    payroll.approvedById = approvedById;
    payroll.approvedAt = new Date();

    return this.payrollRepository.save(payroll);
  }

  // Leave Management
  async requestLeave(leaveData: {
    userId: string;
    type: LeaveType;
    startDate: Date;
    endDate: Date;
    reason: string;
    notes?: string;
  }): Promise<Leave> {
    const user = await this.getUserById(leaveData.userId);

    const leave = this.leaveRepository.create({
      ...leaveData,
      status: LeaveStatus.PENDING,
      appliedDate: new Date(),
    });

    const savedLeave = await this.leaveRepository.save(leave);

    // Notify manager
    if (user.department?.managerId) {
      await this.notificationService.createNotification({
        title: 'Leave Request',
        message: `${user.firstName} ${user.lastName} has requested ${leaveData.type} leave from ${leaveData.startDate.toDateString()} to ${leaveData.endDate.toDateString()}`,
        type: NotificationType.LEAVE_REQUEST,
        priority: 'medium',
        userId: user.department.managerId,
        deliveryMethods: [DeliveryChannel.EMAIL, DeliveryChannel.IN_APP],
        referenceType: 'leave',
        referenceId: savedLeave.id,
        actionRequired: true,
        actionText: 'Review Request',
        actionUrl: `/hr/leaves/${savedLeave.id}`,
        createdById: leaveData.userId,
      });
    }

    return savedLeave;
  }

  async getLeaves(filters?: {
    userId?: string;
    status?: LeaveStatus;
    type?: LeaveType;
    startDate?: Date;
    endDate?: Date;
  }): Promise<Leave[]> {
    const query = this.leaveRepository
      .createQueryBuilder('leave')
      .leftJoinAndSelect('leave.user', 'user');

    if (filters?.userId) {
      query.andWhere('leave.userId = :userId', { userId: filters.userId });
    }

    if (filters?.status) {
      query.andWhere('leave.status = :status', { status: filters.status });
    }

    if (filters?.type) {
      query.andWhere('leave.type = :type', { type: filters.type });
    }

    if (filters?.startDate) {
      query.andWhere('leave.startDate >= :startDate', { startDate: filters.startDate });
    }

    if (filters?.endDate) {
      query.andWhere('leave.endDate <= :endDate', { endDate: filters.endDate });
    }

    return query.orderBy('leave.appliedDate', 'DESC').getMany();
  }

  async processLeave(
    id: string,
    decision: LeaveStatus,
    processedById: string,
    comments?: string,
  ): Promise<Leave> {
    const leave = await this.leaveRepository.findOne({
      where: { id },
      relations: ['user'],
    });

    if (!leave) {
      throw new NotFoundError('Leave request not found');
    }

    leave.status = decision;
    leave.processedById = processedById;
    leave.processedAt = new Date();
    leave.comments = comments;

    const savedLeave = await this.leaveRepository.save(leave);

    // Notify user
    await this.notificationService.createNotification({
      title: `Leave Request ${decision}`,
      message: `Your leave request has been ${decision.toLowerCase()}${comments ? ': ' + comments : ''}`,
      type: NotificationType.LEAVE_RESPONSE,
      priority: 'medium',
      userId: leave.user.id,
      deliveryMethods: [DeliveryChannel.EMAIL, DeliveryChannel.IN_APP],
      referenceType: 'leave',
      referenceId: savedLeave.id,
      createdById: processedById,
    });

    return savedLeave;
  }

  // Utility Methods
  private async generateEmployeeId(): Promise<string> {
    const count = await this.userRepository.count();
    return `EMP${String(count + 1).padStart(4, '0')}`;
  }

  private async createUserSession(
    userId: string,
    token: string,
    refreshToken: string,
  ): Promise<void> {
    await this.userSessionRepository.save({
      userId,
      sessionToken: token,
      refreshToken,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    });
  }

  private async updateUserSession(
    userId: string,
    token: string,
    refreshToken: string,
  ): Promise<void> {
    await this.userSessionRepository.update(
      { userId },
      {
        sessionToken: token,
        refreshToken,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    );
  }

  private async invalidateUserSession(userId: string, token: string): Promise<void> {
    await this.userSessionRepository.delete({ userId, sessionToken: token });
  }

  // Analytics
  async getUserAnalytics(): Promise<{
    totalUsers: number;
    activeUsers: number;
    onlineUsers: number;
    usersByRole: Record<string, number>;
    usersByDepartment: Record<string, number>;
    recentLogins: User[];
  }> {
    const users = await this.getUsers();
    const totalUsers = users.length;
    const activeUsers = users.filter((u) => u.status === UserStatus.ACTIVE).length;
    const onlineUsers = users.filter((u) => u.isOnline).length;

    const usersByRole = users.reduce(
      (acc, user) => {
        const roleName = user.role?.name || 'Unknown';
        acc[roleName] = (acc[roleName] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>,
    );

    const usersByDepartment = users.reduce(
      (acc, user) => {
        const departmentName = user.department?.name || 'No Department';
        acc[departmentName] = (acc[departmentName] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>,
    );

    const recentLogins = users
      .filter((u) => u.lastLoginAt)
      .sort((a, b) => new Date(b.lastLoginAt!).getTime() - new Date(a.lastLoginAt!).getTime())
      .slice(0, 10);

    return {
      totalUsers,
      activeUsers,
      onlineUsers,
      usersByRole,
      usersByDepartment,
      recentLogins,
    };
  }

  // Payroll Summary
  async getPayrollSummary(filters?: {
    startDate?: Date;
    endDate?: Date;
    departmentId?: string;
  }): Promise<{
    totalPayroll: number;
    averageSalary: number;
    payrollByDepartment: Record<string, number>;
    payrollByMonth: Record<string, number>;
    topEarners: Array<{ user: User; salary: number }>;
  }> {
    const endDate = filters?.endDate || new Date();
    const startDate = filters?.startDate || new Date(endDate.getTime() - 30 * 24 * 60 * 60 * 1000);

    const payrolls = await this.getPayrolls({
      payPeriodStart: startDate,
      payPeriodEnd: endDate,
    });

    const totalPayroll = payrolls.reduce((sum, payroll) => sum + payroll.netPay, 0);
    const averageSalary = payrolls.length > 0 ? totalPayroll / payrolls.length : 0;

    const payrollByDepartment: Record<string, number> = {};
    const payrollByMonth: Record<string, number> = {};
    const userSalaries: Array<{ user: User; salary: number }> = [];

    for (const payroll of payrolls) {
      const user = await this.getUserById(payroll.userId);
      const departmentName = user.department?.name || 'No Department';
      const monthKey = payroll.payPeriodStart.toISOString().substring(0, 7);

      payrollByDepartment[departmentName] =
        (payrollByDepartment[departmentName] || 0) + payroll.netPay;
      payrollByMonth[monthKey] = (payrollByMonth[monthKey] || 0) + payroll.netPay;
      userSalaries.push({ user, salary: payroll.netPay });
    }

    const topEarners = userSalaries.sort((a, b) => b.salary - a.salary).slice(0, 10);

    return {
      totalPayroll,
      averageSalary,
      payrollByDepartment,
      payrollByMonth,
      topEarners,
    };
  }

  // Leave Analytics
  async getLeaveAnalytics(filters?: {
    startDate?: Date;
    endDate?: Date;
    departmentId?: string;
  }): Promise<{
    totalLeaveRequests: number;
    approvedLeaves: number;
    rejectedLeaves: number;
    pendingLeaves: number;
    leaveByType: Record<string, number>;
    leaveByDepartment: Record<string, number>;
    averageLeaveDuration: number;
  }> {
    const endDate = filters?.endDate || new Date();
    const startDate = filters?.startDate || new Date(endDate.getTime() - 30 * 24 * 60 * 60 * 1000);

    const leaves = await this.getLeaves({
      startDate,
      endDate,
    });

    const totalLeaveRequests = leaves.length;
    const approvedLeaves = leaves.filter((l) => l.status === LeaveStatus.APPROVED).length;
    const rejectedLeaves = leaves.filter((l) => l.status === LeaveStatus.REJECTED).length;
    const pendingLeaves = leaves.filter((l) => l.status === LeaveStatus.PENDING).length;

    const leaveByType: Record<string, number> = {};
    const leaveByDepartment: Record<string, number> = {};
    let totalDuration = 0;

    for (const leave of leaves) {
      const user = await this.getUserById(leave.userId);
      const departmentName = user.department?.name || 'No Department';
      const duration = Math.ceil(
        (leave.endDate.getTime() - leave.startDate.getTime()) / (1000 * 60 * 60 * 24),
      );

      leaveByType[leave.leaveType] = (leaveByType[leave.leaveType] || 0) + 1;
      leaveByDepartment[departmentName] = (leaveByDepartment[departmentName] || 0) + 1;
      totalDuration += duration;
    }

    const averageLeaveDuration = leaves.length > 0 ? totalDuration / leaves.length : 0;

    return {
      totalLeaveRequests,
      approvedLeaves,
      rejectedLeaves,
      pendingLeaves,
      leaveByType,
      leaveByDepartment,
      averageLeaveDuration,
    };
  }

  // Profile Management
  async getProfile(userId: string): Promise<{
    user: User;
    attendanceStats: {
      totalDays: number;
      presentDays: number;
      absentDays: number;
      lateDays: number;
    };
    leaveStats: {
      totalRequests: number;
      approvedRequests: number;
      pendingRequests: number;
    };
    payrollStats: {
      totalEarnings: number;
      averageSalary: number;
      lastPayroll: Payroll | null;
    };
  }> {
    const user = await this.getUserById(userId);

    // Get attendance stats
    const attendanceRecords = await this.getAttendance({ userId });
    const totalDays = attendanceRecords.length;
    const presentDays = attendanceRecords.filter(
      (a) => a.status === AttendanceStatus.PRESENT,
    ).length;
    const absentDays = attendanceRecords.filter((a) => a.status === AttendanceStatus.ABSENT).length;
    const lateDays = attendanceRecords.filter((a) => a.status === AttendanceStatus.LATE).length;

    // Get leave stats
    const leaveRequests = await this.getLeaves({ userId });
    const totalRequests = leaveRequests.length;
    const approvedRequests = leaveRequests.filter((l) => l.status === LeaveStatus.APPROVED).length;
    const pendingRequests = leaveRequests.filter((l) => l.status === LeaveStatus.PENDING).length;

    // Get payroll stats
    const payrolls = await this.getPayrolls({ userId });
    const totalEarnings = payrolls.reduce((sum, p) => sum + p.netPay, 0);
    const averageSalary = payrolls.length > 0 ? totalEarnings / payrolls.length : 0;
    const lastPayroll = payrolls.length > 0 ? payrolls[0] : null;

    return {
      user,
      attendanceStats: {
        totalDays,
        presentDays,
        absentDays,
        lateDays,
      },
      leaveStats: {
        totalRequests,
        approvedRequests,
        pendingRequests,
      },
      payrollStats: {
        totalEarnings,
        averageSalary,
        lastPayroll,
      },
    };
  }

  async updateProfile(
    userId: string,
    updates: {
      firstName?: string;
      lastName?: string;
      email?: string;
      phone?: string;
      address?: string;
      emergencyContact?: {
        name: string;
        relationship: string;
        phone: string;
      };
      skills?: string[];
      bio?: string;
    },
  ): Promise<User> {
    const user = await this.getUserById(userId);

    // Only allow updating profile-related fields
    const allowedUpdates = {
      firstName: updates.firstName,
      lastName: updates.lastName,
      email: updates.email,
      phone: updates.phone,
      address: updates.address,
      emergencyContact: updates.emergencyContact,
      skills: updates.skills,
      bio: updates.bio,
    };

    Object.assign(user, allowedUpdates);
    return this.userRepository.save(user);
  }
}
