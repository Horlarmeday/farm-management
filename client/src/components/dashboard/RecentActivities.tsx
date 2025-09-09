import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useRecentActivities } from "@/hooks/useDashboard";

export default function RecentActivities() {
  const { data: activities, isLoading, isError } = useRecentActivities(4);

  if (isLoading) {
    return (
      <Card className="farm-card">
        <CardHeader>
          <CardTitle className="text-lg">Recent Activities</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="text-sm text-muted-foreground">Loading activities...</div>
        </CardContent>
      </Card>
    );
  }

  if (isError || !activities) {
    return (
      <Card className="farm-card">
        <CardHeader>
          <CardTitle className="text-lg">Recent Activities</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="text-sm text-muted-foreground">No recent activities</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="farm-card">
      <CardHeader>
        <CardTitle className="text-lg">Recent Activities</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {activities.map((activity) => (
          <div key={activity.id} className="flex items-start space-x-3">
            <div className={`w-2 h-2 ${activity.color} rounded-full mt-2`} />
            <div className="flex-1 min-w-0">
              <p className="text-sm text-foreground">{activity.text}</p>
              <p className="text-xs text-muted-foreground">{activity.time}</p>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
