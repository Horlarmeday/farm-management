import { queryKeys } from '@/lib/queryKeys';
import { apiClient } from './api';

// Dashboard Statistics Types
export interface DashboardStats {
  totalRevenue: number;
  activeBirds: number;
  fishHarvest: number;
  livestock: {
    count: number;
    milkProduction: number;
  };
  monthlyRevenue: number;
  monthlyExpenses: number;
  netProfit: number;
  feedConsumption: number;
  mortalityRate: number;
  productionEfficiency: number;
  eggProduction: {
    daily: number;
  };
  milkProduction: number;
  pondCount: number;
  activePonds: number;
  employeeCount: number;
  pendingTasks: number;
  completedTasks: number;
  lowStockItems: number;
  alerts: number;
  activeWorkers: number;
  activeFarms: number;
  fishery: {
    fishPopulation: number;
  };
  recentActivities: {
    id: number;
    text: string;
    time: string;
    color: string;
    module: string;
  }[];
  alertsList: {
    id: number;
    type: 'warning' | 'info' | 'error';
    title: string;
    description: string;
    color: string;
    timestamp: Date;
  }[];
}

export interface KPIData {
  totalRevenue: {
    value: number;
    trend: {
      value: string;
      positive: boolean;
    };
  };
  activeBirds: {
    value: number;
    growthRate: number;
  };
  fishHarvest: {
    value: number;
    unit: string;
    period: string;
  };
  livestock: {
    value: number;
    categories: {
      cattle: number;
      goats: number;
      sheep: number;
      pigs: number;
    };
  };
}

export interface ModuleStats {
  poultry: {
    layerHens: number;
    eggProduction: number;
    fcr: number;
  };
  livestock: {
    cattle: number;
    milkProduction: number;
    goats: number;
    sheep: number;
    pigs: number;
  };
  fishery: {
    activePonds: number;
    totalPonds: number;
    fishStock: number;
    monthlyHarvest: number;
    waterQuality: string;
  };
}

export interface DashboardOverview {
  stats: DashboardStats;
  kpis: KPIData;
  modules: ModuleStats;
}

const BASE_URL = '/api/reporting/dashboard';
/**
 * Dashboard Service
 * Handles all dashboard-related API calls
 */
export class DashboardService {
  /**
   * Get complete dashboard overview data
   */
  static async getDashboardOverview(): Promise<DashboardOverview> {
    const response = await apiClient.get<DashboardOverview>(`${BASE_URL}/overview`);
    if (!response.data) {
      throw new Error('Failed to fetch dashboard overview data');
    }
    return response.data;
  }

  /**
   * Get dashboard statistics
   */
  static async getDashboardStats(): Promise<DashboardStats> {
    const response = await apiClient.get<DashboardStats>(`${BASE_URL}`);
    if (!response.data) {
      throw new Error('Failed to fetch dashboard statistics');
    }
    return response.data;
  }

  /**
   * Get KPI data with trends
   */
  static async getKPIData(): Promise<KPIData> {
    const response = await apiClient.get<KPIData>(`${BASE_URL}/kpis`);
    if (!response.data) {
      throw new Error('Failed to fetch KPI data');
    }
    return response.data;
  }

  /**
   * Get module-specific statistics
   */
  static async getModuleStats(): Promise<ModuleStats> {
    const response = await apiClient.get<ModuleStats>(`${BASE_URL}/modules`);
    if (!response.data) {
      throw new Error('Failed to fetch module statistics');
    }
    return response.data;
  }

  /**
   * Get revenue trend data for charts
   */
  static async getRevenueTrend(period: 'week' | 'month' | 'quarter' | 'year' = 'month'): Promise<{
    labels: string[];
    data: number[];
  }> {
    const response = await apiClient.get(`${BASE_URL}/revenue-trend?period=${period}`);
    return response.data;
  }

  /**
   * Get production distribution data for charts
   */
  static async getProductionDistribution(): Promise<{
    labels: string[];
    data: number[];
  }> {
    const response = await apiClient.get(`${BASE_URL}/production-distribution`);
    return response.data;
  }

  /**
   * Get quick stats for dashboard widgets
   */
  static async getQuickStats(): Promise<{
    feedConsumption: { value: string; progress: number };
    mortalityRate: { value: string; progress: number };
    productionEfficiency: { value: string; progress: number };
  }> {
    const response = await apiClient.get(`${BASE_URL}/quick-stats`);
    return response.data;
  }

  /**
   * Get recent activities
   */
  static async getRecentActivities(limit: number = 10): Promise<
    {
      id: number;
      text: string;
      time: string;
      color: string;
      module: string;
    }[]
  > {
    const response = await apiClient.get(`${BASE_URL}/recent-activities?limit=${limit}`);
    return response.data;
  }

  /**
   * Get alerts data
   */
  static async getAlerts(limit: number = 10): Promise<
    {
      id: number;
      type: 'warning' | 'info' | 'error';
      title: string;
      description: string;
      color: string;
      timestamp: Date;
    }[]
  > {
    const response = await apiClient.get(`${BASE_URL}/alerts?limit=${limit}`);
    return response.data.map((alert: any) => ({
      ...alert,
      timestamp: new Date(alert.timestamp),
    }));
  }

  /**
   * Get tasks data
   */
  static async getTasks(limit: number = 10): Promise<{
    pending: number;
    completed: number;
    tasks: {
      id: number;
      text: string;
      completed: boolean;
      dueDate?: Date;
      priority: 'high' | 'medium' | 'low';
    }[];
  }> {
    const response = await apiClient.get(`${BASE_URL}/tasks?limit=${limit}`);
    return {
      ...response.data,
      tasks: response.data.tasks.map((task: any) => ({
        ...task,
        dueDate: task.dueDate ? new Date(task.dueDate) : undefined,
      })),
    };
  }

  /**
   * Get inventory summary for dashboard
   */
  static async getInventorySummary(): Promise<{
    feedStock: { status: string; count: number };
    medicines: { status: string; count: number };
    equipment: { status: string; count: number };
  }> {
    const response = await apiClient.get('/api/inventory/summary');
    return response.data;
  }

  /**
   * Get finance summary for dashboard
   */
  static async getFinanceSummary(): Promise<{
    monthlyRevenue: number;
    expenses: number;
    netProfit: number;
  }> {
    const response = await apiClient.get('/api/finance/summary');
    return response.data;
  }

  /**
   * Get tasks summary for dashboard
   */
  static async getTasksSummary(): Promise<{
    pending: number;
    completed: number;
    tasks: {
      id: number;
      text: string;
      completed: boolean;
      dueDate?: Date;
      priority: 'high' | 'medium' | 'low';
    }[];
  }> {
    const response = await apiClient.get(`${BASE_URL}/tasks?limit=10`);
    return {
      ...response.data,
      tasks: response.data.tasks.map((task: any) => ({
        ...task,
        dueDate: task.dueDate ? new Date(task.dueDate) : undefined,
      })),
    };
  }
}

// Export query keys for React Query
export const dashboardQueryKeys = queryKeys.dashboard;
