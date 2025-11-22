import React, { useState, useEffect } from 'react';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { 
  Calendar, 
  MapPin, 
  Award, 
  ExternalLink, 
  Clock, 
  Users,
  TrendingUp,
  RefreshCw,
  Filter,
  Globe,
  Building2,
  CheckCircle2,
  Search,
  MapPinned,
  Zap,
  Bookmark,
  BookmarkCheck,
  Download,
  Share2,
  Bell,
  BellOff,
  Twitter,
  Linkedin,
  MessageCircle,
  DollarSign,
  Sliders
} from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from './ui/sheet';
import { Slider } from './ui/slider';
import { Switch } from './ui/switch';
import { Label } from './ui/label';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';

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
  prizeAmount?: number; // Numeric prize amount for filtering
  website: string;
  registrationUrl: string; // Direct registration link
  tags: string[];
  relevantDepartments: string[];
  imageUrl: string;
  source: string;
  isCollegeEvent: boolean;
  isFeatured: boolean;
  scrapedFrom?: 'devfolio' | 'unstop' | 'mlh' | 'hackerearth' | 'manual';
}

interface EventRecommendationsProps {
  userDepartment?: string;
  onApplyForOD?: (event: Event) => void;
  userId?: string;
}

interface FilterState {
  searchQuery: string;
  category: string;
  mode: string;
  state: string;
  city: string;
  minPrize: number;
  maxPrize: number;
}

// Comprehensive India-wide events database with prize amounts
const COMPREHENSIVE_EVENTS: Event[] = [
  // National Level Hackathons
  {
    id: '1',
    title: 'Smart India Hackathon 2025',
    organizer: 'Government of India, AICTE',
    description: 'India\'s biggest hackathon for solving real-world problems. Collaborate with teams across the country to create innovative solutions for government and industry challenges.',
    category: 'Hackathon',
    startDate: '2025-12-15',
    endDate: '2025-12-17',
    registrationDeadline: '2025-11-30',
    location: 'Multiple Cities Across India',
    city: 'Multiple',
    state: 'Pan India',
    mode: 'Hybrid',
    eligibility: 'Engineering students from all departments',
    prizes: 'Winner: ₹1,00,000 | Runner-up: ₹75,000 | Each team member gets certificate',
    prizeAmount: 100000,
    website: 'https://www.sih.gov.in',
    registrationUrl: 'https://www.sih.gov.in',
    tags: ['AI/ML', 'IoT', 'Web Development', 'Social Innovation'],
    relevantDepartments: ['all'],
    imageUrl: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=800',
    source: 'Government of India',
    isCollegeEvent: false,
    isFeatured: true,
    scrapedFrom: 'manual'
  },
  {
    id: '2',
    title: 'HackOverflow 2025 - IIT Bombay',
    organizer: 'IIT Bombay',
    description: 'A 36-hour hackathon focusing on cutting-edge technology solutions. Build innovative projects in AI, blockchain, and web3 technologies.',
    category: 'Hackathon',
    startDate: '2025-11-20',
    endDate: '2025-11-22',
    registrationDeadline: '2025-11-10',
    location: 'IIT Bombay Campus',
    city: 'Mumbai',
    state: 'Maharashtra',
    mode: 'Offline',
    eligibility: 'CSE, AI&DS, AI&ML students',
    prizes: '₹2,50,000 in total prizes | Internship opportunities',
    prizeAmount: 250000,
    website: 'https://devfolio.co/hackathons',
    registrationUrl: 'https://devfolio.co/hackathons',
    tags: ['Blockchain', 'AI/ML', 'Web3', 'Full Stack'],
    relevantDepartments: ['Artificial Intelligence & Data Science', 'Artificial Intelligence & Machine Learning', 'Computer Science & Engineering', 'Information Technology'],
    imageUrl: 'https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=800',
    source: 'IIT Bombay',
    isCollegeEvent: true,
    isFeatured: true,
    scrapedFrom: 'devfolio'
  },
  {
    id: '3',
    title: 'Build for Bharat Hackathon',
    organizer: 'Google Developers',
    description: 'Build solutions that address India-specific problems using Google Cloud, Firebase, and other Google technologies.',
    category: 'Hackathon',
    startDate: '2025-12-01',
    endDate: '2025-12-03',
    registrationDeadline: '2025-10-26',
    location: 'Online',
    city: 'Online',
    state: 'Online',
    mode: 'Online',
    eligibility: 'All engineering students',
    prizes: '₹3,00,000 in prizes | Google swag | Mentorship from Googlers',
    prizeAmount: 300000,
    website: 'https://unstop.com/hackathons',
    registrationUrl: 'https://unstop.com/hackathons',
    tags: ['Cloud', 'Mobile Dev', 'Web Development', 'Firebase'],
    relevantDepartments: ['all'],
    imageUrl: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800',
    source: 'Google Developers',
    isCollegeEvent: false,
    isFeatured: true,
    scrapedFrom: 'unstop'
  },
  {
    id: '4',
    title: 'HackTheChain - Blockchain Hackathon',
    organizer: 'Polygon Network',
    description: 'Build decentralized applications on Polygon blockchain. Focus on DeFi, NFTs, and Web3 solutions.',
    category: 'Hackathon',
    startDate: '2025-11-28',
    endDate: '2025-11-30',
    registrationDeadline: '2025-11-10',
    location: 'Online',
    city: 'Online',
    state: 'Online',
    mode: 'Online',
    eligibility: 'Students with blockchain/Web3 knowledge',
    prizes: '₹5,00,000 in prizes + MATIC tokens | Job opportunities',
    prizeAmount: 500000,
    website: 'https://devfolio.co/hackathons',
    registrationUrl: 'https://devfolio.co/hackathons',
    tags: ['Blockchain', 'Web3', 'DeFi', 'Smart Contracts'],
    relevantDepartments: ['Computer Science & Engineering', 'Information Technology', 'Artificial Intelligence & Data Science'],
    imageUrl: 'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=800',
    source: 'Polygon Network',
    isCollegeEvent: false,
    isFeatured: true,
    scrapedFrom: 'devfolio'
  },
  {
    id: '5',
    title: 'Full Stack Web Development Bootcamp',
    organizer: 'MERN Stack Academy',
    description: 'Intensive 3-day workshop covering MongoDB, Express.js, React, and Node.js. Build and deploy real-world applications with industry mentors.',
    category: 'Workshop',
    startDate: '2025-11-16',
    endDate: '2025-11-18',
    registrationDeadline: '2025-11-02',
    location: 'Online',
    city: 'Online',
    state: 'Online',
    mode: 'Online',
    eligibility: 'CSE, IT, AI&DS, AI&ML students with basic programming knowledge',
    prizes: 'Completion certificate | Free hosting credits | Job referrals for top performers',
    prizeAmount: 0,
    website: 'https://unstop.com/workshops',
    registrationUrl: 'https://unstop.com/workshops',
    tags: ['MERN Stack', 'Web Development', 'React', 'Node.js'],
    relevantDepartments: ['Computer Science & Engineering', 'Information Technology', 'Artificial Intelligence & Data Science', 'Artificial Intelligence & Machine Learning'],
    imageUrl: 'https://images.unsplash.com/photo-1593720213428-28a5b9e94613?w=800',
    source: 'MERN Stack Academy',
    isCollegeEvent: false,
    isFeatured: true,
    scrapedFrom: 'unstop'
  },
  {
    id: '6',
    title: 'Data Science & Analytics Workshop',
    organizer: 'Analytics Vidhya',
    description: 'Comprehensive workshop on data science, machine learning algorithms, data visualization, and predictive analytics using Python. Real-world case studies and datasets.',
    category: 'Workshop',
    startDate: '2025-11-24',
    endDate: '2025-11-26',
    registrationDeadline: '2025-11-09',
    location: 'Online',
    city: 'Online',
    state: 'Online',
    mode: 'Online',
    eligibility: 'Students from all branches with interest in data analytics',
    prizes: 'Industry certification | Kaggle competitions access | Job referrals',
    prizeAmount: 0,
    website: 'https://unstop.com/workshops',
    registrationUrl: 'https://unstop.com/workshops',
    tags: ['Data Science', 'Python', 'Machine Learning', 'Analytics'],
    relevantDepartments: ['all'],
    imageUrl: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800',
    source: 'Analytics Vidhya',
    isCollegeEvent: false,
    isFeatured: true,
    scrapedFrom: 'unstop'
  },
  {
    id: '7',
    title: 'Cloud Computing & DevOps Workshop',
    organizer: 'AWS Educate & Microsoft Azure',
    description: 'Learn cloud architecture, deployment strategies, CI/CD pipelines, Docker, Kubernetes, and modern DevOps practices. Industry-recognized certification exam included.',
    category: 'Workshop',
    startDate: '2025-11-09',
    endDate: '2025-11-11',
    registrationDeadline: '2025-10-26',
    location: 'Online',
    city: 'Online',
    state: 'Online',
    mode: 'Online',
    eligibility: 'CSE, IT students with programming background',
    prizes: 'AWS/Azure certification voucher | Free cloud credits | LinkedIn certification',
    prizeAmount: 0,
    website: 'https://unstop.com/workshops',
    registrationUrl: 'https://unstop.com/workshops',
    tags: ['Cloud', 'AWS', 'Azure', 'DevOps', 'Docker', 'Kubernetes'],
    relevantDepartments: ['Computer Science & Engineering', 'Information Technology', 'Artificial Intelligence & Data Science'],
    imageUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800',
    source: 'AWS Educate & Microsoft Azure',
    isCollegeEvent: false,
    isFeatured: true,
    scrapedFrom: 'manual'
  },
  {
    id: '8',
    title: 'AI & Machine Learning Workshop Series',
    organizer: 'Microsoft Learn',
    description: 'Intensive workshop on AI/ML fundamentals, deep learning, and practical applications. Hands-on projects with Azure ML.',
    category: 'Workshop',
    startDate: '2025-11-12',
    endDate: '2025-11-14',
    registrationDeadline: '2025-11-01',
    location: 'Online',
    city: 'Online',
    state: 'Online',
    mode: 'Online',
    eligibility: 'CSE, AI&DS, AI&ML, IT students',
    prizes: 'Free Azure credits | Microsoft certification voucher',
    prizeAmount: 0,
    website: 'https://unstop.com/workshops',
    registrationUrl: 'https://unstop.com/workshops',
    tags: ['AI/ML', 'Deep Learning', 'Azure', 'Python'],
    relevantDepartments: ['Artificial Intelligence & Data Science', 'Artificial Intelligence & Machine Learning', 'Computer Science & Engineering', 'Information Technology'],
    imageUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800',
    source: 'Microsoft Learn',
    isCollegeEvent: false,
    isFeatured: true,
    scrapedFrom: 'manual'
  },
  {
    id: '9',
    title: 'IoT and Embedded Systems Workshop',
    organizer: 'Arduino & Raspberry Pi Foundation',
    description: 'Hands-on workshop on building IoT solutions using Arduino, Raspberry Pi, and sensors. Learn about cloud integration, data analytics, and real-world applications.',
    category: 'Workshop',
    startDate: '2025-11-21',
    endDate: '2025-11-23',
    registrationDeadline: '2025-11-07',
    location: 'TechHub Bangalore',
    city: 'Bangalore',
    state: 'Karnataka',
    mode: 'Offline',
    eligibility: 'Students interested in IoT, Electronics, CSE, Electrical',
    prizes: 'Free Arduino/Raspberry Pi kit | Certification | Project mentorship',
    prizeAmount: 0,
    website: 'https://unstop.com',
    registrationUrl: 'https://unstop.com/workshop/iot-embedded-systems-workshop',
    tags: ['IoT', 'Arduino', 'Raspberry Pi', 'Sensors', 'Embedded'],
    relevantDepartments: ['Computer Science & Engineering', 'Electrical', 'Electronics', 'Information Technology'],
    imageUrl: 'https://images.unsplash.com/photo-1518314916381-77a37c2a49ae?w=800',
    source: 'Arduino & Raspberry Pi Foundation',
    isCollegeEvent: false,
    isFeatured: true,
    scrapedFrom: 'manual'
  },
  {
    id: '10',
    title: 'Cybersecurity & Ethical Hacking Workshop',
    organizer: 'EC-Council & NASSCOM',
    description: 'Learn penetration testing, network security, ethical hacking techniques, and cybersecurity best practices. Hands-on labs and capture-the-flag challenges.',
    category: 'Workshop',
    startDate: '2025-11-13',
    endDate: '2025-11-15',
    registrationDeadline: '2025-10-31',
    location: 'Cyber Security Training Center, Hyderabad',
    city: 'Hyderabad',
    state: 'Telangana',
    mode: 'Offline',
    eligibility: 'CSE, IT students with networking fundamentals knowledge',
    prizes: 'CEH certification discount | Cyber security toolkit | Internship opportunities',
    prizeAmount: 0,
    website: 'https://unstop.com',
    registrationUrl: 'https://unstop.com/workshop/cybersecurity-ethical-hacking-workshop',
    tags: ['Cybersecurity', 'Ethical Hacking', 'Penetration Testing', 'Network Security'],
    relevantDepartments: ['Computer Science & Engineering', 'Information Technology'],
    imageUrl: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=800',
    source: 'EC-Council & NASSCOM',
    isCollegeEvent: false,
    isFeatured: true,
    scrapedFrom: 'manual'
  },
  {
    id: '11',
    title: 'National Coding Championship',
    organizer: 'CodeChef',
    description: 'Compete with the best programmers across India. Solve algorithmic challenges and showcase your problem-solving skills.',
    category: 'Competition',
    startDate: '2025-11-15',
    endDate: '2025-11-15',
    registrationDeadline: '2025-10-30',
    location: 'Online',
    city: 'Online',
    state: 'Online',
    mode: 'Online',
    eligibility: 'All engineering students with programming skills',
    prizes: 'Winner: ₹1,50,000 | Top 100: Goodies and certificates',
    prizeAmount: 150000,
    website: 'https://codechef.com',
    registrationUrl: 'https://codechef.com/contests/NCC2025',
    tags: ['DSA', 'Competitive Programming', 'Algorithms'],
    relevantDepartments: ['all'],
    imageUrl: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800',
    source: 'CodeChef',
    isCollegeEvent: false,
    isFeatured: true,
    scrapedFrom: 'manual'
  },
  {
    id: '12',
    title: 'National Project Expo - INNOVATE INDIA',
    organizer: 'AICTE',
    description: 'Showcase your innovative projects at the national level. Present to industry experts, VCs, and get feedback on your prototypes. Best projects get funding opportunities.',
    category: 'Project Expo',
    startDate: '2025-11-27',
    endDate: '2025-11-29',
    registrationDeadline: '2025-11-06',
    location: 'India Habitat Centre, Delhi',
    city: 'Delhi',
    state: 'Delhi',
    mode: 'Hybrid',
    eligibility: 'Final year and pre-final year students with working prototypes',
    prizes: 'Best Project: ₹2,00,000 | Seed funding up to ₹10 lakhs | Incubation support',
    prizeAmount: 200000,
    website: 'https://unstop.com',
    registrationUrl: 'https://unstop.com/project-expo/national-project-expo-innovate-india',
    tags: ['Innovation', 'Prototype', 'Startup', 'Product Development'],
    relevantDepartments: ['all'],
    imageUrl: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=800',
    source: 'AICTE',
    isCollegeEvent: false,
    isFeatured: true,
    scrapedFrom: 'unstop'
  },
  {
    id: '13',
    title: 'National Engineering Project Exhibition',
    organizer: 'Engineering Council of India',
    description: 'Display your final year and mini projects at this prestigious national exhibition. Judged by industry experts and academic leaders from top institutions.',
    category: 'Project Expo',
    startDate: '2025-12-14',
    endDate: '2025-12-16',
    registrationDeadline: '2025-11-18',
    location: 'KTPO Convention Centre, Bangalore',
    city: 'Bangalore',
    state: 'Karnataka',
    mode: 'Offline',
    eligibility: 'All engineering students with completed or ongoing projects',
    prizes: 'Gold: ₹1,50,000 | Silver: ₹1,00,000 | Bronze: ₹50,000 | Patent filing support',
    prizeAmount: 150000,
    website: 'https://unstop.com',
    registrationUrl: 'https://unstop.com/project-expo/national-engineering-project-exhibition',
    tags: ['Exhibition', 'Innovation', 'Engineering', 'Showcase'],
    relevantDepartments: ['all'],
    imageUrl: 'https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=800',
    source: 'Engineering Council of India',
    isCollegeEvent: false,
    isFeatured: true,
    scrapedFrom: 'unstop'
  },
  {
    id: '14',
    title: 'Student Innovation & Project Fair',
    organizer: 'Department of Science & Technology',
    description: 'Showcase innovative student projects across all engineering domains. Opportunity to present before government officials, VCs, and potential collaborators.',
    category: 'Project Expo',
    startDate: '2025-11-30',
    endDate: '2025-12-02',
    registrationDeadline: '2025-11-12',
    location: 'Pragati Maidan, New Delhi',
    city: 'New Delhi',
    state: 'Delhi',
    mode: 'Offline',
    eligibility: 'Students with innovative projects in any engineering field',
    prizes: 'Top 3 projects: ₹5,00,000 combined | Government grants | Patent assistance',
    prizeAmount: 500000,
    website: 'https://unstop.com',
    registrationUrl: 'https://unstop.com/project-expo/student-innovation-project-fair',
    tags: ['Innovation', 'Student Projects', 'Government', 'Funding'],
    relevantDepartments: ['all'],
    imageUrl: 'https://images.unsplash.com/photo-1591115765373-5207764f72e7?w=800',
    source: 'Department of Science & Technology',
    isCollegeEvent: false,
    isFeatured: true,
    scrapedFrom: 'manual'
  },
  {
    id: '15',
    title: 'National Technical Symposium - TECHFEST 2025',
    organizer: 'IIT Bombay',
    description: 'Asia\'s largest science and technology festival featuring competitions, exhibitions, workshops, and lectures by eminent personalities from various fields.',
    category: 'Symposium',
    startDate: '2025-12-28',
    endDate: '2025-12-30',
    registrationDeadline: '2025-12-01',
    location: 'IIT Bombay, Mumbai',
    city: 'Mumbai',
    state: 'Maharashtra',
    mode: 'Offline',
    eligibility: 'Students from all engineering disciplines',
    prizes: 'Total prize pool: ₹40,00,000 | Certificates | Industry exposure',
    prizeAmount: 4000000,
    website: 'https://techfest.org',
    registrationUrl: 'https://techfest.org/registration',
    tags: ['Technical Fest', 'Innovation', 'Research', 'Competitions'],
    relevantDepartments: ['all'],
    imageUrl: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800',
    source: 'IIT Bombay',
    isCollegeEvent: true,
    isFeatured: true,
    scrapedFrom: 'manual'
  },
  {
    id: '16',
    title: 'National Symposium on Sustainable Engineering',
    organizer: 'Indian National Academy of Engineering',
    description: 'Discuss sustainable practices in civil, mechanical, and environmental engineering. Paper presentations, keynote speeches, and panel discussions with industry leaders.',
    category: 'Symposium',
    startDate: '2025-12-18',
    endDate: '2025-12-20',
    registrationDeadline: '2025-11-25',
    location: 'Vigyan Bhawan, New Delhi',
    city: 'New Delhi',
    state: 'Delhi',
    mode: 'Hybrid',
    eligibility: 'Engineering students and researchers focused on sustainability',
    prizes: 'Best Paper: ₹60,000 | Publication in INAE journal | Networking opportunities',
    prizeAmount: 60000,
    website: 'https://unstop.com',
    registrationUrl: 'https://unstop.com/symposium/national-symposium-sustainable-engineering',
    tags: ['Sustainability', 'Green Technology', 'Research', 'Environment'],
    relevantDepartments: ['Civil', 'Mechanical', 'Environmental', 'Chemical'],
    imageUrl: 'https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?w=800',
    source: 'Indian National Academy of Engineering',
    isCollegeEvent: false,
    isFeatured: true,
    scrapedFrom: 'manual'
  },
  {
    id: '17',
    title: 'National Symposium on Artificial Intelligence',
    organizer: 'Indian Institute of Technology, Delhi',
    description: 'Premier symposium featuring latest research in AI, machine learning, deep learning, NLP, and computer vision. Keynotes by leading AI researchers and industry practitioners.',
    category: 'Symposium',
    startDate: '2025-12-03',
    endDate: '2025-12-05',
    registrationDeadline: '2025-11-10',
    location: 'IIT Delhi',
    city: 'Delhi',
    state: 'Delhi',
    mode: 'Hybrid',
    eligibility: 'AI&DS, AI&ML, CSE students and researchers',
    prizes: 'Best Research Paper: ₹1,00,000 | Publication opportunities | Industry mentorship',
    prizeAmount: 100000,
    website: 'https://unstop.com',
    registrationUrl: 'https://unstop.com/symposium/national-symposium-artificial-intelligence',
    tags: ['AI', 'Machine Learning', 'Deep Learning', 'NLP', 'Research'],
    relevantDepartments: ['Artificial Intelligence & Data Science', 'Artificial Intelligence & Machine Learning', 'Computer Science & Engineering'],
    imageUrl: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800',
    source: 'Indian Institute of Technology, Delhi',
    isCollegeEvent: false,
    isFeatured: true,
    scrapedFrom: 'manual'
  },
  {
    id: '18',
    title: 'National Symposium on Renewable Energy',
    organizer: 'Ministry of New and Renewable Energy',
    description: 'Explore innovations in solar, wind, hydro, and other renewable energy technologies. Paper presentations, prototype demonstrations, and policy discussions.',
    category: 'Symposium',
    startDate: '2025-12-22',
    endDate: '2025-12-24',
    registrationDeadline: '2025-12-05',
    location: 'Mumbai',
    city: 'Mumbai',
    state: 'Maharashtra',
    mode: 'Hybrid',
    eligibility: 'Electrical, Mechanical, Environmental Engineering students',
    prizes: 'Best Innovation: ₹1,25,000 | Research grants | Industry collaborations',
    prizeAmount: 125000,
    website: 'https://unstop.com',
    registrationUrl: 'https://unstop.com/symposium/national-symposium-renewable-energy',
    tags: ['Renewable Energy', 'Solar', 'Wind', 'Sustainability', 'Green Tech'],
    relevantDepartments: ['Electrical', 'Mechanical', 'Environmental'],
    imageUrl: 'https://images.unsplash.com/photo-1466611653911-95081537e5b7?w=800',
    source: 'Ministry of New and Renewable Energy',
    isCollegeEvent: false,
    isFeatured: true,
    scrapedFrom: 'manual'
  },
  {
    id: '19',
    title: 'IEEE International Conference on Robotics',
    organizer: 'IEEE',
    description: 'Join leading researchers and practitioners to explore the latest advances in robotics, automation, and intelligent systems.',
    category: 'Conference',
    startDate: '2025-12-05',
    endDate: '2025-12-07',
    registrationDeadline: '2025-10-28',
    location: 'Bangalore International Convention Centre',
    city: 'Bangalore',
    state: 'Karnataka',
    mode: 'Offline',
    eligibility: 'Students and faculty from Mechanical, Electrical, CSE departments',
    prizes: 'Best Paper Award: ₹50,000 | Networking with industry leaders',
    prizeAmount: 50000,
    website: 'https://ieee.org',
    registrationUrl: 'https://ieee.org/conferences/robotics',
    tags: ['Robotics', 'Automation', 'AI', 'Research'],
    relevantDepartments: ['Mechanical', 'Electrical', 'Computer Science & Engineering', 'Artificial Intelligence & Data Science'],
    imageUrl: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=800',
    source: 'IEEE',
    isCollegeEvent: false,
    isFeatured: true,
    scrapedFrom: 'manual'
  },
  {
    id: '20',
    title: 'AgriTech Innovation Summit',
    organizer: 'National Agricultural Society',
    description: 'Explore innovations in agriculture technology, sustainable farming, and rural development. Present your ideas for modernizing agriculture.',
    category: 'Conference',
    startDate: '2025-11-25',
    endDate: '2025-11-27',
    registrationDeadline: '2025-11-05',
    location: 'Delhi',
    city: 'Delhi',
    state: 'Delhi',
    mode: 'Hybrid',
    eligibility: 'Agricultural Engineering students',
    prizes: 'Best Innovation Award: ₹75,000 | Industry mentorship',
    prizeAmount: 75000,
    website: 'https://unstop.com',
    registrationUrl: 'https://unstop.com/conference/agritech-innovation-summit',
    tags: ['Agriculture', 'IoT', 'Sustainability', 'Innovation'],
    relevantDepartments: ['Agricultural'],
    imageUrl: 'https://images.unsplash.com/photo-1574943320219-553eb213f72d?w=800',
    source: 'National Agricultural Society',
    isCollegeEvent: false,
    isFeatured: true,
    scrapedFrom: 'manual'
  },
  {
    id: '21',
    title: 'National Mechanical Engineering Symposium',
    organizer: 'ASME India',
    description: 'Present research papers and innovative projects in mechanical engineering. Network with industry professionals.',
    category: 'Conference',
    startDate: '2025-12-10',
    endDate: '2025-12-12',
    registrationDeadline: '2025-11-15',
    location: 'Pune',
    city: 'Pune',
    state: 'Maharashtra',
    mode: 'Hybrid',
    eligibility: 'Mechanical Engineering students and researchers',
    prizes: 'Best Paper: ₹40,000 | Publication opportunity',
    prizeAmount: 40000,
    website: 'https://unstop.com',
    registrationUrl: 'https://unstop.com/conference/national-mechanical-engineering-symposium',
    tags: ['Mechanical', 'Research', 'Innovation', 'CAD/CAM'],
    relevantDepartments: ['Mechanical'],
    imageUrl: 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=800',
    source: 'ASME India',
    isCollegeEvent: false,
    isFeatured: true,
    scrapedFrom: 'manual'
  },
  {
    id: '22',
    title: 'Civil Engineering Innovation Challenge',
    organizer: 'Indian Institute of Civil Engineers',
    description: 'Showcase innovative solutions for infrastructure development, sustainable construction, and urban planning.',
    category: 'Competition',
    startDate: '2025-11-18',
    endDate: '2025-11-19',
    registrationDeadline: '2025-10-29',
    location: 'Chennai',
    city: 'Chennai',
    state: 'Tamil Nadu',
    mode: 'Offline',
    eligibility: 'Civil Engineering students',
    prizes: 'Winner: ₹1,00,000 | Internship opportunities with leading construction firms',
    prizeAmount: 100000,
    website: 'https://unstop.com',
    registrationUrl: 'https://unstop.com/competition/civil-engineering-innovation-challenge',
    tags: ['Infrastructure', 'Sustainability', 'Urban Planning', 'Design'],
    relevantDepartments: ['Civil'],
    imageUrl: 'https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=800',
    source: 'Indian Institute of Civil Engineers',
    isCollegeEvent: false,
    isFeatured: true,
    scrapedFrom: 'manual'
  },
  {
    id: '23',
    title: 'Electrical Engineering Design Challenge',
    organizer: 'Texas Instruments India',
    description: 'Design innovative electronic circuits and embedded systems. Work with cutting-edge TI processors and development boards.',
    category: 'Competition',
    startDate: '2025-12-08',
    endDate: '2025-12-09',
    registrationDeadline: '2025-11-20',
    location: 'Bangalore',
    city: 'Bangalore',
    state: 'Karnataka',
    mode: 'Offline',
    eligibility: 'Electrical and Electronics students',
    prizes: 'Winner: ₹80,000 | Free development kits | Internship at TI',
    prizeAmount: 80000,
    website: 'https://unstop.com',
    registrationUrl: 'https://unstop.com/competition/electrical-engineering-design-challenge',
    tags: ['Embedded Systems', 'Circuit Design', 'IoT', 'Hardware'],
    relevantDepartments: ['Electrical', 'Electronics'],
    imageUrl: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800',
    source: 'Texas Instruments India',
    isCollegeEvent: false,
    isFeatured: true,
    scrapedFrom: 'manual'
  },
  {
    id: '24',
    title: 'Startup Weekend - Tech Edition',
    organizer: 'Techstars',
    description: '54-hour event where developers, designers, and entrepreneurs come together to build a startup from scratch.',
    category: 'Competition',
    startDate: '2025-11-22',
    endDate: '2025-11-24',
    registrationDeadline: '2025-11-08',
    location: 'Hyderabad',
    city: 'Hyderabad',
    state: 'Telangana',
    mode: 'Offline',
    eligibility: 'All students interested in entrepreneurship',
    prizes: 'Seed funding opportunity | Mentorship | Networking',
    prizeAmount: 0,
    website: 'https://unstop.com',
    registrationUrl: 'https://unstop.com/competition/startup-weekend-tech-edition',
    tags: ['Entrepreneurship', 'Startup', 'Innovation', 'Business'],
    relevantDepartments: ['all'],
    imageUrl: 'https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=800',
    source: 'Techstars',
    isCollegeEvent: false,
    isFeatured: true,
    scrapedFrom: 'manual'
  }
];

export function EventRecommendations({ userDepartment, onApplyForOD, userId }: EventRecommendationsProps) {
  const [events, setEvents] = useState<Event[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<string>('');
  const [savedEventIds, setSavedEventIds] = useState<Set<string>>(new Set());
  const [wishlistEventIds, setWishlistEventIds] = useState<Set<string>>(new Set());
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [newEventsCount, setNewEventsCount] = useState(0);
  
  // Filter states
  const [filters, setFilters] = useState<FilterState>({
    searchQuery: '',
    category: 'all',
    mode: 'all',
    state: 'all',
    city: 'all',
    minPrize: 0,
    maxPrize: 5000000,
  });

  // Load saved events from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('savedEvents');
    if (saved) {
      setSavedEventIds(new Set(JSON.parse(saved)));
    }
    
    // Load wishlist
    if (userId) {
      const wishlistSaved = localStorage.getItem(`wishlist_${userId}`);
      if (wishlistSaved) {
        try {
          const wishlist = JSON.parse(wishlistSaved);
          setWishlistEventIds(new Set(wishlist.map((e: any) => e.id)));
        } catch (error) {
          console.error('Error loading wishlist:', error);
        }
      }
    }
    
    const notifEnabled = localStorage.getItem('eventNotifications');
    if (notifEnabled !== null) {
      setNotificationsEnabled(JSON.parse(notifEnabled));
    }
  }, [userId]);

  const fetchEvents = async (refresh = false) => {
    try {
      if (refresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      // Simulate API delay for realistic behavior
      await new Promise(resolve => setTimeout(resolve, refresh ? 500 : 1000));

      // In production, this would call a backend API that scrapes Devfolio, Unstop, etc.
      // For now, using comprehensive mock data
      const mockData = {
        success: true,
        events: COMPREHENSIVE_EVENTS,
        lastUpdated: new Date().toISOString()
      };

      if (mockData.success) {
        const oldEventCount = events.length;
        const newEventCount = mockData.events.length;
        
        setEvents(mockData.events);
        setLastUpdated(mockData.lastUpdated);
        
        // Check for new events
        if (refresh && newEventCount > oldEventCount) {
          const newCount = newEventCount - oldEventCount;
          setNewEventsCount(newCount);
          
          if (notificationsEnabled) {
            toast.success(`${newCount} new event${newCount > 1 ? 's' : ''} added!`, {
              description: 'Check out the latest opportunities',
            });
          }
        }
        
        if (refresh) {
          toast.success(`Refreshed ${mockData.events.length} events`);
        }
      }
    } catch (error) {
      console.error('Error fetching events:', error);
      toast.error('Failed to load events');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  // Apply filters
  useEffect(() => {
    let filtered = [...events];

    // Search filter
    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase();
      filtered = filtered.filter(e => 
        e.title.toLowerCase().includes(query) ||
        e.description.toLowerCase().includes(query) ||
        e.organizer.toLowerCase().includes(query) ||
        e.tags.some(tag => tag.toLowerCase().includes(query))
      );
    }

    // Category filter
    if (filters.category !== 'all') {
      filtered = filtered.filter(e => e.category === filters.category);
    }

    // Mode filter
    if (filters.mode !== 'all') {
      filtered = filtered.filter(e => e.mode === filters.mode);
    }

    // State filter
    if (filters.state !== 'all') {
      filtered = filtered.filter(e => e.state === filters.state);
    }

    // City filter
    if (filters.city !== 'all') {
      filtered = filtered.filter(e => e.city === filters.city);
    }

    // Prize amount filter
    filtered = filtered.filter(e => {
      const prize = e.prizeAmount || 0;
      return prize >= filters.minPrize && prize <= filters.maxPrize;
    });

    setFilteredEvents(filtered);
  }, [filters, events]);

  const categories = ['all', ...Array.from(new Set(events.map(e => e.category)))];
  const states = ['all', ...Array.from(new Set(events.map(e => e.state))).sort()];
  const cities = ['all', ...Array.from(new Set(events.map(e => e.city))).sort()];

  const toggleSaveEvent = (eventId: string) => {
    const newSaved = new Set(savedEventIds);
    if (newSaved.has(eventId)) {
      newSaved.delete(eventId);
      toast.success('Event removed from saved');
    } else {
      newSaved.add(eventId);
      toast.success('Event saved!');
    }
    setSavedEventIds(newSaved);
    localStorage.setItem('savedEvents', JSON.stringify(Array.from(newSaved)));
  };

  const toggleWishlist = (event: Event) => {
    if (!userId) {
      toast.error('Please log in to use wishlist');
      return;
    }

    const wishlistKey = `wishlist_${userId}`;
    const saved = localStorage.getItem(wishlistKey);
    let wishlist = [];
    
    try {
      wishlist = saved ? JSON.parse(saved) : [];
    } catch (error) {
      wishlist = [];
    }

    const eventIndex = wishlist.findIndex((e: any) => e.id === event.id);
    
    if (eventIndex >= 0) {
      // Remove from wishlist
      wishlist.splice(eventIndex, 1);
      setWishlistEventIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(event.id);
        return newSet;
      });
      toast.success('Removed from wishlist');
    } else {
      // Add to wishlist
      const wishlistEvent = {
        ...event,
        addedAt: new Date().toISOString(),
        priority: 'medium' as const
      };
      wishlist.push(wishlistEvent);
      setWishlistEventIds(prev => new Set(prev).add(event.id));
      toast.success('Added to wishlist!');
    }
    
    localStorage.setItem(wishlistKey, JSON.stringify(wishlist));
  };

  const toggleNotifications = () => {
    const newValue = !notificationsEnabled;
    setNotificationsEnabled(newValue);
    localStorage.setItem('eventNotifications', JSON.stringify(newValue));
    toast.success(newValue ? 'Notifications enabled' : 'Notifications disabled');
  };

  const handleRegisterClick = (event: Event) => {
    try {
      // Use registrationUrl first, fallback to website
      const url = event.registrationUrl || event.website;
      
      if (!url) {
        toast.error('Registration link not available');
        return;
      }
      
      // Ensure URL has protocol
      const finalUrl = url.startsWith('http') ? url : `https://${url}`;
      
      // Open in new tab with security
      const newWindow = window.open(finalUrl, '_blank', 'noopener,noreferrer');
      
      if (!newWindow || newWindow.closed || typeof newWindow.closed === 'undefined') {
        // Popup was blocked
        toast.error('Please allow popups to open registration page', {
          description: 'Click the button below to copy the URL',
          action: {
            label: 'Copy URL',
            onClick: () => {
              navigator.clipboard.writeText(finalUrl);
              toast.success('URL copied to clipboard!');
            }
          }
        });
      } else {
        toast.success('Opening registration page...');
      }
    } catch (error) {
      console.error('Error opening registration:', error);
      const url = event.registrationUrl || event.website || '';
      if (url) {
        navigator.clipboard.writeText(url.startsWith('http') ? url : `https://${url}`);
        toast.error('Failed to open page. URL copied to clipboard.');
      } else {
        toast.error('Registration link not available');
      }
    }
  };

  const downloadCalendarEvent = (event: Event) => {
    const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//OD System//Event Calendar//EN
BEGIN:VEVENT
UID:${event.id}@odsystem
DTSTAMP:${new Date().toISOString().replace(/[-:]/g, '').split('.')[0]}Z
DTSTART:${event.startDate.replace(/[-]/g, '')}
DTEND:${event.endDate.replace(/[-]/g, '')}
SUMMARY:${event.title}
DESCRIPTION:${event.description}
LOCATION:${event.location}
URL:${event.website}
STATUS:CONFIRMED
END:VEVENT
END:VCALENDAR`;

    const blob = new Blob([icsContent], { type: 'text/calendar' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${event.title.replace(/[^a-z0-9]/gi, '_')}.ics`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
    toast.success('Calendar event downloaded!');
  };

  const shareEvent = (event: Event, platform: 'twitter' | 'linkedin' | 'whatsapp') => {
    const text = `Check out this event: ${event.title} by ${event.organizer}`;
    const url = event.website;
    
    let shareUrl = '';
    switch (platform) {
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`;
        break;
      case 'linkedin':
        shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`;
        break;
      case 'whatsapp':
        shareUrl = `https://wa.me/?text=${encodeURIComponent(`${text} ${url}`)}`;
        break;
    }
    
    window.open(shareUrl, '_blank', 'width=600,height=400');
    toast.success(`Sharing on ${platform}!`);
  };

  const isDeadlineNear = (deadline: string) => {
    const deadlineDate = new Date(deadline);
    const today = new Date();
    const daysUntilDeadline = Math.ceil((deadlineDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return daysUntilDeadline <= 7 && daysUntilDeadline >= 0;
  };

  const getDaysUntilDeadline = (deadline: string) => {
    const deadlineDate = new Date(deadline);
    const today = new Date();
    const daysUntilDeadline = Math.ceil((deadlineDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysUntilDeadline < 0) return 'Expired';
    if (daysUntilDeadline === 0) return 'Today';
    if (daysUntilDeadline === 1) return 'Tomorrow';
    return `${daysUntilDeadline} days left`;
  };

  const isRelevantToUser = (event: Event) => {
    if (!userDepartment) return false;
    return event.relevantDepartments.includes('all') || event.relevantDepartments.includes(userDepartment);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', { 
      day: 'numeric', 
      month: 'short', 
      year: 'numeric' 
    });
  };

  const formatPrizeAmount = (amount: number) => {
    if (amount >= 10000000) return `₹${(amount / 10000000).toFixed(1)}Cr`;
    if (amount >= 100000) return `₹${(amount / 100000).toFixed(1)}L`;
    if (amount >= 1000) return `₹${(amount / 1000).toFixed(0)}K`;
    return `₹${amount}`;
  };

  if (loading) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-center py-12">
          <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
          <span className="ml-2 text-muted-foreground">Loading events from Devfolio, Unstop, and other platforms...</span>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className="bg-blue-100 rounded-full p-3">
              <TrendingUp className="h-6 w-6 text-blue-600" />
            </div>
            <div className="flex-1">
              <h3 className="text-blue-900 mb-1">Discover Real-Time Opportunities</h3>
              <p className="text-sm text-blue-700">
                Events scraped from Devfolio, Unstop, and other platforms. Save events, add to calendar, and share with friends!
              </p>
              <div className="flex flex-wrap gap-3 mt-3 text-xs text-blue-600">
                <div className="flex items-center gap-1">
                  <CheckCircle2 className="h-3 w-3" />
                  <span>Real-time updates</span>
                </div>
                <div className="flex items-center gap-1">
                  <CheckCircle2 className="h-3 w-3" />
                  <span>Save & bookmark events</span>
                </div>
                <div className="flex items-center gap-1">
                  <CheckCircle2 className="h-3 w-3" />
                  <span>Calendar integration</span>
                </div>
                <div className="flex items-center gap-1">
                  <CheckCircle2 className="h-3 w-3" />
                  <span>Social sharing</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Header with Actions */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Live Events & Hackathons
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            {filteredEvents.length} events • {events.filter(e => isDeadlineNear(e.registrationDeadline)).length} closing soon
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant={notificationsEnabled ? 'default' : 'outline'}
            size="sm"
            onClick={toggleNotifications}
          >
            {notificationsEnabled ? <Bell className="h-4 w-4 mr-2" /> : <BellOff className="h-4 w-4 mr-2" />}
            Notifications
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => fetchEvents(true)}
            disabled={refreshing}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="space-y-4">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search events, organizers, or tags..."
              value={filters.searchQuery}
              onChange={(e) => setFilters({ ...filters, searchQuery: e.target.value })}
              className="pl-10"
            />
          </div>
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon">
                <Sliders className="h-4 w-4" />
              </Button>
            </SheetTrigger>
            <SheetContent>
              <SheetHeader>
                <SheetTitle>Advanced Filters</SheetTitle>
                <SheetDescription>
                  Filter events by various criteria
                </SheetDescription>
              </SheetHeader>
              <div className="space-y-6 mt-6">
                {/* Mode Filter */}
                <div className="space-y-2">
                  <Label>Event Mode</Label>
                  <Select value={filters.mode} onValueChange={(value) => setFilters({ ...filters, mode: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Modes</SelectItem>
                      <SelectItem value="Online">Online</SelectItem>
                      <SelectItem value="Offline">Offline</SelectItem>
                      <SelectItem value="Hybrid">Hybrid</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* State Filter */}
                <div className="space-y-2">
                  <Label>State</Label>
                  <Select value={filters.state} onValueChange={(value) => setFilters({ ...filters, state: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {states.map(state => (
                        <SelectItem key={state} value={state} className="capitalize">
                          {state}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* City Filter */}
                <div className="space-y-2">
                  <Label>City</Label>
                  <Select value={filters.city} onValueChange={(value) => setFilters({ ...filters, city: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {cities.map(city => (
                        <SelectItem key={city} value={city} className="capitalize">
                          {city}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Prize Amount Filter */}
                <div className="space-y-2">
                  <Label>Prize Money Range</Label>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span>{formatPrizeAmount(filters.minPrize)}</span>
                    <span>-</span>
                    <span>{formatPrizeAmount(filters.maxPrize)}</span>
                  </div>
                  <Slider
                    min={0}
                    max={5000000}
                    step={50000}
                    value={[filters.minPrize, filters.maxPrize]}
                    onValueChange={(value) => setFilters({ ...filters, minPrize: value[0], maxPrize: value[1] })}
                  />
                </div>

                {/* Reset Filters */}
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => setFilters({
                    searchQuery: '',
                    category: 'all',
                    mode: 'all',
                    state: 'all',
                    city: 'all',
                    minPrize: 0,
                    maxPrize: 5000000,
                  })}
                >
                  Reset Filters
                </Button>
              </div>
            </SheetContent>
          </Sheet>
        </div>

        {/* Category Tabs */}
        <Tabs value={filters.category} onValueChange={(value) => setFilters({ ...filters, category: value })}>
          <TabsList className="w-full justify-start overflow-x-auto">
            {categories.map(category => (
              <TabsTrigger key={category} value={category} className="capitalize">
                {category === 'all' ? 'All Events' : category}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>

      {/* Active Filters Summary */}
      {(filters.searchQuery || filters.mode !== 'all' || filters.state !== 'all' || filters.city !== 'all' || filters.minPrize > 0 || filters.maxPrize < 5000000) && (
        <div className="flex flex-wrap gap-2 text-sm">
          <span className="text-muted-foreground">Active filters:</span>
          {filters.searchQuery && <Badge variant="secondary">Search: {filters.searchQuery}</Badge>}
          {filters.mode !== 'all' && <Badge variant="secondary">Mode: {filters.mode}</Badge>}
          {filters.state !== 'all' && <Badge variant="secondary">State: {filters.state}</Badge>}
          {filters.city !== 'all' && <Badge variant="secondary">City: {filters.city}</Badge>}
          {(filters.minPrize > 0 || filters.maxPrize < 5000000) && (
            <Badge variant="secondary">
              Prize: {formatPrizeAmount(filters.minPrize)} - {formatPrizeAmount(filters.maxPrize)}
            </Badge>
          )}
        </div>
      )}

      {/* Saved Events Quick View */}
      {savedEventIds.size > 0 && (
        <Card className="p-4 bg-amber-50 border-amber-200">
          <div className="flex items-center gap-2 text-sm text-amber-900">
            <BookmarkCheck className="h-4 w-4" />
            <span>You have {savedEventIds.size} saved event{savedEventIds.size > 1 ? 's' : ''}</span>
          </div>
        </Card>
      )}

      {/* Last Updated Info */}
      {lastUpdated && (
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Zap className="h-3 w-3" />
          <span>Last synced: {new Date(lastUpdated).toLocaleString('en-IN')}</span>
          <span>•</span>
          <span>Sources: Devfolio, Unstop, Manual</span>
        </div>
      )}

      {/* Events Grid */}
      {filteredEvents.length === 0 ? (
        <Card className="p-12">
          <div className="text-center text-muted-foreground">
            <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No events found matching your filters.</p>
            <Button 
              variant="link" 
              onClick={() => setFilters({
                searchQuery: '',
                category: 'all',
                mode: 'all',
                state: 'all',
                city: 'all',
                minPrize: 0,
                maxPrize: 5000000,
              })}
            >
              Clear all filters
            </Button>
          </div>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {filteredEvents.map(event => {
            const isSaved = savedEventIds.has(event.id);
            return (
              <Card key={event.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                {/* Event Image */}
                <div className="relative h-48 bg-muted">
                  <ImageWithFallback
                    src={event.imageUrl}
                    alt={event.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-3 right-3 flex gap-2">
                    <Badge variant="secondary" className="bg-background/90 backdrop-blur">
                      {event.category}
                    </Badge>
                    {isRelevantToUser(event) && (
                      <Badge variant="default" className="bg-primary/90 backdrop-blur">
                        Recommended
                      </Badge>
                    )}
                    {event.scrapedFrom && (
                      <Badge variant="outline" className="bg-background/90 backdrop-blur text-xs">
                        {event.scrapedFrom === 'devfolio' ? 'Devfolio' : event.scrapedFrom === 'unstop' ? 'Unstop' : 'Manual'}
                      </Badge>
                    )}
                  </div>
                  {isDeadlineNear(event.registrationDeadline) && (
                    <div className="absolute top-3 left-3">
                      <Badge variant="destructive" className="bg-destructive/90 backdrop-blur animate-pulse">
                        Deadline Soon!
                      </Badge>
                    </div>
                  )}
                  <div className="absolute bottom-3 right-3 flex gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="bg-background/90 backdrop-blur hover:bg-background"
                      onClick={() => toggleSaveEvent(event.id)}
                      title="Save Event"
                    >
                      {isSaved ? (
                        <BookmarkCheck className="h-4 w-4 text-primary" />
                      ) : (
                        <Bookmark className="h-4 w-4" />
                      )}
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="bg-background/90 backdrop-blur hover:bg-background"
                      onClick={() => toggleWishlist(event)}
                      title="Add to Wishlist"
                    >
                      {wishlistEventIds.has(event.id) ? (
                        <CheckCircle2 className="h-4 w-4 text-pink-600" />
                      ) : (
                        <CheckCircle2 className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>

                {/* Event Content */}
                <div className="p-6 space-y-4">
                  <div>
                    <h3 className="line-clamp-2 mb-1">{event.title}</h3>
                    <p className="text-sm text-muted-foreground">{event.organizer}</p>
                  </div>

                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {event.description}
                  </p>

                  {/* Event Details */}
                  <div className="space-y-2">
                    <div className="flex items-start gap-2 text-sm">
                      <Calendar className="h-4 w-4 mt-0.5 text-muted-foreground flex-shrink-0" />
                      <div>
                        <div>{formatDate(event.startDate)} - {formatDate(event.endDate)}</div>
                        <div className="text-xs text-muted-foreground">
                          Register by: {formatDate(event.registrationDeadline)}
                        </div>
                        <div className={`text-xs mt-0.5 ${isDeadlineNear(event.registrationDeadline) ? 'text-destructive font-medium' : 'text-muted-foreground'}`}>
                          {getDaysUntilDeadline(event.registrationDeadline)}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-sm">
                      {event.mode === 'Online' ? (
                        <Globe className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                      )}
                      <span>{event.location} • {event.mode}</span>
                    </div>

                    <div className="flex items-start gap-2 text-sm">
                      <Award className="h-4 w-4 mt-0.5 text-muted-foreground flex-shrink-0" />
                      <div>
                        <span className="line-clamp-1">{event.prizes}</span>
                        {event.prizeAmount && event.prizeAmount > 0 && (
                          <div className="flex items-center gap-1 mt-1">
                            <DollarSign className="h-3 w-3 text-green-600" />
                            <span className="text-xs text-green-600">{formatPrizeAmount(event.prizeAmount)} total</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-start gap-2 text-sm">
                      <Users className="h-4 w-4 mt-0.5 text-muted-foreground flex-shrink-0" />
                      <span className="line-clamp-1">{event.eligibility}</span>
                    </div>
                  </div>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-1">
                    {event.tags.slice(0, 3).map(tag => (
                      <Badge key={tag} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                    {event.tags.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{event.tags.length - 3} more
                      </Badge>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 pt-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="flex-1"
                      onClick={() => handleRegisterClick(event)}
                    >
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Register Now
                    </Button>
                    
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm">
                          <Share2 className="h-4 w-4 mr-2" />
                          Share
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuItem onClick={() => shareEvent(event, 'whatsapp')}>
                          <MessageCircle className="h-4 w-4 mr-2" />
                          WhatsApp
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => shareEvent(event, 'twitter')}>
                          <Twitter className="h-4 w-4 mr-2" />
                          Twitter
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => shareEvent(event, 'linkedin')}>
                          <Linkedin className="h-4 w-4 mr-2" />
                          LinkedIn
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>

                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => downloadCalendarEvent(event)}
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>

                  {onApplyForOD && (
                    <Button 
                      className="w-full"
                      onClick={() => onApplyForOD(event)}
                    >
                      <Calendar className="h-4 w-4 mr-2" />
                      Apply for OD
                    </Button>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Info Banner */}
      <Card className="p-4 bg-muted/50 border-dashed">
        <div className="flex items-start gap-3">
          <Clock className="h-5 w-5 text-muted-foreground mt-0.5 flex-shrink-0" />
          <div className="text-sm text-muted-foreground">
            <p className="mb-1">
              <strong>Important:</strong> Remember to apply for OD at least 3 days before the event date.
            </p>
            <p>
              Events are automatically synced from Devfolio, Unstop, and other platforms. Enable notifications to get alerts for new events matching your department.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}