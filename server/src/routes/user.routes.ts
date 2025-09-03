import { Router } from 'express';
import { UserController } from '../controllers/UserController';
import { authenticate } from '../middleware/auth.middleware';
import { validate } from '../middleware/joiValidation.middleware';
import { userValidations } from '../validations/user.validations';

const router: Router = Router();
const userController = new UserController();

// Apply authentication to all routes
router.use(authenticate);

// User Management Routes
// Admin/HR user creation (uses AuthService logic)
router.post('/users', validate({ body: userValidations.createUser }), userController.createUser);

router.get(
  '/users/:id',
  validate({ params: userValidations.uuidParam }),
  userController.getUserById,
);

router.put(
  '/users/:id',
  validate({
    params: userValidations.uuidParam,
    body: userValidations.updateUser,
  }),
  userController.updateUser,
);

router.patch(
  '/users/:id/deactivate',
  validate({
    params: userValidations.uuidParam,
    body: userValidations.deactivateUser,
  }),
  userController.deactivateUser,
);

// Role Management Routes
router.post('/roles', validate({ body: userValidations.createRole }), userController.createRole);

router.get('/roles', validate({ query: userValidations.getRoles }), userController.getRoles);

router.get(
  '/roles/:id',
  validate({ params: userValidations.uuidParam }),
  userController.getRoleById,
);

// Department Management Routes
router.post(
  '/departments',
  validate({ body: userValidations.createDepartment }),
  userController.createDepartment,
);

router.get(
  '/departments',
  validate({ query: userValidations.getDepartments }),
  userController.getDepartments,
);

// Attendance Management Routes
router.post(
  '/attendance',
  validate({ body: userValidations.recordAttendance }),
  userController.recordAttendance,
);

// router.get(
//   '/attendance/:id',
//   validate({ params: userValidations.uuidParam }),
//   userController.getAttendanceById,
// );

router.get(
  '/attendance',
  validate({ query: userValidations.getAttendance }),
  userController.getAttendance,
);

// Leave Management Routes
router.post(
  '/leave',
  validate({ body: userValidations.requestLeave }),
  userController.requestLeave,
);

router.get(
  '/leave',
  validate({ query: userValidations.getLeaveRequests }),
  userController.getLeaveRequests,
);

router.put(
  '/leave/:id/approve',
  validate({
    params: userValidations.uuidParam,
    body: userValidations.approveLeave,
  }),
  userController.approveLeave,
);

// Payroll Management Routes
// router.post(
//   '/payroll',
//   validate({ body: userValidations.createPayrollRecord }),
//   userController.createPayrollRecord,
// );

router.get(
  '/payroll',
  validate({ query: userValidations.getPayrollRecords }),
  userController.getPayrollRecords,
);

// Performance Management Routes
// router.post(
//   '/performance',
//   validate({ body: userValidations.createPerformanceReview }),
//   userController.createPerformanceReview,
// );
//
// router.get(
//   '/performance',
//   validate({ query: userValidations.getPerformanceReviews }),
//   userController.getPerformanceReviews,
// );
//
// router.get(
//   '/performance/:id',
//   validate({ params: userValidations.uuidParam }),
//   userController.getPerformanceReviewById,
// );

// Task Management Routes
// router.post('/tasks', validate({ body: userValidations.createTask }), userController.createTask);
//
// router.get('/tasks', validate({ query: userValidations.getTasks }), userController.getTasks);

// router.put(
//   '/tasks/:id',
//   validate({
//     params: userValidations.uuidParam,
//     body: userValidations.updateTask,
//   }),
//   userController.updateTask,
// );

// Profile Management Routes
router.get('/profile', userController.getProfile);

router.put(
  '/profile',
  validate({ body: userValidations.updateProfile }),
  userController.updateProfile,
);

// Analytics and Reports Routes
// router.get(
//   '/analytics/attendance',
//   validate({ query: userValidations.getAttendanceAnalytics }),
//   userController.getAttendanceAnalytics,
// );
//
// router.get(
//   '/analytics/performance',
//   validate({ query: userValidations.getPerformanceAnalytics }),
//   userController.getPerformanceAnalytics,
// );

export default router;
