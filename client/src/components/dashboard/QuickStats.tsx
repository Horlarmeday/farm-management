import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useQuickStats } from "@/hooks/useDashboard";

export default function QuickStats() {
  const { data: quickStats, isLoading, isError } = useQuickStats();

  if (isLoading) {
    return (
      <Card className="farm-card">
        <CardHeader>
          <CardTitle className="text-lg">Quick Stats</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-sm text-muted-foreground">Loading...</div>
        </CardContent>
      </Card>
    );
  }

  if (isError || !quickStats) {
    return (
      <Card className="farm-card">
        <CardHeader>
          <CardTitle className="text-lg">Quick Stats</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-sm text-red-500">Failed to load stats</div>
        </CardContent>
      </Card>
    );
  }

  const stats = [
    {
      label: "Feed Consumption",
      value: quickStats.feedConsumption?.value || '0',
      progress: quickStats.feedConsumption?.progress || 0,
      color: "bg-orange-500",
    },
    {
      label: "Mortality Rate",
      value: quickStats.mortalityRate?.value || '0',
      progress: quickStats.mortalityRate?.progress || 0,
      color: "bg-red-500",
    },
    {
      label: "Production Efficiency",
      value: quickStats.productionEfficiency?.value || '0',
      progress: quickStats.productionEfficiency?.progress || 0,
      color: "bg-green-500",
    },
  ];

  return (
    <Card className="farm-card">
      <CardHeader>
        <CardTitle className="text-lg">Quick Stats</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {stats.map((stat, index) => (
          <div key={index} className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">{stat.label}</span>
              <span className="text-sm font-semibold">{stat.value}</span>
            </div>
            <Progress value={stat.progress} className="h-2" />
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
