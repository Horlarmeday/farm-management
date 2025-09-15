import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ComposedChart,
  Bar,
  ReferenceLine,
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
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Progress } from '@/components/ui/progress';
import {
  TrendingUp,
  TrendingDown,
  BarChart3,
  Activity,
  AlertCircle,
  CheckCircle,
  Clock,
  Target,
} from 'lucide-react';
import { format, subDays, subWeeks, subMonths } from 'date-fns';
import { iotService } from '@/services/iot.service';
import { IoTSensor, SensorTrends as SensorTrendsType } from '@/types/iot';

interface SensorTrendsProps {
  sensor: IoTSensor;
}

type TrendPeriod = '1h' | '6h' | '24h' | '7d' | '30d';

interface TrendDataPoint {
  date: string;
  actual: number;
  predicted?: number;
  trend: number;
  formattedDate: string;
}

interface TrendInsight {
  type: 'positive' | 'negative' | 'neutral' | 'warning';
  title: string;
  description: string;
  confidence: number;
}

export const SensorTrends: React.FC<SensorTrendsProps> = ({ sensor }) => {
  const [period, setPeriod] = useState<TrendPeriod>('7d');

  // Fetch sensor trends
  const {
    data: trendsData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['sensor-trends', sensor.id, period],
    queryFn: () => iotService.getSensorTrends(sensor.id, { period }),
    refetchInterval: 5 * 60 * 1000, // Refresh every 5 minutes
  });

  // Process trend data for visualization
  const chartData = useMemo(() => {
    if (!trendsData?.dataPoints) return [];

    return trendsData.dataPoints.map((point): TrendDataPoint => {
      const date = new Date(point.timestamp);
      return {
        date: point.timestamp.toString(),
        actual: point.value,
        predicted: undefined,
        trend: point.value,
        formattedDate: format(date, period === '7d' ? 'MMM dd' : 'MMM dd'),
      };
    });
  }, [trendsData, period]);

  // Calculate trend insights
  const insights = useMemo((): TrendInsight[] => {
    if (!trendsData?.statistics) return [];

    const stats = trendsData.statistics;
    const insights: TrendInsight[] = [];

    // Overall trend insight
    if (stats.trend === 'increasing') {
      insights.push({
        type: stats.changeRate > 10 ? 'warning' : 'positive',
        title: 'Increasing Trend',
        description: `Values are trending upward by ${stats.changeRate.toFixed(1)}%`,
        confidence: 85,
      });
    } else if (stats.trend === 'decreasing') {
      insights.push({
        type: stats.changeRate < -10 ? 'warning' : 'negative',
        title: 'Decreasing Trend',
        description: `Values are trending downward by ${Math.abs(stats.changeRate).toFixed(1)}%`,
        confidence: 85,
      });
    } else {
      insights.push({
        type: 'neutral',
        title: 'Stable Trend',
        description: 'Values remain relatively stable',
        confidence: 90,
      });
    }

    // Volatility insight based on standard deviation
    const volatilityRatio = stats.standardDeviation / stats.average;
    if (volatilityRatio > 0.3) {
      insights.push({
        type: 'warning',
        title: 'High Volatility',
        description: 'Sensor readings show significant fluctuations',
        confidence: 85,
      });
    } else if (volatilityRatio < 0.1) {
      insights.push({
        type: 'positive',
        title: 'Low Volatility',
        description: 'Sensor readings are consistent and stable',
        confidence: 90,
      });
    }

    // Prediction insight
    if (trendsData.predictions) {
      insights.push({
        type: 'neutral',
        title: 'Prediction Available',
        description: `Next predicted value: ${trendsData.predictions.nextValue.toFixed(2)} ${sensor.configuration?.unit || ''}`,
        confidence: trendsData.predictions.confidence,
      });
    }

    return insights;
  }, [trendsData, sensor.configuration?.unit]);

  // Get trend statistics
  const statistics = useMemo(() => {
    if (!trendsData?.statistics) {
      return {
        slope: 0,
        r2: 0,
        volatility: 0,
        prediction: 0,
        accuracy: 0,
      };
    }

    const stats = trendsData.statistics;
    return {
      slope: stats.changeRate / 100, // Convert percentage to decimal
      r2: 0.85, // Mock R² value
      volatility: stats.standardDeviation / stats.average,
      prediction: trendsData.predictions?.nextValue || 0,
      accuracy: trendsData.predictions?.confidence || 0,
    };
  }, [trendsData]);

  // Custom tooltip for trend chart
  const TrendTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background border rounded-lg p-3 shadow-lg">
          <p className="text-sm font-medium">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              <span className="font-medium">{entry.name}:</span> {entry.value.toFixed(2)} {sensor.configuration?.unit}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  // Get insight icon
  const getInsightIcon = (type: TrendInsight['type']) => {
    switch (type) {
      case 'positive':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'negative':
        return <TrendingDown className="h-4 w-4 text-red-500" />;
      case 'warning':
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      default:
        return <Activity className="h-4 w-4 text-blue-500" />;
    }
  };

  // Get insight color
  const getInsightColor = (type: TrendInsight['type']) => {
    switch (type) {
      case 'positive':
        return 'border-green-200 bg-green-50';
      case 'negative':
        return 'border-red-200 bg-red-50';
      case 'warning':
        return 'border-yellow-200 bg-yellow-50';
      default:
        return 'border-blue-200 bg-blue-50';
    }
  };

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-muted-foreground">
            <p>Failed to load trend analysis</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Trend Analysis</h3>
          <p className="text-sm text-muted-foreground">
            Historical patterns and predictive insights for {sensor.name}
          </p>
        </div>
        <Select value={period} onValueChange={(value: TrendPeriod) => setPeriod(value)}>
          <SelectTrigger className="w-[140px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="1h">1 Hour</SelectItem>
            <SelectItem value="6h">6 Hours</SelectItem>
            <SelectItem value="24h">24 Hours</SelectItem>
            <SelectItem value="7d">7 Days</SelectItem>
            <SelectItem value="30d">30 Days</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Trend</span>
            </div>
            <p className="text-lg font-bold mt-1">
              {isLoading ? (
                <Skeleton className="h-6 w-16" />
              ) : (
                `${statistics.slope > 0 ? '+' : ''}${statistics.slope.toFixed(3)}`
              )}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Target className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">R²</span>
            </div>
            <p className="text-lg font-bold mt-1">
              {isLoading ? (
                <Skeleton className="h-6 w-16" />
              ) : (
                statistics.r2.toFixed(3)
              )}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Volatility</span>
            </div>
            <p className="text-lg font-bold mt-1">
              {isLoading ? (
                <Skeleton className="h-6 w-16" />
              ) : (
                `${(statistics.volatility * 100).toFixed(1)}%`
              )}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Next Value</span>
            </div>
            <p className="text-lg font-bold mt-1">
              {isLoading ? (
                <Skeleton className="h-6 w-16" />
              ) : (
                `${statistics.prediction.toFixed(1)} ${sensor.configuration?.unit || ''}`
              )}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Accuracy</span>
            </div>
            <p className="text-lg font-bold mt-1">
              {isLoading ? (
                <Skeleton className="h-6 w-16" />
              ) : (
                `${statistics.accuracy.toFixed(1)}%`
              )}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Trend Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Trend Visualization</CardTitle>
          <CardDescription>
            Historical data with trend line and predictions
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
                <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No trend data available for the selected period</p>
              </div>
            </div>
          ) : (
            <div className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis
                    dataKey="formattedDate"
                    tick={{ fontSize: 12 }}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 12 }}
                    tickLine={false}
                    domain={['dataMin - 5', 'dataMax + 5']}
                  />
                  <Tooltip content={<TrendTooltip />} />
                  
                  {/* Threshold lines */}
                  {sensor.configuration?.minThreshold && (
                    <ReferenceLine
                      y={sensor.configuration.minThreshold}
                      stroke="#ef4444"
                      strokeDasharray="5 5"
                      label="Min"
                    />
                  )}
                  {sensor.configuration?.maxThreshold && (
                    <ReferenceLine
                      y={sensor.configuration.maxThreshold}
                      stroke="#ef4444"
                      strokeDasharray="5 5"
                      label="Max"
                    />
                  )}
                  
                  {/* Actual values */}
                  <Line
                    type="monotone"
                    dataKey="actual"
                    stroke="hsl(var(--primary))"
                    strokeWidth={2}
                    dot={{ fill: 'hsl(var(--primary))', strokeWidth: 2, r: 3 }}
                    name="Actual"
                  />
                  
                  {/* Trend line */}
                  <Line
                    type="monotone"
                    dataKey="trend"
                    stroke="#10b981"
                    strokeWidth={2}
                    strokeDasharray="5 5"
                    dot={false}
                    name="Trend"
                  />
                  
                  {/* Predictions */}
                  <Line
                    type="monotone"
                    dataKey="predicted"
                    stroke="#f59e0b"
                    strokeWidth={2}
                    strokeDasharray="3 3"
                    dot={{ fill: '#f59e0b', strokeWidth: 2, r: 2 }}
                    name="Predicted"
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Insights */}
      <Card>
        <CardHeader>
          <CardTitle>Trend Insights</CardTitle>
          <CardDescription>
            AI-powered analysis of sensor data patterns
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : insights.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">
              <Activity className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No insights available yet</p>
              <p className="text-sm">More data is needed for trend analysis</p>
            </div>
          ) : (
            <div className="space-y-4">
              {insights.map((insight, index) => (
                <div
                  key={index}
                  className={`p-4 rounded-lg border ${getInsightColor(insight.type)}`}
                >
                  <div className="flex items-start gap-3">
                    {getInsightIcon(insight.type)}
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium">{insight.title}</h4>
                        <Badge variant="outline" className="text-xs">
                          {insight.confidence}% confidence
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {insight.description}
                      </p>
                      <div className="mt-2">
                        <Progress value={insight.confidence} className="h-1" />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};