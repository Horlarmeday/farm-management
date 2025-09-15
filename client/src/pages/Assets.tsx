import { useState } from "react";
import { Wrench, Plus, Search, Filter, Calendar, MapPin, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useAssets } from "@/hooks/useAssets";
import { AssetType, AssetStatus } from "@/types/asset.types";
import { formatNaira as formatCurrency } from "@/lib/currency";

export default function Assets() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState<AssetType | "all">("all");
  const [selectedStatus, setSelectedStatus] = useState<AssetStatus | "all">("all");
  
  const { data: assets, isLoading, error } = useAssets({
    search: searchTerm,
    type: selectedType === "all" ? undefined : selectedType,
    status: selectedStatus === "all" ? undefined : selectedStatus,
  });

  const getStatusColor = (status: AssetStatus) => {
    switch (status) {
      case AssetStatus.ACTIVE:
        return "bg-green-100 text-green-800";
      case AssetStatus.MAINTENANCE:
        return "bg-yellow-100 text-yellow-800";
      case AssetStatus.INACTIVE:
        return "bg-gray-100 text-gray-800";
      case AssetStatus.DISPOSED:
        return "bg-red-100 text-red-800";
      case AssetStatus.LOST:
        return "bg-orange-100 text-orange-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getTypeIcon = (type: AssetType) => {
    switch (type) {
      case AssetType.EQUIPMENT:
        return "🔧";
      case AssetType.MACHINERY:
        return "🚜";
      case AssetType.VEHICLE:
        return "🚗";
      case AssetType.BUILDING:
        return "🏢";
      case AssetType.LAND:
        return "🌾";
      case AssetType.TOOLS:
        return "🔨";
      case AssetType.TECHNOLOGY:
        return "💻";
      default:
        return "📦";
    }
  };

  return (
    <div className="max-w-full mx-auto px-6 py-6">
      {/* Page Header */}
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
              <Wrench className="h-8 w-8 text-orange-600" />
              Asset Management
            </h1>
            <p className="text-muted-foreground mt-1">
              Track equipment, vehicles, and auxiliary production units
            </p>
          </div>
          <div className="flex space-x-3">
            <Button className="farm-button-primary">
              <Plus className="h-4 w-4 mr-2" />
              Add Asset
            </Button>
            <Button variant="outline">
              <Filter className="h-4 w-4 mr-2" />
              Filter
            </Button>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="space-y-4 mb-6">
        <div className="flex items-center space-x-2">
          <Search className="h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search assets..."
            className="max-w-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-20 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Error State */}
      {error && (
        <Card>
          <CardContent className="p-8 text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Error Loading Assets</h3>
            <p className="text-muted-foreground mb-4">
              There was an error loading your assets. Please try again.
            </p>
            <Button variant="outline" onClick={() => window.location.reload()}>
              Retry
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Assets Grid */}
      {!isLoading && !error && assets && (
        <>
          {assets.data.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <Wrench className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Assets Found</h3>
                <p className="text-muted-foreground mb-4">
                  {searchTerm ? "No assets match your search criteria." : "Start by adding your first asset or equipment"}
                </p>
                <Button className="farm-button-primary">
                  <Plus className="h-4 w-4 mr-2" />
                  Add First Asset
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {assets.data.map((asset) => (
                <Card key={asset.id} className="hover:shadow-lg transition-shadow cursor-pointer">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">{getTypeIcon(asset.type)}</span>
                        <div>
                          <CardTitle className="text-lg">{asset.name}</CardTitle>
                          <p className="text-sm text-muted-foreground">{asset.model || asset.type}</p>
                        </div>
                      </div>
                      <Badge className={getStatusColor(asset.status)}>
                        {asset.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        <span>Purchased: {asset.purchaseDate ? new Date(asset.purchaseDate).toLocaleDateString() : 'N/A'}</span>
                      </div>
                      {asset.location && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <MapPin className="h-4 w-4" />
                          <span>{asset.location || 'Unknown Location'}</span>
                        </div>
                      )}
                      <div className="pt-2">
                        <p className="text-sm font-medium">
                          Value: {formatCurrency(asset.purchasePrice || 0)}
                        </p>
                        {asset.serialNumber && (
                          <p className="text-xs text-muted-foreground">
                            S/N: {asset.serialNumber}
                          </p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
