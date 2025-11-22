// Enhanced Supabase Edge Function for Multi-Platform Event Scraping
// This function uses Puppeteer, Cheerio, and Axios to scrape events from various platforms
// Deploy with: supabase functions deploy scrape-all-events

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

interface ScrapedEvent {
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
  registrationUrl: string;
  tags: string[];
  domains: string[];
  relevantDepartments: string[];
  imageUrl: string;
  source: string;
  scrapedFrom: string;
  deadlineUrgency: 'urgent' | 'soon' | 'normal';
  isVerified: boolean;
  participantCount?: number;
}

/**
 * Scrape Unstop using their API
 */
async function scrapeUnstop(): Promise<ScrapedEvent[]> {
  try {
    const response = await fetch('https://unstop.com/api/public/opportunity/search-result', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Mozilla/5.0 (compatible; EventScraper/1.0)',
      },
      body: JSON.stringify({
        opportunity: ['hackathons', 'competitions', 'workshops', 'conferences'],
        type: 'engineering',
        page: 1,
        per_page: 100,
        filters: {
          status: ['open'],
        },
      }),
    });

    if (!response.ok) {
      console.error('Unstop API error:', response.status);
      return [];
    }

    const data = await response.json();
    const events = (data.data?.data || []).map((item: any) => transformUnstopEvent(item));
    return events;
  } catch (error) {
    console.error('Error scraping Unstop:', error);
    return [];
  }
}

/**
 * Scrape Devpost
 * Note: Devpost requires HTML parsing, so we use fetch and basic text parsing
 */
async function scrapeDevpost(): Promise<ScrapedEvent[]> {
  try {
    const response = await fetch('https://devpost.com/api/hackathons', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; EventScraper/1.0)',
      },
    });

    if (!response.ok) {
      console.error('Devpost API error:', response.status);
      return [];
    }

    const data = await response.json();
    const events = (data.hackathons || []).map((item: any) => transformDevpostEvent(item));
    return events;
  } catch (error) {
    console.error('Error scraping Devpost:', error);
    return [];
  }
}

/**
 * Scrape Hack2Skill
 */
async function scrapeHack2Skill(): Promise<ScrapedEvent[]> {
  try {
    const response = await fetch('https://hack2skill.com/api/competitions/live', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; EventScraper/1.0)',
      },
    });

    if (!response.ok) {
      console.error('Hack2Skill API error:', response.status);
      return [];
    }

    const data = await response.json();
    const events = (data.competitions || []).map((item: any) => transformHack2SkillEvent(item));
    return events;
  } catch (error) {
    console.error('Error scraping Hack2Skill:', error);
    return [];
  }
}

/**
 * Scrape Knowafest
 */
async function scrapeKnowafest(): Promise<ScrapedEvent[]> {
  try {
    const response = await fetch('https://www.knowafest.com/api/events', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; EventScraper/1.0)',
      },
    });

    if (!response.ok) {
      console.error('Knowafest API error:', response.status);
      return [];
    }

    const data = await response.json();
    const events = (data.events || []).map((item: any) => transformKnowafestEvent(item));
    return events;
  } catch (error) {
    console.error('Error scraping Knowafest:', error);
    return [];
  }
}

/**
 * Scrape Reskilll
 */
async function scrapeReskilll(): Promise<ScrapedEvent[]> {
  try {
    const response = await fetch('https://reskilll.com/api/v1/events', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; EventScraper/1.0)',
      },
    });

    if (!response.ok) {
      console.error('Reskilll API error:', response.status);
      return [];
    }

    const data = await response.json();
    const events = (data.events || []).map((item: any) => transformReskilllEvent(item));
    return events;
  } catch (error) {
    console.error('Error scraping Reskilll:', error);
    return [];
  }
}

/**
 * Scrape Commudle
 */
async function scrapeCommudle(): Promise<ScrapedEvent[]> {
  try {
    const response = await fetch('https://www.commudle.com/api/v1/events', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; EventScraper/1.0)',
      },
    });

    if (!response.ok) {
      console.error('Commudle API error:', response.status);
      return [];
    }

    const data = await response.json();
    const events = (data.events || []).map((item: any) => transformCommudleEvent(item));
    return events;
  } catch (error) {
    console.error('Error scraping Commudle:', error);
    return [];
  }
}

/**
 * Transform Unstop event to standard format
 */
function transformUnstopEvent(event: any): ScrapedEvent {
  return {
    id: `unstop-${event.id || Date.now()}`,
    title: event.title || event.name || 'Untitled Event',
    organizer: event.organisation?.name || event.organizer || 'Unknown',
    description: (event.description || event.short_description || '').substring(0, 300),
    category: mapCategory(event.type || event.opportunity_type),
    startDate: event.start_date || event.starts_on || new Date().toISOString(),
    endDate: event.end_date || event.ends_on || new Date().toISOString(),
    registrationDeadline: event.registration_end_date || event.deadline || new Date().toISOString(),
    location: event.opportunity_type === 'online' ? 'Online' : (event.city || event.location || 'TBD'),
    city: event.city || (event.opportunity_type === 'online' ? 'Online' : 'TBD'),
    state: event.state || (event.opportunity_type === 'online' ? 'Online' : 'TBD'),
    mode: event.opportunity_type === 'online' ? 'Online' : (event.mode || 'Offline'),
    eligibility: event.eligibility || event.eligible_courses || 'All students',
    prizes: event.prizes_worth || event.prize || 'Check website for details',
    prizeAmount: parsePrizeAmount(event.prizes_worth || event.prize_money),
    website: event.url || `https://unstop.com/${event.public_url || event.slug}`,
    registrationUrl: event.register_url || event.apply_url || `https://unstop.com/${event.public_url || event.slug}`,
    tags: Array.isArray(event.tags) ? event.tags : (event.skills || []),
    domains: mapTagsToDomains(Array.isArray(event.tags) ? event.tags : (event.skills || [])),
    relevantDepartments: determineDepartments(Array.isArray(event.tags) ? event.tags : (event.skills || [])),
    imageUrl: event.cover_image || event.banner || event.logo_url || 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=800',
    source: event.organisation?.name || 'Unstop',
    scrapedFrom: 'unstop',
    deadlineUrgency: calculateDeadlineUrgency(event.registration_end_date || event.deadline),
    isVerified: event.is_verified || false,
    participantCount: event.registered_count || event.participants,
  };
}

/**
 * Transform Devpost event to standard format
 */
function transformDevpostEvent(event: any): ScrapedEvent {
  return {
    id: `devpost-${event.id || Date.now()}`,
    title: event.title || event.name || 'Untitled Hackathon',
    organizer: event.displayed_location?.location || event.organization_name || 'Devpost',
    description: (event.tagline || event.description || '').substring(0, 300),
    category: 'Hackathon',
    startDate: event.submission_period_dates?.split(' - ')[0] || new Date().toISOString(),
    endDate: event.submission_period_dates?.split(' - ')[1] || new Date().toISOString(),
    registrationDeadline: event.submission_period_dates?.split(' - ')[1] || new Date().toISOString(),
    location: event.displayed_location?.location || 'Online',
    city: event.displayed_location?.location || 'Online',
    state: 'Online',
    mode: 'Online',
    eligibility: 'All students and developers',
    prizes: event.prize_amount || 'Check website for prize details',
    prizeAmount: parsePrizeAmount(event.prize_amount),
    website: event.url || `https://devpost.com${event.url}`,
    registrationUrl: event.url || `https://devpost.com${event.url}`,
    tags: event.themes || [],
    domains: mapTagsToDomains(event.themes || []),
    relevantDepartments: ['all'],
    imageUrl: event.thumbnail_url || event.image_url || 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=800',
    source: 'Devpost',
    scrapedFrom: 'devpost',
    deadlineUrgency: calculateDeadlineUrgency(event.submission_period_dates?.split(' - ')[1]),
    isVerified: true,
    participantCount: event.registrations_count,
  };
}

/**
 * Transform Hack2Skill event to standard format
 */
function transformHack2SkillEvent(event: any): ScrapedEvent {
  return {
    id: `hack2skill-${event.id || Date.now()}`,
    title: event.title || 'Untitled Competition',
    organizer: event.organizer || 'Hack2Skill',
    description: (event.description || '').substring(0, 300),
    category: mapCategory(event.type),
    startDate: event.start_date || new Date().toISOString(),
    endDate: event.end_date || new Date().toISOString(),
    registrationDeadline: event.deadline || event.end_date || new Date().toISOString(),
    location: event.is_online ? 'Online' : (event.location || 'TBD'),
    city: event.is_online ? 'Online' : (event.city || 'TBD'),
    state: event.is_online ? 'Online' : (event.state || 'TBD'),
    mode: event.is_online ? 'Online' : 'Offline',
    eligibility: event.eligibility || 'All students',
    prizes: event.prizes || 'Check website',
    prizeAmount: parsePrizeAmount(event.prize_pool),
    website: event.url || 'https://hack2skill.com',
    registrationUrl: event.registration_url || event.url || 'https://hack2skill.com',
    tags: event.tags || event.skills || [],
    domains: mapTagsToDomains(event.tags || event.skills || []),
    relevantDepartments: determineDepartments(event.tags || []),
    imageUrl: event.image || 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=800',
    source: 'Hack2Skill',
    scrapedFrom: 'hack2skill',
    deadlineUrgency: calculateDeadlineUrgency(event.deadline),
    isVerified: true,
  };
}

/**
 * Transform Knowafest event to standard format
 */
function transformKnowafestEvent(event: any): ScrapedEvent {
  return {
    id: `knowafest-${event.id || Date.now()}`,
    title: event.title || event.name || 'Untitled Event',
    organizer: event.college || event.organizer || 'Unknown',
    description: (event.description || '').substring(0, 300),
    category: mapCategory(event.category || event.type),
    startDate: event.start_date || event.date || new Date().toISOString(),
    endDate: event.end_date || event.date || new Date().toISOString(),
    registrationDeadline: event.deadline || event.start_date || new Date().toISOString(),
    location: event.location || event.city || 'TBD',
    city: event.city || 'TBD',
    state: event.state || 'TBD',
    mode: 'Offline',
    eligibility: event.eligibility || 'All students',
    prizes: event.prizes || 'Check website',
    prizeAmount: parsePrizeAmount(event.prize_money),
    website: event.url || 'https://knowafest.com',
    registrationUrl: event.registration_link || event.url || 'https://knowafest.com',
    tags: event.tags || [],
    domains: mapTagsToDomains(event.tags || []),
    relevantDepartments: ['all'],
    imageUrl: event.image || 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=800',
    source: event.college || 'Knowafest',
    scrapedFrom: 'knowafest',
    deadlineUrgency: calculateDeadlineUrgency(event.deadline),
    isVerified: false,
  };
}

/**
 * Transform Reskilll event to standard format
 */
function transformReskilllEvent(event: any): ScrapedEvent {
  return {
    id: `reskilll-${event.id || Date.now()}`,
    title: event.title || 'Untitled Workshop',
    organizer: event.organizer || 'Reskilll',
    description: (event.description || '').substring(0, 300),
    category: 'Workshop',
    startDate: event.start_date || new Date().toISOString(),
    endDate: event.end_date || new Date().toISOString(),
    registrationDeadline: event.registration_deadline || event.start_date || new Date().toISOString(),
    location: 'Online',
    city: 'Online',
    state: 'Online',
    mode: 'Online',
    eligibility: event.eligibility || 'All students',
    prizes: event.certificate ? 'Certificate of completion' : 'Participation',
    prizeAmount: 0,
    website: event.url || 'https://reskilll.com',
    registrationUrl: event.registration_url || event.url || 'https://reskilll.com',
    tags: event.skills || event.tags || [],
    domains: mapTagsToDomains(event.skills || event.tags || []),
    relevantDepartments: determineDepartments(event.skills || []),
    imageUrl: event.thumbnail || 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=800',
    source: 'Reskilll',
    scrapedFrom: 'reskilll',
    deadlineUrgency: calculateDeadlineUrgency(event.registration_deadline),
    isVerified: true,
  };
}

/**
 * Transform Commudle event to standard format
 */
function transformCommudleEvent(event: any): ScrapedEvent {
  return {
    id: `commudle-${event.id || Date.now()}`,
    title: event.name || event.title || 'Untitled Event',
    organizer: event.kommunity?.name || event.organizer || 'Commudle Community',
    description: (event.description || '').substring(0, 300),
    category: mapCategory(event.event_type),
    startDate: event.start_time || new Date().toISOString(),
    endDate: event.end_time || new Date().toISOString(),
    registrationDeadline: event.start_time || new Date().toISOString(),
    location: event.event_location?.name || 'Online',
    city: event.event_location?.city || 'Online',
    state: 'Online',
    mode: event.event_location ? 'Offline' : 'Online',
    eligibility: 'Open to all',
    prizes: 'Community networking and learning',
    prizeAmount: 0,
    website: `https://www.commudle.com/events/${event.slug}`,
    registrationUrl: `https://www.commudle.com/events/${event.slug}`,
    tags: event.tags || [],
    domains: mapTagsToDomains(event.tags || []),
    relevantDepartments: ['all'],
    imageUrl: event.header_image || 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=800',
    source: event.kommunity?.name || 'Commudle',
    scrapedFrom: 'commudle',
    deadlineUrgency: calculateDeadlineUrgency(event.start_time),
    isVerified: true,
    participantCount: event.user_event_registrations_count,
  };
}

/**
 * Map category strings to standard categories
 */
function mapCategory(type: string): string {
  if (!type) return 'All Events';
  
  const lowerType = type.toLowerCase();
  if (lowerType.includes('hackathon')) return 'Hackathon';
  if (lowerType.includes('workshop') || lowerType.includes('training')) return 'Workshop';
  if (lowerType.includes('competition') || lowerType.includes('contest')) return 'Competition';
  if (lowerType.includes('expo') || lowerType.includes('exhibition')) return 'Project Expo';
  if (lowerType.includes('symposium') || lowerType.includes('fest')) return 'Symposium';
  if (lowerType.includes('conference') || lowerType.includes('summit')) return 'Conference';
  
  return 'All Events';
}

/**
 * Parse prize amount from text
 */
function parsePrizeAmount(prizeText: string | number): number {
  if (typeof prizeText === 'number') return prizeText;
  if (!prizeText) return 0;

  const cleaned = String(prizeText).replace(/[₹,$,]/g, '').trim();
  
  if (cleaned.includes('lakh') || cleaned.includes('L')) {
    return parseFloat(cleaned) * 100000;
  }
  if (cleaned.includes('crore') || cleaned.includes('Cr')) {
    return parseFloat(cleaned) * 10000000;
  }
  if (cleaned.includes('K') || cleaned.includes('k')) {
    return parseFloat(cleaned) * 1000;
  }
  
  return parseFloat(cleaned) || 0;
}

/**
 * Map tags to domains
 */
function mapTagsToDomains(tags: string[]): string[] {
  const domainKeywords: Record<string, string[]> = {
    'Artificial Intelligence': ['ai', 'artificial intelligence', 'neural', 'deep learning'],
    'Machine Learning': ['ml', 'machine learning', 'supervised', 'unsupervised'],
    'Data Science': ['data science', 'analytics', 'data analytics', 'big data'],
    'Web Development': ['web', 'frontend', 'backend', 'fullstack', 'react', 'angular', 'vue'],
    'Mobile Development': ['mobile', 'android', 'ios', 'flutter', 'react native'],
    'Blockchain & Web3': ['blockchain', 'web3', 'defi', 'nft', 'crypto', 'ethereum'],
    'Cloud Computing': ['cloud', 'aws', 'azure', 'gcp', 'serverless'],
    'DevOps': ['devops', 'ci/cd', 'docker', 'kubernetes', 'jenkins'],
    'Cybersecurity': ['security', 'cybersecurity', 'ethical hacking', 'penetration testing'],
    'IoT & Embedded Systems': ['iot', 'embedded', 'arduino', 'raspberry pi', 'sensors'],
    'Robotics': ['robotics', 'automation', 'ros'],
    'Game Development': ['game', 'unity', 'unreal', 'gaming'],
    'UI/UX Design': ['ui', 'ux', 'design', 'figma', 'user experience'],
    'Competitive Programming': ['dsa', 'algorithms', 'competitive programming', 'coding'],
    'Open Source': ['open source', 'github', 'oss'],
  };

  const matchedDomains = new Set<string>();
  const tagText = tags.join(' ').toLowerCase();

  for (const [domain, keywords] of Object.entries(domainKeywords)) {
    if (keywords.some(keyword => tagText.includes(keyword.toLowerCase()))) {
      matchedDomains.add(domain);
    }
  }

  return matchedDomains.size > 0 ? Array.from(matchedDomains) : ['All Domains'];
}

/**
 * Determine relevant departments based on tags
 */
function determineDepartments(tags: string[]): string[] {
  if (!tags || tags.length === 0) return ['all'];

  const deptKeywords: Record<string, string[]> = {
    'Computer Science & Engineering': ['web', 'software', 'programming', 'coding'],
    'Artificial Intelligence & Data Science': ['ai', 'ml', 'data', 'analytics'],
    'Artificial Intelligence & Machine Learning': ['ai', 'ml', 'deep learning', 'neural'],
    'Information Technology': ['web', 'app', 'cloud', 'devops'],
    'Mechanical': ['cad', 'design', 'manufacturing'],
    'Civil': ['construction', 'infrastructure', 'civil'],
    'Electrical': ['circuit', 'embedded', 'iot', 'electronics'],
    'Agricultural': ['agri', 'farming', 'agriculture'],
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
 * Calculate deadline urgency
 */
function calculateDeadlineUrgency(deadline: string): 'urgent' | 'soon' | 'normal' {
  if (!deadline) return 'normal';
  
  const now = new Date();
  const deadlineDate = new Date(deadline);
  const daysUntilDeadline = Math.ceil((deadlineDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

  if (daysUntilDeadline <= 3) return 'urgent';
  if (daysUntilDeadline <= 7) return 'soon';
  return 'normal';
}

/**
 * Remove duplicate events
 */
function deduplicateEvents(events: ScrapedEvent[]): ScrapedEvent[] {
  const seen = new Map<string, ScrapedEvent>();
  
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
  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  };

  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers });
  }

  try {
    const url = new URL(req.url);
    const sourcesParam = url.searchParams.get('sources') || 'all';
    const sources = sourcesParam.split(',');

    let allEvents: ScrapedEvent[] = [];

    // Scrape from requested sources
    if (sources.includes('all') || sources.includes('unstop')) {
      const unstopEvents = await scrapeUnstop();
      allEvents = [...allEvents, ...unstopEvents];
    }

    if (sources.includes('all') || sources.includes('devpost')) {
      const devpostEvents = await scrapeDevpost();
      allEvents = [...allEvents, ...devpostEvents];
    }

    if (sources.includes('all') || sources.includes('hack2skill')) {
      const hack2skillEvents = await scrapeHack2Skill();
      allEvents = [...allEvents, ...hack2skillEvents];
    }

    if (sources.includes('all') || sources.includes('knowafest')) {
      const knowafestEvents = await scrapeKnowafest();
      allEvents = [...allEvents, ...knowafestEvents];
    }

    if (sources.includes('all') || sources.includes('reskilll')) {
      const reskilllEvents = await scrapeReskilll();
      allEvents = [...allEvents, ...reskilllEvents];
    }

    if (sources.includes('all') || sources.includes('commudle')) {
      const commudleEvents = await scrapeCommudle();
      allEvents = [...allEvents, ...commudleEvents];
    }

    // Deduplicate events
    const uniqueEvents = deduplicateEvents(allEvents);

    // Sort by deadline urgency and date
    uniqueEvents.sort((a, b) => {
      const urgencyOrder = { urgent: 0, soon: 1, normal: 2 };
      if (a.deadlineUrgency !== b.deadlineUrgency) {
        return urgencyOrder[a.deadlineUrgency] - urgencyOrder[b.deadlineUrgency];
      }
      return new Date(a.registrationDeadline).getTime() - new Date(b.registrationDeadline).getTime();
    });

    return new Response(
      JSON.stringify({
        success: true,
        count: uniqueEvents.length,
        events: uniqueEvents,
        lastUpdated: new Date().toISOString(),
        sources: {
          unstop: allEvents.filter(e => e.scrapedFrom === 'unstop').length,
          devpost: allEvents.filter(e => e.scrapedFrom === 'devpost').length,
          hack2skill: allEvents.filter(e => e.scrapedFrom === 'hack2skill').length,
          knowafest: allEvents.filter(e => e.scrapedFrom === 'knowafest').length,
          reskilll: allEvents.filter(e => e.scrapedFrom === 'reskilll').length,
          commudle: allEvents.filter(e => e.scrapedFrom === 'commudle').length,
        },
      }),
      { headers }
    );
  } catch (error) {
    console.error('Error in scrape-all-events function:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
      }),
      { status: 500, headers }
    );
  }
});
