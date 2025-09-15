import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Progress } from '../ui/progress';
import { Alert, AlertDescription } from '../ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import {
  TrendingUp,
  TrendingDown,
  Brain,
  BarChart3,
  LineChart,
  PieChart,
  CloudRain,
  Thermometer,
  Droplets,
  Sprout,
  AlertTriangle,
  CheckCircle,
  Clock,
  RefreshCw,
  Download,
  Target
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { toast } from 'sonner';

interface YieldPrediction {
  cropType: string;
  predictedYield: number;
  confidence: number;
  factors: {
    weather: number;
    soil: number;
    irrigation: number;
    fertilizer: number;
  };
  recommendations: string[];
  timeframe: string;
}

interface WeatherForecast {
  date: string;
  temperature: {
    min: number;
    max: number;
  };
  humidity: number;
  precipitation: number;
  windSpeed: number;
  conditions: string;
}

interface AutomatedInsight {
  id: string;
  type: 'yield_prediction' | 'weather_alert' | 'soil_health' | 'irrigation_recommendation' | 'pest_risk';
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  confidence: number;
  actionRequired: boolean;
  recommendations: string[];
  validUntil: string;
  createdAt: string;
}

interface PredictionAccuracy {
  totalPredictions: number;
  averageConfidence: number;
  confidenceDistribution: {
    high: number;
    medium: number;
    low: number;
  };
  predictionTypes: Record<string, number>;
}

interface PredictiveAnalyticsDashboardProps {
  farmId: string;
}

const PredictiveAnalyticsDashboard: React.FC<PredictiveAnalyticsDashboardProps> = ({ farmId }) => {
  const { user } = useAuth();
  const [yieldPrediction, setYieldPrediction] = useState<YieldPrediction | null>(null);
  const [weatherForecast, setWeatherForecast] = useState<WeatherForecast[]>([]);
  const [insights, setInsights] = useState<AutomatedInsight[]>([]);
  const [accuracy, setAccuracy] = useState<PredictionAccuracy | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedCropType, setSelectedCropType] = useState('general');
  const [selectedPeriod, setSelectedPeriod] = useState('7d');
  const [isTrainingModel, setIsTrainingModel] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  const cropTypes = [
    { value: 'general', label: 'General' },
    { value: 'corn', label: 'Corn' },
    { value: 'wheat', label: 'Wheat' },
    { value: 'soybeans', label: 'Soybeans' },
    { value: 'rice', label: 'Rice' },
    { value: 'tomatoes', label: 'Tomatoes' },
    { value: 'potatoes', label: 'Potatoes' }
  ];

  const periods = [
    { value: '24h', label: 'Last 24 Hours' },
    { value: '7d', label: 'Last 7 Days' },
    { value: '30d', label: 'Last 30 Days' },
    { value: '90d', label: 'Last 90 Days' }
  ];

  // Fetch yield prediction
  const fetchYieldPrediction = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `/api/analytics/predictions/yield/${farmId}?cropType=${selectedCropType}`,
        {
          headers: {
            'Authorization': `Bearer ${user?.token}`
          }
        }
      );

      if (response.ok) {
        const data = await response.json();
        setYieldPrediction(data.data);
      } else {
        throw new Error('Failed to fetch yield prediction');
      }
    } catch (error: any) {
      console.error('Error fetching yield prediction:', error);
      toast.error('Failed to load yield prediction');
    } finally {
      setLoading(false);
    }
  }, [farmId, selectedCropType, user?.token]);

  // Fetch weather forecast
  const fetchWeatherForecast = useCallback(async () => {
    try {
      const response = await fetch(
        `/api/analytics/predictions/weather/${farmId}?days=7`,
        {
          headers: {
            'Authorization': `Bearer ${user?.token}`
          }
        }
      );

      if (response.ok) {
        const data = await response.json();
        setWeatherForecast(data.data.forecast || []);
      } else {
        throw new Error('Failed to fetch weather forecast');
      }
    } catch (error: any) {
      console.error('Error fetching weather forecast:', error);
      toast.error('Failed to load weather forecast');
    }
  }, [farmId, user?.token]);

  // Fetch automated insights
  const fetchInsights = useCallback(async () => {
    try {
      const response = await fetch(
        `/api/analytics/insights/${farmId}`,
        {
          headers: {
            'Authorization': `Bearer ${user?.token}`
          }
        }
      );

      if (response.ok) {
        const data = await response.json();
        setInsights(data.data.insights || []);
      } else {
        throw new Error('Failed to fetch insights');
      }
    } catch (error: any) {
      console.error('Error fetching insights:', error);
      toast.error('Failed to load insights');
    }
  }, [farmId, user?.token]);

  // Fetch prediction accuracy metrics
  const fetchAccuracy = useCallback(async () => {
    try {
      const response = await fetch(
        `/api/analytics/metrics/accuracy/${farmId}?days=${selectedPeriod.replace('d', '').replace('h', '')}`,
        {
          headers: {
            'Authorization': `Bearer ${user?.token}`
          }
        }
      );

      if (response.ok) {
        const data = await response.json();
        setAccuracy(data.data.metrics);
      } else {
        throw new Error('Failed to fetch accuracy metrics');
      }
    } catch (error: any) {
      console.error('Error fetching accuracy metrics:', error);
      toast.error('Failed to load accuracy metrics');
    }
  }, [farmId, selectedPeriod, user?.token]);

  // Train yield model
  const trainYieldModel = useCallback(async () => {
    try {
      setIsTrainingModel(true);
      const response = await fetch(
        `/api/analytics/models/yield/train/${farmId}`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${user?.token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.ok) {
        const data = await response.json();
        toast.success('Model training started successfully', {
          description: data.data.estimatedDuration
        });
      } else {
        throw new Error('Failed to start model training');
      }
    } catch (error: any) {
      console.error('Error training model:', error);
      toast.error('Failed to start model training');
    } finally {
      setIsTrainingModel(false);
    }
  }, [farmId, user?.token]);

  // Export predictions
  const exportPredictions = useCallback(async (format: 'json' | 'csv') => {
    try {
      const response = await fetch(
        `/api/analytics/export/${farmId}?format=${format}&days=30`,
        {
          headers: {
            'Authorization': `Bearer ${user?.token}`
          }
        }
      );

      if (response.ok) {
        if (format === 'csv') {
          const blob = await response.blob();
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `predictions_${farmId}_${Date.now()}.csv`;
          document.body.appendChild(a);
          a.click();
          window.URL.revokeObjectURL(url);
          document.body.removeChild(a);
        } else {
          const data = await response.json();
          const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `predictions_${farmId}_${Date.now()}.json`;
          document.body.appendChild(a);
          a.click();
          window.URL.revokeObjectURL(url);
          document.body.removeChild(a);
        }
        toast.success(`Predictions exported as ${format.toUpperCase()}`);
      } else {
        throw new Error('Failed to export predictions');
      }
    } catch (error: any) {
      console.error('Error exporting predictions:', error);
      toast.error('Failed to export predictions');
    }
  }, [farmId, user?.token]);

  // Refresh all data
  const refreshData = useCallback(async () => {
    setLastUpdate(new Date());
    await Promise.all([
      fetchYieldPrediction(),
      fetchWeatherForecast(),
      fetchInsights(),
      fetchAccuracy()
    ]);
  }, [fetchYieldPrediction, fetchWeatherForecast, fetchInsights, fetchAccuracy]);

  // Initial data load
  useEffect(() => {
    refreshData();
  }, [refreshData]);

  // Update data when crop type or period changes
  useEffect(() => {
    fetchYieldPrediction();
  }, [fetchYieldPrediction]);

  useEffect(() => {
    fetchAccuracy();
  }, [fetchAccuracy]);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'destructive';
      case 'high': return 'destructive';
      case 'medium': return 'default';
      case 'low': return 'secondary';
      default: return 'default';
    }
  };

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'yield_prediction': return <Target className="h-4 w-4" />;
      case 'weather_alert': return <CloudRain className="h-4 w-4" />;
      case 'soil_health': return <Sprout className="h-4 w-4" />;
      case 'irrigation_recommendation': return <Droplets className="h-4 w-4" />;
      case 'pest_risk': return <AlertTriangle className="h-4 w-4" />;
      default: return <Brain className="h-4 w-4" />;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Brain className="h-6 w-6 text-purple-500" />
          <h2 className="text-2xl font-bold">Predictive Analytics</h2>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={refreshData}
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => exportPredictions('json')}
          >
            <Download className="h-4 w-4 mr-2" />
            Export JSON
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => exportPredictions('csv')}
          >
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2">
          <label className="text-sm font-medium">Crop Type:</label>
          <Select value={selectedCropType} onValueChange={setSelectedCropType}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {cropTypes.map((crop) => (
                <SelectItem key={crop.value} value={crop.value}>
                  {crop.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center space-x-2">
          <label className="text-sm font-medium">Period:</label>
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
        </div>
        <div className="text-sm text-muted-foreground">
          Last updated: {lastUpdate.toLocaleTimeString()}
        </div>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="predictions" className="space-y-4">
        <TabsList>
          <TabsTrigger value="predictions">Yield Predictions</TabsTrigger>
          <TabsTrigger value="weather">Weather Forecast</TabsTrigger>
          <TabsTrigger value="insights">AI Insights</TabsTrigger>
          <TabsTrigger value="accuracy">Model Accuracy</TabsTrigger>
        </TabsList>

        {/* Yield Predictions Tab */}
        <TabsContent value="predictions">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Yield Prediction Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Target className="h-5 w-5" />
                    <span>Yield Prediction</span>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={trainYieldModel}
                    disabled={isTrainingModel}
                  >
                    {isTrainingModel ? (
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Brain className="h-4 w-4 mr-2" />
                    )}
                    Train Model
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="text-center py-8">
                    <RefreshCw className="h-8 w-8 mx-auto mb-4 animate-spin" />
                    <p>Loading prediction...</p>
                  </div>
                ) : yieldPrediction ? (
                  <div className="space-y-4">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-green-600">
                        {yieldPrediction.predictedYield.toFixed(1)} tons
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Predicted yield for {yieldPrediction.cropType}
                      </div>
                      <div className="mt-2">
                        <Badge variant="outline">
                          {(yieldPrediction.confidence * 100).toFixed(1)}% confidence
                        </Badge>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <h4 className="font-medium">Contributing Factors:</h4>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Weather</span>
                          <Progress value={yieldPrediction.factors.weather * 100} className="w-24" />
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Soil Quality</span>
                          <Progress value={yieldPrediction.factors.soil * 100} className="w-24" />
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Irrigation</span>
                          <Progress value={yieldPrediction.factors.irrigation * 100} className="w-24" />
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Fertilizer</span>
                          <Progress value={yieldPrediction.factors.fertilizer * 100} className="w-24" />
                        </div>
                      </div>
                    </div>
                    
                    {yieldPrediction.recommendations.length > 0 && (
                      <div className="space-y-2">
                        <h4 className="font-medium">Recommendations:</h4>
                        <ul className="text-sm space-y-1">
                          {yieldPrediction.recommendations.map((rec, index) => (
                            <li key={index} className="flex items-start space-x-2">
                              <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                              <span>{rec}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Target className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No prediction available</p>
                    <p className="text-sm">Try training the model first</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Model Training Status */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Brain className="h-5 w-5" />
                  <span>Model Status</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Model Status</span>
                    <Badge variant={isTrainingModel ? 'default' : 'secondary'}>
                      {isTrainingModel ? 'Training' : 'Ready'}
                    </Badge>
                  </div>
                  
                  {accuracy && (
                    <>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Average Confidence</span>
                        <span className="text-sm">{(accuracy.averageConfidence * 100).toFixed(1)}%</span>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Total Predictions</span>
                        <span className="text-sm">{accuracy.totalPredictions}</span>
                      </div>
                      
                      <div className="space-y-2">
                        <span className="text-sm font-medium">Confidence Distribution</span>
                        <div className="space-y-1">
                          <div className="flex items-center justify-between text-xs">
                            <span>High (&gt;80%)</span>
                            <span>{accuracy.confidenceDistribution.high}</span>
                          </div>
                          <div className="flex items-center justify-between text-xs">
                            <span>Medium (60-80%)</span>
                            <span>{accuracy.confidenceDistribution.medium}</span>
                          </div>
                          <div className="flex items-center justify-between text-xs">
                            <span>Low (&lt;60%)</span>
                            <span>{accuracy.confidenceDistribution.low}</span>
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Weather Forecast Tab */}
        <TabsContent value="weather">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <CloudRain className="h-5 w-5" />
                <span>7-Day Weather Forecast</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {weatherForecast.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <CloudRain className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No weather forecast available</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-7 gap-4">
                  {weatherForecast.map((day, index) => (
                    <Card key={index} className="text-center">
                      <CardContent className="p-4">
                        <div className="text-sm font-medium mb-2">
                          {formatDate(day.date)}
                        </div>
                        <div className="text-xs text-muted-foreground mb-2">
                          {day.conditions}
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center justify-center space-x-1">
                            <Thermometer className="h-3 w-3" />
                            <span className="text-xs">
                              {day.temperature.max}°/{day.temperature.min}°
                            </span>
                          </div>
                          <div className="flex items-center justify-center space-x-1">
                            <Droplets className="h-3 w-3" />
                            <span className="text-xs">{day.humidity}%</span>
                          </div>
                          <div className="flex items-center justify-center space-x-1">
                            <CloudRain className="h-3 w-3" />
                            <span className="text-xs">{day.precipitation}mm</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* AI Insights Tab */}
        <TabsContent value="insights">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Brain className="h-5 w-5" />
                <span>Automated Insights</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {insights.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Brain className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No insights available</p>
                  <p className="text-sm">AI insights will appear here as data is collected</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {insights.map((insight) => (
                    <Alert key={insight.id}>
                      <div className="flex items-start space-x-3">
                        {getInsightIcon(insight.type)}
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-medium">{insight.title}</h4>
                            <div className="flex items-center space-x-2">
                              <Badge variant={getSeverityColor(insight.severity) as any}>
                                {insight.severity}
                              </Badge>
                              <Badge variant="outline">
                                {(insight.confidence * 100).toFixed(0)}% confidence
                              </Badge>
                              {insight.actionRequired && (
                                <Badge variant="destructive">
                                  Action Required
                                </Badge>
                              )}
                            </div>
                          </div>
                          <AlertDescription>
                            <p className="mb-2">{insight.description}</p>
                            {insight.recommendations.length > 0 && (
                              <div>
                                <p className="font-medium mb-1">Recommendations:</p>
                                <ul className="text-sm space-y-1">
                                  {insight.recommendations.map((rec, index) => (
                                    <li key={index} className="flex items-start space-x-2">
                                      <CheckCircle className="h-3 w-3 text-green-500 mt-1 flex-shrink-0" />
                                      <span>{rec}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}
                            <div className="flex items-center justify-between mt-2 text-xs text-muted-foreground">
                              <span>Created: {formatDate(insight.createdAt)}</span>
                              <span>Valid until: {formatDate(insight.validUntil)}</span>
                            </div>
                          </AlertDescription>
                        </div>
                      </div>
                    </Alert>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Model Accuracy Tab */}
        <TabsContent value="accuracy">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <BarChart3 className="h-5 w-5" />
                  <span>Prediction Accuracy</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {accuracy ? (
                  <div className="space-y-4">
                    <div className="text-center">
                      <div className="text-3xl font-bold">
                        {(accuracy.averageConfidence * 100).toFixed(1)}%
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Average Confidence
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Total Predictions</span>
                        <span className="font-medium">{accuracy.totalPredictions}</span>
                      </div>
                      
                      <div className="space-y-2">
                        <span className="text-sm font-medium">Confidence Distribution</span>
                        <div className="space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="text-xs">High (&gt;80%)</span>
                            <div className="flex items-center space-x-2">
                              <Progress 
                                value={(accuracy.confidenceDistribution.high / accuracy.totalPredictions) * 100} 
                                className="w-20" 
                              />
                              <span className="text-xs w-8">{accuracy.confidenceDistribution.high}</span>
                            </div>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-xs">Medium (60-80%)</span>
                            <div className="flex items-center space-x-2">
                              <Progress 
                                value={(accuracy.confidenceDistribution.medium / accuracy.totalPredictions) * 100} 
                                className="w-20" 
                              />
                              <span className="text-xs w-8">{accuracy.confidenceDistribution.medium}</span>
                            </div>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-xs">Low (&lt;60%)</span>
                            <div className="flex items-center space-x-2">
                              <Progress 
                                value={(accuracy.confidenceDistribution.low / accuracy.totalPredictions) * 100} 
                                className="w-20" 
                              />
                              <span className="text-xs w-8">{accuracy.confidenceDistribution.low}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No accuracy data available</p>
                  </div>
                )}
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <PieChart className="h-5 w-5" />
                  <span>Prediction Types</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {accuracy && Object.keys(accuracy.predictionTypes).length > 0 ? (
                  <div className="space-y-2">
                    {Object.entries(accuracy.predictionTypes).map(([type, count]) => (
                      <div key={type} className="flex items-center justify-between">
                        <span className="text-sm capitalize">{type.replace('_', ' ')}</span>
                        <div className="flex items-center space-x-2">
                          <Progress 
                            value={(count / accuracy.totalPredictions) * 100} 
                            className="w-20" 
                          />
                          <span className="text-sm w-8">{count}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <PieChart className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No prediction type data available</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PredictiveAnalyticsDashboard;