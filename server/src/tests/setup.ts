import { DataSource } from 'typeorm';
import { config } from '../config';

let testDataSource: DataSource;

beforeAll(async () => {
  // Set test environment
  process.env.NODE_ENV = 'test';
  process.env.DB_NAME = 'kuyash_fms_test';
  process.env.DB_SYNCHRONIZE = 'true';
  process.env.DB_DROP_SCHEMA = 'true';
  process.env.RATE_LIMIT_WINDOW_MS = '60000';
  process.env.RATE_LIMIT_MAX_REQUESTS = '1000';

  // Import entities
  const { Account } = await import('../entities/Account');
  const { Alert } = await import('../entities/Alert');
  const { Animal } = await import('../entities/Animal');
  const { AnimalHealthRecord } = await import('../entities/AnimalHealthRecord');
  const { AnimalProductionLog } = await import('../entities/AnimalProductionLog');
  const { AnimalSale } = await import('../entities/AnimalSale');
  const { Asset } = await import('../entities/Asset');
  const { AttendanceRecord } = await import('../entities/AttendanceRecord');
  const { AuxiliaryProduction } = await import('../entities/AuxiliaryProduction');
  const { BaseEntity } = await import('../entities/BaseEntity');
  const { BirdBatch } = await import('../entities/BirdBatch');
  const { BirdFeedingLog } = await import('../entities/BirdFeedingLog');
  const { BirdHealthRecord } = await import('../entities/BirdHealthRecord');
  const { BirdSale } = await import('../entities/BirdSale');
  const { BreedingRecord } = await import('../entities/BreedingRecord');
  const { EggProductionLog } = await import('../entities/EggProductionLog');
  const { FinancialTransaction } = await import('../entities/FinancialTransaction');
  const { FishFeedingLog } = await import('../entities/FishFeedingLog');
  const { FishHarvestLog } = await import('../entities/FishHarvestLog');
  const { FishSamplingLog } = await import('../entities/FishSamplingLog');
  const { FishStockingLog } = await import('../entities/FishStockingLog');
  const { InventoryItem } = await import('../entities/InventoryItem');
  const { InventoryTransaction } = await import('../entities/InventoryTransaction');
  const { Invoice } = await import('../entities/Invoice');
  const { InvoiceItem } = await import('../entities/InvoiceItem');
  const { Location } = await import('../entities/Location');
  const { MaintenanceLog } = await import('../entities/MaintenanceLog');
  const { Notification } = await import('../entities/Notification');
  const { Payment } = await import('../entities/Payment');
  const { PayrollRecord } = await import('../entities/PayrollRecord');
  const { Permission } = await import('../entities/Permission');
  const { Pond } = await import('../entities/Pond');
  const { PurchaseOrder } = await import('../entities/PurchaseOrder');
  const { PurchaseOrderItem } = await import('../entities/PurchaseOrderItem');
  const { Role } = await import('../entities/Role');
  const { Supplier } = await import('../entities/Supplier');
  const { Task } = await import('../entities/Task');
  const { User } = await import('../entities/User');
  const { WaterQualityLog } = await import('../entities/WaterQualityLog');
  const { WeightRecord } = await import('../entities/WeightRecord');

  // Additional entities
  const { Report } = await import('../entities/Report');
  const { ReportTemplate } = await import('../entities/ReportTemplate');
  const { ReportSchedule } = await import('../entities/ReportSchedule');
  const { ReportExport } = await import('../entities/ReportExport');
  const { NotificationTemplate } = await import('../entities/NotificationTemplate');
  const { NotificationSubscription } = await import('../entities/NotificationSubscription');
  const { NotificationLog } = await import('../entities/NotificationLog');
  const { Reminder } = await import('../entities/Reminder');
  const { Receipt } = await import('../entities/Receipt');
  const { Budget } = await import('../entities/Budget');
  const { BudgetItem } = await import('../entities/BudgetItem');
  const { CostCenter } = await import('../entities/CostCenter');
  const { ProfitLossReport } = await import('../entities/ProfitLossReport');
  const { ProfitLossItem } = await import('../entities/ProfitLossItem');
  const { CashFlow } = await import('../entities/CashFlow');
  const { Department } = await import('../entities/Department');
  const { Attendance } = await import('../entities/Attendance');
  const { Payroll } = await import('../entities/Payroll');
  const { Leave } = await import('../entities/Leave');
  const { UserSession } = await import('../entities/UserSession');
  const { PasswordResetToken } = await import('../entities/PasswordResetToken');
  const { ProductionLog } = await import('../entities/ProductionLog');
  const { AnimalFeedingLog } = await import('../entities/AnimalFeedingLog');
  const { FishSale } = await import('../entities/FishSale');
  const { MaintenanceRecord } = await import('../entities/MaintenanceRecord');
  const { AssetDepreciation } = await import('../entities/AssetDepreciation');

  // Create test database connection
  testDataSource = new DataSource({
    type: 'mysql',
    host: config.database.host,
    port: config.database.port,
    username: config.database.username,
    password: config.database.password,
    database: 'kuyash_fms_test',
    synchronize: true,
    dropSchema: true,
    logging: false,
    entities: [
      Account,
      Alert,
      Animal,
      AnimalHealthRecord,
      AnimalProductionLog,
      AnimalSale,
      Asset,
      AttendanceRecord,
      AuxiliaryProduction,
      BirdBatch,
      BirdFeedingLog,
      BirdHealthRecord,
      BirdSale,
      BreedingRecord,
      EggProductionLog,
      FinancialTransaction,
      FishFeedingLog,
      FishHarvestLog,
      FishSamplingLog,
      FishStockingLog,
      InventoryItem,
      InventoryTransaction,
      Invoice,
      InvoiceItem,
      Location,
      MaintenanceLog,
      Notification,
      Payment,
      PayrollRecord,
      Permission,
      Pond,
      PurchaseOrder,
      PurchaseOrderItem,
      Role,
      Supplier,
      Task,
      User,
      WaterQualityLog,
      WeightRecord,
      Report,
      ReportTemplate,
      ReportSchedule,
      ReportExport,
      NotificationTemplate,
      NotificationSubscription,
      NotificationLog,
      Reminder,
      Receipt,
      Budget,
      BudgetItem,
      CostCenter,
      ProfitLossReport,
      ProfitLossItem,
      CashFlow,
      Department,
      Attendance,
      Payroll,
      Leave,
      UserSession,
      PasswordResetToken,
      ProductionLog,
      AnimalFeedingLog,
      FishSale,
      MaintenanceRecord,
      AssetDepreciation,
    ],
  });

  await testDataSource.initialize();
});

afterAll(async () => {
  if (testDataSource && testDataSource.isInitialized) {
    await testDataSource.destroy();
  }
});

export { testDataSource };
