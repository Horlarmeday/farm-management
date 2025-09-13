import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { DollarSign, Plus, Search, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { LoadingTable } from "@/components/ui/loading-card";
import { useFinanceDashboardSummary, useFinancialTransactions } from "@/hooks/useFinance";
import TransactionForm from "@/components/forms/TransactionForm";
import TransactionList from "@/components/finance/TransactionList";

export default function Finance() {
  const [isTransactionDialogOpen, setIsTransactionDialogOpen] = useState(false);
  const { data: dashboardSummary, isLoading: summaryLoading, error: summaryError } = useFinanceDashboardSummary();
  const { data: transactions, isLoading: transactionsLoading } = useFinancialTransactions({ limit: 10 });

  const handleTransactionSuccess = () => {
    setIsTransactionDialogOpen(false);
  };

  if (summaryLoading || transactionsLoading) {
    return (
      <div className="max-w-full mx-auto px-6 py-6">
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
                <DollarSign className="h-8 w-8 text-green-600" />
                Finance Management
              </h1>
              <p className="text-muted-foreground mt-1">
                Track sales, expenses, and financial performance
              </p>
            </div>
            <div className="flex space-x-3">
              <Button className="farm-button-primary">
                <Plus className="h-4 w-4 mr-2" />
                Add Sale
              </Button>
              <Button variant="outline">
                <Filter className="h-4 w-4 mr-2" />
                Filter
              </Button>
            </div>
          </div>
        </div>
        <LoadingTable />
      </div>
    );
  }

  return (
    <div className="max-w-full mx-auto px-6 py-6">
      {/* Page Header */}
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
              <DollarSign className="h-8 w-8 text-green-600" />
              Finance Management
            </h1>
            <p className="text-muted-foreground mt-1">
              Track sales, expenses, and financial performance
            </p>
          </div>
          <div className="flex space-x-3">
            <Dialog open={isTransactionDialogOpen} onOpenChange={setIsTransactionDialogOpen}>
              <DialogTrigger asChild>
                <Button className="farm-button-primary">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Transaction
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Record New Transaction</DialogTitle>
                </DialogHeader>
                <TransactionForm 
                  onSuccess={handleTransactionSuccess}
                  onCancel={() => setIsTransactionDialogOpen(false)}
                />
              </DialogContent>
            </Dialog>
            <Button variant="outline">
              Generate Report
            </Button>
          </div>
        </div>
      </div>

      {/* Financial Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg text-green-600">Total Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            {summaryError ? (
              <p className="text-sm text-red-500">Error loading data</p>
            ) : (
              <>
                <p className="text-3xl font-bold">
                  ₦{dashboardSummary?.totalRevenue?.toLocaleString() || '0'}
                </p>
                <p className="text-sm text-muted-foreground">This month</p>
              </>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-lg text-red-600">Total Expenses</CardTitle>
          </CardHeader>
          <CardContent>
            {summaryError ? (
              <p className="text-sm text-red-500">Error loading data</p>
            ) : (
              <>
                <p className="text-3xl font-bold">
                  ₦{dashboardSummary?.totalExpenses?.toLocaleString() || '0'}
                </p>
                <p className="text-sm text-muted-foreground">This month</p>
              </>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-lg text-primary">Net Profit</CardTitle>
          </CardHeader>
          <CardContent>
            {summaryError ? (
              <p className="text-sm text-red-500">Error loading data</p>
            ) : (
              <>
                <p className="text-3xl font-bold">
                  ₦{dashboardSummary?.netProfit?.toLocaleString() || '0'}
                </p>
                <p className="text-sm text-muted-foreground">This month</p>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="sales" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="sales">All Transactions</TabsTrigger>
          <TabsTrigger value="expenses">Transaction History</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="sales" className="space-y-4">
          <TransactionList className="w-full" />
        </TabsContent>

        <TabsContent value="expenses" className="space-y-4">
          <TransactionList className="w-full" />
        </TabsContent>

        <TabsContent value="reports" className="space-y-4">
          <Card>
            <CardContent className="p-8 text-center">
              <h3 className="text-lg font-semibold mb-2">Financial Reports</h3>
              <p className="text-muted-foreground mb-4">
                Generate comprehensive financial reports and analytics
              </p>
              <Button className="farm-button-primary">
                Generate Report
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
