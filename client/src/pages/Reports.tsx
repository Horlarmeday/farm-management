import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { FileText, Download, Filter, Calendar, TrendingUp, PieChart, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

export default function Reports() {
  const [selectedModule, setSelectedModule] = useState<string>("all");

  const { data: dashboardStats } = useQuery({
    queryKey: ["/api/dashboard/stats"],
  });
  
  const stats = dashboardStats || {
    totalRevenue: 0,
    productionEfficiency: 0,
    mortalityRate: 0
  };

  const { data: sales } = useQuery({
    queryKey: ["/api/sales"],
  });

  const { data: expenses } = useQuery({
    queryKey: ["/api/expenses"],
  });

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

  const predefinedReports = [
    {
      name: "Monthly Performance Summary",
      description: "Complete overview of farm performance for the current month",
      lastGenerated: "2024-01-15",
      status: "ready"
    },
    {
      name: "Annual Financial Statement",
      description: "Yearly financial report with profit/loss analysis",
      lastGenerated: "2024-01-01",
      status: "ready"
    },
    {
      name: "Livestock Health Report",
      description: "Health status and vaccination records for all livestock",
      lastGenerated: "2024-01-10",
      status: "pending"
    },
    {
      name: "Feed Consumption Analysis",
      description: "Feed usage patterns and efficiency metrics",
      lastGenerated: "2024-01-12",
      status: "ready"
    }
  ];

  const handleGenerateReport = (reportType: string) => {
    // This would typically trigger report generation
    console.log(`Generating ${reportType} report`);
  };

  const handleDownloadReport = (reportName: string) => {
    // This would typically download the report
    console.log(`Downloading ${reportName}`);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
                      <SelectItem value="all">All Modules</SelectItem>
                      <SelectItem value="poultry">Poultry</SelectItem>
                      <SelectItem value="livestock">Livestock</SelectItem>
                      <SelectItem value="fishery">Fishery</SelectItem>
                      <SelectItem value="inventory">Inventory</SelectItem>
                      <SelectItem value="finance">Finance</SelectItem>
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
                      <SelectItem value="pdf">PDF</SelectItem>
                      <SelectItem value="excel">Excel</SelectItem>
                      <SelectItem value="csv">CSV</SelectItem>
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
            {predefinedReports.map((report, index) => (
              <Card key={index}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-semibold">{report.name}</h3>
                        <Badge 
                          variant={report.status === "ready" ? "default" : "secondary"}
                        >
                          {report.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">
                        {report.description}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Last generated: {new Date(report.lastGenerated).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDownloadReport(report.name)}
                        disabled={report.status !== "ready"}
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Download
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => handleGenerateReport(report.name)}
                      >
                        Regenerate
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
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
                    <p className="text-2xl font-bold">₦{stats.totalRevenue.toLocaleString()}</p>
                    <p className="text-sm text-green-600">+12% from last month</p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Production Efficiency</p>
                    <p className="text-2xl font-bold">{stats.productionEfficiency}%</p>
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
                    <p className="text-2xl font-bold">4</p>
                    <p className="text-sm text-purple-600">All modules active</p>
                  </div>
                  <PieChart className="h-8 w-8 text-purple-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Mortality Rate</p>
                    <p className="text-2xl font-bold">{stats.mortalityRate}%</p>
                    <p className="text-sm text-green-600">Within normal range</p>
                  </div>
                  <FileText className="h-8 w-8 text-orange-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Analytics Charts Placeholder */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Revenue Trend</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center bg-muted rounded-lg">
                  <p className="text-muted-foreground">Revenue chart will be displayed here</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Production Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center bg-muted rounded-lg">
                  <p className="text-muted-foreground">Production pie chart will be displayed here</p>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Performance Metrics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-96 flex items-center justify-center bg-muted rounded-lg">
                <p className="text-muted-foreground">Detailed analytics dashboard will be displayed here</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
