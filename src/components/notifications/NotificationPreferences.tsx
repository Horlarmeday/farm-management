import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Switch } from '../ui/switch';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Alert, AlertDescription } from '../ui/alert';
import { Badge } from '../ui/badge';
import {
  Bell,
  BellOff,
  Settings,
  Smartphone,
  Mail,
  MessageSquare,
  AlertTriangle,
  CheckCircle,
  Clock,
  Volume2,
  VolumeX,
  Zap,
  Thermometer,
  Droplets,
  Wind,
  Sun,
  Activity,
  Users,
  Calendar,
  Plus,
  Edit,
  Trash2,
  Save,
  Test
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { toast } from 'sonner';

interface NotificationPreference {
  id: string;
  userId: string;
  type: 'push' | 'email' | 'sms';
  category: 'alerts' | 'reminders' | 'updates' | 'reports';
  enabled: boolean;
  settings: {
    frequency?: 'immediate' | 'hourly' | 'daily' | 'weekly';
    quietHours?: {
      enabled: boolean;
      start: string; // HH:MM format
      end: string; // HH:MM format
    };
    priority?: 'low' | 'medium' | 'high' | 'critical';
    conditions?: {
      sensorTypes?: string[];
      thresholds?: Record<string, { min?: number; max?: number }>;
      farmIds?: string[];
    };
  };
  createdAt: string;
  updatedAt: string;
}

interface PushSubscription {
  id: string;
  userId: string;
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
  userAgent: string;
  isActive: boolean;
  createdAt: string;
  lastUsed: string;
}

interface AlertRule {
  id: string;
  name: string;
  description: string;
  farmId: string;
  conditions: {
    sensorType: string;
    operator: 'gt' | 'lt' | 'eq' | 'gte' | 'lte';
    value: number;
    duration?: number; // minutes
  }[];
  actions: {
    type: 'push' | 'email' | 'sms';
    recipients: string[];
    template: string;
    priority: 'low' | 'medium' | 'high' | 'critical';
  }[];
  enabled: boolean;
  cooldown: number; // minutes
  createdAt: string;
  updatedAt: string;
}

interface NotificationPreferencesProps {
  farmId: string;
}

const NotificationPreferences: React.FC<NotificationPreferencesProps> = ({ farmId }) => {
  const { user } = useAuth();
  const [preferences, setPreferences] = useState<NotificationPreference[]>([]);
  const [subscriptions, setSubscriptions] = useState<PushSubscription[]>([]);
  const [alertRules, setAlertRules] = useState<AlertRule[]>([]);
  const [vapidKey, setVapidKey] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [isRuleDialogOpen, setIsRuleDialogOpen] = useState(false);
  const [selectedRule, setSelectedRule] = useState<AlertRule | null>(null);
  const [newRule, setNewRule] = useState<Partial<AlertRule>>({
    name: '',
    description: '',
    conditions: [{
      sensorType: 'temperature',
      operator: 'gt',
      value: 0
    }],
    actions: [{
      type: 'push',
      recipients: [],
      template: 'Alert: {{sensorType}} {{operator}} {{value}}',
      priority: 'medium'
    }],
    enabled: true,
    cooldown: 30
  });

  const notificationCategories = [
    {
      id: 'alerts',
      name: 'Critical Alerts',
      description: 'Immediate notifications for critical farm conditions',
      icon: AlertTriangle,
      color: 'text-red-500'
    },
    {
      id: 'reminders',
      name: 'Task Reminders',
      description: 'Scheduled reminders for farm activities',
      icon: Clock,
      color: 'text-blue-500'
    },
    {
      id: 'updates',
      name: 'System Updates',
      description: 'Updates about system status and changes',
      icon: Activity,
      color: 'text-green-500'
    },
    {
      id: 'reports',
      name: 'Reports & Analytics',
      description: 'Periodic reports and analytics summaries',
      icon: Calendar,
      color: 'text-purple-500'
    }
  ];

  const sensorTypes = [
    { value: 'temperature', label: 'Temperature', icon: Thermometer },
    { value: 'humidity', label: 'Humidity', icon: Droplets },
    { value: 'soil_moisture', label: 'Soil Moisture', icon: Droplets },
    { value: 'ph', label: 'pH Level', icon: Activity },
    { value: 'light', label: 'Light Intensity', icon: Sun },
    { value: 'wind_speed', label: 'Wind Speed', icon: Wind }
  ];

  const operators = [
    { value: 'gt', label: 'Greater than (>)' },
    { value: 'gte', label: 'Greater than or equal (≥)' },
    { value: 'lt', label: 'Less than (<)' },
    { value: 'lte', label: 'Less than or equal (≤)' },
    { value: 'eq', label: 'Equal to (=)' }
  ];

  const priorities = [
    { value: 'low', label: 'Low', color: 'text-gray-500' },
    { value: 'medium', label: 'Medium', color: 'text-blue-500' },
    { value: 'high', label: 'High', color: 'text-orange-500' },
    { value: 'critical', label: 'Critical', color: 'text-red-500' }
  ];

  // Fetch VAPID key
  const fetchVapidKey = useCallback(async () => {
    try {
      const response = await fetch('/api/notifications/vapid-key', {
        headers: {
          'Authorization': `Bearer ${user?.token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setVapidKey(data.data.publicKey);
      } else {
        throw new Error('Failed to fetch VAPID key');
      }
    } catch (error: any) {
      console.error('Error fetching VAPID key:', error);
      toast.error('Failed to load notification configuration');
    }
  }, [user?.token]);

  // Fetch notification preferences
  const fetchPreferences = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/notifications/preferences', {
        headers: {
          'Authorization': `Bearer ${user?.token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setPreferences(data.data.preferences || []);
      } else {
        throw new Error('Failed to fetch preferences');
      }
    } catch (error: any) {
      console.error('Error fetching preferences:', error);
      toast.error('Failed to load notification preferences');
    } finally {
      setLoading(false);
    }
  }, [user?.token]);

  // Fetch push subscriptions
  const fetchSubscriptions = useCallback(async () => {
    try {
      const response = await fetch('/api/notifications/subscriptions', {
        headers: {
          'Authorization': `Bearer ${user?.token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setSubscriptions(data.data.subscriptions || []);
      } else {
        throw new Error('Failed to fetch subscriptions');
      }
    } catch (error: any) {
      console.error('Error fetching subscriptions:', error);
      toast.error('Failed to load push subscriptions');
    }
  }, [user?.token]);

  // Fetch alert rules
  const fetchAlertRules = useCallback(async () => {
    try {
      const response = await fetch(`/api/notifications/alert-rules/${farmId}`, {
        headers: {
          'Authorization': `Bearer ${user?.token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setAlertRules(data.data.rules || []);
      } else {
        throw new Error('Failed to fetch alert rules');
      }
    } catch (error: any) {
      console.error('Error fetching alert rules:', error);
      toast.error('Failed to load alert rules');
    }
  }, [farmId, user?.token]);

  // Subscribe to push notifications
  const subscribeToPush = useCallback(async () => {
    try {
      if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
        throw new Error('Push notifications are not supported');
      }

      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: vapidKey
      });

      const response = await fetch('/api/notifications/subscribe', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${user?.token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          subscription: subscription.toJSON()
        })
      });

      if (response.ok) {
        toast.success('Successfully subscribed to push notifications');
        fetchSubscriptions();
      } else {
        throw new Error('Failed to subscribe');
      }
    } catch (error: any) {
      console.error('Error subscribing to push:', error);
      toast.error('Failed to subscribe to push notifications');
    }
  }, [vapidKey, user?.token, fetchSubscriptions]);

  // Unsubscribe from push notifications
  const unsubscribeFromPush = useCallback(async (subscriptionId: string) => {
    try {
      const response = await fetch(`/api/notifications/unsubscribe/${subscriptionId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${user?.token}`
        }
      });

      if (response.ok) {
        toast.success('Successfully unsubscribed from push notifications');
        fetchSubscriptions();
      } else {
        throw new Error('Failed to unsubscribe');
      }
    } catch (error: any) {
      console.error('Error unsubscribing from push:', error);
      toast.error('Failed to unsubscribe from push notifications');
    }
  }, [user?.token, fetchSubscriptions]);

  // Update notification preference
  const updatePreference = useCallback(async (preferenceId: string, updates: Partial<NotificationPreference>) => {
    try {
      const response = await fetch(`/api/notifications/preferences/${preferenceId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${user?.token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updates)
      });

      if (response.ok) {
        const data = await response.json();
        setPreferences(prev => prev.map(p => p.id === preferenceId ? data.data.preference : p));
        toast.success('Preference updated successfully');
      } else {
        throw new Error('Failed to update preference');
      }
    } catch (error: any) {
      console.error('Error updating preference:', error);
      toast.error('Failed to update preference');
    }
  }, [user?.token]);

  // Create alert rule
  const createAlertRule = useCallback(async () => {
    try {
      const response = await fetch('/api/notifications/alert-rules', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${user?.token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...newRule,
          farmId
        })
      });

      if (response.ok) {
        const data = await response.json();
        setAlertRules(prev => [...prev, data.data.rule]);
        setIsRuleDialogOpen(false);
        setNewRule({
          name: '',
          description: '',
          conditions: [{
            sensorType: 'temperature',
            operator: 'gt',
            value: 0
          }],
          actions: [{
            type: 'push',
            recipients: [],
            template: 'Alert: {{sensorType}} {{operator}} {{value}}',
            priority: 'medium'
          }],
          enabled: true,
          cooldown: 30
        });
        toast.success('Alert rule created successfully');
      } else {
        throw new Error('Failed to create alert rule');
      }
    } catch (error: any) {
      console.error('Error creating alert rule:', error);
      toast.error('Failed to create alert rule');
    }
  }, [newRule, farmId, user?.token]);

  // Update alert rule
  const updateAlertRule = useCallback(async (ruleId: string, updates: Partial<AlertRule>) => {
    try {
      const response = await fetch(`/api/notifications/alert-rules/${ruleId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${user?.token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updates)
      });

      if (response.ok) {
        const data = await response.json();
        setAlertRules(prev => prev.map(r => r.id === ruleId ? data.data.rule : r));
        toast.success('Alert rule updated successfully');
      } else {
        throw new Error('Failed to update alert rule');
      }
    } catch (error: any) {
      console.error('Error updating alert rule:', error);
      toast.error('Failed to update alert rule');
    }
  }, [user?.token]);

  // Delete alert rule
  const deleteAlertRule = useCallback(async (ruleId: string) => {
    try {
      const response = await fetch(`/api/notifications/alert-rules/${ruleId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${user?.token}`
        }
      });

      if (response.ok) {
        setAlertRules(prev => prev.filter(r => r.id !== ruleId));
        toast.success('Alert rule deleted successfully');
      } else {
        throw new Error('Failed to delete alert rule');
      }
    } catch (error: any) {
      console.error('Error deleting alert rule:', error);
      toast.error('Failed to delete alert rule');
    }
  }, [user?.token]);

  // Send test notification
  const sendTestNotification = useCallback(async () => {
    try {
      const response = await fetch('/api/notifications/test', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${user?.token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          type: 'push',
          title: 'Test Notification',
          body: 'This is a test notification from your farm management system.',
          farmId
        })
      });

      if (response.ok) {
        toast.success('Test notification sent successfully');
      } else {
        throw new Error('Failed to send test notification');
      }
    } catch (error: any) {
      console.error('Error sending test notification:', error);
      toast.error('Failed to send test notification');
    }
  }, [farmId, user?.token]);

  // Initial data load
  useEffect(() => {
    fetchVapidKey();
    fetchPreferences();
    fetchSubscriptions();
    fetchAlertRules();
  }, [fetchVapidKey, fetchPreferences, fetchSubscriptions, fetchAlertRules]);

  const getPreferenceForCategory = (category: string, type: string) => {
    return preferences.find(p => p.category === category && p.type === type);
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Bell className="h-6 w-6 text-blue-500" />
          <h2 className="text-2xl font-bold">Notification Preferences</h2>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" onClick={sendTestNotification}>
            <Test className="h-4 w-4 mr-2" />
            Send Test
          </Button>
          <Button onClick={subscribeToPush} disabled={subscriptions.length > 0}>
            <Bell className="h-4 w-4 mr-2" />
            {subscriptions.length > 0 ? 'Subscribed' : 'Enable Push'}
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="preferences" className="space-y-4">
        <TabsList>
          <TabsTrigger value="preferences">Preferences</TabsTrigger>
          <TabsTrigger value="subscriptions">Subscriptions</TabsTrigger>
          <TabsTrigger value="alert-rules">Alert Rules</TabsTrigger>
        </TabsList>

        {/* Preferences Tab */}
        <TabsContent value="preferences">
          <div className="space-y-4">
            {notificationCategories.map((category) => {
              const CategoryIcon = category.icon;
              return (
                <Card key={category.id}>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <CategoryIcon className={`h-5 w-5 ${category.color}`} />
                      <span>{category.name}</span>
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">{category.description}</p>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {/* Push Notifications */}
                      <div className="space-y-3">
                        <div className="flex items-center space-x-2">
                          <Smartphone className="h-4 w-4" />
                          <Label className="font-medium">Push Notifications</Label>
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <Label htmlFor={`push-${category.id}`} className="text-sm">Enable</Label>
                            <Switch
                              id={`push-${category.id}`}
                              checked={getPreferenceForCategory(category.id, 'push')?.enabled || false}
                              onCheckedChange={(checked) => {
                                const preference = getPreferenceForCategory(category.id, 'push');
                                if (preference) {
                                  updatePreference(preference.id, { enabled: checked });
                                }
                              }}
                            />
                          </div>
                          {getPreferenceForCategory(category.id, 'push')?.enabled && (
                            <div className="space-y-2">
                              <div>
                                <Label className="text-xs text-muted-foreground">Frequency</Label>
                                <Select
                                  value={getPreferenceForCategory(category.id, 'push')?.settings.frequency || 'immediate'}
                                  onValueChange={(value) => {
                                    const preference = getPreferenceForCategory(category.id, 'push');
                                    if (preference) {
                                      updatePreference(preference.id, {
                                        settings: { ...preference.settings, frequency: value as any }
                                      });
                                    }
                                  }}
                                >
                                  <SelectTrigger className="h-8">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="immediate">Immediate</SelectItem>
                                    <SelectItem value="hourly">Hourly</SelectItem>
                                    <SelectItem value="daily">Daily</SelectItem>
                                    <SelectItem value="weekly">Weekly</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Email Notifications */}
                      <div className="space-y-3">
                        <div className="flex items-center space-x-2">
                          <Mail className="h-4 w-4" />
                          <Label className="font-medium">Email Notifications</Label>
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <Label htmlFor={`email-${category.id}`} className="text-sm">Enable</Label>
                            <Switch
                              id={`email-${category.id}`}
                              checked={getPreferenceForCategory(category.id, 'email')?.enabled || false}
                              onCheckedChange={(checked) => {
                                const preference = getPreferenceForCategory(category.id, 'email');
                                if (preference) {
                                  updatePreference(preference.id, { enabled: checked });
                                }
                              }}
                            />
                          </div>
                        </div>
                      </div>

                      {/* SMS Notifications */}
                      <div className="space-y-3">
                        <div className="flex items-center space-x-2">
                          <MessageSquare className="h-4 w-4" />
                          <Label className="font-medium">SMS Notifications</Label>
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <Label htmlFor={`sms-${category.id}`} className="text-sm">Enable</Label>
                            <Switch
                              id={`sms-${category.id}`}
                              checked={getPreferenceForCategory(category.id, 'sms')?.enabled || false}
                              onCheckedChange={(checked) => {
                                const preference = getPreferenceForCategory(category.id, 'sms');
                                if (preference) {
                                  updatePreference(preference.id, { enabled: checked });
                                }
                              }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        {/* Subscriptions Tab */}
        <TabsContent value="subscriptions">
          <Card>
            <CardHeader>
              <CardTitle>Push Notification Subscriptions</CardTitle>
            </CardHeader>
            <CardContent>
              {subscriptions.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <BellOff className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No push subscriptions active</p>
                  <Button onClick={subscribeToPush} className="mt-4">
                    <Bell className="h-4 w-4 mr-2" />
                    Enable Push Notifications
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {subscriptions.map((subscription) => (
                    <Card key={subscription.id}>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="flex items-center space-x-2">
                              <Smartphone className="h-4 w-4" />
                              <span className="font-medium">Device Subscription</span>
                              <Badge variant={subscription.isActive ? 'default' : 'secondary'}>
                                {subscription.isActive ? 'Active' : 'Inactive'}
                              </Badge>
                            </div>
                            <div className="text-sm text-muted-foreground mt-1">
                              <p>User Agent: {subscription.userAgent}</p>
                              <p>Created: {formatTimestamp(subscription.createdAt)}</p>
                              <p>Last Used: {formatTimestamp(subscription.lastUsed)}</p>
                            </div>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => unsubscribeFromPush(subscription.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Alert Rules Tab */}
        <TabsContent value="alert-rules">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium">Alert Rules</h3>
              <Dialog open={isRuleDialogOpen} onOpenChange={setIsRuleDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Rule
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Create Alert Rule</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="rule-name">Rule Name</Label>
                        <Input
                          id="rule-name"
                          value={newRule.name || ''}
                          onChange={(e) => setNewRule(prev => ({ ...prev, name: e.target.value }))}
                          placeholder="Enter rule name"
                        />
                      </div>
                      <div>
                        <Label htmlFor="cooldown">Cooldown (minutes)</Label>
                        <Input
                          id="cooldown"
                          type="number"
                          min="1"
                          value={newRule.cooldown || 30}
                          onChange={(e) => setNewRule(prev => ({ ...prev, cooldown: parseInt(e.target.value) || 30 }))}
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="rule-description">Description</Label>
                      <Textarea
                        id="rule-description"
                        value={newRule.description || ''}
                        onChange={(e) => setNewRule(prev => ({ ...prev, description: e.target.value }))}
                        placeholder="Describe when this rule should trigger"
                      />
                    </div>
                    
                    {/* Conditions */}
                    <div>
                      <Label className="text-base font-medium">Conditions</Label>
                      {newRule.conditions?.map((condition, index) => (
                        <div key={index} className="grid grid-cols-4 gap-2 mt-2">
                          <Select
                            value={condition.sensorType}
                            onValueChange={(value) => {
                              const updatedConditions = [...(newRule.conditions || [])];
                              updatedConditions[index] = { ...condition, sensorType: value };
                              setNewRule(prev => ({ ...prev, conditions: updatedConditions }));
                            }}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {sensorTypes.map((type) => (
                                <SelectItem key={type.value} value={type.value}>
                                  {type.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <Select
                            value={condition.operator}
                            onValueChange={(value) => {
                              const updatedConditions = [...(newRule.conditions || [])];
                              updatedConditions[index] = { ...condition, operator: value as any };
                              setNewRule(prev => ({ ...prev, conditions: updatedConditions }));
                            }}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {operators.map((op) => (
                                <SelectItem key={op.value} value={op.value}>
                                  {op.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <Input
                            type="number"
                            step="any"
                            value={condition.value}
                            onChange={(e) => {
                              const updatedConditions = [...(newRule.conditions || [])];
                              updatedConditions[index] = { ...condition, value: parseFloat(e.target.value) || 0 };
                              setNewRule(prev => ({ ...prev, conditions: updatedConditions }));
                            }}
                            placeholder="Value"
                          />
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              const updatedConditions = (newRule.conditions || []).filter((_, i) => i !== index);
                              setNewRule(prev => ({ ...prev, conditions: updatedConditions }));
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                      <Button
                        variant="outline"
                        size="sm"
                        className="mt-2"
                        onClick={() => {
                          const updatedConditions = [...(newRule.conditions || []), {
                            sensorType: 'temperature',
                            operator: 'gt' as const,
                            value: 0
                          }];
                          setNewRule(prev => ({ ...prev, conditions: updatedConditions }));
                        }}
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add Condition
                      </Button>
                    </div>

                    <div className="flex justify-end space-x-2">
                      <Button variant="outline" onClick={() => setIsRuleDialogOpen(false)}>
                        Cancel
                      </Button>
                      <Button onClick={createAlertRule}>
                        Create Rule
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            {alertRules.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center text-muted-foreground">
                  <AlertTriangle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No alert rules configured</p>
                  <p className="text-sm">Create rules to automatically trigger notifications</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {alertRules.map((rule) => (
                  <Card key={rule.id}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <h4 className="font-medium">{rule.name}</h4>
                            <Badge variant={rule.enabled ? 'default' : 'secondary'}>
                              {rule.enabled ? 'Enabled' : 'Disabled'}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">{rule.description}</p>
                          <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                            <span>Conditions: {rule.conditions.length}</span>
                            <span>Actions: {rule.actions.length}</span>
                            <span>Cooldown: {rule.cooldown}m</span>
                            <span>Created: {formatTimestamp(rule.createdAt)}</span>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Switch
                            checked={rule.enabled}
                            onCheckedChange={(checked) => updateAlertRule(rule.id, { enabled: checked })}
                          />
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedRule(rule);
                              setIsRuleDialogOpen(true);
                            }}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => deleteAlertRule(rule.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default NotificationPreferences;