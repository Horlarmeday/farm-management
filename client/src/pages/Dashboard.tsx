import KPICards from '@/components/dashboard/KPICards';
import { Button } from '@/components/ui/button';
import { useDashboardData } from '@/hooks/useDashboard';
import { BarChart3, Bird, Dog, Download, Fish, Plus } from 'lucide-react';
import React, { Suspense, memo } from 'react';

// Lazy load heavy dashboard components
const AlertsWidget = React.lazy(() =>
  import('@/components/dashboard/AlertsWidget').then((module) => ({
    default: module.AlertsWidget,
  })),
);
const BottomModules = React.lazy(() => import('@/components/dashboard/BottomModules'));
const KPICard = React.lazy(() => import('@/components/dashboard/KPICard'));
const ModuleCard = React.lazy(() => import('@/components/dashboard/ModuleCard'));
const QuickStats = React.lazy(() => import('@/components/dashboard/QuickStats'));
const RecentActivities = React.lazy(() => import('@/components/dashboard/RecentActivities'));

const Dashboard = memo(function Dashboard() {
  // Use dashboard data with API integration and fallback to mock data
  const { stats, modules, isLoading, isError, error } = useDashboardData();

  if (isLoading) {
    return (
      <div className="max-w-full mx-auto px-6 py-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg text-muted-foreground">Loading dashboard...</div>
        </div>
      </div>
    );
  }

  if (isError) {
    // API error handled by React Query error boundary
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30 transition-all duration-500">
      <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 animate-in fade-in duration-700">
        {/* Professional Header Section */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200/60 p-6 mb-8">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg flex items-center justify-center">
                  <BarChart3 className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl lg:text-3xl font-bold text-slate-900 tracking-tight">
                    Dashboard
                  </h1>
                  <p className="text-slate-600 text-sm lg:text-base font-medium">
                    Welcome back! Here's what's happening on your farm today.
                  </p>
                </div>
              </div>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button
                size="sm"
                className="bg-blue-600 hover:bg-blue-700 text-white shadow-md hover:shadow-lg transition-all duration-200 font-medium transform hover:scale-105 active:scale-95"
              >
                <Plus className="h-4 w-4 mr-2 transition-transform duration-200 group-hover:rotate-90" />
                Add Farm
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="border-slate-300 text-slate-700 hover:bg-slate-50 shadow-sm hover:shadow-md transition-all duration-200 font-medium transform hover:scale-105 active:scale-95"
              >
                <Download className="h-4 w-4 mr-2 transition-transform duration-200 group-hover:translate-y-0.5" />
                Quick Add
              </Button>
            </div>
          </div>
        </div>

        {/* Modern KPI Cards with Enhanced Design */}
        <KPICards stats={stats || null} />

        {/* Management Cards - 3 Column Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {/* Poultry Management Card */}
          <div className="group bg-white rounded-xl shadow-sm hover:shadow-xl border border-slate-200/60 hover:border-emerald-200 transition-all duration-300 overflow-hidden cursor-pointer transform hover:scale-[1.02] animate-in slide-in-from-left-4 fade-in duration-600 delay-700 min-h-[320px] flex flex-col">
            <div className="p-4 sm:p-6 flex-1">
              <div className="flex items-center justify-between mb-4">
                <div className="w-14 h-14 bg-gradient-to-br from-amber-100 to-amber-200 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                  <Bird className="h-7 w-7 text-amber-600" />
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-slate-900">
                    {stats?.activeBirds?.toLocaleString() || '0'}
                  </p>
                  <p className="text-xs text-slate-500 font-medium">Active Birds</p>
                </div>
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Poultry Management</h3>
              <p className="text-sm text-slate-600 mb-4">Track birds, eggs, and health records</p>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-slate-500">Egg Production</span>
                  <span className="text-sm font-semibold text-slate-700">
                    {stats?.eggProduction?.daily?.toLocaleString() || '0'}/day
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-slate-500">Health Score</span>
                  <span className="text-sm font-semibold text-emerald-600">98%</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2 mt-3">
                  <div
                    className="bg-gradient-to-r from-amber-500 to-amber-600 h-2 rounded-full"
                    style={{ width: '98%' }}
                  ></div>
                </div>
              </div>
            </div>
            <div className="px-4 sm:px-6 py-3 bg-slate-50 border-t border-slate-100 mt-auto">
              <button className="text-sm font-medium text-amber-600 hover:text-amber-700 transition-colors duration-200">
                View Details →
              </button>
            </div>
          </div>

          {/* Livestock Management Card */}
          <div className="group bg-white rounded-xl shadow-sm hover:shadow-xl border border-slate-200/60 hover:border-purple-200 transition-all duration-300 overflow-hidden cursor-pointer transform hover:scale-[1.02] animate-in slide-in-from-left-4 fade-in duration-600 delay-800 min-h-[320px] flex flex-col">
            <div className="p-4 sm:p-6 flex-1">
              <div className="flex items-center justify-between mb-4">
                <div className="w-14 h-14 bg-gradient-to-br from-purple-100 to-purple-200 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                  <Dog className="h-7 w-7 text-purple-600" />
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-slate-900">
                    {stats?.livestock?.count?.toLocaleString() || '0'}
                  </p>
                  <p className="text-xs text-slate-500 font-medium">Livestock</p>
                </div>
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Livestock Management</h3>
              <p className="text-sm text-slate-600 mb-4">Monitor cattle, goats, and sheep</p>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-slate-500">Milk Production</span>
                  <span className="text-sm font-semibold text-slate-700">
                    {stats?.livestock?.milkProduction || '0'}L/day
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-slate-500">Health Status</span>
                  <span className="text-sm font-semibold text-emerald-600">95%</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2 mt-3">
                  <div
                    className="bg-gradient-to-r from-purple-500 to-purple-600 h-2 rounded-full"
                    style={{ width: '95%' }}
                  ></div>
                </div>
              </div>
            </div>
            <div className="px-4 sm:px-6 py-3 bg-slate-50 border-t border-slate-100 mt-auto">
              <button className="text-sm font-medium text-purple-600 hover:text-purple-700 transition-colors duration-200">
                View Details →
              </button>
            </div>
          </div>

          {/* Fishery Management Card */}
          <div className="group bg-white rounded-xl shadow-sm hover:shadow-xl border border-slate-200/60 hover:border-blue-200 transition-all duration-300 overflow-hidden cursor-pointer transform hover:scale-[1.02] animate-in slide-in-from-left-4 fade-in duration-600 delay-900 min-h-[320px] flex flex-col">
            <div className="p-4 sm:p-6 flex-1">
              <div className="flex items-center justify-between mb-4">
                <div className="w-14 h-14 bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                  <Fish className="h-7 w-7 text-blue-600" />
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-slate-900">12</p>
                  <p className="text-xs text-slate-500 font-medium">Active Ponds</p>
                </div>
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Fishery Management</h3>
              <p className="text-sm text-slate-600 mb-4">Manage fish ponds and aquaculture</p>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-slate-500">Fish Stock</span>
                  <span className="text-sm font-semibold text-slate-700">
                    {stats?.fishery?.fishPopulation?.toLocaleString() || '0'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-slate-500">Harvest Ready</span>
                  <span className="text-sm font-semibold text-blue-600">2,100 kg</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2 mt-3">
                  <div
                    className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full"
                    style={{ width: '85%' }}
                  ></div>
                </div>
              </div>
            </div>
            <div className="px-4 sm:px-6 py-3 bg-slate-50 border-t border-slate-100 mt-auto">
              <button className="text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors duration-200">
                View Details →
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Modules */}
        <div className="mt-8">
          <Suspense
            fallback={
              <div className="flex items-center justify-center p-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            }
          >
            <BottomModules />
          </Suspense>
        </div>
      </div>
    </div>
  );
});

export default Dashboard;
