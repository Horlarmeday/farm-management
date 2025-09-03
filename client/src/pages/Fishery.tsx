import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Fish, Plus, Search, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { LoadingTable } from "@/components/ui/loading-card";
import CreatePondForm from "@/components/forms/CreatePondForm";

export default function Fishery() {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  
  // Mock data for demonstration
  const ponds = [
    { id: 1, name: "Pond A1", location: "North Field", species: "Tilapia", status: "active", size: 100 },
    { id: 2, name: "Pond B2", location: "South Field", species: "Catfish", status: "active", size: 150 },
    { id: 3, name: "Pond C3", location: "East Field", species: "Carp", status: "maintenance", size: 120 },
  ];
  
  const isLoading = false;

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
                <Fish className="h-8 w-8 text-blue-600" />
                Fishery Management
              </h1>
              <p className="text-muted-foreground mt-1">
                Manage fish ponds, water quality, and harvest records
              </p>
            </div>
            <div className="flex space-x-3">
              <Button className="farm-button-primary">
                <Plus className="h-4 w-4 mr-2" />
                Add Pond
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Page Header */}
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
              <Fish className="h-8 w-8 text-blue-600" />
              Fishery Management
            </h1>
            <p className="text-muted-foreground mt-1">
              Manage fish ponds, water quality, and harvest records
            </p>
          </div>
          <div className="flex space-x-3">
            <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
              <DialogTrigger asChild>
                <Button className="farm-button-primary">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Pond
                </Button>
              </DialogTrigger>
              <CreatePondForm onSuccess={() => setIsCreateOpen(false)} />
            </Dialog>
            <Button variant="outline">
              <Filter className="h-4 w-4 mr-2" />
              Filter
            </Button>
          </div>
        </div>
      </div>

      <Tabs defaultValue="ponds" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="ponds">Ponds</TabsTrigger>
          <TabsTrigger value="water-quality">Water Quality</TabsTrigger>
          <TabsTrigger value="feeding">Feeding</TabsTrigger>
          <TabsTrigger value="harvest">Harvest</TabsTrigger>
        </TabsList>

        <TabsContent value="ponds" className="space-y-4">
          <div className="flex items-center space-x-2">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search ponds..."
              className="max-w-sm"
            />
          </div>

          <div className="grid gap-4">
            {ponds?.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <Fish className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Ponds Found</h3>
                  <p className="text-muted-foreground mb-4">
                    Start by adding your first fish pond
                  </p>
                  <Button className="farm-button-primary">
                    <Plus className="h-4 w-4 mr-2" />
                    Add First Pond
                  </Button>
                </CardContent>
              </Card>
            ) : (
              ponds?.map((pond: any) => (
                <Card key={pond.id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg">{pond.name}</CardTitle>
                        <p className="text-sm text-muted-foreground">
                          {pond.type} • {pond.speciesStocked}
                        </p>
                      </div>
                      <Badge variant="default">Active</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Size</p>
                        <p className="text-lg font-semibold">{pond.sizeM2} m²</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Location</p>
                        <p className="text-lg font-semibold">{pond.location || 'Not specified'}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Stock Count</p>
                        <p className="text-lg font-semibold">{pond.initialStockCount || 'Unknown'}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Stocking Date</p>
                        <p className="text-lg font-semibold">
                          {pond.stockingDate 
                            ? new Date(pond.stockingDate).toLocaleDateString()
                            : 'Not set'
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

        <TabsContent value="water-quality" className="space-y-4">
          <Card>
            <CardContent className="p-8 text-center">
              <h3 className="text-lg font-semibold mb-2">Water Quality Monitoring</h3>
              <p className="text-muted-foreground mb-4">
                Track pH, temperature, oxygen levels, and other water parameters
              </p>
              <Button className="farm-button-primary">
                <Plus className="h-4 w-4 mr-2" />
                Add Quality Record
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="feeding" className="space-y-4">
          <Card>
            <CardContent className="p-8 text-center">
              <h3 className="text-lg font-semibold mb-2">Feeding Records</h3>
              <p className="text-muted-foreground mb-4">
                Monitor feed types, quantities, and feeding schedules
              </p>
              <Button className="farm-button-primary">
                <Plus className="h-4 w-4 mr-2" />
                Add Feeding Record
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="harvest" className="space-y-4">
          <Card>
            <CardContent className="p-8 text-center">
              <h3 className="text-lg font-semibold mb-2">Harvest Records</h3>
              <p className="text-muted-foreground mb-4">
                Track harvest quantities, weights, and sales
              </p>
              <Button className="farm-button-primary">
                <Plus className="h-4 w-4 mr-2" />
                Add Harvest Record
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
