const fs = require('fs');
const path = require('path');

// List of files that need import fixes
const filesToFix = [
  'server/src/controllers/NotificationController.ts',
  'server/src/controllers/ReportingController.ts',
  'server/src/utils/jwt.ts',
  'server/src/entities/AssetDepreciation.ts',
  'server/src/entities/Leave.ts',
  'server/src/services/FarmService.ts',
  'server/src/middleware/auth.middleware.ts',
  'server/src/entities/Animal.ts',
  'server/src/middleware/farm-auth.ts',
  'server/src/entities/Alert.ts',
  'server/src/entities/Asset.ts',
  'server/src/entities/Notification.ts',
  'server/src/entities/NotificationSubscription.ts',
  'server/src/services/FinanceService.ts',
  'server/src/routes/poultry.routes.ts',
  'server/src/controllers/UserController.ts',
  'server/src/entities/FinancialTransaction.ts',
  'server/src/entities/Payment.ts',
  'server/src/services/reports.service.ts',
  'server/src/routes/livestock.routes.ts',
  'server/src/entities/MaintenanceRecord.ts',
  'server/src/services/FisheryService.ts',
  'server/src/entities/Task.ts',
  'server/src/controllers/LivestockController.ts',
  'server/src/entities/MaintenanceLog.ts',
  'server/src/services/ReportingService.ts',
  'server/src/entities/User.ts',
  'server/src/tests/inventory.test.ts',
  'server/src/routes/file.routes.ts',
  'server/src/routes/notifications.routes.ts',
  'server/src/test-data-isolation.ts',
  'server/src/routes/invitation.routes.ts',
  'server/src/tests/finance.test.ts',
  'server/src/entities/FarmUser.ts',
  'server/src/controllers/FisheryController.ts',
  'server/src/controllers/AssetController.ts',
  'server/src/entities/PurchaseOrder.ts',
  'server/src/tests/poultry.test.ts',
  'server/src/database/seeds/001-roles-permissions.seed.ts',
  'server/src/middleware/rateLimiter.middleware.ts',
  'server/src/services/InventoryService.ts',
  'server/src/controllers/PoultryController.ts',
  'server/src/tests/livestock.test.ts',
  'server/src/controllers/FinanceController.ts',
  'server/src/middleware/cache.middleware.ts',
  'server/src/tests/rbac-test.ts',
  'server/src/controllers/AuthController.ts',
  'server/src/entities/InventoryTransaction.ts',
  'server/src/entities/Account.ts',
  'server/src/services/NotificationService.ts',
  'server/src/entities/AttendanceRecord.ts',
  'server/src/entities/Attendance.ts',
  'server/src/entities/Receipt.ts',
  'server/src/entities/AnimalFeedingLog.ts',
  'server/src/entities/NotificationTemplate.ts',
  'server/src/entities/Invoice.ts',
  'server/src/services/invitation.service.ts',
  'server/src/entities/BudgetItem.ts',
  'server/src/entities/BirdBatch.ts',
  'server/src/services/UserService.ts',
  'server/src/entities/FarmInvitation.ts',
  'server/src/controllers/FileController.ts',
  'server/src/controllers/invitation.controller.ts',
  'server/src/tests/utils.ts',
  'server/src/middleware/auth.ts',
  'server/src/middleware/farm-auth.middleware.ts',
  'server/src/services/PoultryService.ts',
  'server/src/entities/Payroll.ts',
  'server/src/routes/fishery.routes.ts',
  'server/src/entities/Reminder.ts',
  'server/src/services/LivestockService.ts',
  'server/src/controllers/InventoryController.ts',
  'server/src/entities/ProfitLossItem.ts',
  'server/src/services/AssetService.ts',
  'server/src/entities/Pond.ts',
  'server/src/entities/ProductionLog.ts',
  'server/src/entities/PayrollRecord.ts',
  'server/src/entities/InventoryItem.ts',
  'server/src/controllers/IoTController.ts',
  'server/src/routes/crop.routes.ts'
];

function getRelativePath(filePath) {
  const depth = filePath.split('/').length - 2; // -2 for 'server' and 'src'
  return '../'.repeat(depth) + '../shared/src/types';
}

function fixImports() {
  filesToFix.forEach(filePath => {
    const fullPath = path.join(__dirname, filePath);
    
    if (!fs.existsSync(fullPath)) {
      console.log(`File not found: ${fullPath}`);
      return;
    }
    
    let content = fs.readFileSync(fullPath, 'utf8');
    const relativePath = getRelativePath(filePath);
    
    // Replace the import
    content = content.replace(
      /from ['"]@kuyash\/shared['"]/g,
      `from '${relativePath}'`
    );
    
    fs.writeFileSync(fullPath, content);
    console.log(`Fixed imports in: ${filePath}`);
  });
}

fixImports();
console.log('All imports fixed!');