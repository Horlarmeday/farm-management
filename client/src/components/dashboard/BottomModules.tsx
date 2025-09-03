import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Package, 
  PieChart, 
  CheckSquare,
  ExternalLink
} from "lucide-react";

const inventoryItems = [
  { label: "Feed Stock", status: "Low", color: "text-red-600" },
  { label: "Medicines", status: "Good", color: "text-green-600" },
  { label: "Equipment", status: "Medium", color: "text-yellow-600" },
];

const financeItems = [
  { label: "Monthly Revenue", value: "₦2.45M", color: "text-green-600" },
  { label: "Expenses", value: "₦1.82M", color: "text-red-600" },
  { label: "Net Profit", value: "₦630K", color: "text-primary" },
];

const tasks = [
  { id: 1, text: "Feed Layer House A", completed: false },
  { id: 2, text: "Check Pond pH levels", completed: false },
  { id: 3, text: "Collect eggs from House B", completed: true },
  { id: 4, text: "Vaccinate Batch #B2024-003", completed: false },
];

export default function BottomModules() {
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
            <Button
              variant="ghost"
              size="sm"
              className="text-primary hover:text-primary/80"
            >
              <ExternalLink className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {inventoryItems.map((item, index) => (
            <div key={index} className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">{item.label}</span>
              <span className={`text-sm font-semibold ${item.color}`}>
                {item.status}
              </span>
            </div>
          ))}
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
            <Button
              variant="ghost"
              size="sm"
              className="text-primary hover:text-primary/80"
            >
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
            {financeItems.map((item, index) => (
              <div key={index} className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">{item.label}</span>
                <span className={`text-sm font-semibold ${item.color}`}>
                  {item.value}
                </span>
              </div>
            ))}
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
            <Button
              variant="ghost"
              size="sm"
              className="text-primary hover:text-primary/80"
            >
              <ExternalLink className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {tasks.map((task) => (
            <div key={task.id} className="flex items-center space-x-3">
              <Checkbox
                id={`task-${task.id}`}
                checked={task.completed}
                className="border-primary data-[state=checked]:bg-primary"
              />
              <label
                htmlFor={`task-${task.id}`}
                className={`text-sm cursor-pointer ${
                  task.completed
                    ? "line-through text-muted-foreground"
                    : "text-foreground"
                }`}
              >
                {task.text}
              </label>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
