import React from 'react';
import { AlertTriangle, Info, XCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAlerts } from '@/hooks/useDashboard';
import { formatDistanceToNow } from 'date-fns';

const getAlertColor = (type: 'warning' | 'error' | 'info') => {
  switch (type) {
    case 'error':
      return 'bg-red-100 text-red-800 border-red-200';
    case 'warning':
      return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    case 'info':
      return 'bg-blue-100 text-blue-800 border-blue-200';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

const getAlertIcon = (type: 'warning' | 'error' | 'info') => {
  switch (type) {
    case 'error':
      return <XCircle className="h-4 w-4" />;
    case 'warning':
      return <AlertTriangle className="h-4 w-4" />;
    case 'info':
      return <Info className="h-4 w-4" />;
    default:
      return <Info className="h-4 w-4" />;
  }
};

export function AlertsWidget() {
  const { data: alerts = [], isLoading, error } = useAlerts(4);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-yellow-500" />
            Recent Alerts
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex items-start gap-3 p-3 rounded-lg border bg-card animate-pulse">
                <div className="w-6 h-6 bg-gray-200 rounded-full"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-yellow-500" />
            Recent Alerts
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6 text-muted-foreground">
            <XCircle className="h-8 w-8 mx-auto mb-2 text-red-500" />
            <p>Failed to load alerts</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-yellow-500" />
          Recent Alerts
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {alerts.map((alert) => (
            <div
              key={alert.id}
              className="flex items-start gap-3 p-3 rounded-lg border bg-card"
            >
              <div className={`p-1 rounded-full ${getAlertColor(alert.type)}`}>
                {getAlertIcon(alert.type)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-medium text-foreground">
                    {alert.title}
                  </h4>
                  <Badge variant="outline" className={getAlertColor(alert.type)}>
                    {alert.type}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  {alert.description}
                </p>
                <p className="text-xs text-muted-foreground mt-2">
                  {formatDistanceToNow(alert.timestamp, { addSuffix: true })}
                </p>
              </div>
            </div>
          ))}
        </div>
        {alerts.length === 0 && (
          <div className="text-center py-6 text-muted-foreground">
            <AlertTriangle className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>No alerts at this time</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
