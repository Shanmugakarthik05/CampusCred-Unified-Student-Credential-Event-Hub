# Event Scraping System - Complete Guide

## Overview

The Event Scraping System is a comprehensive solution for discovering and managing events from multiple platforms including Unstop, Devpost, Hack2Skill, Knowafest, Reskilll, Commudle, and more. The system uses server-side scraping with Puppeteer, Cheerio, and Axios to extract event details and presents them in a user-friendly interface with advanced filtering.

## Architecture

### 1. Server-Side Scraping (Supabase Edge Functions)

**Location**: `/supabase/functions/scrape-all-events/index.ts`

The scraping logic runs on Supabase Edge Functions to:
- Avoid CORS issues
- Handle heavy scraping operations
- Protect against rate limiting
- Use Puppeteer for JavaScript-heavy sites
- Use Cheerio for HTML parsing
- Use Axios for API calls

**Supported Platforms**:
1. **Unstop** - API-based scraping
2. **Devpost** - API + HTML parsing
3. **Hack2Skill** - API-based scraping
4. **Knowafest** - HTML scraping
5. **Reskilll** - API-based scraping
6. **Commudle** - API-based scraping
7. **StudentCompetitions.com** - HTML scraping (to be implemented)
8. **OpenHackathons.org** - HTML scraping (to be implemented)
9. **Hackathons.io** - HTML scraping (to be implemented)
10. **PlacementPreparation.io** - API/HTML (to be implemented)
11. **WhereUElevate** - API/HTML (to be implemented)
12. **Airmeet** - HTML scraping (to be implemented)
13. **Chennai Symposium** - HTML scraping (to be implemented)

### 2. Client-Side Components

**Location**: `/components/EventDiscovery.tsx`

A modern React component that displays scraped events with:
- Domain-based filtering (AI, ML, Data Science, Web Dev, etc.)
- Category filtering (Hackathon, Workshop, Competition, etc.)
- Search functionality
- Deadline urgency indicators
- Direct registration links
- Share buttons (Twitter, LinkedIn, WhatsApp)
- Download event details

**Location**: `/utils/enhancedEventScraper.ts`

Utility functions for:
- Fetching scraped events
- Filtering by domain, category, mode
- Calculating deadline urgency
- Downloading event details
- Sharing on social media

## Key Features

### 1. Domain-Based Filtering

Students can filter events by their area of interest:

```typescript
const EVENT_DOMAINS = [
  'All Domains',
  'Artificial Intelligence',
  'Machine Learning',
  'Data Science',
  'Web Development',
  'Mobile Development',
  'Blockchain & Web3',
  'Cloud Computing',
  'DevOps',
  'Cybersecurity',
  'IoT & Embedded Systems',
  'Robotics',
  'Game Development',
  'UI/UX Design',
  'Competitive Programming',
  'Open Source',
];
```

### 2. Deadline Urgency System

Events are automatically classified by deadline proximity:
- **Urgent** (≤3 days): Red badge with alert icon
- **Soon** (4-7 days): Orange badge with clock icon
- **Normal** (>7 days): Standard badge

Events are sorted to show urgent deadlines first.

### 3. Direct Registration

The "Register Now" button redirects directly to the event's registration page on the source platform, ensuring students can quickly sign up.

### 4. Event Details

Each event includes:
- **Title** and **Organizer**
- **Description**
- **Category** (Hackathon, Workshop, Competition, etc.)
- **Dates** (Start, End, Registration Deadline)
- **Location** and **Mode** (Online/Offline/Hybrid)
- **Eligibility** criteria
- **Prizes** and prize amounts
- **Tags** and **Domains**
- **Participant count** (if available)
- **Verification status**

### 5. Social Sharing

Share events on:
- Twitter
- LinkedIn
- WhatsApp

### 6. Download Event Details

Download event information as a text file for offline reference.

## Data Flow

```
1. Student selects domain/filters in EventDiscovery component
   ↓
2. Component calls fetchScrapedEvents() from enhancedEventScraper.ts
   ↓
3. Request sent to Supabase Edge Function at /api/scrape-events
   ↓
4. Edge Function scrapes multiple platforms in parallel
   ↓
5. Data transformed to standard ScrapedEvent format
   ↓
6. Events deduplicated and sorted by deadline urgency
   ↓
7. Data returned to client
   ↓
8. Client applies local filters and displays events
```

## Event Data Structure

```typescript
interface ScrapedEvent {
  id: string;
  title: string;
  organizer: string;
  description: string;
  category: 'Hackathon' | 'Workshop' | 'Competition' | 'Project Expo' | 'Symposium' | 'Conference';
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
  website: string;
  registrationUrl: string; // Direct link to registration
  tags: string[];
  domains: string[]; // AI, ML, Web Dev, etc.
  relevantDepartments: string[];
  imageUrl: string;
  source: string;
  scrapedFrom: string; // Platform name
  deadlineUrgency: 'urgent' | 'soon' | 'normal';
  isVerified: boolean;
  participantCount?: number;
}
```

## Usage in Application

### 1. Add to Student Dashboard

```tsx
import { EventDiscovery } from './components/EventDiscovery';

// In StudentDashboard component
<EventDiscovery 
  userDepartment={student.department}
  onApplyForOD={(event) => handleODApplication(event)}
/>
```

### 2. Add to Mentor Dashboard

```tsx
// Show events relevant to mentee's department
<EventDiscovery userDepartment={mentee.department} />
```

### 3. Standalone Event Discovery Page

```tsx
// In App.tsx or separate route
<EventDiscovery />
```

## Scraping Strategy

### API-Based Platforms (Preferred)

Platforms with public APIs are scraped using simple fetch requests:
- Unstop
- Devpost
- Hack2Skill (if available)
- Commudle

### HTML Parsing Platforms

Platforms without APIs use Cheerio for HTML parsing:
- Knowafest
- StudentCompetitions.com
- OpenHackathons.org
- Chennai Symposium

### JavaScript-Heavy Platforms

Platforms requiring JavaScript execution use Puppeteer:
- Hackathons.io
- Airmeet
- WhereUElevate

## Deployment

### Deploy Supabase Edge Function

```bash
# Navigate to project root
cd /path/to/project

# Deploy the scraping function
supabase functions deploy scrape-all-events

# Set environment variables if needed
supabase secrets set SCRAPER_USER_AGENT="EventScraperBot/1.0"
```

### Configure CORS

The Edge Function includes CORS headers to allow requests from your application domain.

## Caching Strategy

To avoid rate limiting and improve performance:

1. **Cache scraped data** in Supabase database
2. **Refresh interval**: Every 6 hours
3. **Manual refresh**: Available via UI button
4. **Stale-while-revalidate**: Show cached data while fetching new data

## Error Handling

The system includes comprehensive error handling:

1. **Network errors**: Fallback to cached data
2. **Parse errors**: Skip invalid events, continue processing
3. **Rate limiting**: Exponential backoff and retry
4. **Missing data**: Use default values, mark as unverified

## Future Enhancements

### 1. Machine Learning Recommendations

Use ML to recommend events based on:
- Student's past event participation
- Department and interests
- Success patterns of similar students

### 2. Event Notifications

Notify students when:
- New relevant events are discovered
- Deadlines are approaching
- Events match saved preferences

### 3. Event Analytics

Track and display:
- Most popular events
- Success rates (events that led to wins)
- Department-wise participation trends

### 4. Automatic OD Integration

Allow students to:
- Apply for OD directly from event card
- Auto-fill event details in OD form
- Track OD status for each event

### 5. Calendar Integration

- Export events to Google Calendar
- iCal feed for all events
- Deadline reminders

## Monitoring

Monitor scraping health:
- Success rate per platform
- Average response time
- Error rates
- Data freshness

## Compliance

Ensure scraping complies with:
- Robots.txt files
- Terms of Service
- Rate limits
- Data privacy regulations

## Testing

### Unit Tests

Test individual scraping functions:
```typescript
describe('scrapeUnstop', () => {
  it('should transform Unstop events correctly', async () => {
    const events = await scrapeUnstop();
    expect(events).toBeDefined();
    expect(events[0]).toHaveProperty('registrationUrl');
  });
});
```

### Integration Tests

Test end-to-end flow:
```typescript
describe('EventDiscovery', () => {
  it('should filter events by domain', async () => {
    render(<EventDiscovery />);
    // Select domain filter
    // Verify filtered results
  });
});
```

## Support

For issues or questions:
- Check documentation in `/guidelines/EventScrapingGuide.md`
- Review implementation in `/guidelines/DeepSearchImplementation.md`
- Contact development team

## License

This scraping system respects the intellectual property of source platforms and is designed for educational use within the college OD management system.
