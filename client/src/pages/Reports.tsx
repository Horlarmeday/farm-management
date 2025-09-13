import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import ProfitLossReport from '../components/reports/ProfitLossReport';
import { BarChart3, TrendingUp, FileText, Calendar } from 'lucide-react';

const Reports: React.FC = () => {
  return (
    <div className="container mx-auto py-6">
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Reports</h1>
            <p className="text-muted-foreground">
              Comprehensive financial and operational reports for your farm
            </p>
          </div>
        </div>

        {/* Reports Tabs */}
        <Tabs defaultValue="profit-loss" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="profit-loss" className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              P&L Report
            </TabsTrigger>
            <TabsTrigger value="cash-flow" className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              Cash Flow
            </TabsTrigger>
            <TabsTrigger value="budget" className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Budget
            </TabsTrigger>
            <TabsTrigger value="custom" className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Custom
            </TabsTrigger>
          </TabsList>

          {/* Profit & Loss Report Tab */}
          <TabsContent value="profit-loss">
            <ProfitLossReport />
          </TabsContent>

          {/* Cash Flow Report Tab */}
          <TabsContent value="cash-flow">
            <Card>
              <CardHeader>
                <CardTitle>Cash Flow Report</CardTitle>
                <CardDescription>
                  Track cash inflows and outflows over time
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-center h-64 text-muted-foreground">
                  <div className="text-center">
                    <BarChart3 className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>Cash Flow Report coming soon</p>
                    <p className="text-sm">This feature will be available in the next update</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Budget Report Tab */}
          <TabsContent value="budget">
            <Card>
              <CardHeader>
                <CardTitle>Budget vs Actual Report</CardTitle>
                <CardDescription>
                  Compare your planned budget with actual spending
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-center h-64 text-muted-foreground">
                  <div className="text-center">
                    <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>Budget Report coming soon</p>
                    <p className="text-sm">This feature will be available in the next update</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Custom Reports Tab */}
          <TabsContent value="custom">
            <Card>
              <CardHeader>
                <CardTitle>Custom Reports</CardTitle>
                <CardDescription>
                  Create and manage custom reports tailored to your needs
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-center h-64 text-muted-foreground">
                  <div className="text-center">
                    <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>Custom Reports coming soon</p>
                    <p className="text-sm">This feature will be available in the next update</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Reports;