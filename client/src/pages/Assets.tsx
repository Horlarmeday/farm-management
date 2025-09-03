import { Wrench, Plus, Search, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";

export default function Assets() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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

      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <Search className="h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search assets..."
            className="max-w-sm"
          />
        </div>

        <Card>
          <CardContent className="p-8 text-center">
            <Wrench className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Assets Found</h3>
            <p className="text-muted-foreground mb-4">
              Start by adding your first asset or equipment
            </p>
            <Button className="farm-button-primary">
              <Plus className="h-4 w-4 mr-2" />
              Add First Asset
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
