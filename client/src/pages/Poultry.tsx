import { useQuery } from "@tanstack/react-query";
import { Bird, Plus, Search, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LoadingTable } from "@/components/ui/loading-card";
import CreateBirdBatchForm from "@/components/forms/CreateBirdBatchForm";

export default function Poultry() {
  const { data: batches, isLoading } = useQuery({
    queryKey: ["/api/bird-batches"],
  });

  const { data: eggProduction } = useQuery({
    queryKey: ["/api/egg-production"],
  });

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
                <Bird className="h-8 w-8 text-blue-600" />
                Poultry Management
              </h1>
              <p className="text-muted-foreground mt-1">
                Manage bird batches, egg production, and health records
              </p>
            </div>
            <div className="flex space-x-3">
              <CreateBirdBatchForm />
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
              <Bird className="h-8 w-8 text-yellow-600" />
              Poultry Management
            </h1>
            <p className="text-muted-foreground mt-1">
              Manage flocks, track egg production, and monitor bird health
            </p>
          </div>
          <div className="flex space-x-3">
            <CreateBirdBatchForm />
            <Button variant="outline">
              <Filter className="h-4 w-4 mr-2" />
              Filter
            </Button>
          </div>
        </div>
      </div>

      <Tabs defaultValue="batches" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="batches">Batches</TabsTrigger>
          <TabsTrigger value="production">Egg Production</TabsTrigger>
          <TabsTrigger value="health">Health Records</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="batches" className="space-y-4">
          <div className="flex items-center space-x-2">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search batches..."
              className="max-w-sm"
            />
          </div>

          <div className="grid gap-4">
            {batches?.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <Bird className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Batches Found</h3>
                  <p className="text-muted-foreground mb-4">
                    Start by adding your first poultry batch
                  </p>
                  <Button className="farm-button-primary">
                    <Plus className="h-4 w-4 mr-2" />
                    Add First Batch
                  </Button>
                </CardContent>
              </Card>
            ) : (
              batches?.map((batch: any) => (
                <Card key={batch.id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg">{batch.batchCode}</CardTitle>
                        <p className="text-sm text-muted-foreground">
                          {batch.breed} • {batch.birdType}
                        </p>
                      </div>
                      <Badge
                        variant={
                          batch.status === "active"
                            ? "default"
                            : batch.status === "sold"
                            ? "secondary"
                            : "destructive"
                        }
                      >
                        {batch.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Quantity</p>
                        <p className="text-lg font-semibold">{batch.quantity}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">House</p>
                        <p className="text-lg font-semibold">{batch.houseLocation || 'Not assigned'}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Arrival Date</p>
                        <p className="text-lg font-semibold">
                          {new Date(batch.arrivalDate).toLocaleDateString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Source</p>
                        <p className="text-lg font-semibold">{batch.source || 'Not specified'}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="production" className="space-y-4">
          <Card>
            <CardContent className="p-8 text-center">
              <h3 className="text-lg font-semibold mb-2">Egg Production Records</h3>
              <p className="text-muted-foreground mb-4">
                Track daily egg production and quality metrics
              </p>
              <Button className="farm-button-primary">
                <Plus className="h-4 w-4 mr-2" />
                Add Production Record
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="health" className="space-y-4">
          <Card>
            <CardContent className="p-8 text-center">
              <h3 className="text-lg font-semibold mb-2">Health Records</h3>
              <p className="text-muted-foreground mb-4">
                Monitor vaccination schedules and health status
              </p>
              <Button className="farm-button-primary">
                <Plus className="h-4 w-4 mr-2" />
                Add Health Record
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <Card>
            <CardContent className="p-8 text-center">
              <h3 className="text-lg font-semibold mb-2">Analytics & Reports</h3>
              <p className="text-muted-foreground mb-4">
                View performance metrics and production analytics
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
