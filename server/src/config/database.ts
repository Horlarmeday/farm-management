import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { config } from './index';

// Import all entities
import { Account } from '../entities/Account';
import { Alert } from '../entities/Alert';
import { Animal } from '../entities/Animal';
import { AnimalHealthRecord } from '../entities/AnimalHealthRecord';
import { AnimalProductionLog } from '../entities/AnimalProductionLog';
import { AnimalSale } from '../entities/AnimalSale';
import { Asset } from '../entities/Asset';
import { AttendanceRecord } from '../entities/AttendanceRecord';
import { AuxiliaryProduction } from '../entities/AuxiliaryProduction';
import { BirdBatch } from '../entities/BirdBatch';
import { BirdFeedingLog } from '../entities/BirdFeedingLog';
import { BirdHealthRecord } from '../entities/BirdHealthRecord';
import { BirdSale } from '../entities/BirdSale';
import { BreedingRecord } from '../entities/BreedingRecord';
import { EggProductionLog } from '../entities/EggProductionLog';
import { FinancialTransaction } from '../entities/FinancialTransaction';
import { FinancialCategory } from '../entities/FinancialCategory';
import { FishFeedingLog } from '../entities/FishFeedingLog';
import { FishHarvestLog } from '../entities/FishHarvestLog';
import { FishSamplingLog } from '../entities/FishSamplingLog';
import { FishStockingLog } from '../entities/FishStockingLog';
import { InventoryItem } from '../entities/InventoryItem';
import { InventoryTransaction } from '../entities/InventoryTransaction';
import { Invoice } from '../entities/Invoice';
import { InvoiceItem } from '../entities/InvoiceItem';
import { Location } from '../entities/Location';
import { MaintenanceLog } from '../entities/MaintenanceLog';
import { Notification } from '../entities/Notification';
import { Payment } from '../entities/Payment';
import { PayrollRecord } from '../entities/PayrollRecord';
import { Permission } from '../entities/Permission';
import { Pond } from '../entities/Pond';
import { PurchaseOrder } from '../entities/PurchaseOrder';
import { PurchaseOrderItem } from '../entities/PurchaseOrderItem';
import { Role } from '../entities/Role';
import { Supplier } from '../entities/Supplier';
import { Task } from '../entities/Task';
import { TaskChecklistItem } from '../entities/TaskChecklistItem';
import { User } from '../entities/User';
import { WaterQualityLog } from '../entities/WaterQualityLog';
import { WeightRecord } from '../entities/WeightRecord';

// Import new entities
import { AnimalFeedingLog } from '../entities/AnimalFeedingLog';
import { AssetDepreciation } from '../entities/AssetDepreciation';
import { Attendance } from '../entities/Attendance';
import { Budget, BudgetCategory } from '../entities/Budget';
import { BudgetItem } from '../entities/BudgetItem';
import { CashFlow } from '../entities/CashFlow';
import { CostCenter } from '../entities/CostCenter';
import { Department } from '../entities/Department';
import { Farm } from '../entities/Farm';
import { FarmUser } from '../entities/FarmUser';
import { FarmInvitation } from '../entities/FarmInvitation';
import { FishHarvest } from '../entities/FishHarvest';
import { FishSale } from '../entities/FishSale';
import { FishStock } from '../entities/FishStock';
import { Leave } from '../entities/Leave';
import { MaintenanceRecord } from '../entities/MaintenanceRecord';
import { NotificationLog } from '../entities/NotificationLog';
import { NotificationSubscription } from '../entities/NotificationSubscription';
import { NotificationTemplate } from '../entities/NotificationTemplate';
import { PasswordResetToken } from '../entities/PasswordResetToken';
import { Payroll } from '../entities/Payroll';
import { ProductionLog } from '../entities/ProductionLog';
import { ProfitLossItem } from '../entities/ProfitLossItem';
import { ProfitLossReport } from '../entities/ProfitLossReport';
import { Receipt } from '../entities/Receipt';
import { Reminder } from '../entities/Reminder';
import { Report } from '../entities/Report';
import { ReportExport } from '../entities/ReportExport';
import { ReportSchedule } from '../entities/ReportSchedule';
import { ReportTemplate } from '../entities/ReportTemplate';
import { UserSession } from '../entities/UserSession';

// Import Phase 3 entities
import { PushSubscription } from '../entities/PushSubscription';
import { NotificationPreference } from '../entities/NotificationPreference';
import { IoTSensor } from '../entities/IoTSensor';
import { SensorReading } from '../entities/SensorReading';
import { Prediction } from '../entities/Prediction';
import { SyncQueue } from '../entities/SyncQueue';
import { OfflineData } from '../entities/OfflineData';

// Create the data source
export const AppDataSource = new DataSource({
  type: config.database.type as 'mysql',
  host: config.database.host,
  port: config.database.port,
  username: config.database.username,
  password: config.database.password,
  database: config.database.name,
  synchronize: config.database.synchronize,
  logging: config.database.logging,
  ssl: config.database.ssl,
  entities: [
    // Core entities
    User,
    Role,
    Permission,
    Location,
    Farm,
    FarmUser,
    FarmInvitation,

    // HR entities
    AttendanceRecord,
    PayrollRecord,
    Department,
    Attendance,
    Payroll,
    Leave,
    UserSession,
    PasswordResetToken,

    // Poultry entities
    BirdBatch,
    BirdFeedingLog,
    BirdHealthRecord,
    EggProductionLog,
    BirdSale,

    // Livestock entities
    Animal,
    AnimalHealthRecord,
    BreedingRecord,
    AnimalProductionLog,
    WeightRecord,
    AnimalSale,
    ProductionLog,
    AnimalFeedingLog,

    // Fishery entities
    Pond,
    FishStockingLog,
    WaterQualityLog,
    FishFeedingLog,
    FishSamplingLog,
    FishHarvestLog,
    FishStock,
    FishHarvest,
    FishSale,

    // Inventory entities
    InventoryItem,
    InventoryTransaction,
    Supplier,
    PurchaseOrder,
    PurchaseOrderItem,

    // Finance entities
    FinancialTransaction,
    FinancialCategory,
    Account,
    Invoice,
    InvoiceItem,
    Payment,
    Receipt,
    Budget,
    BudgetCategory,
    BudgetItem,
    CostCenter,
    ProfitLossReport,
    ProfitLossItem,
    CashFlow,

    // Asset entities
    Asset,
    MaintenanceLog,
    AuxiliaryProduction,
    MaintenanceRecord,
    AssetDepreciation,

    // Notification entities
    Notification,
    Task,
    TaskChecklistItem,
    Alert,
    NotificationTemplate,
    NotificationSubscription,
    NotificationLog,
    Reminder,

    // Reporting entities
    Report,
    ReportTemplate,
    ReportSchedule,
    ReportExport,

    // Phase 3 entities
    PushSubscription,
    NotificationPreference,
    IoTSensor,
    SensorReading,
    Prediction,
    SyncQueue,
    OfflineData,
  ],
  migrations: ['src/database/migrations/*.ts'],
  subscribers: ['src/database/subscribers/*.ts'],
  // cache: {
  //   type: 'redis',
  //   options: {
  //     host: config.redis.host,
  //     port: config.redis.port,
  //     password: config.redis.password,
  //     db: config.redis.db,
  //   },
  // },
});

// Initialize database connection
export const initializeDatabase = async (): Promise<void> => {
  try {
    await AppDataSource.initialize();
    console.log('✅ Database connection established successfully');

    // Run migrations in production
    // if (config.isProduction) {
    //   await AppDataSource.runMigrations();
    //   console.log('✅ Database migrations completed');
    // }
  } catch (error) {
    console.error('❌ Error during database initialization:', error);
    throw error;
  }
};

// Close database connection
export const closeDatabase = async (): Promise<void> => {
  try {
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
      console.log('✅ Database connection closed successfully');
    }
  } catch (error) {
    console.error('❌ Error closing database connection:', error);
    throw error;
  }
};

// export default AppDataSource;
