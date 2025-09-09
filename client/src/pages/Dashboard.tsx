import { AlertsWidget } from '@/components/dashboard/AlertsWidget';
import BottomModules from '@/components/dashboard/BottomModules';
import KPICard from '@/components/dashboard/KPICard';
import ModuleCard from '@/components/dashboard/ModuleCard';
import QuickStats from '@/components/dashboard/QuickStats';
import RecentActivities from '@/components/dashboard/RecentActivities';
import { Button } from '@/components/ui/button';
import { useDashboardData } from '@/hooks/useDashboard';
import { Bird, Dog, DollarSign, Download, Fish, Plus } from 'lucide-react';

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
    console.warn('Dashboard API error, using fallback data:', error);
  }

  return (
    <div className="max-w-full mx-auto px-6 py-6">
      {/* Page Header */}
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Farm Management Dashboard</h1>
            <p className="text-muted-foreground mt-1">Monitor and manage all farm operations</p>
          </div>
          <div className="flex space-x-3">
            <Button className="farm-button-primary">
              <Plus className="h-4 w-4 mr-2" />
              New Entry
            </Button>
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <KPICard
          title="Total Revenue"
          value={`₦${stats?.totalRevenue?.toLocaleString() || '0'}`}
          trend={{ value: '+12% from last month', positive: true }}
          icon={<DollarSign className="h-6 w-6" />}
          color="primary"
        />
        <KPICard
          title="Active Birds"
          value={stats?.activeBirds?.toLocaleString() || '0'}
          subtitle="+5% growth rate"
          icon={<Bird className="h-6 w-6" />}
          color="yellow"
        />
        <KPICard
          title="Fish Harvest"
          value={`${stats?.fishHarvest?.toLocaleString() || '0'} kg`}
          subtitle="This month"
          icon={<Fish className="h-6 w-6" />}
          color="blue"
        />
        <KPICard
          title="Livestock"
          value={stats?.livestock?.toLocaleString() || '0'}
          subtitle="All categories"
          icon={<Dog className="h-6 w-6" />}
          color="purple"
        />
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Left Column - Module Cards */}
        <div className="xl:col-span-2 space-y-6">
          {/* Poultry Module */}
          <ModuleCard
            title="Poultry Management"
            icon={<Bird className="h-5 w-5 text-yellow-600" />}
            image="https://images.unsplash.com/photo-1558618666-fcd25c85cd64?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&h=200"
            onViewAll={() => {}}
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-muted rounded-lg p-4">
                <h4 className="font-medium mb-2">Layer Hens</h4>
                <p className="text-2xl font-bold">{modules?.poultry?.layerHens?.toLocaleString() || '0'}</p>
                <p className="text-sm text-muted-foreground">Active birds</p>
              </div>
              <div className="bg-muted rounded-lg p-4">
                <h4 className="font-medium mb-2">Egg Production</h4>
                <p className="text-2xl font-bold">{modules?.poultry?.eggProduction?.toLocaleString() || '0'}</p>
                <p className="text-sm text-muted-foreground">Daily average</p>
              </div>
              <div className="bg-muted rounded-lg p-4">
                <h4 className="font-medium mb-2">FCR</h4>
                <p className="text-2xl font-bold">{modules?.poultry?.fcr || '0'}</p>
                <p className="text-sm text-muted-foreground">Feed conversion</p>
              </div>
            </div>
            <div className="flex space-x-2">
              <Button className="farm-button-primary">
                <Plus className="h-4 w-4 mr-2" />
                Add Batch
              </Button>
              <Button variant="outline">View Analytics</Button>
            </div>
          </ModuleCard>

          {/* Livestock Module */}
          <ModuleCard
            title="Livestock Management"
            icon={<Dog className="h-5 w-5 text-purple-600" />}
            image="https://images.unsplash.com/photo-1516467508483-a7212febe31a?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&h=200"
            onViewAll={() => {}}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-muted rounded-lg p-4">
                <h4 className="font-medium mb-2">Cattle</h4>
                <p className="text-2xl font-bold">{modules?.livestock?.cattle?.toLocaleString() || '0'}</p>
                <p className="text-sm text-muted-foreground">Active animals</p>
              </div>
              <div className="bg-muted rounded-lg p-4">
                <h4 className="font-medium mb-2">Milk Production</h4>
                <p className="text-2xl font-bold">{modules?.livestock?.milkProduction?.toLocaleString() || '0'}L</p>
                <p className="text-sm text-muted-foreground">Daily average</p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <p className="text-lg font-semibold">{modules?.livestock?.goats?.toLocaleString() || '0'}</p>
                <p className="text-sm text-muted-foreground">Goats</p>
              </div>
              <div className="text-center">
                <p className="text-lg font-semibold">{modules?.livestock?.sheep?.toLocaleString() || '0'}</p>
                <p className="text-sm text-muted-foreground">Sheep</p>
              </div>
              <div className="text-center">
                <p className="text-lg font-semibold">{modules?.livestock?.pigs?.toLocaleString() || '0'}</p>
                <p className="text-sm text-muted-foreground">Pigs</p>
              </div>
            </div>
          </ModuleCard>

          {/* Fishery Module */}
          <ModuleCard
            title="Fish Pond Management"
            icon={<Fish className="h-5 w-5 text-blue-600" />}
            image="https://images.unsplash.com/photo-1544551763-46a013bb70d5?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&h=200"
            onViewAll={() => {}}
          >
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-muted rounded-lg p-4">
                <h4 className="font-medium mb-2">Active Ponds</h4>
                <p className="text-2xl font-bold">{modules?.fishery?.activePonds || '0'}</p>
                <p className="text-sm text-muted-foreground">Out of {modules?.fishery?.totalPonds || '0'} total</p>
              </div>
              <div className="bg-muted rounded-lg p-4">
                <h4 className="font-medium mb-2">Fish Stock</h4>
                <p className="text-2xl font-bold">{modules?.fishery?.fishStock?.toLocaleString() || '0'}</p>
                <p className="text-sm text-muted-foreground">Total fish</p>
              </div>
              <div className="bg-muted rounded-lg p-4">
                <h4 className="font-medium mb-2">Harvest</h4>
                <p className="text-2xl font-bold">{modules?.fishery?.monthlyHarvest?.toLocaleString() || '0'}kg</p>
                <p className="text-sm text-muted-foreground">This month</p>
              </div>
              <div className="bg-muted rounded-lg p-4">
                <h4 className="font-medium mb-2">Water Quality</h4>
                <p className="text-2xl font-bold">{modules?.fishery?.waterQuality || 'Unknown'}</p>
                <p className="text-sm text-muted-foreground">All ponds</p>
              </div>
            </div>
          </ModuleCard>
        </div>

        {/* Right Column - Widgets */}
        <div className="space-y-6">
          <AlertsWidget />
          <QuickStats />
          <RecentActivities />
        </div>
      </div>

      {/* Bottom Modules */}
      <div className="mt-8">
        <BottomModules />
      </div>
    </div>
  );
}
