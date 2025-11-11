import CreateFeedingRecordForm from '@/components/forms/CreateFeedingRecordForm';
import CreateHarvestRecordForm from '@/components/forms/CreateHarvestRecordForm';
import CreatePondForm from '@/components/forms/CreatePondForm';
import CreateWaterQualityForm from '@/components/forms/CreateWaterQualityForm';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { LoadingTable } from '@/components/ui/loading-card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { usePonds } from '@/hooks/useFishery';
import { Filter, Fish, Plus, Search } from 'lucide-react';
import { useState } from 'react';

export default function Fishery() {
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  // Fetch ponds data
  const { data: pondsResponse, isLoading, error } = usePonds();
  const ponds = pondsResponse?.data || [];

  if (isLoading) {
    return (
      <div className="max-w-full mx-auto px-6 py-6">
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
    <div className="max-w-full mx-auto px-6 py-6">
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
            <Input placeholder="Search ponds..." className="max-w-sm" />
          </div>

          <div className="grid gap-4">
            {ponds?.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <Fish className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Ponds Found</h3>
                  <p className="text-muted-foreground mb-4">Start by adding your first fish pond</p>
                  <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                    <DialogTrigger asChild>
                      <Button className="farm-button-primary">
                        <Plus className="h-4 w-4 mr-2" />
                        Add First Pond
                      </Button>
                    </DialogTrigger>
                    <CreatePondForm onSuccess={() => setIsCreateOpen(false)} />
                  </Dialog>
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
                      <Badge variant={pond.status === 'active' ? 'default' : 'secondary'}>
                        {pond.status}
                      </Badge>
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
                        <p className="text-sm text-muted-foreground">Depth</p>
                        <p className="text-lg font-semibold">{pond.depthM || 'Unknown'} m</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Water Source</p>
                        <p className="text-lg font-semibold">
                          {pond.waterSource || 'Not specified'}
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
          <div className="flex justify-end">
            <CreateWaterQualityForm />
          </div>
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
          <div className="flex justify-end">
            <CreateFeedingRecordForm />
          </div>
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
          <div className="flex justify-end">
            <CreateHarvestRecordForm />
          </div>
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
