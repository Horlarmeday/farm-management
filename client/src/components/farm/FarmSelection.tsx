import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useUserFarms } from '@/hooks/useFarm';
import { Farm, FarmRole, FarmUser } from '@/types/farm.types';
import { AlertCircle, Building2, Plus, Users } from 'lucide-react';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import CreateFarmDialog from './CreateFarmDialog';

interface FarmSelectionProps {
  onFarmSelect: (farmId: string) => void;
}

interface FarmWithRole extends FarmUser {
  farm: Farm;
}

const FarmSelection: React.FC<FarmSelectionProps> = ({ onFarmSelect }) => {
  const navigate = useNavigate();
  const [selectedFarmId, setSelectedFarmId] = useState<string | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const { data: farmUsers, isLoading, error } = useUserFarms();

  const handleFarmSelect = (farmId: string) => {
    setSelectedFarmId(farmId);
    onFarmSelect(farmId);
    toast.success(`Farm selected`);
    navigate('/dashboard');
  };

  const clearStoredFarm = () => {
    localStorage.removeItem('selectedFarmId');
    window.location.reload();
  };

  const handleCreateFarm = () => {
    setIsCreateDialogOpen(true);
  };

  const handleCreateSuccess = (farmId: string) => {
    // Auto-select the newly created farm and navigate to dashboard
    setSelectedFarmId(farmId);
    onFarmSelect(farmId);
    toast.success('Farm created and selected successfully!');
    navigate('/dashboard');
  };

  const getRoleColor = (role: FarmRole) => {
    switch (role) {
      case FarmRole.OWNER:
        return 'bg-green-100 text-green-800 border-green-200';
      case FarmRole.MANAGER:
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case FarmRole.WORKER:
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getRoleLabel = (role: FarmRole) => {
    switch (role) {
      case FarmRole.OWNER:
        return 'Owner';
      case FarmRole.MANAGER:
        return 'Manager';
      case FarmRole.WORKER:
        return 'Worker';
      default:
        return 'Member';
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="w-full max-w-4xl">
          <div className="text-center mb-8">
            <Skeleton className="h-8 w-64 mx-auto mb-2" />
            <Skeleton className="h-4 w-96 mx-auto" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="h-48">
                <CardHeader>
                  <Skeleton className="h-6 w-32" />
                  <Skeleton className="h-4 w-24" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-4 w-3/4 mb-4" />
                  <Skeleton className="h-10 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>Failed to load farms. Please try again later.</AlertDescription>
          </Alert>
          <Button
            onClick={() => window.location.reload()}
            className="w-full mt-4"
            variant="outline"
          >
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Select Your Farm</h1>
          <p className="text-gray-600">Choose which farm you'd like to manage today</p>
        </div>

        {farmUsers && farmUsers.length === 0 ? (
          <div className="text-center">
            <div className="mb-8">
              <Building2 className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-gray-900 mb-2">No Farms Found</h2>
              <p className="text-gray-600 mb-6">
                You don't have access to any farms yet. Create your first farm or ask to be invited
                to an existing one.
              </p>
              <Button
                onClick={handleCreateFarm}
                data-testid="create-first-farm-button"
                className="inline-flex items-center"
              >
                <Plus className="h-4 w-4 mr-2" />
                Create Your First Farm
              </Button>
            </div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {farmUsers?.map((farmUser) => (
                <Card
                  key={farmUser.farmId}
                  data-testid={`farm-card-${farmUser.farmId}`}
                  className={`cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-105 ${
                    selectedFarmId === farmUser.farmId ? 'ring-2 ring-blue-500' : ''
                  }`}
                  onClick={() => handleFarmSelect(farmUser.farmId)}
                >
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg font-semibold text-gray-900 mb-1">
                          Farm {farmUser.farm?.name || farmUser.farmId}
                        </CardTitle>
                        <Badge
                          variant="outline"
                          className={`text-xs ${getRoleColor(farmUser.role)}`}
                        >
                          {getRoleLabel(farmUser.role)}
                        </Badge>
                      </div>
                      <Building2 className="h-6 w-6 text-gray-400" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 mb-4">
                      {farmUser.joinedAt && (
                        <div className="flex items-center text-sm text-gray-600">
                          <Users className="h-4 w-4 mr-2" />
                          Member since {new Date(farmUser.joinedAt).toLocaleDateString()}
                        </div>
                      )}
                    </div>
                    <Button
                      className="w-full"
                      data-testid={`select-farm-button-${farmUser.farmId}`}
                      disabled={selectedFarmId === farmUser.farmId}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleFarmSelect(farmUser.farmId);
                      }}
                    >
                      {selectedFarmId === farmUser.farmId ? 'Selecting...' : 'Select Farm'}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="text-center">
              <Button
                onClick={handleCreateFarm}
                variant="outline"
                data-testid="create-new-farm-button"
                className="inline-flex items-center"
              >
                <Plus className="h-4 w-4 mr-2" />
                Create New Farm
              </Button>
            </div>
          </>
        )}

        {/* Create Farm Dialog */}
        <CreateFarmDialog
          open={isCreateDialogOpen}
          onOpenChange={setIsCreateDialogOpen}
          onSuccess={handleCreateSuccess}
        />
      </div>
    </div>
  );
};

export default FarmSelection;
