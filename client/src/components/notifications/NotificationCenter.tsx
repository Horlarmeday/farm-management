import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { ScrollArea } from '../ui/scroll-area';
import { Separator } from '../ui/separator';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '../ui/sheet';
import { useRealTimeNotifications } from '../../contexts/WebSocketContext';
import { useNotifications, useMarkAsRead, useDeleteNotification, useMarkAllAsRead } from '../../hooks/useNotifications';
import {
  Bell,
  BellRing,
  Check,
  X,
  Filter,
  MoreVertical,
  CheckCircle,
  AlertTriangle,
  AlertCircle,
  Info,
  Trash2,
  Settings,
  Clock,
  Mail
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { format, formatDistanceToNow } from 'date-fns';
import { useToast } from '../../hooks/use-toast';
import type {
  Notification,
  NotificationTemplate,
  NotificationSubscription,
  NotificationStats,
  CreateNotificationRequest,
  UpdateNotificationRequest,
  CreateNotificationTemplateRequest,
  UpdateNotificationTemplateRequest
} from '../../../../shared/src/types/notification.types';
import type { Priority } from '../../../../shared/src/types/common.types';
import {
  NotificationType,
  NotificationStatus
} from '../../../../shared/src/types/notification.types';

interface NotificationCenterProps {
  farmId?: string;
  className?: string;
}

// Use the shared Notification type instead of local interface
type NotificationItem = Notification & {
  body?: string; // Map message to body for backward compatibility
  timestamp: string; // Ensure timestamp is string for display
  read?: boolean; // Map readAt to read boolean
  category?: string; // Additional category field
};



const NotificationCenter: React.FC<NotificationCenterProps> = ({ farmId, className }) => {
  const { toast } = useToast();
  const { latestNotification, clearNotifications } = useRealTimeNotifications();
  const { data: notifications = [], isLoading, error } = useNotifications();
  const markAsReadMutation = useMarkAsRead();
  const deleteNotificationMutation = useDeleteNotification();
  const markAllAsReadMutation = useMarkAllAsRead();
  
  const [filter, setFilter] = useState<'all' | 'unread' | 'alerts' | 'system'>('all');
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (notifications && Array.isArray(notifications)) {
      setUnreadCount(notifications.filter((n: any) => n.status === 'pending').length);
    }
  }, [notifications]);

  const handleMarkAsRead = async (id: string) => {
    try {
      await markAsReadMutation.mutateAsync(id);
      toast({ title: "Success", description: "Notification marked as read" });
    } catch (error) {
      toast({ title: "Error", description: "Failed to mark notification as read", variant: "destructive" });
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsReadMutation.mutateAsync();
      toast({ title: "Success", description: "All notifications marked as read" });
    } catch (error) {
      toast({ title: "Error", description: "Failed to mark all notifications as read", variant: "destructive" });
    }
  };

  const handleDeleteNotification = async (id: string) => {
    try {
      await deleteNotificationMutation.mutateAsync(id);
      toast({ title: "Success", description: "Notification deleted" });
    } catch (error) {
      toast({ title: "Error", description: "Failed to delete notification", variant: "destructive" });
    }
  };

  const getNotificationIcon = (type: NotificationType) => {
    switch (type) {
      case NotificationType.HEALTH_ALERT:
      case NotificationType.STOCK_ALERT:
      case NotificationType.SYSTEM_ALERT:
      case NotificationType.WEATHER_ALERT:
        return <AlertTriangle className="h-4 w-4 text-orange-500" />;
      case NotificationType.VACCINATION_REMINDER:
      case NotificationType.FEEDING_REMINDER:
      case NotificationType.MAINTENANCE_REMINDER:
      case NotificationType.HARVEST_REMINDER:
        return <Clock className="h-4 w-4 text-blue-500" />;
      case NotificationType.TASK_ASSIGNMENT:
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      default:
        return <Bell className="h-4 w-4 text-gray-500" />;
    }
  };

  const getPriorityColor = (priority: Priority) => {
    switch (priority) {
      case 'high':
      case 'urgent':
        return 'border-red-200 text-red-700 bg-red-50';
      case 'medium':
        return 'border-yellow-200 text-yellow-700 bg-yellow-50';
      case 'low':
      default:
        return 'border-gray-200 text-gray-700 bg-gray-50';
    }
  };

  const filtered = (notifications && Array.isArray(notifications) ? notifications : []).filter((notification: any) => {
      switch (filter) {
        case 'unread':
          return notification.status === 'pending';
        case 'alerts':
          return [
            NotificationType.HEALTH_ALERT,
            NotificationType.STOCK_ALERT,
            NotificationType.SYSTEM_ALERT,
            NotificationType.WEATHER_ALERT
          ].includes(notification.type);
        case 'system':
          return notification.isGlobal;
        default:
          return true;
      }
    });

  const handleNotificationClick = (notification: any) => {
    if (notification.status === 'pending') {
      handleMarkAsRead(notification.id);
    }
    
    if (notification.actionUrl) {
      // Handle navigation to specific page
      window.open(notification.actionUrl, '_blank');
    } else if (notification.referenceUrl) {
      window.open(notification.referenceUrl, '_blank');
    }
    
    toast({ title: "Success", description: "Notification opened" });
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="sm" className={cn('relative', className)}>
          {unreadCount > 0 ? (
            <BellRing className="h-5 w-5" />
          ) : (
            <Bell className="h-5 w-5" />
          )}
          {unreadCount > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs"
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </Badge>
          )}
        </Button>
      </SheetTrigger>
      
      <SheetContent className="w-full sm:w-96">
        <SheetHeader>
          <SheetTitle className="flex items-center justify-between">
            <span>Notifications</span>
            {unreadCount > 0 && (
              <Badge variant="secondary">
                {unreadCount} unread
              </Badge>
            )}
          </SheetTitle>
          <SheetDescription>
            Real-time notifications from your farm management system
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-4">
          {/* Filter Buttons */}
          <div className="flex flex-wrap gap-2">
            {[
              { key: 'all', label: 'All' },
              { key: 'unread', label: 'Unread' },
              { key: 'alerts', label: 'Alerts' },
              { key: 'system', label: 'System' }
            ].map(({ key, label }) => (
              <Button
                key={key}
                variant={filter === key ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilter(key as any)}
              >
                {label}
              </Button>
            ))}
          </div>

          {/* Action Buttons */}
          {notifications && Array.isArray(notifications) && notifications.length > 0 && (
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleMarkAllAsRead}
                disabled={unreadCount === 0}
              >
                <Check className="h-4 w-4 mr-2" />
                Mark all read
              </Button>
            </div>
          )}

          <Separator />

          {/* Notifications List */}
          <ScrollArea className="h-96">
            {isLoading ? (
              <div className="text-center py-12 text-muted-foreground">
                <div className="text-lg">Loading notifications...</div>
              </div>
            ) : error ? (
              <div className="text-center py-12 text-red-500">
                <div className="text-lg">Error loading notifications</div>
              </div>
            ) : notifications && Array.isArray(notifications) && notifications.length > 0 ? (
              <div className="space-y-3">
                {filtered.map((notification: any) => (
                  <Card 
                    key={notification.id} 
                    className={cn(
                      'cursor-pointer transition-colors hover:bg-muted/50',
                      notification.status === 'pending' && 'border-l-4 border-l-blue-500 bg-blue-50/50'
                    )}
                    onClick={() => handleNotificationClick(notification)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start space-x-3">
                        {getNotificationIcon(notification.type)}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <h4 className={cn(
                              'text-sm font-medium truncate',
                              notification.status === 'pending' && 'font-semibold'
                            )}>
                              {notification.title}
                            </h4>
                            <div className="flex items-center space-x-1">
                              <Badge 
                                variant="outline" 
                                className={cn('text-xs', getPriorityColor(notification.priority))}
                              >
                                {notification.priority}
                              </Badge>
                              <div className="flex space-x-1">
                                {notification.status === 'pending' && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-6 w-6 p-0"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleMarkAsRead(notification.id);
                                    }}
                                    disabled={false}
                                  >
                                    <Check className="h-3 w-3" />
                                  </Button>
                                )}
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeleteNotification(notification.id);
                                  }}
                                  disabled={false}
                                >
                                  <X className="h-3 w-3" />
                                </Button>
                              </div>
                            </div>
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">
                            {notification.message}
                          </p>
                          <div className="flex items-center justify-between text-xs text-muted-foreground">
                            <span>
                              {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                            </span>
                            <Badge variant="outline" className="text-xs">
                              {notification.type.replace('_', ' ').toLowerCase()}
                            </Badge>
                          </div>

                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <Bell className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <h3 className="text-lg font-medium mb-2">No notifications</h3>
                <p className="text-sm">
                  {filter === 'unread' 
                    ? 'All caught up! No unread notifications.'
                    : 'You\'ll see notifications here when they arrive.'}
                </p>
              </div>
            )}
          </ScrollArea>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default NotificationCenter;