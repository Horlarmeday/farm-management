import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
  BatteryLow,
  Thermometer,
  Droplets,
  Wind,
  Sun,
  AlertTriangle,
  Activity,
  TrendingUp,
  TrendingDown,
  Settings,
} from 'lucide-react';
import { toast } from 'sonner';
import { iotService } from '@/services/iot.service';
import { IoTSensor, SensorType } from '@/types/iot';
import { SensorCard } from '@/components/iot/SensorCard';
import { SensorForm } from '@/components/iot/SensorForm';
import { SensorReadings } from '@/components/iot/SensorReadings';
import { SensorTrends } from '@/components/iot/SensorTrends';
import { MobileIoTDashboard } from '@/components/mobile/MobileIoTDashboard';
import { useResponsive } from '@/hooks/useResponsive';
import { useCurrentFarmId } from '@/contexts/FarmContext';

export const IoTDashboard: React.FC = () => {
  const { isMobile, isTouchDevice } = useResponsive();
  const queryClient = useQueryClient();
  const farmId = useCurrentFarmId();

  // Use mobile dashboard for mobile devices or touch devices
  if (isMobile || isTouchDevice) {
    return <MobileIoTDashboard />;
  }

  // Show loading if no farm is selected
  if (!farmId) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center justify-center py-8">
            <AlertTriangle className="h-12 w-12 text-yellow-500 mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Farm Selected</h3>
            <p className="text-muted-foreground text-center">
              Please select a farm to view IoT sensors
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<SensorType | 'all'>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive'>('all');
  const [selectedSensor, setSelectedSensor] = useState<IoTSensor | null>(null);
  const [editingSensor, setEditingSensor] = useState<IoTSensor | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);

  // Fetch sensors
  const { data: sensors = [], isLoading, refetch } = useQuery({
    queryKey: ['sensors', farmId],
    queryFn: () => farmId ? iotService.getSensors(farmId) : Promise.resolve([]),
    enabled: !!farmId,
  });

  // Delete sensor mutation
  const deleteSensorMutation = useMutation({
    mutationFn: iotService.deleteSensor,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sensors', farmId] });
      toast.success('Sensor deleted successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to delete sensor');
    },
  });

  // Handle sensor actions
  const handleSensorEdit = (sensor: IoTSensor) => {
    setEditingSensor(sensor);
  };

  const handleSensorDelete = (sensorId: string) => {
    const sensor = sensors?.find(s => s.id === sensorId);
    if (sensor && confirm(`Are you sure you want to delete sensor "${sensor.name}"?`)) {
      deleteSensorMutation.mutate(sensorId);
    }
  };

  const handleSensorSelect = (sensor: IoTSensor) => {
    setSelectedSensor(sensor);
  };

  const handleFormSuccess = () => {
    queryClient.invalidateQueries({ queryKey: ['sensors', farmId] });
  };

  // Calculate statistics
  const statistics = {
    total: sensors?.length || 0,
    active: sensors?.filter(s => s.isActive).length || 0,
    alerts: sensors?.filter(s => {
      if (!s.lastReading || !s.configuration) return false;
      const { value } = s.lastReading;
      const { minThreshold, maxThreshold } = s.configuration;
      return (minThreshold && value < minThreshold) || (maxThreshold && value > maxThreshold);
    }).length || 0,
    lowBattery: sensors?.filter(s => s.batteryLevel && s.batteryLevel < 20).length || 0,
  };



  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Activity className="h-12 w-12 animate-pulse mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground">Loading IoT sensors...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">IoT Dashboard</h1>
          <p className="text-muted-foreground">
            Monitor and manage your farm sensors in real-time
          </p>
        </div>
        <Button onClick={() => setShowAddForm(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Sensor
        </Button>
      </div>

      {/* Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Sensors</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{statistics.total}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active</CardTitle>
            <div className="h-2 w-2 bg-green-500 rounded-full" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{statistics.active}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Alerts</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{statistics.alerts}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Low Battery</CardTitle>
            <BatteryLow className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{statistics.lowBattery}</div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <div className="space-y-6">
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="readings">Readings</TabsTrigger>
            <TabsTrigger value="trends">Trends</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Sensors Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {sensors?.map((sensor) => (
                <SensorCard
                  key={sensor.id}
                  sensor={sensor}
                  onSelect={setSelectedSensor}
                  onEdit={handleSensorEdit}
                  onDelete={handleSensorDelete}
                />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="readings">
            {selectedSensor ? (
              <SensorReadings sensor={selectedSensor} />
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle>Sensor Readings</CardTitle>
                  <CardDescription>
                    Historical data and real-time monitoring
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center text-muted-foreground py-8">
                    <Activity className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Select a sensor from the overview tab to view readings</p>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="trends">
            {selectedSensor ? (
              <SensorTrends sensor={selectedSensor} />
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle>Trend Analysis</CardTitle>
                  <CardDescription>
                    Predictive insights and pattern recognition
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center text-muted-foreground py-8">
                    <TrendingUp className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Select a sensor from the overview tab to view trend analysis</p>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Add/Edit Sensor Form */}
      {(showAddForm || editingSensor) && (
        <SensorForm
          farmId={farmId}
          sensor={editingSensor || undefined}
          onClose={() => {
            setShowAddForm(false);
            setEditingSensor(null);
          }}
          onSuccess={() => {
            setShowAddForm(false);
            setEditingSensor(null);
            queryClient.invalidateQueries({ queryKey: ['sensors', farmId] });
          }}
        />
      )}
    </div>
  );
};