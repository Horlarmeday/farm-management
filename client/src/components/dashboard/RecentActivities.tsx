import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const activities = [
  {
    id: 1,
    text: "Added new poultry batch",
    time: "2 hours ago",
    color: "bg-primary",
  },
  {
    id: 2,
    text: "Updated water quality - Pond #5",
    time: "4 hours ago",
    color: "bg-blue-500",
  },
  {
    id: 3,
    text: "Completed vaccination schedule",
    time: "6 hours ago",
    color: "bg-green-500",
  },
  {
    id: 4,
    text: "Feed inventory updated",
    time: "8 hours ago",
    color: "bg-yellow-500",
  },
];

export default function RecentActivities() {
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
