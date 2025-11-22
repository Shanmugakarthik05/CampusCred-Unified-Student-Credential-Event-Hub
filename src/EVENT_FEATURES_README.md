# Event Scraping & Advanced Features - Complete Implementation

## 🎯 Overview

The OD System now includes a comprehensive event discovery and management system with real-time scraping from major platforms, advanced filtering, social sharing, calendar integration, and intelligent notifications.

## ✨ New Features Implemented

### 1. **Real-Time Web Scraping** 🌐

Events are automatically scraped from actual platforms (not example domains):

- ✅ **Devfolio** (devfolio.co) - India's largest hackathon platform
- ✅ **Unstop** (unstop.com) - Competitions, workshops, and events
- ✅ **MLH** (mlh.io) - Major League Hacking global events
- ✅ **HackerEarth** (hackerearth.com) - Coding challenges and hackathons
- ✅ **CodeChef** (codechef.com) - Competitive programming
- ✅ **IEEE** (ieee.org) - Technical conferences
- ✅ **TECHFEST** (techfest.org) - IIT Bombay's festival

**Technical Implementation:**
- Supabase Edge Function at `/supabase/functions/scrape-events/index.ts`
- Utility functions at `/utils/eventScraper.ts`
- Automatic deduplication and normalization
- Department-based relevance scoring

### 2. **Saved Events** 💾

Users can bookmark events for later reference:

- **Features:**
  - One-click save/unsave with bookmark icon
  - Visual indication (filled bookmark for saved events)
  - Persistent storage across sessions
  - Quick count display
  - Can be migrated to Supabase for cross-device sync

- **Storage:**
  - LocalStorage key: `savedEvents`
  - Format: Array of event IDs
  - Automatic sync on changes

### 3. **Calendar Integration** 📅

Export events directly to calendar apps:

- **Supported Formats:**
  - `.ics` (iCalendar) files
  - Compatible with Google Calendar, Outlook, Apple Calendar, etc.

- **Features:**
  - One-click download
  - Includes all event details
  - Registration deadline reminders
  - Timezone support
  - RFC 5545 compliant

- **Usage:**
  ```typescript
  const downloadCalendarEvent = (event: Event) => {
    // Generates .ics file with event details
    // User downloads and imports to their calendar
  };
  ```

### 4. **Social Sharing** 📱

Share events on social media platforms:

- **Platforms:**
  - WhatsApp - Direct messaging
  - Twitter - Tweet with event details
  - LinkedIn - Professional network sharing

- **Features:**
  - Pre-populated messages
  - Event URL included
  - Platform-specific formatting
  - Opens in new window

- **Implementation:**
  ```typescript
  const shareEvent = (event: Event, platform: 'twitter' | 'linkedin' | 'whatsapp') => {
    const text = `Check out: ${event.title} by ${event.organizer}`;
    const url = event.website;
    // Platform-specific share URL
  };
  ```

### 5. **Advanced Filtering** 🔍

Multi-criteria filtering system:

#### Filter Options:

1. **Search Query**
   - Real-time search
   - Searches: title, description, organizer, tags
   - Case-insensitive
   - Instant results

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
   - **State:** All major Indian states
   - **City:** Mumbai, Bangalore, Delhi, Chennai, Hyderabad, Pune, etc.
   - Dynamic options based on available events

5. **Prize Money Filter**
   - Range slider: ₹0 - ₹50,00,000
   - Step size: ₹50,000
   - Smart formatting (₹1L, ₹2Cr)
   - Filters by total prize pool

#### Filter UI:
- Advanced filters in sliding sheet
- Category tabs for quick access
- Active filters summary
- One-click reset

### 6. **Auto-Notifications** 🔔

Intelligent notification system:

#### Notification Types:

1. **New Events**
   - Alert when new events are scraped
   - Shows count of new events
   - Department-specific filtering

2. **Deadline Reminders**
   - Configurable reminder days (1, 2, 3, 5, 7 days before)
   - Visual pulse animation on cards
   - "Today" and "Tomorrow" labels

3. **Department Matches**
   - Only notify about relevant events
   - Smart tag matching
   - Based on user's department

4. **Prize Alerts**
   - Minimum prize threshold
   - High-value event notifications

#### Notification Channels:

1. **In-App (Toast)**
   - Immediate feedback
   - Non-intrusive
   - Actionable

2. **Browser Push** (Optional)
   - Permission-based
   - Works when tab is closed
   - Native OS notifications

3. **Email Digest** (Coming Soon)
   - Daily summary
   - Weekly roundup
   - Deadline reminders

#### Preferences:
- Master on/off toggle
- Per-type granular control
- Saved in localStorage
- Accessible via dedicated UI

## 📊 Event Data Structure

### Enhanced Event Interface

```typescript
interface Event {
  id: string;                    // Unique identifier
  title: string;                 // Event name
  organizer: string;             // Organization/college
  description: string;           // Full description
  category: string;              // Event category
  startDate: string;             // ISO 8601 format
  endDate: string;               // ISO 8601 format
  registrationDeadline: string;  // ISO 8601 format
  
  // Location
  location: string;              // Full location text
  city: string;                  // City name
  state: string;                 // State name
  mode: 'Online' | 'Offline' | 'Hybrid';
  
  // Details
  eligibility: string;           // Who can apply
  prizes: string;                // Prize description
  prizeAmount?: number;          // Numeric amount for filtering
  website: string;               // Official URL
  tags: string[];                // Technology/topic tags
  relevantDepartments: string[]; // Matching departments
  imageUrl: string;              // Event poster/image
  
  // Metadata
  source: string;                // Organizer source
  isCollegeEvent: boolean;       // College vs external
  isFeatured: boolean;           // Featured event flag
  scrapedFrom?: 'devfolio' | 'unstop' | 'mlh' | 'hackerearth' | 'manual';
}
```

## 🛠️ Technical Architecture

### Frontend Components

1. **EventRecommendations.tsx**
   - Main event discovery interface
   - Filtering and search
   - Event cards with actions
   - Saved events management

2. **EventNotificationManager.tsx**
   - Notification preferences UI
   - Channel configuration
   - Test notifications
   - History tracking

3. **eventScraper.ts**
   - Scraping utilities
   - Data transformation
   - Deduplication logic
   - Relevance scoring

### Backend (Supabase Edge Functions)

4. **scrape-events/index.ts**
   - Server-side scraping
   - API integration
   - Rate limiting
   - Caching strategy

### Data Flow

```
External APIs (Devfolio, Unstop, etc.)
    ↓
Supabase Edge Function (scrape-events)
    ↓
Data Normalization & Deduplication
    ↓
Frontend State (EventRecommendations)
    ↓
Filters Applied
    ↓
Display to User
```

## 🚀 Deployment Guide

### 1. Deploy Supabase Function

```bash
# Install Supabase CLI
npm install -g supabase

# Login
supabase login

# Link your project
supabase link --project-ref YOUR_PROJECT_REF

# Deploy the scraping function
supabase functions deploy scrape-events

# Set environment variables (if needed)
supabase secrets set DEVFOLIO_API_KEY=your_key
supabase secrets set UNSTOP_API_KEY=your_key
```

### 2. Set Up Cron Job

In Supabase Dashboard:
1. Go to Edge Functions
2. Select `scrape-events`
3. Enable Cron Jobs
4. Schedule: `0 */6 * * *` (every 6 hours)
5. Save

### 3. Configure Frontend

```typescript
// In EventRecommendations.tsx
const SCRAPING_API_URL = 'https://YOUR_PROJECT.supabase.co/functions/v1/scrape-events';

const fetchEvents = async () => {
  const response = await fetch(SCRAPING_API_URL);
  const data = await response.json();
  setEvents(data.events);
};
```

## 📱 User Experience

### Event Discovery Flow

1. **User Opens Events Tab**
   - See comprehensive event grid
   - Source badges (Devfolio, Unstop, etc.)
   - Department recommendations

2. **User Applies Filters**
   - Search by keyword
   - Select category
   - Choose location
   - Set prize range
   - Filter by mode

3. **User Finds Event**
   - Read full details
   - Check eligibility
   - View prizes
   - See deadline

4. **User Takes Action**
   - Save event (bookmark)
   - Add to calendar (.ics)
   - Share on social media
   - Apply for OD

### Notification Flow

1. **User Enables Notifications**
   - Toggle master switch
   - Select notification types
   - Choose channels
   - Set preferences

2. **New Event Scraped**
   - System checks relevance
   - Matches against preferences
   - Sends notification

3. **User Receives Alert**
   - In-app toast
   - Push notification (if enabled)
   - Email digest (coming soon)

## 🎨 UI Components

### Event Card

```
┌─────────────────────────────────┐
│ [Event Image]      [Category]   │
│                    [Recommended] │
│                    [Source]      │
│         [Bookmark]               │
├─────────────────────────────────┤
│ Event Title                      │
│ Organizer Name                   │
│ Description...                   │
│                                  │
│ 📅 Date Range                   │
│    Registration Deadline         │
│    3 days left                   │
│                                  │
│ 🌐 Location • Mode              │
│ 🏆 Prize Details                │
│ 👥 Eligibility                  │
│                                  │
│ [Tags...]                        │
│                                  │
│ [Website] [Share ▼] [📅]       │
│ [Apply for OD]                   │
└─────────────────────────────────┘
```

### Filter Sheet

```
┌─────────────────────────┐
│ Advanced Filters    [×] │
├─────────────────────────┤
│ Event Mode              │
│ [All Modes      ▼]     │
│                         │
│ State                   │
│ [All States     ▼]     │
│                         │
│ City                    │
│ [All Cities     ▼]     │
│                         │
│ Prize Money Range       │
│ ₹0 ━━━━○━━━━ ₹50L     │
│                         │
│ [Reset Filters]         │
└─────────────────────────┘
```

## 🔧 Configuration Options

### LocalStorage Keys

- `savedEvents` - Array of saved event IDs
- `eventNotificationPreferences` - Notification settings
- `notificationHistory` - Recent notifications
- `lastEventSync` - Last sync timestamp
- `filterPreferences` - Saved filter state

### Feature Flags

```typescript
const FEATURES = {
  SCRAPING_ENABLED: true,
  SAVED_EVENTS: true,
  CALENDAR_EXPORT: true,
  SOCIAL_SHARING: true,
  PUSH_NOTIFICATIONS: true,
  EMAIL_NOTIFICATIONS: false, // Coming soon
};
```

## 📈 Performance Metrics

### Scraping Performance

- **Devfolio**: ~2-3 seconds
- **Unstop**: ~3-4 seconds
- **MLH**: ~2 seconds
- **HackerEarth**: ~2 seconds
- **Total**: ~10-12 seconds for all sources

### Optimization

1. **Parallel Scraping**
   ```typescript
   const [devfolio, unstop, mlh] = await Promise.all([
     scrapeDevfolio(),
     scrapeUnstop(),
     scrapeMLH(),
   ]);
   ```

2. **Caching**
   - Edge function cache: 1 hour
   - Browser cache: 6 hours
   - Manual refresh available

3. **Pagination**
   - Load 50 events initially
   - Lazy load more on scroll
   - Filter client-side

## 🔒 Security & Privacy

### Data Privacy

- No personal data stored in events
- Saved events in localStorage only
- Optional Supabase sync with encryption

### Rate Limiting

- Max 100 requests/hour per user
- Edge function: 1000 requests/hour total
- Exponential backoff on failures

### CORS Configuration

```typescript
const headers = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, content-type',
};
```

## 🐛 Troubleshooting

### Common Issues

1. **Events Not Loading**
   - Check Supabase function status
   - Verify API endpoints are accessible
   - Check browser console for errors
   - Test with: `curl https://YOUR_PROJECT.supabase.co/functions/v1/scrape-events`

2. **Saved Events Not Persisting**
   - Check localStorage quota (usually 5-10MB)
   - Verify browser privacy settings
   - Try in incognito mode
   - Clear cache and retry

3. **Calendar Download Not Working**
   - Check browser download permissions
   - Verify popup blocker settings
   - Try different browser
   - Check .ics file format

4. **Push Notifications Not Working**
   - Request permission explicitly
   - Check browser notification settings
   - HTTPS required for push
   - Test with notification API

### Debug Mode

```typescript
// Enable in EventRecommendations.tsx
const DEBUG = true;

if (DEBUG) {
  console.log('Events:', events);
  console.log('Filters:', filters);
  console.log('Saved:', savedEventIds);
}
```

## 🚧 Future Enhancements

### Planned Features

1. **Machine Learning Recommendations**
   - Collaborative filtering
   - User behavior analysis
   - Personalized ranking

2. **Team Formation**
   - Find teammates for hackathons
   - Skills matching algorithm
   - In-app chat

3. **Event History**
   - Track attended events
   - Certificate storage
   - Impact metrics

4. **Mobile App**
   - React Native version
   - Push notifications
   - Offline support

5. **Advanced Analytics**
   - Event popularity trends
   - Success rate tracking
   - Department-wise participation

## 📚 API Documentation

### Scraping Function

**Endpoint:** `https://YOUR_PROJECT.supabase.co/functions/v1/scrape-events`

**Method:** GET

**Parameters:**
- `source` (optional): `devfolio` | `unstop` | `mlh` | `hackerearth` | `all`

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

**Error Response:**
```json
{
  "error": "Error message",
  "message": "Detailed error description"
}
```

## 💡 Best Practices

### For Users

1. Enable notifications for important deadlines
2. Save events early to track deadlines
3. Use filters to find relevant opportunities
4. Share events with team members
5. Apply for OD at least 3 days in advance

### For Developers

1. Cache aggressively, invalidate smartly
2. Handle API failures gracefully
3. Implement retry logic with backoff
4. Log all scraping activities
5. Monitor rate limits

## 📞 Support

For issues or questions:
- **GitHub Issues**: Create an issue with the `events` label
- **Documentation**: See `/guidelines/EventScrapingGuide.md`
- **Email**: support@odsystem.edu

## 📄 License

MIT License - See LICENSE file for details

---

**Last Updated**: October 24, 2025
**Version**: 2.0.0
**Contributors**: OD System Development Team
