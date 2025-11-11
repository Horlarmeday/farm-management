// Common types used across the farm management system
export interface DashboardStats {
  totalRevenue: number;
  activeBirds: number;
  fishHarvest: number;
  livestock: number;
  feedConsumption: number;
  mortalityRate: number;
  productionEfficiency: number;
  alertsList: AlertItem[];
  recentActivities: ActivityItem[];
}

export interface KPIData {
  title: string;
  value: string | number;
  subtitle?: string;
  trend?: {
    value: string;
    positive: boolean;
  };
  color?: 'primary' | 'yellow' | 'blue' | 'purple' | 'green' | 'red';
}

export interface ModuleData {
  title: string;
  description: string;
  icon: string;
  stats: Record<string, any>;
  image?: string;
}

export interface AlertItem {
  id: number;
  type: 'warning' | 'info' | 'error';
  title: string;
  description: string;
  color: 'red' | 'yellow' | 'blue' | 'green';
  timestamp: Date;
}

export interface ActivityItem {
  id: number;
  text: string;
  time: string;
  color: string;
  module?: string;
}

export interface TaskItem {
  id: number;
  text: string;
  completed: boolean;
  dueDate?: Date;
  assignedTo?: string;
  priority?: 'low' | 'medium' | 'high';
}

export interface InventoryStatus {
  label: string;
  status: 'Low' | 'Good' | 'Medium';
  color: string;
  currentStock?: number;
  reorderLevel?: number;
}

export interface FinanceItem {
  label: string;
  value: string;
  color: string;
  change?: {
    value: string;
    positive: boolean;
  };
}

export interface ReportConfig {
  module: string;
  dateRange?: {
    from: Date;
    to: Date;
  };
  format: 'pdf' | 'excel' | 'csv';
  type: string;
}

export interface SavedReport {
  name: string;
  description: string;
  lastGenerated: string;
  status: 'ready' | 'pending' | 'error';
  downloadUrl?: string;
}

// Form types for different modules
export interface BirdBatchForm {
  batchCode: string;
  birdType: 'layer' | 'broiler' | 'breeder';
  breed: string;
  quantity: number;
  arrivalDate: Date;
  source?: string;
  houseLocation?: string;
}

export interface AnimalForm {
  tagNumber: string;
  species: 'cow' | 'goat' | 'pig' | 'sheep';
  breed: string;
  gender: 'male' | 'female';
  dateOfBirth?: Date;
  acquisitionDate: Date;
  source?: string;
}

export interface PondForm {
  name: string;
  location?: string;
  type: 'earthen' | 'concrete' | 'tank';
  sizeM2: number;
  speciesStocked?: string;
  stockingDate?: Date;
  initialStockCount?: number;
}

export interface InventoryForm {
  itemName: string;
  category: 'feed' | 'medicine' | 'tools';
  unit: string;
  reorderLevel: number;
  currentStock: number;
  expiryDate?: Date;
  supplier?: string;
}

export interface SaleForm {
  itemType: 'egg' | 'bird' | 'fish' | 'meat' | 'crate';
  itemId?: number;
  date: Date;
  quantity: number;
  unitPrice: number;
  totalAmount: number;
  buyerName?: string;
}

export interface ExpenseForm {
  category: 'feed' | 'salary' | 'medicine' | 'utility';
  description: string;
  amount: number;
  date: Date;
  paymentMethod?: string;
}

// Navigation and layout types
export interface NavigationItem {
  name: string;
  href: string;
  icon: any;
  current?: boolean;
}

export interface PageHeaderProps {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
}

// Chart and analytics types
export interface ChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor?: string[];
    borderColor?: string;
    fill?: boolean;
  }[];
}

export interface AnalyticsMetric {
  name: string;
  value: number | string;
  change?: {
    value: number;
    type: 'increase' | 'decrease';
  };
  format?: 'currency' | 'percentage' | 'number';
}
