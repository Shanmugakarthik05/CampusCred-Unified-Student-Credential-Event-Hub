import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Switch } from './ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Badge } from './ui/badge';
import { Settings, Bell, AlertTriangle, Info, CheckCircle } from 'lucide-react';
import { toast } from 'sonner@2.0.3';

interface NotificationSettings {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'error' | 'success';
  enabled: boolean;
  targetRoles: string[];
  priority: 'low' | 'medium' | 'high';
  validFrom: string;
  validTo: string;
}

export function SystemNotificationManager() {
  const [notifications, setNotifications] = useState<NotificationSettings[]>([
    {
      id: '1',
      title: 'OD Submission Policy',
      message: 'All OD requests must be submitted at least 3 days in advance. Late submissions will not be accepted.',
      type: 'warning',
      enabled: true,
      targetRoles: ['student'],
      priority: 'high',
      validFrom: '2024-01-01',
      validTo: '2024-12-31'
    }
  ]);

  const [isCreating, setIsCreating] = useState(false);
  const [editingNotification, setEditingNotification] = useState<NotificationSettings | null>(null);
  const [newNotification, setNewNotification] = useState<Partial<NotificationSettings>>({
    title: '',
    message: '',
    type: 'info',
    enabled: true,
    targetRoles: [],
    priority: 'medium',
    validFrom: new Date().toISOString().split('T')[0],
    validTo: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  });

  const roleOptions = [
    { value: 'student', label: 'Students' },
    { value: 'mentor', label: 'Mentors' },
    { value: 'hod', label: 'HODs' },
    { value: 'principal', label: 'Principal' },
    { value: 'admin', label: 'Administrators' }
  ];

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-amber-600" />;
      case 'error':
        return <AlertTriangle className="h-4 w-4 text-red-600" />;
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      default:
        return <Info className="h-4 w-4 text-blue-600" />;
    }
  };

  const getPriorityBadge = (priority: string) => {
    const colors = {
      low: 'bg-gray-100 text-gray-800',
      medium: 'bg-blue-100 text-blue-800',
      high: 'bg-red-100 text-red-800'
    };
    return <Badge className={colors[priority as keyof typeof colors]}>{priority.toUpperCase()}</Badge>;
  };

  const toggleNotification = (id: string) => {
    setNotifications(prev => prev.map(notif => 
      notif.id === id ? { ...notif, enabled: !notif.enabled } : notif
    ));
    toast.success('Notification status updated');
  };

  const handleCreateNotification = () => {
    if (!newNotification.title || !newNotification.message) {
      toast.error('Please fill in title and message');
      return;
    }

    const notification: NotificationSettings = {
      id: Date.now().toString(),
      title: newNotification.title,
      message: newNotification.message,
      type: newNotification.type || 'info',
      enabled: newNotification.enabled || true,
      targetRoles: newNotification.targetRoles || [],
      priority: newNotification.priority || 'medium',
      validFrom: newNotification.validFrom || new Date().toISOString().split('T')[0],
      validTo: newNotification.validTo || new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    };

    setNotifications(prev => [...prev, notification]);
    setNewNotification({
      title: '',
      message: '',
      type: 'info',
      enabled: true,
      targetRoles: [],
      priority: 'medium',
      validFrom: new Date().toISOString().split('T')[0],
      validTo: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    });
    setIsCreating(false);
    toast.success('Notification created successfully');
  };

  const deleteNotification = (id: string) => {
    setNotifications(prev => prev.filter(notif => notif.id !== id));
    toast.success('Notification deleted');
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center space-x-2">
              <Bell className="h-5 w-5" />
              <span>System Notifications</span>
            </CardTitle>
            <CardDescription>
              Manage system-wide notifications for different user roles
            </CardDescription>
          </div>
          <Dialog open={isCreating} onOpenChange={setIsCreating}>
            <DialogTrigger asChild>
              <Button>
                <Settings className="h-4 w-4 mr-2" />
                Create Notification
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>Create New Notification</DialogTitle>
                <DialogDescription>
                  Configure a new system notification for users
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Notification Title</Label>
                  <Input
                    id="title"
                    value={newNotification.title}
                    onChange={(e) => setNewNotification(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Enter notification title"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="message">Message</Label>
                  <Textarea
                    id="message"
                    value={newNotification.message}
                    onChange={(e) => setNewNotification(prev => ({ ...prev, message: e.target.value }))}
                    placeholder="Enter notification message"
                    rows={4}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Type</Label>
                    <Select 
                      value={newNotification.type} 
                      onValueChange={(value) => setNewNotification(prev => ({ ...prev, type: value as any }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="info">Info</SelectItem>
                        <SelectItem value="warning">Warning</SelectItem>
                        <SelectItem value="error">Error</SelectItem>
                        <SelectItem value="success">Success</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Priority</Label>
                    <Select 
                      value={newNotification.priority} 
                      onValueChange={(value) => setNewNotification(prev => ({ ...prev, priority: value as any }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Target Roles</Label>
                  <div className="flex flex-wrap gap-2">
                    {roleOptions.map(role => (
                      <label key={role.value} className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={newNotification.targetRoles?.includes(role.value)}
                          onChange={(e) => {
                            const roles = newNotification.targetRoles || [];
                            if (e.target.checked) {
                              setNewNotification(prev => ({ 
                                ...prev, 
                                targetRoles: [...roles, role.value] 
                              }));
                            } else {
                              setNewNotification(prev => ({ 
                                ...prev, 
                                targetRoles: roles.filter(r => r !== role.value) 
                              }));
                            }
                          }}
                          className="rounded"
                        />
                        <span className="text-sm">{role.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="validFrom">Valid From</Label>
                    <Input
                      id="validFrom"
                      type="date"
                      value={newNotification.validFrom}
                      onChange={(e) => setNewNotification(prev => ({ ...prev, validFrom: e.target.value }))}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="validTo">Valid To</Label>
                    <Input
                      id="validTo"
                      type="date"
                      value={newNotification.validTo}
                      onChange={(e) => setNewNotification(prev => ({ ...prev, validTo: e.target.value }))}
                    />
                  </div>
                </div>

                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setIsCreating(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleCreateNotification}>
                    Create Notification
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {notifications.map((notification) => (
            <Card key={notification.id} className="border-l-4 border-l-blue-500">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    {getTypeIcon(notification.type)}
                    <div>
                      <CardTitle className="text-base">{notification.title}</CardTitle>
                      <div className="flex items-center space-x-2 mt-1">
                        {getPriorityBadge(notification.priority)}
                        <Badge variant="outline">
                          {notification.targetRoles.join(', ')}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={notification.enabled}
                      onCheckedChange={() => toggleNotification(notification.id)}
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => deleteNotification(notification.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-2">{notification.message}</p>
                <div className="text-xs text-muted-foreground">
                  Valid: {new Date(notification.validFrom).toLocaleDateString()} - {new Date(notification.validTo).toLocaleDateString()}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}