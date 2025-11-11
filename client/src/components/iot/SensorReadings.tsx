import React, { useState, useMemo, useCallback, memo } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
} from 'recharts';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  CalendarDays,
  Download,
  TrendingUp,
  TrendingDown,
  Minus,
  AlertTriangle,
} from 'lucide-react';
import { format, subDays, subHours, subWeeks, subMonths } from 'date-fns';
import { iotService } from '@/services/iot.service';
import { IoTSensor, SensorReading } from '@/types/iot';
import { toast } from 'sonner';

interface SensorReadingsProps {
  sensor: IoTSensor;
}

type TimeRange = '1h' | '6h' | '24h' | '7d' | '30d' | 'custom';
type ChartType = 'line' | 'area';

interface ChartDataPoint {
  timestamp: string;
  value: number;
  formattedTime: string;
  alert?: boolean;
}

export const SensorReadings: React.FC<SensorReadingsProps> = memo(({ sensor }) => {
  const [timeRange, setTimeRange] = useState<TimeRange>('24h');
  const [chartType, setChartType] = useState<ChartType>('line');
  const [limit, setLimit] = useState<number>(100);

  // Calculate date range based on selection
  const dateRange = useMemo(() => {
    const now = new Date();
    let startDate: Date;

    switch (timeRange) {
      case '1h':
        startDate = subHours(now, 1);
        break;
      case '6h':
        startDate = subHours(now, 6);
        break;
      case '24h':
        startDate = subDays(now, 1);
        break;
      case '7d':
        startDate = subWeeks(now, 1);
        break;
      case '30d':
        startDate = subMonths(now, 1);
        break;
      default:
        startDate = subDays(now, 1);
    }

    return { startDate, endDate: now };
  }, [timeRange]);

  // Fetch sensor readings
  const {
    data: readings,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['sensor-readings', sensor.id, dateRange, limit],
    queryFn: () =>
      iotService.getSensorReadings(sensor.id, {
        startDate: dateRange.startDate.toISOString(),
        endDate: dateRange.endDate.toISOString(),
        limit,
      }),
    refetchInterval: timeRange === '1h' || timeRange === '6h' ? 30000 : undefined, // Auto-refresh for short ranges
  });

  // Process data for charts
  const chartData = useMemo(() => {
    if (!readings) return [];

    return readings.map((reading: SensorReading): ChartDataPoint => {
      const timestamp = new Date(reading.readingTime);
      const isAlert = Boolean(
        (sensor.configuration?.minThreshold &&
          reading.value < sensor.configuration.minThreshold) ||
        (sensor.configuration?.maxThreshold &&
          reading.value > sensor.configuration.maxThreshold)
      );

      return {
        timestamp: reading.readingTime.toString(),
        value: reading.value,
        formattedTime: format(timestamp, getTimeFormat(timeRange)),
        alert: isAlert,
      };
    });
  }, [readings, sensor.configuration, timeRange]);

  // Memoize time format function
  const getTimeFormat = useCallback((range: TimeRange): string => {
    switch (range) {
      case '1h':
      case '6h':
        return 'HH:mm';
      case '24h':
        return 'HH:mm';
      case '7d':
        return 'MMM dd';
      case '30d':
        return 'MMM dd';
      default:
        return 'HH:mm';
    }
  }, []);



  // Calculate statistics
  const statistics = useMemo(() => {
    if (!readings || readings.length === 0) {
      return {
        current: 0,
        average: 0,
        min: 0,
        max: 0,
        trend: 'stable' as const,
        alertCount: 0,
      };
    }

    const values = readings.map((r: SensorReading) => r.value);
    const current = values[values.length - 1] || 0;
    const average = values.reduce((sum: number, val: number) => sum + val, 0) / values.length;
    const min = Math.min(...values);
    const max = Math.max(...values);

    // Calculate trend (compare last 10% with first 10%)
    const segmentSize = Math.max(1, Math.floor(values.length * 0.1));
    const firstSegment = values.slice(0, segmentSize);
    const lastSegment = values.slice(-segmentSize);
    const firstAvg = firstSegment.reduce((sum: number, val: number) => sum + val, 0) / firstSegment.length;
    const lastAvg = lastSegment.reduce((sum: number, val: number) => sum + val, 0) / lastSegment.length;
    
    let trend: 'up' | 'down' | 'stable' = 'stable';
    const trendThreshold = average * 0.05; // 5% threshold
    if (lastAvg > firstAvg + trendThreshold) trend = 'up';
    else if (lastAvg < firstAvg - trendThreshold) trend = 'down';

    // Count alerts
    const alertCount = chartData.filter((point: ChartDataPoint) => point.alert).length;

    return {
      current,
      average,
      min,
      max,
      trend,
      alertCount,
    };
  }, [readings, chartData]);

  // Export data
  const handleExport = useCallback(async () => {
    try {
      const csvData = chartData
        .map(point => `${point.timestamp},${point.value}`)
        .join('\n');
      
      const blob = new Blob([`Timestamp,Value\n${csvData}`], {
        type: 'text/csv;charset=utf-8;',
      });
      
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `${sensor.name}_readings_${format(new Date(), 'yyyy-MM-dd')}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast.success('Data exported successfully');
    } catch (error) {
      toast.error('Failed to export data');
    }
  }, [chartData, sensor.name]);

  // Optimized callback functions
  const handleTimeRangeChange = useCallback((value: TimeRange) => {
    setTimeRange(value);
  }, []);

  const handleChartTypeChange = useCallback((value: ChartType) => {
    setChartType(value);
  }, []);

  const handleLimitChange = useCallback((value: string) => {
    setLimit(parseInt(value));
  }, []);

  // Custom tooltip for charts
  const CustomTooltip = ({ active, payload, label }: {
    active?: boolean;
    payload?: Array<{
      value: number;
      payload: ChartDataPoint;
    }>;
    label?: string;
  }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-background border rounded-lg p-3 shadow-lg">
          <p className="text-sm font-medium">{data.formattedTime}</p>
          <p className="text-sm">
            <span className="font-medium">Value:</span> {payload[0].value.toFixed(2)} {sensor.configuration?.unit}
          </p>
          {data.alert && (
            <p className="text-sm text-destructive flex items-center gap-1">
              <AlertTriangle className="h-3 w-3" />
              Threshold exceeded
            </p>
          )}
        </div>
      );
    }
    return null;
  };

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-muted-foreground">
            <p>Failed to load sensor readings</p>
            <Button variant="outline" onClick={() => refetch()} className="mt-2">
              Try Again
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex flex-wrap gap-2">
          <Select value={timeRange} onValueChange={handleTimeRangeChange}>
            <SelectTrigger className="w-[120px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1h">Last Hour</SelectItem>
              <SelectItem value="6h">Last 6 Hours</SelectItem>
              <SelectItem value="24h">Last 24 Hours</SelectItem>
              <SelectItem value="7d">Last 7 Days</SelectItem>
              <SelectItem value="30d">Last 30 Days</SelectItem>
            </SelectContent>
          </Select>

          <Select value={chartType} onValueChange={handleChartTypeChange}>
            <SelectTrigger className="w-[100px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="line">Line</SelectItem>
              <SelectItem value="area">Area</SelectItem>
            </SelectContent>
          </Select>

          <Select value={limit.toString()} onValueChange={handleLimitChange}>
            <SelectTrigger className="w-[120px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="50">50 points</SelectItem>
              <SelectItem value="100">100 points</SelectItem>
              <SelectItem value="200">200 points</SelectItem>
              <SelectItem value="500">500 points</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Button variant="outline" onClick={handleExport} disabled={!chartData.length}>
          <Download className="h-4 w-4 mr-2" />
          Export CSV
        </Button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Current</p>
                <p className="text-2xl font-bold">
                  {isLoading ? (
                    <Skeleton className="h-8 w-16" />
                  ) : (
                    `${statistics.current.toFixed(1)} ${sensor.configuration?.unit || ''}`
                  )}
                </p>
              </div>
              <div className="text-muted-foreground">
                {statistics.trend === 'up' && <TrendingUp className="h-5 w-5 text-green-500" />}
                {statistics.trend === 'down' && <TrendingDown className="h-5 w-5 text-red-500" />}
                {statistics.trend === 'stable' && <Minus className="h-5 w-5" />}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Average</p>
            <p className="text-2xl font-bold">
              {isLoading ? (
                <Skeleton className="h-8 w-16" />
              ) : (
                `${statistics.average.toFixed(1)} ${sensor.configuration?.unit || ''}`
              )}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Range</p>
            <p className="text-lg font-bold">
              {isLoading ? (
                <Skeleton className="h-6 w-20" />
              ) : (
                `${statistics.min.toFixed(1)} - ${statistics.max.toFixed(1)}`
              )}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Alerts</p>
                <p className="text-2xl font-bold">{statistics.alertCount}</p>
              </div>
              {statistics.alertCount > 0 && (
                <AlertTriangle className="h-5 w-5 text-destructive" />
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarDays className="h-5 w-5" />
            Sensor Readings
          </CardTitle>
          <CardDescription>
            {sensor.name} readings over the selected time period
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="h-[400px] flex items-center justify-center">
              <Skeleton className="h-full w-full" />
            </div>
          ) : chartData.length === 0 ? (
            <div className="h-[400px] flex items-center justify-center text-muted-foreground">
              <div className="text-center">
                <CalendarDays className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No readings available for the selected time period</p>
              </div>
            </div>
          ) : (
            <div className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                {chartType === 'area' ? (
                  <AreaChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                    <XAxis
                      dataKey="formattedTime"
                      tick={{ fontSize: 12 }}
                      tickLine={false}
                    />
                    <YAxis
                      tick={{ fontSize: 12 }}
                      tickLine={false}
                      domain={['dataMin - 5', 'dataMax + 5']}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Area
                      type="monotone"
                      dataKey="value"
                      stroke="hsl(var(--primary))"
                      fill="hsl(var(--primary))"
                      fillOpacity={0.2}
                      strokeWidth={2}
                    />
                  </AreaChart>
                ) : (
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                    <XAxis
                      dataKey="formattedTime"
                      tick={{ fontSize: 12 }}
                      tickLine={false}
                    />
                    <YAxis
                      tick={{ fontSize: 12 }}
                      tickLine={false}
                      domain={['dataMin - 5', 'dataMax + 5']}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Line
                      type="monotone"
                      dataKey="value"
                      stroke="hsl(var(--primary))"
                      strokeWidth={2}
                      dot={{ fill: 'hsl(var(--primary))', strokeWidth: 2, r: 3 }}
                      activeDot={{ r: 5, stroke: 'hsl(var(--primary))', strokeWidth: 2 }}
                    />
                  </LineChart>
                )}
              </ResponsiveContainer>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Threshold Indicators */}
      {(sensor.configuration?.minThreshold || sensor.configuration?.maxThreshold) && (
        <Card>
          <CardHeader>
            <CardTitle>Threshold Settings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {sensor.configuration?.minThreshold && (
                <Badge variant="outline">
                  Min: {sensor.configuration.minThreshold} {sensor.configuration?.unit}
                </Badge>
              )}
              {sensor.configuration?.maxThreshold && (
                <Badge variant="outline">
                  Max: {sensor.configuration.maxThreshold} {sensor.configuration?.unit}
                </Badge>
              )}
              {sensor.configuration?.alertsEnabled && (
                <Badge variant="secondary">
                  Alerts Enabled
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
});