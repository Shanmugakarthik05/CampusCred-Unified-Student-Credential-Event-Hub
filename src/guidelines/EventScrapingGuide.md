# Event Scraping & Advanced Features Guide

## Overview

The Event Recommendations system now includes real-time web scraping from major platforms, along with powerful features like saved events, calendar integration, social sharing, and advanced filtering.

## Features

### 1. Real-Time Event Scraping

Events are automatically scraped from multiple platforms:

- **Devfolio** (devfolio.co) - India's largest hackathon platform
- **Unstop** (unstop.com) - Competitions, hackathons, and workshops
- **MLH** (mlh.io) - Major League Hacking events
- **HackerEarth** (hackerearth.com) - Coding challenges and hackathons

#### How It Works

The system uses a Supabase Edge Function (`/supabase/functions/scrape-events/index.ts`) that:

1. Makes API calls to each platform
2. Parses and normalizes event data
3. Removes duplicates
4. Categorizes events by department relevance
5. Returns unified event data

#### Deployment

To deploy the scraping function:

```bash
# Install Supabase CLI
npm install -g supabase

# Login to Supabase
supabase login

# Link your project
supabase link --project-ref your-project-ref

# Deploy the function
supabase functions deploy scrape-events

# Set up cron job to run every 6 hours
# In Supabase Dashboard > Edge Functions > scrape-events > Cron
# Schedule: 0 */6 * * *
```

#### API Usage

```typescript
// Scrape all sources
const response = await fetch('https://your-project.supabase.co/functions/v1/scrape-events');
const data = await response.json();

// Scrape specific source
const response = await fetch('https://your-project.supabase.co/functions/v1/scrape-events?source=devfolio');
```

### 2. Saved Events

Users can bookmark/save events for later:

- Click the bookmark icon on any event card
- Saved events are stored in localStorage
- Quick count shown in the UI
- Filter to show only saved events

**Technical Implementation:**
- Uses `localStorage` with key `savedEvents`
- Stores array of event IDs
- Persists across sessions
- Can be migrated to Supabase for cross-device sync

### 3. Calendar Integration

Export events to your calendar:

- Click the download icon on any event
- Downloads `.ics` (iCalendar) file
- Compatible with Google Calendar, Outlook, Apple Calendar, etc.
- Includes all event details and reminders

**Technical Details:**
- Generates RFC 5545 compliant iCalendar format
- Includes event title, description, location, dates
- Automatically sets timezone
- Creates downloadable blob

### 4. Social Sharing

Share events on social media:

- **WhatsApp** - Direct message sharing
- **Twitter** - Tweet with event details
- **LinkedIn** - Professional network sharing

**Share URLs:**
- WhatsApp: `https://wa.me/?text=...`
- Twitter: `https://twitter.com/intent/tweet?text=...`
- LinkedIn: `https://www.linkedin.com/sharing/share-offsite/?url=...`

### 5. Advanced Filtering

Powerful multi-criteria filtering:

#### Filter Options:

1. **Search Query**
   - Searches title, description, organizer, and tags
   - Real-time filtering
   - Case-insensitive

2. **Category Filter**
   - Hackathon
   - Workshop
   - Competition
   - Conference
   - Symposium
   - Project Expo

3. **Mode Filter**
   - Online
   - Offline
   - Hybrid

4. **Location Filters**
   - State (e.g., Maharashtra, Karnataka, Delhi)
   - City (e.g., Mumbai, Bangalore, Chennai)
   - Automatically extracted from event data

5. **Prize Money Filter**
   - Slider range: ₹0 - ₹50,00,000
   - Step: ₹50,000
   - Filters events by total prize amount
   - Shows formatted amounts (₹1.5L, ₹2Cr, etc.)

#### Using Filters:

```typescript
// Filter state structure
const [filters, setFilters] = useState<FilterState>({
  searchQuery: '',
  category: 'all',
  mode: 'all',
  state: 'all',
  city: 'all',
  minPrize: 0,
  maxPrize: 5000000,
});

// Filters are applied reactively
useEffect(() => {
  let filtered = [...events];
  
  // Apply search
  if (filters.searchQuery) {
    filtered = filtered.filter(e => 
      e.title.toLowerCase().includes(filters.searchQuery.toLowerCase())
    );
  }
  
  // Apply prize filter
  filtered = filtered.filter(e => {
    const prize = e.prizeAmount || 0;
    return prize >= filters.minPrize && prize <= filters.maxPrize;
  });
  
  setFilteredEvents(filtered);
}, [filters, events]);
```

### 6. Auto-Notifications

Get notified about new events:

#### Features:
- Toggle notifications on/off
- Stored in localStorage
- Shows notification count
- Department-specific recommendations
- Toast notifications for new events

#### Implementation:

```typescript
const [notificationsEnabled, setNotificationsEnabled] = useState(true);
const [newEventsCount, setNewEventsCount] = useState(0);

// When refreshing events
if (refresh && newEventCount > oldEventCount) {
  const newCount = newEventCount - oldEventCount;
  setNewEventsCount(newCount);
  
  if (notificationsEnabled) {
    toast.success(`${newCount} new event${newCount > 1 ? 's' : ''} added!`, {
      description: 'Check out the latest opportunities',
    });
  }
}
```

## Data Structure

### Event Interface

```typescript
interface Event {
  id: string;
  title: string;
  organizer: string;
  description: string;
  category: 'Hackathon' | 'Workshop' | 'Competition' | 'Conference' | 'Symposium' | 'Project Expo';
  startDate: string; // ISO 8601
  endDate: string;
  registrationDeadline: string;
  location: string;
  city: string;
  state: string;
  mode: 'Online' | 'Offline' | 'Hybrid';
  eligibility: string;
  prizes: string; // Description
  prizeAmount?: number; // Numeric amount for filtering
  website: string;
  tags: string[];
  relevantDepartments: string[];
  imageUrl: string;
  source: string;
  isCollegeEvent: boolean;
  isFeatured: boolean;
  scrapedFrom?: 'devfolio' | 'unstop' | 'mlh' | 'hackerearth' | 'manual';
}
```

## Performance Optimization

### Caching Strategy

1. **Browser Cache**
   - Events cached in memory
   - 6-hour TTL
   - Manual refresh available

2. **LocalStorage**
   - Saved events
   - Notification preferences
   - Filter preferences

3. **Server-Side Caching**
   - Supabase function caches for 1 hour
   - Reduces API calls to external platforms
   - Implements rate limiting

### Rate Limiting

To avoid being blocked by platforms:

- Devfolio: Max 100 requests/hour
- Unstop: Max 200 requests/hour
- Implement exponential backoff
- Use CDN for static assets

## User Experience Enhancements

### Visual Indicators

1. **Event Source Badges**
   - Shows where event was scraped from
   - Devfolio, Unstop, MLH, HackerEarth, Manual

2. **Deadline Warnings**
   - Red pulse animation for <7 days
   - "Today" and "Tomorrow" labels
   - Expired events grayed out

3. **Department Relevance**
   - "Recommended" badge for relevant events
   - Based on user's department
   - Smart tag matching

4. **Prize Indicators**
   - Green badge with prize amount
   - Formatted display (₹1.5L, ₹2Cr)
   - Visual hierarchy by amount

### Loading States

```typescript
// Global loading
if (loading) {
  return (
    <div className="flex items-center justify-center py-12">
      <RefreshCw className="h-6 w-6 animate-spin" />
      <span>Loading events from Devfolio, Unstop...</span>
    </div>
  );
}

// Refresh loading
<Button disabled={refreshing}>
  <RefreshCw className={refreshing ? 'animate-spin' : ''} />
  Refresh
</Button>
```

## Future Enhancements

### Planned Features

1. **Cross-Device Sync**
   - Move saved events to Supabase
   - Sync across devices
   - User authentication

2. **Email Notifications**
   - Daily digest of new events
   - Deadline reminders
   - Department-specific alerts

3. **ML Recommendations**
   - Collaborative filtering
   - User behavior analysis
   - Personalized event ranking

4. **Team Formation**
   - Find teammates for hackathons
   - Skills matching
   - Chat integration

5. **Event History**
   - Track attended events
   - Certificate storage
   - Impact metrics

6. **Mobile App**
   - React Native version
   - Push notifications
   - Offline support

## Troubleshooting

### Common Issues

1. **Events not loading**
   - Check Supabase function status
   - Verify API endpoints
   - Check browser console for errors

2. **Saved events not persisting**
   - Check localStorage quota
   - Verify browser privacy settings
   - Clear cache and retry

3. **Calendar download not working**
   - Check browser download permissions
   - Verify .ics format
   - Try different browser

4. **Social sharing not working**
   - Check popup blocker settings
   - Verify share URLs
   - Test in incognito mode

### Debug Mode

Enable debug logging:

```typescript
// Add to EventRecommendations.tsx
const DEBUG = true;

if (DEBUG) {
  console.log('Fetched events:', events);
  console.log('Filtered events:', filteredEvents);
  console.log('Active filters:', filters);
}
```

## API Documentation

### Scraping Function Endpoints

#### GET /scrape-events

Scrapes events from all sources.

**Parameters:**
- `source` (optional): `devfolio`, `unstop`, `mlh`, `hackerearth`, or `all`

**Response:**
```json
{
  "success": true,
  "count": 42,
  "events": [...],
  "lastUpdated": "2025-10-24T12:00:00Z",
  "sources": {
    "devfolio": 15,
    "unstop": 18,
    "mlh": 5,
    "hackerearth": 4
  }
}
```

## Security Considerations

1. **Rate Limiting**
   - Implement per-user limits
   - Prevent scraping abuse
   - Use API keys for authenticated users

2. **Data Privacy**
   - Don't store sensitive user data
   - GDPR compliance
   - Clear privacy policy

3. **XSS Prevention**
   - Sanitize event descriptions
   - Validate URLs
   - Use Content Security Policy

## Contributing

To add a new event source:

1. Create scraper function in `/utils/eventScraper.ts`
2. Add to Supabase edge function
3. Update event interface if needed
4. Add source badge in UI
5. Update documentation

## License

MIT License - See LICENSE file for details

## Support

For issues or questions:
- GitHub Issues: [your-repo/issues]
- Email: support@odsystem.edu
- Documentation: [your-docs-url]
