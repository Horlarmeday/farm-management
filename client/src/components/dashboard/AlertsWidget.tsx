import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Syringe, Droplets } from "lucide-react";

const alerts = [
  {
    id: 1,
    type: "warning",
    title: "Low Feed Stock",
    description: "Poultry feed below minimum threshold",
    icon: AlertTriangle,
    color: "red",
  },
  {
    id: 2,
    type: "info",
    title: "Vaccination Due",
    description: "Batch #B2024-001 vaccination scheduled",
    icon: Syringe,
    color: "yellow",
  },
  {
    id: 3,
    type: "info",
    title: "Water Quality Check",
    description: "Pond #3 requires pH monitoring",
    icon: Droplets,
    color: "blue",
  },
];

const alertColorClasses = {
  red: "bg-red-50 dark:bg-red-900/20",
  yellow: "bg-yellow-50 dark:bg-yellow-900/20",
  blue: "bg-blue-50 dark:bg-blue-900/20",
};

const iconColorClasses = {
  red: "text-red-500",
  yellow: "text-yellow-500",
  blue: "text-blue-500",
};

const textColorClasses = {
  red: "text-red-900 dark:text-red-400",
  yellow: "text-yellow-900 dark:text-yellow-400",
  blue: "text-blue-900 dark:text-blue-400",
};

const subtextColorClasses = {
  red: "text-red-600 dark:text-red-500",
  yellow: "text-yellow-600 dark:text-yellow-500",
  blue: "text-blue-600 dark:text-blue-500",
};

export default function AlertsWidget() {
  return (
    <Card className="farm-card">
      <CardHeader>
        <CardTitle className="text-lg">Recent Alerts</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {alerts.map((alert) => {
          const Icon = alert.icon;
          return (
            <div
              key={alert.id}
              className={`flex items-start space-x-3 p-3 rounded-lg ${
                alertColorClasses[alert.color as keyof typeof alertColorClasses]
              }`}
            >
              <Icon
                className={`h-4 w-4 mt-0.5 ${
                  iconColorClasses[alert.color as keyof typeof iconColorClasses]
                }`}
              />
              <div className="flex-1 min-w-0">
                <p
                  className={`text-sm font-medium ${
                    textColorClasses[alert.color as keyof typeof textColorClasses]
                  }`}
                >
                  {alert.title}
                </p>
                <p
                  className={`text-xs ${
                    subtextColorClasses[alert.color as keyof typeof subtextColorClasses]
                  }`}
                >
                  {alert.description}
                </p>
              </div>
            </div>
          );
        })}
        <Button
          variant="ghost"
          size="sm"
          className="w-full text-primary hover:text-primary/80"
        >
          View All Alerts
        </Button>
      </CardContent>
    </Card>
  );
}
