import { ApiResponse } from '@kuyash/shared';
import { NextFunction, Request, Response } from 'express';
import { AuthService } from '../services/AuthService';
import { ServiceFactory } from '../services/ServiceFactory';
import { UserService } from '../services/UserService';

export class UserController {
  private userService: UserService;
  private authService: AuthService;

  constructor() {
    const serviceFactory = ServiceFactory.getInstance();
    this.userService = serviceFactory.getUserService();
    this.authService = serviceFactory.getAuthService();
  }

  // User Management
  createUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      // Use AuthService for admin/HR user creation
      const user = await this.authService.createUser(req.body);

      res.status(201).json({
        success: true,
        message: 'User created successfully',
        data: user,
      } as ApiResponse<typeof user>);
    } catch (error) {
      next(error);
    }
  };

  getUsers = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { roleId, status, departmentId, search, isOnline } = req.query;

      const users = await this.userService.getUsers({
        roleId: roleId as string,
        status: status as any,
        departmentId: departmentId as string,
        search: search as string,
        isOnline: isOnline === 'true',
      });

      res.json({
        success: true,
        message: 'Users retrieved successfully',
        data: users,
      } as ApiResponse<typeof users>);
    } catch (error) {
      next(error);
    }
  };

  getUserById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const user = await this.userService.getUserById(id);

      res.json({
        success: true,
        message: 'User retrieved successfully',
        data: user,
      } as ApiResponse<typeof user>);
    } catch (error) {
      next(error);
    }
  };

  updateUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const user = await this.userService.updateUser(id, req.body);

      res.json({
        success: true,
        message: 'User updated successfully',
        data: user,
      } as ApiResponse<typeof user>);
    } catch (error) {
      next(error);
    }
  };

  deactivateUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      await this.userService.deleteUser(id);

      res.json({
        success: true,
        message: 'User deactivated successfully',
        data: null,
      } as ApiResponse<null>);
    } catch (error) {
      next(error);
    }
  };

  // Role Management
  createRole = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const role = await this.userService.createRole({
        ...req.body,
        createdById: req.user!.id,
      });

      res.status(201).json({
        success: true,
        message: 'Role created successfully',
        data: role,
      } as ApiResponse<typeof role>);
    } catch (error) {
      next(error);
    }
  };

  getRoles = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { isActive, level } = req.query;

      const roles = await this.userService.getRoles({
        isActive: isActive === 'true',
        level: level ? parseInt(level as string) : undefined,
      });

      res.json({
        success: true,
        message: 'Roles retrieved successfully',
        data: roles,
      } as ApiResponse<typeof roles>);
    } catch (error) {
      next(error);
    }
  };

  getRoleById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const role = await this.userService.getRoleById(id);

      res.json({
        success: true,
        message: 'Role retrieved successfully',
        data: role,
      } as ApiResponse<typeof role>);
    } catch (error) {
      next(error);
    }
  };

  updateRole = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const role = await this.userService.updateRole(id, req.body);

      res.json({
        success: true,
        message: 'Role updated successfully',
        data: role,
      } as ApiResponse<typeof role>);
    } catch (error) {
      next(error);
    }
  };

  // Department Management
  createDepartment = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const department = await this.userService.createDepartment({
        ...req.body,
        createdById: req.user!.id,
      });

      res.status(201).json({
        success: true,
        message: 'Department created successfully',
        data: department,
      } as ApiResponse<typeof department>);
    } catch (error) {
      next(error);
    }
  };

  getDepartments = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { isActive, managerId } = req.query;

      const departments = await this.userService.getDepartments({
        isActive: isActive === 'true',
        managerId: managerId as string,
      });

      res.json({
        success: true,
        message: 'Departments retrieved successfully',
        data: departments,
      } as ApiResponse<typeof departments>);
    } catch (error) {
      next(error);
    }
  };

  // Attendance Management
  recordAttendance = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const attendance = await this.userService.recordAttendance({
        ...req.body,
        userId: req.body.userId || req.user!.id,
      });

      res.status(201).json({
        success: true,
        message: 'Attendance recorded successfully',
        data: attendance,
      } as ApiResponse<typeof attendance>);
    } catch (error) {
      next(error);
    }
  };

  getAttendance = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { userId, status, startDate, endDate } = req.query;

      const records = await this.userService.getAttendance({
        userId: userId as string,
        status: status as any,
        startDate: startDate ? new Date(startDate as string) : undefined,
        endDate: endDate ? new Date(endDate as string) : undefined,
      });

      res.json({
        success: true,
        message: 'Attendance records retrieved successfully',
        data: records,
      } as ApiResponse<typeof records>);
    } catch (error) {
      next(error);
    }
  };

  // Note: getAttendanceById and getAttendanceRecords methods are not implemented in UserService
  // They can be added later when needed

  updateAttendance = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const attendance = await this.userService.updateAttendance(id, req.body);

      res.json({
        success: true,
        message: 'Attendance updated successfully',
        data: attendance,
      } as ApiResponse<typeof attendance>);
    } catch (error) {
      next(error);
    }
  };

  // Payroll Management
  // Note: createPayrollRecord method is not implemented in UserService
  // It can be added later when needed

  generatePayroll = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const payroll = await this.userService.generatePayroll({
        ...req.body,
        generatedById: req.user!.id,
      });

      res.status(201).json({
        success: true,
        message: 'Payroll generated successfully',
        data: payroll,
      } as ApiResponse<typeof payroll>);
    } catch (error) {
      next(error);
    }
  };

  getPayrollRecords = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { userId, status, payPeriodStart, payPeriodEnd } = req.query;

      const records = await this.userService.getPayrolls({
        userId: userId as string,
        status: status as any,
        payPeriodStart: payPeriodStart ? new Date(payPeriodStart as string) : undefined,
        payPeriodEnd: payPeriodEnd ? new Date(payPeriodEnd as string) : undefined,
      });

      res.json({
        success: true,
        message: 'Payroll records retrieved successfully',
        data: records,
      } as ApiResponse<typeof records>);
    } catch (error) {
      next(error);
    }
  };

  approvePayroll = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const payroll = await this.userService.approvePayroll(id, req.user!.id);

      res.json({
        success: true,
        message: 'Payroll approved successfully',
        data: payroll,
      } as ApiResponse<typeof payroll>);
    } catch (error) {
      next(error);
    }
  };

  // Note: processPayroll method is not implemented in UserService
  // It can be added later when needed

  // Leave Management
  requestLeave = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const leave = await this.userService.requestLeave({
        ...req.body,
        requestedById: req.body.userId || req.user!.id,
      });

      res.status(201).json({
        success: true,
        message: 'Leave request submitted successfully',
        data: leave,
      } as ApiResponse<typeof leave>);
    } catch (error) {
      next(error);
    }
  };

  getLeaveRequests = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { userId, status, type, startDate, endDate } = req.query;

      const requests = await this.userService.getLeaves({
        userId: userId as string,
        status: status as any,
        type: type as any,
        startDate: startDate ? new Date(startDate as string) : undefined,
        endDate: endDate ? new Date(endDate as string) : undefined,
      });

      res.json({
        success: true,
        message: 'Leave requests retrieved successfully',
        data: requests,
      } as ApiResponse<typeof requests>);
    } catch (error) {
      next(error);
    }
  };

  approveLeave = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const leave = await this.userService.processLeave(
        id,
        req.body.decision || 'approved',
        req.user!.id,
        req.body.comments,
      );

      res.json({
        success: true,
        message: 'Leave request processed successfully',
        data: leave,
      } as ApiResponse<typeof leave>);
    } catch (error) {
      next(error);
    }
  };

  // Note: updateLeaveRequest method is not implemented in UserService
  // It can be added later when needed

  // Performance Management
  // Note: Performance review methods are not implemented in UserService
  // They can be added later when needed

  // Note: Performance review methods are not implemented in UserService
  // They can be added later when needed

  // Task Management
  // Note: Task management methods are not implemented in UserService
  // They can be added later when needed

  // Analytics and Reports
  // Note: Analytics methods are not implemented in UserService
  // They can be added later when needed

  getPayrollSummary = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { startDate, endDate, departmentId } = req.query;

      const summary = await this.userService.getPayrollSummary({
        startDate: startDate ? new Date(startDate as string) : undefined,
        endDate: endDate ? new Date(endDate as string) : undefined,
        departmentId: departmentId as string,
      });

      res.json({
        success: true,
        message: 'Payroll summary retrieved successfully',
        data: summary,
      } as ApiResponse<typeof summary>);
    } catch (error) {
      next(error);
    }
  };

  getLeaveAnalytics = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { startDate, endDate, departmentId } = req.query;

      const analytics = await this.userService.getLeaveAnalytics({
        startDate: startDate ? new Date(startDate as string) : undefined,
        endDate: endDate ? new Date(endDate as string) : undefined,
        departmentId: departmentId as string,
      });

      res.json({
        success: true,
        message: 'Leave analytics retrieved successfully',
        data: analytics,
      } as ApiResponse<typeof analytics>);
    } catch (error) {
      next(error);
    }
  };

  // User Profile
  getProfile = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const profile = await this.userService.getProfile(req.user!.id);

      res.json({
        success: true,
        message: 'Profile retrieved successfully',
        data: profile,
      } as ApiResponse<typeof profile>);
    } catch (error) {
      next(error);
    }
  };

  updateProfile = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const profile = await this.userService.updateProfile(req.user!.id, req.body);

      res.json({
        success: true,
        message: 'Profile updated successfully',
        data: profile,
      } as ApiResponse<typeof profile>);
    } catch (error) {
      next(error);
    }
  };
}
