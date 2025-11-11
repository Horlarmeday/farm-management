import CreateAnimalForm from '@/components/forms/CreateAnimalForm';
import CreateBreedingRecordForm from '@/components/forms/CreateBreedingRecordForm';
import CreateLivestockHealthRecordForm from '@/components/forms/CreateLivestockHealthRecordForm';
import CreateProductionRecordForm from '@/components/forms/CreateProductionRecordForm';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { LoadingTable } from '@/components/ui/loading-card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { VirtualList } from '@/components/ui/VirtualList';
import { useDebouncedSearch } from '@/hooks/useDebounce';
import { useAnimals } from '@/hooks/useLivestock';
import { Dog, Filter, Plus, Search } from 'lucide-react';
import React from 'react';

export default function Livestock() {
  const { data: animalsResponse, isLoading } = useAnimals();
  const { searchValue, debouncedSearchValue, setSearchValue } = useDebouncedSearch();

  const animals = animalsResponse?.data || [];

  // Filter animals based on debounced search value
  const filteredAnimals = React.useMemo(() => {
    if (!debouncedSearchValue.trim()) return animals;

    return animals.filter(
      (animal: any) =>
        animal.tagNumber?.toLowerCase().includes(debouncedSearchValue.toLowerCase()) ||
        animal.breed?.toLowerCase().includes(debouncedSearchValue.toLowerCase()) ||
        animal.species?.toLowerCase().includes(debouncedSearchValue.toLowerCase()) ||
        animal.gender?.toLowerCase().includes(debouncedSearchValue.toLowerCase()),
    );
  }, [animals, debouncedSearchValue]);

  // Memoized animal card renderer for virtual list
  const renderAnimalCard = React.useMemo(
    () => (animal: any, index: number) => (
      <Card key={animal.id} className="mb-4">
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-lg">Tag: {animal.tagNumber}</CardTitle>
              <p className="text-sm text-muted-foreground">
                {animal.breed} • {animal.species}
              </p>
            </div>
            <Badge
              variant={
                animal.status === 'alive'
                  ? 'default'
                  : animal.status === 'sold'
                    ? 'secondary'
                    : 'destructive'
              }
            >
              {animal.status}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Gender</p>
              <p className="text-lg font-semibold">{animal.gender}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Age</p>
              <p className="text-lg font-semibold">
                {animal.dateOfBirth
                  ? `${Math.floor((new Date().getTime() - new Date(animal.dateOfBirth).getTime()) / (1000 * 60 * 60 * 24 * 365))} years`
                  : 'Unknown'}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Acquisition</p>
              <p className="text-lg font-semibold">
                {new Date(animal.acquisitionDate).toLocaleDateString()}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Source</p>
              <p className="text-lg font-semibold">{animal.source || 'Not specified'}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    ),
    [],
  );

  if (isLoading) {
    return (
      <div className="max-w-full mx-auto px-6 py-6">
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
                <Dog className="h-8 w-8 text-purple-600" />
                Livestock Management
              </h1>
              <p className="text-muted-foreground mt-1">
                Track animals, breeding records, and production metrics
              </p>
            </div>
            <div className="flex space-x-3">
              <CreateAnimalForm />
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
              <Dog className="h-8 w-8 text-purple-600" />
              Livestock Management
            </h1>
            <p className="text-muted-foreground mt-1">
              Track animals, breeding records, and production metrics
            </p>
          </div>
          <div className="flex space-x-3">
            <CreateAnimalForm />
            <Button variant="outline">
              <Filter className="h-4 w-4 mr-2" />
              Filter
            </Button>
          </div>
        </div>
      </div>

      <Tabs defaultValue="animals" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="animals">Animals</TabsTrigger>
          <TabsTrigger value="breeding">Breeding</TabsTrigger>
          <TabsTrigger value="production">Production</TabsTrigger>
          <TabsTrigger value="health">Health</TabsTrigger>
        </TabsList>

        <TabsContent value="animals" className="space-y-4">
          <div className="flex items-center space-x-2">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search animals..."
              className="max-w-sm"
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
            />
          </div>

          <div className="space-y-4">
            {animals?.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <Dog className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Animals Found</h3>
                  <p className="text-muted-foreground mb-4">Start by adding your first animal</p>
                  <Button className="farm-button-primary">
                    <Plus className="h-4 w-4 mr-2" />
                    Add First Animal
                  </Button>
                </CardContent>
              </Card>
            ) : animals?.length > 10 ? (
              // Use virtual scrolling for large lists
              <VirtualList
                items={animals}
                itemHeight={200}
                containerHeight={600}
                renderItem={renderAnimalCard}
                overscan={3}
              />
            ) : (
              // Regular rendering for small lists
              <div className="grid gap-4">
                {animals?.map((animal: any, index: number) => renderAnimalCard(animal, index))}
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="breeding" className="space-y-4">
          <div className="flex justify-end">
            <CreateBreedingRecordForm />
          </div>
          <Card>
            <CardContent className="p-8 text-center">
              <h3 className="text-lg font-semibold mb-2">Breeding Records</h3>
              <p className="text-muted-foreground mb-4">
                Track mating, pregnancy, and birth records
              </p>
              <Button className="farm-button-primary">
                <Plus className="h-4 w-4 mr-2" />
                Add Breeding Record
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="production" className="space-y-4">
          <div className="flex justify-end">
            <CreateProductionRecordForm />
          </div>
          <Card>
            <CardContent className="p-8 text-center">
              <h3 className="text-lg font-semibold mb-2">Production Records</h3>
              <p className="text-muted-foreground mb-4">
                Monitor milk yield, weight gain, and other production metrics
              </p>
              <Button className="farm-button-primary">
                <Plus className="h-4 w-4 mr-2" />
                Add Production Record
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="health" className="space-y-4">
          <div className="flex justify-end">
            <CreateLivestockHealthRecordForm />
          </div>
          <Card>
            <CardContent className="p-8 text-center">
              <h3 className="text-lg font-semibold mb-2">Health Records</h3>
              <p className="text-muted-foreground mb-4">
                Track veterinary visits, treatments, and vaccinations
              </p>
              <Button className="farm-button-primary">
                <Plus className="h-4 w-4 mr-2" />
                Add Health Record
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
