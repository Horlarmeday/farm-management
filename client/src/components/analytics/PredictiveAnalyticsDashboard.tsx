import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import {
  TrendingUp,
  TrendingDown,
  Brain,
  Target,
  AlertTriangle,
  Activity,
  BarChart3,
  PieChart as PieChartIcon,
  Zap,
  Calendar,
  Download
} from 'lucide-react';

// Mock data for predictive analytics
const mockPredictions = {
  eggProduction: {
    current: 1250,
    predicted: 1380,
    confidence: 87,
    trend: 'up',
    forecast: [
      { date: '2024-01', actual: 1200, predicted: 1220 },
      { date: '2024-02', actual: 1250, predicted: 1260 },
      { date: '2024-03', actual: null, predicted: 1320 },
      { date: '2024-04', actual: null, predicted: 1380 },
      { date: '2024-05', actual: null, predicted: 1420 },
      { date: '2024-06', actual: null, predicted: 1450 }
    ]
  },
  feedConsumption: {
    current: 2800,
    predicted: 2950,
    confidence: 82,
    trend: 'up',
    forecast: [
      { date: '2024-01', actual: 2750, predicted: 2760 },
      { date: '2024-02', actual: 2800, predicted: 2810 },
      { date: '2024-03', actual: null, predicted: 2870 },
      { date: '2024-04', actual: null, predicted: 2950 },
      { date: '2024-05', actual: null, predicted: 3020 },
      { date: '2024-06', actual: null, predicted: 3080 }
    ]
  },
  revenue: {
    current: 45000,
    predicted: 52000,
    confidence: 91,
    trend: 'up',
    forecast: [
      { date: '2024-01', actual: 42000, predicted: 42500 },
      { date: '2024-02', actual: 45000, predicted: 45200 },
      { date: '2024-03', actual: null, predicted: 48000 },
      { date: '2024-04', actual: null, predicted: 52000 },
      { date: '2024-05', actual: null, predicted: 55000 },
      { date: '2024-06', actual: null, predicted: 58000 }
    ]
  }
};

const mockRiskFactors = [
  { factor: 'Disease Outbreak Risk', probability: 15, impact: 'High', color: '#ef4444' },
  { factor: 'Feed Price Volatility', probability: 35, impact: 'Medium', color: '#f59e0b' },
  { factor: 'Weather Impact', probability: 25, impact: 'Medium', color: '#f59e0b' },
  { factor: 'Market Demand Shift', probability: 20, impact: 'Low', color: '#10b981' }
];

const mockOptimizations = [
  {
    category: 'Feed Efficiency',
    current: 2.1,
    optimized: 1.9,
    savings: '₦125,000/month',
    confidence: 89
  },
  {
    category: 'Production Timing',
    current: '85%',
    optimized: '92%',
    savings: '₦85,000/month',
    confidence: 76
  },
  {
    category: 'Resource Allocation',
    current: '78%',
    optimized: '88%',
    savings: '₦65,000/month',
    confidence: 82
  }
];

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

interface PredictiveAnalyticsDashboardProps {
  className?: string;
}

const PredictiveAnalyticsDashboard: React.FC<PredictiveAnalyticsDashboardProps> = ({ className }) => {
  const [selectedMetric, setSelectedMetric] = useState('eggProduction');
  const [isLoading, setIsLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  // Simulate model training/updating
  const handleRefreshModels = async () => {
    setIsLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    setLastUpdated(new Date());
    setIsLoading(false);
  };

  const currentPrediction = mockPredictions[selectedMetric as keyof typeof mockPredictions];

  return (
    <div className={`space-y-6 p-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Predictive Analytics</h1>
          <p className="text-gray-600 mt-1">
            AI-powered insights and forecasting for your farm operations
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Button
            onClick={handleRefreshModels}
            disabled={isLoading}
            variant="outline"
            className="flex items-center space-x-2"
          >
            <Brain className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            <span>{isLoading ? 'Training Models...' : 'Refresh Models'}</span>
          </Button>
          <Button variant="outline" className="flex items-center space-x-2">
            <Download className="h-4 w-4" />
            <span>Export Report</span>
          </Button>
        </div>
      </div>

      {/* Model Status */}
      <Alert>
        <Activity className="h-4 w-4" />
        <AlertDescription>
          Models last updated: {lastUpdated.toLocaleString()}. 
          Next automatic update in 6 hours.
        </AlertDescription>
      </Alert>

      <Tabs defaultValue="forecasting" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="forecasting">Forecasting</TabsTrigger>
          <TabsTrigger value="optimization">Optimization</TabsTrigger>
          <TabsTrigger value="risk-analysis">Risk Analysis</TabsTrigger>
          <TabsTrigger value="insights">AI Insights</TabsTrigger>
        </TabsList>

        {/* Forecasting Tab */}
        <TabsContent value="forecasting" className="space-y-6">
          {/* Metric Selection */}
          <div className="flex space-x-2">
            {Object.entries(mockPredictions).map(([key, data]) => (
              <Button
                key={key}
                variant={selectedMetric === key ? 'default' : 'outline'}
                onClick={() => setSelectedMetric(key)}
                className="capitalize"
              >
                {key.replace(/([A-Z])/g, ' $1').trim()}
              </Button>
            ))}
          </div>

          {/* Prediction Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Current Value</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {currentPrediction.current.toLocaleString()}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Predicted Value</CardTitle>
                {currentPrediction.trend === 'up' ? (
                  <TrendingUp className="h-4 w-4 text-green-500" />
                ) : (
                  <TrendingDown className="h-4 w-4 text-red-500" />
                )}
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">
                  {currentPrediction.predicted.toLocaleString()}
                </div>
                <p className="text-xs text-muted-foreground">
                  {((currentPrediction.predicted - currentPrediction.current) / currentPrediction.current * 100).toFixed(1)}% change
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Confidence</CardTitle>
                <Target className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{currentPrediction.confidence}%</div>
                <Progress value={currentPrediction.confidence} className="mt-2" />
              </CardContent>
            </Card>
          </div>

          {/* Forecast Chart */}
          <Card>
            <CardHeader>
              <CardTitle>6-Month Forecast</CardTitle>
              <CardDescription>
                Historical data vs. AI predictions with confidence intervals
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={currentPrediction.forecast}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="actual"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    name="Actual"
                    connectNulls={false}
                  />
                  <Line
                    type="monotone"
                    dataKey="predicted"
                    stroke="#10b981"
                    strokeWidth={2}
                    strokeDasharray="5 5"
                    name="Predicted"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Optimization Tab */}
        <TabsContent value="optimization" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {mockOptimizations.map((opt, index) => (
              <Card key={index}>
                <CardHeader>
                  <CardTitle className="text-lg">{opt.category}</CardTitle>
                  <CardDescription>
                    AI-recommended optimization
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Current:</span>
                    <span className="font-semibold">{opt.current}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Optimized:</span>
                    <span className="font-semibold text-green-600">{opt.optimized}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Potential Savings:</span>
                    <span className="font-bold text-blue-600">{opt.savings}</span>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Confidence:</span>
                      <span>{opt.confidence}%</span>
                    </div>
                    <Progress value={opt.confidence} />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Risk Analysis Tab */}
        <TabsContent value="risk-analysis" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Risk Assessment</CardTitle>
              <CardDescription>
                Potential risks and their impact on farm operations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockRiskFactors.map((risk, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <AlertTriangle className="h-5 w-5" style={{ color: risk.color }} />
                      <div>
                        <h4 className="font-medium">{risk.factor}</h4>
                        <p className="text-sm text-gray-600">Impact: {risk.impact}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold">{risk.probability}%</div>
                      <Progress value={risk.probability} className="w-20" />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Risk Distribution Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Risk Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={mockRiskFactors}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ factor, probability }) => `${factor}: ${probability}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="probability"
                  >
                    {mockRiskFactors.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* AI Insights Tab */}
        <TabsContent value="insights" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Zap className="h-5 w-5 text-yellow-500" />
                  <span>Key Insights</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-3 bg-blue-50 rounded-lg">
                  <h4 className="font-medium text-blue-900">Production Optimization</h4>
                  <p className="text-sm text-blue-700 mt-1">
                    Feed conversion ratio can be improved by 12% with adjusted feeding schedule.
                  </p>
                </div>
                <div className="p-3 bg-green-50 rounded-lg">
                  <h4 className="font-medium text-green-900">Market Timing</h4>
                  <p className="text-sm text-green-700 mt-1">
                    Optimal selling window identified for next month with 15% price premium.
                  </p>
                </div>
                <div className="p-3 bg-yellow-50 rounded-lg">
                  <h4 className="font-medium text-yellow-900">Resource Planning</h4>
                  <p className="text-sm text-yellow-700 mt-1">
                    Inventory levels suggest restocking feed supplies within 2 weeks.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Calendar className="h-5 w-5 text-purple-500" />
                  <span>Recommended Actions</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-start space-x-3">
                  <Badge variant="outline" className="mt-1">High</Badge>
                  <div>
                    <h4 className="font-medium">Adjust Feed Schedule</h4>
                    <p className="text-sm text-gray-600">Implement new feeding times by next week</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <Badge variant="outline" className="mt-1">Medium</Badge>
                  <div>
                    <h4 className="font-medium">Monitor Weather Patterns</h4>
                    <p className="text-sm text-gray-600">Prepare for potential temperature changes</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <Badge variant="outline" className="mt-1">Low</Badge>
                  <div>
                    <h4 className="font-medium">Review Market Prices</h4>
                    <p className="text-sm text-gray-600">Weekly price analysis for optimal selling</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PredictiveAnalyticsDashboard;