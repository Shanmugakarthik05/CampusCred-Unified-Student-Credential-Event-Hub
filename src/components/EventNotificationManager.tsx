import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Switch } from './ui/switch';
import { Label } from './ui/label';
import { Separator } from './ui/separator';
import { 
  Bell, 
  BellOff, 
  Clock, 
  TrendingUp, 
  Calendar,
  Mail,
  Smartphone,
  Settings,
  CheckCircle2
} from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';

interface NotificationPreferences {
  enabled: boolean;
  newEvents: boolean;
  deadlineReminders: boolean;
  departmentMatches: boolean;
  emailNotifications: boolean;
  pushNotifications: boolean;
  reminderDays: number;
  categories: string[];
  minPrizeAmount: number;
}

interface EventNotificationManagerProps {
  userDepartment?: string;
}

export function EventNotificationManager({ userDepartment }: EventNotificationManagerProps) {
  const [preferences, setPreferences] = useState<NotificationPreferences>({
    enabled: true,
    newEvents: true,
    deadlineReminders: true,
    departmentMatches: true,
    emailNotifications: false,
    pushNotifications: false,
    reminderDays: 3,
    categories: ['all'],
    minPrizeAmount: 0,
  });

  const [notificationHistory, setNotificationHistory] = useState<any[]>([]);

  // Load preferences from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('eventNotificationPreferences');
    if (saved) {
      setPreferences(JSON.parse(saved));
    }

    const history = localStorage.getItem('notificationHistory');
    if (history) {
      setNotificationHistory(JSON.parse(history));
    }
  }, []);

  // Save preferences to localStorage
  const updatePreferences = (updates: Partial<NotificationPreferences>) => {
    const newPreferences = { ...preferences, ...updates };
    setPreferences(newPreferences);
    localStorage.setItem('eventNotificationPreferences', JSON.stringify(newPreferences));
    toast.success('Notification preferences updated');
  };

  const toggleMasterNotifications = () => {
    const newValue = !preferences.enabled;
    updatePreferences({ enabled: newValue });
    
    if (newValue) {
      toast.success('Notifications enabled', {
        description: 'You will receive updates about new events and deadlines',
      });
    } else {
      toast.info('Notifications disabled', {
        description: 'You won\'t receive any event notifications',
      });
    }
  };

  const requestPushPermission = async () => {
    if (!('Notification' in window)) {
      toast.error('Push notifications not supported in this browser');
      return;
    }

    const permission = await Notification.requestPermission();
    
    if (permission === 'granted') {
      updatePreferences({ pushNotifications: true });
      toast.success('Push notifications enabled!');
      
      // Show test notification
      new Notification('Event Notifications Enabled', {
        body: 'You\'ll now receive notifications about new events',
        icon: '/icon.png',
      });
    } else {
      toast.error('Push notification permission denied');
    }
  };

  const testNotification = () => {
    toast.success('Test Notification', {
      description: 'This is how event notifications will appear',
      duration: 5000,
    });

    // Add to history
    const newHistory = [
      {
        id: Date.now(),
        type: 'test',
        title: 'Test Notification',
        message: 'This is how event notifications will appear',
        timestamp: new Date().toISOString(),
      },
      ...notificationHistory,
    ].slice(0, 10);

    setNotificationHistory(newHistory);
    localStorage.setItem('notificationHistory', JSON.stringify(newHistory));
  };

  const clearHistory = () => {
    setNotificationHistory([]);
    localStorage.removeItem('notificationHistory');
    toast.success('Notification history cleared');
  };

  const categories = ['all', 'Hackathon', 'Workshop', 'Competition', 'Conference', 'Symposium', 'Project Expo'];

  return (
    <div className="space-y-6">
      {/* Main Control Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                {preferences.enabled ? (
                  <Bell className="h-5 w-5 text-primary" />
                ) : (
                  <BellOff className="h-5 w-5 text-muted-foreground" />
                )}
                Event Notifications
              </CardTitle>
              <CardDescription>
                Get notified about new events, deadlines, and opportunities
              </CardDescription>
            </div>
            <Switch
              checked={preferences.enabled}
              onCheckedChange={toggleMasterNotifications}
            />
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Notification Types */}
          <div className="space-y-4">
            <h3 className="text-sm">Notification Types</h3>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
                <div>
                  <Label htmlFor="new-events">New Events</Label>
                  <p className="text-xs text-muted-foreground">
                    Get notified when new events are added
                  </p>
                </div>
              </div>
              <Switch
                id="new-events"
                checked={preferences.newEvents}
                onCheckedChange={(checked) => updatePreferences({ newEvents: checked })}
                disabled={!preferences.enabled}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <div>
                  <Label htmlFor="deadline-reminders">Deadline Reminders</Label>
                  <p className="text-xs text-muted-foreground">
                    Reminders before registration deadlines
                  </p>
                </div>
              </div>
              <Switch
                id="deadline-reminders"
                checked={preferences.deadlineReminders}
                onCheckedChange={(checked) => updatePreferences({ deadlineReminders: checked })}
                disabled={!preferences.enabled}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
                <div>
                  <Label htmlFor="department-matches">Department Matches</Label>
                  <p className="text-xs text-muted-foreground">
                    Events relevant to {userDepartment || 'your department'}
                  </p>
                </div>
              </div>
              <Switch
                id="department-matches"
                checked={preferences.departmentMatches}
                onCheckedChange={(checked) => updatePreferences({ departmentMatches: checked })}
                disabled={!preferences.enabled}
              />
            </div>
          </div>

          <Separator />

          {/* Notification Channels */}
          <div className="space-y-4">
            <h3 className="text-sm">Notification Channels</h3>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <div>
                  <Label htmlFor="email-notifications">Email Notifications</Label>
                  <p className="text-xs text-muted-foreground">
                    Daily digest of new events (Coming soon)
                  </p>
                </div>
              </div>
              <Switch
                id="email-notifications"
                checked={preferences.emailNotifications}
                onCheckedChange={(checked) => updatePreferences({ emailNotifications: checked })}
                disabled={!preferences.enabled}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Smartphone className="h-4 w-4 text-muted-foreground" />
                <div>
                  <Label htmlFor="push-notifications">Push Notifications</Label>
                  <p className="text-xs text-muted-foreground">
                    Browser push notifications
                  </p>
                </div>
              </div>
              {preferences.pushNotifications ? (
                <Badge variant="outline" className="text-green-600 border-green-600">
                  <CheckCircle2 className="h-3 w-3 mr-1" />
                  Enabled
                </Badge>
              ) : (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={requestPushPermission}
                  disabled={!preferences.enabled}
                >
                  Enable
                </Button>
              )}
            </div>
          </div>

          <Separator />

          {/* Advanced Settings */}
          <div className="space-y-4">
            <h3 className="text-sm">Advanced Settings</h3>
            
            <div className="space-y-2">
              <Label htmlFor="reminder-days">Deadline Reminder</Label>
              <Select
                value={preferences.reminderDays.toString()}
                onValueChange={(value) => updatePreferences({ reminderDays: parseInt(value) })}
                disabled={!preferences.enabled}
              >
                <SelectTrigger id="reminder-days">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1 day before</SelectItem>
                  <SelectItem value="2">2 days before</SelectItem>
                  <SelectItem value="3">3 days before</SelectItem>
                  <SelectItem value="5">5 days before</SelectItem>
                  <SelectItem value="7">1 week before</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="min-prize">Minimum Prize Amount</Label>
              <Select
                value={preferences.minPrizeAmount.toString()}
                onValueChange={(value) => updatePreferences({ minPrizeAmount: parseInt(value) })}
                disabled={!preferences.enabled}
              >
                <SelectTrigger id="min-prize">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">Any amount</SelectItem>
                  <SelectItem value="50000">₹50,000+</SelectItem>
                  <SelectItem value="100000">₹1,00,000+</SelectItem>
                  <SelectItem value="200000">₹2,00,000+</SelectItem>
                  <SelectItem value="500000">₹5,00,000+</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Separator />

          {/* Test Notification */}
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={testNotification}
              disabled={!preferences.enabled}
              className="flex-1"
            >
              Test Notification
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                updatePreferences({
                  enabled: true,
                  newEvents: true,
                  deadlineReminders: true,
                  departmentMatches: true,
                  emailNotifications: false,
                  pushNotifications: false,
                  reminderDays: 3,
                  categories: ['all'],
                  minPrizeAmount: 0,
                });
              }}
            >
              <Settings className="h-4 w-4 mr-2" />
              Reset to Default
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Notification History */}
      {notificationHistory.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Recent Notifications</CardTitle>
                <CardDescription>
                  Your last {notificationHistory.length} notification{notificationHistory.length > 1 ? 's' : ''}
                </CardDescription>
              </div>
              <Button variant="ghost" size="sm" onClick={clearHistory}>
                Clear
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {notificationHistory.map((notification) => (
                <div key={notification.id} className="flex items-start gap-3 p-3 rounded-lg border">
                  <Calendar className="h-4 w-4 mt-1 text-muted-foreground" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm">{notification.title}</p>
                    <p className="text-xs text-muted-foreground line-clamp-1">
                      {notification.message}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {new Date(notification.timestamp).toLocaleString('en-IN')}
                    </p>
                  </div>
                  <Badge variant={notification.type === 'new' ? 'default' : 'secondary'} className="text-xs">
                    {notification.type}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Info Card */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="p-4">
          <div className="flex gap-3 text-sm text-blue-900">
            <Bell className="h-4 w-4 mt-0.5 flex-shrink-0" />
            <div>
              <p className="mb-1">
                <strong>Stay Updated:</strong> Enable notifications to never miss important event deadlines and new opportunities.
              </p>
              <p className="text-xs text-blue-700">
                We'll only notify you about events that match your preferences and department.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
