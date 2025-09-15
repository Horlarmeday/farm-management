import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Bell,
  Mail,
  MessageSquare,
  Smartphone,
  AlertTriangle,
  Info,
  CheckCircle,
  Clock,
  Volume2,
  VolumeX,
  Settings,
  Save
} from 'lucide-react';

interface NotificationSetting {
  id: string;
  title: string;
  description: string;
  enabled: boolean;
  channels: {
    email: boolean;
    push: boolean;
    sms: boolean;
    inApp: boolean;
  };
  frequency: 'immediate' | 'hourly' | 'daily' | 'weekly';
  priority: 'low' | 'medium' | 'high' | 'critical';
}

const defaultNotificationSettings: NotificationSetting[] = [
  {
    id: 'livestock-alerts',
    title: 'Livestock Health Alerts',
    description: 'Critical health issues, mortality, and veterinary reminders',
    enabled: true,
    channels: { email: true, push: true, sms: true, inApp: true },
    frequency: 'immediate',
    priority: 'critical'
  },
  {
    id: 'feed-inventory',
    title: 'Feed Inventory Alerts',
    description: 'Low stock warnings and reorder notifications',
    enabled: true,
    channels: { email: true, push: true, sms: false, inApp: true },
    frequency: 'daily',
    priority: 'high'
  },
  {
    id: 'production-updates',
    title: 'Production Updates',
    description: 'Daily egg production, milk yield, and performance metrics',
    enabled: true,
    channels: { email: true, push: false, sms: false, inApp: true },
    frequency: 'daily',
    priority: 'medium'
  },
  {
    id: 'financial-reports',
    title: 'Financial Reports',
    description: 'Weekly and monthly financial summaries and insights',
    enabled: true,
    channels: { email: true, push: false, sms: false, inApp: true },
    frequency: 'weekly',
    priority: 'medium'
  },
  {
    id: 'weather-alerts',
    title: 'Weather Alerts',
    description: 'Severe weather warnings and farm impact notifications',
    enabled: true,
    channels: { email: false, push: true, sms: true, inApp: true },
    frequency: 'immediate',
    priority: 'high'
  },
  {
    id: 'maintenance-reminders',
    title: 'Maintenance Reminders',
    description: 'Equipment maintenance schedules and facility upkeep',
    enabled: true,
    channels: { email: true, push: true, sms: false, inApp: true },
    frequency: 'weekly',
    priority: 'medium'
  },
  {
    id: 'market-updates',
    title: 'Market Price Updates',
    description: 'Commodity prices and market trend notifications',
    enabled: false,
    channels: { email: true, push: false, sms: false, inApp: true },
    frequency: 'daily',
    priority: 'low'
  },
  {
    id: 'system-notifications',
    title: 'System Notifications',
    description: 'App updates, maintenance, and system announcements',
    enabled: true,
    channels: { email: false, push: true, sms: false, inApp: true },
    frequency: 'immediate',
    priority: 'low'
  }
];

interface NotificationPreferencesProps {
  className?: string;
}

const NotificationPreferences: React.FC<NotificationPreferencesProps> = ({ className }) => {
  const [settings, setSettings] = useState<NotificationSetting[]>(defaultNotificationSettings);
  const [globalSettings, setGlobalSettings] = useState({
    doNotDisturb: false,
    quietHours: {
      enabled: false,
      start: '22:00',
      end: '07:00'
    },
    soundEnabled: true,
    vibrationEnabled: true,
    emailDigest: true,
    digestFrequency: 'daily' as 'daily' | 'weekly'
  });
  const [isSaving, setIsSaving] = useState(false);

  const updateSetting = (id: string, updates: Partial<NotificationSetting>) => {
    setSettings(prev => prev.map(setting => 
      setting.id === id ? { ...setting, ...updates } : setting
    ));
  };

  const updateChannel = (id: string, channel: keyof NotificationSetting['channels'], enabled: boolean) => {
    setSettings(prev => prev.map(setting => 
      setting.id === id 
        ? { ...setting, channels: { ...setting.channels, [channel]: enabled } }
        : setting
    ));
  };

  const handleSave = async () => {
    setIsSaving(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsSaving(false);
    // Show success message
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-blue-100 text-blue-800';
      case 'low': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'critical': return <AlertTriangle className="h-4 w-4" />;
      case 'high': return <AlertTriangle className="h-4 w-4" />;
      case 'medium': return <Info className="h-4 w-4" />;
      case 'low': return <CheckCircle className="h-4 w-4" />;
      default: return <Info className="h-4 w-4" />;
    }
  };

  return (
    <div className={`space-y-6 p-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Notification Preferences</h1>
          <p className="text-gray-600 mt-1">
            Customize how and when you receive notifications
          </p>
        </div>
        <Button
          onClick={handleSave}
          disabled={isSaving}
          className="flex items-center space-x-2"
        >
          <Save className="h-4 w-4" />
          <span>{isSaving ? 'Saving...' : 'Save Changes'}</span>
        </Button>
      </div>

      <Tabs defaultValue="notifications" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="channels">Channels</TabsTrigger>
          <TabsTrigger value="global">Global Settings</TabsTrigger>
        </TabsList>

        {/* Notifications Tab */}
        <TabsContent value="notifications" className="space-y-6">
          <div className="space-y-4">
            {settings.map((setting) => (
              <Card key={setting.id}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Switch
                        checked={setting.enabled}
                        onCheckedChange={(enabled) => updateSetting(setting.id, { enabled })}
                      />
                      <div>
                        <CardTitle className="text-lg">{setting.title}</CardTitle>
                        <CardDescription>{setting.description}</CardDescription>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge className={getPriorityColor(setting.priority)}>
                        {getPriorityIcon(setting.priority)}
                        <span className="ml-1 capitalize">{setting.priority}</span>
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                {setting.enabled && (
                  <CardContent className="pt-0">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Delivery Channels */}
                      <div className="space-y-3">
                        <Label className="text-sm font-medium">Delivery Channels</Label>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <Mail className="h-4 w-4 text-gray-500" />
                              <span className="text-sm">Email</span>
                            </div>
                            <Switch
                              checked={setting.channels.email}
                              onCheckedChange={(checked) => updateChannel(setting.id, 'email', checked)}
                            />
                          </div>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <Bell className="h-4 w-4 text-gray-500" />
                              <span className="text-sm">Push Notification</span>
                            </div>
                            <Switch
                              checked={setting.channels.push}
                              onCheckedChange={(checked) => updateChannel(setting.id, 'push', checked)}
                            />
                          </div>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <MessageSquare className="h-4 w-4 text-gray-500" />
                              <span className="text-sm">SMS</span>
                            </div>
                            <Switch
                              checked={setting.channels.sms}
                              onCheckedChange={(checked) => updateChannel(setting.id, 'sms', checked)}
                            />
                          </div>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <Smartphone className="h-4 w-4 text-gray-500" />
                              <span className="text-sm">In-App</span>
                            </div>
                            <Switch
                              checked={setting.channels.inApp}
                              onCheckedChange={(checked) => updateChannel(setting.id, 'inApp', checked)}
                            />
                          </div>
                        </div>
                      </div>

                      {/* Frequency and Priority */}
                      <div className="space-y-3">
                        <Label className="text-sm font-medium">Settings</Label>
                        <div className="space-y-3">
                          <div>
                            <Label className="text-xs text-gray-500">Frequency</Label>
                            <Select
                              value={setting.frequency}
                              onValueChange={(frequency) => updateSetting(setting.id, { frequency: frequency as any })}
                            >
                              <SelectTrigger className="w-full">
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
                          <div>
                            <Label className="text-xs text-gray-500">Priority</Label>
                            <Select
                              value={setting.priority}
                              onValueChange={(priority) => updateSetting(setting.id, { priority: priority as any })}
                            >
                              <SelectTrigger className="w-full">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="critical">Critical</SelectItem>
                                <SelectItem value="high">High</SelectItem>
                                <SelectItem value="medium">Medium</SelectItem>
                                <SelectItem value="low">Low</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                )}
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Channels Tab */}
        <TabsContent value="channels" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Mail className="h-5 w-5" />
                  <span>Email Settings</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="your@email.com"
                    defaultValue="farmer@example.com"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="email-digest">Daily Email Digest</Label>
                  <Switch
                    id="email-digest"
                    checked={globalSettings.emailDigest}
                    onCheckedChange={(checked) => 
                      setGlobalSettings(prev => ({ ...prev, emailDigest: checked }))
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Digest Frequency</Label>
                  <Select
                    value={globalSettings.digestFrequency}
                    onValueChange={(value) => 
                      setGlobalSettings(prev => ({ ...prev, digestFrequency: value as any }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <MessageSquare className="h-5 w-5" />
                  <span>SMS Settings</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="+234 xxx xxx xxxx"
                    defaultValue="+234 801 234 5678"
                  />
                </div>
                <div className="p-3 bg-yellow-50 rounded-lg">
                  <p className="text-sm text-yellow-800">
                    SMS notifications may incur charges based on your mobile plan.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Global Settings Tab */}
        <TabsContent value="global" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Settings className="h-5 w-5" />
                  <span>General Settings</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Do Not Disturb</Label>
                    <p className="text-sm text-gray-500">Disable all notifications</p>
                  </div>
                  <Switch
                    checked={globalSettings.doNotDisturb}
                    onCheckedChange={(checked) => 
                      setGlobalSettings(prev => ({ ...prev, doNotDisturb: checked }))
                    }
                  />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    {globalSettings.soundEnabled ? (
                      <Volume2 className="h-4 w-4" />
                    ) : (
                      <VolumeX className="h-4 w-4" />
                    )}
                    <Label>Sound Notifications</Label>
                  </div>
                  <Switch
                    checked={globalSettings.soundEnabled}
                    onCheckedChange={(checked) => 
                      setGlobalSettings(prev => ({ ...prev, soundEnabled: checked }))
                    }
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Vibration</Label>
                    <p className="text-sm text-gray-500">Vibrate on mobile devices</p>
                  </div>
                  <Switch
                    checked={globalSettings.vibrationEnabled}
                    onCheckedChange={(checked) => 
                      setGlobalSettings(prev => ({ ...prev, vibrationEnabled: checked }))
                    }
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Clock className="h-5 w-5" />
                  <span>Quiet Hours</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label>Enable Quiet Hours</Label>
                  <Switch
                    checked={globalSettings.quietHours.enabled}
                    onCheckedChange={(checked) => 
                      setGlobalSettings(prev => ({
                        ...prev,
                        quietHours: { ...prev.quietHours, enabled: checked }
                      }))
                    }
                  />
                </div>
                {globalSettings.quietHours.enabled && (
                  <>
                    <div className="space-y-2">
                      <Label>Start Time</Label>
                      <Input
                        type="time"
                        value={globalSettings.quietHours.start}
                        onChange={(e) => 
                          setGlobalSettings(prev => ({
                            ...prev,
                            quietHours: { ...prev.quietHours, start: e.target.value }
                          }))
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>End Time</Label>
                      <Input
                        type="time"
                        value={globalSettings.quietHours.end}
                        onChange={(e) => 
                          setGlobalSettings(prev => ({
                            ...prev,
                            quietHours: { ...prev.quietHours, end: e.target.value }
                          }))
                        }
                      />
                    </div>
                    <div className="p-3 bg-blue-50 rounded-lg">
                      <p className="text-sm text-blue-800">
                        During quiet hours, only critical notifications will be delivered.
                      </p>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default NotificationPreferences;