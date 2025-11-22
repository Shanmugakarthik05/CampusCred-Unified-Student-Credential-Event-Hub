# Integration Example - Event Features

This document shows how to integrate all the new event features into your Student Dashboard.

## Complete Integration

### 1. Import Components

```typescript
import { EventRecommendations } from './components/EventRecommendations';
import { EventNotificationManager } from './components/EventNotificationManager';
import { EventQuickSettings } from './components/EventQuickSettings';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './components/ui/tabs';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from './components/ui/sheet';
import { Button } from './components/ui/button';
import { Settings, Bell } from 'lucide-react';
```

### 2. Student Dashboard Integration

```typescript
export function StudentDashboard({ user, studentDetails }: StudentDashboardProps) {
  const [activeTab, setActiveTab] = useState('overview');
  const [notificationSheetOpen, setNotificationSheetOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<any>(null);

  // Handle OD application from event
  const handleApplyForOD = (event: any) => {
    // Pre-fill OD form with event details
    setSelectedEvent(event);
    setActiveTab('apply-od');
    
    toast.success('Event details loaded!', {
      description: 'Complete the OD form to apply',
    });
  };

  // Handle event refresh
  const handleRefreshEvents = () => {
    // This would trigger a re-fetch in EventRecommendations
    // Implementation depends on your state management
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="apply-od">Apply OD</TabsTrigger>
            <TabsTrigger value="events">
              Discover Events
              <Badge variant="secondary" className="ml-2">New</Badge>
            </TabsTrigger>
            <TabsTrigger value="my-ods">My ODs</TabsTrigger>
            <TabsTrigger value="certificates">Certificates</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-3">
              {/* Left Column - Main Stats */}
              <div className="md:col-span-2 space-y-6">
                {/* Your existing overview content */}
                <Card>
                  <CardHeader>
                    <CardTitle>Welcome, {studentDetails.name}!</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {/* Existing content */}
                  </CardContent>
                </Card>
              </div>

              {/* Right Column - Event Quick Settings */}
              <div>
                <EventQuickSettings
                  onOpenNotifications={() => setNotificationSheetOpen(true)}
                  onOpenFilters={() => setActiveTab('events')}
                  onRefreshEvents={handleRefreshEvents}
                />
              </div>
            </div>
          </TabsContent>

          {/* Events Tab */}
          <TabsContent value="events" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-4">
              {/* Main Events Area */}
              <div className="md:col-span-3">
                <EventRecommendations
                  userDepartment={studentDetails.department}
                  onApplyForOD={handleApplyForOD}
                />
              </div>

              {/* Sidebar - Quick Settings */}
              <div>
                <EventQuickSettings
                  onOpenNotifications={() => setNotificationSheetOpen(true)}
                  onRefreshEvents={handleRefreshEvents}
                />
              </div>
            </div>
          </TabsContent>

          {/* Other Tabs */}
          <TabsContent value="apply-od">
            <ODRequestForm
              studentDetails={studentDetails}
              prefilledEvent={selectedEvent}
              onSubmit={handleODSubmit}
            />
          </TabsContent>

          {/* ... other tabs ... */}
        </Tabs>

        {/* Notification Settings Sheet */}
        <Sheet open={notificationSheetOpen} onOpenChange={setNotificationSheetOpen}>
          <SheetContent className="overflow-y-auto">
            <SheetHeader>
              <SheetTitle>Notification Settings</SheetTitle>
            </SheetHeader>
            <div className="mt-6">
              <EventNotificationManager
                userDepartment={studentDetails.department}
              />
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </div>
  );
}
```

### 3. Pre-fill OD Form with Event Data

```typescript
// In ODRequestForm.tsx
interface ODRequestFormProps {
  studentDetails: StudentProfile;
  prefilledEvent?: Event;
  onSubmit: (data: ODRequest) => void;
}

export function ODRequestForm({ studentDetails, prefilledEvent, onSubmit }: ODRequestFormProps) {
  const [formData, setFormData] = useState({
    eventName: prefilledEvent?.title || '',
    eventDate: prefilledEvent?.startDate || '',
    eventLocation: prefilledEvent?.location || '',
    eventOrganizer: prefilledEvent?.organizer || '',
    eventWebsite: prefilledEvent?.website || '',
    reason: prefilledEvent 
      ? `Attending ${prefilledEvent.title} - ${prefilledEvent.description}`
      : '',
    // ... other fields
  });

  // Show prefilled indicator
  useEffect(() => {
    if (prefilledEvent) {
      toast.success('Event details loaded!', {
        description: 'Review and submit your OD application',
      });
    }
  }, [prefilledEvent]);

  return (
    <form onSubmit={handleSubmit}>
      {prefilledEvent && (
        <Alert className="mb-4">
          <CheckCircle2 className="h-4 w-4" />
          <AlertDescription>
            Event details from <strong>{prefilledEvent.title}</strong> have been pre-filled
          </AlertDescription>
        </Alert>
      )}
      
      {/* Rest of form */}
    </form>
  );
}
```

### 4. Add Notification Badge to Header

```typescript
function DashboardHeader({ user }: { user: User }) {
  const [newEventsCount, setNewEventsCount] = useState(0);

  useEffect(() => {
    // Load new events count
    const count = localStorage.getItem('newEventsCount');
    if (count) {
      setNewEventsCount(parseInt(count));
    }
  }, []);

  return (
    <header className="border-b">
      <div className="container flex items-center justify-between p-4">
        <h1>OD Management System</h1>
        
        <div className="flex items-center gap-4">
          {/* Events Notification Bell */}
          <Button
            variant="ghost"
            size="icon"
            className="relative"
            onClick={() => window.location.hash = '#events'}
          >
            <Bell className="h-5 w-5" />
            {newEventsCount > 0 && (
              <Badge 
                variant="destructive" 
                className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
              >
                {newEventsCount}
              </Badge>
            )}
          </Button>

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <User className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem>Profile</DropdownMenuItem>
              <DropdownMenuItem>Settings</DropdownMenuItem>
              <DropdownMenuItem>Logout</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
```

### 5. Setup Event Sync Service

```typescript
// utils/eventSync.ts
export class EventSyncService {
  private static instance: EventSyncService;
  private syncInterval: number = 6 * 60 * 60 * 1000; // 6 hours
  private intervalId: NodeJS.Timeout | null = null;

  static getInstance() {
    if (!EventSyncService.instance) {
      EventSyncService.instance = new EventSyncService();
    }
    return EventSyncService.instance;
  }

  start() {
    // Initial sync
    this.syncEvents();

    // Setup periodic sync
    this.intervalId = setInterval(() => {
      this.syncEvents();
    }, this.syncInterval);

    console.log('Event sync service started');
  }

  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    console.log('Event sync service stopped');
  }

  async syncEvents() {
    try {
      const response = await fetch(
        'https://YOUR_PROJECT.supabase.co/functions/v1/scrape-events'
      );
      
      if (!response.ok) {
        throw new Error('Sync failed');
      }

      const data = await response.json();
      
      // Store events
      localStorage.setItem('events', JSON.stringify(data.events));
      localStorage.setItem('lastEventSync', new Date().toISOString());
      
      // Check for new events
      const oldCount = parseInt(localStorage.getItem('eventCount') || '0');
      const newCount = data.events.length;
      
      if (newCount > oldCount) {
        const diff = newCount - oldCount;
        localStorage.setItem('newEventsCount', diff.toString());
        
        // Show notification if enabled
        const notifEnabled = localStorage.getItem('eventNotifications');
        if (notifEnabled === 'true') {
          this.showNotification(`${diff} new events added!`);
        }
      }
      
      localStorage.setItem('eventCount', newCount.toString());
      
      console.log(`Synced ${data.events.length} events`);
    } catch (error) {
      console.error('Event sync error:', error);
    }
  }

  private showNotification(message: string) {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('New Events Available', {
        body: message,
        icon: '/icon.png',
      });
    }
  }
}

// In App.tsx or main entry point
useEffect(() => {
  const syncService = EventSyncService.getInstance();
  syncService.start();

  return () => {
    syncService.stop();
  };
}, []);
```

### 6. Add to Main App.tsx

```typescript
import { EventSyncService } from './utils/eventSync';

function App() {
  useEffect(() => {
    // Start event sync service
    const syncService = EventSyncService.getInstance();
    syncService.start();

    // Request notification permission
    if ('Notification' in window) {
      Notification.requestPermission();
    }

    return () => {
      syncService.stop();
    };
  }, []);

  return (
    <div className="App">
      {/* Your app content */}
      <Toaster position="top-right" />
    </div>
  );
}
```

## Usage Examples

### Example 1: User Discovers Event

```
User opens "Discover Events" tab
  ↓
Sees list of events from Devfolio, Unstop
  ↓
Applies filters: Category=Hackathon, Min Prize=₹1L
  ↓
Finds interesting event
  ↓
Clicks bookmark icon (event saved)
  ↓
Clicks download icon (adds to Google Calendar)
  ↓
Clicks "Apply for OD"
  ↓
OD form opens with pre-filled data
  ↓
User completes and submits
```

### Example 2: Notification Flow

```
New hackathon added to Devfolio
  ↓
Sync service runs (every 6 hours)
  ↓
Event scraped and matched to user's department
  ↓
User has notifications enabled
  ↓
Toast notification appears: "1 new event added!"
  ↓
User clicks notification
  ↓
Events tab opens
  ↓
New event highlighted
```

### Example 3: Team Sharing

```
User finds great hackathon
  ↓
Clicks "Share" dropdown
  ↓
Selects "WhatsApp"
  ↓
Message pre-filled with event details
  ↓
Sends to team group
  ↓
Team members click link
  ↓
All see the same event
  ↓
Team applies together
```

## Best Practices

### 1. Performance
- Lazy load event images
- Paginate events (50 per page)
- Cache events in memory
- Debounce search queries

### 2. User Experience
- Show loading states
- Handle errors gracefully
- Provide clear feedback
- Make actions reversible

### 3. Data Management
- Clean up old events (>6 months)
- Limit saved events (max 50)
- Compress localStorage data
- Periodic cleanup

### 4. Accessibility
- Keyboard navigation
- Screen reader support
- High contrast mode
- Focus management

## Testing

### Manual Testing Checklist

- [ ] Events load correctly
- [ ] Filters work as expected
- [ ] Save/unsave events
- [ ] Calendar download works
- [ ] Social sharing opens correctly
- [ ] Notifications appear
- [ ] Settings persist
- [ ] Pre-fill OD form works
- [ ] Mobile responsive
- [ ] Cross-browser compatible

### Automated Testing

```typescript
// tests/EventRecommendations.test.tsx
describe('EventRecommendations', () => {
  it('loads events on mount', async () => {
    render(<EventRecommendations userDepartment="CSE" />);
    await waitFor(() => {
      expect(screen.getByText(/events/i)).toBeInTheDocument();
    });
  });

  it('filters events by search query', () => {
    const { getByPlaceholderText, getByText } = render(
      <EventRecommendations userDepartment="CSE" />
    );
    
    const searchInput = getByPlaceholderText(/search/i);
    fireEvent.change(searchInput, { target: { value: 'hackathon' } });
    
    expect(getByText(/hackathon/i)).toBeInTheDocument();
  });

  it('saves and unsaves events', () => {
    const { getByTestId } = render(
      <EventRecommendations userDepartment="CSE" />
    );
    
    const bookmarkBtn = getByTestId('bookmark-btn-1');
    fireEvent.click(bookmarkBtn);
    
    const savedEvents = JSON.parse(localStorage.getItem('savedEvents') || '[]');
    expect(savedEvents).toContain('1');
  });
});
```

## Troubleshooting Common Issues

### Issue: Events not loading
**Solution:**
```typescript
// Check Supabase function status
const testConnection = async () => {
  try {
    const response = await fetch('YOUR_SUPABASE_URL/functions/v1/scrape-events');
    console.log('Status:', response.status);
  } catch (error) {
    console.error('Connection failed:', error);
  }
};
```

### Issue: Filters not working
**Solution:**
```typescript
// Debug filter state
useEffect(() => {
  console.log('Current filters:', filters);
  console.log('Filtered events:', filteredEvents);
}, [filters, filteredEvents]);
```

### Issue: Notifications not showing
**Solution:**
```typescript
// Check permissions
const checkNotificationPermission = async () => {
  if (!('Notification' in window)) {
    alert('Browser does not support notifications');
    return;
  }
  
  const permission = await Notification.requestPermission();
  console.log('Permission:', permission);
};
```

## Support

For integration help:
- Check `/guidelines/EventScrapingGuide.md`
- Review `/EVENT_FEATURES_README.md`
- See `/FEATURE_SUMMARY.md`
- Contact: support@odsystem.edu

---

**Happy Integrating! 🚀**
