// Supabase Edge Function for Event Scraping
// This function runs on Supabase Edge and scrapes events from various platforms
// Deploy with: supabase functions deploy scrape-events

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

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
  website: string;
  tags: string[];
  relevantDepartments: string[];
  imageUrl: string;
  source: string;
  isCollegeEvent: boolean;
  isFeatured: boolean;
  scrapedFrom: 'devfolio' | 'unstop' | 'mlh' | 'hackerearth' | 'manual';
}

/**
 * Scrape events from Devfolio
 */
async function scrapeDevfolio(): Promise<Event[]> {
  try {
    // Devfolio GraphQL API endpoint
    const response = await fetch('https://api.devfolio.co/api/search/hackathons', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Mozilla/5.0 (compatible; EventScraper/1.0)',
      },
      body: JSON.stringify({
        query: {
          status: 'UPCOMING',
          country: 'IN',
        },
      }),
    });

    if (!response.ok) {
      console.error('Devfolio API error:', response.status);
      return [];
    }

    const data = await response.json();
    
    return (data.hackathons || []).map((h: any) => ({
      id: `devfolio-${h.id}`,
      title: h.name,
      organizer: h.organizer?.name || 'Unknown',
      description: h.description?.substring(0, 200) || '',
      category: 'Hackathon',
      startDate: h.starts_at,
      endDate: h.ends_at,
      registrationDeadline: h.application_closes_at || h.starts_at,
      location: h.is_online ? 'Online' : h.venue?.city || 'TBD',
      city: h.is_online ? 'Online' : h.venue?.city || 'TBD',
      state: h.is_online ? 'Online' : h.venue?.state || 'TBD',
      mode: h.is_online ? 'Online' : h.venue?.city ? 'Offline' : 'Hybrid',
      eligibility: 'Engineering students',
      prizes: h.total_prizes ? `Total prizes: ₹${h.total_prizes.toLocaleString('en-IN')}` : 'Check website',
      prizeAmount: h.total_prizes || 0,
      website: `https://devfolio.co/hackathons/${h.slug}`,
      tags: h.themes || [],
      relevantDepartments: determineDepartments(h.themes),
      imageUrl: h.cover_image || 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=800',
      source: h.organizer?.name || 'Devfolio',
      isCollegeEvent: h.organizer?.type === 'college',
      isFeatured: h.featured || false,
      scrapedFrom: 'devfolio',
    }));
  } catch (error) {
    console.error('Error scraping Devfolio:', error);
    return [];
  }
}

/**
 * Scrape events from Unstop
 */
async function scrapeUnstop(): Promise<Event[]> {
  try {
    const response = await fetch('https://unstop.com/api/public/opportunity/search-result', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Mozilla/5.0 (compatible; EventScraper/1.0)',
      },
      body: JSON.stringify({
        opportunity: ['hackathons', 'competitions', 'workshops'],
        type: 'engineering',
        page: 1,
        per_page: 50,
      }),
    });

    if (!response.ok) {
      console.error('Unstop API error:', response.status);
      return [];
    }

    const data = await response.json();
    
    return (data.data?.data || []).map((opportunity: any) => ({
      id: `unstop-${opportunity.id}`,
      title: opportunity.title,
      organizer: opportunity.organisation?.name || 'Unknown',
      description: opportunity.description?.substring(0, 200) || '',
      category: mapUnstopCategory(opportunity.type),
      startDate: opportunity.start_date,
      endDate: opportunity.end_date,
      registrationDeadline: opportunity.registration_end_date,
      location: opportunity.opportunity_type === 'online' ? 'Online' : opportunity.city || 'TBD',
      city: opportunity.opportunity_type === 'online' ? 'Online' : opportunity.city || 'TBD',
      state: opportunity.opportunity_type === 'online' ? 'Online' : opportunity.state || 'TBD',
      mode: opportunity.opportunity_type === 'online' ? 'Online' : 'Offline',
      eligibility: opportunity.eligibility || 'All students',
      prizes: opportunity.prizes_worth || 'Check website',
      prizeAmount: parsePrizeAmount(opportunity.prizes_worth),
      website: `https://unstop.com/${opportunity.public_url}`,
      tags: opportunity.tags || [],
      relevantDepartments: determineDepartments(opportunity.tags),
      imageUrl: opportunity.banner_image || 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=800',
      source: opportunity.organisation?.name || 'Unstop',
      isCollegeEvent: opportunity.organisation?.type === 'college',
      isFeatured: opportunity.is_featured || false,
      scrapedFrom: 'unstop',
    }));
  } catch (error) {
    console.error('Error scraping Unstop:', error);
    return [];
  }
}

/**
 * Scrape events from MLH (Major League Hacking)
 */
async function scrapeMLH(): Promise<Event[]> {
  try {
    const response = await fetch('https://mlh.io/seasons/2025/events', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; EventScraper/1.0)',
      },
    });

    if (!response.ok) {
      console.error('MLH API error:', response.status);
      return [];
    }

    // MLH requires HTML parsing - would need cheerio or similar
    // For now, returning empty array
    return [];
  } catch (error) {
    console.error('Error scraping MLH:', error);
    return [];
  }
}

/**
 * Scrape events from HackerEarth
 */
async function scrapeHackerEarth(): Promise<Event[]> {
  try {
    const response = await fetch('https://www.hackerearth.com/challenges/api/challenges/', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; EventScraper/1.0)',
      },
    });

    if (!response.ok) {
      console.error('HackerEarth API error:', response.status);
      return [];
    }

    const data = await response.json();
    
    return (data.challenges || []).map((challenge: any) => ({
      id: `hackerearth-${challenge.id}`,
      title: challenge.title,
      organizer: 'HackerEarth',
      description: challenge.description?.substring(0, 200) || '',
      category: 'Competition',
      startDate: challenge.start_time,
      endDate: challenge.end_time,
      registrationDeadline: challenge.end_time,
      location: 'Online',
      city: 'Online',
      state: 'Online',
      mode: 'Online',
      eligibility: 'All students',
      prizes: 'Check website',
      prizeAmount: 0,
      website: `https://www.hackerearth.com${challenge.url}`,
      tags: challenge.tags || [],
      relevantDepartments: ['all'],
      imageUrl: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800',
      source: 'HackerEarth',
      isCollegeEvent: false,
      isFeatured: false,
      scrapedFrom: 'hackerearth',
    }));
  } catch (error) {
    console.error('Error scraping HackerEarth:', error);
    return [];
  }
}

/**
 * Map Unstop category to our category
 */
function mapUnstopCategory(type: string): string {
  const mapping: Record<string, string> = {
    'hackathon': 'Hackathon',
    'competition': 'Competition',
    'workshop': 'Workshop',
    'conference': 'Conference',
    'symposium': 'Symposium',
    'expo': 'Project Expo',
  };
  return mapping[type.toLowerCase()] || 'Competition';
}

/**
 * Parse prize amount from text
 */
function parsePrizeAmount(prizeText: string | number): number {
  if (typeof prizeText === 'number') return prizeText;
  if (!prizeText) return 0;

  const cleaned = prizeText.replace(/[₹,$,]/g, '').trim();
  
  if (cleaned.includes('lakh') || cleaned.includes('L')) {
    return parseFloat(cleaned) * 100000;
  }
  if (cleaned.includes('crore') || cleaned.includes('Cr')) {
    return parseFloat(cleaned) * 10000000;
  }
  if (cleaned.includes('K')) {
    return parseFloat(cleaned) * 1000;
  }
  
  return parseFloat(cleaned) || 0;
}

/**
 * Determine relevant departments based on tags/themes
 */
function determineDepartments(tags: string[]): string[] {
  if (!tags || tags.length === 0) return ['all'];

  const deptKeywords: Record<string, string[]> = {
    'Computer Science & Engineering': ['web', 'software', 'programming', 'coding', 'backend', 'frontend', 'fullstack'],
    'Artificial Intelligence & Data Science': ['ai', 'ml', 'data', 'analytics', 'data science'],
    'Artificial Intelligence & Machine Learning': ['ai', 'ml', 'deep learning', 'neural', 'cv', 'nlp'],
    'Information Technology': ['web', 'app', 'cloud', 'devops', 'it'],
    'Mechanical': ['cad', 'design', 'manufacturing', 'mechanical'],
    'Civil': ['construction', 'infrastructure', 'civil', 'urban'],
    'Electrical': ['circuit', 'embedded', 'iot', 'electronics', 'electrical'],
    'Electronics': ['electronics', 'embedded', 'iot', 'circuit'],
  };

  const matchedDepts = new Set<string>();
  const tagText = tags.join(' ').toLowerCase();

  for (const [dept, keywords] of Object.entries(deptKeywords)) {
    if (keywords.some(keyword => tagText.includes(keyword))) {
      matchedDepts.add(dept);
    }
  }

  return matchedDepts.size > 0 ? Array.from(matchedDepts) : ['all'];
}

/**
 * Remove duplicate events
 */
function deduplicateEvents(events: Event[]): Event[] {
  const seen = new Map<string, Event>();
  
  for (const event of events) {
    const key = `${event.title.toLowerCase()}-${event.organizer.toLowerCase()}`;
    if (!seen.has(key)) {
      seen.set(key, event);
    }
  }
  
  return Array.from(seen.values());
}

/**
 * Main handler
 */
serve(async (req) => {
  // CORS headers
  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  };

  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers });
  }

  try {
    const url = new URL(req.url);
    const source = url.searchParams.get('source'); // devfolio, unstop, mlh, hackerearth, or all

    let events: Event[] = [];

    if (!source || source === 'all') {
      // Scrape from all sources
      const [devfolio, unstop, mlh, hackerearth] = await Promise.all([
        scrapeDevfolio(),
        scrapeUnstop(),
        scrapeMLH(),
        scrapeHackerEarth(),
      ]);
      events = [...devfolio, ...unstop, ...mlh, ...hackerearth];
    } else {
      // Scrape from specific source
      switch (source) {
        case 'devfolio':
          events = await scrapeDevfolio();
          break;
        case 'unstop':
          events = await scrapeUnstop();
          break;
        case 'mlh':
          events = await scrapeMLH();
          break;
        case 'hackerearth':
          events = await scrapeHackerEarth();
          break;
        default:
          return new Response(
            JSON.stringify({ error: 'Invalid source parameter' }),
            { status: 400, headers }
          );
      }
    }

    // Remove duplicates
    const uniqueEvents = deduplicateEvents(events);

    // Sort by registration deadline
    uniqueEvents.sort((a, b) => 
      new Date(a.registrationDeadline).getTime() - new Date(b.registrationDeadline).getTime()
    );

    return new Response(
      JSON.stringify({
        success: true,
        count: uniqueEvents.length,
        events: uniqueEvents,
        lastUpdated: new Date().toISOString(),
        sources: {
          devfolio: events.filter(e => e.scrapedFrom === 'devfolio').length,
          unstop: events.filter(e => e.scrapedFrom === 'unstop').length,
          mlh: events.filter(e => e.scrapedFrom === 'mlh').length,
          hackerearth: events.filter(e => e.scrapedFrom === 'hackerearth').length,
        },
      }),
      { headers }
    );
  } catch (error) {
    console.error('Error in scrape-events function:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
      }),
      { status: 500, headers }
    );
  }
});
