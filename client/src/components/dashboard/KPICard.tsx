import { Card, CardContent } from "@/components/ui/card";
import { ReactNode } from "react";

interface KPICardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: ReactNode;
  trend?: {
    value: string;
    positive: boolean;
  };
  color?: "primary" | "yellow" | "blue" | "purple" | "green" | "red";
}

const colorClasses = {
  primary: "bg-primary/10 text-primary",
  yellow: "bg-yellow-100 text-yellow-600 dark:bg-yellow-900/20 dark:text-yellow-400",
  blue: "bg-blue-100 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400",
  purple: "bg-purple-100 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400",
  green: "bg-green-100 text-green-600 dark:bg-green-900/20 dark:text-green-400",
  red: "bg-red-100 text-red-600 dark:bg-red-900/20 dark:text-red-400",
};

export default function KPICard({
  title,
  value,
  subtitle,
  icon,
  trend,
  color = "primary",
}: KPICardProps) {
  return (
    <Card className="farm-card">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold">{value}</p>
            {subtitle && (
              <p className="text-sm text-muted-foreground">{subtitle}</p>
            )}
            {trend && (
              <p
                className={`text-sm ${
                  trend.positive ? "text-green-600" : "text-red-600"
                }`}
              >
                {trend.value}
              </p>
            )}
          </div>
          <div className={`p-3 rounded-full ${colorClasses[color]}`}>
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
