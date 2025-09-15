import { AlertsWidget } from '@/components/dashboard/AlertsWidget';
import BottomModules from '@/components/dashboard/BottomModules';
import KPICard from '@/components/dashboard/KPICard';
import ModuleCard from '@/components/dashboard/ModuleCard';
import QuickStats from '@/components/dashboard/QuickStats';
import RecentActivities from '@/components/dashboard/RecentActivities';
import { Button } from '@/components/ui/button';
import { useDashboardData } from '@/hooks/useDashboard';
import { formatNaira as formatCurrency } from '@/lib/currency';
import { 
  Bird, 
  Dog, 
  DollarSign, 
  Download, 
  Fish, 
  Plus, 
  TrendingUp, 
  AlertTriangle,
  Activity,
  BarChart3,
  Users,
  AlertCircle,
  Info,
  Clock,
  CheckCircle,
  Heart,
  Package
} from 'lucide-react';

export default function Dashboard() {
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-8">
          {/* Total Animals Card */}
          <div className="group bg-white rounded-xl p-6 shadow-sm hover:shadow-lg border border-slate-200/60 hover:border-blue-200 transition-all duration-300 cursor-pointer animate-in slide-in-from-bottom-4 fade-in duration-500 delay-100">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center group-hover:bg-blue-200 transition-colors duration-200">
                    <Activity className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-600">Total Animals</p>
                    <p className="text-2xl font-bold text-slate-900">
                      {((stats?.activeBirds || 0) + (stats?.livestock || 0)).toLocaleString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1 text-sm">
                  <TrendingUp className="h-4 w-4 text-emerald-500" />
                  <span className="text-emerald-600 font-medium">+12%</span>
                  <span className="text-slate-500">from last month</span>
                </div>
              </div>
            </div>
          </div>

          {/* Active Farms Card */}
          <div className="group bg-white rounded-xl p-6 shadow-sm hover:shadow-lg border border-slate-200/60 hover:border-emerald-200 transition-all duration-300 cursor-pointer animate-in slide-in-from-bottom-4 fade-in duration-500 delay-200">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center group-hover:bg-emerald-200 transition-colors duration-200">
                    <Bird className="h-6 w-6 text-emerald-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-600">Active Farms</p>
                    <p className="text-2xl font-bold text-slate-900">{stats?.activeFarms?.toLocaleString() || '0'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1 text-sm">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                  <span className="text-emerald-600 font-medium">All operational</span>
                </div>
              </div>
            </div>
          </div>

          {/* Revenue Card */}
          <div className="group bg-white rounded-xl p-6 shadow-sm hover:shadow-lg border border-slate-200/60 hover:border-amber-200 transition-all duration-300 cursor-pointer animate-in slide-in-from-bottom-4 fade-in duration-500 delay-300">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center group-hover:bg-amber-200 transition-colors duration-200">
                    <DollarSign className="h-6 w-6 text-amber-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-600">Monthly Revenue</p>
                    <p className="text-2xl font-bold text-slate-900">
                      {formatCurrency(stats?.totalRevenue || 0)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1 text-sm">
                  <TrendingUp className="h-4 w-4 text-emerald-500" />
                  <span className="text-emerald-600 font-medium">+8%</span>
                  <span className="text-slate-500">from last month</span>
                </div>
              </div>
            </div>
          </div>

          {/* Alerts Card */}
          <div className="group bg-white rounded-xl p-6 shadow-sm hover:shadow-lg border border-slate-200/60 hover:border-red-200 transition-all duration-300 cursor-pointer animate-in slide-in-from-bottom-4 fade-in duration-500 delay-500">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center group-hover:bg-red-200 transition-colors duration-200">
                    <AlertTriangle className="h-6 w-6 text-red-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-600">Active Alerts</p>
                    <p className="text-2xl font-bold text-slate-900">{stats?.alerts?.toLocaleString() || '0'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1 text-sm">
                  <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                  <span className="text-red-600 font-medium">{stats?.alerts && stats.alerts > 0 ? 'Requires attention' : 'All clear'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Dashboard Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
          {/* Left Column - Main Content */}
          <div className="xl:col-span-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
              {/* Poultry Management Card */}
              <div className="group bg-white rounded-xl shadow-sm hover:shadow-xl border border-slate-200/60 hover:border-emerald-200 transition-all duration-300 overflow-hidden cursor-pointer transform hover:scale-[1.02] animate-in slide-in-from-left-4 fade-in duration-600 delay-700 min-h-[320px] flex flex-col">
                <div className="p-4 sm:p-6 flex-1">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-14 h-14 bg-gradient-to-br from-amber-100 to-amber-200 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                      <Bird className="h-7 w-7 text-amber-600" />
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-slate-900">{stats?.activeBirds?.toLocaleString() || '0'}</p>
                      <p className="text-xs text-slate-500 font-medium">Active Birds</p>
                    </div>
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 mb-2">Poultry Management</h3>
                  <p className="text-sm text-slate-600 mb-4">Track birds, eggs, and health records</p>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-slate-500">Egg Production</span>
                      <span className="text-sm font-semibold text-slate-700">{stats?.eggProduction?.daily?.toLocaleString() || '0'}/day</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-slate-500">Health Score</span>
                      <span className="text-sm font-semibold text-emerald-600">98%</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2 mt-3">
                      <div className="bg-gradient-to-r from-amber-500 to-amber-600 h-2 rounded-full" style={{width: '98%'}}></div>
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
                      <p className="text-2xl font-bold text-slate-900">{stats?.livestock?.toLocaleString() || '0'}</p>
                      <p className="text-xs text-slate-500 font-medium">Livestock</p>
                    </div>
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 mb-2">Livestock Management</h3>
                  <p className="text-sm text-slate-600 mb-4">Monitor cattle, goats, and sheep</p>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-slate-500">Milk Production</span>
                      <span className="text-sm font-semibold text-slate-700">{stats?.livestock?.milkProduction || '0'}L/day</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-slate-500">Health Status</span>
                      <span className="text-sm font-semibold text-emerald-600">95%</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2 mt-3">
                      <div className="bg-gradient-to-r from-purple-500 to-purple-600 h-2 rounded-full" style={{width: '95%'}}></div>
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
              <div className="group bg-white rounded-xl shadow-sm hover:shadow-xl border border-slate-200/60 hover:border-blue-200 transition-all duration-300 overflow-hidden cursor-pointer transform hover:scale-[1.02] animate-in slide-in-from-left-4 fade-in duration-600 delay-900 min-h-[320px] flex flex-col sm:col-span-2 lg:col-span-1">
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
                      <span className="text-sm font-semibold text-slate-700">{stats?.fishery?.fishPopulation?.toLocaleString() || '0'}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-slate-500">Harvest Ready</span>
                      <span className="text-sm font-semibold text-blue-600">2,100 kg</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2 mt-3">
                      <div className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full" style={{width: '85%'}}></div>
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
          </div>

          {/* Right Column - Enhanced Widgets */}
          <div className="xl:col-span-1">
            <div className="space-y-4 sm:space-y-6">
              {/* Quick Stats Widget */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200/60 p-4 sm:p-6 animate-in slide-in-from-right-4 fade-in duration-600 delay-1000">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-slate-900">Quick Stats</h3>
                  <TrendingUp className="h-5 w-5 text-emerald-600" />
                </div>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-emerald-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center">
                        <DollarSign className="h-4 w-4 text-emerald-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-700">Revenue</p>
                        <p className="text-xs text-slate-500">This month</p>
                      </div>
                    </div>
                    <p className="text-lg font-bold text-emerald-700">{formatCurrency(stats?.monthlyRevenue || stats?.totalRevenue || 0)}</p>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                        <Activity className="h-4 w-4 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-700">Production</p>
                        <p className="text-xs text-slate-500">Daily avg</p>
                      </div>
                    </div>
                    <p className="text-lg font-bold text-blue-700">{stats?.productionEfficiency || '95'}%</p>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-amber-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center">
                        <Users className="h-4 w-4 text-amber-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-700">Workers</p>
                        <p className="text-xs text-slate-500">Active today</p>
                      </div>
                    </div>
                    <p className="text-lg font-bold text-amber-700">{stats?.activeWorkers?.toLocaleString() || '28'}</p>
                  </div>
                </div>
              </div>

              {/* Alerts Widget */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200/60 p-4 sm:p-6 animate-in slide-in-from-right-4 fade-in duration-600 delay-1100">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-slate-900">Active Alerts</h3>
                  <div className="w-6 h-6 bg-red-100 rounded-full flex items-center justify-center">
                    <span className="text-xs font-bold text-red-600">{stats?.alertsList?.length || stats?.alerts || 3}</span>
                  </div>
                </div>
                <div className="space-y-3">
                  {stats?.alertsList && stats.alertsList.length > 0 ? (
                    stats.alertsList.map((alert: any, index: number) => (
                      <div key={index} className={`flex items-start space-x-3 p-3 rounded-lg border-l-4 ${
                        alert.priority === 'critical' ? 'bg-red-50 border-red-400' :
                        alert.priority === 'warning' ? 'bg-amber-50 border-amber-400' :
                        'bg-blue-50 border-blue-400'
                      }`}>
                        {alert.priority === 'critical' ? (
                          <AlertTriangle className="h-4 w-4 text-red-600 mt-0.5" />
                        ) : alert.priority === 'warning' ? (
                          <AlertCircle className="h-4 w-4 text-amber-600 mt-0.5" />
                        ) : (
                          <Info className="h-4 w-4 text-blue-600 mt-0.5" />
                        )}
                        <div className="flex-1">
                          <p className={`text-sm font-medium ${
                            alert.priority === 'critical' ? 'text-red-800' :
                            alert.priority === 'warning' ? 'text-amber-800' :
                            'text-blue-800'
                          }`}>{alert.title}</p>
                          <p className={`text-xs ${
                            alert.priority === 'critical' ? 'text-red-600' :
                            alert.priority === 'warning' ? 'text-amber-600' :
                            'text-blue-600'
                          }`}>{alert.description}</p>
                          <p className="text-xs text-slate-500 mt-1">{alert.timestamp}</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <>
                      <div className="flex items-start space-x-3 p-3 bg-red-50 rounded-lg border-l-4 border-red-400">
                        <AlertTriangle className="h-4 w-4 text-red-600 mt-0.5" />
                        <div className="flex-1">
                          <p className="text-sm font-medium text-red-800">Low Feed Stock</p>
                          <p className="text-xs text-red-600">Poultry section needs restocking</p>
                          <p className="text-xs text-slate-500 mt-1">2 hours ago</p>
                        </div>
                      </div>
                      <div className="flex items-start space-x-3 p-3 bg-amber-50 rounded-lg border-l-4 border-amber-400">
                        <AlertCircle className="h-4 w-4 text-amber-600 mt-0.5" />
                        <div className="flex-1">
                          <p className="text-sm font-medium text-amber-800">Health Check Due</p>
                          <p className="text-xs text-amber-600">Cattle vaccination scheduled</p>
                          <p className="text-xs text-slate-500 mt-1">5 hours ago</p>
                        </div>
                      </div>
                      <div className="flex items-start space-x-3 p-3 bg-blue-50 rounded-lg border-l-4 border-blue-400">
                        <Info className="h-4 w-4 text-blue-600 mt-0.5" />
                        <div className="flex-1">
                          <p className="text-sm font-medium text-blue-800">Water Quality</p>
                          <p className="text-xs text-blue-600">Pond 3 pH levels optimal</p>
                          <p className="text-xs text-slate-500 mt-1">1 day ago</p>
                        </div>
                      </div>
                    </>
                  )}
                </div>
                <button className="w-full mt-4 text-sm font-medium text-slate-600 hover:text-slate-800 transition-colors duration-200">
                  View All Alerts
                </button>
              </div>

              {/* Recent Activities Widget */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200/60 p-4 sm:p-6 animate-in slide-in-from-right-4 fade-in duration-600 delay-1200">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-slate-900">Recent Activities</h3>
                  <Clock className="h-5 w-5 text-slate-400" />
                </div>
                <div className="space-y-4">
                  {stats?.recentActivities && stats.recentActivities.length > 0 ? (
                    stats.recentActivities.map((activity: any, index: number) => (
                      <div key={index} className="flex items-start space-x-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          activity.type === 'success' ? 'bg-emerald-100' :
                          activity.type === 'info' ? 'bg-blue-100' :
                          activity.type === 'warning' ? 'bg-amber-100' :
                          activity.type === 'health' ? 'bg-purple-100' :
                          'bg-slate-100'
                        }`}>
                          {activity.type === 'success' ? (
                            <CheckCircle className="h-4 w-4 text-emerald-600" />
                          ) : activity.type === 'info' ? (
                            <Plus className="h-4 w-4 text-blue-600" />
                          ) : activity.type === 'health' ? (
                            <Heart className="h-4 w-4 text-purple-600" />
                          ) : activity.type === 'warning' ? (
                            <Package className="h-4 w-4 text-amber-600" />
                          ) : (
                            <Activity className="h-4 w-4 text-slate-600" />
                          )}
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-slate-700">{activity.title}</p>
                          <p className="text-xs text-slate-500">{activity.description}</p>
                          <p className="text-xs text-slate-400">{activity.timestamp}</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <>
                      <div className="flex items-start space-x-3">
                        <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center">
                          <CheckCircle className="h-4 w-4 text-emerald-600" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-slate-700">Feed Distribution</p>
                          <p className="text-xs text-slate-500">Completed for all sections</p>
                          <p className="text-xs text-slate-400">30 minutes ago</p>
                        </div>
                      </div>
                      <div className="flex items-start space-x-3">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <Plus className="h-4 w-4 text-blue-600" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-slate-700">New Batch Added</p>
                          <p className="text-xs text-slate-500">500 layer hens registered</p>
                          <p className="text-xs text-slate-400">2 hours ago</p>
                        </div>
                      </div>
                      <div className="flex items-start space-x-3">
                        <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                          <Heart className="h-4 w-4 text-purple-600" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-slate-700">Health Inspection</p>
                          <p className="text-xs text-slate-500">Livestock section cleared</p>
                          <p className="text-xs text-slate-400">4 hours ago</p>
                        </div>
                      </div>
                      <div className="flex items-start space-x-3">
                        <div className="w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center">
                          <Package className="h-4 w-4 text-amber-600" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-slate-700">Harvest Completed</p>
                          <p className="text-xs text-slate-500">Pond 2 - 450kg fish</p>
                          <p className="text-xs text-slate-400">6 hours ago</p>
                        </div>
                      </div>
                    </>
                  )}
                </div>
                <button className="w-full mt-4 text-sm font-medium text-slate-600 hover:text-slate-800 transition-colors duration-200">
                  View All Activities
                </button>
              </div>
            </div>
          </div>
        </div>

      {/* Bottom Modules */}
      <div className="mt-8">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200/60 p-6 animate-in slide-in-from-bottom-4 fade-in duration-600 delay-1300">
          <BottomModules />
        </div>
      </div>
      </div>
    </div>
  );
}
