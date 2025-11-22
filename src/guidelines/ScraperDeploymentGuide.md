# Event Scraper Deployment Guide

## Prerequisites

Before deploying the event scraping system, ensure you have:

1. **Supabase Account**
   - Sign up at https://supabase.com
   - Create a new project
   - Note your project URL and anon key

2. **Supabase CLI**
   ```bash
   npm install -g supabase
   # or
   brew install supabase/tap/supabase
   ```

3. **Deno Runtime** (for local testing)
   ```bash
   curl -fsSL https://deno.land/x/install/install.sh | sh
   # or
   brew install deno
   ```

4. **Environment Setup**
   - Node.js 18+ (for development)
   - Git (for version control)
   - Code editor (VS Code recommended)

## Step 1: Initialize Supabase Project

### 1.1 Login to Supabase CLI
```bash
supabase login
```
Follow the prompts to authenticate.

### 1.2 Link Your Project
```bash
# From your project root directory
supabase link --project-ref YOUR_PROJECT_REF
```
Replace `YOUR_PROJECT_REF` with your Supabase project reference ID.

### 1.3 Initialize Functions (if not already done)
```bash
supabase functions new scrape-all-events
```

## Step 2: Deploy Edge Function

### 2.1 Deploy the Scraping Function
```bash
# From project root
supabase functions deploy scrape-all-events
```

This will deploy `/supabase/functions/scrape-all-events/index.ts` to Supabase.

### 2.2 Verify Deployment
```bash
supabase functions list
```
You should see `scrape-all-events` in the list.

### 2.3 Get Function URL
Your function will be available at:
```
https://YOUR_PROJECT_REF.supabase.co/functions/v1/scrape-all-events
```

## Step 3: Configure Environment Variables

### 3.1 Set Secrets (if needed)
```bash
# Set user agent for scraping
supabase secrets set SCRAPER_USER_AGENT="CollegeODSystem/1.0"

# Set rate limiting config
supabase secrets set MAX_REQUESTS_PER_MINUTE="60"

# Set cache TTL (in seconds)
supabase secrets set CACHE_TTL="21600"  # 6 hours
```

### 3.2 Update Client Configuration
In your React app, update the API endpoint:

```typescript
// In /utils/enhancedEventScraper.ts
const SUPABASE_FUNCTION_URL = 'https://YOUR_PROJECT_REF.supabase.co/functions/v1/scrape-all-events';

export async function fetchScrapedEvents(
  sources: string[] = ['all'],
  domain?: string
): Promise<ScrapedEvent[]> {
  try {
    const sourceParam = sources.join(',');
    const response = await fetch(`${SUPABASE_FUNCTION_URL}?sources=${sourceParam}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'apikey': 'YOUR_SUPABASE_ANON_KEY',
      },
    });
    // ... rest of the code
  }
}
```

## Step 4: Set Up Database Tables (for Caching)

### 4.1 Create Events Table
```sql
-- Create events table for caching
CREATE TABLE IF NOT EXISTS scraped_events (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  organizer TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  start_date TIMESTAMP WITH TIME ZONE,
  end_date TIMESTAMP WITH TIME ZONE,
  registration_deadline TIMESTAMP WITH TIME ZONE,
  location TEXT,
  city TEXT,
  state TEXT,
  mode TEXT,
  eligibility TEXT,
  prizes TEXT,
  prize_amount INTEGER,
  website TEXT,
  registration_url TEXT,
  tags JSONB,
  domains JSONB,
  relevant_departments JSONB,
  image_url TEXT,
  source TEXT,
  scraped_from TEXT,
  deadline_urgency TEXT,
  is_verified BOOLEAN DEFAULT false,
  participant_count INTEGER,
  scraped_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX idx_scraped_events_deadline ON scraped_events(registration_deadline);
CREATE INDEX idx_scraped_events_category ON scraped_events(category);
CREATE INDEX idx_scraped_events_domains ON scraped_events USING GIN(domains);
CREATE INDEX idx_scraped_events_scraped_from ON scraped_events(scraped_from);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_scraped_events_updated_at
  BEFORE UPDATE ON scraped_events
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

### 4.2 Create Scraping Logs Table
```sql
-- Create scraping logs for monitoring
CREATE TABLE IF NOT EXISTS scraping_logs (
  id SERIAL PRIMARY KEY,
  platform TEXT NOT NULL,
  status TEXT NOT NULL, -- 'success', 'error', 'partial'
  events_count INTEGER DEFAULT 0,
  error_message TEXT,
  execution_time_ms INTEGER,
  scraped_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for log queries
CREATE INDEX idx_scraping_logs_platform ON scraping_logs(platform);
CREATE INDEX idx_scraping_logs_scraped_at ON scraping_logs(scraped_at DESC);
```

### 4.3 Enable Row Level Security (RLS)
```sql
-- Enable RLS on scraped_events
ALTER TABLE scraped_events ENABLE ROW LEVEL SECURITY;

-- Allow public read access
CREATE POLICY "Public read access" ON scraped_events
  FOR SELECT USING (true);

-- Allow service role to write
CREATE POLICY "Service role write access" ON scraped_events
  FOR ALL USING (auth.role() = 'service_role');
```

## Step 5: Test the Deployment

### 5.1 Test via curl
```bash
curl -X GET \
  'https://YOUR_PROJECT_REF.supabase.co/functions/v1/scrape-all-events?sources=unstop' \
  -H 'apikey: YOUR_SUPABASE_ANON_KEY' \
  -H 'Content-Type: application/json'
```

### 5.2 Test via Browser
Open your React app and navigate to:
```
Student Dashboard → Events Tab → Discover Events
```

Click "Refresh" to fetch events.

### 5.3 Check Logs
```bash
# View function logs
supabase functions logs scrape-all-events

# Follow logs in real-time
supabase functions logs scrape-all-events --follow
```

## Step 6: Set Up Automated Scraping (Optional)

### 6.1 Create Scheduled Function
Create a new file: `/supabase/functions/scheduled-scraper/index.ts`

```typescript
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

serve(async (req) => {
  // This function will be triggered by a cron job
  
  // Call the scrape-all-events function
  const response = await fetch(
    'https://YOUR_PROJECT_REF.supabase.co/functions/v1/scrape-all-events',
    {
      method: 'GET',
      headers: {
        'apikey': Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
      },
    }
  );

  const data = await response.json();
  
  return new Response(
    JSON.stringify({ success: true, data }),
    { headers: { 'Content-Type': 'application/json' } }
  );
});
```

### 6.2 Deploy Scheduled Function
```bash
supabase functions deploy scheduled-scraper
```

### 6.3 Set Up Cron Job
Use a service like **Cron-job.org** or **EasyCron** to call:
```
https://YOUR_PROJECT_REF.supabase.co/functions/v1/scheduled-scraper
```

Schedule: Every 6 hours (0 */6 * * *)

## Step 7: Monitor and Maintain

### 7.1 Set Up Monitoring
```bash
# Check function health
supabase functions inspect scrape-all-events

# View metrics
supabase functions metrics scrape-all-events
```

### 7.2 Create Monitoring Dashboard
```sql
-- Query for monitoring
SELECT 
  platform,
  COUNT(*) as total_runs,
  SUM(CASE WHEN status = 'success' THEN 1 ELSE 0 END) as successful_runs,
  SUM(CASE WHEN status = 'error' THEN 1 ELSE 0 END) as failed_runs,
  AVG(execution_time_ms) as avg_execution_time,
  MAX(scraped_at) as last_run
FROM scraping_logs
WHERE scraped_at > NOW() - INTERVAL '7 days'
GROUP BY platform
ORDER BY last_run DESC;
```

### 7.3 Set Up Alerts
Create alerts for:
- Function errors (> 10% failure rate)
- No events scraped (0 events for > 1 hour)
- Execution time (> 30 seconds)
- Rate limiting errors

## Step 8: Performance Optimization

### 8.1 Enable Caching
Update Edge Function to cache results in database:

```typescript
// Check cache first
const cachedEvents = await getCachedEvents(sources);
if (cachedEvents && !isStale(cachedEvents)) {
  return cachedEvents;
}

// Scrape and update cache
const freshEvents = await scrapeAllSources(sources);
await updateCache(freshEvents);
return freshEvents;
```

### 8.2 Implement Rate Limiting
```typescript
// Add rate limiting logic
const rateLimiter = new RateLimiter({
  maxRequests: 60,
  perMinutes: 1,
});

if (!rateLimiter.allowRequest()) {
  throw new Error('Rate limit exceeded');
}
```

### 8.3 Add Retry Logic
```typescript
async function scrapeWithRetry(
  scraper: () => Promise<ScrapedEvent[]>,
  maxRetries = 3
): Promise<ScrapedEvent[]> {
  let lastError;
  
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await scraper();
    } catch (error) {
      lastError = error;
      await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, i)));
    }
  }
  
  throw lastError;
}
```

## Step 9: Security Hardening

### 9.1 Add API Key Authentication
```typescript
// In Edge Function
const apiKey = req.headers.get('x-api-key');
const validApiKeys = Deno.env.get('VALID_API_KEYS')?.split(',') || [];

if (!validApiKeys.includes(apiKey)) {
  return new Response('Unauthorized', { status: 401 });
}
```

### 9.2 Implement CORS Properly
```typescript
const corsHeaders = {
  'Access-Control-Allow-Origin': 'https://your-college-domain.com',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, apikey, x-api-key',
};
```

### 9.3 Add Input Validation
```typescript
const url = new URL(req.url);
const sources = url.searchParams.get('sources')?.split(',') || ['all'];

// Validate sources
const validSources = ['unstop', 'devpost', 'hack2skill', 'knowafest', 'reskilll', 'commudle', 'all'];
const invalidSources = sources.filter(s => !validSources.includes(s));

if (invalidSources.length > 0) {
  return new Response(
    JSON.stringify({ error: `Invalid sources: ${invalidSources.join(', ')}` }),
    { status: 400 }
  );
}
```

## Step 10: Documentation

### 10.1 API Documentation
Create `/docs/api/scrape-events.md`:

```markdown
# Scrape Events API

## Endpoint
GET /functions/v1/scrape-all-events

## Parameters
- `sources` (optional): Comma-separated list of platforms
  - Valid values: unstop, devpost, hack2skill, knowafest, reskilll, commudle, all
  - Default: all

## Response
{
  "success": true,
  "count": 42,
  "events": [...],
  "lastUpdated": "2025-10-24T10:00:00Z",
  "sources": {
    "unstop": 15,
    "devpost": 10,
    ...
  }
}
```

### 10.2 Update Client Documentation
Add usage examples in `/guidelines/EventScraperQuickStart.md`

## Troubleshooting

### Issue: Function Timeout
**Solution**: Increase timeout in `supabase/config.toml`:
```toml
[functions.scrape-all-events]
timeout = 300 # 5 minutes
```

### Issue: Memory Errors
**Solution**: Optimize scraping to process in batches:
```typescript
const BATCH_SIZE = 10;
const batches = chunk(platforms, BATCH_SIZE);

for (const batch of batches) {
  const results = await Promise.all(batch.map(scrape));
  events.push(...results.flat());
}
```

### Issue: CORS Errors
**Solution**: Ensure CORS headers are set correctly in Edge Function

### Issue: Scraping Fails
**Solution**: 
1. Check platform website is accessible
2. Verify API endpoints haven't changed
3. Check rate limiting
4. Review error logs

## Maintenance Checklist

### Daily
- [ ] Check scraping logs for errors
- [ ] Verify event count is reasonable
- [ ] Monitor function execution time

### Weekly
- [ ] Review and clear old cached events
- [ ] Update platform scrapers if APIs changed
- [ ] Check for new event platforms to add

### Monthly
- [ ] Analyze usage patterns
- [ ] Optimize slow scrapers
- [ ] Update documentation
- [ ] Review and improve error handling

## Support

For deployment issues:
- **Supabase Docs**: https://supabase.com/docs/guides/functions
- **Deno Docs**: https://deno.land/manual
- **Project Docs**: `/guidelines/EventScrapingSystem.md`

---

**Deployment Status**: Ready for production
**Last Updated**: October 24, 2025
**Version**: 1.0.0
