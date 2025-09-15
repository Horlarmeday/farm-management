import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
  Thermometer,
  Droplets,
  Activity,
  Zap,
  MoreVertical,
  Edit,
  Trash2,
  Settings,
  TrendingUp,
  TrendingDown,
  Minus,
  Wifi,
  WifiOff,
  Battery,
  BatteryLow,
  AlertTriangle,
} from 'lucide-react';
import { IoTSensor, SensorType } from '@/types/iot';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';

interface SensorCardProps {
  sensor: IoTSensor;
  onSelect: (sensor: IoTSensor) => void;
  onEdit?: (sensor: IoTSensor) => void;
  onDelete: (sensorId: string) => void;
  isDeleting?: boolean;
  className?: string;
}

export const SensorCard: React.FC<SensorCardProps> = ({
  sensor,
  onSelect,
  onEdit,
  onDelete,
  isDeleting = false,
  className,
}) => {
  // Get sensor type icon
  const getSensorIcon = (type: SensorType) => {
    const iconProps = { className: 'h-4 w-4' };
    switch (type) {
      case SensorType.TEMPERATURE:
        return <Thermometer {...iconProps} />;
      case SensorType.HUMIDITY:
      case SensorType.SOIL_MOISTURE:
        return <Droplets {...iconProps} />;
      case SensorType.LIGHT:
        return <Zap {...iconProps} />;
      case SensorType.PH:
      default:
        return <Activity {...iconProps} />;
    }
  };

  // Get sensor status
  const getSensorStatus = () => {
    if (!sensor.isActive) {
      return { status: 'inactive', color: 'secondary', label: 'Inactive' };
    }

    if (!sensor.lastReading) {
      return { status: 'no-data', color: 'secondary', label: 'No Data' };
    }

    const now = new Date();
    const lastReading = new Date(sensor.lastReading.timestamp);
    const timeDiff = now.getTime() - lastReading.getTime();
    const hoursDiff = timeDiff / (1000 * 60 * 60);

    if (hoursDiff > 24) {
      return { status: 'offline', color: 'destructive', label: 'Offline' };
    } else if (hoursDiff > 6) {
      return { status: 'warning', color: 'warning', label: 'Warning' };
    } else {
      return { status: 'online', color: 'success', label: 'Online' };
    }
  };

  // Get connection status icon
  const getConnectionIcon = () => {
    const status = getSensorStatus();
    if (status.status === 'online') {
      return <Wifi className="h-3 w-3 text-green-500" />;
    } else {
      return <WifiOff className="h-3 w-3 text-red-500" />;
    }
  };

  // Get battery status (mock data for now)
  const getBatteryIcon = () => {
    // In a real implementation, this would come from sensor metadata
    const batteryLevel = Math.random() * 100; // Mock battery level
    if (batteryLevel > 20) {
      return <Battery className="h-3 w-3 text-green-500" />;
    } else {
      return <BatteryLow className="h-3 w-3 text-red-500" />;
    }
  };

  // Format sensor type label
  const getSensorTypeLabel = (type: SensorType) => {
    const labels: Record<SensorType, string> = {
      [SensorType.TEMPERATURE]: 'Temperature',
      [SensorType.HUMIDITY]: 'Humidity',
      [SensorType.SOIL_MOISTURE]: 'Soil Moisture',
      [SensorType.PH]: 'pH Level',
      [SensorType.LIGHT]: 'Light',
      [SensorType.PRESSURE]: 'Pressure',
      [SensorType.WIND_SPEED]: 'Wind Speed',
      [SensorType.RAINFALL]: 'Rainfall',
      [SensorType.CO2]: 'CO2',
      [SensorType.AMMONIA]: 'Ammonia',
      [SensorType.ELECTRICAL_CONDUCTIVITY]: 'Electrical Conductivity',
    };
    return labels[type] || 'Unknown';
  };

  // Get last reading display
  const getLastReadingDisplay = () => {
    if (!sensor.lastReading) {
      return 'No readings yet';
    }
    return formatDistanceToNow(new Date(sensor.lastReading.timestamp), { addSuffix: true });
  };

  // Check if sensor has alerts
  const hasAlerts = sensor.configuration?.alertsEnabled && sensor.isActive;

  const status = getSensorStatus();

  return (
    <Card
      className={cn(
        'cursor-pointer transition-all duration-200 hover:shadow-md',
        'border-l-4',
        status.status === 'online' && 'border-l-green-500',
        status.status === 'warning' && 'border-l-yellow-500',
        status.status === 'offline' && 'border-l-red-500',
        status.status === 'inactive' && 'border-l-gray-400',
        status.status === 'no-data' && 'border-l-gray-400',
        className
      )}
      onClick={() => onSelect(sensor)}
    >
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {getSensorIcon(sensor.type)}
            <CardTitle className="text-sm font-medium truncate">
              {sensor.name}
            </CardTitle>
          </div>
          <div className="flex items-center space-x-1">
            <Badge variant={status.color as any} className="text-xs">
              {status.label}
            </Badge>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0"
                  onClick={(e) => e.stopPropagation()}
                >
                  <MoreVertical className="h-3 w-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={(e) => {
                  e.stopPropagation();
                  onSelect(sensor);
                }}>
                  <TrendingUp className="mr-2 h-4 w-4" />
                  View Details
                </DropdownMenuItem>
                {onEdit && (
                  <DropdownMenuItem onClick={(e) => {
                    e.stopPropagation();
                    onEdit(sensor);
                  }}>
                    <Edit className="mr-2 h-4 w-4" />
                    Edit
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem onClick={(e) => {
                  e.stopPropagation();
                  // Handle calibration
                }}>
                  <Settings className="mr-2 h-4 w-4" />
                  Calibrate
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <DropdownMenuItem
                      className="text-red-600 focus:text-red-600"
                      onSelect={(e) => e.preventDefault()}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
                    </DropdownMenuItem>
                  </AlertDialogTrigger>
                  <AlertDialogContent onClick={(e) => e.stopPropagation()}>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete Sensor</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to delete "{sensor.name}"? This action
                        cannot be undone and will remove all associated sensor data.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => onDelete(sensor.id)}
                        disabled={isDeleting}
                        className="bg-red-600 hover:bg-red-700"
                      >
                        {isDeleting ? 'Deleting...' : 'Delete'}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        <div className="space-y-3">
          {/* Sensor Type and Location */}
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">
              {getSensorTypeLabel(sensor.type)}
            </span>
            <span className="text-muted-foreground truncate ml-2">
              {sensor.location}
            </span>
          </div>

          {/* Device ID */}
          <div className="text-xs text-muted-foreground">
            Device: {sensor.deviceId}
          </div>

          {/* Status Icons */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              {getConnectionIcon()}
              {getBatteryIcon()}
              {hasAlerts && (
                <AlertTriangle className="h-3 w-3 text-yellow-500" />
              )}
            </div>
            <div className="text-xs text-muted-foreground">
              {getLastReadingDisplay()}
            </div>
          </div>

          {/* Thresholds (if configured) */}
          {(sensor.configuration?.minThreshold !== undefined ||
            sensor.configuration?.maxThreshold !== undefined) && (
            <div className="text-xs text-muted-foreground">
              Range: {sensor.configuration.minThreshold ?? '−∞'} to{' '}
              {sensor.configuration.maxThreshold ?? '+∞'}
              {sensor.configuration.unit && ` ${sensor.configuration.unit}`}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};