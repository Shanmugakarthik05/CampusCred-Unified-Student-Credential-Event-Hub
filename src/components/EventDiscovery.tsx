import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { 
  Calendar, 
  MapPin, 
  Award, 
  ExternalLink, 
  Clock, 
  Search,
  Download,
  Share2,
  Filter,
  RefreshCw,
  AlertTriangle,
  TrendingUp,
  Users,
  Zap,
  ChevronDown,
  X,
  Sparkles,
} from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { ImageWithFallback } from './figma/ImageWithFallback';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import {
  ScrapedEvent,
  EVENT_DOMAINS,
  fetchScrapedEvents,
  getMockEvents,
  filterEventsByDomain,
  filterEventsByCategory,
  searchEvents,
  getDaysUntilDeadline,
  downloadEventDetails,
  shareEvent,
} from '../utils/enhancedEventScraper';

interface EventDiscoveryProps {
  userDepartment?: string;
  onApplyForOD?: (event: ScrapedEvent) => void;
}

const EVENT_CATEGORIES = [
  'All Events',
  'Hackathon',
  'Workshop',
  'Competition',
  'Project Expo',
  'Symposium',
  'Conference',
] as const;

const EVENT_SOURCES = [
  { value: 'all', label: 'All Platforms' },
  { value: 'unstop', label: 'Unstop' },
  { value: 'devpost', label: 'Devpost' },
  { value: 'hack2skill', label: 'Hack2Skill' },
  { value: 'knowafest', label: 'Knowafest' },
  { value: 'reskilll', label: 'Reskilll' },
  { value: 'commudle', label: 'Commudle' },
] as const;

export function EventDiscovery({ userDepartment, onApplyForOD }: EventDiscoveryProps) {
  const [events, setEvents] = useState<ScrapedEvent[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<ScrapedEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDomain, setSelectedDomain] = useState<string>('All Domains');
  const [selectedCategory, setSelectedCategory] = useState<string>('All Events');
  const [selectedMode, setSelectedMode] = useState<string>('all');
  const [selectedSource, setSelectedSource] = useState<string>('all');
  const [showFilters, setShowFilters] = useState(false);

  // Load events on mount
  useEffect(() => {
    loadEvents();
  }, []);

  // Apply filters whenever they change
  useEffect(() => {
    applyFilters();
  }, [events, searchQuery, selectedDomain, selectedCategory, selectedMode, selectedSource]);

  const loadEvents = async () => {
    setLoading(true);
    try {
      // In production, this would call the Supabase Edge Function
      // For now, using mock data
      const scrapedEvents = getMockEvents();
      setEvents(scrapedEvents);
      toast.success('Events loaded successfully!');
    } catch (error) {
      console.error('Error loading events:', error);
      toast.error('Failed to load events');
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...events];

    // Search filter
    if (searchQuery) {
      filtered = searchEvents(filtered, searchQuery);
    }

    // Domain filter
    if (selectedDomain !== 'All Domains') {
      filtered = filterEventsByDomain(filtered, selectedDomain);
    }

    // Category filter
    if (selectedCategory !== 'All Events') {
      filtered = filterEventsByCategory(filtered, selectedCategory);
    }

    // Mode filter
    if (selectedMode !== 'all') {
      filtered = filtered.filter(event => event.mode.toLowerCase() === selectedMode);
    }

    // Source filter
    if (selectedSource !== 'all') {
      filtered = filtered.filter(event => event.scrapedFrom === selectedSource);
    }

    setFilteredEvents(filtered);
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedDomain('All Domains');
    setSelectedCategory('All Events');
    setSelectedMode('all');
    setSelectedSource('all');
  };

  const handleDownload = (event: ScrapedEvent) => {
    downloadEventDetails(event);
    toast.success('Event details downloaded!');
  };

  const handleShare = (event: ScrapedEvent, platform: 'twitter' | 'linkedin' | 'whatsapp') => {
    shareEvent(event, platform);
    toast.success(`Sharing on ${platform}!`);
  };

  const handleRegister = (event: ScrapedEvent) => {
    // Validate URL before opening
    const url = event.registrationUrl || event.website;
    
    if (!url) {
      toast.error('Registration URL not available for this event');
      return;
    }

    // Ensure URL has protocol
    const finalUrl = url.startsWith('http') ? url : `https://${url}`;
    
    try {
      const opened = window.open(finalUrl, '_blank', 'noopener,noreferrer');
      if (opened) {
        toast.success('Opening event registration page...');
      } else {
        // Popup blocked or failed
        toast.error('Please allow pop-ups to open the registration page', {
          action: {
            label: 'Copy URL',
            onClick: () => {
              navigator.clipboard.writeText(finalUrl);
              toast.success('URL copied to clipboard!');
            },
          },
        });
      }
    } catch (error) {
      console.error('Error opening registration URL:', error);
      toast.error('Failed to open registration page. URL copied to clipboard.');
      navigator.clipboard.writeText(finalUrl);
    }
  };

  const getUrgencyBadge = (event: ScrapedEvent) => {
    const daysLeft = getDaysUntilDeadline(event.registrationDeadline);
    
    if (event.deadlineUrgency === 'urgent') {
      return (
        <Badge className="bg-red-500 text-white flex items-center gap-1">
          <AlertTriangle className="h-3 w-3" />
          {daysLeft}d left!
        </Badge>
      );
    }
    
    if (event.deadlineUrgency === 'soon') {
      return (
        <Badge className="bg-orange-500 text-white flex items-center gap-1">
          <Clock className="h-3 w-3" />
          {daysLeft}d left
        </Badge>
      );
    }
    
    return (
      <Badge variant="outline" className="flex items-center gap-1">
        <Calendar className="h-3 w-3" />
        {daysLeft}d left
      </Badge>
    );
  };

  const renderEventCard = (event: ScrapedEvent) => (
    <Card key={event.id} className="overflow-hidden hover:shadow-lg transition-all">
      {/* Event Image */}
      <div className="relative h-48 overflow-hidden">
        <ImageWithFallback
          src={event.imageUrl}
          alt={event.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute top-2 right-2 flex gap-2">
          {getUrgencyBadge(event)}
          {event.isVerified && (
            <Badge className="bg-blue-500 text-white">
              <Sparkles className="h-3 w-3 mr-1" />
              Verified
            </Badge>
          )}
        </div>
        <div className="absolute bottom-2 left-2">
          <Badge className="bg-black/70 text-white backdrop-blur-sm">
            {event.category}
          </Badge>
        </div>
      </div>

      <CardHeader>
        <div className="flex justify-between items-start gap-2">
          <div className="flex-1">
            <CardTitle className="line-clamp-2">{event.title}</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">{event.organizer}</p>
          </div>
        </div>

        {/* Domains */}
        <div className="flex flex-wrap gap-1 mt-2">
          {event.domains.slice(0, 3).map((domain, idx) => (
            <Badge key={idx} variant="secondary" className="text-xs">
              {domain}
            </Badge>
          ))}
          {event.domains.length > 3 && (
            <Badge variant="secondary" className="text-xs">
              +{event.domains.length - 3}
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Description */}
        <p className="text-sm text-muted-foreground line-clamp-3">{event.description}</p>

        {/* Event Details */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span>
              {new Date(event.startDate).toLocaleDateString('en-IN', { 
                month: 'short', 
                day: 'numeric' 
              })} - {new Date(event.endDate).toLocaleDateString('en-IN', { 
                month: 'short', 
                day: 'numeric',
                year: 'numeric'
              })}
            </span>
          </div>

          <div className="flex items-center gap-2 text-sm">
            <MapPin className="h-4 w-4 text-muted-foreground" />
            <span>{event.city}, {event.state}</span>
            <Badge variant="outline" className="ml-auto text-xs">{event.mode}</Badge>
          </div>

          {event.prizeAmount && event.prizeAmount > 0 && (
            <div className="flex items-center gap-2 text-sm">
              <Award className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium text-green-600">₹{event.prizeAmount.toLocaleString('en-IN')}</span>
            </div>
          )}

          {event.participantCount && (
            <div className="flex items-center gap-2 text-sm">
              <Users className="h-4 w-4 text-muted-foreground" />
              <span>{event.participantCount.toLocaleString()} participants</span>
            </div>
          )}
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-1">
          {event.tags.slice(0, 4).map((tag, idx) => (
            <Badge key={idx} variant="outline" className="text-xs">
              {tag}
            </Badge>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 pt-2">
          <Button 
            className="flex-1" 
            onClick={() => handleRegister(event)}
          >
            <ExternalLink className="h-4 w-4 mr-2" />
            Register Now
          </Button>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon">
                <Share2 className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => handleShare(event, 'twitter')}>
                Share on Twitter
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleShare(event, 'linkedin')}>
                Share on LinkedIn
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleShare(event, 'whatsapp')}>
                Share on WhatsApp
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Button 
            variant="outline" 
            size="icon"
            onClick={() => handleDownload(event)}
          >
            <Download className="h-4 w-4" />
          </Button>
        </div>

        {/* Source Attribution */}
        <div className="text-xs text-muted-foreground text-center pt-2 border-t">
          Source: {event.source} • via {event.scrapedFrom}
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="flex items-center gap-2">
            <Zap className="h-6 w-6 text-yellow-500" />
            Discover Events
          </h2>
          <p className="text-muted-foreground">
            Find hackathons, workshops, competitions, and more from top platforms
          </p>
        </div>
        
        <Button 
          onClick={loadEvents} 
          disabled={loading}
          variant="outline"
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Search and Filters */}
      <div className="space-y-4">
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search events by title, description, or tags..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Filter Controls */}
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter className="h-4 w-4 mr-2" />
            Filters
            <ChevronDown className={`h-4 w-4 ml-2 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
          </Button>

          {(selectedDomain !== 'All Domains' || selectedCategory !== 'All Events' || 
            selectedMode !== 'all' || selectedSource !== 'all' || searchQuery) && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearFilters}
            >
              <X className="h-4 w-4 mr-2" />
              Clear All
            </Button>
          )}

          {selectedDomain !== 'All Domains' && (
            <Badge variant="secondary" className="gap-1">
              {selectedDomain}
              <X 
                className="h-3 w-3 cursor-pointer" 
                onClick={() => setSelectedDomain('All Domains')}
              />
            </Badge>
          )}
        </div>

        {/* Expanded Filters */}
        {showFilters && (
          <Card className="p-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Domain Filter */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Domain</label>
                <Select value={selectedDomain} onValueChange={setSelectedDomain}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {EVENT_DOMAINS.map((domain) => (
                      <SelectItem key={domain} value={domain}>
                        {domain}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Category Filter */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Category</label>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {EVENT_CATEGORIES.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Mode Filter */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Mode</label>
                <Select value={selectedMode} onValueChange={setSelectedMode}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Modes</SelectItem>
                    <SelectItem value="online">Online</SelectItem>
                    <SelectItem value="offline">Offline</SelectItem>
                    <SelectItem value="hybrid">Hybrid</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Source Filter */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Platform</label>
                <Select value={selectedSource} onValueChange={setSelectedSource}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {EVENT_SOURCES.map((source) => (
                      <SelectItem key={source.value} value={source.value}>
                        {source.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </Card>
        )}
      </div>

      {/* Results Count */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Found <span className="font-medium text-foreground">{filteredEvents.length}</span> events
        </p>
        
        {filteredEvents.some(e => e.deadlineUrgency === 'urgent') && (
          <Badge className="bg-red-500 text-white">
            <TrendingUp className="h-3 w-3 mr-1" />
            {filteredEvents.filter(e => e.deadlineUrgency === 'urgent').length} urgent deadlines
          </Badge>
        )}
      </div>

      {/* Events Grid */}
      {loading ? (
        <div className="text-center py-12">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground">Loading events...</p>
        </div>
      ) : filteredEvents.length === 0 ? (
        <Card className="p-12 text-center">
          <Search className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="mb-2">No events found</h3>
          <p className="text-muted-foreground">
            Try adjusting your filters or search query
          </p>
          <Button onClick={clearFilters} variant="outline" className="mt-4">
            Clear Filters
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEvents.map(renderEventCard)}
        </div>
      )}
    </div>
  );
}
