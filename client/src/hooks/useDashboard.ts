import { useQuery } from '@tanstack/react-query';
import { DashboardService, DashboardStats, KPIData, ModuleStats, DashboardOverview } from '@/services/dashboard.service';
import { queryKeys } from '@/lib/queryKeys';

/**
 * Hook to fetch complete dashboard overview data
 */
export function useDashboardOverview() {
  return useQuery({
    queryKey: queryKeys.dashboard.overview(),
    queryFn: DashboardService.getDashboardOverview,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
}

/**
 * Hook to fetch dashboard statistics
 */
export function useDashboardStats() {
  return useQuery({
    queryKey: queryKeys.dashboard.stats(),
    queryFn: DashboardService.getDashboardStats,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
}

/**
 * Hook to fetch KPI data
 */
export function useKPIData() {
  return useQuery({
    queryKey: queryKeys.dashboard.kpis(),
    queryFn: DashboardService.getKPIData,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
}

/**
 * Hook to fetch module statistics
 */
export function useModuleStats() {
  return useQuery({
    queryKey: queryKeys.dashboard.modules(),
    queryFn: DashboardService.getModuleStats,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
}

/**
 * Hook to fetch revenue trend data
 */
export function useRevenueTrend(period: 'week' | 'month' | 'quarter' | 'year' = 'month') {
  return useQuery({
    queryKey: queryKeys.dashboard.revenueTrend(period),
    queryFn: () => DashboardService.getRevenueTrend(period),
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
  });
}

/**
 * Hook to fetch production distribution data
 */
export function useProductionDistribution() {
  return useQuery({
    queryKey: queryKeys.dashboard.productionDistribution(),
    queryFn: DashboardService.getProductionDistribution,
    staleTime: 15 * 60 * 1000, // 15 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
  });
}

/**
 * Hook to fetch quick stats
 */
export function useQuickStats() {
  return useQuery({
    queryKey: queryKeys.dashboard.quickStats(),
    queryFn: DashboardService.getQuickStats,
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
}

/**
 * Hook to fetch recent activities
 */
export function useRecentActivities(limit: number = 10) {
  return useQuery({
    queryKey: queryKeys.dashboard.activities(limit),
    queryFn: () => DashboardService.getRecentActivities(limit),
    staleTime: 1 * 60 * 1000, // 1 minute
    gcTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Hook to fetch alerts
 */
export function useAlerts(limit: number = 10) {
  return useQuery({
    queryKey: queryKeys.dashboard.alerts(limit),
    queryFn: () => DashboardService.getAlerts(limit),
    staleTime: 30 * 1000, // 30 seconds
    gcTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Hook to fetch tasks
 */
export function useTasks() {
  return useQuery({
    queryKey: queryKeys.dashboard.tasks(),
    queryFn: () => DashboardService.getTasks(),
    staleTime: 1 * 60 * 1000, // 1 minute
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
}

/**
 * Combined hook for dashboard data with fallback to mock data
 * This provides a smooth transition from mock to real API data
 */
export function useDashboardData() {
  const statsQuery = useDashboardStats();
  const kpisQuery = useKPIData();
  const modulesQuery = useModuleStats();

  return {
    stats: statsQuery.data,
    kpis: kpisQuery.data,
    modules: modulesQuery.data,
    isLoading: statsQuery.isLoading || kpisQuery.isLoading || modulesQuery.isLoading,
    isError: statsQuery.isError || kpisQuery.isError || modulesQuery.isError,
    error: statsQuery.error || kpisQuery.error || modulesQuery.error,
    refetch: () => {
      statsQuery.refetch();
      kpisQuery.refetch();
      modulesQuery.refetch();
    },
  };
}