import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import * as kv from "./kv_store.tsx";
const app = new Hono();

// Enable logger
app.use('*', logger(console.log));

// Enable CORS for all routes and methods
app.use(
  "/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
  }),
);

// Health check endpoint
app.get("/make-server-c2b0293c/health", (c) => {
  return c.json({ status: "ok" });
});

// Fetch hackathons and events from external sources
app.get("/make-server-c2b0293c/events/fetch", async (c) => {
  try {
    // Fetch from multiple sources - in production, you would use actual APIs
    // For now, we'll use a curated list and mock data
    
    const events = [
      {
        id: "evt_001",
        title: "Smart India Hackathon 2025",
        organizer: "Ministry of Education, Govt of India",
        description: "Largest hackathon in India for solving real-world problems across various domains including education, healthcare, agriculture, and smart cities.",
        category: "Hackathon",
        startDate: "2025-11-15",
        endDate: "2025-11-17",
        registrationDeadline: "2025-10-30",
        location: "Multiple Venues Nationwide",
        mode: "Offline",
        eligibility: "Engineering Students (Diploma/Undergraduate/Postgraduate)",
        prizes: "₹1,00,000 for winners",
        website: "https://www.sih.gov.in/",
        tags: ["Government", "National", "Multi-domain"],
        relevantDepartments: ["all"],
        imageUrl: "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=400"
      },
      {
        id: "evt_002",
        title: "IEEE YESIST12 Conference",
        organizer: "IEEE",
        description: "International conference for young engineers and scientists to present innovative ideas and research in science and technology.",
        category: "Conference",
        startDate: "2025-10-25",
        endDate: "2025-10-27",
        registrationDeadline: "2025-10-18",
        location: "IIT Delhi",
        mode: "Hybrid",
        eligibility: "Undergraduate/Postgraduate Students",
        prizes: "Best Paper Awards",
        website: "https://ieee.org/",
        tags: ["International", "Research", "IEEE"],
        relevantDepartments: ["Electronics & Communication Engineering", "Electrical & Electronics Engineering", "Computer Science & Engineering"],
        imageUrl: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=400"
      },
      {
        id: "evt_003",
        title: "MLH Fellowship 2025",
        organizer: "Major League Hacking",
        description: "12-week remote software engineering internship alternative where students contribute to Open Source projects.",
        category: "Fellowship",
        startDate: "2025-11-01",
        endDate: "2026-01-31",
        registrationDeadline: "2025-10-20",
        location: "Remote",
        mode: "Online",
        eligibility: "Students 18+ with programming experience",
        prizes: "Stipend + Certificate",
        website: "https://fellowship.mlh.io/",
        tags: ["Open Source", "Remote", "International"],
        relevantDepartments: ["Computer Science & Engineering", "Information Technology", "Artificial Intelligence & Data Science", "Artificial Intelligence & Machine Learning"],
        imageUrl: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=400"
      },
      {
        id: "evt_004",
        title: "Google Solution Challenge 2025",
        organizer: "Google Developers",
        description: "Build solutions for local community problems using Google technologies. Solve real-world challenges aligned with UN SDGs.",
        category: "Competition",
        startDate: "2025-10-20",
        endDate: "2025-12-15",
        registrationDeadline: "2025-10-15",
        location: "Global (Online)",
        mode: "Online",
        eligibility: "University Students",
        prizes: "$3,000 USD + Swag",
        website: "https://developers.google.com/community/gdsc-solution-challenge",
        tags: ["Google", "Global", "Social Impact"],
        relevantDepartments: ["Computer Science & Engineering", "Information Technology", "Artificial Intelligence & Data Science"],
        imageUrl: "https://images.unsplash.com/photo-1573164713714-d95e436ab8d6?w=400"
      },
      {
        id: "evt_005",
        title: "IIT Bombay TechFest",
        organizer: "IIT Bombay",
        description: "Asia's largest science and technology festival featuring competitions, exhibitions, workshops and guest lectures.",
        category: "Festival",
        startDate: "2025-12-20",
        endDate: "2025-12-22",
        registrationDeadline: "2025-11-30",
        location: "IIT Bombay, Mumbai",
        mode: "Offline",
        eligibility: "College Students",
        prizes: "Various prizes across competitions",
        website: "https://techfest.org/",
        tags: ["IIT", "Technical Festival", "Competitions"],
        relevantDepartments: ["all"],
        imageUrl: "https://images.unsplash.com/photo-1591115765373-5207764f72e7?w=400"
      },
      {
        id: "evt_006",
        title: "Microsoft Imagine Cup",
        organizer: "Microsoft",
        description: "Global competition for student developers to create innovative technology solutions.",
        category: "Competition",
        startDate: "2025-11-10",
        endDate: "2026-04-15",
        registrationDeadline: "2025-10-25",
        location: "Global (Online Qualifiers)",
        mode: "Hybrid",
        eligibility: "Students 16+ enrolled in academic institution",
        prizes: "$100,000 USD + Azure Credits",
        website: "https://imaginecup.microsoft.com/",
        tags: ["Microsoft", "Global", "Innovation"],
        relevantDepartments: ["Computer Science & Engineering", "Information Technology", "Artificial Intelligence & Data Science"],
        imageUrl: "https://images.unsplash.com/photo-1552664730-d307ca884978?w=400"
      },
      {
        id: "evt_007",
        title: "NPTEL Online Certification",
        organizer: "IIT/IISc through NPTEL",
        description: "Free online certification courses in various engineering and science subjects.",
        category: "Course",
        startDate: "2025-10-16",
        endDate: "2026-01-15",
        registrationDeadline: "2025-10-14",
        location: "Online",
        mode: "Online",
        eligibility: "Anyone interested",
        prizes: "Certificates (Top 5% - Elite, Top 25% - Successfully Completed)",
        website: "https://nptel.ac.in/",
        tags: ["IIT", "Online Learning", "Certification"],
        relevantDepartments: ["all"],
        imageUrl: "https://images.unsplash.com/photo-1501504905252-473c47e087f8?w=400"
      },
      {
        id: "evt_008",
        title: "ACM ICPC Asia Regionals",
        organizer: "ACM ICPC",
        description: "Prestigious programming competition for university students. Teams of three compete to solve complex algorithmic problems.",
        category: "Competition",
        startDate: "2025-12-01",
        endDate: "2025-12-03",
        registrationDeadline: "2025-10-31",
        location: "Amritapuri, India",
        mode: "Offline",
        eligibility: "University Students (max 3 per team)",
        prizes: "World Finals Qualification + Prizes",
        website: "https://icpc.global/",
        tags: ["Programming", "ACM", "Competitive"],
        relevantDepartments: ["Computer Science & Engineering", "Information Technology", "Artificial Intelligence & Data Science"],
        imageUrl: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=400"
      },
      {
        id: "evt_009",
        title: "ISRO Robotics Challenge",
        organizer: "ISRO",
        description: "National level robotics competition organized by Indian Space Research Organisation.",
        category: "Competition",
        startDate: "2025-11-20",
        endDate: "2025-11-22",
        registrationDeadline: "2025-10-30",
        location: "ISRO Headquarters, Bangalore",
        mode: "Offline",
        eligibility: "Engineering Students",
        prizes: "₹2,00,000 for winners",
        website: "https://www.isro.gov.in/",
        tags: ["Robotics", "Space", "National"],
        relevantDepartments: ["Electronics & Communication Engineering", "Mechanical Engineering", "Electrical & Electronics Engineering"],
        imageUrl: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=400"
      },
      {
        id: "evt_010",
        title: "AWS DeepRacer Student League",
        organizer: "Amazon Web Services",
        description: "Global autonomous racing league where students build and train ML models to race autonomous cars.",
        category: "Competition",
        startDate: "2025-10-18",
        endDate: "2025-12-31",
        registrationDeadline: "2025-10-15",
        location: "Online",
        mode: "Online",
        eligibility: "Students 16+",
        prizes: "$20,000 in AWS Credits + Scholarships",
        website: "https://aws.amazon.com/deepracer/student/",
        tags: ["AI/ML", "AWS", "Autonomous Systems"],
        relevantDepartments: ["Artificial Intelligence & Data Science", "Artificial Intelligence & Machine Learning", "Computer Science & Engineering"],
        imageUrl: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400"
      }
    ];

    // Store in KV store with timestamp
    await kv.set("events:latest", {
      events,
      lastUpdated: new Date().toISOString(),
      source: "curated"
    });

    return c.json({
      success: true,
      count: events.length,
      events,
      lastUpdated: new Date().toISOString()
    });
  } catch (error) {
    console.error("Error fetching events:", error);
    return c.json({
      success: false,
      error: "Failed to fetch events",
      details: error.message
    }, 500);
  }
});

// Get cached events
app.get("/make-server-c2b0293c/events", async (c) => {
  try {
    const department = c.req.query("department");
    const category = c.req.query("category");
    
    // Get from cache
    const cachedData = await kv.get("events:latest");
    
    if (!cachedData) {
      // If no cache, fetch fresh data
      const fetchResponse = await fetch(`${c.req.url.split('/events')[0]}/events/fetch`);
      const freshData = await fetchResponse.json();
      
      return c.json({
        success: true,
        events: freshData.events || [],
        lastUpdated: freshData.lastUpdated,
        cached: false
      });
    }

    let events = cachedData.events || [];

    // Filter by department if specified
    if (department && department !== "all") {
      events = events.filter(event => 
        event.relevantDepartments.includes("all") || 
        event.relevantDepartments.includes(department)
      );
    }

    // Filter by category if specified
    if (category) {
      events = events.filter(event => event.category === category);
    }

    return c.json({
      success: true,
      events,
      lastUpdated: cachedData.lastUpdated,
      cached: true
    });
  } catch (error) {
    console.error("Error getting events:", error);
    return c.json({
      success: false,
      error: "Failed to get events",
      details: error.message
    }, 500);
  }
});

// Get single event details
app.get("/make-server-c2b0293c/events/:id", async (c) => {
  try {
    const eventId = c.req.param("id");
    const cachedData = await kv.get("events:latest");
    
    if (!cachedData) {
      return c.json({
        success: false,
        error: "No events found"
      }, 404);
    }

    const event = cachedData.events.find(e => e.id === eventId);
    
    if (!event) {
      return c.json({
        success: false,
        error: "Event not found"
      }, 404);
    }

    return c.json({
      success: true,
      event
    });
  } catch (error) {
    console.error("Error getting event:", error);
    return c.json({
      success: false,
      error: "Failed to get event",
      details: error.message
    }, 500);
  }
});

Deno.serve(app.fetch);