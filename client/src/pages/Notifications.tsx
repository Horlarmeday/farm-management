import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Bell, Check, CheckCheck, Trash2, Settings, Filter } from 'lucide-react';
import {
  useNotifications,
  useUnreadNotificationCount,
  useMarkAsRead,
  useMarkAllAsRead,
  useBulkDeleteNotifications,
  useNotificationTemplates,
  useNotificationSubscriptions,
  useNotificationStats,
} from '../hooks/useNotifications';
import { NotificationType, NotificationStatus } from '../../../shared/src/types/notification.types';
import { Priority } from '../../../shared/src/types/common.types';
import { formatDistanceToNow } from 'date-fns';

const Notifications: React.FC = () => {
  const [selectedTab, setSelectedTab] = useState('all');
  const [selectedNotifications, setSelectedNotifications] = useState<string[]>([]);
  const [filterType, setFilterType] = useState<NotificationType | undefined>();
  const [filterStatus, setFilterStatus] = useState<NotificationStatus | undefined>();
  const [filterPriority, setFilterPriority] = useState<Priority | undefined>();

  // Queries
  const { data: notifications, isLoading: notificationsLoading } = useNotifications({
    type: filterType,
    status: filterStatus,
    priority: filterPriority,
    page: 1,
    limit: 50,
  });

  const { data: unreadCount } = useUnreadNotificationCount();
  const { data: templates } = useNotificationTemplates();
  const { data: subscriptions } = useNotificationSubscriptions();
  const { data: stats } = useNotificationStats();

  // Mutations
  const markAsReadMutation = useMarkAsRead();
  const markAllAsReadMutation = useMarkAllAsRead();
  const bulkDeleteMutation = useBulkDeleteNotifications();

  const handleMarkAsRead = (id: string) => {
    markAsReadMutation.mutate(id);
  };

  const handleMarkAllAsRead = () => {
    markAllAsReadMutation.mutate(undefined);
  };

  const handleBulkDelete = () => {
    if (selectedNotifications.length > 0) {
      bulkDeleteMutation.mutate(selectedNotifications);
      setSelectedNotifications([]);
    }
  };

  const handleSelectNotification = (id: string) => {
    setSelectedNotifications(prev => 
      prev.includes(id) 
        ? prev.filter(nId => nId !== id)
        : [...prev, id]
    );
  };

  const getPriorityColor = (priority: Priority) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeColor = (type: NotificationType) => {
    switch (type) {
      case NotificationType.HEALTH_ALERT:
        return 'bg-red-100 text-red-800';
      case NotificationType.STOCK_ALERT:
        return 'bg-orange-100 text-orange-800';
      case NotificationType.VACCINATION_REMINDER:
        return 'bg-blue-100 text-blue-800';
      case NotificationType.FEEDING_REMINDER:
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (notificationsLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Loading notifications...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Bell className="h-8 w-8 text-blue-600" />
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Notifications</h1>
            <p className="text-gray-600">Manage your farm notifications and alerts</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          {unreadCount?.data && unreadCount.data.count > 0 && (
            <Badge variant="destructive">
              {unreadCount.data.count} unread
            </Badge>
          )}
          <Button onClick={handleMarkAllAsRead} variant="outline" size="sm">
            <CheckCheck className="h-4 w-4 mr-2" />
            Mark All Read
          </Button>
          {selectedNotifications.length > 0 && (
            <Button onClick={handleBulkDelete} variant="destructive" size="sm">
              <Trash2 className="h-4 w-4 mr-2" />
              Delete Selected ({selectedNotifications.length})
            </Button>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      {stats?.data && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total</p>
                  <p className="text-2xl font-bold">{stats.data.totalNotifications}</p>
                </div>
                <Bell className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Unread</p>
                  <p className="text-2xl font-bold text-red-600">{stats.data.unreadNotifications}</p>
                </div>
                <Badge variant="destructive" className="h-8 w-8 rounded-full p-0 flex items-center justify-center">
                  !
                </Badge>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Email Delivered</p>
                  <p className="text-2xl font-bold text-green-600">{stats.data.deliveryStats.emailDelivered}</p>
                </div>
                <Check className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Clicked</p>
                  <p className="text-2xl font-bold text-blue-600">{stats.data.engagementStats.clicked}</p>
                </div>
                <Settings className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Filter className="h-5 w-5" />
            <span>Filters</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Type</label>
              <select 
                value={filterType || ''} 
                onChange={(e) => setFilterType(e.target.value as NotificationType || undefined)}
                className="border rounded px-3 py-1 text-sm"
              >
                <option value="">All Types</option>
                {Object.values(NotificationType).map(type => (
                  <option key={type} value={type}>{type.replace('_', ' ').toUpperCase()}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Status</label>
              <select 
                value={filterStatus || ''} 
                onChange={(e) => setFilterStatus(e.target.value as NotificationStatus || undefined)}
                className="border rounded px-3 py-1 text-sm"
              >
                <option value="">All Status</option>
                {Object.values(NotificationStatus).map(status => (
                  <option key={status} value={status}>{status.toUpperCase()}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Priority</label>
              <select 
                value={filterPriority || ''} 
                onChange={(e) => setFilterPriority(e.target.value as Priority || undefined)}
                className="border rounded px-3 py-1 text-sm"
              >
                <option value="">All Priorities</option>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Notifications List */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Notifications</CardTitle>
          <CardDescription>
            {notifications?.data?.length || 0} notifications found
          </CardDescription>
        </CardHeader>
        <CardContent>
          {notifications?.data && notifications.data.length > 0 ? (
            <div className="space-y-4">
              {notifications.data.map((notification) => (
                <div 
                  key={notification.id} 
                  className={`p-4 border rounded-lg hover:bg-gray-50 transition-colors ${
                    notification.status === NotificationStatus.READ ? 'opacity-75' : ''
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3 flex-1">
                      <input
                        type="checkbox"
                        checked={selectedNotifications.includes(notification.id)}
                        onChange={() => handleSelectNotification(notification.id)}
                        className="mt-1"
                      />
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <h3 className="font-semibold text-gray-900">{notification.title}</h3>
                          <Badge className={getPriorityColor(notification.priority)}>
                            {notification.priority}
                          </Badge>
                          <Badge className={getTypeColor(notification.type)}>
                            {notification.type.replace('_', ' ')}
                          </Badge>
                          {notification.status === NotificationStatus.READ && (
                            <Badge variant="secondary">Read</Badge>
                          )}
                        </div>
                        <p className="text-gray-600 mb-2">{notification.message}</p>
                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          <span>{formatDistanceToNow(new Date(notification.createdAt))} ago</span>
                          {notification.actionRequired && (
                            <Badge variant="outline">Action Required</Badge>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {notification.status !== NotificationStatus.READ && (
                        <Button 
                          onClick={() => handleMarkAsRead(notification.id)}
                          variant="outline" 
                          size="sm"
                        >
                          <Check className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Bell className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No notifications found</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Templates and Subscriptions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Notification Templates</CardTitle>
            <CardDescription>
              {templates?.data?.length || 0} templates available
            </CardDescription>
          </CardHeader>
          <CardContent>
            {templates?.data && templates.data.length > 0 ? (
              <div className="space-y-2">
                {templates.data.slice(0, 5).map((template) => (
                  <div key={template.id} className="flex items-center justify-between p-2 border rounded">
                    <div>
                      <p className="font-medium">{template.name}</p>
                      <p className="text-sm text-gray-600">{template.type.replace('_', ' ')}</p>
                    </div>
                    <Badge className={template.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                      {template.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-600">No templates found</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Notification Subscriptions</CardTitle>
            <CardDescription>
              {subscriptions?.data?.length || 0} subscriptions configured
            </CardDescription>
          </CardHeader>
          <CardContent>
            {subscriptions?.data && subscriptions.data.length > 0 ? (
              <div className="space-y-2">
                {subscriptions.data.slice(0, 5).map((subscription) => (
                  <div key={subscription.id} className="flex items-center justify-between p-2 border rounded">
                    <div>
                      <p className="font-medium">{subscription.notificationType.replace('_', ' ')}</p>
                      <p className="text-sm text-gray-600">{subscription.methods.join(', ')}</p>
                    </div>
                    <Badge className={subscription.isEnabled ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                      {subscription.isEnabled ? 'Enabled' : 'Disabled'}
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-600">No subscriptions found</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Notifications;