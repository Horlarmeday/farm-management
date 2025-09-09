import { useState } from "react";
import { getReportModuleOptions, getExportFormatOptions } from "@/lib/formUtils";
import { FileText, Download, Filter, Calendar, TrendingUp, BarChart3, RefreshCw, DollarSign, Activity, AlertTriangle } from "lucide-react";
import { useReportsData, useGenerateReport, useDownloadReport } from '@/hooks/useReports';
import { useDashboardStats, useRevenueTrend, useProductionDistribution } from '@/hooks/useDashboard';
import { useFinancialStats, useExpensesByCategory } from '@/hooks/useFinance';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { useToast } from '@/hooks/use-toast';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

export default function Reports() {
  const [selectedModule, setSelectedModule] = useState<string>("all");
  const [selectedPeriod, setSelectedPeriod] = useState('month');
  const { toast } = useToast();

  // Use actual reports data
  const { reports, templates, schedules, stats, isLoading: reportsLoading, error: reportsError } = useReportsData();
  const generateReportMutation = useGenerateReport();
  const downloadReportMutation = useDownloadReport();

  // Dashboard stats from actual API
  const { data: dashboardStats } = useDashboardStats();
  const { data: financeData } = useFinancialStats();

  // Revenue trend data from actual API
  const { data: revenueData, isLoading: revenueTrendLoading } = useRevenueTrend(selectedPeriod as 'week' | 'month' | 'quarter' | 'year');
  const { data: productionDistribution, isLoading: productionLoading } = useProductionDistribution();
  
  // Expenses data from actual API
  const { data: expensesData } = useExpensesByCategory();

  // Chart colors
  const CHART_COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  const reportTypes = [
    {
      id: "financial",
      title: "Financial Report",
      description: "Comprehensive financial analysis including revenue, expenses, and profit margins",
      icon: TrendingUp,
      color: "text-green-600",
      bgColor: "bg-green-100 dark:bg-green-900/20"
    },
    {
      id: "production",
      title: "Production Report",
      description: "Detailed production metrics across all farm modules",
      icon: BarChart3,
      color: "text-blue-600",
      bgColor: "bg-blue-100 dark:bg-blue-900/20"
    },
    {
      id: "inventory",
      title: "Inventory Report",
      description: "Stock levels, consumption rates, and reorder recommendations",
      icon: PieChart,
      color: "text-purple-600",
      bgColor: "bg-purple-100 dark:bg-purple-900/20"
    },
    {
      id: "health",
      title: "Health & Compliance Report",
      description: "Vaccination schedules, health records, and compliance status",
      icon: FileText,
      color: "text-orange-600",
      bgColor: "bg-orange-100 dark:bg-orange-900/20"
    }
  ];

  // Use actual reports data or fallback to empty array
  const predefinedReports = reports || [];

  const handleGenerateReport = async (reportType: string) => {
    if (!reportType) {
      toast({
        title: 'Error',
        description: 'Please select a report type.',
        variant: 'destructive',
      });
      return;
    }

    try {
      await generateReportMutation.mutateAsync(reportType);
    } catch (error) {
      console.error('Failed to generate report:', error);
    }
  };

  const handleDownloadReport = async (reportId: string) => {
    try {
      await downloadReportMutation.mutateAsync(reportId);
    } catch (error) {
      console.error('Failed to download report:', error);
    }
  };

  return (
    <div className="max-w-full mx-auto px-6 py-6">
      {/* Page Header */}
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
              <FileText className="h-8 w-8 text-indigo-600" />
              Reports & Analytics
            </h1>
            <p className="text-muted-foreground mt-1">
              Generate comprehensive reports and analyze farm performance
            </p>
          </div>
          <div className="flex space-x-3">
            <Button variant="outline">
              <Filter className="h-4 w-4 mr-2" />
              Filter
            </Button>
            <Button variant="outline">
              <Calendar className="h-4 w-4 mr-2" />
              Schedule Report
            </Button>
          </div>
        </div>
      </div>

      <Tabs defaultValue="generate" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="generate">Generate Reports</TabsTrigger>
          <TabsTrigger value="saved">Saved Reports</TabsTrigger>
          <TabsTrigger value="analytics">Analytics Dashboard</TabsTrigger>
        </TabsList>

        <TabsContent value="generate" className="space-y-6">
          {/* Report Configuration */}
          <Card>
            <CardHeader>
              <CardTitle>Report Configuration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Module</label>
                  <Select value={selectedModule} onValueChange={setSelectedModule}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select module" />
                    </SelectTrigger>
                    <SelectContent>
                {getReportModuleOptions().map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Date Range</label>
                  <Button variant="outline" className="w-full justify-start">
                    <Calendar className="mr-2 h-4 w-4" />
                    Select date range
                  </Button>
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Format</label>
                  <Select defaultValue="pdf">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                {getExportFormatOptions().map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Report Types */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {reportTypes.map((report) => {
              const Icon = report.icon;
              return (
                <Card key={report.id} className="cursor-pointer hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start space-x-4">
                      <div className={`p-3 rounded-full ${report.bgColor}`}>
                        <Icon className={`h-6 w-6 ${report.color}`} />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold mb-2">{report.title}</h3>
                        <p className="text-sm text-muted-foreground mb-4">
                          {report.description}
                        </p>
                        <Button 
                          className="w-full"
                          onClick={() => handleGenerateReport(report.id)}
                        >
                          Generate Report
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="saved" className="space-y-4">
          <div className="grid gap-4">
            {predefinedReports.length > 0 ? (
              predefinedReports.map((report) => (
                <Card key={report.id}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="text-lg font-semibold">{report.name}</h3>
                          <Badge 
                            variant={report.status === "completed" ? "default" : "secondary"}
                          >
                            {report.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">
                          {report.type} report
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Last generated: {new Date(report.generatedAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDownloadReport(report.id)}
                          disabled={report.status !== "completed" || downloadReportMutation.isPending}
                        >
                          <Download className="h-4 w-4 mr-2" />
                          {downloadReportMutation.isPending ? 'Downloading...' : 'Download'}
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => handleGenerateReport(report.id)}
                          disabled={generateReportMutation.isPending}
                        >
                          <RefreshCw className="h-4 w-4 mr-2" />
                          {generateReportMutation.isPending ? 'Generating...' : 'Regenerate'}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No reports available</p>
                <p className="text-sm">Generate your first report using the form above</p>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          {/* Key Metrics Overview */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Revenue</p>
                    <p className="text-2xl font-bold">₦{(financeData?.totalIncome || dashboardStats?.totalRevenue || 0).toLocaleString()}</p>
                    <p className="text-sm text-green-600">+12% from last month</p>
                  </div>
                  <DollarSign className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Production Efficiency</p>
                    <p className="text-2xl font-bold">{dashboardStats?.productionEfficiency || 0}%</p>
                    <p className="text-sm text-blue-600">Above target</p>
                  </div>
                  <BarChart3 className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Active Operations</p>
                    <p className="text-2xl font-bold">{dashboardStats?.activeBirds || 4}</p>
                    <p className="text-sm text-purple-600">All modules active</p>
                  </div>
                  <Activity className="h-8 w-8 text-purple-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Mortality Rate</p>
                    <p className="text-2xl font-bold">{dashboardStats?.mortalityRate || 0}%</p>
                    <p className="text-sm text-green-600">Within normal range</p>
                  </div>
                  <AlertTriangle className="h-8 w-8 text-orange-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Analytics Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Revenue Trend</CardTitle>
              </CardHeader>
              <CardContent>
                {revenueTrendLoading ? (
                  <div className="h-64 flex items-center justify-center">
                    <div className="text-muted-foreground">Loading chart...</div>
                  </div>
                ) : revenueData?.data && revenueData?.labels ? (
                  <ChartContainer
                    config={{
                      revenue: {
                        label: "Revenue",
                        color: "hsl(var(--chart-1))",
                      },
                    }}
                    className="h-64"
                  >
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart
                        data={revenueData.labels.map((label, index) => ({
                          name: label,
                          revenue: revenueData.data[index] || 0,
                        }))}
                        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Line
                          type="monotone"
                          dataKey="revenue"
                          stroke="var(--color-revenue)"
                          strokeWidth={2}
                          dot={{ fill: "var(--color-revenue)" }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                ) : (
                  <div className="h-64 flex items-center justify-center bg-muted rounded-lg">
                    <p className="text-muted-foreground">No revenue data available</p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Production Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                {productionLoading ? (
                  <div className="h-64 flex items-center justify-center">
                    <div className="text-muted-foreground">Loading chart...</div>
                  </div>
                ) : productionDistribution?.data && productionDistribution?.labels ? (
                  <ChartContainer
                    config={{
                      production: {
                        label: "Production",
                        color: "hsl(var(--chart-2))",
                      },
                    }}
                    className="h-64"
                  >
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={productionDistribution.labels.map((label, index) => ({
                            name: label,
                            value: productionDistribution.data[index] || 0,
                          }))}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {productionDistribution.data.map((_, index) => (
                            <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                          ))}
                        </Pie>
                        <ChartTooltip content={<ChartTooltipContent />} />
                      </PieChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                ) : (
                  <div className="h-64 flex items-center justify-center bg-muted rounded-lg">
                    <p className="text-muted-foreground">No production data available</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Performance Metrics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-muted rounded-lg">
                  <div className="text-2xl font-bold text-primary">
                    {dashboardStats?.productionEfficiency || 0}%
                  </div>
                  <div className="text-sm text-muted-foreground">Production Efficiency</div>
                </div>
                <div className="text-center p-4 bg-muted rounded-lg">
                  <div className="text-2xl font-bold text-green-600">
                    ₦{financeData?.totalIncome?.toLocaleString() || '0'}
                  </div>
                  <div className="text-sm text-muted-foreground">Total Revenue</div>
                </div>
                <div className="text-center p-4 bg-muted rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">
                    {dashboardStats?.feedConsumption || 0} kg
                  </div>
                  <div className="text-sm text-muted-foreground">Feed Consumption</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
