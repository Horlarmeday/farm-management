import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Plus,
  Search,
  Filter,
  RefreshCw,
  Wifi,
  WifiOff,
  Battery,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Activity,
  Settings,
} from 'lucide-react';
import { MobileSensorCard } from './MobileSensorCard';
import { SensorForm } from '@/components/iot/SensorForm';
import { SensorReadings } from '@/components/iot/SensorReadings';
import { SensorTrends } from '@/components/iot/SensorTrends';
import { iotService } from '@/services/iot.service';
import { IoTSensor, SensorType } from '@/types/iot';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { useCurrentFarmId } from '@/contexts/FarmContext';

interface MobileIoTDashboardProps {
  className?: string;
}

export const MobileIoTDashboard: React.FC<MobileIoTDashboardProps> = ({ className }) => {
  const farmId = useCurrentFarmId();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<SensorType | 'all'>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive'>('all');
  const [selectedSensor, setSelectedSensor] = useState<IoTSensor | null>(null);
  const [editingSensor, setEditingSensor] = useState<IoTSensor | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  const queryClient = useQueryClient();

  // Fetch sensors
  const { data: sensors = [], isLoading, refetch } = useQuery({
    queryKey: ['iot-sensors', farmId],
    queryFn: () => farmId ? iotService.getSensors(farmId) : Promise.resolve([]),
    enabled: !!farmId,
  });

  // Delete sensor mutation
  const deleteSensorMutation = useMutation({
    mutationFn: iotService.deleteSensor,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['iot-sensors', farmId] });
      toast.success('Sensor deleted successfully');
    },
    onError: () => {
      toast.error('Failed to delete sensor');
    },
  });

  // Filter sensors
  const filteredSensors = sensors.filter((sensor) => {
    const matchesSearch = sensor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         sensor.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || sensor.type === filterType;
    const matchesStatus = filterStatus === 'all' || 
                         (filterStatus === 'active' && sensor.isActive) ||
                         (filterStatus === 'inactive' && !sensor.isActive);
    
    return matchesSearch && matchesType && matchesStatus;
  });

  // Calculate statistics
  const stats = {
    total: sensors.length,
    active: sensors.filter(s => s.isActive).length,
    inactive: sensors.filter(s => !s.isActive).length,
    alerts: sensors.filter(s => {
      if (!s.lastReading || !s.configuration) return false;
      const { value } = s.lastReading;
      const { minThreshold, maxThreshold } = s.configuration;
      return (minThreshold && value < minThreshold) || (maxThreshold && value > maxThreshold);
    }).length,
  };

  const handleSensorSelect = (sensor: IoTSensor) => {
    setSelectedSensor(sensor);
    setActiveTab('readings');
  };

  const handleSensorEdit = (sensor: IoTSensor) => {
    setEditingSensor(sensor);
  };

  const handleSensorDelete = (sensor: IoTSensor) => {
    if (confirm(`Are you sure you want to delete ${sensor.name}?`)) {
      deleteSensorMutation.mutate(sensor.id);
    }
  };

  const handleRefresh = () => {
    refetch();
    toast.success('Data refreshed');
  };

  // Show loading if no farm is selected
  if (!farmId) {
    return (
      <div className={cn('min-h-screen bg-gray-50 flex items-center justify-center p-4', className)}>
        <Card className="w-full max-w-sm">
          <CardContent className="flex flex-col items-center justify-center py-8">
            <AlertTriangle className="h-12 w-12 text-yellow-500 mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Farm Selected</h3>
            <p className="text-muted-foreground text-center text-sm">
              Please select a farm to view IoT sensors
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className={cn('min-h-screen bg-gray-50', className)}>
      {/* Mobile Header */}
      <div className="sticky top-0 z-10 bg-white border-b border-gray-200 px-4 py-3">
        <div className="flex items-center justify-between mb-3">
          <h1 className="text-xl font-bold">IoT Sensors</h1>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={isLoading}
              className="touch-manipulation"
            >
              <RefreshCw className={cn('h-4 w-4', isLoading && 'animate-spin')} />
            </Button>
            <Button
              size="sm"
              onClick={() => setShowAddForm(true)}
              className="touch-manipulation"
            >
              <Plus className="h-4 w-4 mr-1" />
              Add
            </Button>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search sensors..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 touch-manipulation"
            />
          </div>
          <Sheet open={showFilters} onOpenChange={setShowFilters}>
            <SheetTrigger asChild>
              <Button variant="outline" size="sm" className="touch-manipulation">
                <Filter className="h-4 w-4" />
              </Button>
            </SheetTrigger>
            <SheetContent side="bottom" className="h-[300px]">
              <SheetHeader>
                <SheetTitle>Filter Sensors</SheetTitle>
                <SheetDescription>
                  Filter sensors by type and status
                </SheetDescription>
              </SheetHeader>
              <div className="space-y-4 mt-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Sensor Type</label>
                  <Select value={filterType} onValueChange={(value) => setFilterType(value as SensorType | 'all')}>
                    <SelectTrigger className="touch-manipulation">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value={SensorType.TEMPERATURE}>Temperature</SelectItem>
                      <SelectItem value={SensorType.HUMIDITY}>Humidity</SelectItem>
                      <SelectItem value={SensorType.SOIL_MOISTURE}>Soil Moisture</SelectItem>
                      <SelectItem value={SensorType.PH}>pH Level</SelectItem>
                      <SelectItem value={SensorType.LIGHT}>Light</SelectItem>
                      <SelectItem value={SensorType.WIND_SPEED}>Wind Speed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Status</label>
                  <Select value={filterStatus} onValueChange={(value) => setFilterStatus(value as 'all' | 'active' | 'inactive')}>
                    <SelectTrigger className="touch-manipulation">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="px-4 py-3">
        <div className="grid grid-cols-2 gap-3">
          <Card className="touch-manipulation">
            <CardContent className="p-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">Total</p>
                  <p className="text-lg font-bold">{stats.total}</p>
                </div>
                <Activity className="h-5 w-5 text-blue-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="touch-manipulation">
            <CardContent className="p-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">Active</p>
                  <p className="text-lg font-bold text-green-600">{stats.active}</p>
                </div>
                <Wifi className="h-5 w-5 text-green-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="touch-manipulation">
            <CardContent className="p-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">Inactive</p>
                  <p className="text-lg font-bold text-red-600">{stats.inactive}</p>
                </div>
                <WifiOff className="h-5 w-5 text-red-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="touch-manipulation">
            <CardContent className="p-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">Alerts</p>
                  <p className="text-lg font-bold text-orange-600">{stats.alerts}</p>
                </div>
                <AlertTriangle className="h-5 w-5 text-orange-500" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-4 pb-20">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-4 touch-manipulation">
            <TabsTrigger value="overview" className="text-xs">Overview</TabsTrigger>
            <TabsTrigger value="readings" className="text-xs">Readings</TabsTrigger>
            <TabsTrigger value="trends" className="text-xs">Trends</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-3">
            {isLoading ? (
              <div className="space-y-3">
                {[...Array(3)].map((_, i) => (
                  <Card key={i} className="animate-pulse">
                    <CardContent className="p-4">
                      <div className="h-20 bg-gray-200 rounded" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : filteredSensors.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <Activity className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No sensors found</h3>
                  <p className="text-muted-foreground mb-4">
                    {searchTerm || filterType !== 'all' || filterStatus !== 'all'
                      ? 'Try adjusting your filters'
                      : 'Add your first IoT sensor to get started'}
                  </p>
                  {!searchTerm && filterType === 'all' && filterStatus === 'all' && (
                    <Button onClick={() => setShowAddForm(true)} className="touch-manipulation">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Sensor
                    </Button>
                  )}
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {filteredSensors.map((sensor) => (
                  <MobileSensorCard
                    key={sensor.id}
                    sensor={sensor}
                    onEdit={() => handleSensorEdit(sensor)}
                    onDelete={() => handleSensorDelete(sensor)}
                    onSelect={() => handleSensorSelect(sensor)}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="readings">
            {selectedSensor ? (
              <SensorReadings sensor={selectedSensor} />
            ) : (
              <Card>
                <CardContent className="p-8 text-center">
                  <Activity className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Select a sensor</h3>
                  <p className="text-muted-foreground">
                    Choose a sensor from the overview to view its readings
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="trends">
            {selectedSensor ? (
              <SensorTrends sensor={selectedSensor} />
            ) : (
              <Card>
                <CardContent className="p-8 text-center">
                  <TrendingUp className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Select a sensor</h3>
                  <p className="text-muted-foreground">
                    Choose a sensor from the overview to view its trends
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Add/Edit Sensor Form */}
      {(showAddForm || editingSensor) && (
        <SensorForm
          sensor={editingSensor || undefined}
          farmId={farmId}
          onClose={() => {
            setShowAddForm(false);
            setEditingSensor(null);
          }}
          onSuccess={() => {
            refetch();
            setShowAddForm(false);
            setEditingSensor(null);
          }}
        />
      )}
    </div>
  );
};