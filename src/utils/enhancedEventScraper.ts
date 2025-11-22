// Enhanced Event Scraper for Multiple Platforms
// This module provides scraping logic for all major event platforms

export interface ScrapedEvent {
  id: string;
  title: string;
  organizer: string;
  description: string;
  category: 'Hackathon' | 'Workshop' | 'Competition' | 'Project Expo' | 'Symposium' | 'Conference' | 'All Events';
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
  domains: string[]; // AI, ML, Data Science, Web Dev, etc.
  relevantDepartments: string[];
  imageUrl: string;
  source: string;
  scrapedFrom: string;
  deadlineUrgency: 'urgent' | 'soon' | 'normal'; // Days until deadline
  isVerified: boolean;
  participantCount?: number;
}

// Domain categories for filtering
export const EVENT_DOMAINS = [
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
] as const;

/**
 * Calculate deadline urgency based on days remaining
 */
export function calculateDeadlineUrgency(deadline: string): 'urgent' | 'soon' | 'normal' {
  const now = new Date();
  const deadlineDate = new Date(deadline);
  const daysUntilDeadline = Math.ceil((deadlineDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

  if (daysUntilDeadline <= 3) return 'urgent';
  if (daysUntilDeadline <= 7) return 'soon';
  return 'normal';
}

/**
 * Calculate days until deadline
 */
export function getDaysUntilDeadline(deadline: string): number {
  const now = new Date();
  const deadlineDate = new Date(deadline);
  return Math.ceil((deadlineDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}

/**
 * Map tags to domains
 */
export function mapTagsToDomains(tags: string[]): string[] {
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
 * Platform-specific scraper configurations
 */
export const SCRAPER_CONFIGS = {
  unstop: {
    name: 'Unstop',
    apiUrl: 'https://unstop.com/api/public/opportunity/search-result',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'User-Agent': 'Mozilla/5.0 (compatible; EventScraper/1.0)',
    },
  },
  devpost: {
    name: 'Devpost',
    websiteUrl: 'https://devpost.com/hackathons',
    selectors: {
      eventCard: '.challenge-listing',
      title: 'h2 a',
      deadline: '.submission-period',
      prize: '.prize-amount',
      tags: '.tag',
    },
  },
  hack2skill: {
    name: 'Hack2Skill',
    websiteUrl: 'https://hack2skill.com/competitions',
    apiUrl: 'https://hack2skill.com/api/competitions',
  },
  knowafest: {
    name: 'Knowafest',
    websiteUrl: 'https://knowafest.com/explore',
    selectors: {
      eventCard: '.event-card',
      title: '.event-title',
      date: '.event-date',
      location: '.event-location',
    },
  },
  reskilll: {
    name: 'Reskilll',
    websiteUrl: 'https://reskilll.com/events',
    apiUrl: 'https://reskilll.com/api/events',
  },
  studentcompetitions: {
    name: 'StudentCompetitions.com',
    websiteUrl: 'https://www.studentcompetitions.com/competitions',
  },
  openhackathons: {
    name: 'OpenHackathons.org',
    websiteUrl: 'https://openhackathons.org/s/events',
  },
  hackathonsio: {
    name: 'Hackathons.io',
    websiteUrl: 'https://hackathons.io/',
  },
  commudle: {
    name: 'Commudle',
    websiteUrl: 'https://www.commudle.com/events',
    apiUrl: 'https://www.commudle.com/api/v1/events',
  },
  placementpreparation: {
    name: 'PlacementPreparation.io',
    websiteUrl: 'https://placementpreparation.io/events',
  },
  whereuelevate: {
    name: 'WhereUElevate',
    websiteUrl: 'https://whereuelevate.com/events',
  },
  airmeet: {
    name: 'Airmeet',
    websiteUrl: 'https://www.airmeet.com/hub/hackathons-of-india/',
  },
  chennaisymposium: {
    name: 'Chennai Symposium',
    websiteUrl: 'https://www.chennaisymposium.com/',
  },
};

/**
 * Fetch events from scraping API
 * This calls the Supabase Edge Function that does the actual scraping
 */
export async function fetchScrapedEvents(
  sources: string[] = ['all'],
  domain?: string
): Promise<ScrapedEvent[]> {
  try {
    const sourceParam = sources.join(',');
    const response = await fetch(`/api/scrape-events?sources=${sourceParam}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      console.error('Failed to fetch scraped events');
      return getMockEvents();
    }

    const data = await response.json();
    let events: ScrapedEvent[] = data.events || [];

    // Filter by domain if specified
    if (domain && domain !== 'All Domains') {
      events = events.filter(event =>
        event.domains.includes(domain) || event.domains.includes('All Domains')
      );
    }

    // Calculate deadline urgency for each event
    events = events.map(event => ({
      ...event,
      deadlineUrgency: calculateDeadlineUrgency(event.registrationDeadline),
    }));

    // Sort by deadline urgency (urgent first, then by date)
    events.sort((a, b) => {
      const urgencyOrder = { urgent: 0, soon: 1, normal: 2 };
      if (a.deadlineUrgency !== b.deadlineUrgency) {
        return urgencyOrder[a.deadlineUrgency] - urgencyOrder[b.deadlineUrgency];
      }
      return new Date(a.registrationDeadline).getTime() - new Date(b.registrationDeadline).getTime();
    });

    return events;
  } catch (error) {
    console.error('Error fetching scraped events:', error);
    return getMockEvents();
  }
}

/**
 * Filter events by domain
 */
export function filterEventsByDomain(events: ScrapedEvent[], domain: string): ScrapedEvent[] {
  if (domain === 'All Domains') return events;
  
  return events.filter(event =>
    event.domains.includes(domain) || event.domains.includes('All Domains')
  );
}

/**
 * Filter events by category
 */
export function filterEventsByCategory(
  events: ScrapedEvent[],
  category: string
): ScrapedEvent[] {
  if (category === 'All Events') return events;
  return events.filter(event => event.category === category);
}

/**
 * Search events by query
 */
export function searchEvents(events: ScrapedEvent[], query: string): ScrapedEvent[] {
  if (!query) return events;
  
  const lowerQuery = query.toLowerCase();
  return events.filter(event =>
    event.title.toLowerCase().includes(lowerQuery) ||
    event.description.toLowerCase().includes(lowerQuery) ||
    event.organizer.toLowerCase().includes(lowerQuery) ||
    event.tags.some(tag => tag.toLowerCase().includes(lowerQuery))
  );
}

/**
 * Mock events for testing (will be replaced by actual scraped data)
 * Using real, working URLs from actual event platforms
 */
export function getMockEvents(): ScrapedEvent[] {
  return [
    {
      id: 'mock-1',
      title: 'Smart India Hackathon 2024',
      organizer: 'Government of India, AICTE',
      description: 'Nation\'s biggest hackathon providing students with a platform to solve some of the pressing problems we face in our daily lives.',
      category: 'Hackathon',
      startDate: '2025-12-15',
      endDate: '2025-12-17',
      registrationDeadline: '2025-11-30',
      location: 'Multiple Cities',
      city: 'Multiple',
      state: 'Pan India',
      mode: 'Hybrid',
      eligibility: 'All engineering students',
      prizes: 'Winner: ₹1,00,000 per team | Total prize pool: ₹1 Crore+',
      prizeAmount: 100000,
      website: 'https://www.sih.gov.in',
      registrationUrl: 'https://www.sih.gov.in', // Official SIH website
      tags: ['AI', 'IoT', 'Blockchain', 'AR/VR', 'Innovation'],
      domains: ['Artificial Intelligence', 'Machine Learning', 'IoT & Embedded Systems'],
      relevantDepartments: ['all'],
      imageUrl: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=800',
      source: 'Government of India',
      scrapedFrom: 'unstop',
      deadlineUrgency: 'normal',
      isVerified: true,
      participantCount: 50000,
    },
    {
      id: 'mock-2',
      title: 'HackWithInfy 2024',
      organizer: 'Infosys',
      description: 'Code your way to a career at Infosys. Compete in this national-level coding competition and win exciting prizes.',
      category: 'Competition',
      startDate: '2025-11-20',
      endDate: '2025-11-22',
      registrationDeadline: '2025-10-25',
      location: 'Online',
      city: 'Online',
      state: 'Online',
      mode: 'Online',
      eligibility: 'Students graduating in 2025 and 2026',
      prizes: 'Pre-Placement Offers + Cash prizes worth ₹3 Lakhs',
      prizeAmount: 300000,
      website: 'https://www.infosys.com/careers/hackwithinfy.html',
      registrationUrl: 'https://www.infosys.com/careers/hackwithinfy.html', // Official Infosys HackWithInfy page
      tags: ['Coding', 'DSA', 'Competitive Programming', 'Java', 'Python'],
      domains: ['Competitive Programming', 'Web Development'],
      relevantDepartments: ['Computer Science & Engineering', 'Information Technology'],
      imageUrl: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800',
      source: 'Infosys',
      scrapedFrom: 'unstop',
      deadlineUrgency: 'urgent',
      isVerified: true,
      participantCount: 15000,
    },
    {
      id: 'mock-3',
      title: 'Google Cloud Ready Facilitator Program',
      organizer: 'Google Cloud',
      description: 'Learn Google Cloud Platform through hands-on labs and skill badges. Complete quests and earn Google Cloud swag.',
      category: 'Workshop',
      startDate: '2025-11-01',
      endDate: '2025-12-31',
      registrationDeadline: '2025-10-30',
      location: 'Online',
      city: 'Online',
      state: 'Online',
      mode: 'Online',
      eligibility: 'All students interested in cloud computing',
      prizes: 'Google Cloud certifications + Swag + Skill badges',
      prizeAmount: 0,
      website: 'https://cloud.google.com',
      registrationUrl: 'https://cloud.google.com/innovators', // Google Cloud Innovators program
      tags: ['Cloud', 'GCP', 'DevOps', 'Kubernetes', 'Docker'],
      domains: ['Cloud Computing', 'DevOps'],
      relevantDepartments: ['Computer Science & Engineering', 'Information Technology'],
      imageUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800',
      source: 'Google Cloud',
      scrapedFrom: 'unstop',
      deadlineUrgency: 'soon',
      isVerified: true,
      participantCount: 5000,
    },
    {
      id: 'mock-4',
      title: 'Unstop Hackathons',
      organizer: 'Unstop',
      description: 'Browse and participate in hundreds of hackathons, coding competitions, and tech challenges from top companies.',
      category: 'Hackathon',
      startDate: '2025-11-01',
      endDate: '2025-12-31',
      registrationDeadline: '2025-10-31',
      location: 'Online & Offline',
      city: 'Multiple',
      state: 'Pan India',
      mode: 'Hybrid',
      eligibility: 'All students and working professionals',
      prizes: 'Varies by hackathon - up to ₹10 Lakhs',
      prizeAmount: 1000000,
      website: 'https://unstop.com',
      registrationUrl: 'https://unstop.com/hackathons', // Unstop hackathons listing
      tags: ['Hackathon', 'Coding', 'Innovation', 'Startup'],
      domains: ['All Domains'],
      relevantDepartments: ['all'],
      imageUrl: 'https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=800',
      source: 'Unstop',
      scrapedFrom: 'unstop',
      deadlineUrgency: 'soon',
      isVerified: true,
      participantCount: 100000,
    },
    {
      id: 'mock-5',
      title: 'Devpost Hackathons',
      organizer: 'Devpost',
      description: 'Join thousands of developers worldwide in online and in-person hackathons. Build projects, win prizes, and showcase your skills.',
      category: 'Hackathon',
      startDate: '2025-11-01',
      endDate: '2025-12-31',
      registrationDeadline: '2025-10-30',
      location: 'Global',
      city: 'Online',
      state: 'Global',
      mode: 'Online',
      eligibility: 'Open to all developers and students worldwide',
      prizes: 'Varies by hackathon - Cash prizes + Swag + Job opportunities',
      prizeAmount: 500000,
      website: 'https://devpost.com',
      registrationUrl: 'https://devpost.com/hackathons', // Devpost hackathons listing
      tags: ['Web Development', 'Mobile', 'AI', 'Blockchain'],
      domains: ['Web Development', 'Mobile Development', 'Artificial Intelligence'],
      relevantDepartments: ['all'],
      imageUrl: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800',
      source: 'Devpost',
      scrapedFrom: 'devpost',
      deadlineUrgency: 'soon',
      isVerified: true,
      participantCount: 250000,
    },
    {
      id: 'mock-6',
      title: 'CodeChef Competitions',
      organizer: 'CodeChef',
      description: 'Participate in programming contests, improve your coding skills, and compete with programmers from around the world.',
      category: 'Competition',
      startDate: '2025-11-01',
      endDate: '2025-11-30',
      registrationDeadline: '2025-10-28',
      location: 'Online',
      city: 'Online',
      state: 'Online',
      mode: 'Online',
      eligibility: 'All students and programmers',
      prizes: 'Cash prizes + CodeChef goodies + Certificates',
      prizeAmount: 150000,
      website: 'https://www.codechef.com',
      registrationUrl: 'https://www.codechef.com/contests', // CodeChef contests page
      tags: ['Competitive Programming', 'DSA', 'Algorithms', 'C++', 'Python'],
      domains: ['Competitive Programming'],
      relevantDepartments: ['all'],
      imageUrl: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800',
      source: 'CodeChef',
      scrapedFrom: 'hack2skill',
      deadlineUrgency: 'urgent',
      isVerified: true,
      participantCount: 30000,
    },
    {
      id: 'mock-7',
      title: 'MLH (Major League Hacking) Events',
      organizer: 'Major League Hacking',
      description: 'Official student hackathon league. Participate in MLH-sanctioned hackathons and join the global hacker community.',
      category: 'Hackathon',
      startDate: '2025-11-01',
      endDate: '2025-12-31',
      registrationDeadline: '2025-10-30',
      location: 'Global',
      city: 'Multiple',
      state: 'Global',
      mode: 'Hybrid',
      eligibility: 'University students worldwide',
      prizes: 'Varies - MLH swag + Prizes + Mentorship',
      prizeAmount: 0,
      website: 'https://mlh.io',
      registrationUrl: 'https://mlh.io/seasons/2025/events', // MLH 2025 season events
      tags: ['Hackathon', 'Community', 'Learning', 'Networking'],
      domains: ['All Domains'],
      relevantDepartments: ['all'],
      imageUrl: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800',
      source: 'Major League Hacking',
      scrapedFrom: 'mlh',
      deadlineUrgency: 'soon',
      isVerified: true,
      participantCount: 150000,
    },
    {
      id: 'mock-8',
      title: 'HackerEarth Challenges',
      organizer: 'HackerEarth',
      description: 'Solve coding challenges, compete in programming contests, and get hired by top tech companies.',
      category: 'Competition',
      startDate: '2025-11-15',
      endDate: '2025-11-15',
      registrationDeadline: '2025-11-10',
      location: 'Online',
      city: 'Online',
      state: 'Online',
      mode: 'Online',
      eligibility: 'All programmers and students',
      prizes: 'Cash prizes up to ₹2 Lakhs + Job opportunities',
      prizeAmount: 200000,
      website: 'https://www.hackerearth.com',
      registrationUrl: 'https://www.hackerearth.com/challenges/', // HackerEarth challenges
      tags: ['Coding', 'Algorithms', 'Data Structures', 'Problem Solving'],
      domains: ['Competitive Programming'],
      relevantDepartments: ['all'],
      imageUrl: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800',
      source: 'HackerEarth',
      scrapedFrom: 'hackerearth',
      deadlineUrgency: 'normal',
      isVerified: true,
      participantCount: 25000,
    },
  ];
}

/**
 * Export event details as downloadable file
 */
export function downloadEventDetails(event: ScrapedEvent): void {
  const details = `
Event Details
=============

Title: ${event.title}
Organizer: ${event.organizer}
Category: ${event.category}

Description:
${event.description}

Event Dates:
Start: ${new Date(event.startDate).toLocaleDateString('en-IN', { dateStyle: 'full' })}
End: ${new Date(event.endDate).toLocaleDateString('en-IN', { dateStyle: 'full' })}
Registration Deadline: ${new Date(event.registrationDeadline).toLocaleDateString('en-IN', { dateStyle: 'full' })}

Location: ${event.location}
Mode: ${event.mode}

Eligibility: ${event.eligibility}
Prizes: ${event.prizes}

Registration Link: ${event.registrationUrl}
Website: ${event.website}

Domains: ${event.domains.join(', ')}
Tags: ${event.tags.join(', ')}

Source: ${event.source}
Scraped From: ${event.scrapedFrom}
  `.trim();

  const blob = new Blob([details], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${event.title.replace(/[^a-z0-9]/gi, '_')}_details.txt`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Share event on social media
 */
export function shareEvent(event: ScrapedEvent, platform: 'twitter' | 'linkedin' | 'whatsapp'): void {
  const text = `Check out this amazing event: ${event.title}\nOrganized by ${event.organizer}\nRegister now: ${event.registrationUrl}`;
  const encodedText = encodeURIComponent(text);
  const encodedUrl = encodeURIComponent(event.registrationUrl);

  const urls = {
    twitter: `https://twitter.com/intent/tweet?text=${encodedText}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
    whatsapp: `https://wa.me/?text=${encodedText}`,
  };

  window.open(urls[platform], '_blank', 'width=600,height=400');
}
