import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Alert, AlertDescription } from '../ui/alert';
import {
  Wifi,
  WifiOff,
  Thermometer,
  Droplets,
  Wind,
  Sun,
  Gauge,
  Battery,
  MapPin,
  Plus,
  Edit,
  Trash2,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  Clock,
  Activity,
  Settings,
  Download,
  Upload,
  Zap
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useWebSocket } from '../../hooks/useWebSocket';
import { toast } from 'sonner';

interface IoTSensor {
  id: string;
  name: string;
  type: 'temperature' | 'humidity' | 'soil_moisture' | 'ph' | 'light' | 'wind_speed' | 'pressure' | 'rainfall';
  location: {
    latitude: number;
    longitude: number;
    description: string;
  };
  status: 'online' | 'offline' | 'error' | 'maintenance';
  batteryLevel: number;
  lastReading: {
    value: number;
    unit: string;
    timestamp: string;
  } | null;
  configuration: {
    readingInterval: number; // minutes
    alertThresholds: {
      min?: number;
      max?: number;
    };
    calibrationOffset: number;
  };
  farmId: string;
  createdAt: string;
  updatedAt: string;
}

interface SensorReading {
  id: string;
  sensorId: string;
  value: number;
  unit: string;
  timestamp: string;
  quality: 'good' | 'fair' | 'poor';
  metadata?: Record<string, any>;
}

interface SensorStatistics {
  sensorId: string;
  period: string;
  average: number;
  minimum: number;
  maximum: number;
  readingCount: number;
  trend: 'increasing' | 'decreasing' | 'stable';
  reliability: number;
}

interface IoTSensorDashboardProps {
  farmId: string;
}

const IoTSensorDashboard: React.FC<IoTSensorDashboardProps> = ({ farmId }) => {
  const { user } = useAuth();
  const [sensors, setSensors] = useState<IoTSensor[]>([]);
  const [selectedSensor, setSelectedSensor] = useState<IoTSensor | null>(null);
  const [sensorReadings, setSensorReadings] = useState<SensorReading[]>([]);
  const [statistics, setStatistics] = useState<SensorStatistics[]>([]);
  const [loading, setLoading] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState('24h');
  const [newSensor, setNewSensor] = useState<Partial<IoTSensor>>({
    name: '',
    type: 'temperature',
    location: {
      latitude: 0,
      longitude: 0,
      description: ''
    },
    configuration: {
      readingInterval: 15,
      alertThresholds: {},
      calibrationOffset: 0
    }
  });

  // WebSocket connection for real-time sensor data
  const { socket, isConnected } = useWebSocket({
    url: process.env.REACT_APP_WS_URL || 'ws://localhost:3001',
    autoConnect: true
  });

  const sensorTypes = [
    { value: 'temperature', label: 'Temperature', icon: Thermometer, unit: '°C' },
    { value: 'humidity', label: 'Humidity', icon: Droplets, unit: '%' },
    { value: 'soil_moisture', label: 'Soil Moisture', icon: Droplets, unit: '%' },
    { value: 'ph', label: 'pH Level', icon: Gauge, unit: 'pH' },
    { value: 'light', label: 'Light Intensity', icon: Sun, unit: 'lux' },
    { value: 'wind_speed', label: 'Wind Speed', icon: Wind, unit: 'm/s' },
    { value: 'pressure', label: 'Pressure', icon: Gauge, unit: 'hPa' },
    { value: 'rainfall', label: 'Rainfall', icon: Droplets, unit: 'mm' }
  ];

  const periods = [
    { value: '1h', label: 'Last Hour' },
    { value: '24h', label: 'Last 24 Hours' },
    { value: '7d', label: 'Last 7 Days' },
    { value: '30d', label: 'Last 30 Days' }
  ];

  // Fetch sensors
  const fetchSensors = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/iot/sensors/${farmId}`, {
        headers: {
          'Authorization': `Bearer ${user?.token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setSensors(data.data.sensors || []);
      } else {
        throw new Error('Failed to fetch sensors');
      }
    } catch (error: any) {
      console.error('Error fetching sensors:', error);
      toast.error('Failed to load sensors');
    } finally {
      setLoading(false);
    }
  }, [farmId, user?.token]);

  // Fetch sensor readings
  const fetchSensorReadings = useCallback(async (sensorId: string) => {
    try {
      const response = await fetch(
        `/api/iot/sensors/${sensorId}/readings?period=${selectedPeriod}`,
        {
          headers: {
            'Authorization': `Bearer ${user?.token}`
          }
        }
      );

      if (response.ok) {
        const data = await response.json();
        setSensorReadings(data.data.readings || []);
      } else {
        throw new Error('Failed to fetch sensor readings');
      }
    } catch (error: any) {
      console.error('Error fetching sensor readings:', error);
      toast.error('Failed to load sensor readings');
    }
  }, [selectedPeriod, user?.token]);

  // Fetch sensor statistics
  const fetchStatistics = useCallback(async () => {
    try {
      const response = await fetch(
        `/api/iot/statistics/${farmId}?period=${selectedPeriod}`,
        {
          headers: {
            'Authorization': `Bearer ${user?.token}`
          }
        }
      );

      if (response.ok) {
        const data = await response.json();
        setStatistics(data.data.statistics || []);
      } else {
        throw new Error('Failed to fetch statistics');
      }
    } catch (error: any) {
      console.error('Error fetching statistics:', error);
      toast.error('Failed to load statistics');
    }
  }, [farmId, selectedPeriod, user?.token]);

  // Create new sensor
  const createSensor = useCallback(async () => {
    try {
      const response = await fetch('/api/iot/sensors', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${user?.token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...newSensor,
          farmId
        })
      });

      if (response.ok) {
        const data = await response.json();
        setSensors(prev => [...prev, data.data.sensor]);
        setIsAddDialogOpen(false);
        setNewSensor({
          name: '',
          type: 'temperature',
          location: {
            latitude: 0,
            longitude: 0,
            description: ''
          },
          configuration: {
            readingInterval: 15,
            alertThresholds: {},
            calibrationOffset: 0
          }
        });
        toast.success('Sensor created successfully');
      } else {
        throw new Error('Failed to create sensor');
      }
    } catch (error: any) {
      console.error('Error creating sensor:', error);
      toast.error('Failed to create sensor');
    }
  }, [newSensor, farmId, user?.token]);

  // Update sensor
  const updateSensor = useCallback(async () => {
    if (!selectedSensor) return;

    try {
      const response = await fetch(`/api/iot/sensors/${selectedSensor.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${user?.token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(selectedSensor)
      });

      if (response.ok) {
        const data = await response.json();
        setSensors(prev => prev.map(s => s.id === selectedSensor.id ? data.data.sensor : s));
        setIsEditDialogOpen(false);
        setSelectedSensor(null);
        toast.success('Sensor updated successfully');
      } else {
        throw new Error('Failed to update sensor');
      }
    } catch (error: any) {
      console.error('Error updating sensor:', error);
      toast.error('Failed to update sensor');
    }
  }, [selectedSensor, user?.token]);

  // Delete sensor
  const deleteSensor = useCallback(async (sensorId: string) => {
    try {
      const response = await fetch(`/api/iot/sensors/${sensorId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${user?.token}`
        }
      });

      if (response.ok) {
        setSensors(prev => prev.filter(s => s.id !== sensorId));
        toast.success('Sensor deleted successfully');
      } else {
        throw new Error('Failed to delete sensor');
      }
    } catch (error: any) {
      console.error('Error deleting sensor:', error);
      toast.error('Failed to delete sensor');
    }
  }, [user?.token]);

  // Submit sensor reading
  const submitReading = useCallback(async (sensorId: string, value: number) => {
    try {
      const response = await fetch('/api/iot/readings', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${user?.token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          sensorId,
          value,
          timestamp: new Date().toISOString()
        })
      });

      if (response.ok) {
        toast.success('Reading submitted successfully');
        if (selectedSensor?.id === sensorId) {
          fetchSensorReadings(sensorId);
        }
      } else {
        throw new Error('Failed to submit reading');
      }
    } catch (error: any) {
      console.error('Error submitting reading:', error);
      toast.error('Failed to submit reading');
    }
  }, [user?.token, selectedSensor?.id, fetchSensorReadings]);

  // WebSocket event handlers
  useEffect(() => {
    if (!socket || !isConnected) return;

    const handleSensorData = (data: any) => {
      if (data.farmId === farmId) {
        // Update sensor with new reading
        setSensors(prev => prev.map(sensor => {
          if (sensor.id === data.sensorId) {
            return {
              ...sensor,
              lastReading: {
                value: data.value,
                unit: data.unit,
                timestamp: data.timestamp
              },
              status: 'online'
            };
          }
          return sensor;
        }));

        // Update readings if this sensor is selected
        if (selectedSensor?.id === data.sensorId) {
          setSensorReadings(prev => [{
            id: data.id || Date.now().toString(),
            sensorId: data.sensorId,
            value: data.value,
            unit: data.unit,
            timestamp: data.timestamp,
            quality: data.quality || 'good'
          }, ...prev.slice(0, 99)]); // Keep last 100 readings
        }
      }
    };

    const handleSensorStatus = (data: any) => {
      if (data.farmId === farmId) {
        setSensors(prev => prev.map(sensor => {
          if (sensor.id === data.sensorId) {
            return {
              ...sensor,
              status: data.status,
              batteryLevel: data.batteryLevel || sensor.batteryLevel
            };
          }
          return sensor;
        }));
      }
    };

    socket.on('sensor_data', handleSensorData);
    socket.on('sensor_status', handleSensorStatus);

    return () => {
      socket.off('sensor_data', handleSensorData);
      socket.off('sensor_status', handleSensorStatus);
    };
  }, [socket, isConnected, farmId, selectedSensor?.id]);

  // Initial data load
  useEffect(() => {
    fetchSensors();
    fetchStatistics();
  }, [fetchSensors, fetchStatistics]);

  // Update readings when sensor or period changes
  useEffect(() => {
    if (selectedSensor) {
      fetchSensorReadings(selectedSensor.id);
    }
  }, [selectedSensor, fetchSensorReadings]);

  const getSensorIcon = (type: string) => {
    const sensorType = sensorTypes.find(t => t.value === type);
    return sensorType ? sensorType.icon : Gauge;
  };

  const getSensorUnit = (type: string) => {
    const sensorType = sensorTypes.find(t => t.value === type);
    return sensorType ? sensorType.unit : '';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'text-green-500';
      case 'offline': return 'text-red-500';
      case 'error': return 'text-red-500';
      case 'maintenance': return 'text-yellow-500';
      default: return 'text-gray-500';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'online': return <Wifi className="h-4 w-4" />;
      case 'offline': return <WifiOff className="h-4 w-4" />;
      case 'error': return <AlertTriangle className="h-4 w-4" />;
      case 'maintenance': return <Settings className="h-4 w-4" />;
      default: return <WifiOff className="h-4 w-4" />;
    }
  };

  const getBatteryColor = (level: number) => {
    if (level > 50) return 'text-green-500';
    if (level > 20) return 'text-yellow-500';
    return 'text-red-500';
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Activity className="h-6 w-6 text-blue-500" />
          <h2 className="text-2xl font-bold">IoT Sensor Dashboard</h2>
          <div className={`flex items-center space-x-1 ${isConnected ? 'text-green-500' : 'text-red-500'}`}>
            {isConnected ? <Wifi className="h-4 w-4" /> : <WifiOff className="h-4 w-4" />}
            <span className="text-sm">{isConnected ? 'Connected' : 'Disconnected'}</span>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {periods.map((period) => (
                <SelectItem key={period.value} value={period.value}>
                  {period.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              fetchSensors();
              fetchStatistics();
            }}
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Sensor
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Add New Sensor</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="name">Sensor Name</Label>
                  <Input
                    id="name"
                    value={newSensor.name || ''}
                    onChange={(e) => setNewSensor(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Enter sensor name"
                  />
                </div>
                <div>
                  <Label htmlFor="type">Sensor Type</Label>
                  <Select
                    value={newSensor.type}
                    onValueChange={(value) => setNewSensor(prev => ({ ...prev, type: value as any }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {sensorTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="location">Location Description</Label>
                  <Input
                    id="location"
                    value={newSensor.location?.description || ''}
                    onChange={(e) => setNewSensor(prev => ({
                      ...prev,
                      location: { ...prev.location!, description: e.target.value }
                    }))}
                    placeholder="e.g., Field A, Section 1"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label htmlFor="latitude">Latitude</Label>
                    <Input
                      id="latitude"
                      type="number"
                      step="any"
                      value={newSensor.location?.latitude || 0}
                      onChange={(e) => setNewSensor(prev => ({
                        ...prev,
                        location: { ...prev.location!, latitude: parseFloat(e.target.value) || 0 }
                      }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="longitude">Longitude</Label>
                    <Input
                      id="longitude"
                      type="number"
                      step="any"
                      value={newSensor.location?.longitude || 0}
                      onChange={(e) => setNewSensor(prev => ({
                        ...prev,
                        location: { ...prev.location!, longitude: parseFloat(e.target.value) || 0 }
                      }))}
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="interval">Reading Interval (minutes)</Label>
                  <Input
                    id="interval"
                    type="number"
                    min="1"
                    value={newSensor.configuration?.readingInterval || 15}
                    onChange={(e) => setNewSensor(prev => ({
                      ...prev,
                      configuration: {
                        ...prev.configuration!,
                        readingInterval: parseInt(e.target.value) || 15
                      }
                    }))}
                  />
                </div>
                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={createSensor}>
                    Create Sensor
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="sensors">Sensors</TabsTrigger>
          <TabsTrigger value="readings">Readings</TabsTrigger>
          <TabsTrigger value="statistics">Statistics</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Sensors</p>
                    <p className="text-2xl font-bold">{sensors.length}</p>
                  </div>
                  <Activity className="h-8 w-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Online</p>
                    <p className="text-2xl font-bold text-green-500">
                      {sensors.filter(s => s.status === 'online').length}
                    </p>
                  </div>
                  <Wifi className="h-8 w-8 text-green-500" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Offline</p>
                    <p className="text-2xl font-bold text-red-500">
                      {sensors.filter(s => s.status === 'offline' || s.status === 'error').length}
                    </p>
                  </div>
                  <WifiOff className="h-8 w-8 text-red-500" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Low Battery</p>
                    <p className="text-2xl font-bold text-yellow-500">
                      {sensors.filter(s => s.batteryLevel < 20).length}
                    </p>
                  </div>
                  <Battery className="h-8 w-8 text-yellow-500" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Sensor Data */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Sensor Readings</CardTitle>
            </CardHeader>
            <CardContent>
              {sensors.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Activity className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No sensors configured</p>
                  <p className="text-sm">Add your first sensor to start monitoring</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {sensors.slice(0, 6).map((sensor) => {
                    const SensorIcon = getSensorIcon(sensor.type);
                    return (
                      <Card key={sensor.id} className="cursor-pointer hover:shadow-md transition-shadow"
                            onClick={() => setSelectedSensor(sensor)}>
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center space-x-2">
                              <SensorIcon className="h-5 w-5" />
                              <span className="font-medium">{sensor.name}</span>
                            </div>
                            <div className={`flex items-center space-x-1 ${getStatusColor(sensor.status)}`}>
                              {getStatusIcon(sensor.status)}
                            </div>
                          </div>
                          <div className="space-y-1">
                            {sensor.lastReading ? (
                              <>
                                <div className="text-2xl font-bold">
                                  {sensor.lastReading.value.toFixed(1)} {sensor.lastReading.unit}
                                </div>
                                <div className="text-xs text-muted-foreground">
                                  {formatTimestamp(sensor.lastReading.timestamp)}
                                </div>
                              </>
                            ) : (
                              <div className="text-muted-foreground">No readings yet</div>
                            )}
                            <div className="flex items-center justify-between text-xs">
                              <span>{sensor.location.description}</span>
                              <div className={`flex items-center space-x-1 ${getBatteryColor(sensor.batteryLevel)}`}>
                                <Battery className="h-3 w-3" />
                                <span>{sensor.batteryLevel}%</span>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Sensors Tab */}
        <TabsContent value="sensors">
          <Card>
            <CardHeader>
              <CardTitle>Sensor Management</CardTitle>
            </CardHeader>
            <CardContent>
              {sensors.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Activity className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No sensors configured</p>
                  <Button onClick={() => setIsAddDialogOpen(true)} className="mt-4">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Your First Sensor
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {sensors.map((sensor) => {
                    const SensorIcon = getSensorIcon(sensor.type);
                    return (
                      <Card key={sensor.id}>
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                              <SensorIcon className="h-8 w-8" />
                              <div>
                                <h3 className="font-medium">{sensor.name}</h3>
                                <p className="text-sm text-muted-foreground">
                                  {sensorTypes.find(t => t.value === sensor.type)?.label}
                                </p>
                                <div className="flex items-center space-x-4 mt-1">
                                  <div className="flex items-center space-x-1">
                                    <MapPin className="h-3 w-3" />
                                    <span className="text-xs">{sensor.location.description}</span>
                                  </div>
                                  <div className={`flex items-center space-x-1 ${getStatusColor(sensor.status)}`}>
                                    {getStatusIcon(sensor.status)}
                                    <span className="text-xs capitalize">{sensor.status}</span>
                                  </div>
                                  <div className={`flex items-center space-x-1 ${getBatteryColor(sensor.batteryLevel)}`}>
                                    <Battery className="h-3 w-3" />
                                    <span className="text-xs">{sensor.batteryLevel}%</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              {sensor.lastReading && (
                                <div className="text-right">
                                  <div className="font-medium">
                                    {sensor.lastReading.value.toFixed(1)} {sensor.lastReading.unit}
                                  </div>
                                  <div className="text-xs text-muted-foreground">
                                    {formatTimestamp(sensor.lastReading.timestamp)}
                                  </div>
                                </div>
                              )}
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setSelectedSensor(sensor);
                                  setIsEditDialogOpen(true);
                                }}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => deleteSensor(sensor.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Readings Tab */}
        <TabsContent value="readings">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Sensor Selection */}
            <Card>
              <CardHeader>
                <CardTitle>Select Sensor</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {sensors.map((sensor) => {
                    const SensorIcon = getSensorIcon(sensor.type);
                    return (
                      <Button
                        key={sensor.id}
                        variant={selectedSensor?.id === sensor.id ? 'default' : 'outline'}
                        className="w-full justify-start"
                        onClick={() => setSelectedSensor(sensor)}
                      >
                        <SensorIcon className="h-4 w-4 mr-2" />
                        {sensor.name}
                      </Button>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Readings Display */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>
                    {selectedSensor ? `${selectedSensor.name} Readings` : 'Select a Sensor'}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {!selectedSensor ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <Activity className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>Select a sensor to view readings</p>
                    </div>
                  ) : sensorReadings.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>No readings available</p>
                      <p className="text-sm">Readings will appear here as they are collected</p>
                    </div>
                  ) : (
                    <div className="space-y-2 max-h-96 overflow-y-auto">
                      {sensorReadings.map((reading) => (
                        <div key={reading.id} className="flex items-center justify-between p-2 border rounded">
                          <div>
                            <div className="font-medium">
                              {reading.value.toFixed(2)} {reading.unit}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {formatTimestamp(reading.timestamp)}
                            </div>
                          </div>
                          <Badge variant={reading.quality === 'good' ? 'default' : 
                                        reading.quality === 'fair' ? 'secondary' : 'destructive'}>
                            {reading.quality}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* Statistics Tab */}
        <TabsContent value="statistics">
          <Card>
            <CardHeader>
              <CardTitle>Sensor Statistics</CardTitle>
            </CardHeader>
            <CardContent>
              {statistics.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Activity className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No statistics available</p>
                  <p className="text-sm">Statistics will appear as data is collected</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {statistics.map((stat) => {
                    const sensor = sensors.find(s => s.id === stat.sensorId);
                    if (!sensor) return null;
                    
                    const SensorIcon = getSensorIcon(sensor.type);
                    const unit = getSensorUnit(sensor.type);
                    
                    return (
                      <Card key={stat.sensorId}>
                        <CardContent className="p-4">
                          <div className="flex items-center space-x-2 mb-3">
                            <SensorIcon className="h-5 w-5" />
                            <span className="font-medium">{sensor.name}</span>
                          </div>
                          <div className="space-y-2">
                            <div className="flex justify-between">
                              <span className="text-sm text-muted-foreground">Average</span>
                              <span className="font-medium">{stat.average.toFixed(1)} {unit}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm text-muted-foreground">Min</span>
                              <span className="font-medium">{stat.minimum.toFixed(1)} {unit}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm text-muted-foreground">Max</span>
                              <span className="font-medium">{stat.maximum.toFixed(1)} {unit}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm text-muted-foreground">Readings</span>
                              <span className="font-medium">{stat.readingCount}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm text-muted-foreground">Trend</span>
                              <div className="flex items-center space-x-1">
                                {stat.trend === 'increasing' && <TrendingUp className="h-3 w-3 text-green-500" />}
                                {stat.trend === 'decreasing' && <TrendingDown className="h-3 w-3 text-red-500" />}
                                {stat.trend === 'stable' && <div className="h-3 w-3 bg-gray-400 rounded-full" />}
                                <span className="text-sm capitalize">{stat.trend}</span>
                              </div>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm text-muted-foreground">Reliability</span>
                              <span className="font-medium">{(stat.reliability * 100).toFixed(1)}%</span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Edit Sensor Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Sensor</DialogTitle>
          </DialogHeader>
          {selectedSensor && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="edit-name">Sensor Name</Label>
                <Input
                  id="edit-name"
                  value={selectedSensor.name}
                  onChange={(e) => setSelectedSensor(prev => prev ? { ...prev, name: e.target.value } : null)}
                />
              </div>
              <div>
                <Label htmlFor="edit-location">Location Description</Label>
                <Input
                  id="edit-location"
                  value={selectedSensor.location.description}
                  onChange={(e) => setSelectedSensor(prev => prev ? {
                    ...prev,
                    location: { ...prev.location, description: e.target.value }
                  } : null)}
                />
              </div>
              <div>
                <Label htmlFor="edit-interval">Reading Interval (minutes)</Label>
                <Input
                  id="edit-interval"
                  type="number"
                  min="1"
                  value={selectedSensor.configuration.readingInterval}
                  onChange={(e) => setSelectedSensor(prev => prev ? {
                    ...prev,
                    configuration: {
                      ...prev.configuration,
                      readingInterval: parseInt(e.target.value) || 15
                    }
                  } : null)}
                />
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={updateSensor}>
                  Update Sensor
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default IoTSensorDashboard;