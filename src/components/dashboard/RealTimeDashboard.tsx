import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Alert, AlertDescription } from '../ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Progress } from '../ui/progress';
import { 
  Activity, 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  Thermometer, 
  Droplets, 
  Wind,
  Zap,
  Wifi,
  WifiOff,
  Bell,
  BarChart3,
  LineChart,
  PieChart
} from 'lucide-react';
import { useWebSocket } from '../../hooks/useWebSocket';
import { useAuth } from '../../hooks/useAuth';
import { toast } from 'sonner';

interface SensorReading {
  id: string;
  sensorId: string;
  sensorName: string;
  type: 'temperature' | 'humidity' | 'soil_moisture' | 'ph' | 'light' | 'pressure';
  value: number;
  unit: string;
  timestamp: Date;
  farmId: string;
}

interface RealTimeAlert {
  id: string;
  type: 'weather' | 'livestock' | 'crop' | 'equipment' | 'security';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  message: string;
  farmId: string;
  timestamp: Date;
  acknowledged: boolean;
}

interface DashboardUpdate {
  farmId: string;
  metrics: {
    totalAnimals: number;
    activeCrops: number;
    alertsCount: number;
    efficiency: number;
  };
  timestamp: Date;
}

interface RealTimeDashboardProps {
  farmId: string;
}

const RealTimeDashboard: React.FC<RealTimeDashboardProps> = ({ farmId }) => {
  const { user } = useAuth();
  const [sensorReadings, setSensorReadings] = useState<SensorReading[]>([]);
  const [alerts, setAlerts] = useState<RealTimeAlert[]>([]);
  const [dashboardMetrics, setDashboardMetrics] = useState<DashboardUpdate | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected'>('connecting');
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  const { socket, isConnected, connect, disconnect } = useWebSocket({
    url: process.env.REACT_APP_WS_URL || 'ws://localhost:3001',
    options: {
      auth: {
        token: user?.token
      }
    }
  });

  // Handle WebSocket events
  useEffect(() => {
    if (!socket || !isConnected) return;

    // Join farm room for real-time updates
    socket.emit('join_farm', { farmId });

    // Handle sensor data updates
    socket.on('sensor_data', (data: SensorReading) => {
      if (data.farmId === farmId) {
        setSensorReadings(prev => {
          const filtered = prev.filter(reading => reading.sensorId !== data.sensorId);
          return [data, ...filtered].slice(0, 20); // Keep latest 20 readings
        });
        setLastUpdate(new Date());
      }
    });

    // Handle real-time alerts
    socket.on('farm_alert', (alert: RealTimeAlert) => {
      if (alert.farmId === farmId) {
        setAlerts(prev => [alert, ...prev].slice(0, 10)); // Keep latest 10 alerts
        
        // Show toast notification for critical alerts
        if (alert.severity === 'critical') {
          toast.error(`Critical Alert: ${alert.title}`, {
            description: alert.message,
            duration: 10000
          });
        } else if (alert.severity === 'high') {
          toast.warning(`High Priority: ${alert.title}`, {
            description: alert.message,
            duration: 5000
          });
        }
      }
    });

    // Handle dashboard updates
    socket.on('dashboard_update', (update: DashboardUpdate) => {
      if (update.farmId === farmId) {
        setDashboardMetrics(update);
        setLastUpdate(new Date());
      }
    });

    // Handle connection status
    socket.on('connect', () => {
      setConnectionStatus('connected');
      toast.success('Real-time connection established');
    });

    socket.on('disconnect', () => {
      setConnectionStatus('disconnected');
      toast.error('Real-time connection lost');
    });

    return () => {
      socket.off('sensor_data');
      socket.off('farm_alert');
      socket.off('dashboard_update');
      socket.off('connect');
      socket.off('disconnect');
    };
  }, [socket, isConnected, farmId]);

  // Update connection status based on WebSocket state
  useEffect(() => {
    setConnectionStatus(isConnected ? 'connected' : 'disconnected');
  }, [isConnected]);

  const acknowledgeAlert = useCallback(async (alertId: string) => {
    try {
      // Send acknowledgment to server
      if (socket) {
        socket.emit('acknowledge_alert', { alertId, farmId });
      }
      
      // Update local state
      setAlerts(prev => 
        prev.map(alert => 
          alert.id === alertId ? { ...alert, acknowledged: true } : alert
        )
      );
      
      toast.success('Alert acknowledged');
    } catch (error) {
      toast.error('Failed to acknowledge alert');
    }
  }, [socket, farmId]);

  const getSensorIcon = (type: string) => {
    switch (type) {
      case 'temperature': return <Thermometer className="h-4 w-4" />;
      case 'humidity': return <Droplets className="h-4 w-4" />;
      case 'soil_moisture': return <Droplets className="h-4 w-4" />;
      case 'wind': return <Wind className="h-4 w-4" />;
      default: return <Activity className="h-4 w-4" />;
    }
  };

  const getAlertSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'destructive';
      case 'high': return 'destructive';
      case 'medium': return 'default';
      case 'low': return 'secondary';
      default: return 'default';
    }
  };

  const formatTimestamp = (timestamp: Date) => {
    return new Date(timestamp).toLocaleTimeString();
  };

  return (
    <div className="space-y-6">
      {/* Connection Status Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <h2 className="text-2xl font-bold">Real-Time Dashboard</h2>
          <div className="flex items-center space-x-2">
            {connectionStatus === 'connected' ? (
              <>
                <Wifi className="h-4 w-4 text-green-500" />
                <Badge variant="outline" className="text-green-600 border-green-600">
                  Connected
                </Badge>
              </>
            ) : (
              <>
                <WifiOff className="h-4 w-4 text-red-500" />
                <Badge variant="outline" className="text-red-600 border-red-600">
                  {connectionStatus === 'connecting' ? 'Connecting...' : 'Disconnected'}
                </Badge>
              </>
            )}
          </div>
        </div>
        <div className="text-sm text-muted-foreground">
          Last update: {formatTimestamp(lastUpdate)}
        </div>
      </div>

      {/* Dashboard Metrics */}
      {dashboardMetrics && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Activity className="h-4 w-4 text-blue-500" />
                <div>
                  <p className="text-sm font-medium">Total Animals</p>
                  <p className="text-2xl font-bold">{dashboardMetrics.metrics.totalAnimals}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <TrendingUp className="h-4 w-4 text-green-500" />
                <div>
                  <p className="text-sm font-medium">Active Crops</p>
                  <p className="text-2xl font-bold">{dashboardMetrics.metrics.activeCrops}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="h-4 w-4 text-yellow-500" />
                <div>
                  <p className="text-sm font-medium">Active Alerts</p>
                  <p className="text-2xl font-bold">{dashboardMetrics.metrics.alertsCount}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Zap className="h-4 w-4 text-purple-500" />
                <div>
                  <p className="text-sm font-medium">Efficiency</p>
                  <p className="text-2xl font-bold">{dashboardMetrics.metrics.efficiency}%</p>
                  <Progress value={dashboardMetrics.metrics.efficiency} className="mt-2" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Main Content Tabs */}
      <Tabs defaultValue="sensors" className="space-y-4">
        <TabsList>
          <TabsTrigger value="sensors" className="flex items-center space-x-2">
            <Activity className="h-4 w-4" />
            <span>Sensors</span>
          </TabsTrigger>
          <TabsTrigger value="alerts" className="flex items-center space-x-2">
            <Bell className="h-4 w-4" />
            <span>Alerts ({alerts.filter(a => !a.acknowledged).length})</span>
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center space-x-2">
            <BarChart3 className="h-4 w-4" />
            <span>Analytics</span>
          </TabsTrigger>
        </TabsList>

        {/* Sensor Readings Tab */}
        <TabsContent value="sensors">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Activity className="h-5 w-5" />
                <span>Live Sensor Readings</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {sensorReadings.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Activity className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No sensor data available</p>
                  <p className="text-sm">Waiting for real-time updates...</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {sensorReadings.map((reading) => (
                    <Card key={reading.id} className="border-l-4 border-l-blue-500">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-2">
                            {getSensorIcon(reading.type)}
                            <span className="font-medium">{reading.sensorName}</span>
                          </div>
                          <Badge variant="outline">{reading.type}</Badge>
                        </div>
                        <div className="text-2xl font-bold">
                          {reading.value} {reading.unit}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {formatTimestamp(reading.timestamp)}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Alerts Tab */}
        <TabsContent value="alerts">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Bell className="h-5 w-5" />
                <span>Real-Time Alerts</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {alerts.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Bell className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No alerts at this time</p>
                  <p className="text-sm">Your farm is running smoothly!</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {alerts.map((alert) => (
                    <Alert key={alert.id} className={`${alert.acknowledged ? 'opacity-60' : ''}`}>
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription>
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-1">
                              <span className="font-medium">{alert.title}</span>
                              <Badge variant={getAlertSeverityColor(alert.severity) as any}>
                                {alert.severity}
                              </Badge>
                              <Badge variant="outline">{alert.type}</Badge>
                            </div>
                            <p className="text-sm">{alert.message}</p>
                            <p className="text-xs text-muted-foreground mt-1">
                              {formatTimestamp(alert.timestamp)}
                            </p>
                          </div>
                          {!alert.acknowledged && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => acknowledgeAlert(alert.id)}
                            >
                              Acknowledge
                            </Button>
                          )}
                        </div>
                      </AlertDescription>
                    </Alert>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <LineChart className="h-5 w-5" />
                  <span>Sensor Trends</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-muted-foreground">
                  <LineChart className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Sensor trend charts</p>
                  <p className="text-sm">Coming soon...</p>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <PieChart className="h-5 w-5" />
                  <span>Alert Distribution</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-muted-foreground">
                  <PieChart className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Alert distribution charts</p>
                  <p className="text-sm">Coming soon...</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default RealTimeDashboard;