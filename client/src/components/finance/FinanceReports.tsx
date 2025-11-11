import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { LoadingCard } from '@/components/ui/loading-card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import FinanceService from '@/services/finance.service';
import { useQuery } from '@tanstack/react-query';
import { DollarSign, Download, TrendingDown, TrendingUp } from 'lucide-react';
import { useState } from 'react';

export default function FinanceReports() {
  const [dateRange, setDateRange] = useState({
    startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
      .toISOString()
      .split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
  });

  // Cash Flow Analysis Query
  const {
    data: cashFlowData,
    isLoading: cashFlowLoading,
    error: cashFlowError,
  } = useQuery({
    queryKey: ['cashFlow', dateRange.startDate, dateRange.endDate],
    queryFn: () =>
      FinanceService.getCashFlowAnalysis({
        startDate: dateRange.startDate,
        endDate: dateRange.endDate,
      }),
  });

  // Income/Expense Breakdown Query
  const {
    data: breakdownData,
    isLoading: breakdownLoading,
    error: breakdownError,
  } = useQuery({
    queryKey: ['incomeExpenseBreakdown', dateRange.startDate, dateRange.endDate],
    queryFn: () =>
      FinanceService.getIncomeExpenseBreakdown({
        startDate: dateRange.startDate,
        endDate: dateRange.endDate,
      }),
  });

  // P&L Report Query
  const {
    data: plReport,
    isLoading: plLoading,
    error: plError,
  } = useQuery({
    queryKey: ['profitLoss', dateRange.startDate, dateRange.endDate],
    queryFn: () =>
      FinanceService.generateProfitLossReport({
        periodStart: dateRange.startDate,
        periodEnd: dateRange.endDate,
        includeDetails: true,
      }),
  });

  const handleDateChange = (field: 'startDate' | 'endDate', value: string) => {
    setDateRange((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div className="space-y-6">
      {/* Date Range Selector */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Report Period</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="startDate">Start Date</Label>
              <Input
                id="startDate"
                type="date"
                value={dateRange.startDate}
                onChange={(e) => handleDateChange('startDate', e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="endDate">End Date</Label>
              <Input
                id="endDate"
                type="date"
                value={dateRange.endDate}
                onChange={(e) => handleDateChange('endDate', e.target.value)}
              />
            </div>
            <div className="flex items-end">
              <Button className="w-full">
                <Download className="h-4 w-4 mr-2" />
                Export Reports
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Reports Tabs */}
      <Tabs defaultValue="profit-loss" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="profit-loss">Profit & Loss</TabsTrigger>
          <TabsTrigger value="cash-flow">Cash Flow</TabsTrigger>
          <TabsTrigger value="breakdown">Category Breakdown</TabsTrigger>
        </TabsList>

        {/* Profit & Loss Report */}
        <TabsContent value="profit-loss" className="space-y-4">
          {plLoading ? (
            <LoadingCard />
          ) : plError ? (
            <Card>
              <CardContent className="p-8 text-center text-red-500">
                Error loading P&L report
              </CardContent>
            </Card>
          ) : plReport ? (
            <>
              {/* P&L Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      Total Income
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <span className="text-2xl font-bold text-green-600">
                        ₦{plReport.totalIncome?.toLocaleString() || '0'}
                      </span>
                      <TrendingUp className="h-5 w-5 text-green-600" />
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      Total Expenses
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <span className="text-2xl font-bold text-red-600">
                        ₦{plReport.totalExpenses?.toLocaleString() || '0'}
                      </span>
                      <TrendingDown className="h-5 w-5 text-red-600" />
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      Net Profit
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <span
                        className={`text-2xl font-bold ${
                          (plReport.netProfit || 0) >= 0 ? 'text-green-600' : 'text-red-600'
                        }`}
                      >
                        ₦{plReport.netProfit?.toLocaleString() || '0'}
                      </span>
                      <DollarSign className="h-5 w-5" />
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      Profit Margin
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <span className="text-2xl font-bold">
                        {Number(plReport.profitMargin || 0).toFixed(1)}%
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* P&L Details Table */}
              <Card>
                <CardHeader>
                  <CardTitle>Detailed Breakdown</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Category</TableHead>
                        <TableHead className="text-right">Amount</TableHead>
                        <TableHead className="text-right">Percentage</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <TableRow className="font-semibold bg-green-50">
                        <TableCell colSpan={3}>Income</TableCell>
                      </TableRow>
                      {plReport.incomeItems?.map((item: any, idx: number) => (
                        <TableRow key={`income-${idx}`}>
                          <TableCell className="pl-8">{item.category}</TableCell>
                          <TableCell className="text-right text-green-600">
                            ₦{item.amount?.toLocaleString() || '0'}
                          </TableCell>
                          <TableCell className="text-right">
                            {Number(item.percentage || 0).toFixed(1)}%
                          </TableCell>
                        </TableRow>
                      ))}
                      <TableRow className="font-semibold bg-red-50">
                        <TableCell colSpan={3}>Expenses</TableCell>
                      </TableRow>
                      {plReport.expenseItems?.map((item: any, idx: number) => (
                        <TableRow key={`expense-${idx}`}>
                          <TableCell className="pl-8">{item.category}</TableCell>
                          <TableCell className="text-right text-red-600">
                            ₦{item.amount?.toLocaleString() || '0'}
                          </TableCell>
                          <TableCell className="text-right">
                            {Number(item.percentage || 0).toFixed(1)}%
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </>
          ) : (
            <Card>
              <CardContent className="p-8 text-center text-muted-foreground">
                No data available for the selected period
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Cash Flow Report */}
        <TabsContent value="cash-flow" className="space-y-4">
          {cashFlowLoading ? (
            <LoadingCard />
          ) : cashFlowError ? (
            <Card>
              <CardContent className="p-8 text-center text-red-500">
                Error loading cash flow report
              </CardContent>
            </Card>
          ) : cashFlowData ? (
            <>
              {/* Cash Flow Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      Opening Balance
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <span className="text-2xl font-bold">
                      ₦{cashFlowData.openingBalance?.toLocaleString() || '0'}
                    </span>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      Total Inflows
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <span className="text-2xl font-bold text-green-600">
                      ₦{cashFlowData.summary?.totalInflows?.toLocaleString() || '0'}
                    </span>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      Total Outflows
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <span className="text-2xl font-bold text-red-600">
                      ₦{cashFlowData.summary?.totalOutflows?.toLocaleString() || '0'}
                    </span>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      Closing Balance
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <span
                      className={`text-2xl font-bold ${
                        (cashFlowData.closingBalance || 0) >= 0 ? 'text-green-600' : 'text-red-600'
                      }`}
                    >
                      ₦{cashFlowData.closingBalance?.toLocaleString() || '0'}
                    </span>
                  </CardContent>
                </Card>
              </div>

              {/* Cash Flow Tables */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-green-600">Cash Inflows</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Category</TableHead>
                          <TableHead className="text-right">Amount</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {cashFlowData.inflows?.length ? (
                          cashFlowData.inflows.map((inflow, idx) => (
                            <TableRow key={idx}>
                              <TableCell>{inflow.category}</TableCell>
                              <TableCell className="text-right text-green-600">
                                ₦{inflow.amount?.toLocaleString() || '0'}
                              </TableCell>
                            </TableRow>
                          ))
                        ) : (
                          <TableRow>
                            <TableCell colSpan={2} className="text-center text-muted-foreground">
                              No inflows for this period
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-red-600">Cash Outflows</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Category</TableHead>
                          <TableHead className="text-right">Amount</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {cashFlowData.outflows?.length ? (
                          cashFlowData.outflows.map((outflow, idx) => (
                            <TableRow key={idx}>
                              <TableCell>{outflow.category}</TableCell>
                              <TableCell className="text-right text-red-600">
                                ₦{outflow.amount?.toLocaleString() || '0'}
                              </TableCell>
                            </TableRow>
                          ))
                        ) : (
                          <TableRow>
                            <TableCell colSpan={2} className="text-center text-muted-foreground">
                              No outflows for this period
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </div>
            </>
          ) : (
            <Card>
              <CardContent className="p-8 text-center text-muted-foreground">
                No data available for the selected period
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Category Breakdown Report */}
        <TabsContent value="breakdown" className="space-y-4">
          {breakdownLoading ? (
            <LoadingCard />
          ) : breakdownError ? (
            <Card>
              <CardContent className="p-8 text-center text-red-500">
                Error loading breakdown report
              </CardContent>
            </Card>
          ) : breakdownData ? (
            <>
              {/* Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      Total Income
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <span className="text-2xl font-bold text-green-600">
                      ₦{breakdownData.totalIncome?.toLocaleString() || '0'}
                    </span>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      Total Expenses
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <span className="text-2xl font-bold text-red-600">
                      ₦{breakdownData.totalExpenses?.toLocaleString() || '0'}
                    </span>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      Net Profit
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <span
                      className={`text-2xl font-bold ${
                        (breakdownData.netProfit || 0) >= 0 ? 'text-green-600' : 'text-red-600'
                      }`}
                    >
                      ₦{breakdownData.netProfit?.toLocaleString() || '0'}
                    </span>
                  </CardContent>
                </Card>
              </div>

              {/* Breakdown Tables */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-green-600">Income by Category</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Category</TableHead>
                          <TableHead className="text-right">Amount</TableHead>
                          <TableHead className="text-right">Count</TableHead>
                          <TableHead className="text-right">%</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {breakdownData.income?.length ? (
                          breakdownData.income.map((item, idx) => (
                            <TableRow key={idx}>
                              <TableCell>{item.category}</TableCell>
                              <TableCell className="text-right text-green-600">
                                ₦{item.amount?.toLocaleString() || '0'}
                              </TableCell>
                              <TableCell className="text-right">{item.count}</TableCell>
                              <TableCell className="text-right">
                                {Number(item.percentage || 0).toFixed(1)}%
                              </TableCell>
                            </TableRow>
                          ))
                        ) : (
                          <TableRow>
                            <TableCell colSpan={4} className="text-center text-muted-foreground">
                              No income for this period
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-red-600">Expenses by Category</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Category</TableHead>
                          <TableHead className="text-right">Amount</TableHead>
                          <TableHead className="text-right">Count</TableHead>
                          <TableHead className="text-right">%</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {breakdownData.expenses?.length ? (
                          breakdownData.expenses.map((item, idx) => (
                            <TableRow key={idx}>
                              <TableCell>{item.category}</TableCell>
                              <TableCell className="text-right text-red-600">
                                ₦{item.amount?.toLocaleString() || '0'}
                              </TableCell>
                              <TableCell className="text-right">{item.count}</TableCell>
                              <TableCell className="text-right">
                                {Number(item.percentage || 0).toFixed(1)}%
                              </TableCell>
                            </TableRow>
                          ))
                        ) : (
                          <TableRow>
                            <TableCell colSpan={4} className="text-center text-muted-foreground">
                              No expenses for this period
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </div>
            </>
          ) : (
            <Card>
              <CardContent className="p-8 text-center text-muted-foreground">
                No data available for the selected period
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
