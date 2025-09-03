import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

const stats = [
  {
    label: "Feed Consumption",
    value: "2,840 kg",
    progress: 75,
    color: "bg-primary",
  },
  {
    label: "Mortality Rate",
    value: "2.1%",
    progress: 8,
    color: "bg-green-500",
  },
  {
    label: "Production Efficiency",
    value: "89%",
    progress: 89,
    color: "bg-blue-500",
  },
];

export default function QuickStats() {
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
