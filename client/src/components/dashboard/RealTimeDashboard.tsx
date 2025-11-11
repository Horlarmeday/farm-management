import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Separator } from '../ui/separator';
import { ScrollArea } from '../ui/scroll-area';
import { useWebSocketContext, useRealTimeAlerts, useRealTimeSensorData, useRealTimeDashboard } from '../../contexts/WebSocketContext';
import { useFarmAlerts, useIoTSensorData, useDashboardUpdates } from '../../hooks/useWebSocket';
import { 
  Activity, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  Database, 
  Thermometer, 
  Droplets, 
  Wind, 
  Zap,
  Wifi,
  WifiOff,
  RefreshCw,
  Bell,
  TrendingUp,
  TrendingDown
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { format } from 'date-fns';

interface RealTimeDashboardProps {
  farmId: string;
  className?: string;
}

const RealTimeDashboard: React.FC<RealTimeDashboardProps> = ({ farmId, className }) => {
  const { connectionState, currentFarmId, connect, requestFarmStatus } = useWebSocketContext();
  const { latestAlert } = useRealTimeAlerts();
  const { latestSensorData } = useRealTimeSensorData();
  const { latestDashboardUpdate } = useRealTimeDashboard();
  
  // Use hooks for historical data
  const { alerts } = useFarmAlerts(farmId);
  const { sensorData, sensorsByType, getSensorDataByType } = useIoTSensorData(farmId);
  const { updates, getUpdatesByType } = useDashboardUpdates(farmId);
  
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

  // Connect to farm if not already connected
  useEffect(() => {
    if (farmId && currentFarmId !== farmId && !connectionState.isConnecting) {
      connect(farmId).catch(console.error);
    }
  }, [farmId, currentFarmId, connectionState.isConnecting, connect]);

  // Update last refresh time when new data arrives
  useEffect(() => {
    if (latestSensorData || latestDashboardUpdate || latestAlert) {
      setLastRefresh(new Date());
    }
  }, [latestSensorData, latestDashboardUpdate, latestAlert]);

  const handleRefresh = () => {
    if (farmId) {
      requestFarmStatus(farmId);
      setLastRefresh(new Date());
    }
  };

  const getConnectionStatusIcon = () => {
    if (connectionState.isConnecting) {
      return <RefreshCw className="h-4 w-4 animate-spin" />;
    }
    return connectionState.isConnected ? 
      <Wifi className="h-4 w-4 text-green-500" /> : 
      <WifiOff className="h-4 w-4 text-red-500" />;
  };

  const getConnectionStatusText = () => {
    if (connectionState.isConnecting) return 'Connecting...';
    if (connectionState.isConnected) return 'Connected';
    if (connectionState.error) return `Error: ${connectionState.error}`;
    return 'Disconnected';
  };

  const getSensorIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'temperature':
        return <Thermometer className="h-4 w-4" />;
      case 'humidity':
        return <Droplets className="h-4 w-4" />;
      case 'wind':
        return <Wind className="h-4 w-4" />;
      case 'power':
      case 'voltage':
        return <Zap className="h-4 w-4" />;
      default:
        return <Activity className="h-4 w-4" />;
    }
  };

  const getSensorStatusColor = (status: string) => {
    switch (status) {
      case 'normal':
        return 'text-green-500';
      case 'warning':
        return 'text-yellow-500';
      case 'abnormal':
      case 'critical':
        return 'text-red-500';
      default:
        return 'text-gray-500';
    }
  };

  const getAlertSeverityColor = (severity: string) => {
    switch (severity) {
      case 'low':
        return 'bg-blue-100 text-blue-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'high':
        return 'bg-orange-100 text-orange-800';
      case 'critical':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const recentSensorTypes = Object.keys(sensorsByType).slice(0, 4);
  const recentAlerts = alerts.slice(0, 5);
  const recentUpdates = updates.slice(0, 3);

  return (
    <div className={cn('space-y-6', className)}>
      {/* Connection Status Header */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              {getConnectionStatusIcon()}
              <CardTitle className="text-lg">Real-Time Dashboard</CardTitle>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-sm text-muted-foreground">
                {getConnectionStatusText()}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefresh}
                disabled={connectionState.isConnecting}
              >
                <RefreshCw className={cn('h-4 w-4 mr-2', {
                  'animate-spin': connectionState.isConnecting
                })} />
                Refresh
              </Button>
            </div>
          </div>
          <CardDescription>
            Last updated: {format(lastRefresh, 'MMM dd, yyyy HH:mm:ss')}
          </CardDescription>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Live Sensor Data */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Activity className="h-5 w-5" />
              <span>Live Sensor Data</span>
              {latestSensorData && (
                <Badge variant="secondary" className="ml-auto">
                  Live
                </Badge>
              )}
            </CardTitle>
            <CardDescription>
              Real-time IoT sensor readings from your farm
            </CardDescription>
          </CardHeader>
          <CardContent>
            {recentSensorTypes.length > 0 ? (
              <div className="space-y-4">
                {recentSensorTypes.map((type) => {
                  const typeData = getSensorDataByType(type);
                  const latest = typeData[0];
                  
                  if (!latest) return null;
                  
                  return (
                    <div key={type} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        {getSensorIcon(type)}
                        <div>
                          <div className="font-medium capitalize">{type}</div>
                          <div className="text-sm text-muted-foreground">
                            {latest.location ? `(${latest.location.x}, ${latest.location.y})` : 'Unknown location'}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold">
                          {latest.value} {latest.unit}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {format(new Date(latest.timestamp), 'HH:mm:ss')}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Database className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>No sensor data available</p>
                <p className="text-sm">Waiting for IoT sensors to connect...</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Alerts */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Bell className="h-5 w-5" />
              <span>Recent Alerts</span>
              {latestAlert && (
                <Badge variant="destructive" className="ml-auto">
                  New
                </Badge>
              )}
            </CardTitle>
            <CardDescription>
              Latest farm alerts and notifications
            </CardDescription>
          </CardHeader>
          <CardContent>
            {recentAlerts.length > 0 ? (
              <ScrollArea className="h-64">
                <div className="space-y-3">
                  {recentAlerts.map((alert, index) => (
                    <div key={`${alert.id}-${index}`} className="flex items-start space-x-3 p-3 border rounded-lg">
                      <AlertTriangle className={cn('h-4 w-4 mt-0.5', {
                        'text-red-500': alert.severity === 'critical',
                        'text-orange-500': alert.severity === 'high',
                        'text-yellow-500': alert.severity === 'medium',
                        'text-blue-500': alert.severity === 'low'
                      })} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-1">
                          <Badge className={getAlertSeverityColor(alert.severity)}>
                            {alert.severity}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {format(new Date(alert.timestamp), 'HH:mm')}
                          </span>
                        </div>
                        <p className="text-sm font-medium">{alert.message}</p>
                        <p className="text-xs text-muted-foreground">
                          {alert.type}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <CheckCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>No recent alerts</p>
                <p className="text-sm">Your farm is running smoothly</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Dashboard Updates */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <TrendingUp className="h-5 w-5" />
            <span>Live Updates</span>
            {latestDashboardUpdate && (
              <Badge variant="outline" className="ml-auto">
                Updated
              </Badge>
            )}
          </CardTitle>
          <CardDescription>
            Real-time farm metrics and status updates
          </CardDescription>
        </CardHeader>
        <CardContent>
          {recentUpdates.length > 0 ? (
            <div className="space-y-4">
              {recentUpdates.map((update, index) => (
                <div key={`${update.id}-${index}`} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    {update.type === 'increase' ? (
                      <TrendingUp className="h-4 w-4 text-green-500" />
                    ) : (
                      <TrendingDown className="h-4 w-4 text-red-500" />
                    )}
                    <div>
                      <div className="font-medium">{update.metric}</div>
                      <div className="text-sm text-muted-foreground">
                        {update.description}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold">
                      {update.value} {update.unit}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {format(new Date(update.timestamp), 'HH:mm:ss')}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Clock className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>No recent updates</p>
              <p className="text-sm">Dashboard metrics will appear here</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Connection Details */}
      {currentFarmId && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>Connected to farm:</span>
              <span className="font-medium">{currentFarmId}</span>
            </div>
            <Separator className="my-2" />
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>Connection status:</span>
              <span className={cn('font-medium', {
                'text-green-600': connectionState.isConnected,
                'text-yellow-600': connectionState.isConnecting,
                'text-red-600': !connectionState.isConnected && !connectionState.isConnecting
              })}>
                {connectionState.isConnecting ? 'Connecting...' : 
                 connectionState.isConnected ? 'Connected' : 'Disconnected'}
              </span>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default RealTimeDashboard;