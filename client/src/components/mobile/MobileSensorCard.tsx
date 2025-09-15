import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Thermometer,
  Droplets,
  Wind,
  Sun,
  Activity,
  Wifi,
  WifiOff,
  Battery,
  BatteryLow,
  AlertTriangle,
  MoreVertical,
  Settings,
  Trash2,
  Eye,
  Zap,
} from 'lucide-react';
import { IoTSensor, SensorType } from '@/types/iot';
import { cn } from '@/lib/utils';

interface MobileSensorCardProps {
  sensor: IoTSensor;
  onEdit: () => void;
  onDelete: () => void;
  onSelect: () => void;
  className?: string;
}

export const MobileSensorCard: React.FC<MobileSensorCardProps> = ({
  sensor,
  onEdit,
  onDelete,
  onSelect,
  className,
}) => {
  // Get sensor type icon
  const getSensorIcon = (type: SensorType) => {
    const iconClass = 'h-5 w-5';
    switch (type) {
      case SensorType.TEMPERATURE:
        return <Thermometer className={iconClass} />;
      case SensorType.HUMIDITY:
        return <Droplets className={iconClass} />;
      case SensorType.WIND_SPEED:
        return <Wind className={iconClass} />;
      case SensorType.LIGHT:
        return <Sun className={iconClass} />;
      case SensorType.SOIL_MOISTURE:
        return <Droplets className={iconClass} />;
      case SensorType.PH:
        return <Activity className={iconClass} />;
      case SensorType.ELECTRICAL_CONDUCTIVITY:
        return <Zap className={iconClass} />;
      default:
        return <Activity className={iconClass} />;
    }
  };

  // Get sensor type label
  const getSensorTypeLabel = (type: SensorType) => {
    switch (type) {
      case SensorType.TEMPERATURE:
        return 'Temperature';
      case SensorType.HUMIDITY:
        return 'Humidity';
      case SensorType.WIND_SPEED:
        return 'Wind Speed';
      case SensorType.LIGHT:
        return 'Light';
      case SensorType.SOIL_MOISTURE:
        return 'Soil Moisture';
      case SensorType.PH:
        return 'pH Level';
      case SensorType.ELECTRICAL_CONDUCTIVITY:
        return 'EC';
      default:
        return 'Unknown';
    }
  };

  // Determine sensor status
  const getSensorStatus = () => {
    if (!sensor.isActive) return { status: 'inactive', color: 'bg-gray-500', label: 'Inactive' };
    
    if (!sensor.lastReading) {
      return { status: 'no-data', color: 'bg-yellow-500', label: 'No Data' };
    }

    const lastReadingTime = new Date(sensor.lastReading.timestamp).getTime();
    const now = Date.now();
    const timeDiff = now - lastReadingTime;
    
    // Check for alerts
    if (sensor.configuration) {
      const { value } = sensor.lastReading;
      const { minThreshold, maxThreshold } = sensor.configuration;
      const hasAlert = (minThreshold && value < minThreshold) || (maxThreshold && value > maxThreshold);
      
      if (hasAlert) {
        return { status: 'warning', color: 'bg-red-500', label: 'Alert' };
      }
    }
    
    if (timeDiff > 24 * 60 * 60 * 1000) {
      return { status: 'offline', color: 'bg-red-500', label: 'Offline' };
    }
    
    if (timeDiff > 60 * 60 * 1000) {
      return { status: 'warning', color: 'bg-yellow-500', label: 'Warning' };
    }
    
    return { status: 'online', color: 'bg-green-500', label: 'Online' };
  };

  const sensorStatus = getSensorStatus();

  // Format time ago
  const getTimeAgo = (timestamp: string) => {
    const now = Date.now();
    const time = new Date(timestamp).getTime();
    const diff = now - time;
    
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return 'Just now';
  };

  return (
    <Card 
      className={cn(
        'relative touch-manipulation select-none transition-all duration-200',
        'active:scale-95 hover:shadow-md',
        className
      )}
      onClick={onSelect}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className="flex-shrink-0 p-2 rounded-lg bg-gray-100">
              {getSensorIcon(sensor.type)}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-base truncate">{sensor.name}</h3>
              <p className="text-sm text-muted-foreground truncate">{sensor.location}</p>
              <Badge variant="outline" className="text-xs mt-1">
                {getSensorTypeLabel(sensor.type)}
              </Badge>
            </div>
          </div>
          
          <div className="flex items-center gap-2 flex-shrink-0">
            {/* Status indicator */}
            <div className={`w-3 h-3 rounded-full ${sensorStatus.color}`} />
            
            {/* Actions menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-8 w-8 p-0 touch-manipulation"
                  onClick={(e) => e.stopPropagation()}
                >
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onSelect(); }}>
                  <Eye className="mr-2 h-4 w-4" />
                  View Details
                </DropdownMenuItem>
                <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onEdit(); }}>
                  <Settings className="mr-2 h-4 w-4" />
                  Edit Sensor
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={(e) => { e.stopPropagation(); onDelete(); }}
                  className="text-red-600"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        <div className="space-y-3">
          {/* Current reading */}
          {sensor.lastReading ? (
            <div className="bg-gray-50 rounded-lg p-3">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium">Current Value</span>
                <span className="text-lg font-bold">
                  {sensor.lastReading.value.toFixed(1)}
                  {sensor.configuration?.unit && (
                    <span className="text-sm font-normal ml-1">
                      {sensor.configuration.unit}
                    </span>
                  )}
                </span>
              </div>
              <div className="text-xs text-muted-foreground">
                {getTimeAgo(sensor.lastReading.timestamp)}
              </div>
            </div>
          ) : (
            <div className="bg-gray-50 rounded-lg p-3 text-center">
              <span className="text-sm text-muted-foreground">No recent readings</span>
            </div>
          )}

          {/* Status and connection info */}
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              {sensor.isActive ? (
                <>
                  <Wifi className="h-4 w-4 text-green-500" />
                  <span className="text-green-600">Connected</span>
                </>
              ) : (
                <>
                  <WifiOff className="h-4 w-4 text-red-500" />
                  <span className="text-red-600">Disconnected</span>
                </>
              )}
            </div>
            
            {/* Battery level */}
            {sensor.batteryLevel && (
              <div className="flex items-center gap-1">
                {sensor.batteryLevel < 20 ? (
                  <BatteryLow className="h-4 w-4 text-red-500" />
                ) : (
                  <Battery className="h-4 w-4 text-green-500" />
                )}
                <span className={cn(
                  'text-sm font-medium',
                  sensor.batteryLevel < 20 ? 'text-red-600' : 'text-green-600'
                )}>
                  {sensor.batteryLevel}%
                </span>
              </div>
            )}
          </div>

          {/* Alert indicator */}
          {sensorStatus.status === 'warning' && (
            <div className="flex items-center gap-2 text-red-600 bg-red-50 rounded-lg p-2">
              <AlertTriangle className="h-4 w-4" />
              <span className="text-sm font-medium">Threshold exceeded</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};