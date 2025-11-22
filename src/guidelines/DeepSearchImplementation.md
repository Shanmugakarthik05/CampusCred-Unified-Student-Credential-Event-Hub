# Deep Search Event Scraping Implementation

## Overview
This document describes the deep search functionality that scrapes events from real platforms and provides direct registration links to students.

## Features

### 1. **Real-Time Event Scraping**
The system scrapes events from multiple platforms:
- **Devfolio** - Hackathons and tech events
- **Unstop** (formerly Dare2Compete) - Competitions, hackathons, and workshops
- **MLH** (Major League Hacking) - Official student hackathon league
- **HackerEarth** - Coding challenges and competitions
- **Manual Curated Events** - Verified events from trusted sources

### 2. **Direct Registration Links**
Each event now includes a `registrationUrl` field that points directly to the event registration page:
- **Devfolio Events**: `https://event-name.devfolio.co`
- **Unstop Events**: `https://unstop.com/event-slug`
- **MLH Events**: Direct fellowship/hackathon application links
- **Other Platforms**: Direct registration URLs

### 3. **One-Click Registration**
Students can click the **"Register Now"** button on any event card to:
- Open the event registration page in a new tab
- Automatically navigate to the sign-up form
- Start the registration process immediately

## Implementation Details

### Event Interface
```typescript
interface Event {
  id: string;
  title: string;
  organizer: string;
  description: string;
  category: string;
  startDate: string;
  endDate: string;
  registrationDeadline: string;
  location: string;
  city: string;
  state: string;
  mode: 'Online' | 'Offline' | 'Hybrid';
  eligibility: string;
  prizes: string;
  prizeAmount?: number;
  website: string;          // General event website
  registrationUrl: string;  // Direct registration link
  tags: string[];
  relevantDepartments: string[];
  imageUrl: string;
  source: string;
  isCollegeEvent: boolean;
  isFeatured: boolean;
  scrapedFrom?: 'devfolio' | 'unstop' | 'mlh' | 'hackerearth' | 'manual';
}
```

### Scraping Functions

#### Devfolio Scraper
```typescript
export async function scrapeDevfolio(): Promise<ScrapedEvent[]> {
  // Attempts to fetch from Devfolio API
  // Falls back to curated events if API is unavailable
  // Transforms API response to standard format
  // Extracts registration URLs from event data
}
```

**API Endpoint**: `https://api.devfolio.co/api/search/hackathons`

**Sample Registration URL Format**:
- `https://hackathon-name.devfolio.co`
- `https://hackathon-name.devfolio.co/apply`

#### Unstop Scraper
```typescript
export async function scrapeUnstop(): Promise<ScrapedEvent[]> {
  // Fetches from Unstop's public API
  // Filters for engineering & technology events
  // Extracts registration links from opportunity data
}
```

**API Endpoint**: `https://unstop.com/api/public/opportunity/search-result`

**Sample Registration URL Format**:
- `https://unstop.com/event-slug`
- `https://unstop.com/hackathon/event-slug`

#### MLH Scraper
```typescript
export async function scrapeMLH(): Promise<ScrapedEvent[]> {
  // Scrapes MLH hackathon listings
  // Extracts direct application links
  // Includes fellowship programs
}
```

**Sample Registration URL Format**:
- `https://fellowship.mlh.io/programs/open-source`
- `https://hackathon.mlh.io/`

#### HackerEarth Scraper
```typescript
export async function scrapeHackerEarth(): Promise<ScrapedEvent[]> {
  // Fetches coding challenges
  // Includes competition registration links
}
```

### Data Transformation

Each platform's event data is transformed to our standard format:

```typescript
function transformDevfolioEvent(devfolioEvent: any): ScrapedEvent {
  return {
    // ...standard fields
    registrationUrl: devfolioEvent.apply_url || 
                     devfolioEvent.registration_url || 
                     `https://${devfolioEvent.slug}.devfolio.co`
  };
}
```

## User Interface

### Event Card Layout
Each event card displays:
1. **Event Image** - With category and platform badges
2. **Event Details** - Title, organizer, description
3. **Dates & Location** - With deadline countdown
4. **Prize Information** - Formatted prize amounts
5. **Tags** - Technology/domain tags
6. **Action Buttons**:
   - **Register Now** - Opens registration page (primary action)
   - **Share** - WhatsApp, Twitter, LinkedIn
   - **Download** - Add to calendar
   - **Bookmark** - Save for later
7. **Apply for OD** - Quick OD application (if available)

### Button Behavior
```typescript
<Button 
  variant="outline" 
  size="sm"
  className="flex-1"
  onClick={() => window.open(event.registrationUrl, '_blank')}
>
  <ExternalLink className="h-4 w-4 mr-2" />
  Register Now
</Button>
```

## Backend Integration (Production)

### Supabase Edge Function Setup

For production deployment, create a Supabase Edge Function:

```typescript
// supabase/functions/scrape-events/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { DOMParser } from 'https://deno.land/x/deno_dom/deno-dom-wasm.ts';

serve(async (req) => {
  try {
    // Scrape Devfolio
    const devfolioEvents = await scrapeDevfolio();
    
    // Scrape Unstop
    const unstopEvents = await scrapeUnstop();
    
    // Scrape MLH
    const mlhEvents = await scrapeMLH();
    
    // Combine and deduplicate
    const allEvents = [...devfolioEvents, ...unstopEvents, ...mlhEvents];
    
    // Store in Supabase database
    const { data, error } = await supabaseClient
      .from('events')
      .upsert(allEvents);
    
    return new Response(JSON.stringify({ 
      success: true, 
      eventsCount: allEvents.length 
    }), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    return new Response(JSON.stringify({ 
      success: false, 
      error: error.message 
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
});
```

### Scheduled Scraping

Set up a cron job to run the scraper periodically:

```typescript
// Supabase Edge Function with cron trigger
// Runs every 6 hours to fetch latest events

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

serve(async (req) => {
  // Run scraper
  await scrapeAllEvents();
  
  // Notify users of new events
  await notifyUsersOfNewEvents();
  
  return new Response('OK');
});
```

### Database Schema

```sql
CREATE TABLE events (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  organizer TEXT NOT NULL,
  description TEXT,
  category TEXT,
  start_date TIMESTAMP,
  end_date TIMESTAMP,
  registration_deadline TIMESTAMP,
  location TEXT,
  city TEXT,
  state TEXT,
  mode TEXT CHECK (mode IN ('Online', 'Offline', 'Hybrid')),
  eligibility TEXT,
  prizes TEXT,
  prize_amount NUMERIC,
  website TEXT,
  registration_url TEXT NOT NULL, -- Direct registration link
  tags TEXT[],
  relevant_departments TEXT[],
  image_url TEXT,
  source TEXT,
  is_college_event BOOLEAN,
  is_featured BOOLEAN,
  scraped_from TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Index for faster queries
CREATE INDEX idx_events_deadline ON events(registration_deadline);
CREATE INDEX idx_events_category ON events(category);
CREATE INDEX idx_events_scraped_from ON events(scraped_from);
```

## Smart Features

### 1. **Automatic Department Matching**
Events are automatically matched to relevant departments based on:
- Event tags (AI/ML, Web Development, etc.)
- Description keywords
- Eligibility criteria

### 2. **Deadline Tracking**
- Shows "Deadline Soon!" badge for events closing within 7 days
- Displays countdown ("3 days left", "Tomorrow", "Today")
- Filters out expired events

### 3. **Prize Filtering**
- Filter events by prize amount range
- Display formatted prize values (₹2.5L, ₹40Cr)
- Sort by prize money

### 4. **Location-Based Filtering**
- Filter by state
- Filter by city
- Show distance for offline events (future enhancement)

### 5. **Save & Bookmark**
- Save events to local storage
- Quick access to saved events
- Sync across devices (with backend)

### 6. **Calendar Integration**
- Download `.ics` files
- Import to Google Calendar, Outlook, Apple Calendar
- Auto-populate event details

### 7. **Social Sharing**
- Share on WhatsApp, Twitter, LinkedIn
- Pre-filled share text with event details
- Track referrals (future enhancement)

## Error Handling

### Fallback Strategy
If platform APIs are unavailable:
1. Use cached events from previous scrape
2. Fall back to manually curated events
3. Display notification to users
4. Retry after specified interval

```typescript
try {
  const events = await scrapeDevfolio();
  if (!events || events.length === 0) {
    return getDevfolioFallbackEvents();
  }
  return events;
} catch (error) {
  console.error('Devfolio scraping failed:', error);
  return getDevfolioFallbackEvents();
}
```

### CORS Handling
For client-side scraping, use:
1. Proxy server (Supabase Edge Functions)
2. CORS-anywhere service
3. Backend API endpoint

## Performance Optimization

### 1. **Caching Strategy**
- Cache scraped events for 6 hours
- Use localStorage for client-side caching
- Redis/Supabase cache for server-side

### 2. **Lazy Loading**
- Load events in batches
- Infinite scroll for large event lists
- Image lazy loading

### 3. **Debounced Search**
- Debounce search input (300ms)
- Client-side filtering for instant results
- Server-side search for comprehensive results

## Analytics & Tracking

Track user interactions:
- Event views
- Registration clicks
- Saves/bookmarks
- Share actions
- Apply for OD conversions

```typescript
const trackEventClick = (eventId: string, action: string) => {
  // Send to analytics
  analytics.track('event_interaction', {
    event_id: eventId,
    action: action, // 'view', 'register', 'share', 'save'
    timestamp: new Date().toISOString()
  });
};
```

## Future Enhancements

### 1. **AI-Powered Recommendations**
- Machine learning to suggest events based on:
  - User's department
  - Past event participation
  - Skills and interests
  - Success rate (wins, completion)

### 2. **Event Reminders**
- Email/SMS notifications for:
  - Registration deadline approaching
  - Event starting soon
  - New events matching preferences

### 3. **Team Formation**
- Help students find teammates
- Department-wise team matching
- Skill-based team suggestions

### 4. **Event History**
- Track participated events
- Showcase achievements
- Generate participation reports

### 5. **Integration with Other Platforms**
- GitHub for hackathon submissions
- LinkedIn for networking
- Discord/Slack for team communication

## Testing

### Unit Tests
```typescript
describe('Event Scraper', () => {
  it('should scrape Devfolio events', async () => {
    const events = await scrapeDevfolio();
    expect(events).toBeDefined();
    expect(events.length).toBeGreaterThan(0);
    expect(events[0].registrationUrl).toBeDefined();
  });
  
  it('should transform event data correctly', () => {
    const devfolioEvent = { /* mock data */ };
    const transformed = transformDevfolioEvent(devfolioEvent);
    expect(transformed.registrationUrl).toContain('devfolio.co');
  });
});
```

### Integration Tests
```typescript
describe('Event Registration Flow', () => {
  it('should open registration page when clicked', () => {
    const { getByText } = render(<EventCard event={mockEvent} />);
    const registerButton = getByText('Register Now');
    
    fireEvent.click(registerButton);
    
    expect(window.open).toHaveBeenCalledWith(
      mockEvent.registrationUrl,
      '_blank'
    );
  });
});
```

## Security Considerations

1. **Rate Limiting**: Prevent excessive API calls
2. **Data Validation**: Validate scraped data before storage
3. **XSS Protection**: Sanitize event descriptions and titles
4. **CSRF Protection**: Secure API endpoints
5. **Privacy**: Don't store user registration data

## Monitoring

Monitor scraper health:
- Scraping success rate
- API response times
- Event count trends
- Error rates per platform
- User engagement metrics

## Conclusion

The deep search implementation provides students with:
✅ Real-time event discovery
✅ Direct registration access
✅ Comprehensive filtering
✅ Save and share functionality
✅ Calendar integration
✅ Mobile-responsive design
✅ Department-specific recommendations

This creates a seamless experience from event discovery to registration, increasing student participation in hackathons and technical events.
