import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Switch } from './ui/switch';
import { 
  Bell, 
  BellOff, 
  Bookmark,
  Calendar,
  Filter,
  RefreshCw,
  Settings,
  TrendingUp,
  Zap,
  ChevronRight,
  CheckCircle2
} from 'lucide-react';
import { toast } from 'sonner@2.0.3';

interface EventQuickSettingsProps {
  onOpenNotifications?: () => void;
  onOpenFilters?: () => void;
  onRefreshEvents?: () => void;
}

export function EventQuickSettings({ 
  onOpenNotifications, 
  onOpenFilters,
  onRefreshEvents 
}: EventQuickSettingsProps) {
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [savedEventsCount, setSavedEventsCount] = useState(0);
  const [lastSync, setLastSync] = useState<string>('');
  const [stats, setStats] = useState({
    totalEvents: 24,
    newToday: 3,
    deadlineSoon: 5,
  });

  useEffect(() => {
    // Load notification preference
    const notifEnabled = localStorage.getItem('eventNotifications');
    if (notifEnabled !== null) {
      setNotificationsEnabled(JSON.parse(notifEnabled));
    }

    // Load saved events count
    const saved = localStorage.getItem('savedEvents');
    if (saved) {
      setSavedEventsCount(JSON.parse(saved).length);
    }

    // Load last sync time
    const sync = localStorage.getItem('lastEventSync');
    if (sync) {
      setLastSync(sync);
    } else {
      setLastSync(new Date().toISOString());
    }
  }, []);

  const toggleNotifications = () => {
    const newValue = !notificationsEnabled;
    setNotificationsEnabled(newValue);
    localStorage.setItem('eventNotifications', JSON.stringify(newValue));
    toast.success(newValue ? 'Notifications enabled' : 'Notifications disabled');
  };

  const handleRefresh = () => {
    const newSync = new Date().toISOString();
    setLastSync(newSync);
    localStorage.setItem('lastEventSync', newSync);
    onRefreshEvents?.();
    toast.success('Events refreshed!');
  };

  const getTimeSinceSync = () => {
    if (!lastSync) return 'Never';
    const now = new Date();
    const syncDate = new Date(lastSync);
    const diffMs = now.getTime() - syncDate.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d ago`;
  };

  return (
    <div className="space-y-4">
      {/* Quick Stats Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base">Event Discovery</CardTitle>
              <CardDescription className="text-xs">
                Live updates from Devfolio, Unstop, and more
              </CardDescription>
            </div>
            <TrendingUp className="h-5 w-5 text-primary" />
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Stats Grid */}
          <div className="grid grid-cols-3 gap-3">
            <div className="text-center">
              <div className="text-2xl">{stats.totalEvents}</div>
              <div className="text-xs text-muted-foreground">Total Events</div>
            </div>
            <div className="text-center">
              <div className="text-2xl text-green-600">{stats.newToday}</div>
              <div className="text-xs text-muted-foreground">New Today</div>
            </div>
            <div className="text-center">
              <div className="text-2xl text-orange-600">{stats.deadlineSoon}</div>
              <div className="text-xs text-muted-foreground">Closing Soon</div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="space-y-2">
            {/* Notifications Toggle */}
            <div className="flex items-center justify-between p-3 rounded-lg border">
              <div className="flex items-center gap-2">
                {notificationsEnabled ? (
                  <Bell className="h-4 w-4 text-primary" />
                ) : (
                  <BellOff className="h-4 w-4 text-muted-foreground" />
                )}
                <div>
                  <div className="text-sm">Notifications</div>
                  <div className="text-xs text-muted-foreground">
                    {notificationsEnabled ? 'Enabled' : 'Disabled'}
                  </div>
                </div>
              </div>
              <Switch
                checked={notificationsEnabled}
                onCheckedChange={toggleNotifications}
              />
            </div>

            {/* Saved Events */}
            <div 
              className="flex items-center justify-between p-3 rounded-lg border cursor-pointer hover:bg-muted/50 transition-colors"
              onClick={() => toast.info('View saved events in the Events tab')}
            >
              <div className="flex items-center gap-2">
                <Bookmark className="h-4 w-4 text-muted-foreground" />
                <div>
                  <div className="text-sm">Saved Events</div>
                  <div className="text-xs text-muted-foreground">
                    {savedEventsCount} bookmarked
                  </div>
                </div>
              </div>
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </div>

            {/* Last Sync */}
            <div className="flex items-center justify-between p-3 rounded-lg border">
              <div className="flex items-center gap-2">
                <Zap className="h-4 w-4 text-muted-foreground" />
                <div>
                  <div className="text-sm">Last Synced</div>
                  <div className="text-xs text-muted-foreground">
                    {getTimeSinceSync()}
                  </div>
                </div>
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={handleRefresh}
              >
                <RefreshCw className="h-3 w-3" />
              </Button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={onOpenFilters}
              className="w-full"
            >
              <Filter className="h-4 w-4 mr-2" />
              Filters
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={onOpenNotifications}
              className="w-full"
            >
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </Button>
          </div>

          {/* Features Badge */}
          <div className="pt-2 border-t">
            <div className="text-xs text-muted-foreground mb-2">Features Available:</div>
            <div className="flex flex-wrap gap-1">
              <Badge variant="secondary" className="text-xs">
                <CheckCircle2 className="h-3 w-3 mr-1" />
                Live Scraping
              </Badge>
              <Badge variant="secondary" className="text-xs">
                <CheckCircle2 className="h-3 w-3 mr-1" />
                Save Events
              </Badge>
              <Badge variant="secondary" className="text-xs">
                <CheckCircle2 className="h-3 w-3 mr-1" />
                Calendar
              </Badge>
              <Badge variant="secondary" className="text-xs">
                <CheckCircle2 className="h-3 w-3 mr-1" />
                Share
              </Badge>
              <Badge variant="secondary" className="text-xs">
                <CheckCircle2 className="h-3 w-3 mr-1" />
                Smart Filter
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Pro Tips Card */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
        <CardContent className="p-4">
          <div className="flex gap-3 text-sm">
            <TrendingUp className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
            <div className="text-blue-900">
              <p className="mb-2">
                <strong>Pro Tip:</strong> Enable notifications to get alerts when new hackathons matching your department are added!
              </p>
              <div className="flex flex-wrap gap-2 text-xs">
                <Badge variant="outline" className="bg-white/50 border-blue-300 text-blue-700">
                  Real-time updates
                </Badge>
                <Badge variant="outline" className="bg-white/50 border-blue-300 text-blue-700">
                  Deadline alerts
                </Badge>
                <Badge variant="outline" className="bg-white/50 border-blue-300 text-blue-700">
                  Prize filters
                </Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Sources Info */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Event Sources</CardTitle>
          <CardDescription className="text-xs">
            We scrape events from verified platforms
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Devfolio</span>
              <Badge variant="outline" className="text-xs">devfolio.co</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Unstop</span>
              <Badge variant="outline" className="text-xs">unstop.com</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">MLH</span>
              <Badge variant="outline" className="text-xs">mlh.io</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">HackerEarth</span>
              <Badge variant="outline" className="text-xs">hackerearth.com</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">+ More</span>
              <Badge variant="outline" className="text-xs">Growing list</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
