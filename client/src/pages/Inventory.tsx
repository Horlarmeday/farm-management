import { useQuery } from "@tanstack/react-query";
import { Package, Plus, Search, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LoadingTable } from "@/components/ui/loading-card";
import CreateInventoryItemForm from "@/components/forms/CreateInventoryItemForm";

export default function Inventory() {
  const { data: inventory, isLoading } = useQuery({
    queryKey: ["/api/inventory"],
  });

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
            />
          </div>

          <div className="grid gap-4">
            {inventory?.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Items Found</h3>
                  <p className="text-muted-foreground mb-4">
                    Start by adding your first inventory item
                  </p>
                  <Button className="farm-button-primary">
                    <Plus className="h-4 w-4 mr-2" />
                    Add First Item
                  </Button>
                </CardContent>
              </Card>
            ) : (
              inventory?.map((item: any) => (
                <Card key={item.id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg">{item.itemName}</CardTitle>
                        <p className="text-sm text-muted-foreground">
                          {item.category} • {item.unit}
                        </p>
                      </div>
                      <Badge
                        variant={
                          item.currentStock <= item.reorderLevel
                            ? "destructive"
                            : item.currentStock <= item.reorderLevel * 2
                            ? "secondary"
                            : "default"
                        }
                      >
                        {item.currentStock <= item.reorderLevel
                          ? "Low Stock"
                          : item.currentStock <= item.reorderLevel * 2
                          ? "Medium"
                          : "Good Stock"
                        }
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Current Stock</p>
                        <p className="text-lg font-semibold">{item.currentStock}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Reorder Level</p>
                        <p className="text-lg font-semibold">{item.reorderLevel}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Supplier</p>
                        <p className="text-lg font-semibold">{item.supplier || 'Not specified'}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Expiry Date</p>
                        <p className="text-lg font-semibold">
                          {item.expiryDate 
                            ? new Date(item.expiryDate).toLocaleDateString()
                            : 'N/A'
                          }
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="transactions" className="space-y-4">
          <Card>
            <CardContent className="p-8 text-center">
              <h3 className="text-lg font-semibold mb-2">Inventory Transactions</h3>
              <p className="text-muted-foreground mb-4">
                Track stock movements and adjustments
              </p>
              <Button className="farm-button-primary">
                <Plus className="h-4 w-4 mr-2" />
                Add Transaction
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="alerts" className="space-y-4">
          <Card>
            <CardContent className="p-8 text-center">
              <h3 className="text-lg font-semibold mb-2">Stock Alerts</h3>
              <p className="text-muted-foreground mb-4">
                Configure low stock alerts and notifications
              </p>
              <Button className="farm-button-primary">
                Configure Alerts
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
