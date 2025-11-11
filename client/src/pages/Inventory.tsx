import CreateInventoryItemForm from '@/components/forms/CreateInventoryItemForm';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { LoadingTable } from '@/components/ui/loading-card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  useAcknowledgeStockAlert,
  useInventoryItems,
  useInventoryTransactions,
  useResolveStockAlert,
  useStockAlerts,
} from '@/hooks/useInventory';
import { formatNaira as formatCurrency } from '@/lib/currency';
import { InventoryCategory, TransactionType } from '@/types/inventory.types';
import { AlertTriangle, Filter, Package, Plus, Search } from 'lucide-react';
import { useState } from 'react';

export default function Inventory() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<InventoryCategory | undefined>();

  const {
    data: inventoryItems,
    isLoading: itemsLoading,
    error: itemsError,
  } = useInventoryItems({
    search: searchTerm || undefined,
    category: selectedCategory,
    page: 1,
    limit: 20,
  });

  const { data: transactions, isLoading: transactionsLoading } = useInventoryTransactions({
    page: 1,
    limit: 10,
  });

  const { data: alerts, isLoading: alertsLoading } = useStockAlerts({
    resolved: false,
    page: 1,
    limit: 10,
  });

  const acknowledgeMutation = useAcknowledgeStockAlert();
  const resolveMutation = useResolveStockAlert();

  const isLoading = itemsLoading || transactionsLoading || alertsLoading;

  const handleAcknowledgeAlert = async (alertId: string) => {
    try {
      await acknowledgeMutation.mutateAsync(alertId);
    } catch (error) {
      console.error('Failed to acknowledge alert:', error);
    }
  };

  const handleResolveAlert = async (alertId: string) => {
    try {
      await resolveMutation.mutateAsync({ id: alertId });
    } catch (error) {
      console.error('Failed to resolve alert:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-full mx-auto px-6 py-6">
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
                <Package className="h-8 w-8 text-orange-600" />
                Inventory Management
              </h1>
              <p className="text-muted-foreground mt-1">
                Track feed, medicines, equipment, and supplies
              </p>
            </div>
            <div className="flex space-x-3">
              <CreateInventoryItemForm />
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
              <Package className="h-8 w-8 text-orange-600" />
              Inventory Management
            </h1>
            <p className="text-muted-foreground mt-1">
              Track feed, medicines, equipment, and supplies
            </p>
          </div>
          <div className="flex space-x-3">
            <CreateInventoryItemForm />
            <Button variant="outline">
              <Filter className="h-4 w-4 mr-2" />
              Filter
            </Button>
          </div>
        </div>
      </div>

      <Tabs defaultValue="items" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="items">Items</TabsTrigger>
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
          <TabsTrigger value="alerts">Alerts</TabsTrigger>
        </TabsList>

        <TabsContent value="items" className="space-y-4">
          <div className="flex items-center space-x-2">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search inventory..."
              className="max-w-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="grid gap-4">
            {itemsError ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Error Loading Items</h3>
                  <p className="text-muted-foreground mb-4">
                    Failed to load inventory items. Please try again.
                  </p>
                </CardContent>
              </Card>
            ) : inventoryItems?.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Items Found</h3>
                  <p className="text-muted-foreground mb-4">
                    {searchTerm
                      ? 'No items match your search criteria'
                      : 'Start by adding your first inventory item'}
                  </p>
                  <CreateInventoryItemForm />
                </CardContent>
              </Card>
            ) : (
              inventoryItems?.map((item) => (
                <Card key={item.id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg">{item.name}</CardTitle>
                        <p className="text-sm text-muted-foreground">
                          {item.category} • {item.unit}
                        </p>
                      </div>
                      <Badge
                        variant={
                          item.currentStock <= item.reorderPoint
                            ? 'destructive'
                            : item.currentStock <= item.reorderPoint * 2
                              ? 'secondary'
                              : 'default'
                        }
                      >
                        {item.currentStock <= item.reorderPoint
                          ? 'Low Stock'
                          : item.currentStock <= item.reorderPoint * 2
                            ? 'Medium'
                            : 'Good Stock'}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Current Stock</p>
                        <p className="text-lg font-semibold">
                          {item.currentStock} {item.unit}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Reorder Level</p>
                        <p className="text-lg font-semibold">
                          {item.reorderPoint} {item.unit}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Unit Cost</p>
                        <p className="text-lg font-semibold">
                          {formatCurrency(item.standardCost || 0)}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Total Value</p>
                        <p className="text-lg font-semibold">
                          {formatCurrency(item.currentStock * (item.standardCost || 0))}
                        </p>
                      </div>
                    </div>
                    {item.expiryDate && (
                      <div className="mt-4 pt-4 border-t">
                        <p className="text-sm text-muted-foreground">Expiry Date</p>
                        <p className="text-sm font-medium">
                          {new Date(item.expiryDate).toLocaleDateString()}
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="transactions" className="space-y-4">
          <div className="grid gap-4">
            {transactions?.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <h3 className="text-lg font-semibold mb-2">No Transactions Found</h3>
                  <p className="text-muted-foreground mb-4">
                    Track stock movements and adjustments
                  </p>
                  <Button className="farm-button-primary">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Transaction
                  </Button>
                </CardContent>
              </Card>
            ) : (
              transactions?.map((transaction) => (
                <Card key={transaction.id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg">Transaction ID: {transaction.id}</CardTitle>
                        <p className="text-sm text-muted-foreground">
                          {transaction.type} •{' '}
                          {new Date(transaction.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <Badge
                        variant={
                          transaction.type === TransactionType.IN ||
                          transaction.type === TransactionType.RETURN
                            ? 'default'
                            : 'secondary'
                        }
                      >
                        {transaction.type === TransactionType.IN ||
                        transaction.type === TransactionType.RETURN
                          ? 'Stock In'
                          : 'Stock Out'}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Quantity</p>
                        <p className="text-lg font-semibold">{transaction.quantity}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Unit Price</p>
                        <p className="text-lg font-semibold">
                          {formatCurrency(transaction.unitCost || 0)}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Total Amount</p>
                        <p className="text-lg font-semibold">
                          {formatCurrency(transaction.totalCost || 0)}
                        </p>
                      </div>
                    </div>
                    {transaction.notes && (
                      <div className="mt-4 pt-4 border-t">
                        <p className="text-sm text-muted-foreground">Notes</p>
                        <p className="text-sm">{transaction.notes}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="alerts" className="space-y-4">
          <div className="grid gap-4">
            {!alerts || alerts.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <h3 className="text-lg font-semibold mb-2">No Active Alerts</h3>
                  <p className="text-muted-foreground mb-4">
                    All inventory levels are within normal ranges
                  </p>
                  <Button className="farm-button-primary">Generate Alerts</Button>
                </CardContent>
              </Card>
            ) : (
              alerts?.map((alert: any) => (
                <Card key={alert.id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg flex items-center gap-2">
                          <AlertTriangle
                            className={`h-5 w-5 ${
                              alert.severity === 'critical'
                                ? 'text-red-600'
                                : alert.severity === 'high'
                                  ? 'text-orange-600'
                                  : alert.severity === 'medium'
                                    ? 'text-yellow-600'
                                    : 'text-blue-600'
                            }`}
                          />
                          {alert.title}
                        </CardTitle>
                        <p className="text-sm text-muted-foreground">
                          {alert.alertType.replace('_', ' ').toUpperCase()}
                        </p>
                      </div>
                      <div className="flex flex-col gap-2 items-end">
                        <Badge
                          variant={
                            alert.severity === 'critical' || alert.severity === 'high'
                              ? 'destructive'
                              : alert.severity === 'medium'
                                ? 'secondary'
                                : 'default'
                          }
                        >
                          {alert.severity.toUpperCase()}
                        </Badge>
                        {alert.acknowledged && (
                          <Badge variant="outline" className="text-xs">
                            Acknowledged
                          </Badge>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <p className="text-sm">{alert.message}</p>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-muted-foreground">Current Stock</p>
                          <p className="text-lg font-semibold">{alert.currentStock || 'N/A'}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Threshold</p>
                          <p className="text-lg font-semibold">{alert.threshold || 'N/A'}</p>
                        </div>
                      </div>
                      <div className="flex gap-2 mt-4">
                        {!alert.acknowledged && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleAcknowledgeAlert(alert.id)}
                            disabled={acknowledgeMutation.isPending}
                          >
                            {acknowledgeMutation.isPending ? 'Acknowledging...' : 'Acknowledge'}
                          </Button>
                        )}
                        {!alert.resolved && (
                          <Button
                            size="sm"
                            className="farm-button-primary"
                            onClick={() => handleResolveAlert(alert.id)}
                            disabled={resolveMutation.isPending}
                          >
                            {resolveMutation.isPending ? 'Resolving...' : 'Resolve'}
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
