import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { useFinanceSummary, useInventorySummary, useTasksSummary } from '@/hooks/useDashboard';
import { CheckSquare, ExternalLink, Loader2, Package, PieChart } from 'lucide-react';

// Helper function to get status color
const getStatusColor = (status: string) => {
  switch (status.toLowerCase()) {
    case 'good':
      return 'text-green-600';
    case 'medium':
      return 'text-yellow-600';
    case 'low':
      return 'text-red-600';
    default:
      return 'text-gray-600';
  }
};

// Helper function to format currency
const formatCurrency = (amount: number) => {
  if (amount >= 1000000) {
    return `₦${(amount / 1000000).toFixed(1)}M`;
  } else if (amount >= 1000) {
    return `₦${(amount / 1000).toFixed(1)}K`;
  }
  return `₦${amount.toFixed(0)}`;
};

export default function BottomModules() {
  const {
    data: inventoryData,
    isLoading: inventoryLoading,
    error: inventoryError,
  } = useInventorySummary();
  const { data: financeData, isLoading: financeLoading, error: financeError } = useFinanceSummary();
  const { data: tasksData, isLoading: tasksLoading, error: tasksError } = useTasksSummary();

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
      {/* Inventory Module */}
      <Card className="farm-card">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Package className="h-5 w-5 text-orange-600" />
              <CardTitle className="text-lg">Inventory</CardTitle>
            </div>
            <Button variant="ghost" size="sm" className="text-primary hover:text-primary/80">
              <ExternalLink className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {inventoryLoading ? (
            <div className="flex items-center justify-center py-4">
              <Loader2 className="h-4 w-4 animate-spin" />
            </div>
          ) : inventoryError ? (
            <div className="text-sm text-red-600">Failed to load inventory data</div>
          ) : inventoryData ? (
            <>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Feed Stock</span>
                <span
                  className={`text-sm font-semibold ${getStatusColor(inventoryData.feedStock.status)}`}
                >
                  {inventoryData.feedStock.status}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Medicines</span>
                <span
                  className={`text-sm font-semibold ${getStatusColor(inventoryData.medicines.status)}`}
                >
                  {inventoryData.medicines.status}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Equipment</span>
                <span
                  className={`text-sm font-semibold ${getStatusColor(inventoryData.equipment.status)}`}
                >
                  {inventoryData.equipment.status}
                </span>
              </div>
            </>
          ) : (
            <div className="text-sm text-gray-500">No inventory data available</div>
          )}
        </CardContent>
      </Card>

      {/* Finance Module */}
      <Card className="farm-card">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <PieChart className="h-5 w-5 text-green-600" />
              <CardTitle className="text-lg">Finance</CardTitle>
            </div>
            <Button variant="ghost" size="sm" className="text-primary hover:text-primary/80">
              <ExternalLink className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="w-full h-20 rounded-lg overflow-hidden">
            <img
              src="https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=400&h=120"
              alt="Modern farm technology"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="space-y-2">
            {financeLoading ? (
              <div className="flex items-center justify-center py-4">
                <Loader2 className="h-4 w-4 animate-spin" />
              </div>
            ) : financeError ? (
              <div className="text-sm text-red-600">Failed to load finance data</div>
            ) : financeData ? (
              <>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Monthly Revenue</span>
                  <span className="text-sm font-semibold text-green-600">
                    {formatCurrency(financeData.monthlyRevenue)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Expenses</span>
                  <span className="text-sm font-semibold text-red-600">
                    {formatCurrency(financeData.expenses)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Net Profit</span>
                  <span className="text-sm font-semibold text-primary">
                    {formatCurrency(financeData.netProfit)}
                  </span>
                </div>
              </>
            ) : (
              <div className="text-sm text-gray-500">No finance data available</div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Tasks Module */}
      <Card className="farm-card">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <CheckSquare className="h-5 w-5 text-indigo-600" />
              <CardTitle className="text-lg">Tasks</CardTitle>
            </div>
            <Button variant="ghost" size="sm" className="text-primary hover:text-primary/80">
              <ExternalLink className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {tasksLoading ? (
            <div className="flex items-center justify-center py-4">
              <Loader2 className="h-4 w-4 animate-spin" />
            </div>
          ) : tasksError ? (
            <div className="text-sm text-red-600">Failed to load tasks data</div>
          ) : tasksData && tasksData.tasks ? (
            tasksData.tasks.slice(0, 4).map((task) => (
              <div key={task.id} className="flex items-center space-x-3">
                <Checkbox
                  id={`task-${task.id}`}
                  checked={task.completed}
                  className="border-primary data-[state=checked]:bg-primary"
                />
                <label
                  htmlFor={`task-${task.id}`}
                  className={`text-sm cursor-pointer ${
                    task.completed ? 'line-through text-muted-foreground' : 'text-foreground'
                  }`}
                >
                  {task.text}
                </label>
              </div>
            ))
          ) : (
            <div className="text-sm text-gray-500">No tasks available</div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
